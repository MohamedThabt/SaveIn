/// <reference types="chrome" />

import type { PostData, Category } from './types.ts'
import { DEFAULT_CATEGORIES } from './types.ts'
import { extractPostFromDOM, extractId } from './domExtractor.ts'
import { getClosestPost } from './postScanner.ts'

// ── UI Injector — Save button + widget overlay ──

const savedPostIds: Record<string, boolean> = {}

// ── Category helpers (routed through background script) ──
async function getCategories(): Promise<Category[]> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({ action: 'GET_CATEGORIES' }, (response) => {
        if (chrome.runtime.lastError || !response) {
          resolve(DEFAULT_CATEGORIES)
        } else {
          resolve(response)
        }
      })
    } catch {
      resolve(DEFAULT_CATEGORIES)
    }
  })
}

async function saveCategory(cat: Category): Promise<void> {
  return new Promise((resolve) => {
    try {
      chrome.runtime.sendMessage({ action: 'ADD_CATEGORY', payload: cat }, () => resolve())
    } catch {
      resolve()
    }
  })
}

// ── Save Widget (injected inline overlay) ──
function createSaveWidget(postNode: Element, saveBtn?: HTMLElement) {
  // Remove existing widget if any
  const existing = postNode.querySelector('.ls-widget-overlay')
  if (existing) { existing.remove(); return }

  const overlay = document.createElement('div')
  overlay.className = 'ls-widget-overlay'
  overlay.style.cssText = `
    position:absolute;top:0;right:0;bottom:0;left:0;z-index:10000;
    background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;
    border-radius:8px;animation:lsFadeIn 0.2s ease;
  `

  const widget = document.createElement('div')
  widget.className = 'ls-save-widget'
  widget.style.cssText = `
    background:#fff;border-radius:16px;padding:20px;width:320px;
    box-shadow:0 20px 60px rgba(0,0,0,0.2);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    color:#1a1a2e;position:relative;animation:lsSlideUp 0.25s ease;
  `

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) overlay.remove()
  })

  getCategories().then((categories) => {
    widget.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:8px;background:#0a66c2;display:flex;align-items:center;justify-content:center;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </div>
          <span style="font-weight:700;font-size:14px;">Save Post</span>
        </div>
        <button class="ls-close" style="width:24px;height:24px;border-radius:6px;border:none;background:#f1f5f9;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:#64748b;">✕</button>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Category</label>
        <div class="ls-cat-grid" style="display:flex;flex-wrap:wrap;gap:6px;">
          ${categories.map((c) => `
            <button class="ls-cat-btn" data-name="${c.name}" data-color="${c.color}" style="
              display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:20px;border:1.5px solid #e2e8f0;
              background:white;cursor:pointer;font-size:11px;font-weight:600;color:#334155;transition:all 0.15s;
            ">
              <span style="width:8px;height:8px;border-radius:50%;background:${c.color};display:inline-block;"></span>
              ${c.name}
            </button>
          `).join('')}
          <button class="ls-new-cat-btn" style="
            padding:6px 12px;border-radius:20px;border:1.5px dashed #cbd5e1;
            background:transparent;cursor:pointer;font-size:11px;font-weight:600;color:#94a3b8;transition:all 0.15s;
          ">+ New</button>
        </div>
      </div>

      <div class="ls-new-cat-form" style="display:none;margin-bottom:14px;padding:12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <input class="ls-new-cat-name" placeholder="Category name" style="
            flex:1;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;outline:none;
            font-family:inherit;background:white;
          ">
          <input class="ls-new-cat-color" type="color" value="#3b82f6" style="
            width:36px;height:34px;border:none;border-radius:8px;cursor:pointer;padding:0;background:transparent;
          ">
        </div>
        <button class="ls-add-cat" style="
          width:100%;padding:7px;border-radius:8px;border:none;background:#0a66c2;color:white;
          font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;
        ">Add Category</button>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Note (optional)</label>
        <textarea class="ls-note" placeholder="Why is this post important?" rows="2" style="
          width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:12px;
          outline:none;resize:none;font-family:inherit;box-sizing:border-box;line-height:1.5;background:white;
        "></textarea>
      </div>

      <button class="ls-save-btn" style="
        width:100%;padding:10px;border-radius:10px;border:none;background:#0a66c2;color:white;
        font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s;
        display:flex;align-items:center;justify-content:center;gap:6px;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Save Post
      </button>
    `

    // Wire up events
    let selectedCategory = ''
    let selectedColor = ''

    widget.querySelectorAll('.ls-cat-btn').forEach((btn) => {
      btn.addEventListener('click', () => {
        widget.querySelectorAll('.ls-cat-btn').forEach((b) => {
          (b as HTMLElement).style.border = '1.5px solid #e2e8f0';
          (b as HTMLElement).style.background = 'white'
        })
        const el = btn as HTMLElement
        selectedCategory = el.dataset.name || ''
        selectedColor = el.dataset.color || ''
        el.style.border = `1.5px solid ${selectedColor}`
        el.style.background = `${selectedColor}15`
      })
    })

    // New category toggle
    widget.querySelector('.ls-new-cat-btn')?.addEventListener('click', () => {
      const form = widget.querySelector('.ls-new-cat-form') as HTMLElement
      form.style.display = form.style.display === 'none' ? 'block' : 'none'
    })

    // Add new category
    widget.querySelector('.ls-add-cat')?.addEventListener('click', async () => {
      const nameInput = widget.querySelector('.ls-new-cat-name') as HTMLInputElement
      const colorInput = widget.querySelector('.ls-new-cat-color') as HTMLInputElement
      const name = nameInput.value.trim()
      if (!name) return
      const newCat = { name, color: colorInput.value }
      await saveCategory(newCat)

      // Add button to grid
      const grid = widget.querySelector('.ls-cat-grid')!
      const newBtn = document.createElement('button')
      newBtn.className = 'ls-cat-btn'
      newBtn.dataset.name = newCat.name
      newBtn.dataset.color = newCat.color
      newBtn.style.cssText = `
        display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:20px;
        border:1.5px solid ${newCat.color};background:${newCat.color}15;
        cursor:pointer;font-size:11px;font-weight:600;color:#334155;transition:all 0.15s;
      `
      newBtn.innerHTML = `<span style="width:8px;height:8px;border-radius:50%;background:${newCat.color};display:inline-block;"></span>${newCat.name}`
      grid.insertBefore(newBtn, widget.querySelector('.ls-new-cat-btn'))

      selectedCategory = newCat.name
      selectedColor = newCat.color

      newBtn.addEventListener('click', () => {
        widget.querySelectorAll('.ls-cat-btn').forEach((b) => {
          (b as HTMLElement).style.border = '1.5px solid #e2e8f0';
          (b as HTMLElement).style.background = 'white'
        })
        newBtn.style.border = `1.5px solid ${newCat.color}`
        newBtn.style.background = `${newCat.color}15`
        selectedCategory = newCat.name
        selectedColor = newCat.color
      })

      // Hide form
      ;(widget.querySelector('.ls-new-cat-form') as HTMLElement).style.display = 'none'
      nameInput.value = ''
    })

    // Close
    widget.querySelector('.ls-close')?.addEventListener('click', () => overlay.remove())

    // ── Save button — uses DOM extraction ──
    widget.querySelector('.ls-save-btn')?.addEventListener('click', () => {
      const note = (widget.querySelector('.ls-note') as HTMLTextAreaElement).value.trim()

      // Use the DOM extraction pipeline
      const postData = extractPostFromDOM(postNode)
      postData.category = selectedCategory || null
      postData.categoryColor = selectedColor || null
      postData.note = note || null
      postData.savedAt = new Date().toISOString()

      const saveBtnEl = widget.querySelector('.ls-save-btn') as HTMLButtonElement
      saveBtnEl.textContent = 'Saving...'
      saveBtnEl.style.opacity = '0.6'

      // Send flattened payload to background (backward-compatible)
      const payload = {
        id: postData.id,
        urn: postData.urn,
        url: postData.postUrl,
        author: postData.authorName,
        authorProfileUrl: null,
        content: '',
        timestamp: null,
        likes: null,
        comments: null,
        images: [],
        date_saved: postData.savedAt,
        category: postData.category,
        categoryColor: postData.categoryColor,
        note: postData.note,
        tags: postData.tags,
      }

      chrome.runtime.sendMessage({ action: 'SAVE_POST', payload }, (res) => {
        if (res?.success) {
          savedPostIds[postData.id] = true
          saveBtnEl.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved!'
          saveBtnEl.style.background = '#16a34a'
          saveBtnEl.style.opacity = '1'
          if (saveBtn) {
            saveBtn.textContent = 'Saved!'
            saveBtn.style.background = '#16a34a'
          }
          setTimeout(() => {
            overlay.remove()
            if (saveBtn) {
              saveBtn.textContent = 'Save'
              saveBtn.style.background = '#0a66c2'
            }
          }, 1500)
        } else {
          saveBtnEl.textContent = 'Error — try again'
          saveBtnEl.style.background = '#dc2626'
          saveBtnEl.style.opacity = '1'
        }
      })
    })
  })

  overlay.appendChild(widget)
  const container = postNode as HTMLElement
  if (getComputedStyle(container).position === 'static') container.style.position = 'relative'
  container.appendChild(overlay)
}

// ── Floating Drag-to-Save Cursor ──
export function initFloatingCursor() {
  const cursor = document.createElement('div')
  cursor.className = 'ls-floating-cursor'
  cursor.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>'
  cursor.title = 'Drag to a post to save'
  document.body.appendChild(cursor)

  let startX = 0, startY = 0
  let initialRight = 30, initialBottom = 30
  let isDragging = false
  let isClick = true
  let currentDropTarget: Element | null = null

  const onMouseMove = (e: MouseEvent) => {
    if (!isDragging) {
      if (Math.abs(e.clientX - startX) > 5 || Math.abs(e.clientY - startY) > 5) {
        isDragging = true
        isClick = false
        cursor.classList.add('ls-drag-active')
      }
    }

    if (isDragging) {
      const dx = startX - e.clientX
      const dy = startY - e.clientY
      
      cursor.style.right = `${initialRight + dx}px`
      cursor.style.bottom = `${initialBottom + dy}px`

      // pointer-events: none on cursor allows us to find element below
      const elemBelow = document.elementFromPoint(e.clientX, e.clientY)
      const targetPost = getClosestPost(elemBelow)

      if (currentDropTarget && currentDropTarget !== targetPost) {
        currentDropTarget.classList.remove('ls-drop-target-highlight')
      }

      if (targetPost) {
        targetPost.classList.add('ls-drop-target-highlight')
        currentDropTarget = targetPost
      } else {
        currentDropTarget = null
      }
    }
  }

  const onMouseUp = (e: MouseEvent) => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    
    if (isDragging) {
      cursor.classList.remove('ls-drag-active')
      
      // Snap back to original position
      cursor.style.transition = 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
      cursor.style.right = '30px'
      cursor.style.bottom = '30px'
      
      if (currentDropTarget) {
        currentDropTarget.classList.remove('ls-drop-target-highlight')
        
        const postId = extractId(currentDropTarget)
        if (savedPostIds[postId]) {
          const originalHTML = cursor.innerHTML
          cursor.innerHTML = '<span style="font-size:12px;font-weight:bold;">Saved!</span>'
          setTimeout(() => { 
            cursor.innerHTML = originalHTML 
            cursor.style.transition = 'transform 0.2s, background 0.2s'
          }, 2000)
        } else {
          createSaveWidget(currentDropTarget)
          // Restore normal hover transition shortly after it lands
          setTimeout(() => { cursor.style.transition = 'transform 0.2s, background 0.2s' }, 400)
        }
        currentDropTarget = null
      } else {
        setTimeout(() => { cursor.style.transition = 'transform 0.2s, background 0.2s' }, 400)
      }
      
      initialRight = 30
      initialBottom = 30
      isDragging = false
    } else if (isClick) {
      cursor.style.transform = 'scale(1.1)'
      setTimeout(() => cursor.style.transform = '', 150)
    }
  }

  cursor.addEventListener('mousedown', (e) => {
    if (e.button !== 0) return
    e.preventDefault()
    
    startX = e.clientX
    startY = e.clientY
    isClick = true
    
    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  })
}

// ── Auto-save on LinkedIn's native save button ──
export function setupAutoSave() {
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('button')
    if (!btn) return
    const aria = (btn.getAttribute('aria-label') || '').toLowerCase()
    if (!aria.includes('save')) return
    const postNode = btn.closest('[role="listitem"]') || btn.closest('[data-urn]')
    if (!postNode) return
    const id = extractId(postNode)
    if (savedPostIds[id]) return

    // Use DOM extraction for auto-save too
    const postData = extractPostFromDOM(postNode)
    postData.savedAt = new Date().toISOString()

    const payload = {
      id: postData.id,
      urn: postData.urn,
      url: postData.postUrl,
      author: postData.authorName,
      authorProfileUrl: null,
      content: '',
      timestamp: null,
      likes: null,
      comments: null,
      images: [],
      date_saved: postData.savedAt,
      category: null,
      tags: [] as string[],
    }

    chrome.runtime.sendMessage({ action: 'SAVE_POST', payload }, (res) => {
      if (res?.success) savedPostIds[id] = true
    })
  }, true)
}

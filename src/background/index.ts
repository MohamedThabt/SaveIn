/// <reference types="chrome" />

// Background Service Worker - handles saving posts, categories, Notion API, and storage

interface Post {
  id: string
  url: string
  author: string
  content: string
  date_saved: string
  urn?: string | null
  authorProfileUrl?: string | null
  timestamp?: string | null
  likes?: number | null
  comments?: number | null
  images?: string[]
  category?: string | null
  categoryColor?: string | null
  note?: string | null
  tags?: string[]
}

interface Category {
  name: string
  color: string
}

const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Tech', color: '#3b82f6' },
  { name: 'Marketing', color: '#f59e0b' },
  { name: 'Design', color: '#ec4899' },
  { name: 'Career', color: '#10b981' },
  { name: 'Leadership', color: '#8b5cf6' },
]

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.action === 'SAVE_POST') {
    savePost(message.payload).then(sendResponse)
    return true
  }

  if (message.action === 'GET_CATEGORIES') {
    getCategories().then(sendResponse)
    return true
  }

  if (message.action === 'ADD_CATEGORY') {
    addCategory(message.payload).then(sendResponse)
    return true
  }

  if (message.action === 'PUSH_NOTION') {
    pushToNotion(message.payload).then(sendResponse)
    return true
  }
})

async function savePost(post: Post) {
  try {
    const result = await chrome.storage.local.get(['posts'])
    const posts: Record<string, Post> = result.posts || {}
    posts[post.id] = post
    await chrome.storage.local.set({ posts })
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

async function getCategories(): Promise<Category[]> {
  try {
    const result = await chrome.storage.local.get(['customCategories', 'deletedCategories'])
    const custom: Category[] = result.customCategories || []
    const deleted: string[] = result.deletedCategories || []
    
    const all = DEFAULT_CATEGORIES.filter(c => !deleted.includes(c.name))
    custom.forEach((c) => {
      if (!all.find((a) => a.name === c.name) && !deleted.includes(c.name)) all.push(c)
    })
    return all
  } catch {
    return DEFAULT_CATEGORIES
  }
}

async function addCategory(cat: Category) {
  try {
    const result = await chrome.storage.local.get(['customCategories', 'deletedCategories'])
    const custom: Category[] = result.customCategories || []
    let deleted: string[] = result.deletedCategories || []
    
    // If it was previously deleted, remove it from deleted list
    if (deleted.includes(cat.name)) {
      deleted = deleted.filter(name => name !== cat.name)
    }

    if (!custom.find((c) => c.name === cat.name) && !DEFAULT_CATEGORIES.find((c) => c.name === cat.name)) {
      custom.push(cat)
    }
    
    await chrome.storage.local.set({ customCategories: custom, deletedCategories: deleted })
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

async function pushToNotion(post: Post) {
  try {
    const result = await chrome.storage.local.get(['settings'])
    const settings = result.settings || {}
    const token = settings.notion_token
    const dbId = settings.notion_db_id

    if (!token || !dbId) {
      return { success: false, error: 'Notion not configured.' }
    }

    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: { database_id: dbId },
        properties: {
          Title: { title: [{ text: { content: `Post by ${post.author || 'Unknown'}` } }] },
          Author: { rich_text: [{ text: { content: post.author || '' } }] },
          URL: { url: post.url || '' },
          Category: { select: post.category ? { name: post.category } : null },
          'Date Saved': { date: { start: post.date_saved } },
        },
        ...((post.content && post.content.trim().length > 0) ? {
          children: [
            {
              object: 'block',
              type: 'paragraph',
              paragraph: {
                rich_text: [{ text: { content: post.content.substring(0, 2000) } }],
              },
            },
          ],
        } : {}),
      }),
    })

    if (!response.ok) {
      const err = await response.json()
      return { success: false, error: err.message || 'Notion API error' }
    }

    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

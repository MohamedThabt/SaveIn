/// <reference types="chrome" />

import type { PostData } from './types.ts'

// ── DOM Extractor — primary extraction method using rendered page data ──

function getUrn(node: Element): string | null {
  // New UI extraction from data-view-tracking-scope
  const scopeStr = node.getAttribute('data-view-tracking-scope') || 
                   node.closest('[data-view-tracking-scope]')?.getAttribute('data-view-tracking-scope');
                   
  if (scopeStr) {
    try {
      const scopeList = JSON.parse(scopeStr.replace(/&quot;/g, '"'));
      for (const item of scopeList) {
        if (item?.breadcrumb?.content?.data && Array.isArray(item.breadcrumb.content.data)) {
          const bytes = item.breadcrumb.content.data as number[];
          const jsonStr = bytes.map(b => String.fromCharCode(b)).join('');
          const dataObj = JSON.parse(jsonStr);
          if (dataObj.updateUrn) {
             return dataObj.updateUrn;
          }
        }
      }
    } catch(err) {
      // Quietly ignore parsing errors and fallback
    }
  }

  return (
    node.getAttribute('data-urn') ||
    node.closest('[data-urn]')?.getAttribute('data-urn') ||
    node.getAttribute('data-id') ||
    node.closest('[data-id]')?.getAttribute('data-id') ||
    node.getAttribute('data-activity-urn') ||
    node.closest('[data-activity-urn]')?.getAttribute('data-activity-urn')
  ) || null
}

function getPrimaryContentNode(node: Element): Element {
  // Shared posts/commented posts have a wrapper where the top part is the "X commented on this" header
  // and the actual post body is inside a specific container.
  // We want to skip the header and extract the author from the actual shared content.
  const sharedContent = node.querySelector('div.feed-shared-update-v2__description-wrapper')?.nextElementSibling || 
                        node.querySelector('.update-components-actor--with-control-menu')?.closest('.feed-shared-update-v2') ||
                        node.querySelector('.feed-shared-mini-update-v2')?.nextElementSibling ||
                        null

  // Often the actual post content in a share is wrapped in a container with its own actor component
  // We try to find the second actor component if there are multiple (the first is the reposter)
  const actors = Array.from(node.querySelectorAll('.update-components-actor'))
  if (actors.length > 1) {
    // Return the container of the second actor (the original post author)
    return actors[1].closest('div') || node
  }

  return sharedContent || node
}

function extractAuthor(node: Element): string {
  // New UI Strategy: Control menu label
  const controlMenu = node.querySelector('[data-view-name="feed-control-menu"]');
  if (controlMenu) {
     const aria = controlMenu.getAttribute('aria-label') || '';
     const match = aria.match(/post by (.+)/i);
     if (match && match[1]) {
       return match[1].trim();
     }
  }

  const actors = Array.from(node.querySelectorAll('.update-components-actor'))
  // If it's a shared post, target the original author (2nd actor), otherwise the 1st
  const searchNode = actors.length > 1 ? actors[1] : (actors[0] || getPrimaryContentNode(node))
  
  // Strategy 1: Look for the specific name container
  const nameContainer = searchNode.querySelector('.update-components-actor__name, .feed-shared-actor__name, span[dir="ltr"]')
  if (nameContainer) {
    // innerText strips hidden screen-reader spans automatically and preserves visual linebreaks
    const text = (nameContainer as HTMLElement).innerText || nameContainer.textContent || ''
    // Often the text looks like "Bill Gates\n3rd degree connection" - we just want the first line
    const cleanName = text.split('\n')[0].trim()
    if (cleanName && cleanName.length > 1) {
      return cleanName
    }
  }

  // Strategy 2: img alt text near the top of the post (author avatar)
  const imgs = searchNode.querySelectorAll('img[alt]')
  for (const img of Array.from(imgs)) {
    const alt = (img.getAttribute('alt') || '').trim()
    if (alt.length > 2 && alt.length < 60 && !/^(photo|image|logo|icon|banner|background)/i.test(alt) && !alt.includes('emoji') && !alt.includes('http')) {
      return alt
    }
  }

  // Strategy 3: Extract from profile URL slug
  const links = searchNode.querySelectorAll('a[href*="/in/"], a[href*="/company/"]')
  for (const link of Array.from(links)) {
    const href = link.getAttribute('href') || ''
    const inMatch = href.match(/\/in\/([^/?]+)/)
    if (inMatch) return inMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    
    const compMatch = href.match(/\/company\/([^/?]+)/)
    if (compMatch) return compMatch[1].replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
  }

  // Fallback: If we stripped out the header but couldn't find an author, try the whole node
  if (searchNode !== node) {
    return extractAuthor(node) 
  }

  return 'Unknown'
}

function extractAuthorProfileUrl(node: Element): string | null {
  const actors = Array.from(node.querySelectorAll('.update-components-actor'))
  const searchNode = actors.length > 1 ? actors[1] : (actors[0] || getPrimaryContentNode(node))
  
  const links = searchNode.querySelectorAll('a[href*="/in/"], a[href*="/company/"]')
  for (const link of Array.from(links)) {
    const href = link.getAttribute('href') || ''
    if (href.includes('/in/') || href.includes('/company/')) {
      return href.startsWith('http') ? href.split('?')[0] : window.location.origin + href.split('?')[0]
    }
  }
  
  if (searchNode !== node) {
    return extractAuthorProfileUrl(node)
  }
  
  return null
}

function extractContent(node: Element): string {
  // 1. Look for the reposter's text (commentary) on shared posts
  let reposterText = ''
  const reposterNode = node.querySelector('.feed-shared-update-v2__commentary')
  if (reposterNode) {
    reposterText = (reposterNode as HTMLElement).innerText || reposterNode.textContent || ''
    reposterText = reposterText.trim()
  }

  // 2. Look for the main visual text container
  let mainText = ''
  const contentNode = getPrimaryContentNode(node)
  // LinkedIn puts the actual text in one of these classes usually
  const textComponent = contentNode.querySelector('.update-components-text, .feed-shared-update-v2__description, .feed-shared-text, .feed-shared-inline-show-more-text')
  
  if (textComponent) {
    mainText = (textComponent as HTMLElement).innerText || textComponent.textContent || ''
  } else {
    // Fallback: If no specific container, try grabbing the text from the primary content area,
    // explicitly excluding the header/actor part so we don't grab "John Doe likes this" again.
    const container = contentNode.cloneNode(true) as HTMLElement
    // Strip out standard non-content parts from our clone before extracting text
    container.querySelectorAll('.update-components-actor').forEach(n => n.remove())
    mainText = container.innerText || container.textContent || ''
  }

  mainText = mainText.trim()

  // 3. Combine them
  const parts = []
  if (reposterText) parts.push(`[Commentary]:\n${reposterText}`)
  if (mainText) parts.push(mainText)

  const result = parts.join('\n\n\n--- Shared Post ---\n\n').trim()
  return result || 'No text content found'
}

function extractUrl(node: Element): string {
  for (const a of Array.from(node.querySelectorAll('a[href*="/feed/update/"], a[href*="/posts/"], a[href*="/activity/"]'))) {
    const h = a.getAttribute('href') || ''
    if (h.includes('/feed/update/') || h.includes('/posts/') || h.includes('/activity/')) {
      const url = h.startsWith('http') ? h : window.location.origin + h
      return url.split('?')[0]
    }
  }
  const urn = getUrn(node)
  if (urn) return `https://www.linkedin.com/feed/update/${urn}/`
  return window.location.href
}

function extractId(node: Element): string {
  const urn = getUrn(node)
  if (urn) return urn.split(':').pop() || `p_${Date.now()}`
  return `p_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`
}

function extractTimestamp(node: Element): string | null {
  const timeEl = node.querySelector('time')
  return timeEl?.getAttribute('datetime') || timeEl?.dateTime || null
}

function extractAuthorImageUrl(node: Element): string | null {
  // Primary: data-view-name attribute on the actor-image link
  const actorImg = node.querySelector('a[data-view-name="feed-actor-image"] figure img[src]') as HTMLImageElement | null
  if (actorImg?.src) return actorImg.src

  // Fallback: first small img inside the actor component
  const actors = Array.from(node.querySelectorAll('.update-components-actor'))
  const searchNode = actors.length > 1 ? actors[1] : (actors[0] || node)
  const img = searchNode.querySelector('img[src]') as HTMLImageElement | null
  if (img?.src && img.width <= 128) return img.src

  return null
}

function extractPostImageUrl(node: Element): string | null {
  // 1. Article preview image
  const articleImg = node.querySelector('a[data-view-name="feed-article"] figure img[src]') as HTMLImageElement | null
  if (articleImg?.src) return articleImg.src

  // 2. Video poster
  const videoImg = node.querySelector('.vjs-poster img[src]') as HTMLImageElement | null
  if (videoImg?.src) return videoImg.src

  // 3. Inline image in post body (update-components-image)
  const inlineImg = node.querySelector('.update-components-image img[src]') as HTMLImageElement | null
  if (inlineImg?.src) return inlineImg.src

  return null
}

/**
 * Extract a complete PostData object from a DOM element.
 * This is the primary extraction method — fast and safe because it uses already rendered data.
 */
export function extractPostFromDOM(postElement: Element): PostData {
  return {
    id: extractId(postElement),
    urn: getUrn(postElement),
    authorName: extractAuthor(postElement),
    authorProfileUrl: extractAuthorProfileUrl(postElement),
    authorImageUrl: extractAuthorImageUrl(postElement),
    postUrl: extractUrl(postElement),
    postImageUrl: extractPostImageUrl(postElement),
    content: extractContent(postElement),
    timestamp: extractTimestamp(postElement),
    savedAt: null,
    category: null,
    categoryColor: null,
    note: null,
    tags: [],
  }
}

// Re-export individual extractors for use in other modules (e.g. auto-save)
export { extractId, extractUrl, extractAuthor, extractContent, getUrn }

/// <reference types="chrome" />

// ── Post Scanner — detects LinkedIn posts across feed, profile, and group pages ──



// ── Drop Target Identification ──
export function getClosestPost(target: Element | null): Element | null {
  if (!target) return null

  // Check if the current element or its ancestors match known post selectors
  const postSelectors = [
    // Feed / General
    '[data-urn*="urn:li:activity"]',
    'div.feed-shared-update-v2',
    'div.occludable-update',
    
    // Profile
    'div.profile-creator-shared-feed-update__container',
    'li.profile-creator-shared-feed-update__mini-container',
    
    // Groups
    'div.groups-post-card',
    'div[data-urn*="urn:li:groupPost"]'
  ].join(', ')

  let closest = target.closest(postSelectors)

  // Fallback for generic list items
  if (!closest) {
    const listItem = target.closest('[role="listitem"]')
    if (listItem) {
      const hasLink = listItem.querySelector('a[href*="/in/"]') || listItem.querySelector('a[href*="/company/"]')
      if (hasLink && listItem.clientHeight > 150) {
        closest = listItem
      }
    }
  }

  // Ensure it's a substantive element
  if (closest && closest.clientHeight > 100) {
    return closest
  }

  return null
}

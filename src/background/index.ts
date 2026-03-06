/// <reference types="chrome" />

// Background Service Worker — storage, Notion sync engine, message routing

// ── Types ──

interface Post {
  id: string
  url: string
  author: string
  content: string
  date_saved: string
  urn?: string | null
  authorProfileUrl?: string | null
  authorImageUrl?: string | null
  postImageUrl?: string | null
  timestamp?: string | null
  category?: string | null
  categoryColor?: string | null
  note?: string | null
  tags?: string[]
  // Notion sync metadata
  notionPageId?: string | null
  notionSyncStatus?: 'pending' | 'synced' | 'failed' | null
  notionLastSyncAt?: string | null
  notionLastError?: string | null
  contentHash?: string | null
}

interface Category {
  name: string
  color: string
}

interface NotionSettings {
  notion_token?: string
  notion_db_id?: string
  notion_auto_sync?: boolean
}

const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Tech', color: '#3b82f6' },
  { name: 'Marketing', color: '#f59e0b' },
  { name: 'Design', color: '#ec4899' },
  { name: 'Career', color: '#10b981' },
  { name: 'Leadership', color: '#8b5cf6' },
]

const NOTION_API = 'https://api.notion.com/v1'
const NOTION_VERSION = '2022-06-28'
const SYNC_ALARM = 'notion-sync-retry'
const SYNC_INTERVAL_MINUTES = 5
const SYNC_DELAY_MS = 350

// ── Simple content hash for dedupe ──
function hashContent(text: string): string {
  let hash = 0
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i)
    hash = ((hash << 5) - hash) + chr
    hash |= 0
  }
  return 'h_' + Math.abs(hash).toString(36)
}

// ── Settings helpers (safe merge) ──
async function getSettings(): Promise<NotionSettings> {
  const result = await chrome.storage.local.get(['settings'])
  return result.settings || {}
}

async function mergeSettings(partial: Partial<NotionSettings>): Promise<NotionSettings> {
  const current = await getSettings()
  const merged = { ...current, ...partial }
  await chrome.storage.local.set({ settings: merged })
  return merged
}

// ── Category helpers ──

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

// ── Post storage ──

async function savePost(post: Post) {
  try {
    const result = await chrome.storage.local.get(['posts'])
    const posts: Record<string, Post> = result.posts || {}
    // Compute content hash for dedupe
    if (post.content) {
      post.contentHash = hashContent(post.content)
    }
    // Preserve existing sync metadata if re-saving
    const existing = posts[post.id]
    if (existing) {
      post.notionPageId = post.notionPageId || existing.notionPageId
      post.notionSyncStatus = existing.notionSyncStatus
      post.notionLastSyncAt = existing.notionLastSyncAt
      post.notionLastError = existing.notionLastError
    }
    posts[post.id] = post
    await chrome.storage.local.set({ posts })
    // Auto-sync if enabled
    const settings = await getSettings()
    if (settings.notion_auto_sync && settings.notion_token && settings.notion_db_id) {
      post.notionSyncStatus = 'pending'
      posts[post.id] = post
      await chrome.storage.local.set({ posts })
      enqueueSyncPost(post.id)
    }
    return { success: true }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

async function updatePostSyncStatus(
  postId: string,
  status: 'pending' | 'synced' | 'failed',
  pageId?: string | null,
  error?: string | null
) {
  const result = await chrome.storage.local.get(['posts'])
  const posts: Record<string, Post> = result.posts || {}
  if (!posts[postId]) return
  posts[postId].notionSyncStatus = status
  if (pageId !== undefined) posts[postId].notionPageId = pageId
  if (status === 'synced') {
    posts[postId].notionLastSyncAt = new Date().toISOString()
    posts[postId].notionLastError = null
  }
  if (error) posts[postId].notionLastError = error
  await chrome.storage.local.set({ posts })
}

// ── Notion API helpers ──

function notionHeaders(token: string) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
    'Notion-Version': NOTION_VERSION,
  }
}

interface NotionPropertySchema {
  id?: string
  name?: string
  type?: string
}

type NotionPropertyMap = Record<string, NotionPropertySchema>

function getTitlePropertyName(properties: NotionPropertyMap) {
  const titleEntry = Object.entries(properties).find(([, property]) => property?.type === 'title')
  return titleEntry?.[0] || 'Title'
}

function buildNotionProperties(post: Post, availableProps?: NotionPropertyMap) {
  const properties: Record<string, object> = {}
  const titlePropertyName = availableProps ? getTitlePropertyName(availableProps) : 'Title'

  properties[titlePropertyName] = {
    title: [{ text: { content: `Post by ${post.author || 'Unknown'}` } }],
  }

  if (!availableProps || availableProps.Author) {
    properties.Author = { rich_text: [{ text: { content: post.author || '' } }] }
  }

  if (!availableProps || availableProps.URL) {
    properties.URL = { url: post.url || null }
  }

  if (!availableProps || availableProps.Category) {
    properties.Category = post.category ? { select: { name: post.category } } : { select: null }
  }

  if (!availableProps || availableProps['Date Saved']) {
    properties['Date Saved'] = { date: { start: post.date_saved } }
  }

  if ((!availableProps || availableProps.Tags) && post.tags && post.tags.length > 0) {
    properties.Tags = { multi_select: post.tags.map(t => ({ name: t })) }
  }

  if ((!availableProps || availableProps.Note) && post.note) {
    properties.Note = { rich_text: [{ text: { content: post.note.substring(0, 2000) } }] }
  }

  return properties
}

function buildContentBlocks(content: string) {
  if (!content || !content.trim()) return []
  const blocks = []
  // Split into 2000-char chunks to avoid Notion's block text limit
  for (let i = 0; i < content.length; i += 2000) {
    blocks.push({
      object: 'block' as const,
      type: 'paragraph' as const,
      paragraph: {
        rich_text: [{ text: { content: content.substring(i, i + 2000) } }],
      },
    })
  }
  return blocks
}

async function findNotionPageByUrl(token: string, dbId: string, url: string, availableProps: NotionPropertyMap): Promise<string | null> {
  if (!url || !availableProps.URL) return null
  try {
    const response = await fetch(`${NOTION_API}/databases/${dbId}/query`, {
      method: 'POST',
      headers: notionHeaders(token),
      body: JSON.stringify({
        filter: { property: 'URL', url: { equals: url } },
        page_size: 1,
      }),
    })
    if (!response.ok) return null
    const data = await response.json()
    return data.results?.[0]?.id || null
  } catch {
    return null
  }
}

async function createNotionPage(token: string, dbId: string, post: Post, availableProps: NotionPropertyMap): Promise<string> {
  const response = await fetch(`${NOTION_API}/pages`, {
    method: 'POST',
    headers: notionHeaders(token),
    body: JSON.stringify({
      parent: { database_id: dbId },
      properties: buildNotionProperties(post, availableProps),
      children: buildContentBlocks(post.content),
    }),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || `Notion API error ${response.status}`)
  }
  const data = await response.json()
  return data.id
}

async function updateNotionPage(token: string, pageId: string, post: Post, availableProps: NotionPropertyMap): Promise<void> {
  const response = await fetch(`${NOTION_API}/pages/${pageId}`, {
    method: 'PATCH',
    headers: notionHeaders(token),
    body: JSON.stringify({
      properties: buildNotionProperties(post, availableProps),
    }),
  })
  if (!response.ok) {
    const err = await response.json()
    throw new Error(err.message || `Notion API error ${response.status}`)
  }
}

async function getDatabaseInfo(token: string, dbId: string): Promise<{ dbName: string; properties: NotionPropertyMap }> {
  const dbRes = await fetch(`${NOTION_API}/databases/${dbId}`, { headers: notionHeaders(token) })
  if (!dbRes.ok) {
    throw new Error('Cannot access database. Ensure the integration is connected to the database.')
  }
  const dbData = await dbRes.json()
  return {
    dbName: dbData.title?.[0]?.plain_text || 'Untitled',
    properties: dbData.properties || {},
  }
}

// ── Sync engine ──

async function syncPostToNotion(post: Post): Promise<{ success: boolean; pageId?: string; error?: string }> {
  const settings = await getSettings()
  const token = settings.notion_token
  const dbId = settings.notion_db_id
  if (!token || !dbId) return { success: false, error: 'Notion not configured.' }
  try {
    const dbInfo = await getDatabaseInfo(token, dbId)
    let availableProps = dbInfo.properties
    try {
      await ensureDatabaseSchema(token, dbId, availableProps)
      availableProps = {
        ...availableProps,
        ...Object.fromEntries(Object.keys(REQUIRED_DB_PROPERTIES).map((name) => [name, { name }]))
      }
    } catch {
      // Fall back to the existing schema so syncing still works with partial databases.
    }
    // 1. Check if we already have a page ID stored
    let pageId = post.notionPageId || null
    // 2. If no stored page ID, query Notion by URL for dedupe
    if (!pageId && post.url) {
      pageId = await findNotionPageByUrl(token, dbId, post.url, availableProps)
    }
    // 3. Create or update
    if (pageId) {
      await updateNotionPage(token, pageId, post, availableProps)
      return { success: true, pageId }
    } else {
      const newPageId = await createNotionPage(token, dbId, post, availableProps)
      return { success: true, pageId: newPageId }
    }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// ── Queue + rate limiting ──

let syncQueue: string[] = []
let isProcessing = false

function enqueueSyncPost(postId: string) {
  if (!syncQueue.includes(postId)) {
    syncQueue.push(postId)
  }
  processSyncQueue()
}

async function processSyncQueue() {
  if (isProcessing || syncQueue.length === 0) return
  isProcessing = true
  try {
    while (syncQueue.length > 0) {
      const postId = syncQueue.shift()!
      const result = await chrome.storage.local.get(['posts'])
      const posts: Record<string, Post> = result.posts || {}
      const post = posts[postId]
      if (!post) continue
      await updatePostSyncStatus(postId, 'pending')
      const syncResult = await syncPostToNotion(post)
      if (syncResult.success) {
        await updatePostSyncStatus(postId, 'synced', syncResult.pageId)
      } else {
        await updatePostSyncStatus(postId, 'failed', undefined, syncResult.error)
      }
      // Rate-limit: pause between API calls
      if (syncQueue.length > 0) {
        await new Promise(r => setTimeout(r, SYNC_DELAY_MS))
      }
    }
  } finally {
    isProcessing = false
  }
}

async function retryFailedSyncs() {
  const result = await chrome.storage.local.get(['posts'])
  const posts: Record<string, Post> = result.posts || {}
  const failed = Object.values(posts).filter(p => p.notionSyncStatus === 'failed')
  for (const post of failed) {
    enqueueSyncPost(post.id)
  }
  return { queued: failed.length }
}

async function syncAllPosts() {
  const result = await chrome.storage.local.get(['posts'])
  const posts: Record<string, Post> = result.posts || {}
  const unsynced = Object.values(posts).filter(p => p.notionSyncStatus !== 'synced')
  for (const post of unsynced) {
    enqueueSyncPost(post.id)
  }
  return { queued: unsynced.length }
}

async function getSyncStats() {
  const result = await chrome.storage.local.get(['posts'])
  const posts: Record<string, Post> = result.posts || {}
  const all = Object.values(posts)
  return {
    total: all.length,
    synced: all.filter(p => p.notionSyncStatus === 'synced').length,
    pending: all.filter(p => p.notionSyncStatus === 'pending').length,
    failed: all.filter(p => p.notionSyncStatus === 'failed').length,
    unsynced: all.filter(p => !p.notionSyncStatus).length,
  }
}

const REQUIRED_DB_PROPERTIES: Record<string, object> = {
  Author: { rich_text: {} },
  URL: { url: {} },
  Category: { select: { options: [] } },
  'Date Saved': { date: {} },
  Tags: { multi_select: { options: [] } },
  Note: { rich_text: {} },
}

async function ensureDatabaseSchema(token: string, dbId: string, existingProps: Record<string, unknown>): Promise<void> {
  const missing: Record<string, object> = {}
  for (const [name, schema] of Object.entries(REQUIRED_DB_PROPERTIES)) {
    if (!existingProps[name]) {
      missing[name] = schema
    }
  }
  if (Object.keys(missing).length === 0) return
  const res = await fetch(`${NOTION_API}/databases/${dbId}`, {
    method: 'PATCH',
    headers: notionHeaders(token),
    body: JSON.stringify({ properties: missing }),
  })
  if (!res.ok) {
    const err = await res.json()
    throw new Error(err.message || 'Failed to set up database properties')
  }
}

async function testNotionConnection(token: string, dbId: string): Promise<{ success: boolean; error?: string; dbName?: string }> {
  try {
    const userRes = await fetch(`${NOTION_API}/users/me`, { headers: notionHeaders(token) })
    if (!userRes.ok) {
      return { success: false, error: 'Invalid integration token. Check your token and try again.' }
    }
    const dbInfo = await getDatabaseInfo(token, dbId)
    // Auto-create missing properties
    try {
      await ensureDatabaseSchema(token, dbId, dbInfo.properties)
    } catch (e) {
      return { success: false, error: `Connected but failed to set up properties: ${e}` }
    }
    return { success: true, dbName: dbInfo.dbName }
  } catch (error) {
    return { success: false, error: String(error) }
  }
}

// ── Alarm-based periodic retry ──

chrome.alarms.create(SYNC_ALARM, { periodInMinutes: SYNC_INTERVAL_MINUTES })

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === SYNC_ALARM) {
    retryFailedSyncs()
  }
})

// ── Message routing ──

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

  // Legacy compat — now uses upsert
  if (message.action === 'PUSH_NOTION') {
    (async () => {
      const post = message.payload as Post
      const result = await syncPostToNotion(post)
      if (result.success && result.pageId) {
        await updatePostSyncStatus(post.id, 'synced', result.pageId)
      } else {
        await updatePostSyncStatus(post.id, 'failed', undefined, result.error)
      }
      sendResponse(result)
    })()
    return true
  }

  if (message.action === 'SYNC_POST') {
    (async () => {
      const postId = message.postId as string
      const res = await chrome.storage.local.get(['posts'])
      const posts: Record<string, Post> = res.posts || {}
      const post = posts[postId]
      if (!post) { sendResponse({ success: false, error: 'Post not found' }); return }
      await updatePostSyncStatus(postId, 'pending')
      const result = await syncPostToNotion(post)
      if (result.success) {
        await updatePostSyncStatus(postId, 'synced', result.pageId)
      } else {
        await updatePostSyncStatus(postId, 'failed', undefined, result.error)
      }
      sendResponse(result)
    })()
    return true
  }

  if (message.action === 'SYNC_ALL') {
    syncAllPosts().then(sendResponse)
    return true
  }

  if (message.action === 'RETRY_FAILED') {
    retryFailedSyncs().then(sendResponse)
    return true
  }

  if (message.action === 'TEST_NOTION') {
    testNotionConnection(message.token, message.dbId).then(sendResponse)
    return true
  }

  if (message.action === 'GET_NOTION_STATUS') {
    (async () => {
      const settings = await getSettings()
      const stats = await getSyncStats()
      sendResponse({ configured: !!(settings.notion_token && settings.notion_db_id), autoSync: !!settings.notion_auto_sync, ...stats })
    })()
    return true
  }

  if (message.action === 'SAVE_NOTION_SETTINGS') {
    mergeSettings(message.payload).then((merged) => sendResponse({ success: true, settings: merged }))
    return true
  }

  if (message.action === 'GET_SYNC_STATS') {
    getSyncStats().then(sendResponse)
    return true
  }
})

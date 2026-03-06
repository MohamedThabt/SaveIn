/// <reference types="chrome" />

// ── Shared types for the hybrid extraction architecture ──

export interface PostData {
  id: string
  urn: string | null
  authorName: string
  authorProfileUrl: string | null
  postUrl: string
  content: string
  timestamp: string | null
  likes: number | null
  comments: number | null
  images: string[]
  savedAt: string | null
  category: string | null
  categoryColor: string | null
  note: string | null
  tags: string[]
}


export interface Category {
  name: string
  color: string
}

export const REQUIRED_FIELDS: (keyof PostData)[] = [
  'authorName',
  'postUrl',
]

export const DEFAULT_CATEGORIES: Category[] = [
  { name: 'Tech', color: '#3b82f6' },
  { name: 'Marketing', color: '#f59e0b' },
  { name: 'Design', color: '#ec4899' },
  { name: 'Career', color: '#10b981' },
  { name: 'Leadership', color: '#8b5cf6' },
]

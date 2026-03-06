import { useEffect, useState, useMemo } from 'react'
import {
  Search,
  X,
  ExternalLink,
  Trash2,
  FileText,
  Check,
  Upload,
  Bookmark,
  Users,
  Tag,
  Clock,
  Filter,
  Settings,
  ChevronRight,
  ArrowLeft,
  Download,
  FolderUp,
  Palette,
  Plus,
  StickyNote,
  Sun,
  Moon,
  RefreshCw,
  Zap,
  AlertCircle,
  Loader2,
  LayoutGrid,
  List,
  Github,
  BookOpen,
  Globe,
  ArrowUpDown,
  ChevronDown
} from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog'

interface Post {
  id: string
  url: string
  author: string
  content: string
  date_saved: string
  authorProfileUrl?: string | null
  authorImageUrl?: string | null
  postImageUrl?: string | null
  category?: string | null
  categoryColor?: string | null
  note?: string | null
  tags?: string[]
  notionPageId?: string | null
  notionSyncStatus?: 'pending' | 'synced' | 'failed' | null
  notionLastSyncAt?: string | null
  notionLastError?: string | null
}

interface Category {
  name: string
  color: string
}

const DEFAULT_CATS: Category[] = [
  { name: 'Tech', color: '#3b82f6' },
  { name: 'Marketing', color: '#f59e0b' },
  { name: 'Design', color: '#ec4899' },
  { name: 'Career', color: '#10b981' },
  { name: 'Leadership', color: '#8b5cf6' },
]

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const diff = Math.floor((Date.now() - d.getTime()) / 1000)
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([])
  const [selected, setSelected] = useState<Post | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [editTags, setEditTags] = useState('')
  const [editNote, setEditNote] = useState('')
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null)
  const [notionToken, setNotionToken] = useState('')
  const [notionDb, setNotionDb] = useState('')
  const [notionAutoSync, setNotionAutoSync] = useState(false)
  const [testingNotion, setTestingNotion] = useState(false)
  const [notionTestResult, setNotionTestResult] = useState<{ok: boolean; msg: string} | null>(null)
  const [notionDbName, setNotionDbName] = useState('')
  const [syncStats, setSyncStats] = useState({synced: 0, pending: 0, failed: 0, unsynced: 0})
  const [view, setView] = useState<'posts' | 'settings'>('posts')
  const [settingsTab, setSettingsTab] = useState<'appearance' | 'categories' | 'notion' | 'data'>('appearance')
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATS)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3b82f6')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [filterAuthor, setFilterAuthor] = useState('')
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'author'>('newest')

  // Modals state
  const [postToDelete, setPostToDelete] = useState<Post | null>(null)
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null)

  const flash = (msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2500)
  }

  const loadPosts = () => {
    chrome.storage.local.get(['posts'], (res) => {
      const obj: Record<string, Post> = res.posts || {}
      setPosts(Object.values(obj).sort((a, b) => new Date(b.date_saved).getTime() - new Date(a.date_saved).getTime()))
    })
  }

  const loadCategories = () => {
    chrome.storage.local.get(['customCategories', 'deletedCategories'], (res) => {
      const custom: Category[] = res.customCategories || []
      const deleted: string[] = res.deletedCategories || []
      const all = [...DEFAULT_CATS.filter(c => !deleted.includes(c.name))]
      custom.forEach((c) => { 
        if (!all.find((a) => a.name === c.name) && !deleted.includes(c.name)) all.push(c) 
      })
      setCategories(all)
    })
  }

  useEffect(() => {
    loadPosts()
    loadCategories()
    loadSyncStats()
    chrome.storage.local.get(['settings', 'theme'], (res) => {
      const s = res.settings || {}
      if (s.notion_token) setNotionToken(s.notion_token)
      if (s.notion_db_id) setNotionDb(s.notion_db_id)
      if (s.notion_auto_sync) setNotionAutoSync(true)
      
      const t = res.theme || 'light'
      setTheme(t)
      if (t === 'dark') document.documentElement.classList.add('dark')
      else document.documentElement.classList.remove('dark')
    })
  }, [])

  useEffect(() => {
    if (selected) {
      setEditCategory(selected.category || '')
      setEditTags((selected.tags || []).join(', '))
      setEditNote(selected.note || '')
    }
  }, [selected])

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light'
    setTheme(next)
    if (next === 'dark') document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
    chrome.storage.local.set({ theme: next })
  }

  const filtered = useMemo(() => {
    const list = posts.filter((p) => {
      const q = !searchQuery || p.content?.toLowerCase().includes(searchQuery.toLowerCase()) || p.author?.toLowerCase().includes(searchQuery.toLowerCase()) || (p.tags || []).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      const c = !filterCategory || p.category === filterCategory
      const a = !filterAuthor || p.author === filterAuthor
      return q && c && a
    })
    if (sortBy === 'oldest') return [...list].sort((a, b) => new Date(a.date_saved).getTime() - new Date(b.date_saved).getTime())
    if (sortBy === 'author') return [...list].sort((a, b) => (a.author || '').localeCompare(b.author || ''))
    return list // already sorted newest by loadPosts
  }, [posts, searchQuery, filterCategory, filterAuthor, sortBy])

  const authorList = useMemo(() => {
    const map = new Map<string, { count: number; img?: string | null }>()
    posts.forEach(p => {
      if (!p.author) return
      const existing = map.get(p.author)
      if (existing) { existing.count++ }
      else { map.set(p.author, { count: 1, img: p.authorImageUrl }) }
    })
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count)
  }, [posts])

  const stats = useMemo(() => {
    const cats = new Set<string>(); const authors = new Set<string>(); let recent = 0
    const w = Date.now() - 7 * 86400000
    posts.forEach((p) => { if (p.category) cats.add(p.category); if (p.author) authors.add(p.author); if (new Date(p.date_saved).getTime() >= w) recent++ })
    return { total: posts.length, categories: cats.size, authors: authors.size, recent }
  }, [posts])

  const saveDetails = () => {
    if (!selected) return
    chrome.storage.local.get(['posts'], (res) => {
      const all: Record<string, Post> = res.posts || {}
      if (all[selected.id]) {
        all[selected.id].category = editCategory || null
        all[selected.id].tags = editTags.split(',').map((t) => t.trim()).filter(Boolean)
        all[selected.id].note = editNote || null
        const cat = categories.find((c) => c.name === editCategory)
        if (cat) all[selected.id].categoryColor = cat.color
        chrome.storage.local.set({ posts: all }, () => { loadPosts(); flash('Details saved successfully') })
      }
    })
  }

  const deleteSelectedPost = () => {
    if (!postToDelete) return
    chrome.storage.local.get(['posts'], (res) => {
      const all: Record<string, Post> = res.posts || {}
      delete all[postToDelete.id]
      chrome.storage.local.set({ posts: all }, () => { 
        if (selected?.id === postToDelete.id) setSelected(null)
        setPostToDelete(null)
        loadPosts()
        flash('Post deleted') 
      })
    })
  }

  const exportMd = () => {
    if (!selected) return
    const md = `---\nauthor: ${selected.author}\nurl: ${selected.url}\ndate: ${selected.date_saved}\ncategory: ${selected.category || ''}\nnote: ${selected.note || ''}\ntags: [${(selected.tags || []).join(', ')}]\n---\n\n${selected.content}\n`
    const url = URL.createObjectURL(new Blob([md], { type: 'text/markdown' }))
    chrome.downloads.download({ url, filename: `linkedin_${selected.id}.md` })
    flash('Exported to Markdown')
  }

  const exportBackup = () => {
    chrome.storage.local.get(['posts', 'customCategories'], (res) => {
      const url = URL.createObjectURL(new Blob([JSON.stringify(res, null, 2)], { type: 'application/json' }))
      chrome.downloads.download({ url, filename: `linkedin_backup_${Date.now()}.json` })
      flash('Backup verified and saved')
    })
  }

  const exportAllMd = () => {
    if (posts.length === 0) return flash('No posts to export', false)
    const combinedMd = posts.map(p => {
      return `---\nauthor: ${p.author}\nurl: ${p.url}\ndate: ${p.date_saved}\ncategory: ${p.category || ''}\nnote: ${p.note || ''}\ntags: [${(p.tags || []).join(', ')}]\n---\n\n${p.content}\n`
    }).join('\n\n---\n\n')
    
    const url = URL.createObjectURL(new Blob([combinedMd], { type: 'text/markdown' }))
    chrome.downloads.download({ url, filename: `linkedin_all_posts_${Date.now()}.md` })
    flash(`Exported ${posts.length} posts to Markdown`)
  }

  const importBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader()
    r.onload = (ev) => {
      try {
        const d = JSON.parse(ev.target?.result as string)
        const toSet: Record<string, unknown> = {}
        if (d.posts) toSet.posts = d.posts
        if (d.customCategories) toSet.customCategories = d.customCategories
        chrome.storage.local.set(toSet, () => { flash('Data restored successfully!'); loadPosts(); loadCategories() })
      } catch { flash('Invalid backup file', false) }
    }
    r.readAsText(f)
  }

  const extractDbId = (input: string): string => {
    // Accept raw ID or full Notion URL
    const urlMatch = input.match(/([a-f0-9]{32}|[a-f0-9-]{36})/)
    return urlMatch ? urlMatch[1].replace(/-/g, '') : input.trim()
  }

  const saveNotionSettings = () => {
    const dbId = extractDbId(notionDb)
    if (!notionToken && !dbId) { flash('Enter at least a token to save', false); return }
    chrome.runtime.sendMessage({
      action: 'SAVE_NOTION_SETTINGS',
      payload: { notion_token: notionToken, notion_db_id: dbId, notion_auto_sync: notionAutoSync }
    }, () => flash('Notion settings saved'))
  }

  const testNotion = () => {
    const dbId = extractDbId(notionDb)
    if (!notionToken || !dbId) { flash('Enter token and database URL first', false); return }
    setTestingNotion(true)
    setNotionTestResult(null)
    chrome.runtime.sendMessage({ action: 'TEST_NOTION', token: notionToken, dbId }, (res) => {
      setTestingNotion(false)
      if (res?.success) {
        setNotionTestResult({ ok: true, msg: `Connected to "${res.dbName}"` })
        setNotionDbName(res.dbName)
      } else {
        setNotionTestResult({ ok: false, msg: res?.error || 'Connection failed' })
      }
    })
  }

  const syncAll = () => {
    chrome.runtime.sendMessage({ action: 'SYNC_ALL' }, (res) => {
      flash(`Queued ${res?.queued || 0} posts for sync`)
      loadSyncStats()
    })
  }

  const retryFailed = () => {
    chrome.runtime.sendMessage({ action: 'RETRY_FAILED' }, (res) => {
      flash(`Retrying ${res?.queued || 0} failed posts`)
      loadSyncStats()
    })
  }

  const loadSyncStats = () => {
    chrome.runtime.sendMessage({ action: 'GET_SYNC_STATS' }, (res) => {
      if (res) setSyncStats(res)
    })
  }

  const pushNotion = () => {
    if (!selected) return
    chrome.runtime.sendMessage({ action: 'SYNC_POST', postId: selected.id }, (res) => {
      flash(res?.success ? 'Synced to Notion!' : (res?.error || 'Sync failed'), res?.success)
      loadPosts()
      loadSyncStats()
    })
  }

  const addCategory = () => {
    if (!newCatName.trim()) return
    const cat = { name: newCatName.trim(), color: newCatColor }
    chrome.storage.local.get(['customCategories', 'deletedCategories'], (res) => {
      const custom: Category[] = res.customCategories || []
      let deleted: string[] = res.deletedCategories || []
      
      if (deleted.includes(cat.name)) {
        deleted = deleted.filter(name => name !== cat.name)
      }
      
      if (!custom.find((c) => c.name === cat.name) && !DEFAULT_CATS.find(c => c.name === cat.name)) {
        custom.push(cat)
      }
      
      chrome.storage.local.set({ customCategories: custom, deletedCategories: deleted }, () => {
        loadCategories()
        setNewCatName('')
        flash('Category added')
      })
    })
  }

  const performDeleteCategory = () => {
    if (!categoryToDelete) return
    chrome.storage.local.get(['customCategories', 'deletedCategories'], (res) => {
      const custom: Category[] = (res.customCategories || []).filter((c: Category) => c.name !== categoryToDelete)
      const deleted: string[] = res.deletedCategories || []
      if (!deleted.includes(categoryToDelete)) {
        deleted.push(categoryToDelete)
      }
      chrome.storage.local.set({ customCategories: custom, deletedCategories: deleted }, () => { 
        setCategoryToDelete(null)
        loadCategories()
        flash('Category removed') 
      })
    })
  }

  // ── SETTINGS VIEW ──
  if (view === 'settings') {
    return (
      <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden font-sans scroll-smooth">
        <header className="flex items-center gap-3 px-8 h-16 border-b border-border/60 shrink-0 bg-background/80 backdrop-blur-xl z-20 shadow-sm relative">
          <button onClick={() => setView('posts')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/80 hover:shadow-sm transition-all text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </button>
          <span className="text-lg font-display font-semibold">Settings</span>
        </header>

        <div className="flex-1 flex overflow-hidden w-full max-w-[1400px] mx-auto p-4 md:p-8 gap-8">
          {/* Settings Sidebar */}
          <aside className="w-[260px] flex flex-col gap-6 shrink-0 hidden md:flex">
            <div className="px-2">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-3">Settings</h3>
              <nav className="flex flex-col gap-1.5">
                <button onClick={() => setSettingsTab('appearance')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${settingsTab === 'appearance' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <Palette size={18} /> Appearance
                </button>
                <button onClick={() => setSettingsTab('categories')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${settingsTab === 'categories' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <Tag size={18} /> Labels & Categories
                </button>
                <button onClick={() => setSettingsTab('notion')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${settingsTab === 'notion' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <Upload size={18} /> Notion Sync
                </button>
                <button onClick={() => setSettingsTab('data')} className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${settingsTab === 'data' ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/20' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                  <FolderUp size={18} /> Data Management
                </button>
              </nav>
            </div>
            
            <div className="mt-auto px-2">
              <h3 className="text-[12px] font-bold uppercase tracking-wider text-muted-foreground/80 mb-3">Links</h3>
              <div className="flex flex-col gap-1.5">
                <a href="https://github.com/MohamedThabt/SaveIn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium">
                  <Github size={16} /> Source Code
                </a>
                <a href="https://sirthabet.dev/posts/savein-linkedin-chrome-extension-guide" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium">
                  <BookOpen size={16} /> Documentation
                </a>
                <a href="https://sirthabet.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] text-muted-foreground hover:bg-muted hover:text-foreground transition-colors font-medium">
                  <Globe size={16} /> Developer Site
                </a>
              </div>
            </div>
          </aside>

          {/* Settings Content */}
          <main className="flex-1 overflow-y-auto px-2 pb-12 relative remove-scrollbar">
            <div className="max-w-3xl mx-auto w-full transition-all duration-300">
              
              {settingsTab === 'appearance' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold mb-2">Appearance</h2>
                    <p className="text-muted-foreground">Customize how the extension looks and feels.</p>
                  </div>
                  
                  <div className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex items-center justify-between p-5 bg-background border border-border/40 rounded-2xl">
                      <div className="flex items-center gap-5">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center shadow-inner ${theme === 'light' ? 'bg-amber-100/50 text-amber-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                          {theme === 'light' ? <Sun size={24} /> : <Moon size={24} />}
                        </div>
                        <div>
                          <div className="text-[15px] font-bold mb-0.5">{theme === 'light' ? 'Light Mode Active' : 'Dark Mode Active'}</div>
                          <div className="text-[13px] text-muted-foreground">Switch the UI theme to match your system or preference.</div>
                        </div>
                      </div>
                      <button
                        onClick={toggleTheme}
                        className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${theme === 'dark' ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/40'}`}
                      >
                        <div className={`w-6 h-6 rounded-full bg-white shadow-md absolute top-0.5 transition-all ${theme === 'dark' ? 'left-[30px]' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                </section>
              )}

              {settingsTab === 'categories' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold mb-2">Labels & Categories</h2>
                    <p className="text-muted-foreground">Manage colorful tags to keep your saved posts neatly organized.</p>
                  </div>

                  <div className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-sm">
                    <div className="flex flex-wrap gap-3 mb-8">
                      {categories.map((c) => (
                        <div key={c.name} className="flex items-center gap-2.5 px-4 py-2.5 border border-border/60 rounded-xl bg-background/50 text-[14px] font-semibold group transition-all hover:border-primary/30 hover:shadow-sm">
                          <span className="w-3.5 h-3.5 rounded-full shadow-sm" style={{ background: c.color }} />
                          {c.name}
                          <button onClick={() => setCategoryToDelete(c.name)} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1 p-1 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border/40 pt-8">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4">Create New Label</h3>
                      <div className="flex flex-col sm:flex-row gap-4">
                        <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="e.g. Inspiration, Code, Design" className="flex-1 px-5 py-3.5 border border-border/60 rounded-2xl text-[15px] bg-background outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm font-medium" />
                        <div className="flex gap-4">
                          <div className="relative w-14 h-14 shrink-0 rounded-2xl border border-border/60 shadow-sm overflow-hidden flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors bg-background">
                            <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} className="absolute inset-[-20px] w-32 h-32 opacity-0 cursor-pointer z-10" />
                            <div className="w-6 h-6 rounded-full shadow-md border border-black/10" style={{ background: newCatColor }} />
                          </div>
                          <button onClick={addCategory} className="px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl text-[15px] font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 h-14">
                            <Plus size={18} /> Add
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {settingsTab === 'notion' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold mb-2">Notion Database Sync</h2>
                    <p className="text-muted-foreground">Automatically backup your curated posts directly to a Notion database.</p>
                  </div>

                  <div className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-8">
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-bold text-foreground">1. Integration Token</label>
                        <p className="text-[13px] text-muted-foreground mb-1">Create an internal integration in your <a href="https://www.notion.so/my-integrations" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold">Notion Workspace</a>.</p>
                        <input type="password" value={notionToken} onChange={(e) => setNotionToken(e.target.value)} placeholder="secret_..." className="w-full px-5 py-3.5 border border-border/60 rounded-2xl text-[14px] bg-background outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm font-medium" />
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-[13px] font-bold text-foreground">2. Database Link</label>
                        <p className="text-[13px] text-muted-foreground mb-1">Copy the link to your specific database page.</p>
                        <input value={notionDb} onChange={(e) => setNotionDb(e.target.value)} placeholder="https://notion.so/..." className="w-full px-5 py-3.5 border border-border/60 rounded-2xl text-[14px] bg-background outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10 shadow-sm font-medium" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                      <button onClick={testNotion} disabled={testingNotion} className="px-6 py-3.5 bg-background border border-border/60 rounded-2xl text-[14px] font-bold hover:bg-muted transition-all shadow-sm flex items-center justify-center gap-2 disabled:opacity-50 min-w-[200px]">
                        {testingNotion ? <Loader2 size={18} className="animate-spin" /> : <RefreshCw size={18} />}
                        Test Connection
                      </button>
                      <button onClick={saveNotionSettings} className="px-8 py-3.5 bg-primary text-primary-foreground rounded-2xl text-[14px] font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 min-w-[200px]">
                        <Check size={18} /> Save Settings
                      </button>
                      
                      {/* Connection Result */}
                      {notionTestResult && (
                        <div className={`flex items-center gap-2 text-[14px] font-semibold px-5 py-3.5 rounded-2xl border ml-auto ${notionTestResult.ok ? 'bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400' : 'bg-destructive/10 border-destructive/20 text-destructive'}`}>
                          {notionTestResult.ok ? <Check size={16} /> : <AlertCircle size={16} />}
                          {notionTestResult.msg}
                        </div>
                      )}
                    </div>
                    
                    {/* Active Connection Warning */}
                    {notionDbName && !notionTestResult && (
                      <div className="flex items-center gap-2 text-[14px] font-medium text-muted-foreground bg-green-500/5 border border-green-500/10 px-5 py-3 rounded-2xl">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" /> Connected to: <strong className="text-foreground">{notionDbName}</strong>
                      </div>
                    )}

                    <div className="h-px bg-border/40 w-full" />

                    {/* Sync Behavior */}
                    <div>
                      <div className="flex items-center justify-between p-6 bg-background border border-border/40 rounded-3xl mb-6 shadow-sm">
                        <div className="flex items-center gap-5">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-indigo-500/10 text-indigo-500`}>
                            <Zap size={24} />
                          </div>
                          <div>
                            <div className="text-[16px] font-bold mb-1">Instant Auto-Sync</div>
                            <div className="text-[14px] text-muted-foreground">Push new posts to Notion the moment you save them on LinkedIn.</div>
                          </div>
                        </div>
                        <button
                          onClick={() => { const next = !notionAutoSync; setNotionAutoSync(next); chrome.runtime.sendMessage({ action: 'SAVE_NOTION_SETTINGS', payload: { notion_auto_sync: next } }) }}
                          className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${notionAutoSync ? 'bg-primary' : 'bg-muted-foreground/30 hover:bg-muted-foreground/40'}`}
                        >
                          <div className={`w-6 h-6 rounded-full bg-white shadow-md absolute top-0.5 transition-all ${notionAutoSync ? 'left-[30px]' : 'left-0.5'}`} />
                        </button>
                      </div>

                      {/* Sync Metrics */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="p-5 bg-background border border-border/40 rounded-3xl flex flex-col items-center justify-center shadow-sm">
                          <div className="text-2xl font-black text-green-500 mb-1">{syncStats.synced}</div>
                          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Synced</div>
                        </div>
                        <div className="p-5 bg-background border border-border/40 rounded-3xl flex flex-col items-center justify-center shadow-sm">
                          <div className="text-2xl font-black text-amber-500 mb-1">{syncStats.pending}</div>
                          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Pending</div>
                        </div>
                        <div className="p-5 bg-background border border-border/40 rounded-3xl flex flex-col items-center justify-center shadow-sm">
                          <div className="text-2xl font-black text-destructive mb-1">{syncStats.failed}</div>
                          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Failed</div>
                        </div>
                        <div className="p-5 bg-background border border-border/40 rounded-3xl flex flex-col items-center justify-center shadow-sm">
                          <div className="text-2xl font-black text-muted-foreground mb-1">{syncStats.unsynced}</div>
                          <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Unsynced</div>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4">
                        <button onClick={syncAll} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-primary text-primary-foreground rounded-2xl text-[15px] font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                          <RefreshCw size={18} /> Sync All Missing Posts
                        </button>
                        {syncStats.failed > 0 && (
                          <button onClick={retryFailed} className="flex-1 flex items-center justify-center gap-2 px-6 py-4 bg-destructive/10 text-destructive border border-destructive/20 rounded-2xl text-[15px] font-bold hover:bg-destructive/20 transition-all">
                            <AlertCircle size={18} /> Retry Errors
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              )}

              {settingsTab === 'data' && (
                <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="mb-8">
                    <h2 className="text-2xl font-display font-bold mb-2">Data Management</h2>
                    <p className="text-muted-foreground">Safely export your storage or restore from an earlier backup JSON file.</p>
                  </div>
                  
                  <div className="bg-card border border-border/40 rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-4">
                    
                    <div className="p-6 md:p-7 border border-border/40 rounded-3xl bg-background flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-border/80 transition-colors shadow-sm">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0">
                          <Download size={24} />
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold mb-1">Export Full JSON Backup</h3>
                          <p className="text-[14px] text-muted-foreground leading-relaxed">Download all posts, labels, and metadata as a raw JSON file. You can restore your entire library using this file later.</p>
                        </div>
                      </div>
                      <button onClick={exportBackup} className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 border border-border/60 hover:bg-muted bg-background rounded-2xl text-[14px] font-bold transition-all w-full md:w-auto">
                        Export JSON
                      </button>
                    </div>

                    <div className="p-6 md:p-7 border border-border/40 rounded-3xl bg-background flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-border/80 transition-colors shadow-sm">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
                          <Upload size={24} />
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold mb-1">Restore from Backup</h3>
                          <p className="text-[14px] text-muted-foreground leading-relaxed">Upload an existing JSON backup. This merges with your current data cleanly without erasing new saves.</p>
                        </div>
                      </div>
                      <label className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 border border-border/60 hover:bg-muted bg-background rounded-2xl text-[14px] font-bold transition-all cursor-pointer w-full md:w-auto">
                        Select File
                        <input type="file" accept=".json" onChange={importBackup} className="hidden" />
                      </label>
                    </div>

                    <div className="p-6 md:p-7 border border-border/40 rounded-3xl bg-background flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-border/80 transition-colors shadow-sm">
                      <div className="flex gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
                          <FileText size={24} />
                        </div>
                        <div>
                          <h3 className="text-[16px] font-bold mb-1">Export as Markdown</h3>
                          <p className="text-[14px] text-muted-foreground leading-relaxed">Turn every saved post into a single massive unified markdown document, perfect for Obsidian or local editors.</p>
                        </div>
                      </div>
                      <button onClick={exportAllMd} className="shrink-0 flex items-center justify-center gap-2 px-6 py-3.5 border border-border/60 hover:bg-muted bg-background rounded-2xl text-[14px] font-bold transition-all w-full md:w-auto">
                        Export MD
                      </button>
                    </div>

                  </div>
                </section>
              )}

            </div>
          </main>
        </div>

        {/* Delete Category Alert */}
        <AlertDialog open={!!categoryToDelete} onOpenChange={(o) => !o && setCategoryToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display">Delete Category?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to permanently remove the label "{categoryToDelete}"? This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={performDeleteCategory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                Delete Category
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toaster */}
        {toast && (
          <div className={`fixed bottom-8 right-8 z-50 px-5 py-3.5 bg-card border border-border/50 rounded-2xl text-[13px] font-semibold shadow-2xl flex items-center gap-3 ${toast.ok ? 'border-primary/40 text-primary' : 'border-destructive/40 text-destructive'}`} style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${toast.ok ? 'bg-primary/10' : 'bg-destructive/10'}`}>
              {toast.ok ? <Check size={14} /> : <X size={14} />}
            </div>
            {toast.msg}
          </div>
        )}
      </div>
    )
  }

  // ── POSTS VIEW ──
  return (
    <div className="h-screen flex flex-col bg-background text-foreground overflow-hidden font-sans">
      {/* Topbar with Insights + Search */}
      <header className="flex items-center justify-between px-6 h-[72px] border-b border-border/50 shrink-0 bg-background/80 backdrop-blur-xl z-20 shadow-sm">
        {/* Left: Logo */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
            <Bookmark size={16} className="text-primary-foreground" />
          </div>
          <span className="text-base font-display font-bold tracking-tight">SaveIn</span>
        </div>

        {/* Center: Search */}
        <div className="flex-1 max-w-md mx-6 relative group">
          <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search posts, authors, tags..." className="w-full pl-9 pr-8 py-2.5 bg-muted/50 border border-border/50 rounded-xl text-[13px] font-medium outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 shadow-sm placeholder:text-muted-foreground/60" />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              <X size={13} />
            </button>
          )}
        </div>

        {/* Right: Stats + Actions */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Compact Stats */}
          <div className="hidden lg:flex items-center gap-3">
            {[
              { icon: Bookmark, value: stats.total, label: 'Saved', color: 'text-primary' },
              { icon: Users, value: stats.authors, label: 'Authors', color: 'text-violet-500' },
              { icon: Clock, value: stats.recent, label: 'This Week', color: 'text-emerald-500' },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/40 border border-border/30 hover:border-border/60 transition-all group cursor-default">
                <s.icon size={13} className={`${s.color} opacity-80 group-hover:opacity-100 transition-opacity`} />
                <span className="text-[14px] font-display font-bold">{s.value}</span>
                <span className="text-[10px] text-muted-foreground font-medium hidden xl:inline">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="w-px h-6 bg-border/60" />

          <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/80 transition-all text-muted-foreground hover:text-foreground" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <button onClick={() => setView('settings')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/80 transition-all text-muted-foreground hover:text-foreground" title="Preferences">
            <Settings size={17} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar — Filtration Only */}
        <aside className="w-[240px] border-r border-border/50 flex flex-col bg-card/40 shrink-0">
          <div className="px-4 py-4 flex flex-col gap-5 flex-1 overflow-y-auto">
            {/* Sort */}
            <div>
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-2 block pl-1">Sort By</span>
              <div className="relative">
                <ArrowUpDown size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'author')}
                  className="w-full pl-8 pr-3 py-2 bg-background border border-border/60 rounded-xl text-[12px] font-semibold outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer shadow-sm text-foreground"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="author">Author A → Z</option>
                </select>
                <ChevronDown size={12} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
              </div>
            </div>
            
            {/* Categories */}
            <div>
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-2.5 block pl-1">Categories</span>
              <div className="flex flex-col gap-1">
                <button onClick={() => setFilterCategory('')} className={`text-[12px] font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-between w-full ${!filterCategory ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
                  <span>All Saves</span>
                  <span className={`text-[10px] py-0.5 px-1.5 rounded-md ${!filterCategory ? 'bg-primary-foreground/20' : 'bg-muted-foreground/10 text-muted-foreground'}`}>{posts.length}</span>
                </button>
                {categories.map((c) => {
                  const count = posts.filter(p => p.category === c.name).length
                  const active = filterCategory === c.name
                  return (
                    <button key={c.name} onClick={() => setFilterCategory(active ? '' : c.name)} className={`text-[12px] font-semibold px-3 py-2 rounded-xl transition-all flex items-center justify-between w-full group ${active ? 'bg-background border border-border/60 shadow-sm text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ring-1 ring-black/5" style={{ background: c.color }} />
                        <span>{c.name}</span>
                      </div>
                      <span className={`text-[10px] py-0.5 px-1.5 rounded-md transition-colors ${active ? 'bg-muted text-muted-foreground' : 'bg-transparent group-hover:bg-background/80 text-muted-foreground/60 group-hover:text-muted-foreground'}`}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Authors */}
            <div>
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-2.5 block pl-1">Authors</span>
              <div className="flex flex-col gap-1 max-h-[220px] overflow-y-auto pr-1">
                {authorList.map(([name, { count, img }]) => {
                  const active = filterAuthor === name
                  return (
                    <button key={name} onClick={() => setFilterAuthor(active ? '' : name)} className={`text-[12px] font-medium px-3 py-2 rounded-xl transition-all flex items-center justify-between w-full group ${active ? 'bg-background border border-border/60 shadow-sm text-foreground' : 'hover:bg-muted text-muted-foreground hover:text-foreground'}`}>
                      <div className="flex items-center gap-2.5 min-w-0">
                        {img ? (
                          <img src={img} alt={name} className="w-5 h-5 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-[8px] font-bold shrink-0">
                            {name.substring(0, 1).toUpperCase()}
                          </div>
                        )}
                        <span className="truncate">{name}</span>
                      </div>
                      <span className={`text-[10px] py-0.5 px-1.5 rounded-md transition-colors shrink-0 ${active ? 'bg-muted text-muted-foreground' : 'bg-transparent group-hover:bg-background/80 text-muted-foreground/60 group-hover:text-muted-foreground'}`}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Active Filters */}
            {(filterCategory || filterAuthor || searchQuery) && (
              <button
                onClick={() => { setFilterCategory(''); setFilterAuthor(''); setSearchQuery(''); setSortBy('newest'); }}
                className="text-[11px] font-semibold text-destructive hover:text-destructive/80 flex items-center gap-1.5 px-3 py-2 rounded-xl hover:bg-destructive/5 transition-all w-full"
              >
                <X size={12} /> Clear All Filters
              </button>
            )}
          </div>
        </aside>

        {/* Post List */}
        <main className="flex-1 flex flex-col overflow-hidden bg-muted/20">
          <div className="flex items-center justify-between px-7 h-14 border-b border-border/40 shrink-0 bg-background/50 backdrop-blur-md z-10">
            <div className="flex items-center gap-2.5">
              <h2 className="text-[15px] font-display font-bold">Your Library</h2>
              <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{filtered.length} entries</span>
            </div>
            
            <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border/40 shadow-sm">
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'list' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                title="List View"
              >
                <List size={14} />
              </button>
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-all flex items-center justify-center ${viewMode === 'grid' ? 'bg-background shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
                title="Grid View"
              >
                <LayoutGrid size={14} />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground pb-20 mt-10">
                <div className="w-24 h-24 rounded-3xl bg-background border border-dashed border-border flex items-center justify-center mb-6 shadow-sm relative overflow-hidden group">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <Bookmark size={40} className="text-muted-foreground/40 group-hover:text-primary/60 transition-colors duration-500 group-hover:scale-110" />
                </div>
                <h3 className="text-lg font-display font-medium text-foreground tracking-tight">Nothing to see here</h3>
                <p className="text-[14px] mt-2 opacity-60 max-w-[260px] text-center leading-relaxed">Adjust your filters or save some new posts to build your collection.</p>
              </div>
            ) : (
              <div className={viewMode === 'list' ? "grid grid-cols-1 gap-3 max-w-4xl mx-auto" : "grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 max-w-7xl mx-auto"}>
                {filtered.map((p) => {
                  const isSelected = selected?.id === p.id
                  
                  if (viewMode === 'list') {
                    return (
                      <div key={p.id} className={`w-full text-left p-4 flex flex-col sm:flex-row items-stretch gap-4 transition-all duration-300 rounded-2xl border group cursor-pointer ${isSelected ? 'bg-background border-primary shadow-md ring-1 ring-primary/20 scale-[1.01] -translate-y-0.5' : 'bg-card border-border/60 shadow-sm hover:border-border hover:shadow-md hover:-translate-y-0.5'}`}
                        onClick={() => setSelected(p)}>
                        {/* Author Info (Left) */}
                        <div className="flex flex-col items-center md:min-w-[48px] shrink-0 pt-1">
                          {p.authorImageUrl ? (
                            <img src={p.authorImageUrl} alt={p.author} className={`w-10 h-10 rounded-full object-cover transition-shadow ${isSelected ? 'ring-2 ring-primary/30' : 'group-hover:ring-2 group-hover:ring-primary/10'}`} />
                          ) : (
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary/80'}`}>
                              {(p.author || 'U').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        {/* Content (Middle) */}
                        <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
                          <div className="flex items-center justify-between mb-1">
                            <h3 className="text-[14px] font-display font-semibold truncate group-hover:text-primary transition-colors">{p.author}</h3>
                            <span className="text-[10.5px] font-medium text-muted-foreground shrink-0 px-2 py-0.5 rounded-md bg-muted/40">{formatDate(p.date_saved)}</span>
                          </div>
                          
                          <p className="text-[13px] text-muted-foreground/90 leading-relaxed line-clamp-2 w-full mb-3">{p.content}</p>
                          
                          <div className="flex items-center justify-between mt-auto pt-1">
                            <div className="flex flex-wrap items-center gap-2">
                              {p.category && (
                                <span className="inline-flex items-center gap-1.5 text-[10.5px] font-semibold px-2.5 py-0.5 border border-border/40 rounded-full bg-background shadow-sm text-foreground" style={{ borderColor: `${p.categoryColor}30` }}>
                                  <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.categoryColor || '#64748b' }} />
                                  {p.category}
                                </span>
                              )}
                              {p.note && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-accent text-accent-foreground border border-accent-foreground/10">
                                  <StickyNote size={10} /> Has note
                                </span>
                              )}
                              {p.notionSyncStatus === 'synced' && (
                                <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600 dark:bg-green-950 dark:text-green-400 border border-green-200 dark:border-green-800">
                                  <Check size={9} /> Synced
                                </span>
                              )}
                            </div>
                            
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={(e) => { e.stopPropagation(); setPostToDelete(p); }} 
                                className="p-1.5 rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0" 
                                title="Delete post">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* Thumbnail (Right) */}
                        {p.postImageUrl && (
                           <div className="hidden sm:block shrink-0 ml-2">
                             <img src={p.postImageUrl} alt="Preview" className="w-[120px] h-[86px] object-cover rounded-xl border border-border/40 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity" />
                           </div>
                        )}
                      </div>
                    )
                  }

                  // GRID VIEW
                  return (
                    <div key={p.id} className={`w-full text-left flex flex-col overflow-hidden transition-all duration-300 rounded-3xl border group cursor-pointer ${isSelected ? 'bg-background border-primary shadow-lg ring-1 ring-primary/20 scale-[1.02] -translate-y-1' : 'bg-card border-border/60 shadow-sm hover:border-border hover:shadow-xl hover:-translate-y-1'}`}
                      onClick={() => setSelected(p)}>
                      
                      {/* Image Banner */}
                      {p.postImageUrl ? (
                        <div className="w-full h-36 shrink-0 relative overflow-hidden bg-muted/30 border-b border-border/40">
                          <img src={p.postImageUrl} alt="" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                        </div>
                      ) : (
                        <div className="w-full h-10 shrink-0 bg-gradient-to-br from-muted/50 to-muted/20 border-b border-border/40" />
                      )}

                      {/* Card Content Base */}
                      <div className="p-5 flex flex-col flex-1 relative">
                        {/* Avatar floating above banner */}
                        <div className={`absolute ${p.postImageUrl ? '-top-6' : '-top-5'} left-5 p-1 bg-card rounded-full shadow-sm`}>
                           {p.authorImageUrl ? (
                            <img src={p.authorImageUrl} alt={p.author} className="w-10 h-10 rounded-full object-cover" />
                          ) : (
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold bg-muted text-muted-foreground">
                              {(p.author || 'U').substring(0, 2).toUpperCase()}
                            </div>
                          )}
                        </div>

                        <div className={`flex items-center justify-between mb-3 ${p.postImageUrl ? 'ml-[52px]' : 'ml-[52px]'}`}>
                           <h3 className="text-[14px] font-display font-semibold truncate group-hover:text-primary transition-colors max-w-[140px]">{p.author}</h3>
                           <span className="text-[10px] font-medium text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">{formatDate(p.date_saved)}</span>
                        </div>

                        <p className="text-[13px] text-muted-foreground border-l-2 border-primary/20 pl-3 leading-relaxed line-clamp-4 w-full mb-5 flex-1 group-hover:border-primary/50 transition-colors">
                          {p.content}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/30">
                           <div className="flex items-center gap-2 overflow-hidden flex-1 pr-2">
                             {p.category && (
                                <span className="inline-flex shrink-0 items-center gap-1.5 text-[10px] font-semibold px-2.5 py-0.5 border border-border/40 rounded-full bg-background shadow-sm text-foreground max-w-full" style={{ borderColor: `${p.categoryColor}30` }}>
                                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: p.categoryColor || '#64748b' }} />
                                  <span className="truncate">{p.category}</span>
                                </span>
                              )}
                              {p.note && (
                                <span className="shrink-0 text-muted-foreground" title="Has Note"><StickyNote size={12} /></span>
                              )}
                           </div>
                           <button 
                              onClick={(e) => { e.stopPropagation(); setPostToDelete(p); }} 
                              className="p-1.5 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors shrink-0 opacity-0 group-hover:opacity-100" 
                              title="Delete post">
                              <Trash2 size={14} />
                            </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </main>

        {/* Detail */}
        {selected && (
          <aside className="w-[380px] border-l border-border/50 flex flex-col bg-background shrink-0 shadow-2xl relative z-20" style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
            <div className="flex items-center justify-between px-6 h-14 border-b border-border/50 shrink-0 bg-background/80 backdrop-blur-xl absolute top-0 w-full z-10">
              <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80">Reading</span>
              <button onClick={() => setSelected(null)} className="w-7 h-7 flex items-center justify-center rounded-full bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"><X size={14} /></button>
            </div>

            <div className="flex-1 overflow-y-auto pt-14 pb-6 scroll-smooth">
              <div className="px-6 pt-6 pb-5 border-b border-border/40 bg-gradient-to-b from-muted/30 to-transparent">
                <div className="flex items-start gap-4 mb-4">
                  {selected.authorImageUrl ? (
                    <img src={selected.authorImageUrl} alt={selected.author} className="w-11 h-11 rounded-2xl shadow-sm object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-2xl shadow-sm flex items-center justify-center text-[15px] font-bold shrink-0" style={{ background: `${selected.categoryColor || '#3b82f6'}15`, color: selected.categoryColor || '#3b82f6', border: `1px solid ${selected.categoryColor || '#3b82f6'}30` }}>
                      {(selected.author || 'U').substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-display font-bold text-foreground leading-tight mb-1">{selected.author}</h3>
                    <div className="flex items-center gap-2">
                      <span className="text-[11.5px] font-medium text-muted-foreground">{formatDate(selected.date_saved)}</span>
                      <div className="w-1 h-1 rounded-full bg-border" />
                      <a href={selected.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-primary hover:underline hover:text-primary/80 transition-colors">
                        Original Post <ExternalLink size={10} />
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {selected.note && (
                <div className="px-6 py-5 border-b border-border/40">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-3"><StickyNote size={12} className="text-primary/70" /> Annotations</div>
                  <div className="text-[13px] text-foreground/90 bg-primary/5 p-4 rounded-xl border border-primary/10 italic leading-relaxed shadow-sm">{selected.note}</div>
                </div>
              )}

              {selected.postImageUrl && (
                <div className="px-6 py-5 border-b border-border/40">
                  <div className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-3">Media Preview</div>
                  <img src={selected.postImageUrl} alt="Post media" className="w-full rounded-xl border border-border/40 shadow-sm object-cover max-h-[200px]" />
                </div>
              )}

              <div className="px-6 py-5">
                <div className="text-[13.5px] text-foreground leading-loose whitespace-pre-wrap max-h-[300px] overflow-y-auto select-text selection:bg-primary/20">
                  {selected.content || <span className="italic opacity-50">No content successfully parsed.</span>}
                </div>
              </div>

              <div className="px-6 py-6 bg-muted/20 mt-4 border-y border-border/40">
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-4 block">Organization</span>
                <div className="flex flex-col gap-3">
                  <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full px-3.5 py-2.5 bg-background border border-border/60 rounded-xl text-[13px] font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all appearance-none cursor-pointer shadow-sm">
                    <option value="">No specific label</option>
                    {categories.map((c) => <option key={c.name} value={c.name}>{c.name}</option>)}
                  </select>
                  <input value={editTags} onChange={(e) => setEditTags(e.target.value)} placeholder="Tags (comma separated e.g., insight, tech)" className="w-full px-3.5 py-2.5 bg-background border border-border/60 rounded-xl text-[13px] font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all shadow-sm placeholder:text-muted-foreground" />
                  <textarea value={editNote} onChange={(e) => setEditNote(e.target.value)} placeholder="Attach a private mental note alongside this post..." rows={3} className="w-full px-3.5 py-2.5 bg-background border border-border/60 rounded-xl text-[13px] font-medium outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none shadow-sm placeholder:text-muted-foreground" />
                  <button onClick={saveDetails} className="w-full py-3 mt-1 bg-foreground text-background rounded-xl text-[13px] font-bold hover:opacity-90 transition-opacity shadow-md flex items-center justify-center gap-2 group">
                    <Check size={14} className="group-hover:scale-110 transition-transform" /> Save Settings
                  </button>
                </div>
              </div>

              <div className="px-6 pt-6 pb-2">
                {selected.notionSyncStatus && (
                  <div className="flex items-center gap-2 text-[12px] font-medium mb-4 px-3 py-2.5 rounded-xl border border-border/40 bg-muted/30">
                    {selected.notionSyncStatus === 'synced' && <><Check size={12} className="text-green-500" /><span className="text-green-600 dark:text-green-400">Synced to Notion</span>{selected.notionLastSyncAt && <span className="text-muted-foreground">· {formatDate(selected.notionLastSyncAt)}</span>}</>}
                    {selected.notionSyncStatus === 'pending' && <><Loader2 size={12} className="animate-spin text-amber-500" /><span className="text-amber-600 dark:text-amber-400">Syncing to Notion...</span></>}
                    {selected.notionSyncStatus === 'failed' && <><AlertCircle size={12} className="text-red-500" /><span className="text-red-600 dark:text-red-400">Sync failed</span><span className="text-muted-foreground text-[11px] truncate">· {selected.notionLastError}</span></>}
                  </div>
                )}
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-4 block">Actions</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={exportMd} className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-md transition-all group">
                    <FileText size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[11px] font-semibold">Markdown</span>
                  </button>
                  <button onClick={pushNotion} className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-md transition-all group">
                    {selected.notionSyncStatus === 'synced' ? (
                      <><RefreshCw size={16} className="text-green-500 group-hover:text-primary transition-colors" /><span className="text-[11px] font-semibold">Re-sync</span></>
                    ) : selected.notionSyncStatus === 'pending' ? (
                      <><Loader2 size={16} className="animate-spin text-amber-500" /><span className="text-[11px] font-semibold">Syncing...</span></>
                    ) : (
                      <><Upload size={16} className="text-muted-foreground group-hover:text-primary transition-colors" /><span className="text-[11px] font-semibold">Notion Sync</span></>
                    )}
                  </button>
                  <button onClick={() => setPostToDelete(selected)} className="col-span-2 flex items-center justify-center gap-2 p-3.5 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive hover:text-destructive-foreground hover:shadow-md transition-all shadow-sm">
                    <Trash2 size={15} />
                    <span className="text-[12px] font-bold">Permanently Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>

      {/* Delete Post Alert */}
      <AlertDialog open={!!postToDelete} onOpenChange={(o) => !o && setPostToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the post by <strong className="text-foreground">{postToDelete?.author}</strong> from your local storage. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={deleteSelectedPost} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl font-bold">
              Yes, delete post
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Footer */}
      <footer className="shrink-0 flex items-center justify-center gap-6 px-6 h-12 border-t border-border/30 text-[12px] text-muted-foreground bg-background/60 backdrop-blur-sm z-20">
        <a href="https://github.com/MohamedThabt/SaveIn" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
          <Github size={13} /> GitHub
        </a>
        <span className="w-1 h-1 rounded-full bg-border" />
        <a href="https://sirthabet.dev/posts/savein-linkedin-chrome-extension-guide" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
          <BookOpen size={13} /> Docs
        </a>
        <span className="w-1 h-1 rounded-full bg-border" />
        <a href="https://sirthabet.dev" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-primary transition-colors font-medium">
          <Globe size={13} /> Mohamed Thabet
        </a>
      </footer>

      {/* Toaster */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-50 px-5 py-3.5 bg-card border border-border/50 rounded-2xl text-[13px] font-semibold shadow-2xl flex items-center gap-3 ${toast.ok ? 'border-primary/40 text-primary' : 'border-destructive/40 text-destructive'}`} style={{ animation: 'slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)' }}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${toast.ok ? 'bg-primary/10' : 'bg-destructive/10'}`}>
            {toast.ok ? <Check size={14} /> : <X size={14} />}
          </div>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

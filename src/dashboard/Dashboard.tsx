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
  Moon
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
  category?: string | null
  categoryColor?: string | null
  note?: string | null
  tags?: string[]
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
  const [view, setView] = useState<'posts' | 'settings'>('posts')
  const [categories, setCategories] = useState<Category[]>(DEFAULT_CATS)
  const [newCatName, setNewCatName] = useState('')
  const [newCatColor, setNewCatColor] = useState('#3b82f6')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

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
    chrome.storage.local.get(['settings', 'theme'], (res) => {
      const s = res.settings || {}
      if (s.notion_token) setNotionToken(s.notion_token)
      if (s.notion_db_id) setNotionDb(s.notion_db_id)
      
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

  const filtered = useMemo(() => posts.filter((p) => {
    const q = !searchQuery || p.content?.toLowerCase().includes(searchQuery.toLowerCase()) || p.author?.toLowerCase().includes(searchQuery.toLowerCase())
    const c = !filterCategory || p.category === filterCategory
    return q && c
  }), [posts, searchQuery, filterCategory])

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

  const saveNotion = () => {
    chrome.storage.local.set({ settings: { notion_token: notionToken, notion_db_id: notionDb } }, () => flash('Settings saved'))
  }

  const pushNotion = () => {
    if (!selected) return
    chrome.runtime.sendMessage({ action: 'PUSH_NOTION', payload: selected }, (res) => {
      flash(res?.success ? 'Pushed to Notion!' : (res?.error || 'Failed to push'), res?.success)
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
        <header className="flex items-center gap-3 px-8 h-16 border-b border-border/60 shrink-0 bg-background/80 backdrop-blur-xl z-10 shadow-sm">
          <button onClick={() => setView('posts')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/80 hover:shadow-sm transition-all text-muted-foreground hover:text-foreground">
            <ArrowLeft size={18} />
          </button>
          <span className="text-lg font-display font-semibold">Preferences</span>
          <div className="flex-1" />
          <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/80 transition-all text-muted-foreground hover:text-foreground" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 max-w-4xl mx-auto w-full">
          {/* Categories */}
          <section className="mb-12 bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-display font-semibold mb-2 flex items-center gap-2.5"><Palette size={20} className="text-primary" /> Label Categories</h2>
            <p className="text-sm text-muted-foreground mb-6">Manage distinct labels to organize and highlight your saved posts creatively.</p>
            <div className="flex flex-wrap gap-2.5 mb-6">
              {categories.map((c) => (
                <div key={c.name} className="flex items-center gap-2 px-4 py-2 border border-border/60 rounded-full bg-background text-[13px] font-medium group transition-all hover:border-border shadow-sm">
                  <span className="w-3 h-3 rounded-full shrink-0 shadow-sm" style={{ background: c.color }} />
                  {c.name}
                  <button onClick={() => setCategoryToDelete(c.name)} className="opacity-40 group-hover:opacity-100 transition-opacity ml-1 bg-destructive/10 rounded-full p-1 hover:bg-destructive/20 text-destructive">
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-3 max-w-md">
              <input value={newCatName} onChange={(e) => setNewCatName(e.target.value)} placeholder="Type new category..." className="flex-1 px-4 py-2.5 border border-border/60 rounded-xl text-sm bg-background outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/20 shadow-sm" />
              <div className="relative w-11 h-11 shrink-0 rounded-xl border border-border/60 shadow-sm overflow-hidden flex items-center justify-center cursor-pointer hover:border-border transition-colors">
                <input type="color" value={newCatColor} onChange={(e) => setNewCatColor(e.target.value)} className="absolute inset-[-10px] w-20 h-20 opacity-0 cursor-pointer z-10" />
                <div className="w-5 h-5 rounded-full shadow-inner" style={{ background: newCatColor }} />
              </div>
              <button onClick={addCategory} className="px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md flex items-center gap-2">
                <Plus size={16} /> Create
              </button>
            </div>
          </section>

          {/* Notion */}
          <section className="mb-12 bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-display font-semibold mb-2 flex items-center gap-2.5"><Upload size={20} className="text-primary" /> Notion Integration</h2>
            <p className="text-sm text-muted-foreground mb-6">Automatically sync or push your saved content directly into your connected Notion database.</p>
            <div className="flex flex-col gap-5 max-w-xl">
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Integration Token</label>
                <input type="password" value={notionToken} onChange={(e) => setNotionToken(e.target.value)} placeholder="secret_..." className="w-full px-4 py-3 border border-border/60 rounded-xl text-sm bg-background outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/20 shadow-sm" />
              </div>
              <div>
                <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Target Database ID</label>
                <input value={notionDb} onChange={(e) => setNotionDb(e.target.value)} placeholder="abc123def..." className="w-full px-4 py-3 border border-border/60 rounded-xl text-sm bg-background outline-none transition-all focus:border-ring focus:ring-2 focus:ring-ring/20 shadow-sm" />
              </div>
              <button onClick={saveNotion} className="self-start px-6 py-3 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity shadow-md flex items-center gap-2 mt-2">
                <Check size={16} /> Save credentials
              </button>
            </div>
          </section>

          {/* Data Management */}
          <section className="bg-card border border-border/50 rounded-2xl p-8 shadow-sm">
            <h2 className="text-xl font-display font-semibold mb-2 flex items-center gap-2.5"><FolderUp size={20} className="text-primary" /> Data & Backups</h2>
            <p className="text-sm text-muted-foreground mb-6">Safely export your storage or import an old backup JSON payload.</p>
            <div className="flex flex-wrap gap-4">
              <button onClick={exportBackup} className="flex items-center justify-center gap-2.5 px-6 py-3 border border-border/80 shadow-sm bg-background rounded-xl text-sm font-semibold hover:border-primary/50 hover:text-primary transition-all">
                <Download size={16} /> Export JSON Payload
              </button>
              <button onClick={exportAllMd} className="flex items-center justify-center gap-2.5 px-6 py-3 border border-border/80 shadow-sm bg-background rounded-xl text-sm font-semibold hover:border-primary/50 hover:text-primary transition-all">
                <FileText size={16} /> Export All (MD)
              </button>
              <label className="flex items-center justify-center gap-2.5 px-6 py-3 border border-border/80 shadow-sm bg-background rounded-xl text-sm font-semibold hover:border-primary/50 hover:text-primary transition-all cursor-pointer">
                <Upload size={16} /> Restore from File
                <input type="file" accept=".json" onChange={importBackup} className="hidden" />
              </label>
            </div>
          </section>
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
      {/* Topbar */}
      <header className="flex items-center justify-between px-6 h-16 border-b border-border/50 shrink-0 bg-background/80 backdrop-blur-xl z-20 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center">
            <Bookmark size={16} className="text-primary-foreground" />
          </div>
          <span className="text-base font-display font-bold tracking-tight">LinkedIn Saver</span>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={toggleTheme} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/80 transition-all text-muted-foreground hover:text-foreground" title="Toggle Theme">
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>
          <div className="w-px h-5 bg-border mx-1" />
          <button onClick={() => setView('settings')} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-muted/80 transition-all text-muted-foreground hover:text-foreground" title="Preferences">
            <Settings size={17} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative z-10">
        {/* Sidebar */}
        <aside className="w-[240px] border-r border-border/50 flex flex-col bg-card/40 shrink-0">
          <div className="grid grid-cols-2 gap-2 p-4">
            {[
              { icon: Bookmark, value: stats.total, label: 'Saved' },
              { icon: Tag, value: stats.categories, label: 'Tags' },
              { icon: Users, value: stats.authors, label: 'Authors' },
              { icon: Clock, value: stats.recent, label: '7 Days' },
            ].map((s) => (
              <div key={s.label} className="col-span-1 flex flex-col items-center py-3.5 rounded-2xl bg-background border border-border/40 shadow-sm hover:border-primary/40 hover:shadow-md transition-all group">
                <s.icon size={14} className="text-muted-foreground group-hover:text-primary transition-colors mb-1.5" />
                <span className="text-[17px] font-display font-bold leading-none">{s.value}</span>
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-1 opacity-70 group-hover:opacity-100">{s.label}</span>
              </div>
            ))}
          </div>

          <div className="px-4 pb-4 flex flex-col gap-4 flex-1 overflow-y-auto mt-2">
            <div className="relative group">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search content..." className="w-full pl-9 pr-3 py-2.5 bg-background border border-border/60 rounded-xl text-[13px] font-medium outline-none transition-all focus:border-primary/50 focus:ring-2 focus:ring-primary/10 shadow-sm placeholder:text-muted-foreground/70" />
            </div>
            
            <div>
              <span className="text-[10px] font-bold text-muted-foreground/80 uppercase tracking-widest mb-3 block pl-1">Categories</span>
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
                        <span className="w-2 h-2 rounded-full shrink-0 shadow-sm" style={{ background: c.color }} />
                        <span>{c.name}</span>
                      </div>
                      <span className={`text-[10px] py-0.5 px-1.5 rounded-md transition-colors ${active ? 'bg-muted text-muted-foreground' : 'bg-transparent group-hover:bg-background/80 text-muted-foreground/60 group-hover:text-muted-foreground'}`}>{count}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </aside>

        {/* Post List */}
        <main className="flex-1 flex flex-col overflow-hidden bg-muted/20">
          <div className="flex items-center justify-between px-7 h-14 border-b border-border/40 shrink-0 bg-background/50 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <h2 className="text-sm font-display font-bold">Your Library</h2>
              <span className="text-[10px] font-bold bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{filtered.length} entries</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 lg:p-6 scroll-smooth">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground pb-20">
                <div className="w-20 h-20 rounded-full bg-border/40 flex items-center justify-center mb-5 shadow-inner">
                  <Bookmark size={36} className="text-muted-foreground/50" />
                </div>
                <p className="text-base font-display font-semibold text-foreground/80">Nothing found</p>
                <p className="text-[13px] mt-1.5 opacity-70">Adjust your search or start saving via the extension</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 max-w-4xl mx-auto">
                {filtered.map((p) => {
                  const isSelected = selected?.id === p.id
                  return (
                    <div key={p.id} className={`w-full text-left p-4 flex flex-col sm:flex-row items-start gap-4 transition-all duration-300 rounded-2xl border group cursor-pointer ${isSelected ? 'bg-background border-primary shadow-md ring-1 ring-primary/20 scale-[1.01]' : 'bg-card border-border/60 shadow-sm hover:border-primary/40 hover:shadow-md hover:scale-[1.01]'}`}
                      onClick={() => setSelected(p)}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-xs font-bold transition-colors ${isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary/80'}`}>
                        {(p.author || 'U').substring(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0 pr-2">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="text-[13.5px] font-display font-bold truncate group-hover:text-primary transition-colors">{p.author}</h3>
                          <span className="text-[10px] font-medium text-muted-foreground shrink-0 bg-muted/50 px-2 py-0.5 rounded-md">{formatDate(p.date_saved)}</span>
                        </div>
                        <p className="text-[12.5px] text-muted-foreground/90 leading-relaxed line-clamp-2 w-full">{p.content}</p>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex flex-wrap items-center gap-2">
                            {p.category && (
                              <span className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-border shadow-sm text-slate-800" style={{ borderColor: `${p.categoryColor}30` }}>
                                <span className="w-1.5 h-1.5 rounded-full" style={{ background: p.categoryColor || '#64748b' }} />
                                {p.category}
                              </span>
                            )}
                            {p.note && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-md bg-accent text-accent-foreground">
                                <StickyNote size={10} /> Has note
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
                            <div className="w-6 h-6 rounded-md bg-primary text-primary-foreground flex items-center justify-center translate-x-1 group-hover:translate-x-0 transition-all shrink-0">
                              <ChevronRight size={14} />
                            </div>
                          </div>
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
                  <div className="w-11 h-11 rounded-2xl shadow-sm flex items-center justify-center text-[15px] font-bold shrink-0" style={{ background: `${selected.categoryColor || '#3b82f6'}15`, color: selected.categoryColor || '#3b82f6', border: `1px solid ${selected.categoryColor || '#3b82f6'}30` }}>
                    {(selected.author || 'U').substring(0, 2).toUpperCase()}
                  </div>
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
                <span className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground/80 mb-4 block">Actions</span>
                <div className="grid grid-cols-2 gap-2.5">
                  <button onClick={exportMd} className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-md transition-all group">
                    <FileText size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[11px] font-semibold">Markdown</span>
                  </button>
                  <button onClick={pushNotion} className="flex flex-col items-center justify-center gap-2 p-3.5 rounded-xl border border-border/60 bg-background hover:border-primary/40 hover:shadow-md transition-all group">
                    <Upload size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
                    <span className="text-[11px] font-semibold">Notion Sync</span>
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

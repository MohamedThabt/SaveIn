import { useEffect, useState } from 'react'
import { Save, LayoutDashboard, Check, Plus, ArrowLeft } from 'lucide-react'

interface Post {
  id: string
  url: string
  author: string
  content: string
  date_saved: string
  category?: string | null
  tags?: string[]
}

interface Category {
  name: string
  color: string
}

export function Popup() {
  const [view, setView] = useState<'latest' | 'manual'>('latest')
  
  const [totalPosts, setTotalPosts] = useState(0)
  const [categories, setCategories] = useState<Category[]>([])

  // Manual Form State
  const [mAuthor, setMAuthor] = useState('')
  const [mContent, setMContent] = useState('')
  const [mUrl, setMUrl] = useState('')
  const [mCategory, setMCategory] = useState('')
  const [mStatus, setMStatus] = useState<'idle' | 'saving' | 'saved'>('idle')

  const loadData = () => {
    chrome.storage.local.get(['posts'], (result) => {
      const posts: Record<string, Post> = result.posts || {}
      setTotalPosts(Object.keys(posts).length)
    })
  }

  useEffect(() => {
    loadData()
    chrome.runtime.sendMessage({ action: 'GET_CATEGORIES' }, (res) => {
      if (res) setCategories(res)
    })
  }, [])

  const handleSaveManual = () => {
    if (!mAuthor.trim() || !mContent.trim()) return
    setMStatus('saving')

    const newPost: Post = {
      id: `m_${Date.now()}`,
      author: mAuthor.trim(),
      content: mContent.trim(),
      url: mUrl.trim(),
      date_saved: new Date().toISOString(),
      category: mCategory || null,
      tags: [],
    }

    chrome.runtime.sendMessage({ action: 'SAVE_POST', payload: newPost }, (res) => {
      if (res?.success) {
        setMStatus('saved')
        setTimeout(() => {
          setMStatus('idle')
          setMAuthor('')
          setMContent('')
          setMUrl('')
          setMCategory('')
          setView('latest')
          loadData() // Refresh latest post stats
        }, 1200)
      } else {
        setMStatus('idle')
      }
    })
  }

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') })
  }

  return (
    <div className="w-[320px] p-5 flex flex-col gap-5 bg-background text-foreground font-sans">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-[10px] bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
            <Save size={16} />
          </div>
          <div>
            <h1 className="text-[15px] font-bold leading-none">LinkedIn Saver</h1>
            <p className="text-[11px] text-muted-foreground mt-1">
              {totalPosts} posts saved
            </p>
          </div>
        </div>
        {view === 'latest' ? (
          <button onClick={() => setView('manual')} className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors" title="Add manually">
            <Plus size={18} />
          </button>
        ) : (
          <button onClick={() => setView('latest')} className="p-2 text-muted-foreground hover:bg-muted rounded-lg transition-colors" title="Go back">
            <ArrowLeft size={18} />
          </button>
        )}
      </div>

      {view === 'latest' ? (
        <>
          {/* Dashboard Button */}
          <button
            onClick={openDashboard}
            className="w-full py-2.5 bg-transparent border border-border text-foreground rounded-md text-sm font-semibold flex items-center justify-center gap-2 hover:bg-card transition-colors"
          >
            <LayoutDashboard size={14} />
            Open Dashboard
          </button>
        </>
      ) : (
        /* Manual Entry View */
        <div className="rounded-lg border border-border bg-card p-4 shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mb-1">
            <Plus size={16} className="text-primary" /> Manual Add
          </h2>
          
          <div>
            <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Author <span className="text-destructive">*</span></label>
            <input
              type="text"
              value={mAuthor}
              onChange={(e) => setMAuthor(e.target.value)}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Content <span className="text-destructive">*</span></label>
            <textarea
              value={mContent}
              onChange={(e) => setMContent(e.target.value)}
              placeholder="Paste the post content here..."
              rows={4}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-[13px] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Post URL</label>
            <input
              type="text"
              value={mUrl}
              onChange={(e) => setMUrl(e.target.value)}
              placeholder="https://linkedin.com/..."
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1.5 text-muted-foreground">Category</label>
            <select
              value={mCategory}
              onChange={(e) => setMCategory(e.target.value)}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 appearance-none"
            >
              <option value="">None</option>
              {categories.map(c => <option key={c.name} value={c.name}>{c.name}</option>)}
            </select>
          </div>

          <button
            onClick={handleSaveManual}
            disabled={mStatus === 'saving' || !mAuthor.trim() || !mContent.trim()}
            className="w-full mt-2 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {mStatus === 'saved' ? (
              <><Check size={14} /> Saved!</>
            ) : mStatus === 'saving' ? (
              'Adding...'
            ) : (
              <><Plus size={14} /> Add Post</>
            )}
          </button>
        </div>
      )}
    </div>
  )
}

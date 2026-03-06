import { useEffect, useState } from 'react'
import { Save, LayoutDashboard } from 'lucide-react'

export function Popup() {
  const [totalPosts, setTotalPosts] = useState(0)

  useEffect(() => {
    chrome.storage.local.get(['posts'], (result) => {
      const posts = result.posts || {}
      setTotalPosts(Object.keys(posts).length)
    })
  }, [])

  const openDashboard = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('dashboard.html') })
  }

  return (
    <div className="w-[320px] p-5 flex flex-col gap-5 bg-background text-foreground font-sans">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-[10px] bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
          <Save size={16} />
        </div>
        <div>
          <h1 className="text-[15px] font-bold leading-none">SaveIn</h1>
          <p className="text-[11px] text-muted-foreground mt-1">
            {totalPosts} posts saved
          </p>
        </div>
      </div>

      {/* Dashboard Button */}
      <button
        onClick={openDashboard}
        className="w-full py-2.5 bg-transparent border border-border text-foreground rounded-md text-sm font-semibold flex items-center justify-center gap-2 hover:bg-card transition-colors"
      >
        <LayoutDashboard size={14} />
        Open Dashboard
      </button>
    </div>
  )
}

<div align="center">

# SaveIn

### Never lose a great LinkedIn post again.

**Save, organize, search, export, and sync your favorite LinkedIn posts — all from one Chrome extension.**

[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![Notion API](https://img.shields.io/badge/Notion-Sync-000000?logo=notion&logoColor=white)](https://developers.notion.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

</div>

---

## Why SaveIn?

You find amazing posts on LinkedIn — career advice, industry insights, useful frameworks — and then they disappear into the infinite feed. LinkedIn's built-in bookmarks are buried and unsearchable. SaveIn gives you a personal library for all the LinkedIn content that matters to you.

---

## Download & Install

### Step 1 — Download the extension

```
Download or clone this repository to your computer.
```

If you have Git installed, run:
```bash
git clone https://github.com/your-username/savein.git
```

Or click the green **Code** button on GitHub → **Download ZIP**, then unzip the folder.

### Step 2 — Build it

You need [Node.js](https://nodejs.org/) (version 18 or newer) and [pnpm](https://pnpm.io/) installed on your computer.

Open a terminal in the SaveIn folder and run:

```bash
pnpm install
pnpm build
```

This creates a `dist` folder — that's the finished extension.

### Step 3 — Load into Chrome

1. Open Chrome and go to `chrome://extensions`
2. Turn on **Developer mode** (toggle in the top-right corner)
3. Click **Load unpacked**
4. Select the `dist` folder inside the SaveIn directory
5. Done! You'll see the SaveIn icon in your Chrome toolbar

### Step 4 — Go to LinkedIn

Open [linkedin.com](https://www.linkedin.com). You'll see a small floating save button appear — that's SaveIn ready to go.

---

## How to Use

### Saving Posts

You have **two ways** to save any LinkedIn post:

| Method | How |
|--------|-----|
| **Drag & Drop** | A floating button appears on LinkedIn. Drag it onto any post to save it. |
| **Auto-Save** | Just click LinkedIn's built-in **Save** button on any post — SaveIn captures it automatically. |

When you save a post, a small widget pops up letting you:
- Pick a **category** (Tech, Marketing, Design, Career, Leadership, or your own custom ones)
- Add **tags** (comma-separated)
- Write a **note**

### Viewing Your Saved Posts

Click the **SaveIn icon** in your Chrome toolbar, then click **Open Dashboard**.

The dashboard gives you:
- **All your saved posts** in a clean grid with author avatars and media previews
- **Search** — type to find posts by author name or content
- **Filter by category** — click any category to filter
- **Stats** — see your total posts, unique categories, unique authors, and posts saved this week
- **Dark mode** — toggle light/dark theme with one click

Click any post to open the **detail panel** where you can:
- Read the full post content
- Edit category, tags, and notes
- Export the post to Markdown
- Sync it to Notion
- Open the original post on LinkedIn
- Delete it

### Exporting Posts

From the dashboard you can export your posts in three ways:

| Export Type | What You Get |
|-------------|-------------|
| **Single Markdown** | One `.md` file for the currently selected post |
| **Bulk Markdown** | One combined `.md` file with ALL your saved posts |
| **Full JSON Backup** | Complete backup of everything — posts, categories, and settings |

---

## Notion Integration (Optional)

SaveIn can automatically sync your saved posts to a Notion database. Here's how to set it up:

### Step 1 — Create a Notion Integration

1. Go to [notion.so/profile/integrations](https://www.notion.so/profile/integrations)
2. Click **New integration**
3. **Important:** Make sure the type is **Internal** (not Public)
4. Give it a name (e.g. "SaveIn")
5. Select your workspace
6. Click **Save** and copy the **Internal Integration Token** (starts with `ntn_`)

### Step 2 — Prepare a Notion Database

1. Open Notion and create a **new full-page database** (or use any existing one)
2. Connect SaveIn to it: click the **`···`** menu on the database → **Connections** → select your "SaveIn" integration

> **You don't need to add any columns manually.** SaveIn will automatically create the required properties (Author, URL, Category, Date Saved, Tags, Note) when you connect.

### Step 3 — Connect in SaveIn

1. Open the SaveIn **Dashboard** (click extension icon → Open Dashboard)
2. Go to **Settings** (gear icon)
3. Paste your **Integration Token**
4. Paste the **Database URL** (copy it from your browser when viewing the database in Notion)
5. Click **Test Connection** — you should see your database name appear
6. Click **Save Settings**

### Step 4 — Start Syncing

You have two options:

| Mode | How it works |
|------|-------------|
| **Manual sync** | Click the "Sync to Notion" button on any individual post in the dashboard |
| **Auto-sync** | Toggle **Auto-sync** ON in Settings — every post you save is automatically pushed to Notion |

### Sync Features

- **No duplicates** — if a post URL already exists in your Notion database, SaveIn updates it instead of creating a new entry
- **Auto-retry** — if a sync fails (network issue, etc.), it automatically retries every 5 minutes
- **Bulk actions** — use "Sync All" to push all unsynced posts, or "Retry Failed" to retry only the ones that failed
- **Status badges** — each post shows its sync status: green (synced), amber (syncing), red (failed)
- **Sync stats** — see how many posts are synced, pending, failed, or unsynced right in Settings

---

## Features at a Glance

| Feature | Description |
|---------|-------------|
| Drag-to-Save | Floating button on LinkedIn — drag onto any post to save |
| Auto-Save | Hooks into LinkedIn's native Save button |
| Rich Extraction | Captures author, avatar, profile URL, post URL, images, full text, and timestamp |
| Categories | 5 built-in + unlimited custom color-coded categories |
| Tags & Notes | Free-form tags and notes on every post |
| Full-Text Search | Search by author name or post content instantly |
| Category Filter | Filter your library by category |
| Dashboard | Responsive grid with avatars, media previews, and relative timestamps |
| Detail Panel | Full post view with inline editing of category/tags/notes |
| Dark Mode | Light and dark themes, saved across sessions |
| Notion Sync | Auto-sync with smart deduplication, retry, and per-post status |
| Markdown Export | Export single posts or your entire library |
| JSON Backup | Full backup of all data in one file |
| Multi-page Support | Works on LinkedIn feed, profile pages, and group posts |
| Resilient Selectors | Uses stable DOM attributes — survives LinkedIn UI changes |

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| Floating button doesn't appear on LinkedIn | Reload the LinkedIn page. If that doesn't work, go to `chrome://extensions`, disable and re-enable SaveIn. |
| "Test Connection" fails with "Invalid token" | Make sure you copied the full token starting with `ntn_`. It should be from an **Internal** integration, not Public. |
| "Cannot access database" error | Open your Notion database → click `···` → **Connections** → make sure your integration is listed there. |
| Posts fail to sync with property errors | Click **Test Connection** again — this auto-creates any missing database properties. Then retry the sync. |
| Posts aren't auto-saving when I click LinkedIn's Save button | Make sure the extension is enabled and you're on `linkedin.com` (not a different subdomain). |

---

## For Developers

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript 5 |
| UI | React 18, Tailwind CSS, Radix UI, Lucide Icons |
| Build | Vite + @crxjs/vite-plugin |
| Runtime | Chrome Extension Manifest V3 |
| Storage | Chrome Storage API |
| Sync | Notion REST API |

### Development

```bash
# Development build with hot reload
pnpm dev

# Production build
pnpm build
```

### Project Structure

```
src/
├── background/        Service worker — storage, Notion sync, message routing
├── content/           Content scripts injected into linkedin.com
│   ├── domExtractor   Extracts post data from the LinkedIn DOM
│   ├── postScanner    Detects post elements across feed/profile/group pages
│   ├── uiInjector     Floating save button, widget overlay, auto-save hook
│   └── types          Shared data contracts
├── dashboard/         Full-page React dashboard app
├── popup/             Toolbar popup (post count + dashboard link)
├── components/ui/     Shared UI components
└── lib/               Utility functions
```

---

## License

MIT

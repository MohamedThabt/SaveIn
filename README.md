<div align="center">

# ✨ SaveIn

### Your Personal LinkedIn Content Library

**Save, organize, search, export, and sync your favorite LinkedIn posts — all from one powerful Chrome extension.**

<br />

[![Chrome MV3](https://img.shields.io/badge/Chrome-Manifest%20V3-4285F4?style=for-the-badge&logo=googlechrome&logoColor=white)](https://developer.chrome.com/docs/extensions/mv3/)
[![React 18](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Notion API](https://img.shields.io/badge/Notion-Sync-000000?style=for-the-badge&logo=notion&logoColor=white)](https://developers.notion.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />

[📖 **Documentation**](docs/) · [🐛 **Report Bug**](https://github.com/MohamedThaworworbt/SaveIn/issues) · [💡 **Request Feature**](https://github.com/MohamedThabt/SaveIn/issues)

<br />

---

</div>

<br />

## 🤔 The Problem

You stumble upon **incredible** LinkedIn posts every day — career advice, industry insights, useful frameworks, thought-provoking takes. You think *"I'll come back to this."*

**You never do.** It disappears into the infinite feed.

LinkedIn's built-in bookmarks? Buried, unsearchable, and impossible to organize.

## 💡 The Solution

**SaveIn** gives you a beautiful, searchable personal library for every LinkedIn post that matters. Save with a drag, organize with categories & tags, search instantly, export anywhere, and sync to Notion — all without leaving LinkedIn.

<br />

---

<br />

## 🚀 Features

<table>
<tr>
<td width="50%">

### 🎯 Effortless Saving
- **Drag & Drop** — floating button you drag onto any post
- **Auto-Save** — hooks into LinkedIn's native Save button
- **Rich Extraction** — author, avatar, profile URL, post URL, images, full text, timestamps

</td>
<td width="50%">

### 🗂️ Smart Organization
- **Categories** — 5 built-in + unlimited custom color-coded ones
- **Tags** — free-form, comma-separated tags on every post
- **Notes** — add personal notes and context to any post

</td>
</tr>
<tr>
<td width="50%">

### 📊 Beautiful Dashboard
- **Responsive Grid** — avatars, media previews, relative timestamps
- **Full-Text Search** — find posts by author or content instantly
- **Category Filters** — one-click filtering
- **Insights Stats** — total posts, unique categories, unique authors, weekly saves
- **Dark Mode** — toggle light/dark with one click

</td>
<td width="50%">

### ☁️ Notion Sync
- **Auto-Sync** — every saved post pushed to Notion automatically
- **Smart Deduplication** — updates existing entries, never creates duplicates
- **Auto-Retry** — failed syncs retried every 5 minutes
- **Status Badges** — green (synced), amber (syncing), red (failed)
- **Bulk Actions** — sync all or retry failed in one click

</td>
</tr>
<tr>
<td width="50%">

### 📤 Flexible Export
- **Single Markdown** — one `.md` file for a selected post
- **Bulk Markdown** — all posts in a single `.md` file
- **Full JSON Backup** — complete data backup with settings

</td>
<td width="50%">

### 🛡️ Built to Last
- **Multi-page Support** — feed, profiles, and group posts
- **Resilient Selectors** — survives LinkedIn UI changes
- **Local Storage** — your data stays on your device
- **Chrome MV3** — built on the latest extension platform

</td>
</tr>
</table>

<br />

---

<br />

## 📦 Installation

<details>
<summary><b>👤 For Users — Download & Install (No Coding Required)</b></summary>

<br />

1. **Download** the latest `savein-extension.zip` from the [Releases](https://github.com/MohamedThabt/SaveIn/releases) page
2. **Extract** the ZIP file
3. Open Chrome and navigate to **`chrome://extensions`**
4. Toggle **Developer mode** ON (top-right corner)
5. Click **Load unpacked**
6. Select the extracted `SaveIn` folder
7. Open [linkedin.com](https://www.linkedin.com) — you'll see SaveIn's floating save button! 🎉

> [!TIP]
> The ZIP contains everything you need — no build steps, no dependencies. Just unzip and load.

</details>

<details>
<summary><b>🛠️ For Developers — Build from Source</b></summary>

<br />

**Prerequisites:** [Node.js](https://nodejs.org/) (v18+) and [pnpm](https://pnpm.io/)

```bash
# Clone the repository
git clone https://github.com/MohamedThabt/SaveIn.git
cd SaveIn

# Install dependencies
pnpm install

# Start development server with hot reload
pnpm dev

# Production build
pnpm build

# Package for distribution
pnpm package:zip
```

The packaged extension will be at:
```
release/savein-extension.zip
```

Then load it in Chrome:
1. Go to `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** → select the `dist/` folder

> [!TIP]
> **New Developer?** Check out our dedicated [📚 Developer Documentation](docs/index.md) covering local setup, architecture, and code style!

</details>

<br />

---

<br />

## 📖 How to Use

### Step 1 — Save a Post

You have **two ways** to save any LinkedIn post:

| Method | How |
|:-------|:----|
| 🖱️ **Drag & Drop** | A floating button appears on LinkedIn. Drag it onto any post to save it instantly. |
| 💾 **Auto-Save** | Click LinkedIn's built-in **Save** button — SaveIn captures it automatically. |

When you save a post, a sleek widget pops up letting you:
- 🏷️ Pick a **category** (Tech, Marketing, Design, Career, Leadership, or your custom ones)
- 🔖 Add **tags** (comma-separated)
- 📝 Write a **note**

### Step 2 — Browse Your Library

Click the **SaveIn icon** in your Chrome toolbar → **Open Dashboard**

Your dashboard gives you a **bird's-eye view** of everything you've saved — with search, filters, stats, and dark mode.

### Step 3 — Dive Into a Post

Click any post card to open the **detail panel** where you can:

| Action | Description |
|:-------|:------------|
| 📖 **Read** | Full post content with rich formatting |
| ✏️ **Edit** | Category, tags, and notes inline |
| 📤 **Export** | Download as Markdown |
| ☁️ **Sync** | Push to Notion |
| 🔗 **Open** | Jump to the original post on LinkedIn |
| 🗑️ **Delete** | Remove from your library |

<br />

---

<br />

## ☁️ Notion Integration

> [!NOTE]
> Notion sync is **completely optional**. SaveIn works fully offline with Chrome's local storage.

<details>
<summary><b>🔧 Setup Guide (Click to Expand)</b></summary>

<br />

### 1️⃣ Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/profile/integrations/internal)
2. Click **New integration** → Type: **Internal**
3. Name it (e.g., "SaveIn") → Select your workspace
4. Click **Save** and copy the **Internal Integration Token** (starts with `ntn_`)

### 2️⃣ Prepare a Notion Database

1. Create a **new full-page database** in Notion (or use an existing one)
2. Connect SaveIn: click **`···`** → **Connections** → select your "SaveIn" integration

> [!TIP]
> You don't need to create any columns manually. SaveIn auto-creates the required properties (Author, URL, Category, Date Saved, Tags, Note) on first connection.

### 3️⃣ Connect in SaveIn

1. Open **Dashboard** → ⚙️ **Settings**
2. Paste your **Integration Token**
3. Paste the **Database URL** (from your browser address bar)
4. Click **Test Connection** — your database name should appear ✅
5. Click **Save Settings**

### 4️⃣ Start Syncing

| Mode | How |
|:-----|:----|
| **Manual** | Click "Sync to Notion" on any individual post |
| **Auto-Sync** | Toggle ON in Settings — every save auto-pushes to Notion |

### Sync Superpowers

- 🔄 **No duplicates** — existing posts are updated, not re-created
- 🔁 **Auto-retry** — failed syncs retry every 5 minutes
- ⚡ **Bulk actions** — "Sync All" or "Retry Failed" in one click
- 🟢 **Status badges** — see sync status at a glance (synced / syncing / failed)
- 📊 **Sync stats** — monitor synced, pending, and failed counts in Settings

</details>

<br />

---

<br />

## 🏗️ Architecture

```
SaveIn/
├── 🔧 manifest.json          Chrome MV3 manifest
├── 📄 popup.html              Toolbar popup entry
├── 📄 dashboard.html          Dashboard entry
├── 📁 src/
│   ├── 🧠 background/        Service worker — storage, Notion sync, message routing
│   ├── 🔍 content/            Content scripts injected into linkedin.com
│   │   ├── domExtractor       Extracts post data from the LinkedIn DOM
│   │   ├── postScanner        Detects post elements across feed/profile/group
│   │   ├── uiInjector         Floating save button, widget overlay, auto-save hook
│   │   └── types              Shared data contracts
│   ├── 📊 dashboard/          Full-page React dashboard app
│   ├── 🪟 popup/              Toolbar popup (post count + dashboard link)
│   ├── 🧩 components/ui/      Shared UI components (Radix UI + Tailwind)
│   └── 📚 lib/                Utility functions
├── 🎨 icons/                  Extension icons
└── 📁 release/                Packaged ZIP output
```

### Tech Stack

| Layer | Technology |
|:------|:-----------|
| **Language** | TypeScript 5 |
| **UI Framework** | React 18 |
| **Styling** | Tailwind CSS |
| **Components** | Radix UI + Lucide Icons |
| **Build Tool** | Vite + @crxjs/vite-plugin |
| **Runtime** | Chrome Extension Manifest V3 |
| **Storage** | Chrome Storage API (local) |
| **Sync** | Notion REST API |

> For a deeper dive into how these systems interact, see the [Architecture Overview](docs/architecture.md) in our developer docs.

<br />

---

<br />

## 🩺 Troubleshooting

<details>
<summary><b>Floating button doesn't appear on LinkedIn</b></summary>

1. Reload the LinkedIn page (`Ctrl + R`)
2. If that doesn't work → `chrome://extensions` → disable and re-enable SaveIn
3. Make sure you're on `https://www.linkedin.com` (not a subdomain)

</details>

<details>
<summary><b>"Test Connection" fails with "Invalid token"</b></summary>

- Ensure you copied the **full token** starting with `ntn_`
- Token must be from an **Internal** integration, not Public

</details>

<details>
<summary><b>"Cannot access database" error</b></summary>

- Open your Notion database → `···` → **Connections** → verify your integration is listed
- The integration must have access to the **specific database**, not just the workspace

</details>

<details>
<summary><b>Posts fail to sync with property errors</b></summary>

- Click **Test Connection** again — this auto-creates missing database properties
- Then retry the sync

</details>

<details>
<summary><b>Posts aren't auto-saving from LinkedIn's Save button</b></summary>

- Verify the extension is **enabled** in `chrome://extensions`
- Confirm you're on `linkedin.com` (not a different subdomain)
- Try refreshing the page

</details>

<br />

---

<br />

## 🤝 Contributing

Contributions are heavily encouraged and welcomed! 

Before writing code, please check out the comprehensive [Developer Documentation Guide](docs/index.md) which includes:
*   [Local Setup & Build instructions](docs/setup.md)
*   [Architectural Overview](docs/architecture.md)
*   [Code Style and Standards](docs/styling.md)
*   [Detailed Contributing Guidelines](docs/CONTRIBUTING.md)

1. **Fork** the repository
2. **Create** your feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

<br />

---

<br />

## 📄 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

<br />

---

<br />

<div align="center">

**Built with ❤️ + ☕ for the LinkedIn community**

If SaveIn helps you, consider giving it a ⭐ on GitHub!

<br />

[![GitHub Stars](https://img.shields.io/github/stars/MohamedThabt/SaveIn?style=social)](https://github.com/MohamedThabt/SaveIn)

</div>

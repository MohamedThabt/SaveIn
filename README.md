# SaveIn

A Chrome extension for saving, organizing, and exporting LinkedIn posts.

## Features

- **Drag-to-Save** — grab the floating button and drop it on any LinkedIn post to capture it instantly
- **Auto-Save** — click LinkedIn's native Save button and the post is captured automatically
- **Rich Extraction** — captures author name, profile URL, avatar, post URL, post media/image, text content, and timestamp using stable DOM selectors
- **Categories & Tags** — organize saved posts with color-coded labels and free-form tags
- **Full-Text Search** — find any post by author or content
- **Dashboard** — browse your library in a responsive grid with avatar images, media previews, and inline notes
- **Popup** — view and edit the latest saved post directly from the toolbar
- **Notion Integration** — push saved posts to a Notion database
- **Export** — download individual or bulk exports as Markdown or full JSON backup
- **Dark Mode** — toggle light/dark themes

## Tech Stack

- TypeScript, React 18, Vite
- Tailwind CSS, Radix UI, Lucide icons
- Chrome Extension Manifest V3
- Chrome Storage API for persistence

## Getting Started

```bash
# Install dependencies
pnpm install

# Development build with HMR
pnpm dev

# Production build
pnpm build
```

Load the extension in Chrome:

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select the `dist` directory

## Architecture

```
src/
  background/    Service worker — storage, Notion API, message routing
  content/       Content scripts injected into linkedin.com
    domExtractor  DOM-based post extraction (author, images, URN, content)
    postScanner   Post element detection across feed/profile/group pages
    uiInjector    Save widget overlay, floating cursor, auto-save listener
    types         Shared PostData contract
  dashboard/     Full-page React dashboard (dashboard.html)
  popup/         Toolbar popup (popup.html)
```

Posts are extracted using stable `data-view-name` and `data-view-tracking-scope` attributes rather than obfuscated class names, making the extension resilient to LinkedIn UI changes.

## License

MIT

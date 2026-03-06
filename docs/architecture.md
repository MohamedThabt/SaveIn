# Architecture Overview

SaveIn is a modern Chrome Extension built with Manifest V3 (MV3), React 18, and Vite. It is divided into three primary parts that communicate via the Chrome Message Passing API.

## 🏗️ Core Components

### 1. The Background Script (`src/background/`)
This is the central "brain" or service worker of the extension. It runs invisibly in the background.
*   **Role**: Handles data storage (saving to `chrome.storage.local`), asynchronous tasks like syncing to the Notion API, and acts as a central hub for messages.
*   **Key Files**:
    *   `index.ts`: The main entry point for the service worker.

### 2. The Content Scripts (`src/content/`)
These scripts are injected directly into `linkedin.com` pages.
*   **Role**: Manipulate the DOM to inject the "Save" floating buttons, extract data from posts (author, text, images, timestamp), and display the "Save Widget" overlay.
*   **Key Modules**:
    *   `domExtractor`: Contains the logic to pull text, images, and author metadata out of the specific HTML structure of LinkedIn posts.
    *   `postScanner`: Continuously watches the page (using `MutationObserver` or similar) to detect when new posts scroll into view.
    *   `uiInjector`: Actually inserts our React UI elements (like the Save button and category picker widget) over the LinkedIn interface.

### 3. The Dashboard & Popup (`src/dashboard/` & `src/popup/`)
These are fully standalone React applications that run in their own tabs/popups.
*   **Dashboard**: The full-page view where users can search, filter, and manage all their saved posts. It reads directly from Chrome storage.
*   **Popup**: The small UI that appears when clicking the extension icon in the Chrome toolbar. It typically shows quick stats and a link to open the full Dashboard.

## 🔄 Communication Flow

Because the Content Script (running on LinkedIn) cannot directly access the Notion API (due to CORS) or reliably run long-running tasks, it must talk to the Background Script.

1.  **User action**: User clicks "Save" on a post (Content Script).
2.  **Extraction**: The Content Script extracts the post data from the DOM.
3.  **Message Passing**: The Content Script sends a message (`chrome.runtime.sendMessage`) containing the post data to the Background Script.
4.  **Storage & Sync**: The Background Script saves the data to `chrome.storage.local` and (if enabled) pushes it to the Notion API.
5.  **UI Update**: The Dashboard, listening to storage changes or fetching on load, updates to display the new post.

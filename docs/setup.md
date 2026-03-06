# Local Setup & Build Guide

Follow these steps to set up the SaveIn project locally for development.

## 🛠️ Prerequisites

*   [Node.js](https://nodejs.org/) (version 18 or higher)
*   [pnpm](https://pnpm.io/) (we use pnpm instead of npm or yarn for faster, more reliable installs)
*   Google Chrome browser

## 📥 1. Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/MohamedThabt/SaveIn.git
    cd SaveIn
    ```

2.  **Install dependencies:**
    ```bash
    pnpm install
    ```

## 💻 2. Running for Development (Hot Reloading)

We use Vite with the `@crxjs/vite-plugin` to provide Hot Module Replacement (HMR) for the Chrome Extension. This means you can save a file and see changes instantly without reloading the extension manually.

```bash
pnpm dev
```

This command will clear out any old builds and generate a new `dist/` folder. It will keep running in your terminal to watch for changes.

## 🧩 3. Loading the Extension in Chrome

1.  Open Chrome and go to **`chrome://extensions`**.
2.  In the top right corner, toggle **Developer mode** to ON.
3.  Click the **Load unpacked** button in the top left.
4.  Select the `dist/` folder located inside your `SaveIn` project directory.
5.  You should now see the SaveIn extension listed!

Now, open a new tab to [linkedin.com](https://www.linkedin.com) and test it out. As you modify files in your editor, Vite will automatically update the unpacked extension in Chrome.

> [!WARNING]  
> Note: While HMR works great for the Dashboard and Popup (React apps), changes to the **Content Script** or **Background Service Worker** might occasionally require you to manually click the "Refresh" icon (↻) on the extension card in `chrome://extensions` and refresh the LinkedIn page.

## 🏗️ 4. Building for Production

When you are ready to prepare a final release build (minified and optimized):

```bash
pnpm build
```

This will run TypeScript checks (`tsc -b`) and then use Vite to produce an optimized build in the `dist/` folder.

To create a ZIP file ready to be uploaded to the Chrome Web Store or shared with users:

```bash
pnpm package:zip
```

The output file will be generated at `release/savein-extension.zip`.

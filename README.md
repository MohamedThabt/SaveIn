# SaveIn 🚀

**SaveIn** is a high-performance, professional-grade Chrome extension designed for elite content curation on LinkedIn. It empowers users to capture, organize, and archive valuable industry insights with a seamless, intuitive workflow.

---

## 🌟 Features

### 🖱️ Drag-to-Save Workflow
The signature feature of **SaveIn**. Simply grab the floating "Capture" button and drop it onto any LinkedIn post. Our intelligent **DOM Extractor** instantly identifies the post URN and author, even on LinkedIn's latest dynamic layouts.

### 🍱 Minimal & Clean
Focused on what matters. **SaveIn** captures the core identifiers:
- **Direct Share Link**: Accurate URLs for every post.
- **Original Author**: Captures the source, even from reposts.
- **Categorization**: Tag posts with professional labels (Tech, Design, Market, etc.).

### 📂 Sophisticated Dashboard
Manage your professional library in a stunning, modern interface:
- **Full-Text Search**: Find that specific insight in seconds.
- **Label Management**: Create and color-code custom categories.
- **Theme Support**: Seamless transition between Light and Dark modes.

### 🔗 Notion Integration
Push your curated library directly to your Notion workspace. Perfect for research, CRM tracking, or personal knowledge management.

---

## 🛠️ Technology Stack

- **React & TypeScript**: Robust, type-safe frontend components.
- **Vite**: Ultra-fast build tool for modern extension development.
- **Tailwind CSS**: Sleek, responsive design system.
- **Chrome Extension API (V3)**: Optimized for performance and privacy.
- **Radix UI & Lucide**: High-quality UI primitives and iconography.

---

## 🚀 Getting Started

### Installation
1.  Clone this repository.
2.  Install dependencies:
    ```bash
    pnpm install
    ```
3.  Build the project:
    ```bash
    pnpm build
    ```
4.  Load into Chrome:
    - Open `chrome://extensions/`
    - Enable **Developer mode**.
    - Click **Load unpacked** and select the `dist` directory.

---

## 📈 Architecture

**SaveIn** utilizes a lightweight **DOM-first architecture**. Instead of heavy background scanning, it uses a precise hit-testing algorithm for the drag-to-save interaction, ensuring zero performance impact on your browsing experience.

---

## 📄 License

MIT License - Copyright (c) 2026 SaveIn Team

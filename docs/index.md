# SaveIn — Developer Guide

Welcome to the SaveIn developer documentation! This guide will help you understand how the extension works under the hood so you can start contributing quickly.

## 🗂️ Documentation Sections

We have broken down the documentation into focused guides:

1. [**Architecture Overview**](architecture.md)
   *   Learn about the background script, content script, and dashboard, and how they communicate.
2. [**Local Setup & Build**](setup.md)
   *   Step-by-step instructions on setting up your local environment, building the project, and loading the unpacked extension in Chrome.
3. [**Contributing Guidelines**](CONTRIBUTING.md)
   *   How to create branches, format your code, and submit Pull Requests.
4. [**Code Style & Standards**](styling.md)
   *   Our guidelines for using React, Tailwind CSS, TypeScript, and Radix UI components.

## 🚀 Quick Start

If you already know what you're doing, the quick commands are:

```bash
# Clone the repository
git clone https://github.com/MohamedThabt/SaveIn.git
cd SaveIn

# Install dependencies
pnpm install

# Start development server with hot reload
pnpm dev
```

Then load the extension in Chrome:
1.  Navigate to `chrome://extensions`
2.  Enable **Developer mode**
3.  Click **Load unpacked**
4.  Select the `dist/` folder that was created by the `pnpm dev` command.

---

> [!TIP]
> If you are new to Chrome Extensions, we highly recommend reading the [Manifest V3 documentation](https://developer.chrome.com/docs/extensions/mv3/) first!

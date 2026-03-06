# Contributing to SaveIn

First off, thank you for considering contributing to SaveIn! We welcome contributions of all kinds, from bug reports to feature additions and documentation improvements.

## 💬 Where to Start?

*   **Found a bug?** Open an issue on GitHub describing the bug, steps to reproduce it, and the expected behavior.
*   **Have a feature idea?** Open an issue to discuss it first. This ensures we agree on the approach before you spend time writing code.
*   **Want to write code?** Look for issues labeled `good first issue` or `help wanted` in the Issue Tracker.

## 🌿 Branching Strategy

When creating a new branch, please follow these naming conventions:

*   `feature/your-feature-name` (for new additions)
*   `bugfix/issue-description` (for fixing existing bugs)
*   `docs/what-you-updated` (for documentation changes)
*   `chore/maintenance-task` (for refactoring, tooling updates, etc.)

Example:
```bash
git checkout -b feature/dark-mode-updates
```

## 💻 Making Changes

1.  Ensure you have followed the [Local Setup Guide](setup.md) to get the project running.
2.  Write your code. Ensure it is clean, well-commented, and types are strongly defined (no `any` in TypeScript unless absolutely necessary).
3.  Test your changes thoroughly:
    *   Does it work on the LinkedIn feed?
    *   Does it work on LinkedIn profile pages?
    *   Does the Dashboard still load correctly?
    *   Is the Notion Sync affected?
4.  Run a build to ensure there are no compilation errors: `pnpm build`

## 📬 Submitting a Pull Request (PR)

1.  Push your branch to your forked repository (or the main repo if you have access).
2.  Open a Pull Request against the `main` branch.
3.  In your PR description, explain:
    *   What problem you are solving (link to an issue if applicable).
    *   How you implemented the solution.
    *   How you tested it.
    *   Include *Before/After* screenshots or screen recordings if your change affects the UI!
4.  A maintainer will review your code. Please be open to feedback and requests for changes!

---

> [!NOTE]
> By submitting a PR, you agree to license your contribution under the project's [MIT License](../LICENSE).

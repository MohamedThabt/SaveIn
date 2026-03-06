# Code Style & Standards

We strive to keep the SaveIn codebase clean, modern, and highly maintainable. If you are contributing code, please adhere to the following standards.

## 📘 TypeScript

*   **Strict Typing**: We use TypeScript comprehensively. Avoid using `any`. Define proper `interface` or `type` aliases for all data structures (especially the shape of a Post, Notion API responses, and Chrome Messages).
*   **No Unused Variables**: Ensure your code is clean of dead code or unused imports before committing.

## ⚛️ React

*   **Functional Components**: Always use React functional components and hooks. We do not use Class components.
*   **Clean Architecture**: 
    *   Keep logic separate from the UI where possible.
    *   Use custom hooks (e.g., `usePosts`, `useSync`) to encapsulate complex data fetching or state management.
*   **Component Structure**: Place shared UI elements in `src/components/ui`. Place feature-specific components inside their respective feature folders (e.g., `src/dashboard/components`).

## 🎨 Styling (Tailwind CSS)

*   **Utility First**: We use Tailwind CSS for all styling. Avoid writing custom CSS in `.css` files unless absolutely necessary for complex animations or overrides that Tailwind cannot handle.
*   **clsx & tailwind-merge**: We heavily use `clsx` and `tailwind-merge` (often exported together via a `cn()` utility in `src/lib/utils.ts`) to conditionally join Tailwind classes properly without specificity conflicts.
    ```tsx
    // Good ✅
    <div className={cn("base-class", isActive && "bg-blue-500", className)} />
    ```

## 🧩 UI Components (Radix UI)

*   We use **Radix UI Primitives** for our complex interactive components (like Dialogs, Dropdowns, and Selects). This ensures our UI is fully accessible (a11y) out of the box.
*   When building a new interactive component, check if Radix UI has a primitive for it before building it from scratch.

## 🗃️ Chrome Extension APIs

*   Whenever possible, wrap Chrome APIs in Promises or use the Promise-based versions if available in modern MV3 setups (e.g., use `chrome.storage.local.get()` directly rather than the callback structure, if your types allow).
*   Always handle edge cases, such as when `chrome.runtime.lastError` is set.

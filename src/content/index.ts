/// <reference types="chrome" />

// ── Content Script — Hybrid Extraction Architecture ──
// Orchestrator: wires together all modules for the hybrid DOM + GraphQL approach.

import { initFloatingCursor, setupAutoSave } from './uiInjector.ts'

console.log('LinkedIn Saver: Content Script Loaded (DOM Architecture, Drag-to-Save)')

// ── 2. Inject CSS animations & floating cursor styles ──
const style = document.createElement('style')
style.textContent = `
  @keyframes lsFadeIn { from { opacity:0 } to { opacity:1 } }
  @keyframes lsSlideUp { from { opacity:0;transform:translateY(12px) } to { opacity:1;transform:translateY(0) } }
  
  .ls-floating-cursor {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 30px;
    background: #0a66c2;
    color: white;
    box-shadow: 0 4px 15px rgba(10, 102, 194, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: grab;
    z-index: 999999;
    transition: transform 0.2s, background 0.2s;
    user-select: none;
  }
  
  .ls-floating-cursor:hover {
    transform: scale(1.05);
    background: #004182;
  }
  
  .ls-floating-cursor:active {
    cursor: grabbing;
    transform: scale(0.95);
  }
  
  .ls-drag-active {
    pointer-events: none; /* Disable pointer events on cursor while dragging so we can find elements underneath */
    opacity: 0.9;
    box-shadow: 0 10px 25px rgba(10, 102, 194, 0.6);
  }
  
  .ls-drop-target-highlight {
    outline: 3px dashed #0a66c2 !important;
    outline-offset: -3px !important;
    background-color: rgba(10, 102, 194, 0.05) !important;
    transition: all 0.2s;
  }
`
document.head.appendChild(style)

// ── 3. Set up auto-save listener ──
setupAutoSave()

// ── 4. Initialize floating drag-to-save cursor ──
initFloatingCursor()

console.log('LinkedIn Saver: Drag-to-Drop Save active.')

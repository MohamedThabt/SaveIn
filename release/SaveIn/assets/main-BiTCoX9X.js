import{c as s,r as t,j as e,d as c,e as i}from"./createLucideIcon-xcDRT1Bq.js";/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const h=s("LayoutDashboard",[["rect",{width:"7",height:"9",x:"3",y:"3",rx:"1",key:"10lvy0"}],["rect",{width:"7",height:"5",x:"14",y:"3",rx:"1",key:"16une8"}],["rect",{width:"7",height:"9",x:"14",y:"12",rx:"1",key:"1hutg5"}],["rect",{width:"7",height:"5",x:"3",y:"16",rx:"1",key:"ldoo1y"}]]);/**
 * @license lucide-react v0.468.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const l=s("Save",[["path",{d:"M15.2 3a2 2 0 0 1 1.4.6l3.8 3.8a2 2 0 0 1 .6 1.4V19a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z",key:"1c8476"}],["path",{d:"M17 21v-7a1 1 0 0 0-1-1H8a1 1 0 0 0-1 1v7",key:"1ydtos"}],["path",{d:"M7 3v4a1 1 0 0 0 1 1h7",key:"t51u73"}]]);function x(){const[r,o]=t.useState(0);t.useEffect(()=>{chrome.storage.local.get(["posts"],d=>{const n=d.posts||{};o(Object.keys(n).length)})},[]);const a=()=>{chrome.tabs.create({url:chrome.runtime.getURL("dashboard.html")})};return e.jsxs("div",{className:"w-[320px] p-5 flex flex-col gap-5 bg-background text-foreground font-sans",children:[e.jsxs("div",{className:"flex items-center gap-3",children:[e.jsx("div",{className:"w-8 h-8 rounded-[10px] bg-primary text-primary-foreground flex items-center justify-center shadow-sm",children:e.jsx(l,{size:16})}),e.jsxs("div",{children:[e.jsx("h1",{className:"text-[15px] font-bold leading-none",children:"SaveIn"}),e.jsxs("p",{className:"text-[11px] text-muted-foreground mt-1",children:[r," posts saved"]})]})]}),e.jsxs("button",{onClick:a,className:"w-full py-2.5 bg-transparent border border-border text-foreground rounded-md text-sm font-semibold flex items-center justify-center gap-2 hover:bg-card transition-colors",children:[e.jsx(h,{size:14}),"Open Dashboard"]})]})}c.createRoot(document.getElementById("root")).render(e.jsx(i.StrictMode,{children:e.jsx(x,{})}));

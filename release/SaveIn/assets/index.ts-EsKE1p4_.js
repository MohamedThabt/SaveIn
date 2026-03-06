(function(){const A=[{name:"Tech",color:"#3b82f6"},{name:"Marketing",color:"#f59e0b"},{name:"Design",color:"#ec4899"},{name:"Career",color:"#10b981"},{name:"Leadership",color:"#8b5cf6"}];function v(e){var r,t,a,n,m,l;const o=e.getAttribute("data-view-tracking-scope")||((r=e.closest("[data-view-tracking-scope]"))==null?void 0:r.getAttribute("data-view-tracking-scope"));if(o)try{const i=JSON.parse(o.replace(/&quot;/g,'"'));for(const p of i)if((a=(t=p==null?void 0:p.breadcrumb)==null?void 0:t.content)!=null&&a.data&&Array.isArray(p.breadcrumb.content.data)){const g=p.breadcrumb.content.data.map(u=>String.fromCharCode(u)).join(""),f=JSON.parse(g);if(f.updateUrn)return f.updateUrn}}catch{}return e.getAttribute("data-urn")||((n=e.closest("[data-urn]"))==null?void 0:n.getAttribute("data-urn"))||e.getAttribute("data-id")||((m=e.closest("[data-id]"))==null?void 0:m.getAttribute("data-id"))||e.getAttribute("data-activity-urn")||((l=e.closest("[data-activity-urn]"))==null?void 0:l.getAttribute("data-activity-urn"))||null}function w(e){var t,a,n;const o=((t=e.querySelector("div.feed-shared-update-v2__description-wrapper"))==null?void 0:t.nextElementSibling)||((a=e.querySelector(".update-components-actor--with-control-menu"))==null?void 0:a.closest(".feed-shared-update-v2"))||((n=e.querySelector(".feed-shared-mini-update-v2"))==null?void 0:n.nextElementSibling)||null,r=Array.from(e.querySelectorAll(".update-components-actor"));return r.length>1?r[1].closest("div")||e:o||e}function q(e){const o=e.querySelector('[data-view-name="feed-control-menu"]');if(o){const i=(o.getAttribute("aria-label")||"").match(/post by (.+)/i);if(i&&i[1])return i[1].trim()}const r=Array.from(e.querySelectorAll(".update-components-actor")),t=r.length>1?r[1]:r[0]||w(e),a=t.querySelector('.update-components-actor__name, .feed-shared-actor__name, span[dir="ltr"]');if(a){const i=(a.innerText||a.textContent||"").split(`
`)[0].trim();if(i&&i.length>1)return i}const n=t.querySelectorAll("img[alt]");for(const l of Array.from(n)){const i=(l.getAttribute("alt")||"").trim();if(i.length>2&&i.length<60&&!/^(photo|image|logo|icon|banner|background)/i.test(i)&&!i.includes("emoji")&&!i.includes("http"))return i}const m=t.querySelectorAll('a[href*="/in/"], a[href*="/company/"]');for(const l of Array.from(m)){const i=l.getAttribute("href")||"",p=i.match(/\/in\/([^/?]+)/);if(p)return p[1].replace(/-/g," ").replace(/\b\w/g,g=>g.toUpperCase());const s=i.match(/\/company\/([^/?]+)/);if(s)return s[1].replace(/-/g," ").replace(/\b\w/g,g=>g.toUpperCase())}return t!==e?q(e):"Unknown"}function C(e){const o=Array.from(e.querySelectorAll(".update-components-actor")),r=o.length>1?o[1]:o[0]||w(e),t=r.querySelectorAll('a[href*="/in/"], a[href*="/company/"]');for(const a of Array.from(t)){const n=a.getAttribute("href")||"";if(n.includes("/in/")||n.includes("/company/"))return n.startsWith("http")?n.split("?")[0]:window.location.origin+n.split("?")[0]}return r!==e?C(e):null}function M(e){let o="";const r=e.querySelector(".feed-shared-update-v2__commentary");r&&(o=r.innerText||r.textContent||"",o=o.trim());let t="";const a=w(e),n=a.querySelector(".update-components-text, .feed-shared-update-v2__description, .feed-shared-text, .feed-shared-inline-show-more-text");if(n)t=n.innerText||n.textContent||"";else{const i=a.cloneNode(!0);i.querySelectorAll(".update-components-actor").forEach(p=>p.remove()),t=i.innerText||i.textContent||""}t=t.trim();const m=[];return o&&m.push(`[Commentary]:
${o}`),t&&m.push(t),m.join(`


--- Shared Post ---

`).trim()||"No text content found"}function $(e){for(const r of Array.from(e.querySelectorAll('a[href*="/feed/update/"], a[href*="/posts/"], a[href*="/activity/"]'))){const t=r.getAttribute("href")||"";if(t.includes("/feed/update/")||t.includes("/posts/")||t.includes("/activity/"))return(t.startsWith("http")?t:window.location.origin+t).split("?")[0]}const o=v(e);return o?`https://www.linkedin.com/feed/update/${o}/`:window.location.href}function k(e){const o=v(e);return o?o.split(":").pop()||`p_${Date.now()}`:`p_${Date.now()}_${Math.random().toString(36).substring(2,6)}`}function I(e){const o=e.querySelector("time");return(o==null?void 0:o.getAttribute("datetime"))||(o==null?void 0:o.dateTime)||null}function j(e){const o=e.querySelector('a[data-view-name="feed-actor-image"] figure img[src]');if(o!=null&&o.src)return o.src;const r=Array.from(e.querySelectorAll(".update-components-actor")),a=(r.length>1?r[1]:r[0]||e).querySelector("img[src]");return a!=null&&a.src&&a.width<=128?a.src:null}function _(e){const o=e.querySelector('a[data-view-name="feed-article"] figure img[src]');if(o!=null&&o.src)return o.src;const r=e.querySelector(".vjs-poster img[src]");if(r!=null&&r.src)return r.src;const t=e.querySelector(".update-components-image img[src]");return t!=null&&t.src?t.src:null}function L(e){return{id:k(e),urn:v(e),authorName:q(e),authorProfileUrl:C(e),authorImageUrl:j(e),postUrl:$(e),postImageUrl:_(e),content:M(e),timestamp:I(e),savedAt:null,category:null,categoryColor:null,note:null,tags:[]}}function P(e){if(!e)return null;const o=['[data-urn*="urn:li:activity"]',"div.feed-shared-update-v2","div.occludable-update","div.profile-creator-shared-feed-update__container","li.profile-creator-shared-feed-update__mini-container","div.groups-post-card",'div[data-urn*="urn:li:groupPost"]'].join(", ");let r=e.closest(o);if(!r){const t=e.closest('[role="listitem"]');t&&(t.querySelector('a[href*="/in/"]')||t.querySelector('a[href*="/company/"]'))&&t.clientHeight>150&&(r=t)}return r&&r.clientHeight>100?r:null}const h={};async function z(){return new Promise(e=>{try{chrome.runtime.sendMessage({action:"GET_CATEGORIES"},o=>{chrome.runtime.lastError||!o?e(A):e(o)})}catch{e(A)}})}async function T(e){return new Promise(o=>{try{chrome.runtime.sendMessage({action:"ADD_CATEGORY",payload:e},()=>o())}catch{o()}})}function N(e,o){const r=e.querySelector(".ls-widget-overlay");if(r){r.remove();return}const t=L(e),a=document.createElement("div");a.className="ls-widget-overlay",a.style.cssText=`
    position:absolute;top:0;right:0;bottom:0;left:0;z-index:10000;
    background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;
    border-radius:8px;animation:lsFadeIn 0.2s ease;
  `;const n=document.createElement("div");n.className="ls-save-widget",n.style.cssText=`
    background:#fff;border-radius:16px;padding:20px;width:320px;
    box-shadow:0 20px 60px rgba(0,0,0,0.2);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    color:#1a1a2e;position:relative;animation:lsSlideUp 0.25s ease;
  `,a.addEventListener("click",l=>{l.target===a&&a.remove()}),z().then(l=>{var s,g,f,u;n.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:8px;background:#0a66c2;display:flex;align-items:center;justify-content:center;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          </div>
          <span style="font-weight:700;font-size:14px;">Save Post</span>
        </div>
        <button class="ls-close" style="width:24px;height:24px;border-radius:6px;border:none;background:#f1f5f9;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:#64748b;">✕</button>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Category</label>
        <div class="ls-cat-grid" style="display:flex;flex-wrap:wrap;gap:6px;">
          ${l.map(c=>`
            <button class="ls-cat-btn" data-name="${c.name}" data-color="${c.color}" style="
              display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:20px;border:1.5px solid #e2e8f0;
              background:white;cursor:pointer;font-size:11px;font-weight:600;color:#334155;transition:all 0.15s;
            ">
              <span style="width:8px;height:8px;border-radius:50%;background:${c.color};display:inline-block;"></span>
              ${c.name}
            </button>
          `).join("")}
          <button class="ls-new-cat-btn" style="
            padding:6px 12px;border-radius:20px;border:1.5px dashed #cbd5e1;
            background:transparent;cursor:pointer;font-size:11px;font-weight:600;color:#94a3b8;transition:all 0.15s;
          ">+ New</button>
        </div>
      </div>

      <div class="ls-new-cat-form" style="display:none;margin-bottom:14px;padding:12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <input class="ls-new-cat-name" placeholder="Category name" style="
            flex:1;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;outline:none;
            font-family:inherit;background:white;
          ">
          <input class="ls-new-cat-color" type="color" value="#3b82f6" style="
            width:36px;height:34px;border:none;border-radius:8px;cursor:pointer;padding:0;background:transparent;
          ">
        </div>
        <button class="ls-add-cat" style="
          width:100%;padding:7px;border-radius:8px;border:none;background:#0a66c2;color:white;
          font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;
        ">Add Category</button>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Note (optional)</label>
        <textarea class="ls-note" placeholder="Why is this post important?" rows="2" style="
          width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:12px;
          outline:none;resize:none;font-family:inherit;box-sizing:border-box;line-height:1.5;background:white;
        "></textarea>
      </div>

      <button class="ls-save-btn" style="
        width:100%;padding:10px;border-radius:10px;border:none;background:#0a66c2;color:white;
        font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s;
        display:flex;align-items:center;justify-content:center;gap:6px;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Save Post
      </button>
    `;let i="",p="";n.querySelectorAll(".ls-cat-btn").forEach(c=>{c.addEventListener("click",()=>{n.querySelectorAll(".ls-cat-btn").forEach(x=>{x.style.border="1.5px solid #e2e8f0",x.style.background="white"});const d=c;i=d.dataset.name||"",p=d.dataset.color||"",d.style.border=`1.5px solid ${p}`,d.style.background=`${p}15`})}),(s=n.querySelector(".ls-new-cat-btn"))==null||s.addEventListener("click",()=>{const c=n.querySelector(".ls-new-cat-form");c.style.display=c.style.display==="none"?"block":"none"}),(g=n.querySelector(".ls-add-cat"))==null||g.addEventListener("click",async()=>{const c=n.querySelector(".ls-new-cat-name"),d=n.querySelector(".ls-new-cat-color"),x=c.value.trim();if(!x)return;const y={name:x,color:d.value};await T(y);const U=n.querySelector(".ls-cat-grid"),b=document.createElement("button");b.className="ls-cat-btn",b.dataset.name=y.name,b.dataset.color=y.color,b.style.cssText=`
        display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:20px;
        border:1.5px solid ${y.color};background:${y.color}15;
        cursor:pointer;font-size:11px;font-weight:600;color:#334155;transition:all 0.15s;
      `,b.innerHTML=`<span style="width:8px;height:8px;border-radius:50%;background:${y.color};display:inline-block;"></span>${y.name}`,U.insertBefore(b,n.querySelector(".ls-new-cat-btn")),i=y.name,p=y.color,b.addEventListener("click",()=>{n.querySelectorAll(".ls-cat-btn").forEach(S=>{S.style.border="1.5px solid #e2e8f0",S.style.background="white"}),b.style.border=`1.5px solid ${y.color}`,b.style.background=`${y.color}15`,i=y.name,p=y.color}),n.querySelector(".ls-new-cat-form").style.display="none",c.value=""}),(f=n.querySelector(".ls-close"))==null||f.addEventListener("click",()=>a.remove()),(u=n.querySelector(".ls-save-btn"))==null||u.addEventListener("click",()=>{const c=n.querySelector(".ls-note").value.trim();t.category=i||null,t.categoryColor=p||null,t.note=c||null,t.savedAt=new Date().toISOString();const d=n.querySelector(".ls-save-btn");d.textContent="Saving...",d.style.opacity="0.6";const x={id:t.id,urn:t.urn,url:t.postUrl,author:t.authorName,authorProfileUrl:t.authorProfileUrl,authorImageUrl:t.authorImageUrl,postImageUrl:t.postImageUrl,content:t.content,timestamp:t.timestamp,date_saved:t.savedAt,category:t.category,categoryColor:t.categoryColor,note:t.note,tags:t.tags};chrome.runtime.sendMessage({action:"SAVE_POST",payload:x},y=>{y!=null&&y.success?(h[t.id]=!0,d.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Saved!',d.style.background="#16a34a",d.style.opacity="1",setTimeout(()=>{a.remove()},1500)):(d.textContent="Error — try again",d.style.background="#dc2626",d.style.opacity="1")})})}),a.appendChild(n);const m=e;getComputedStyle(m).position==="static"&&(m.style.position="relative"),m.appendChild(a)}function D(){const e=document.querySelector(".ls-manual-overlay");if(e){e.remove();return}const o=document.createElement("div");o.className="ls-manual-overlay",o.style.cssText=`
    position:fixed;top:0;right:0;bottom:0;left:0;z-index:10001;
    background:rgba(0,0,0,0.4);backdrop-filter:blur(4px);
    display:flex;align-items:center;justify-content:center;
    animation:lsFadeIn 0.2s ease;
  `,o.addEventListener("click",t=>{t.target===o&&o.remove()});const r=document.createElement("div");r.style.cssText=`
    background:#fff;border-radius:16px;padding:20px;width:320px;
    box-shadow:0 20px 60px rgba(0,0,0,0.2);font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif;
    color:#1a1a2e;animation:lsSlideUp 0.25s ease;
  `,z().then(t=>{var m,l,i,p;r.innerHTML=`
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:16px;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:28px;height:28px;border-radius:8px;background:#0a66c2;display:flex;align-items:center;justify-content:center;">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </div>
          <span style="font-weight:700;font-size:14px;">Manual Add</span>
        </div>
        <button class="ls-m-close" style="width:24px;height:24px;border-radius:6px;border:none;background:#f1f5f9;cursor:pointer;display:flex;align-items:center;justify-content:center;font-size:14px;color:#64748b;">✕</button>
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Author <span style="color:#ef4444">*</span></label>
        <input class="ls-m-author" placeholder="e.g. John Doe" style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;outline:none;font-family:inherit;box-sizing:border-box;">
      </div>

      <div style="margin-bottom:12px;">
        <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Content</label>
        <textarea class="ls-m-content" placeholder="Paste the post content here..." rows="3" style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:12px;outline:none;resize:none;font-family:inherit;box-sizing:border-box;line-height:1.5;background:white;"></textarea>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Post URL</label>
        <input class="ls-m-url" placeholder="https://linkedin.com/..." style="width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;outline:none;font-family:inherit;box-sizing:border-box;">
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:8px;">Category</label>
        <div class="ls-m-cat-grid" style="display:flex;flex-wrap:wrap;gap:6px;">
          ${t.map(s=>`
            <button class="ls-m-cat-btn" data-name="${s.name}" data-color="${s.color}" style="
              display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:20px;border:1.5px solid #e2e8f0;
              background:white;cursor:pointer;font-size:11px;font-weight:600;color:#334155;transition:all 0.15s;
            ">
              <span style="width:8px;height:8px;border-radius:50%;background:${s.color};display:inline-block;"></span>
              ${s.name}
            </button>
          `).join("")}
          <button class="ls-m-new-cat-btn" style="
            padding:6px 12px;border-radius:20px;border:1.5px dashed #cbd5e1;
            background:transparent;cursor:pointer;font-size:11px;font-weight:600;color:#94a3b8;transition:all 0.15s;
          ">+ New</button>
        </div>
      </div>

      <div class="ls-m-new-cat-form" style="display:none;margin-bottom:14px;padding:12px;background:#f8fafc;border-radius:10px;border:1px solid #e2e8f0;">
        <div style="display:flex;gap:8px;margin-bottom:8px;">
          <input class="ls-m-new-cat-name" placeholder="Category name" style="
            flex:1;padding:7px 10px;border:1.5px solid #e2e8f0;border-radius:8px;font-size:12px;outline:none;
            font-family:inherit;background:white;
          ">
          <input class="ls-m-new-cat-color" type="color" value="#3b82f6" style="
            width:36px;height:34px;border:none;border-radius:8px;cursor:pointer;padding:0;background:transparent;
          ">
        </div>
        <button class="ls-m-add-cat" style="
          width:100%;padding:7px;border-radius:8px;border:none;background:#0a66c2;color:white;
          font-size:11px;font-weight:600;cursor:pointer;font-family:inherit;
        ">Add Category</button>
      </div>

      <div style="margin-bottom:14px;">
        <label style="display:block;font-size:11px;font-weight:600;color:#64748b;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">Note (optional)</label>
        <textarea class="ls-m-note" placeholder="Why is this post important?" rows="2" style="
          width:100%;padding:8px 10px;border:1.5px solid #e2e8f0;border-radius:10px;font-size:12px;
          outline:none;resize:none;font-family:inherit;box-sizing:border-box;line-height:1.5;background:white;
        "></textarea>
      </div>

      <button class="ls-m-save" style="
        width:100%;padding:10px;border-radius:10px;border:none;background:#0a66c2;color:white;
        font-size:13px;font-weight:700;cursor:pointer;font-family:inherit;transition:all 0.15s;
        display:flex;align-items:center;justify-content:center;gap:6px;
      ">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Post
      </button>
    `;let a="",n="";r.querySelectorAll(".ls-m-cat-btn").forEach(s=>{s.addEventListener("click",()=>{r.querySelectorAll(".ls-m-cat-btn").forEach(f=>{f.style.border="1.5px solid #e2e8f0",f.style.background="white"});const g=s;a=g.dataset.name||"",n=g.dataset.color||"",g.style.border=`1.5px solid ${n}`,g.style.background=`${n}15`})}),(m=r.querySelector(".ls-m-new-cat-btn"))==null||m.addEventListener("click",()=>{const s=r.querySelector(".ls-m-new-cat-form");s.style.display=s.style.display==="none"?"block":"none"}),(l=r.querySelector(".ls-m-add-cat"))==null||l.addEventListener("click",async()=>{const s=r.querySelector(".ls-m-new-cat-name"),g=r.querySelector(".ls-m-new-cat-color"),f=s.value.trim();if(!f)return;const u={name:f,color:g.value};await T(u);const c=r.querySelector(".ls-m-cat-grid"),d=document.createElement("button");d.className="ls-m-cat-btn",d.dataset.name=u.name,d.dataset.color=u.color,d.style.cssText=`
        display:flex;align-items:center;gap:5px;padding:6px 12px;border-radius:20px;
        border:1.5px solid ${u.color};background:${u.color}15;
        cursor:pointer;font-size:11px;font-weight:600;color:#334155;transition:all 0.15s;
      `,d.innerHTML=`<span style="width:8px;height:8px;border-radius:50%;background:${u.color};display:inline-block;"></span>${u.name}`,c.insertBefore(d,r.querySelector(".ls-m-new-cat-btn")),a=u.name,n=u.color,d.addEventListener("click",()=>{r.querySelectorAll(".ls-m-cat-btn").forEach(x=>{x.style.border="1.5px solid #e2e8f0",x.style.background="white"}),d.style.border=`1.5px solid ${u.color}`,d.style.background=`${u.color}15`,a=u.name,n=u.color}),r.querySelector(".ls-m-new-cat-form").style.display="none",s.value=""}),(i=r.querySelector(".ls-m-close"))==null||i.addEventListener("click",()=>o.remove()),(p=r.querySelector(".ls-m-save"))==null||p.addEventListener("click",()=>{const s=r.querySelector(".ls-m-author").value.trim(),g=r.querySelector(".ls-m-content").value.trim(),f=r.querySelector(".ls-m-url").value.trim(),u=r.querySelector(".ls-m-note").value.trim();if(!s)return;const c=r.querySelector(".ls-m-save");c.textContent="Adding...",c.style.opacity="0.6";const d={id:`m_${Date.now()}`,url:f,author:s,content:g,date_saved:new Date().toISOString(),category:a||null,categoryColor:n||null,note:u||null,tags:[]};chrome.runtime.sendMessage({action:"SAVE_POST",payload:d},x=>{x!=null&&x.success?(c.innerHTML='<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg> Added!',c.style.background="#16a34a",c.style.opacity="1",setTimeout(()=>o.remove(),1200)):(c.textContent="Error — try again",c.style.background="#dc2626",c.style.opacity="1")})})}),o.appendChild(r),document.body.appendChild(o)}function B(){const e=document.createElement("div");e.className="ls-floating-cursor",e.innerHTML='<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',e.title="Drag to a post to save",document.body.appendChild(e);let o=0,r=0,t=30,a=30,n=!1,m=!0,l=null;const i=s=>{if(n||(Math.abs(s.clientX-o)>5||Math.abs(s.clientY-r)>5)&&(n=!0,m=!1,e.classList.add("ls-drag-active")),n){const g=o-s.clientX,f=r-s.clientY;e.style.right=`${t+g}px`,e.style.bottom=`${a+f}px`;const u=document.elementFromPoint(s.clientX,s.clientY),c=P(u);l&&l!==c&&l.classList.remove("ls-drop-target-highlight"),c?(c.classList.add("ls-drop-target-highlight"),l=c):l=null}},p=s=>{if(document.removeEventListener("mousemove",i),document.removeEventListener("mouseup",p),n){if(e.classList.remove("ls-drag-active"),e.style.transition="all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",e.style.right="30px",e.style.bottom="30px",l){l.classList.remove("ls-drop-target-highlight");const g=k(l);if(h[g]){const f=e.innerHTML;e.innerHTML='<span style="font-size:12px;font-weight:bold;">Saved!</span>',setTimeout(()=>{e.innerHTML=f,e.style.transition="transform 0.2s, background 0.2s"},2e3)}else N(l),setTimeout(()=>{e.style.transition="transform 0.2s, background 0.2s"},400);l=null}else setTimeout(()=>{e.style.transition="transform 0.2s, background 0.2s"},400);t=30,a=30,n=!1}else m&&(D(),e.style.transform="scale(1.1)",setTimeout(()=>e.style.transform="",150))};e.addEventListener("mousedown",s=>{s.button===0&&(s.preventDefault(),o=s.clientX,r=s.clientY,m=!0,document.addEventListener("mousemove",i),document.addEventListener("mouseup",p))})}function H(){document.addEventListener("click",e=>{const o=e.target.closest("button");if(!o||!(o.getAttribute("aria-label")||"").toLowerCase().includes("save"))return;const t=o.closest('[role="listitem"]')||o.closest("[data-urn]");if(!t)return;const a=k(t);if(h[a])return;const n=L(t);n.savedAt=new Date().toISOString();const m={id:n.id,urn:n.urn,url:n.postUrl,author:n.authorName,authorProfileUrl:n.authorProfileUrl,authorImageUrl:n.authorImageUrl,postImageUrl:n.postImageUrl,content:n.content,timestamp:n.timestamp,date_saved:n.savedAt,category:null,tags:[]};chrome.runtime.sendMessage({action:"SAVE_POST",payload:m},l=>{l!=null&&l.success&&(h[a]=!0)})},!0)}console.log("LinkedIn Saver: Content Script Loaded (DOM Architecture, Drag-to-Save)");const E=document.createElement("style");E.textContent=`
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
`;document.head.appendChild(E);H();B();console.log("LinkedIn Saver: Drag-to-Drop Save active.");
})()

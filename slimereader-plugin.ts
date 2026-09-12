/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

function init() {
    $ui.register((ctx) => {
        console.log("[slime-reader] $ui.register() called.");

        function getScript(scriptId: string): string {
            return `(async function() {
    console.log("[slime-reader] Injected script running. id=${scriptId}");

    if (document.getElementById("sr-backdrop")) {
        console.log("[slime-reader] Already open, skipping.");
        return;
    }

    // ── Hide Seanime layout ──────────────────────────────────────
    const _layout = document.querySelector(".UI-AppLayout__root");
    if (_layout) _layout.style.display = "none";

    // ── VOLUMES ──────────────────────────────────────────────────
    const BASE = "https://tensurafan.github.io";
    const VOLUMES = [
        { id:"v6",    name:"Volume 6",                path:"/ln/v6.html",    emoji:"🟢", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"interlude",label:"Interlude"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v7",    name:"Volume 7",                path:"/ln/v7.html",    emoji:"⚔️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"chapter-7",label:"Chapter 7"},{id:"chapter-8",label:"Chapter 8"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v8",    name:"Volume 8",                path:"/ln/v8.html",    emoji:"🌀", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"chapter-7",label:"Chapter 7"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v8_5",  name:"Volume 8.5 Side Stories", path:"/ln/v8.5.html",  emoji:"📖", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v9",    name:"Volume 9",                path:"/ln/v9.html",    emoji:"🌿", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v10",   name:"Volume 10",               path:"/ln/v10.html",   emoji:"💥", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"chapter-7",label:"Chapter 7"},{id:"chapter-8",label:"Chapter 8"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v11",   name:"Volume 11",               path:"/ln/v11.html",   emoji:"👑", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v12",   name:"Volume 12",               path:"/ln/v12.html",   emoji:"🔒", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v13",   name:"Volume 13",               path:"/ln/v13.html",   emoji:"🗺️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v13_5", name:"Volume 13.5 Side Stories",path:"/ln/v13.5.html", emoji:"📖", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v14",   name:"Volume 14",               path:"/ln/v14.html",   emoji:"🌪️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v15",   name:"Volume 15",               path:"/ln/v15.html",   emoji:"🏚️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v16",   name:"Volume 16 (Edited MTL)",  path:"/ln/v16.html",   emoji:"🌌", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v17",   name:"Volume 17 (Edited MTL)",  path:"/ln/v17.html",   emoji:"🐉", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v18",   name:"Volume 18 (Edited MTL)",  path:"/ln/v18.html",   emoji:"⚡", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v19",   name:"Volume 19 (Edited MTL)",  path:"/ln/v19.html",   emoji:"🌟", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v20",   name:"Volume 20 (Edited MTL)",  path:"/ln/v20.html",   emoji:"✨", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"epilogue",label:"Epilogue"}]},
        { id:"b1",    name:"Special Booklets 1–4",    path:"/ln/b1.html",    emoji:"📚", chapters:[{id:"booklet-1",label:"Booklet 1"},{id:"booklet-2",label:"Booklet 2"},{id:"booklet-3",label:"Booklet 3"},{id:"booklet-4",label:"Booklet 4"}]},
        { id:"b5",    name:"Special Booklets 5–8",    path:"/ln/b5.html",    emoji:"📚", chapters:[{id:"booklet-5",label:"Booklet 5"},{id:"booklet-6",label:"Booklet 6"},{id:"booklet-7",label:"Booklet 7"},{id:"booklet-8",label:"Booklet 8"}]},
    ];

    // ── PROGRESS ─────────────────────────────────────────────────
    const Prog = {
        get: id => { try { return JSON.parse(localStorage.getItem("sr4_" + id)) || null; } catch(_){ return null; } },
        set: (id, pct) => { localStorage.setItem("sr4_" + id, JSON.stringify({scrollPct: pct})); }
    };

    // ── SETTINGS ─────────────────────────────────────────────────
    const DEF_S = { theme:"dark", fontSize:18, lineHeight:1.85, fontFamily:"Georgia,serif", maxWidth:760 };
    let _settings = null;
    function getSettings() {
        if (!_settings) { try { _settings = Object.assign({}, DEF_S, JSON.parse(localStorage.getItem("sr4_settings") || "{}")); } catch(_){ _settings = {...DEF_S}; } }
        return _settings;
    }
    function saveSettings() { localStorage.setItem("sr4_settings", JSON.stringify(_settings)); }
    function applySettings() {
        const s = getSettings();
        const THEMES = { dark:{bg:"#0d1117",txt:"#e2e8f0"}, sepia:{bg:"#f4ecd8",txt:"#5b4636"}, light:{bg:"#f5f5f5",txt:"#1a1a1a"} };
        const t = THEMES[s.theme] || THEMES.dark;
        const rc = document.getElementById("sr-content");
        const rw = document.getElementById("sr-cw");
        if (rc) { rc.style.fontSize=s.fontSize+"px"; rc.style.lineHeight=s.lineHeight; rc.style.fontFamily=s.fontFamily; rc.style.maxWidth=s.maxWidth+"px"; rc.style.color=t.txt; }
        if (rw) rw.style.background = t.bg;
        document.querySelectorAll(".sr-tbtn").forEach(b => b.style.outline = b.dataset.theme===s.theme?"2px solid #7ee8a2":"");
        const fsl=document.getElementById("sr-fsl"); if(fsl) fsl.textContent=s.fontSize;
        const lhl=document.getElementById("sr-lhl"); if(lhl) lhl.textContent=s.lineHeight;
        const mwl=document.getElementById("sr-mwl"); if(mwl) mwl.textContent=s.maxWidth;
        const fss=document.getElementById("sr-fs"); if(fss) fss.value=s.fontSize;
        const lhs=document.getElementById("sr-lh"); if(lhs) lhs.value=s.lineHeight;
        const mws=document.getElementById("sr-mw"); if(mws) mws.value=s.maxWidth;
        const ffs=document.getElementById("sr-ffs"); if(ffs) ffs.value=s.fontFamily;
    }

    // ── VOLUME CACHE ──────────────────────────────────────────────
    const _vcache = {};
    async function fetchVolume(vol) {
        if (_vcache[vol.id]) return _vcache[vol.id];
        const url = BASE + vol.path;
        console.log("[slime-reader] Fetching", url);
        const res = await fetch(url, {mode:"cors", credentials:"omit"});
        if (!res.ok) throw new Error("HTTP " + res.status + " for " + url);
        let html = await res.text();
        // Clean up template expressions: keep fallback text
        html = html.replace(/\{:[^|]*:\}\|([^|]*)\|/g, "$1");
        html = html.replace(/\{[^}|]*\}\|([^|]*)\|/g, "$1");
        // Fix image URLs to be absolute
        html = html.replace(/src="\/ln\//g, 'src="' + BASE + '/ln/');
        _vcache[vol.id] = html;
        return html;
    }

    function extractChapter(fullHtml, anchorId, nextAnchorId) {
        const tmp = document.createElement("div");
        tmp.innerHTML = fullHtml;
        const start = tmp.querySelector("#" + anchorId);
        if (!start) return "<p style='color:#f0883e;padding:20px'>Section <code>#" + anchorId + "</code> not found. The chapter list anchors may differ from this volume — scroll or try another chapter.</p>";
        const stop = nextAnchorId ? tmp.querySelector("#" + nextAnchorId) : null;
        const out = document.createElement("div");
        let node = start;
        while (node) {
            const next = node.nextSibling;
            if (stop && node === stop) break;
            out.appendChild(node.cloneNode(true));
            node = next;
        }
        return out.innerHTML;
    }

    // ── SCROLL ───────────────────────────────────────────────────
    function getPct() { const w=document.getElementById("sr-cw"); if(!w||w.scrollHeight<=w.clientHeight) return 0; return Math.round(w.scrollTop/(w.scrollHeight-w.clientHeight)*1000)/10; }
    function restorePct(pct) { if(!pct||pct<=0) return; const w=document.getElementById("sr-cw"); if(!w) return; setTimeout(()=>{ w.scrollTop=(pct/100)*(w.scrollHeight-w.clientHeight); }, 200); }

    // ── STATE ────────────────────────────────────────────────────
    let _page = "home", _vol = null, _chIdx = 0, _saveTimer = null;
    function stopSave() { if(_saveTimer){clearInterval(_saveTimer);_saveTimer=null;} }
    function startSave(id) { stopSave(); _saveTimer = setInterval(()=>Prog.set(id,getPct()),3000); }

    // ── CSS ──────────────────────────────────────────────────────
    const styleEl = document.createElement("style");
    styleEl.id = "sr-style";
    styleEl.textContent = \`
#sr-backdrop{position:fixed;inset:0;z-index:99999;background:#0d1117;display:flex;flex-direction:column;font-family:-apple-system,"Segoe UI",system-ui,sans-serif;color:#e2e8f0;}
#sr-bar{display:flex;align-items:center;gap:10px;padding:10px 18px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0;min-height:48px;}
.sr-logo{font-weight:700;font-size:.95rem;color:#7ee8a2;white-space:nowrap;}
#sr-close-btn,#sr-back-btn,#sr-cfg-btn{background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 10px;border-radius:6px;cursor:pointer;font-size:.82rem;}
#sr-close-btn:hover,#sr-back-btn:hover,#sr-cfg-btn:hover{background:#21262d;color:#e2e8f0;}
#sr-back-btn{display:none;}
#sr-back-btn.v{display:inline-flex;align-items:center;gap:4px;}
#sr-cfg-btn{display:none;}
#sr-cfg-btn.v{display:inline-flex;align-items:center;}
#sr-bar-title{flex:1;font-size:.82rem;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
#sr-close-btn{margin-left:auto;}
#sr-main{flex:1;overflow-y:auto;overflow-x:hidden;}
#sr-home{padding:24px 20px;max-width:1050px;margin:0 auto;}
.sr-hero{background:linear-gradient(135deg,#1a2332,#0d2137);border:1px solid #30363d;border-radius:12px;padding:28px 36px;margin-bottom:28px;display:flex;align-items:center;gap:24px;}
.sr-hero-ico{font-size:48px;flex-shrink:0;}
.sr-hero h1{font-size:1.35rem;font-weight:800;color:#7ee8a2;margin:0 0 5px;}
.sr-hero p{color:#8b949e;font-size:.85rem;line-height:1.55;margin:0;}
.sr-cont{background:#161b22;border:1px solid #7ee8a28c;border-radius:9px;padding:13px 16px;margin-bottom:24px;display:flex;align-items:center;gap:13px;cursor:pointer;}
.sr-cont:hover{border-color:#7ee8a2;}
.sr-cont-info{flex:1;}
.sr-cont-tag{font-size:.65rem;color:#7ee8a2;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:2px;}
.sr-cont-title{font-weight:700;color:#c9d1d9;font-size:.95rem;}
.sr-cont-sub{color:#8b949e;font-size:.78rem;margin-top:2px;}
.sr-cont-btn{background:#7ee8a2;color:#0d1117;border:none;padding:6px 14px;border-radius:6px;font-weight:700;cursor:pointer;font-size:.8rem;white-space:nowrap;}
.sr-sec{font-size:.88rem;font-weight:700;color:#c9d1d9;margin:0 0 13px;display:flex;align-items:center;gap:8px;}
.sr-sec::after{content:"";flex:1;height:1px;background:#21262d;}
.sr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(138px,1fr));gap:13px;margin-bottom:32px;}
.sr-card{background:#161b22;border:1px solid #21262d;border-radius:9px;overflow:hidden;cursor:pointer;transition:all .18s;position:relative;}
.sr-card:hover{border-color:#7ee8a2;transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.4);}
.sr-cover{width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.8rem;border-bottom:1px solid #21262d;position:relative;}
.sr-vnum{font-size:.54rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7ee8a2;background:rgba(0,0,0,.75);padding:2px 6px;border-radius:3px;position:absolute;top:6px;left:6px;}
.sr-rdg{position:absolute;top:6px;right:6px;background:#7ee8a2;color:#0d1117;font-size:.5rem;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:3px;}
.sr-pb{position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.1);}
.sr-pbf{height:100%;background:#7ee8a2;}
.sr-vinfo{padding:8px 10px 11px;}
.sr-vname{font-size:.74rem;font-weight:600;color:#c9d1d9;line-height:1.3;margin-bottom:2px;}
.sr-vsub{font-size:.64rem;color:#6e7681;}
#sr-vol-page{padding:24px 20px;max-width:820px;margin:0 auto;}
.sr-vhdr{display:flex;gap:16px;margin-bottom:22px;padding-bottom:16px;border-bottom:1px solid #21262d;}
.sr-vhdr-ico{width:84px;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);border-radius:6px;display:flex;align-items:center;justify-content:center;font-size:1.9rem;border:1px solid #30363d;flex-shrink:0;}
.sr-vhdr-meta h2{font-size:1.1rem;font-weight:700;color:#c9d1d9;margin:0 0 4px;}
.sr-vhdr-meta p{color:#8b949e;font-size:.8rem;margin:0 0 8px;}
.sr-prog-line{font-size:.74rem;color:#7ee8a2;margin-bottom:7px;}
.sr-cta{background:#7ee8a2;color:#0d1117;border:none;padding:6px 13px;border-radius:6px;font-weight:700;cursor:pointer;font-size:.8rem;}
.sr-chlist{display:flex;flex-direction:column;gap:3px;}
.sr-chitem{display:flex;align-items:center;gap:9px;padding:10px 13px;background:#161b22;border:1px solid #21262d;border-radius:7px;cursor:pointer;transition:all .13s;}
.sr-chitem:hover{background:#1c2128;border-color:#30363d;}
.sr-chdot{width:6px;height:6px;border-radius:50%;background:#30363d;flex-shrink:0;}
.sr-chtitle{flex:1;font-size:.84rem;color:#c9d1d9;}
#sr-reader-page{display:flex;flex-direction:column;height:100%;overflow:hidden;}
#sr-rnav{display:flex;align-items:center;gap:6px;padding:7px 12px;background:#161b22;border-bottom:1px solid #21262d;flex-shrink:0;}
#sr-rnav button{background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:.78rem;white-space:nowrap;}
#sr-rnav button:hover:not(:disabled){background:#30363d;}
#sr-rnav button:disabled{opacity:.3;cursor:not-allowed;}
#sr-chsel{flex:1;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 8px;border-radius:5px;font-size:.78rem;}
#sr-cw{flex:1;overflow-y:auto;overflow-x:hidden;background:#0d1117;}
#sr-content{max-width:760px;margin:0 auto;padding:32px 24px 80px;font-size:18px;line-height:1.85;color:#e2e8f0;font-family:"Georgia",serif;}
#sr-content p{margin-bottom:1.1em;}
#sr-content img{max-width:100%;border-radius:6px;margin:10px auto;display:block;}
#sr-content h1{font-family:system-ui,sans-serif;color:#7ee8a2;margin:1.3em 0 .4em;font-size:1.4rem;}
#sr-content .full{width:100%;height:auto;}
#sr-content a{color:#7ee8a2;}
#sr-content .no-indent{text-indent:0;}
#sr-content .credits-entry,#sr-content .credits-entry-space{font-size:.84rem;color:#8b949e;margin-bottom:.35em;}
#sr-content .pagebreak{margin:0;padding:0;height:0;border:none;}
#sr-cfg-panel{position:absolute;top:48px;right:0;width:250px;background:#161b22;border:1px solid #30363d;border-radius:0 0 0 10px;padding:13px;z-index:200;display:none;box-shadow:-4px 4px 20px rgba(0,0,0,.6);}
#sr-cfg-panel.open{display:block;}
.sr-sr{margin-bottom:12px;}
.sr-sr label{display:block;font-size:.68rem;color:#8b949e;margin-bottom:4px;text-transform:uppercase;letter-spacing:.06em;}
.sr-sr input[type=range]{width:100%;accent-color:#7ee8a2;}
.sr-sr select{width:100%;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:4px 7px;border-radius:5px;font-size:.78rem;}
.sr-trow{display:flex;gap:5px;}
.sr-tbtn{flex:1;padding:5px;border-radius:5px;border:2px solid #30363d;cursor:pointer;font-size:.68rem;font-weight:600;}
.sr-tbtn[data-theme=dark]{background:#0d1117;color:#e2e8f0;}
.sr-tbtn[data-theme=sepia]{background:#f4ecd8;color:#5b4636;}
.sr-tbtn[data-theme=light]{background:#f5f5f5;color:#1a1a1a;}
.sr-spin{display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:12px;}
.sr-ring{width:34px;height:34px;border:3px solid #21262d;border-top-color:#7ee8a2;border-radius:50%;animation:sr-spin .7s linear infinite;}
@keyframes sr-spin{to{transform:rotate(360deg)}}
.sr-spin p{color:#6e7681;font-size:.84rem;}
.sr-err{margin:30px auto;max-width:420px;background:#1c1c1c;border:1px solid #f0883e55;border-radius:9px;padding:18px;text-align:center;color:#f0883e;}
.sr-err p{margin-top:6px;color:#8b949e;font-size:.82rem;}
.sr-err a{color:#f0883e;}
.sr-err button{margin-top:12px;background:#f0883e;color:#fff;border:none;padding:6px 14px;border-radius:5px;cursor:pointer;font-weight:600;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px;}
\`;
    document.head.appendChild(styleEl);

    // ── BUILD SHELL ───────────────────────────────────────────────
    const bd = document.createElement("div");
    bd.id = "sr-backdrop";
    bd.innerHTML = \`
<div id="sr-bar">
  <span class="sr-logo">🟢 Slime Reader</span>
  <button id="sr-back-btn">&#8249; Back</button>
  <span id="sr-bar-title"></span>
  <button id="sr-cfg-btn">⚙</button>
  <button id="sr-close-btn">✕</button>
</div>
<div id="sr-cfg-panel">
  <div class="sr-sr"><label>Theme</label><div class="sr-trow">
    <button class="sr-tbtn" data-theme="dark">Dark</button>
    <button class="sr-tbtn" data-theme="sepia">Sepia</button>
    <button class="sr-tbtn" data-theme="light">Light</button>
  </div></div>
  <div class="sr-sr"><label>Font Size: <span id="sr-fsl">18</span>px</label><input type="range" id="sr-fs" min="13" max="28" value="18"></div>
  <div class="sr-sr"><label>Line Height: <span id="sr-lhl">1.85</span></label><input type="range" id="sr-lh" min="1.2" max="2.5" step="0.05" value="1.85"></div>
  <div class="sr-sr"><label>Font</label><select id="sr-ffs"><option value="Georgia,serif">Georgia</option><option value="system-ui,sans-serif">Sans-Serif</option><option value="'Courier New',monospace">Mono</option></select></div>
  <div class="sr-sr"><label>Width: <span id="sr-mwl">760</span>px</label><input type="range" id="sr-mw" min="400" max="1100" step="20" value="760"></div>
</div>
<div id="sr-main">
  <div id="sr-home"></div>
  <div id="sr-vol-page" style="display:none"></div>
  <div id="sr-reader-page" style="display:none;height:100%;flex-direction:column;">
    <div id="sr-rnav">
      <button id="sr-prev">← Prev</button>
      <select id="sr-chsel"></select>
      <button id="sr-next">Next →</button>
    </div>
    <div id="sr-cw"><div id="sr-content"></div></div>
  </div>
</div>\`;
    document.body.appendChild(bd);
    console.log("[slime-reader] Backdrop appended.");

    // ── PAGE HELPERS ─────────────────────────────────────────────
    function showPage(id) {
        const pages = ["sr-home","sr-vol-page","sr-reader-page"];
        pages.forEach(p => {
            const el = document.getElementById(p);
            if (!el) return;
            if (p === id) { el.style.display = (p==="sr-reader-page") ? "flex" : "block"; }
            else { el.style.display = "none"; }
        });
    }
    function setTitle(t) { const el=document.getElementById("sr-bar-title"); if(el) el.textContent=t; }

    // ── HOME ──────────────────────────────────────────────────────
    function renderHome() {
        _page="home"; stopSave();
        showPage("sr-home");
        document.getElementById("sr-back-btn").classList.remove("v");
        document.getElementById("sr-cfg-btn").classList.remove("v");
        setTitle("");

        let contVol=null, contProg=null;
        for (const v of VOLUMES) { const p=Prog.get(v.id); if(p&&p.scrollPct>0){contVol=v;contProg=p;break;} }

        let contHtml="";
        if (contVol&&contProg) {
            contHtml = \`<div class="sr-cont" id="sr-cont-banner">
              <div class="sr-cont-info">
                <div class="sr-cont-tag">Continue Reading</div>
                <div class="sr-cont-title">\${contVol.name}</div>
                <div class="sr-cont-sub">\${contProg.scrollPct}% through</div>
              </div>
              <button class="sr-cont-btn" data-id="\${contVol.id}">Resume ›</button>
            </div>\`;
        }

        const cards = VOLUMES.map(v => {
            const p = Prog.get(v.id);
            const pct = p ? p.scrollPct : 0;
            return \`<div class="sr-card" data-id="\${v.id}">
              <div class="sr-cover">\${v.emoji}
                <span class="sr-vnum">\${v.id}</span>
                \${pct>0?'<span class="sr-rdg">Reading</span>':""}
                <div class="sr-pb"><div class="sr-pbf" style="width:\${pct}%"></div></div>
              </div>
              <div class="sr-vinfo">
                <div class="sr-vname">\${v.name}</div>
                <div class="sr-vsub">\${v.chapters.length} ch</div>
              </div>
            </div>\`;
        }).join("");

        document.getElementById("sr-home").innerHTML = \`
          <div class="sr-hero">
            <div class="sr-hero-ico">🟢</div>
            <div>
              <h1>That Time I Got Reincarnated as a Slime</h1>
              <p>Fan-translated LNs · Vols 6–20 + Side Stories · Progress auto-saved</p>
            </div>
          </div>
          \${contHtml}
          <div class="sr-sec">All Volumes</div>
          <div class="sr-grid">\${cards}</div>\`;

        document.getElementById("sr-home").querySelectorAll(".sr-card").forEach(c => {
            c.addEventListener("click", () => { const v=VOLUMES.find(x=>x.id===c.dataset.id); if(v) renderVol(v); });
        });
        const cb = document.getElementById("sr-cont-banner");
        if (cb && contVol) {
            cb.addEventListener("click", () => renderReader(contVol, 0, contProg.scrollPct));
        }
    }

    // ── VOLUME PAGE ───────────────────────────────────────────────
    function renderVol(vol) {
        _page="volume"; _vol=vol; stopSave();
        showPage("sr-vol-page");
        document.getElementById("sr-back-btn").classList.add("v");
        document.getElementById("sr-cfg-btn").classList.remove("v");
        setTitle(vol.name);

        const prog = Prog.get(vol.id);
        const chHtml = vol.chapters.map((ch,i) => \`
          <div class="sr-chitem" data-idx="\${i}">
            <div class="sr-chdot"></div>
            <span class="sr-chtitle">\${ch.label}</span>
          </div>\`).join("");

        document.getElementById("sr-vol-page").innerHTML = \`
          <div class="sr-vhdr">
            <div class="sr-vhdr-ico">\${vol.emoji}</div>
            <div class="sr-vhdr-meta">
              <h2>\${vol.name}</h2>
              <p>\${vol.chapters.length} chapters</p>
              \${prog&&prog.scrollPct>0?\`<div class="sr-prog-line">\${prog.scrollPct}% read</div><button class="sr-cta" id="sr-volcont">Continue</button>\`:""}
            </div>
          </div>
          <div class="sr-sec">Chapters</div>
          <div class="sr-chlist">\${chHtml}</div>\`;

        document.getElementById("sr-vol-page").querySelectorAll(".sr-chitem").forEach(item => {
            item.addEventListener("click", () => renderReader(vol, parseInt(item.dataset.idx)));
        });
        const vcb = document.getElementById("sr-volcont");
        if (vcb && prog) vcb.addEventListener("click", () => renderReader(vol, 0, prog.scrollPct));
    }

    // ── READER ────────────────────────────────────────────────────
    let _saveTimer2 = null;
    async function renderReader(vol, chIdx, resumePct) {
        _page="reader"; _vol=vol; _chIdx=chIdx; stopSave();
        showPage("sr-reader-page");
        document.getElementById("sr-back-btn").classList.add("v");
        document.getElementById("sr-cfg-btn").classList.add("v");

        const ch = vol.chapters[chIdx];
        setTitle(vol.name + " · " + ch.label);

        const sel = document.getElementById("sr-chsel");
        sel.innerHTML = vol.chapters.map((c,i)=>\`<option value="\${i}"\${i===chIdx?" selected":""}>\${c.label}</option>\`).join("");
        document.getElementById("sr-prev").disabled = chIdx===0;
        document.getElementById("sr-next").disabled = chIdx===vol.chapters.length-1;

        document.getElementById("sr-content").innerHTML = \`<div class="sr-spin"><div class="sr-ring"></div><p>Loading \${ch.label}…</p></div>\`;

        try {
            const fullHtml = await fetchVolume(vol);
            const nextCh = vol.chapters[chIdx+1];
            const chunk = extractChapter(fullHtml, ch.id, nextCh ? nextCh.id : null);
            document.getElementById("sr-content").innerHTML = chunk;
            applySettings();

            if (typeof resumePct === "number" && resumePct > 0) {
                restorePct(resumePct);
            } else {
                document.getElementById("sr-cw").scrollTop = 0;
            }

            Prog.set(vol.id, getPct());
            startSave(vol.id);
        } catch(err) {
            console.error("[slime-reader] Fetch error:", err);
            document.getElementById("sr-content").innerHTML = \`<div class="sr-err">
              <strong>⚠️ Failed to load</strong>
              <p>\${err.message}</p>
              <p><a href="\${BASE+vol.path}" target="_blank">Open in browser</a></p>
              <button onclick="renderReader(_vol,_chIdx)">Retry</button>
            </div>\`;
        }
    }

    // ── EVENTS ────────────────────────────────────────────────────
    document.getElementById("sr-close-btn").addEventListener("click", cleanup);
    window.addEventListener("keydown", function _esc(e){ if(e.key==="Escape"){e.preventDefault();cleanup();window.removeEventListener("keydown",_esc);} });

    document.getElementById("sr-back-btn").addEventListener("click", () => {
        if (_page==="reader") { Prog.set(_vol.id, getPct()); renderVol(_vol); }
        else if (_page==="volume") { renderHome(); }
    });

    document.getElementById("sr-cfg-btn").addEventListener("click", e => {
        e.stopPropagation();
        document.getElementById("sr-cfg-panel").classList.toggle("open");
    });
    document.addEventListener("click", e => {
        const p = document.getElementById("sr-cfg-panel");
        if (p&&p.classList.contains("open")&&!p.contains(e.target)&&e.target.id!=="sr-cfg-btn")
            p.classList.remove("open");
    });

    document.getElementById("sr-prev").addEventListener("click", () => {
        if (_chIdx>0){ Prog.set(_vol.id,getPct()); renderReader(_vol,_chIdx-1); }
    });
    document.getElementById("sr-next").addEventListener("click", () => {
        if (_chIdx<_vol.chapters.length-1){ Prog.set(_vol.id,getPct()); renderReader(_vol,_chIdx+1); }
    });
    document.getElementById("sr-chsel").addEventListener("change", e => {
        const i=parseInt(e.target.value);
        if(i!==_chIdx){ Prog.set(_vol.id,getPct()); renderReader(_vol,i); }
    });

    // Settings controls
    document.querySelectorAll(".sr-tbtn").forEach(b => {
        b.addEventListener("click", () => { getSettings().theme=b.dataset.theme; saveSettings(); applySettings(); });
    });
    function bindSl(slId, lblId, key, parse) {
        const el=document.getElementById(slId); if(!el) return;
        el.addEventListener("input", () => { getSettings()[key]=parse(el.value); document.getElementById(lblId).textContent=getSettings()[key]; saveSettings(); applySettings(); });
    }
    bindSl("sr-fs","sr-fsl","fontSize",v=>parseInt(v));
    bindSl("sr-lh","sr-lhl","lineHeight",v=>parseFloat(v));
    bindSl("sr-mw","sr-mwl","maxWidth",v=>parseInt(v));
    const ffs=document.getElementById("sr-ffs");
    if(ffs) ffs.addEventListener("change",()=>{ getSettings().fontFamily=ffs.value; saveSettings(); applySettings(); });

    // ── CLEANUP ───────────────────────────────────────────────────
    function cleanup() {
        stopSave();
        const layout = document.querySelector(".UI-AppLayout__root");
        if (layout) layout.style.display = "";
        document.getElementById("sr-backdrop")?.remove();
        document.getElementById("sr-style")?.remove();
        console.log("[slime-reader] Cleaned up.");
    }

    // ── BOOT ──────────────────────────────────────────────────────
    applySettings();
    renderHome();
    console.log("[slime-reader] Ready.");

})();`;
        }

        const tray = ctx.newTray({
            tooltipText: "Slime Reader",
            iconUrl: "data:image/svg+xml," + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ee8a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
            ),
            withContent: false,
        });

        tray.onClick(async () => {
            console.log("[slime-reader] Tray clicked.");
            try {
                if (await ctx.dom.queryOne("#sr-backdrop")) {
                    console.log("[slime-reader] Already open.");
                    return;
                }
                const body = await ctx.dom.queryOne("body");
                if (!body) {
                    console.error("[slime-reader] body not found!");
                    return;
                }
                const scriptId = "sr-" + Date.now();
                const script = await ctx.dom.createElement("script");
                script.setAttribute("data-sr-id", scriptId);
                script.setText(getScript(scriptId));
                body.append(script);
                console.log("[slime-reader] Script injected:", scriptId);
            } catch (err) {
                console.error("[slime-reader] Error:", err);
            }
        });
    });
}

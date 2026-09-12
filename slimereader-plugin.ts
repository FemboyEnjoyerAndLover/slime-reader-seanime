/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

// =============================================================================
// Slime Reader – Seanime Plugin  v3.0
// Reads pre-compiled volume HTMLs from https://tensurafan.github.io/ln/vX.html
// All volumes are single HTML files with chapter anchor IDs inside them.
// Progress is saved to localStorage (scroll % per volume).
// =============================================================================

function init() {
    $ui.register((ctx) => {

        function getInjectedScript(): string {
            return `(async function() {
    if (document.getElementById("sr-backdrop")) return;

    // =========================================================
    // VOLUME CATALOGUE  (from ln/volumes.json, progress:100 only)
    // URL: https://tensurafan.github.io/ln/vX.html
    // =========================================================
    const BASE = "https://tensurafan.github.io";
    const VOLUMES = [
        { id:"v6",    name:"Volume 6",                  path:"/ln/v6.html",    emoji:"🟢", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"interlude",label:"Interlude"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v7",    name:"Volume 7",                  path:"/ln/v7.html",    emoji:"⚔️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"chapter-7",label:"Chapter 7"},{id:"chapter-8",label:"Chapter 8"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v8",    name:"Volume 8",                  path:"/ln/v8.html",    emoji:"🌀", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"chapter-7",label:"Chapter 7"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v8_5",  name:"Volume 8.5 Side Stories",   path:"/ln/v8.5.html",  emoji:"📖", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v9",    name:"Volume 9",                  path:"/ln/v9.html",    emoji:"🌿", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v10",   name:"Volume 10",                 path:"/ln/v10.html",   emoji:"💥", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"chapter-7",label:"Chapter 7"},{id:"chapter-8",label:"Chapter 8"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v11",   name:"Volume 11",                 path:"/ln/v11.html",   emoji:"👑", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v12",   name:"Volume 12",                 path:"/ln/v12.html",   emoji:"🔒", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v13",   name:"Volume 13",                 path:"/ln/v13.html",   emoji:"🗺️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"chapter-6",label:"Chapter 6"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v13_5", name:"Volume 13.5 Side Stories",  path:"/ln/v13.5.html", emoji:"📖", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v14",   name:"Volume 14",                 path:"/ln/v14.html",   emoji:"🌪️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"chapter-5",label:"Chapter 5"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v15",   name:"Volume 15",                 path:"/ln/v15.html",   emoji:"🏚️", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"},{id:"afterword",label:"Afterword"}]},
        { id:"v16",   name:"Volume 16 (Edited MTL)",    path:"/ln/v16.html",   emoji:"🌌", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v17",   name:"Volume 17 (Edited MTL)",    path:"/ln/v17.html",   emoji:"🐉", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v18",   name:"Volume 18 (Edited MTL)",    path:"/ln/v18.html",   emoji:"⚡", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"chapter-4",label:"Chapter 4"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v19",   name:"Volume 19 (Edited MTL)",    path:"/ln/v19.html",   emoji:"🌟", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"epilogue",label:"Epilogue"}]},
        { id:"v20",   name:"Volume 20 (Edited MTL)",    path:"/ln/v20.html",   emoji:"✨", chapters:[{id:"prologue",label:"Prologue"},{id:"chapter-1",label:"Chapter 1"},{id:"chapter-2",label:"Chapter 2"},{id:"chapter-3",label:"Chapter 3"},{id:"epilogue",label:"Epilogue"}]},
        { id:"b1",    name:"Special Booklets 1–4",      path:"/ln/b1.html",    emoji:"📚", chapters:[{id:"booklet-1",label:"Booklet 1"},{id:"booklet-2",label:"Booklet 2"},{id:"booklet-3",label:"Booklet 3"},{id:"booklet-4",label:"Booklet 4"}]},
        { id:"b5",    name:"Special Booklets 5–8",      path:"/ln/b5.html",    emoji:"📚", chapters:[{id:"booklet-5",label:"Booklet 5"},{id:"booklet-6",label:"Booklet 6"},{id:"booklet-7",label:"Booklet 7"},{id:"booklet-8",label:"Booklet 8"}]},
    ];

    // =========================================================
    // VOLUME CACHE  (fetched HTML stored here, keyed by vol id)
    // =========================================================
    const _cache = {};

    // =========================================================
    // PROGRESS
    // =========================================================
    const Prog = {
        key: v => "sr3_prog_" + v,
        get: v => { try { return JSON.parse(localStorage.getItem(Prog.key(v))) || null; } catch(_){return null;} },
        set: (v, scrollPct) => { localStorage.setItem(Prog.key(v), JSON.stringify({scrollPct})); }
    };

    // =========================================================
    // SETTINGS
    // =========================================================
    const DEF = { theme:"dark", fontSize:18, lineHeight:1.85, fontFamily:"Georgia, serif", maxWidth:760 };
    const S = {
        d: null,
        get() { if (!S.d) { try { S.d = Object.assign({}, DEF, JSON.parse(localStorage.getItem("sr3_settings"))); } catch(_){ S.d = {...DEF}; } } return S.d; },
        save() { try { localStorage.setItem("sr3_settings", JSON.stringify(S.d)); } catch(_){} },
        apply() {
            const s = S.get();
            const T = { dark:{bg:"#0d1117",txt:"#e2e8f0"}, sepia:{bg:"#f4ecd8",txt:"#5b4636"}, light:{bg:"#f5f5f5",txt:"#1a1a1a"} };
            const t = T[s.theme]||T.dark;
            const rc = $("sr-content"), rw = $("sr-cw");
            if (rc) { rc.style.fontSize=s.fontSize+"px"; rc.style.lineHeight=s.lineHeight; rc.style.fontFamily=s.fontFamily; rc.style.maxWidth=s.maxWidth+"px"; rc.style.color=t.txt; }
            if (rw) rw.style.background = t.bg;
            document.querySelectorAll(".sr-tbtn").forEach(b=>b.classList.toggle("sr-ta",b.dataset.theme===s.theme));
            _sl("sr-fsl","sr-fsl","fontSize","sr-fs"); _sl("sr-lhl","sr-lhl","lineHeight","sr-lh"); _sl("sr-mwl","sr-mwl","maxWidth","sr-mw");
            const ff=$("sr-ffs"); if(ff) ff.value=s.fontFamily;
        }
    };
    function _sl(lblId, inputId, key, sliderId) {
        const l=$("sr-"+lblId.replace("sr-","")), sl=$("sr-"+sliderId.replace("sr-",""));
        if(l) l.textContent = S.get()[key];
        if(sl) sl.value = S.get()[key];
    }

    // =========================================================
    // CLEAN TEMPLATE STRINGS from the site's own template system
    // Pattern: {:expr:}|fallback| → show fallback text
    //           {expr}|fallback|  → show fallback text
    // =========================================================
    function cleanHtml(html) {
        // Strip template expressions, keep fallback (the part after the last | before closing |)
        // Pattern: {:...:|fallback| or {:...:}|fallback|
        html = html.replace(/\{:.*?:\}\|([^|]*)\|/g, "$1");
        html = html.replace(/\{[^}]*\}\|([^|]*)\|/g, "$1");
        // Remove any leftover { } template bits
        html = html.replace(/\{:[^}]*:\}/g, "");
        // Fix image src: /ln/sources/... → absolute URL
        html = html.replace(/src="\/ln\//g, 'src="' + BASE + '/ln/');
        // Fix href anchors on hlinks to just be hash-only (they already are #xxx)
        return html;
    }

    // =========================================================
    // FETCH VOLUME (with cache)
    // =========================================================
    async function fetchVolume(vol) {
        if (_cache[vol.id]) return _cache[vol.id];
        const url = BASE + vol.path;
        const res = await fetch(url, {mode:"cors",credentials:"omit"});
        if (!res.ok) throw new Error("HTTP " + res.status + " fetching " + url);
        const raw = await res.text();
        _cache[vol.id] = cleanHtml(raw);
        return _cache[vol.id];
    }

    // =========================================================
    // EXTRACT CHAPTER CONTENT between two anchor IDs
    // The HTML has <... id="chapter-1"...> tags as anchors.
    // We find that element and grab everything until the next
    // chapter anchor or end of document.
    // =========================================================
    function extractChapter(fullHtml, anchorId, nextAnchorId) {
        const tmp = document.createElement("div");
        tmp.innerHTML = fullHtml;

        const start = tmp.querySelector("#"+anchorId);
        if (!start) {
            // Anchor not found — return a helpful message
            return "<p style='color:#f0883e'>Chapter section <code>#"+anchorId+"</code> not found in this volume.</p><p>The chapter list may not exactly match this volume's structure. Please use the scroll bar to navigate.</p>";
        }

        const stopEl = nextAnchorId ? tmp.querySelector("#"+nextAnchorId) : null;
        const result = document.createDocumentFragment();
        let node = start;
        while (node) {
            const nextNode = node.nextSibling;
            if (stopEl && node === stopEl) break;
            result.appendChild(node.cloneNode(true));
            node = nextNode;
        }
        const wrapper = document.createElement("div");
        wrapper.appendChild(result);
        return wrapper.innerHTML;
    }

    // =========================================================
    // SCROLL HELPERS
    // =========================================================
    function getPct() { const w=$("sr-cw"); if(!w||w.scrollHeight<=w.clientHeight) return 0; return Math.round(w.scrollTop/(w.scrollHeight-w.clientHeight)*1000)/10; }
    function restorePct(pct) { if(!pct||pct<=0) return; const w=$("sr-cw"); if(!w) return; setTimeout(()=>{ w.scrollTop=(pct/100)*(w.scrollHeight-w.clientHeight); },150); }

    // =========================================================
    // APP STATE
    // =========================================================
    const App = { page:"home", vol:null, chIdx:0, saveTimer:null };
    function stopSave() { if(App.saveTimer){clearInterval(App.saveTimer);App.saveTimer=null;} }
    function startSave(volId) { stopSave(); App.saveTimer=setInterval(()=>Prog.set(volId,getPct()),3000); }

    // =========================================================
    // CSS
    // =========================================================
    const CSS = \`
#sr-backdrop{position:fixed;inset:0;z-index:99999;background:#0d1117;display:flex;flex-direction:column;font-family:-apple-system,"Segoe UI",system-ui,sans-serif;color:#e2e8f0;}
#sr-bar{display:flex;align-items:center;gap:10px;padding:10px 18px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0;}
.sr-logo{display:flex;align-items:center;gap:7px;font-weight:700;font-size:1rem;color:#7ee8a2;white-space:nowrap;}
#sr-close-btn{margin-left:auto;background:transparent;border:1px solid #30363d;color:#8b949e;width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;}
#sr-close-btn:hover{background:#21262d;color:#e2e8f0;}
#sr-back-btn{background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 11px;border-radius:6px;cursor:pointer;font-size:.82rem;display:none;align-items:center;gap:5px;}
#sr-back-btn:hover{background:#21262d;color:#e2e8f0;}
#sr-back-btn.srv{display:flex;}
#sr-bar-title{flex:1;font-size:.85rem;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
#sr-cfg-btn{background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 8px;border-radius:6px;cursor:pointer;display:none;align-items:center;}
#sr-cfg-btn:hover{background:#21262d;}
#sr-cfg-btn.srv{display:flex;}
#sr-main{flex:1;overflow-y:auto;overflow-x:hidden;position:relative;}
/* HOME */
#sr-home{padding:28px 22px;max-width:1100px;margin:0 auto;}
.sr-hero{background:linear-gradient(135deg,#1a2332,#0d2137,#1a1a2e);border:1px solid #30363d;border-radius:14px;padding:32px 40px;margin-bottom:32px;display:flex;align-items:center;gap:28px;}
.sr-hero-ico{font-size:52px;filter:drop-shadow(0 0 16px rgba(126,232,162,.35));flex-shrink:0;}
.sr-hero h1{font-size:1.45rem;font-weight:800;color:#7ee8a2;margin:0 0 6px;}
.sr-hero p{color:#8b949e;font-size:.88rem;line-height:1.6;margin:0;}
.sr-cont{background:#161b22;border:1px solid #7ee8a28c;border-radius:10px;padding:14px 18px;margin-bottom:28px;display:flex;align-items:center;gap:14px;cursor:pointer;transition:border-color .2s;}
.sr-cont:hover{border-color:#7ee8a2;}
.sr-cont-info{flex:1;}
.sr-cont-tag{font-size:.68rem;color:#7ee8a2;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:3px;}
.sr-cont-title{font-weight:700;color:#c9d1d9;font-size:.98rem;}
.sr-cont-sub{color:#8b949e;font-size:.8rem;margin-top:2px;}
.sr-cont-cta{background:#7ee8a2;color:#0d1117;border:none;padding:7px 15px;border-radius:7px;font-weight:700;cursor:pointer;white-space:nowrap;font-size:.82rem;}
.sr-sec{font-size:.9rem;font-weight:700;color:#c9d1d9;margin:0 0 14px;display:flex;align-items:center;gap:8px;}
.sr-sec::after{content:"";flex:1;height:1px;background:#21262d;}
.sr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:14px;margin-bottom:36px;}
.sr-card{background:#161b22;border:1px solid #21262d;border-radius:10px;overflow:hidden;cursor:pointer;transition:all .2s;position:relative;}
.sr-card:hover{border-color:#7ee8a2;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.4);}
.sr-cover{width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:1.9rem;border-bottom:1px solid #21262d;position:relative;}
.sr-vnum{font-size:.56rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7ee8a2;background:rgba(0,0,0,.75);padding:2px 6px;border-radius:3px;position:absolute;top:6px;left:6px;}
.sr-rdg{position:absolute;top:6px;right:6px;background:#7ee8a2;color:#0d1117;font-size:.52rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;padding:2px 5px;border-radius:3px;}
.sr-pb{position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.1);}
.sr-pbf{height:100%;background:#7ee8a2;transition:width .3s;}
.sr-vinfo{padding:8px 10px 11px;}
.sr-vname{font-size:.76rem;font-weight:600;color:#c9d1d9;line-height:1.3;margin-bottom:2px;}
.sr-vsub{font-size:.66rem;color:#6e7681;}
/* VOL PAGE */
#sr-vol{padding:26px 22px;max-width:840px;margin:0 auto;}
.sr-vhdr{display:flex;gap:18px;margin-bottom:24px;padding-bottom:18px;border-bottom:1px solid #21262d;}
.sr-vhdr-ico{width:90px;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:2rem;border:1px solid #30363d;flex-shrink:0;}
.sr-vhdr-meta h2{font-size:1.15rem;font-weight:700;color:#c9d1d9;margin:0 0 4px;}
.sr-vhdr-meta p{color:#8b949e;font-size:.82rem;margin:0 0 8px;}
.sr-prog-line{font-size:.76rem;color:#7ee8a2;margin-bottom:8px;}
.sr-cta{background:#7ee8a2;color:#0d1117;border:none;padding:6px 14px;border-radius:7px;font-weight:700;cursor:pointer;font-size:.82rem;}
.sr-cta:hover{opacity:.87;}
.sr-chlist{display:flex;flex-direction:column;gap:3px;}
.sr-chitem{display:flex;align-items:center;gap:9px;padding:10px 13px;background:#161b22;border:1px solid #21262d;border-radius:7px;cursor:pointer;transition:all .15s;}
.sr-chitem:hover{background:#1c2128;border-color:#30363d;}
.sr-chitem.sr-act{border-color:#7ee8a2;background:rgba(126,232,162,.06);}
.sr-chitem.sr-act .sr-chdot{background:#7ee8a2;}
.sr-chitem.sr-act .sr-chtitle{color:#7ee8a2;font-weight:600;}
.sr-chdot{width:6px;height:6px;border-radius:50%;background:#30363d;flex-shrink:0;}
.sr-chtitle{flex:1;font-size:.86rem;color:#c9d1d9;}
/* READER */
#sr-reader{display:flex;flex-direction:column;height:100%;overflow:hidden;}
#sr-rnav{display:flex;align-items:center;gap:6px;padding:7px 13px;background:#161b22;border-bottom:1px solid #21262d;flex-shrink:0;}
#sr-rnav button{background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 12px;border-radius:5px;cursor:pointer;font-size:.8rem;white-space:nowrap;}
#sr-rnav button:hover:not(:disabled){background:#30363d;}
#sr-rnav button:disabled{opacity:.3;cursor:not-allowed;}
#sr-chsel{flex:1;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 8px;border-radius:5px;font-size:.8rem;}
#sr-cw{flex:1;overflow-y:auto;overflow-x:hidden;background:#0d1117;}
#sr-content{max-width:760px;margin:0 auto;padding:32px 26px 80px;font-size:18px;line-height:1.85;color:#e2e8f0;font-family:"Georgia",serif;}
#sr-content p{margin-bottom:1.1em;}
#sr-content img{max-width:100%;border-radius:6px;margin:10px auto;display:block;}
#sr-content h1.title,#sr-content h1.ch-number,#sr-content h1.ch-name,#sr-content h1.toc-title{font-family:system-ui,sans-serif;color:#7ee8a2;margin:1.3em 0 .4em;}
#sr-content h1.subtitle,#sr-content p.subtitle{color:#8b949e;font-family:system-ui,sans-serif;font-size:1.1rem;margin-top:-.5em;}
#sr-content p.no-indent{text-indent:0;}
#sr-content p.credits-entry,#sr-content p.credits-entry-space{font-size:.85rem;color:#8b949e;margin-bottom:.4em;}
#sr-content p.toc-chapter,#sr-content p.toc-chapter-space{font-size:.9rem;color:#8b949e;}
#sr-content a.hlink{color:#7ee8a2;text-decoration:none;}
#sr-content .pagebreak{border:none;margin:0;padding:0;height:0;}
#sr-content .full{width:100%;height:auto;}
/* SETTINGS */
#sr-cfg{position:absolute;top:46px;right:0;width:255px;background:#161b22;border:1px solid #30363d;border-radius:0 0 0 10px;padding:13px;z-index:200;display:none;box-shadow:-4px 4px 20px rgba(0,0,0,.6);}
#sr-cfg.sropen{display:block;}
.sr-sr{margin-bottom:13px;}
.sr-sr label{display:block;font-size:.7rem;color:#8b949e;margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em;}
.sr-sr input[type=range]{width:100%;accent-color:#7ee8a2;}
.sr-sr select{width:100%;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 7px;border-radius:5px;font-size:.8rem;}
.sr-tbtns{display:flex;gap:5px;}
.sr-tbtn{flex:1;padding:5px;border-radius:5px;border:2px solid #30363d;cursor:pointer;font-size:.7rem;font-weight:600;}
.sr-tbtn.sr-ta{border-color:#7ee8a2;}
.sr-tbtn[data-theme=dark]{background:#0d1117;color:#e2e8f0;}
.sr-tbtn[data-theme=sepia]{background:#f4ecd8;color:#5b4636;}
.sr-tbtn[data-theme=light]{background:#f5f5f5;color:#1a1a1a;}
/* SPINNER */
.sr-spin{display:flex;flex-direction:column;align-items:center;justify-content:center;height:200px;gap:13px;}
.sr-ring{width:36px;height:36px;border:3px solid #21262d;border-top-color:#7ee8a2;border-radius:50%;animation:srspin .7s linear infinite;}
@keyframes srspin{to{transform:rotate(360deg)}}
.sr-spin p{color:#6e7681;font-size:.86rem;}
/* ERR */
.sr-err{margin:32px auto;max-width:440px;background:#1c1c1c;border:1px solid #f0883e55;border-radius:10px;padding:20px;text-align:center;color:#f0883e;}
.sr-err p{margin-top:6px;color:#8b949e;font-size:.83rem;}
.sr-err a{color:#f0883e;}
.sr-err button{margin-top:12px;background:#f0883e;color:#fff;border:none;padding:6px 16px;border-radius:5px;cursor:pointer;font-weight:600;}
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px;}
\`;

    // =========================================================
    // INJECT STYLE
    // =========================================================
    const style = document.createElement("style");
    style.id = "sr-style";
    style.textContent = CSS;
    document.head.appendChild(style);

    // =========================================================
    // BUILD SHELL
    // =========================================================
    const bd = document.createElement("div");
    bd.id = "sr-backdrop";
    bd.innerHTML = \`
<div id="sr-bar">
  <div class="sr-logo">
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
    Slime Reader
  </div>
  <button id="sr-back-btn">&#8249; Back</button>
  <span id="sr-bar-title"></span>
  <button id="sr-cfg-btn">
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
  </button>
  <button id="sr-close-btn">&#x2715;</button>
</div>

<div id="sr-cfg">
  <div class="sr-sr"><label>Theme</label><div class="sr-tbtns">
    <button class="sr-tbtn sr-ta" data-theme="dark">Dark</button>
    <button class="sr-tbtn" data-theme="sepia">Sepia</button>
    <button class="sr-tbtn" data-theme="light">Light</button>
  </div></div>
  <div class="sr-sr"><label>Font Size: <span id="sr-fsl">18</span>px</label><input type="range" id="sr-fs" min="13" max="28" value="18"></div>
  <div class="sr-sr"><label>Line Height: <span id="sr-lhl">1.85</span></label><input type="range" id="sr-lh" min="1.2" max="2.5" step="0.05" value="1.85"></div>
  <div class="sr-sr"><label>Font</label><select id="sr-ffs"><option value="Georgia, serif">Georgia (Serif)</option><option value="system-ui, sans-serif">Sans-Serif</option><option value="'Courier New', monospace">Monospace</option></select></div>
  <div class="sr-sr"><label>Width: <span id="sr-mwl">760</span>px</label><input type="range" id="sr-mw" min="400" max="1100" step="20" value="760"></div>
</div>

<div id="sr-main">
  <div id="sr-home"></div>
  <div id="sr-vol" style="display:none"></div>
  <div id="sr-reader" style="display:none;height:100%;">
    <div id="sr-rnav">
      <button id="sr-prev">&#8592; Prev</button>
      <select id="sr-chsel"></select>
      <button id="sr-next">Next &#8594;</button>
    </div>
    <div id="sr-cw"><div id="sr-content"></div></div>
  </div>
</div>\`;

    document.body.appendChild(bd);

    // =========================================================
    // HELPERS
    // =========================================================
    const $ = id => document.getElementById(id);
    function showPage(pg) {
        ["sr-home","sr-vol","sr-reader"].forEach(id=>{
            const el=$(id);
            if(!el) return;
            el.style.display = (id===pg) ? (id==="sr-reader"?"flex":"block") : "none";
            if(id==="sr-reader"&&id===pg) el.style.flexDirection="column";
        });
    }
    function setTitle(t) { $("sr-bar-title").textContent = t; }

    // =========================================================
    // HOME
    // =========================================================
    function renderHome() {
        App.page="home"; stopSave();
        showPage("sr-home");
        $("sr-back-btn").classList.remove("srv");
        $("sr-cfg-btn").classList.remove("srv");
        setTitle("");

        let contVol=null, contProg=null;
        for(const v of VOLUMES){ const p=Prog.get(v.id); if(p&&p.scrollPct>0){contVol=v;contProg=p;break;} }

        let contHtml="";
        if(contVol&&contProg){
            contHtml=\`<div class="sr-cont" id="sr-cont" data-id="\${contVol.id}">
              <div class="sr-cont-info">
                <div class="sr-cont-tag">Continue Reading</div>
                <div class="sr-cont-title">\${contVol.name}</div>
                <div class="sr-cont-sub">\${contProg.scrollPct}% through</div>
              </div>
              <button class="sr-cont-cta">Resume ›</button>
            </div>\`;
        }

        const cards = VOLUMES.map(v=>{
            const p=Prog.get(v.id);
            const pct=p?p.scrollPct:0;
            const badge=pct>0?\`<span class="sr-rdg">Reading</span>\`:"";
            return \`<div class="sr-card" data-id="\${v.id}">
              <div class="sr-cover">\${v.emoji}
                <span class="sr-vnum">\${v.name.split(" ").slice(0,2).join(" ")}</span>
                \${badge}
                <div class="sr-pb"><div class="sr-pbf" style="width:\${pct}%"></div></div>
              </div>
              <div class="sr-vinfo">
                <div class="sr-vname">\${v.name}</div>
                <div class="sr-vsub">\${v.chapters.length} chapters</div>
              </div>
            </div>\`;
        }).join("");

        $("sr-home").innerHTML=\`
          <div class="sr-hero">
            <div class="sr-hero-ico">🟢</div>
            <div>
              <h1>That Time I Got Reincarnated as a Slime</h1>
              <p>Fan-translated light novels (Vols 6–20 + side stories) · Progress auto-saved</p>
            </div>
          </div>
          \${contHtml}
          <div class="sr-sec">All Volumes</div>
          <div class="sr-grid">\${cards}</div>\`;

        $("sr-home").querySelectorAll(".sr-card").forEach(c=>{
            c.addEventListener("click",()=>{ const v=VOLUMES.find(x=>x.id===c.dataset.id); if(v) renderVol(v); });
        });
        const cb=$("sr-cont");
        if(cb&&contVol){ cb.addEventListener("click",()=>renderReader(contVol,0,contProg.scrollPct)); }
    }

    // =========================================================
    // VOLUME PAGE
    // =========================================================
    function renderVol(vol) {
        App.page="volume"; App.vol=vol; stopSave();
        showPage("sr-vol");
        $("sr-back-btn").classList.add("srv");
        $("sr-cfg-btn").classList.remove("srv");
        setTitle(vol.name);

        const prog=Prog.get(vol.id);
        const chListHtml = vol.chapters.map((ch,i)=>\`
          <div class="sr-chitem" data-idx="\${i}">
            <div class="sr-chdot"></div>
            <span class="sr-chtitle">\${ch.label}</span>
          </div>\`).join("");

        $("sr-vol").innerHTML=\`
          <div class="sr-vhdr">
            <div class="sr-vhdr-ico">\${vol.emoji}</div>
            <div class="sr-vhdr-meta">
              <h2>\${vol.name}</h2>
              <p>\${vol.chapters.length} chapters</p>
              \${prog&&prog.scrollPct>0?\`<div class="sr-prog-line">\${prog.scrollPct}% read</div>\`:""}
              \${prog&&prog.scrollPct>0?\`<button class="sr-cta" id="sr-volcont">Continue Reading</button>\`:""}
            </div>
          </div>
          <div class="sr-sec">Chapters</div>
          <div class="sr-chlist">\${chListHtml}</div>\`;

        $("sr-vol").querySelectorAll(".sr-chitem").forEach(item=>{
            item.addEventListener("click",()=>renderReader(vol,parseInt(item.dataset.idx)));
        });
        const vcb=$("sr-volcont");
        if(vcb&&prog) vcb.addEventListener("click",()=>renderReader(vol,0,prog.scrollPct));
    }

    // =========================================================
    // READER
    // =========================================================
    async function renderReader(vol, chIdx, resumePct) {
        App.page="reader"; App.vol=vol; App.chIdx=chIdx; stopSave();
        showPage("sr-reader");
        $("sr-back-btn").classList.add("srv");
        $("sr-cfg-btn").classList.add("srv");

        const ch = vol.chapters[chIdx];
        setTitle(vol.name + " · " + ch.label);

        const sel=$("sr-chsel");
        sel.innerHTML=vol.chapters.map((c,i)=>\`<option value="\${i}"\${i===chIdx?" selected":""}>\${c.label}</option>\`).join("");
        $("sr-prev").disabled = chIdx===0;
        $("sr-next").disabled = chIdx===vol.chapters.length-1;

        $("sr-content").innerHTML=\`<div class="sr-spin"><div class="sr-ring"></div><p>Loading \${ch.label}…</p></div>\`;

        try {
            const fullHtml = await fetchVolume(vol);

            // Get the anchor ID of the NEXT chapter (to know where to stop)
            const nextCh = vol.chapters[chIdx+1];
            const chunkHtml = extractChapter(fullHtml, ch.id, nextCh ? nextCh.id : null);

            $("sr-content").innerHTML = chunkHtml;
            S.apply();

            const prog = Prog.get(vol.id);
            const scrollTo = (typeof resumePct==="number"&&resumePct>0) ? resumePct
                           : (prog&&prog.scrollPct>0 ? prog.scrollPct : 0);
            // Only restore scroll if we're starting at chapter 0 (whole-book scroll)
            // For chapter navigation we always start at top
            if (typeof resumePct==="number"&&resumePct>0) {
                restorePct(scrollTo);
            } else {
                $("sr-cw").scrollTop = 0;
            }

            Prog.set(vol.id, getPct());
            startSave(vol.id);

        } catch(err) {
            $("sr-content").innerHTML=\`<div class="sr-err">
              <strong>⚠️ Could not load volume</strong>
              <p>\${err.message}</p>
              <p>Try opening <a href="\${BASE+vol.path}" target="_blank">\${BASE+vol.path}</a> in your browser.</p>
              <button id="sr-retry">Retry</button>
            </div>\`;
            $("sr-retry")&&$("sr-retry").addEventListener("click",()=>renderReader(vol,chIdx,resumePct));
        }
    }

    // =========================================================
    // EVENTS
    // =========================================================
    $("sr-close-btn").addEventListener("click", cleanup);
    window.addEventListener("keydown", function onEsc(e){ if(e.key==="Escape"){e.preventDefault();cleanup();window.removeEventListener("keydown",onEsc);} });

    $("sr-back-btn").addEventListener("click",()=>{
        if(App.page==="reader"){ Prog.set(App.vol.id,getPct()); renderVol(App.vol); }
        else if(App.page==="volume"){ renderHome(); }
    });

    $("sr-cfg-btn").addEventListener("click",e=>{
        e.stopPropagation();
        $("sr-cfg").classList.toggle("sropen");
    });
    document.addEventListener("click",e=>{
        const c=$("sr-cfg");
        if(c&&c.classList.contains("sropen")&&!c.contains(e.target)&&e.target.id!=="sr-cfg-btn")
            c.classList.remove("sropen");
    });

    $("sr-prev").addEventListener("click",()=>{
        if(App.chIdx>0){ Prog.set(App.vol.id,getPct()); renderReader(App.vol,App.chIdx-1); }
    });
    $("sr-next").addEventListener("click",()=>{
        if(App.chIdx<App.vol.chapters.length-1){ Prog.set(App.vol.id,getPct()); renderReader(App.vol,App.chIdx+1); }
    });
    $("sr-chsel").addEventListener("change",e=>{
        const i=parseInt(e.target.value);
        if(i!==App.chIdx){ Prog.set(App.vol.id,getPct()); renderReader(App.vol,i); }
    });

    // SETTINGS
    document.querySelectorAll(".sr-tbtn").forEach(b=>{
        b.addEventListener("click",()=>{ S.get().theme=b.dataset.theme; S.save(); S.apply(); });
    });
    function bindSl(slId, lblId, key, parse) {
        const el=$(slId); if(!el)return;
        el.addEventListener("input",()=>{ S.get()[key]=parse(el.value); $(lblId).textContent=S.get()[key]; S.save(); S.apply(); });
    }
    bindSl("sr-fs","sr-fsl","fontSize",v=>parseInt(v));
    bindSl("sr-lh","sr-lhl","lineHeight",v=>parseFloat(v));
    bindSl("sr-mw","sr-mwl","maxWidth",v=>parseInt(v));
    const ffs=$("sr-ffs");
    if(ffs) ffs.addEventListener("change",()=>{ S.get().fontFamily=ffs.value; S.save(); S.apply(); });

    // =========================================================
    // CLEANUP
    // =========================================================
    function cleanup(){
        stopSave();
        $("sr-backdrop")?.remove();
        $("sr-style")?.remove();
    }

    // =========================================================
    // BOOT
    // =========================================================
    S.apply();
    renderHome();

})()\n`;
        }

        const tray = ctx.newTray({
            tooltipText: "Slime Reader",
            iconUrl: "data:image/svg+xml," + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ee8a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
            ),
            withContent: false,
        });

        tray.onClick(async () => {
            try {
                if (await ctx.dom.queryOne("#sr-backdrop")) return;
                const body = await ctx.dom.queryOne("body");
                if (!body) return;
                const script = await ctx.dom.createElement("script");
                script.setText(getInjectedScript());
                body.append(script);
            } catch (err) {
                console.error("[SlimeReader]", err);
            }
        });
    });
}

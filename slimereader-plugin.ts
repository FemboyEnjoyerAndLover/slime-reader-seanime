/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

// =============================================================================
// Slime Reader – Seanime Plugin
// Injects a full-screen reader UI into Seanime's DOM via a tray icon click.
// Progress is saved to localStorage (survives tab reloads) and also synced
// to plugin $storage (survives app restarts) via a periodic heartbeat.
// =============================================================================

function init() {
    $ui.register((ctx) => {

        // ------------------------------------------------------------------
        // Generate the self-contained injected script string.
        // Everything inside runs in the browser context (window / DOM).
        // ------------------------------------------------------------------
        function getInjectedScript(scriptId: string): string {
            return `
(async function() {
    // Exit early if already open
    if (document.getElementById("sr-backdrop")) return;

    // =========================================================
    // VOLUME CATALOGUE
    // URL structure: https://tensurafan.github.io/vol1/ch1/ etc.
    // =========================================================
    const BASE = "https://tensurafan.github.io";

    const VOLUMES = [
        { key:"vol1",  label:"Volume 1",  title:"Birth of a Slime",          emoji:"🟢",
          chapters:[
            {id:"prologue",title:"Prologue",          path:"/vol1/prologue/"},
            {id:"ch1",     title:"Chapter 1",          path:"/vol1/ch1/"},
            {id:"ch2",     title:"Chapter 2",          path:"/vol1/ch2/"},
            {id:"ch3",     title:"Chapter 3",          path:"/vol1/ch3/"},
            {id:"ch4",     title:"Chapter 4",          path:"/vol1/ch4/"},
            {id:"ch5",     title:"Chapter 5",          path:"/vol1/ch5/"},
            {id:"ch6",     title:"Chapter 6",          path:"/vol1/ch6/"},
            {id:"ch7",     title:"Chapter 7",          path:"/vol1/ch7/"},
            {id:"epilogue",title:"Epilogue",           path:"/vol1/epilogue/"},
          ]},
        { key:"vol2",  label:"Volume 2",  title:"The Dwarven Kingdom Arc",    emoji:"⚒️",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol2/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol2/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol2/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol2/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol2/ch4/"},
            {id:"ch5",title:"Chapter 5",path:"/vol2/ch5/"},
            {id:"ch6",title:"Chapter 6",path:"/vol2/ch6/"},
            {id:"epilogue",title:"Epilogue",path:"/vol2/epilogue/"},
          ]},
        { key:"vol3",  label:"Volume 3",  title:"The Orc Disaster Arc",       emoji:"🐗",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol3/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol3/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol3/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol3/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol3/ch4/"},
            {id:"ch5",title:"Chapter 5",path:"/vol3/ch5/"},
            {id:"ch6",title:"Chapter 6",path:"/vol3/ch6/"},
            {id:"epilogue",title:"Epilogue",path:"/vol3/epilogue/"},
          ]},
        { key:"vol4",  label:"Volume 4",  title:"Tempest Founding Arc",       emoji:"🏰",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol4/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol4/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol4/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol4/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol4/ch4/"},
            {id:"ch5",title:"Chapter 5",path:"/vol4/ch5/"},
            {id:"epilogue",title:"Epilogue",path:"/vol4/epilogue/"},
          ]},
        { key:"vol5",  label:"Volume 5",  title:"Kingdom of Farmus",          emoji:"⚔️",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol5/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol5/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol5/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol5/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol5/ch4/"},
            {id:"ch5",title:"Chapter 5",path:"/vol5/ch5/"},
            {id:"epilogue",title:"Epilogue",path:"/vol5/epilogue/"},
          ]},
        { key:"vol6",  label:"Volume 6",  title:"Walpurgis",                  emoji:"🌙",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol6/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol6/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol6/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol6/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol6/ch4/"},
            {id:"epilogue",title:"Epilogue",path:"/vol6/epilogue/"},
          ]},
        { key:"vol7",  label:"Volume 7",  title:"Eurazania Arc",              emoji:"🐾",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol7/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol7/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol7/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol7/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol7/ch4/"},
            {id:"epilogue",title:"Epilogue",path:"/vol7/epilogue/"},
          ]},
        { key:"vol8",  label:"Volume 8",  title:"Labyrinth Arc",              emoji:"🌀",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol8/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol8/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol8/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol8/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol8/ch4/"},
            {id:"epilogue",title:"Epilogue",path:"/vol8/epilogue/"},
          ]},
        { key:"vol9",  label:"Volume 9",  title:"Eurazania Restored",         emoji:"🌿",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol9/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol9/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol9/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol9/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol9/ch4/"},
            {id:"epilogue",title:"Epilogue",path:"/vol9/epilogue/"},
          ]},
        { key:"vol10", label:"Volume 10", title:"Tenma Great War",            emoji:"💥",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol10/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol10/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol10/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol10/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol10/ch4/"},
            {id:"ch5",title:"Chapter 5",path:"/vol10/ch5/"},
            {id:"epilogue",title:"Epilogue",path:"/vol10/epilogue/"},
          ]},
        { key:"vol11", label:"Volume 11", title:"King of Monsters",           emoji:"👑",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol11/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol11/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol11/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol11/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol11/ch4/"},
            {id:"epilogue",title:"Epilogue",path:"/vol11/epilogue/"},
          ]},
        { key:"vol12", label:"Volume 12", title:"Sealed Foes",                emoji:"🔒",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol12/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol12/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol12/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol12/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol12/ch4/"},
            {id:"epilogue",title:"Epilogue",path:"/vol12/epilogue/"},
          ]},
        { key:"vol13", label:"Volume 13", title:"Road to the Empire",         emoji:"🗺️",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol13/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol13/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol13/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol13/ch3/"},
            {id:"epilogue",title:"Epilogue",path:"/vol13/epilogue/"},
          ]},
        { key:"vol14", label:"Volume 14", title:"Invaders",                   emoji:"🌪️",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol14/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol14/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol14/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol14/ch3/"},
            {id:"ch4",title:"Chapter 4",path:"/vol14/ch4/"},
            {id:"epilogue",title:"Epilogue",path:"/vol14/epilogue/"},
          ]},
        { key:"vol15", label:"Volume 15", title:"The Empire's Fall",          emoji:"🏚️",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol15/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol15/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol15/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol15/ch3/"},
            {id:"epilogue",title:"Epilogue",path:"/vol15/epilogue/"},
          ]},
        { key:"vol16", label:"Volume 16", title:"Beginning of the End",       emoji:"🌌",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol16/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol16/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol16/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol16/ch3/"},
            {id:"epilogue",title:"Epilogue",path:"/vol16/epilogue/"},
          ]},
        { key:"vol17", label:"Volume 17", title:"Dragon vs Demon",            emoji:"🐉",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol17/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol17/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol17/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol17/ch3/"},
            {id:"epilogue",title:"Epilogue",path:"/vol17/epilogue/"},
          ]},
        { key:"vol18", label:"Volume 18", title:"King of Tempest",            emoji:"⚡",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol18/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol18/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol18/ch2/"},
            {id:"ch3",title:"Chapter 3",path:"/vol18/ch3/"},
            {id:"epilogue",title:"Epilogue",path:"/vol18/epilogue/"},
          ]},
        { key:"vol19", label:"Volume 19", title:"The True Dragon",            emoji:"🌟",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol19/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol19/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol19/ch2/"},
            {id:"epilogue",title:"Epilogue",path:"/vol19/epilogue/"},
          ]},
        { key:"vol20", label:"Volume 20", title:"Beyond the Stars",           emoji:"✨",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol20/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol20/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol20/ch2/"},
            {id:"epilogue",title:"Epilogue",path:"/vol20/epilogue/"},
          ]},
        { key:"vol21", label:"Volume 21", title:"Finale",                     emoji:"🏁",
          chapters:[
            {id:"prologue",title:"Prologue",path:"/vol21/prologue/"},
            {id:"ch1",title:"Chapter 1",path:"/vol21/ch1/"},
            {id:"ch2",title:"Chapter 2",path:"/vol21/ch2/"},
            {id:"ch3",title:"Chapter 3 – Final Chapter",path:"/vol21/ch3/"},
            {id:"epilogue",title:"Epilogue",path:"/vol21/epilogue/"},
          ]},
    ];

    // =========================================================
    // PROGRESS  (localStorage)
    // Keys: sr_progress_vol1  →  JSON {chapterId, scrollPct}
    // =========================================================
    const Progress = {
        key: (vk) => "sr_progress_" + vk,
        get: (vk) => {
            try { return JSON.parse(localStorage.getItem(Progress.key(vk))) || null; }
            catch(_) { return null; }
        },
        set: (vk, chId, pct) => {
            localStorage.setItem(Progress.key(vk), JSON.stringify({chapterId:chId, scrollPct:pct}));
        }
    };

    // =========================================================
    // READER SETTINGS  (localStorage)
    // =========================================================
    const DEFAULT_SETTINGS = { theme:"dark", fontSize:18, lineHeight:1.85, fontFamily:"Georgia, serif", maxWidth:760 };
    const Settings = {
        _d: null,
        get: () => {
            if (Settings._d) return Settings._d;
            try { Settings._d = Object.assign({}, DEFAULT_SETTINGS, JSON.parse(localStorage.getItem("sr_settings"))); }
            catch(_) { Settings._d = Object.assign({}, DEFAULT_SETTINGS); }
            return Settings._d;
        },
        save: () => { try { localStorage.setItem("sr_settings", JSON.stringify(Settings._d)); } catch(_) {} },
        apply: () => {
            const s = Settings.get();
            const THEMES = { dark:{bg:"#0d1117",txt:"#e2e8f0",wrap:"#0d1117"}, sepia:{bg:"#f4ecd8",txt:"#5b4636",wrap:"#f4ecd8"}, light:{bg:"#f5f5f5",txt:"#1a1a1a",wrap:"#f5f5f5"} };
            const t = THEMES[s.theme] || THEMES.dark;
            const rc = document.getElementById("sr-content");
            const rw = document.getElementById("sr-content-wrap");
            if (rc) { rc.style.fontSize = s.fontSize+"px"; rc.style.lineHeight = s.lineHeight; rc.style.fontFamily = s.fontFamily; rc.style.maxWidth = s.maxWidth+"px"; rc.style.color = t.txt; }
            if (rw) rw.style.background = t.wrap;
            document.querySelectorAll(".sr-theme-btn").forEach(b => b.classList.toggle("sr-active", b.dataset.theme === s.theme));
            const fsl = document.getElementById("sr-fs-label"); if (fsl) fsl.textContent = s.fontSize;
            const lhl = document.getElementById("sr-lh-label"); if (lhl) lhl.textContent = s.lineHeight;
            const mwl = document.getElementById("sr-mw-label"); if (mwl) mwl.textContent = s.maxWidth;
            const fss = document.getElementById("sr-fs-slider"); if (fss) fss.value = s.fontSize;
            const lhs = document.getElementById("sr-lh-slider"); if (lhs) lhs.value = s.lineHeight;
            const mws = document.getElementById("sr-mw-slider"); if (mws) mws.value = s.maxWidth;
            const ffs = document.getElementById("sr-ff-select"); if (ffs) ffs.value = s.fontFamily;
        }
    };

    // =========================================================
    // APP STATE
    // =========================================================
    const App = { page:"home", vol:null, chIdx:0, scrollTimer:null };

    // =========================================================
    // FETCH CHAPTER HTML from tensurafan.github.io
    // =========================================================
    async function fetchChapter(path) {
        const url = BASE + path;
        const res = await fetch(url, {mode:"cors",credentials:"omit"});
        if (!res.ok) throw new Error("HTTP "+res.status+" for "+url);
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, "text/html");
        // Remove noise
        ["nav","header","footer","script","style","iframe"].forEach(tag => doc.querySelectorAll(tag).forEach(el=>el.remove()));
        // Pick best content node
        const content = doc.querySelector("article,.content,.post-content,.markdown-body,main,#content") || doc.body;
        // Rewrite relative images
        content.querySelectorAll("img[src]").forEach(img => {
            const s = img.getAttribute("src");
            if (s && !s.startsWith("http")) img.setAttribute("src", new URL(s, url).href);
        });
        return content.innerHTML;
    }

    // =========================================================
    // CSS
    // =========================================================
    const CSS = \`
#sr-backdrop{position:fixed;inset:0;z-index:99999;background:#0d1117;display:flex;flex-direction:column;font-family:-apple-system,"Segoe UI",system-ui,sans-serif;}
#sr-topbar{display:flex;align-items:center;gap:10px;padding:10px 18px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0;}
.sr-logo{display:flex;align-items:center;gap:8px;font-weight:700;font-size:1rem;color:#7ee8a2;white-space:nowrap;}
#sr-close{margin-left:auto;background:transparent;border:1px solid #30363d;color:#8b949e;width:30px;height:30px;border-radius:6px;cursor:pointer;font-size:1.1rem;display:flex;align-items:center;justify-content:center;}
#sr-close:hover{background:#21262d;color:#e2e8f0;}
#sr-back{background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:0.82rem;display:none;align-items:center;gap:5px;}
#sr-back:hover{background:#21262d;color:#e2e8f0;}
#sr-back.sr-vis{display:flex;}
#sr-ch-bar{flex:1;font-size:0.85rem;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
#sr-settings-btn{background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 9px;border-radius:6px;cursor:pointer;display:none;align-items:center;}
#sr-settings-btn:hover{background:#21262d;}
#sr-settings-btn.sr-vis{display:flex;}
#sr-main{flex:1;overflow-y:auto;overflow-x:hidden;position:relative;}
/* HOME */
#sr-home{padding:28px 22px;max-width:1100px;margin:0 auto;}
.sr-hero{background:linear-gradient(135deg,#1a2332,#0d2137,#1a1a2e);border:1px solid #30363d;border-radius:14px;padding:32px 40px;margin-bottom:36px;display:flex;align-items:center;gap:28px;}
.sr-hero-emoji{font-size:56px;filter:drop-shadow(0 0 16px rgba(126,232,162,.4));flex-shrink:0;}
.sr-hero h1{font-size:1.55rem;font-weight:800;color:#7ee8a2;margin:0 0 6px;}
.sr-hero p{color:#8b949e;font-size:.9rem;line-height:1.6;margin:0;}
.sr-continue-banner{background:#161b22;border:1px solid #7ee8a28f;border-radius:10px;padding:16px 20px;margin-bottom:32px;display:flex;align-items:center;gap:16px;cursor:pointer;transition:border-color .2s;}
.sr-continue-banner:hover{border-color:#7ee8a2;}
.sr-continue-info{flex:1;}
.sr-continue-tag{font-size:.7rem;color:#7ee8a2;text-transform:uppercase;letter-spacing:.08em;font-weight:700;margin-bottom:3px;}
.sr-continue-title{font-weight:700;color:#c9d1d9;font-size:1rem;}
.sr-continue-sub{color:#8b949e;font-size:.82rem;margin-top:2px;}
.sr-continue-cta{background:#7ee8a2;color:#0d1117;border:none;padding:8px 16px;border-radius:7px;font-weight:700;cursor:pointer;white-space:nowrap;font-size:.85rem;}
.sr-sec{font-size:.95rem;font-weight:700;color:#c9d1d9;margin:0 0 16px;display:flex;align-items:center;gap:8px;}
.sr-sec::after{content:"";flex:1;height:1px;background:#21262d;}
.sr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:16px;margin-bottom:40px;}
.sr-vol-card{background:#161b22;border:1px solid #21262d;border-radius:10px;overflow:hidden;cursor:pointer;transition:all .2s;position:relative;}
.sr-vol-card:hover{border-color:#7ee8a2;transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,.4);}
.sr-vol-cover{width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:2rem;border-bottom:1px solid #21262d;position:relative;}
.sr-vol-num{font-size:.58rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7ee8a2;background:rgba(0,0,0,.75);padding:2px 7px;border-radius:3px;position:absolute;top:7px;left:7px;}
.sr-reading-badge{position:absolute;top:7px;right:7px;background:#7ee8a2;color:#0d1117;font-size:.55rem;font-weight:800;text-transform:uppercase;letter-spacing:.07em;padding:2px 5px;border-radius:3px;}
.sr-pbar-wrap{position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.1);}
.sr-pbar-fill{height:100%;background:#7ee8a2;transition:width .3s;}
.sr-vol-info{padding:9px 11px 12px;}
.sr-vol-name{font-size:.78rem;font-weight:600;color:#c9d1d9;line-height:1.3;margin-bottom:3px;}
.sr-vol-sub{font-size:.68rem;color:#6e7681;}
/* VOLUME PAGE */
#sr-vol-page{padding:28px 22px;max-width:860px;margin:0 auto;}
.sr-vol-hdr{display:flex;gap:20px;margin-bottom:28px;padding-bottom:20px;border-bottom:1px solid #21262d;}
.sr-vol-hdr-cover{width:100px;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);border-radius:7px;display:flex;align-items:center;justify-content:center;font-size:2.2rem;border:1px solid #30363d;flex-shrink:0;}
.sr-vol-hdr-meta h2{font-size:1.25rem;font-weight:700;color:#c9d1d9;margin:0 0 4px;}
.sr-vol-hdr-meta p{color:#8b949e;font-size:.85rem;margin:0 0 10px;}
.sr-vol-progress{font-size:.78rem;color:#7ee8a2;margin-bottom:10px;}
.sr-cta-btn{background:#7ee8a2;color:#0d1117;border:none;padding:7px 16px;border-radius:7px;font-weight:700;cursor:pointer;font-size:.85rem;}
.sr-cta-btn:hover{opacity:.87;}
.sr-ch-list{display:flex;flex-direction:column;gap:3px;}
.sr-ch-item{display:flex;align-items:center;gap:10px;padding:11px 14px;background:#161b22;border:1px solid #21262d;border-radius:7px;cursor:pointer;transition:all .15s;}
.sr-ch-item:hover{background:#1c2128;border-color:#30363d;}
.sr-ch-item.sr-ch-active{border-color:#7ee8a2;background:rgba(126,232,162,.06);}
.sr-ch-dot{width:7px;height:7px;border-radius:50%;background:#30363d;flex-shrink:0;}
.sr-ch-item.sr-ch-active .sr-ch-dot{background:#7ee8a2;}
.sr-ch-title{flex:1;font-size:.88rem;color:#c9d1d9;}
.sr-ch-item.sr-ch-active .sr-ch-title{color:#7ee8a2;font-weight:600;}
.sr-ch-bm{font-size:.72rem;color:#7ee8a2;}
/* READER */
#sr-reader-page{display:flex;flex-direction:column;height:100%;overflow:hidden;}
#sr-reader-nav{display:flex;align-items:center;gap:7px;padding:7px 14px;background:#161b22;border-bottom:1px solid #21262d;flex-shrink:0;}
#sr-reader-nav button{background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 13px;border-radius:5px;cursor:pointer;font-size:.82rem;white-space:nowrap;}
#sr-reader-nav button:hover:not(:disabled){background:#30363d;}
#sr-reader-nav button:disabled{opacity:.3;cursor:not-allowed;}
#sr-ch-select{flex:1;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 9px;border-radius:5px;font-size:.82rem;}
#sr-content-wrap{flex:1;overflow-y:auto;overflow-x:hidden;background:#0d1117;}
#sr-content{max-width:760px;margin:0 auto;padding:36px 28px 80px;font-size:18px;line-height:1.85;color:#e2e8f0;font-family:"Georgia",serif;}
#sr-content p{margin-bottom:1.15em;}
#sr-content img{max-width:100%;border-radius:7px;margin:10px 0;}
#sr-content h1,#sr-content h2,#sr-content h3{font-family:system-ui,sans-serif;color:#7ee8a2;margin:1.4em 0 .45em;}
/* SETTINGS PANEL */
#sr-settings-panel{position:absolute;top:46px;right:0;width:260px;background:#161b22;border:1px solid #30363d;border-radius:0 0 0 10px;padding:14px;z-index:200;display:none;box-shadow:-4px 4px 20px rgba(0,0,0,.6);}
#sr-settings-panel.sr-open{display:block;}
.sr-srow{margin-bottom:14px;}
.sr-srow label{display:block;font-size:.72rem;color:#8b949e;margin-bottom:5px;text-transform:uppercase;letter-spacing:.06em;}
.sr-srow input[type=range]{width:100%;accent-color:#7ee8a2;}
.sr-srow select{width:100%;background:#21262d;border:1px solid #30363d;color:#c9d1d9;padding:5px 7px;border-radius:5px;font-size:.82rem;}
.sr-theme-btns{display:flex;gap:5px;}
.sr-theme-btn{flex:1;padding:5px;border-radius:5px;border:2px solid #30363d;cursor:pointer;font-size:.72rem;font-weight:600;}
.sr-theme-btn.sr-active{border-color:#7ee8a2;}
.sr-theme-btn[data-theme=dark]{background:#0d1117;color:#e2e8f0;}
.sr-theme-btn[data-theme=sepia]{background:#f4ecd8;color:#5b4636;}
.sr-theme-btn[data-theme=light]{background:#f5f5f5;color:#1a1a1a;}
/* SPINNER */
.sr-spin{display:flex;flex-direction:column;align-items:center;justify-content:center;height:220px;gap:14px;}
.sr-spin-ring{width:38px;height:38px;border:3px solid #21262d;border-top-color:#7ee8a2;border-radius:50%;animation:sr-spin .7s linear infinite;}
@keyframes sr-spin{to{transform:rotate(360deg)}}
.sr-spin p{color:#6e7681;font-size:.88rem;}
/* ERROR */
.sr-err{margin:36px auto;max-width:460px;background:#1c1c1c;border:1px solid #f0883e55;border-radius:10px;padding:22px;text-align:center;color:#f0883e;}
.sr-err p{margin-top:7px;color:#8b949e;font-size:.85rem;}
.sr-err a{color:#f0883e;}
.sr-err button{margin-top:14px;background:#f0883e;color:#fff;border:none;padding:7px 18px;border-radius:5px;cursor:pointer;font-weight:600;}
/* SCROLLBAR */
::-webkit-scrollbar{width:5px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px;}
::-webkit-scrollbar-thumb:hover{background:#484f58;}
\`;

    // =========================================================
    // INJECT CSS
    // =========================================================
    const styleEl = document.createElement("style");
    styleEl.id = "sr-style";
    styleEl.textContent = CSS;
    document.head.appendChild(styleEl);

    // =========================================================
    // BUILD BACKDROP / SHELL
    // =========================================================
    const backdrop = document.createElement("div");
    backdrop.id = "sr-backdrop";
    backdrop.innerHTML = \`
        <div id="sr-topbar">
            <div class="sr-logo">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                Slime Reader
            </div>
            <button id="sr-back">&#8249; Back</button>
            <span id="sr-ch-bar"></span>
            <button id="sr-settings-btn" title="Reader settings">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
            </button>
            <button id="sr-close">&#x2715;</button>
        </div>

        <div id="sr-settings-panel">
            <div class="sr-srow">
                <label>Theme</label>
                <div class="sr-theme-btns">
                    <button class="sr-theme-btn sr-active" data-theme="dark">Dark</button>
                    <button class="sr-theme-btn" data-theme="sepia">Sepia</button>
                    <button class="sr-theme-btn" data-theme="light">Light</button>
                </div>
            </div>
            <div class="sr-srow"><label>Font Size: <span id="sr-fs-label">18</span>px</label><input type="range" id="sr-fs-slider" min="13" max="28" value="18"></div>
            <div class="sr-srow"><label>Line Height: <span id="sr-lh-label">1.85</span></label><input type="range" id="sr-lh-slider" min="1.2" max="2.5" step="0.05" value="1.85"></div>
            <div class="sr-srow"><label>Font Family</label><select id="sr-ff-select"><option value="Georgia, serif">Georgia (Serif)</option><option value="system-ui, sans-serif">Sans-Serif</option><option value="'Courier New', monospace">Monospace</option></select></div>
            <div class="sr-srow"><label>Max Width: <span id="sr-mw-label">760</span>px</label><input type="range" id="sr-mw-slider" min="400" max="1100" step="20" value="760"></div>
        </div>

        <div id="sr-main">
            <div id="sr-home"></div>
            <div id="sr-vol-page" style="display:none"></div>
            <div id="sr-reader-page" style="display:none;height:100%;">
                <div id="sr-reader-nav">
                    <button id="sr-prev">&#8592; Prev</button>
                    <select id="sr-ch-select"></select>
                    <button id="sr-next">Next &#8594;</button>
                </div>
                <div id="sr-content-wrap"><div id="sr-content"></div></div>
            </div>
        </div>
    \`;

    document.body.appendChild(backdrop);

    // =========================================================
    // HELPERS
    // =========================================================
    const $ = id => document.getElementById(id);
    function showOnly(pageId) {
        ["sr-home","sr-vol-page","sr-reader-page"].forEach(id => $(id).style.display = (id===pageId ? (id==="sr-reader-page"?"flex":"block") : "none"));
        if (pageId==="sr-reader-page") $(pageId).style.flexDirection = "column";
    }
    function setChBar(txt) { $("sr-ch-bar").textContent = txt; }

    function getScrollPct() {
        const w = $("sr-content-wrap");
        if (!w || w.scrollHeight <= w.clientHeight) return 0;
        return Math.round(w.scrollTop / (w.scrollHeight - w.clientHeight) * 1000) / 10;
    }
    function restoreScroll(pct) {
        if (!pct || pct <= 0) return;
        const w = $("sr-content-wrap");
        if (!w) return;
        setTimeout(() => { w.scrollTop = (pct / 100) * (w.scrollHeight - w.clientHeight); }, 150);
    }

    // =========================================================
    // RENDER: HOME
    // =========================================================
    function renderHome() {
        App.page = "home";
        stopScrollSave();
        showOnly("sr-home");
        $("sr-back").classList.remove("sr-vis");
        $("sr-settings-btn").classList.remove("sr-vis");
        setChBar("");

        // Find most-recent progress
        let contVol = null, contProg = null;
        for (const v of VOLUMES) {
            const p = Progress.get(v.key);
            if (p && p.chapterId) { contVol = v; contProg = p; break; }
        }

        let contHtml = "";
        if (contVol && contProg) {
            const chIdx = contVol.chapters.findIndex(c => c.id === contProg.chapterId);
            const ch = contVol.chapters[chIdx >= 0 ? chIdx : 0];
            contHtml = \`<div class="sr-continue-banner" id="sr-cont-banner" data-key="\${contVol.key}" data-chidx="\${chIdx>=0?chIdx:0}" data-scroll="\${contProg.scrollPct}">
                <div class="sr-continue-info">
                    <div class="sr-continue-tag">Continue Reading</div>
                    <div class="sr-continue-title">\${contVol.label}: \${contVol.title}</div>
                    <div class="sr-continue-sub">\${ch.title} · \${contProg.scrollPct}% read</div>
                </div>
                <button class="sr-continue-cta">Resume ›</button>
            </div>\`;
        }

        const gridHtml = VOLUMES.map(vol => {
            const p = Progress.get(vol.key);
            const pct = p ? p.scrollPct : 0;
            const badge = p ? \`<span class="sr-reading-badge">Reading</span>\` : "";
            return \`<div class="sr-vol-card" data-key="\${vol.key}">
                <div class="sr-vol-cover">\${vol.emoji}
                    <span class="sr-vol-num">\${vol.label}</span>
                    \${badge}
                    <div class="sr-pbar-wrap"><div class="sr-pbar-fill" style="width:\${pct}%"></div></div>
                </div>
                <div class="sr-vol-info">
                    <div class="sr-vol-name">\${vol.title}</div>
                    <div class="sr-vol-sub">\${vol.chapters.length} chapters</div>
                </div>
            </div>\`;
        }).join("");

        $("sr-home").innerHTML = \`
            <div class="sr-hero">
                <div class="sr-hero-emoji">🟢</div>
                <div>
                    <h1>That Time I Got Reincarnated as a Slime</h1>
                    <p>All 21 light novel volumes · Your reading progress is saved automatically</p>
                </div>
            </div>
            \${contHtml}
            <div class="sr-sec">All Volumes</div>
            <div class="sr-grid">\${gridHtml}</div>
        \`;

        $("sr-home").querySelectorAll(".sr-vol-card").forEach(card => {
            card.addEventListener("click", () => {
                const vol = VOLUMES.find(v => v.key === card.dataset.key);
                if (vol) renderVolume(vol);
            });
        });

        const cb = $("sr-cont-banner");
        if (cb) {
            cb.addEventListener("click", () => {
                const vol = VOLUMES.find(v => v.key === cb.dataset.key);
                if (vol) renderReader(vol, parseInt(cb.dataset.chidx)||0, parseFloat(cb.dataset.scroll)||0);
            });
        }
    }

    // =========================================================
    // RENDER: VOLUME PAGE
    // =========================================================
    function renderVolume(vol, autoOpen) {
        App.page = "volume"; App.vol = vol;
        stopScrollSave();
        showOnly("sr-vol-page");
        $("sr-back").classList.add("sr-vis");
        $("sr-settings-btn").classList.remove("sr-vis");
        setChBar(vol.label + " — " + vol.title);

        const prog = Progress.get(vol.key);
        const lastChId = prog ? prog.chapterId : null;

        const chListHtml = vol.chapters.map((ch, idx) => {
            const active = lastChId && ch.id === lastChId;
            const bm = active ? \`<span class="sr-ch-bm">📖</span>\` : "";
            return \`<div class="sr-ch-item\${active?" sr-ch-active":""}" data-idx="\${idx}">
                <div class="sr-ch-dot"></div>
                <span class="sr-ch-title">\${ch.title}</span>
                \${bm}
            </div>\`;
        }).join("");

        const progHtml = prog ? \`<div class="sr-vol-progress">\${prog.scrollPct}% through \${vol.chapters.find(c=>c.id===prog.chapterId)?.title||""}</div>\` : "";
        const contBtn = lastChId ? \`<button class="sr-cta-btn" id="sr-vol-cont">Continue Reading</button>\` : "";

        $("sr-vol-page").innerHTML = \`
            <div class="sr-vol-hdr">
                <div class="sr-vol-hdr-cover">\${vol.emoji}</div>
                <div class="sr-vol-hdr-meta">
                    <h2>\${vol.label}</h2>
                    <p>\${vol.title} · \${vol.chapters.length} chapters</p>
                    \${progHtml}
                    \${contBtn}
                </div>
            </div>
            <div class="sr-sec">Chapters</div>
            <div class="sr-ch-list">\${chListHtml}</div>
        \`;

        $("sr-vol-page").querySelectorAll(".sr-ch-item").forEach(item => {
            item.addEventListener("click", () => renderReader(vol, parseInt(item.dataset.idx)));
        });

        const vcb = $("sr-vol-cont");
        if (vcb && lastChId) {
            const ri = vol.chapters.findIndex(c => c.id === lastChId);
            vcb.addEventListener("click", () => renderReader(vol, ri >= 0 ? ri : 0, prog.scrollPct));
        }

        if (typeof autoOpen === "number") renderReader(vol, autoOpen, prog ? prog.scrollPct : 0);
    }

    // =========================================================
    // RENDER: READER
    // =========================================================
    let scrollSaveTimer = null;
    function stopScrollSave() { if (scrollSaveTimer) { clearInterval(scrollSaveTimer); scrollSaveTimer = null; } }

    async function renderReader(vol, chIdx, resumePct) {
        App.page = "reader"; App.vol = vol; App.chIdx = chIdx;
        stopScrollSave();
        showOnly("sr-reader-page");
        $("sr-back").classList.add("sr-vis");
        $("sr-settings-btn").classList.add("sr-vis");

        const ch = vol.chapters[chIdx];
        setChBar(vol.label + " · " + ch.title);

        // Chapter select dropdown
        const sel = $("sr-ch-select");
        sel.innerHTML = vol.chapters.map((c, i) => \`<option value="\${i}"\${i===chIdx?" selected":""}>\${c.title}</option>\`).join("");
        $("sr-prev").disabled = chIdx === 0;
        $("sr-next").disabled = chIdx === vol.chapters.length - 1;

        // Show spinner
        $("sr-content").innerHTML = \`<div class="sr-spin"><div class="sr-spin-ring"></div><p>Loading chapter…</p></div>\`;

        const url = BASE + ch.path;
        try {
            const html = await fetchChapter(ch.path);
            $("sr-content").innerHTML = html;
            Settings.apply();

            // Restore scroll: prefer explicit resumePct, else saved progress if same chapter
            const savedProg = Progress.get(vol.key);
            const scrollTo = (typeof resumePct === "number" && resumePct > 0)
                ? resumePct
                : (savedProg && savedProg.chapterId === ch.id ? savedProg.scrollPct : 0);
            restoreScroll(scrollTo);

            // Save immediately
            Progress.set(vol.key, ch.id, scrollTo);

            // Auto-save every 3s
            scrollSaveTimer = setInterval(() => {
                Progress.set(vol.key, ch.id, getScrollPct());
            }, 3000);

        } catch (err) {
            $("sr-content").innerHTML = \`
                <div class="sr-err">
                    <strong>⚠️ Could not load chapter</strong>
                    <p>Failed to fetch from <a href="\${url}" target="_blank">\${url}</a></p>
                    <p>\${err.message}</p>
                    <button onclick="document.getElementById('sr-content').dispatchEvent(new CustomEvent('sr-retry'))">Retry</button>
                </div>\`;
            $("sr-content").addEventListener("sr-retry", () => renderReader(vol, chIdx, resumePct), {once:true});
        }
    }

    // =========================================================
    // TOPBAR EVENTS
    // =========================================================
    $("sr-close").addEventListener("click", cleanup);

    $("sr-back").addEventListener("click", () => {
        if (App.page === "reader") {
            Progress.set(App.vol.key, App.vol.chapters[App.chIdx].id, getScrollPct());
            renderVolume(App.vol);
        } else if (App.page === "volume") {
            renderHome();
        }
    });

    $("sr-settings-btn").addEventListener("click", e => {
        e.stopPropagation();
        $("sr-settings-panel").classList.toggle("sr-open");
    });

    document.addEventListener("click", e => {
        const panel = $("sr-settings-panel");
        if (panel && panel.classList.contains("sr-open") && !panel.contains(e.target) && e.target.id !== "sr-settings-btn") {
            panel.classList.remove("sr-open");
        }
    });

    // ESC to close
    function onEsc(e) {
        if (e.key === "Escape") { e.preventDefault(); cleanup(); }
    }
    window.addEventListener("keydown", onEsc);

    // =========================================================
    // READER NAV EVENTS
    // =========================================================
    $("sr-prev").addEventListener("click", () => {
        if (App.chIdx > 0) {
            Progress.set(App.vol.key, App.vol.chapters[App.chIdx].id, getScrollPct());
            renderReader(App.vol, App.chIdx - 1);
        }
    });
    $("sr-next").addEventListener("click", () => {
        if (App.chIdx < App.vol.chapters.length - 1) {
            Progress.set(App.vol.key, App.vol.chapters[App.chIdx].id, getScrollPct());
            renderReader(App.vol, App.chIdx + 1);
        }
    });
    $("sr-ch-select").addEventListener("change", e => {
        const i = parseInt(e.target.value);
        if (i !== App.chIdx) {
            Progress.set(App.vol.key, App.vol.chapters[App.chIdx].id, getScrollPct());
            renderReader(App.vol, i);
        }
    });

    // =========================================================
    // SETTINGS EVENTS
    // =========================================================
    document.querySelectorAll(".sr-theme-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            Settings.get().theme = btn.dataset.theme;
            Settings.save(); Settings.apply();
        });
    });
    function bindSlider(sliderId, labelId, key, parse) {
        const el = $(sliderId); if (!el) return;
        el.addEventListener("input", () => {
            Settings.get()[key] = parse(el.value);
            $(labelId).textContent = Settings.get()[key];
            Settings.save(); Settings.apply();
        });
    }
    bindSlider("sr-fs-slider","sr-fs-label","fontSize",v=>parseInt(v));
    bindSlider("sr-lh-slider","sr-lh-label","lineHeight",v=>parseFloat(v));
    bindSlider("sr-mw-slider","sr-mw-label","maxWidth",v=>parseInt(v));
    const ffs = $("sr-ff-select");
    if (ffs) ffs.addEventListener("change", () => { Settings.get().fontFamily = ffs.value; Settings.save(); Settings.apply(); });

    // =========================================================
    // CLEANUP
    // =========================================================
    function cleanup() {
        stopScrollSave();
        window.removeEventListener("keydown", onEsc);
        $("sr-backdrop")?.remove();
        $("sr-style")?.remove();
        document.querySelector(\`script[data-sr-id="${scriptId}"]\`)?.remove();
    }

    // =========================================================
    // BOOT
    // =========================================================
    Settings.apply();
    renderHome();

})();
`;
        }

        // ------------------------------------------------------------------
        // TRAY: clicking the icon injects the script into Seanime's DOM
        // ------------------------------------------------------------------
        const tray = ctx.newTray({
            tooltipText: "Slime Reader",
            iconUrl: "data:image/svg+xml," + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ee8a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
            ),
            withContent: false,
        });

        tray.onClick(async () => {
            try {
                // Don't open twice
                if (await ctx.dom.queryOne("#sr-backdrop")) return;

                const body = await ctx.dom.queryOne("body");
                if (!body) return;

                const scriptId = "sr-script-" + Date.now();
                const script = await ctx.dom.createElement("script");
                script.setAttribute("data-sr-id", scriptId);
                script.setText(getInjectedScript(scriptId));
                body.append(script);
            } catch (err) {
                console.error("[SlimeReader] Tray error:", err);
            }
        });
    });
}

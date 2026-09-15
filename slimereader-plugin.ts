/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

function init() {
    $ui.register((ctx) => {
        console.log("[slime-reader] registered");

        const BASE = "https://raw.githubusercontent.com/tensurafan/tensurafan.github.io/master";

        const VOLUMES = [
            { id:"v6",    name:"Volume 6",               path:"/ln/v6.html",    coverSrc:"Volume 6" },
            { id:"v7",    name:"Volume 7",               path:"/ln/v7.html",    coverSrc:"Volume 7" },
            { id:"v8",    name:"Volume 8",               path:"/ln/v8.html",    coverSrc:"Volume 8" },
            { id:"v8_5",  name:"Vol 8.5 Side Stories",   path:"/ln/v8.5.html",  coverSrc:"Volume 8.5" },
            { id:"v9",    name:"Volume 9",               path:"/ln/v9.html",    coverSrc:"Volume 9" },
            { id:"v10",   name:"Volume 10",              path:"/ln/v10.html",   coverSrc:"Volume 10" },
            { id:"v11",   name:"Volume 11",              path:"/ln/v11.html",   coverSrc:"Volume 11" },
            { id:"v12",   name:"Volume 12",              path:"/ln/v12.html",   coverSrc:"Volume 12" },
            { id:"v13",   name:"Volume 13",              path:"/ln/v13.html",   coverSrc:"Volume 13" },
            { id:"v13_5", name:"Vol 13.5 Side Stories",  path:"/ln/v13.5.html", coverSrc:"Volume 13.5" },
            { id:"v14",   name:"Volume 14",              path:"/ln/v14.html",   coverSrc:"Volume 14" },
            { id:"v15",   name:"Volume 15",              path:"/ln/v15.html",   coverSrc:"Volume 15" },
            { id:"v16",   name:"Volume 16 (MTL)",        path:"/ln/v16.html",   coverSrc:"Volume 16" },
            { id:"v17",   name:"Volume 17 (MTL)",        path:"/ln/v17.html",   coverSrc:"Volume 17" },
            { id:"v18",   name:"Volume 18 (MTL)",        path:"/ln/v18.html",   coverSrc:"Volume 18" },
            { id:"v19",   name:"Volume 19 (MTL)",        path:"/ln/v19.html",   coverSrc:"Volume 19" },
            { id:"v20",   name:"Volume 20 (MTL)",        path:"/ln/v20.html",   coverSrc:"Volume 20" },
            { id:"b1",    name:"Booklets 1-4",           path:"/ln/b1.html",    coverSrc:"Booklets 1" },
            { id:"b5",    name:"Booklets 5-8",           path:"/ln/b5.html",    coverSrc:"Booklets 5" },
        ];

        // ── Progress ──────────────────────────────────────────────────────────
        function getProgress(id: string): number {
            try {
                const val = $storage.get<number>("sr_p_" + id);
                if (val === undefined || val === null) return 0;
                const n = Number(val);
                return isNaN(n) ? 0 : n;
            } catch(_) { return 0; }
        }
        function saveProgress(id: string, pct: number) {
            try { $storage.set("sr_p_" + id, pct); } catch(_) {}
        }
        function buildProgressMap(): Record<string, number> {
            const map: Record<string, number> = {};
            for (const v of VOLUMES) { map[v.id] = getProgress(v.id); }
            return map;
        }

        // ── Static cards HTML (embedded at init time, no channel sync needed) ─
        const CARDS_HTML = VOLUMES.map(v => {
            const coverPng  = `${BASE}/ln/sources/${encodeURIComponent(v.coverSrc)}/illustrations/cover.png`;
            const coverJpeg = `${BASE}/ln/sources/${encodeURIComponent(v.coverSrc)}/illustrations/cover.jpeg`;
            return `<div class="card" data-id="${v.id}" onclick="openVol('${v.id}','${encodeURIComponent(v.name)}')">` +
                `<div class="cover">` +
                `<img loading="lazy" src="${coverPng}" onerror="this.onerror=null;this.src='${coverJpeg}'" alt="${v.name}">` +
                `<div class="pbar-wrap"><div class="pbar-fill" id="pb-${v.id}" style="width:0%"></div></div>` +
                `</div>` +
                `<div class="vinfo"><div class="vname">${v.name}</div></div>` +
                `</div>`;
        }).join("");

        // ── State ─────────────────────────────────────────────────────────────
        const pageContent = ctx.state<string>("");
        const progressMap = ctx.state<Record<string, number>>({});

        // ── Webview ───────────────────────────────────────────────────────────
        const webview = ctx.newWebview({
            slot: "screen",
            fullWidth: true,
            autoHeight: false,
            height: "100vh",
            sidebar: {
                label: "Slime Reader",
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
            },
        });

        // Sync state to webview — docs confirm this fires on webview load too
        webview.channel.sync("pageContent", pageContent);
        webview.channel.sync("progressMap", progressMap);

        // Load a volume: fetch HTML server-side, push cleaned HTML to iframe
        webview.channel.on("load-volume", async (volId: string) => {
            console.log("[slime-reader] load-volume: " + volId);
            const vol = VOLUMES.find(v => v.id === volId);
            if (!vol) return;
            pageContent.set("__LOADING__");
            try {
                const res = await ctx.fetch(BASE + vol.path);
                if (!res.ok) {
                    pageContent.set(`<p style="color:#f0883e">HTTP ${res.status} — try again in a moment.</p>`);
                    return;
                }
                let html = res.text();

                // Replace term spans: <span data-term="Demon Lord" ...>JUNK</span> → "Demon Lord"
                html = html.replace(/<span\s[^>]*?data-term="([^"]*)"[^>]*>[\s\S]*?<\/span>/g, "$1");

                // Fix image src to absolute raw github URLs
                html = html.replace(/src="\/ln\//g, `src="${BASE}/ln/`);

                // Strip unwanted tags
                html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
                html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
                html = html.replace(/<nav[\s\S]*?<\/nav>/gi, "");
                html = html.replace(/<header[\s\S]*?<\/header>/gi, "");
                html = html.replace(/<footer[\s\S]*?<\/footer>/gi, "");

                // Keep href="#anchor" intact — the iframe will intercept clicks
                // Remove external hrefs only
                html = html.replace(/ href="http[^"]*"/g, "");

                pageContent.set(html);
            } catch(e: any) {
                pageContent.set(`<p style="color:#f0883e">Error: ${String(e)}</p>`);
            }
        });

        // Receive progress from iframe — data is received as-is (not JSON-stringified)
        webview.channel.on("save-progress", (data: { id: string; pct: number }) => {
            if (!data || !data.id) return;
            const pct = Number(data.pct);
            if (!isNaN(pct)) {
                saveProgress(data.id, pct);
                console.log("[slime-reader] saved " + data.id + " = " + pct + "%");
            }
        });

        webview.channel.on("go-home", (_: any) => {
            pageContent.set("");
            progressMap.set(buildProgressMap());
        });

        // ── Tray ──────────────────────────────────────────────────────────────
        const tray = ctx.newTray({
            tooltipText: "Slime Reader",
            iconUrl: "data:image/svg+xml," + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ee8a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
            ),
            withContent: false,
        });

        tray.onClick(() => {
            progressMap.set(buildProgressMap());
            ctx.screen.navigateTo(webview.getScreenPath());
        });

        // ── HTML ──────────────────────────────────────────────────────────────
        webview.setContent(() => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html { color-scheme: dark; height: 100%; overflow: hidden; }
body { height: 100%; background: #0d1117; color: #e2e8f0; font-family: -apple-system, "Segoe UI", system-ui, sans-serif; overflow: hidden; }
#app { display: flex; flex-direction: column; height: 100vh; }
#topbar { display: flex; align-items: center; gap: 10px; padding: 10px 18px; background: #161b22; border-bottom: 1px solid #30363d; flex-shrink: 0; }
.logo { font-weight: 700; font-size: .95rem; color: #7ee8a2; }
#back-btn { display: none; background: transparent; border: 1px solid #30363d; color: #8b949e; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: .82rem; }
#back-btn:hover { background: #21262d; color: #e2e8f0; }
#page-title { flex: 1; font-size: .82rem; color: #8b949e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#main { flex: 1; overflow-y: auto; overflow-x: hidden; }
#home-wrap { padding: 24px 20px; max-width: 1050px; margin: 0 auto; }
.hero { background: linear-gradient(135deg,#1a2332,#0d2137); border: 1px solid #30363d; border-radius: 12px; padding: 28px 36px; margin-bottom: 28px; display: flex; align-items: center; gap: 24px; }
.hero-ico { font-size: 48px; flex-shrink: 0; }
.hero h1 { font-size: 1.35rem; font-weight: 800; color: #7ee8a2; margin: 0 0 5px; }
.hero p { color: #8b949e; font-size: .85rem; line-height: 1.55; margin: 0; }
.sec { font-size: .88rem; font-weight: 700; color: #c9d1d9; margin: 0 0 14px; display: flex; align-items: center; gap: 8px; }
.sec::after { content: ''; flex: 1; height: 1px; background: #21262d; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(145px, 1fr)); gap: 14px; }
.card { background: #161b22; border: 1px solid #21262d; border-radius: 9px; overflow: hidden; cursor: pointer; transition: all .18s; }
.card:hover { border-color: #7ee8a2; transform: translateY(-2px); box-shadow: 0 8px 20px rgba(0,0,0,.4); }
.cover { width: 100%; aspect-ratio: 2/3; background: linear-gradient(135deg,#1f2a38,#0d1a28); position: relative; overflow: hidden; }
.cover img { width: 100%; height: 100%; object-fit: cover; display: block; }
.pbar-wrap { position: absolute; bottom: 0; left: 0; right: 0; height: 3px; background: rgba(255,255,255,.1); }
.pbar-fill { height: 100%; background: #7ee8a2; transition: width .3s; }
.vinfo { padding: 8px 10px 11px; }
.vname { font-size: .74rem; font-weight: 600; color: #c9d1d9; line-height: 1.3; }
#reader-wrap { display: none; padding: 32px 24px 80px; max-width: 760px; margin: 0 auto; font-size: 18px; line-height: 1.85; font-family: 'Georgia', serif; }
#reader-wrap p { margin-bottom: 1.1em; }
#reader-wrap img { max-width: 100%; height: auto; border-radius: 6px; margin: 10px auto; display: block; }
#reader-wrap h1 { font-family: system-ui, sans-serif; color: #7ee8a2; margin: 1.3em 0 .4em; font-size: 1.4rem; }
#reader-wrap h1.title { font-size: 1.6rem; }
#reader-wrap a[href^="#"] { color: #7ee8a2; text-decoration: underline; cursor: pointer; }
#reader-wrap a:not([href]) { color: inherit; text-decoration: none; cursor: default; }
#reader-wrap .scenebreak { text-align: center; margin: 1.5em 0; }
#reader-wrap .ornament-soft { width: 60px; opacity: .5; }
.spinner { display: flex; align-items: center; justify-content: center; height: 200px; }
.ring { width: 36px; height: 36px; border: 3px solid #21262d; border-top-color: #7ee8a2; border-radius: 50%; animation: spin .7s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }
::-webkit-scrollbar { width: 5px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
</style>
</head>
<body>
<div id="app">
  <div id="topbar">
    <span class="logo">🟢 Slime Reader</span>
    <button id="back-btn" onclick="goHome()">← Back</button>
    <span id="page-title"></span>
  </div>
  <div id="main">
    <div id="home-wrap">
      <div class="hero">
        <div class="hero-ico">🟢</div>
        <div>
          <h1>That Time I Got Reincarnated as a Slime</h1>
          <p>Fan-translated light novels &middot; Vols 6&ndash;20 + Side Stories</p>
        </div>
      </div>
      <div class="sec">All Volumes</div>
      <div class="grid">${CARDS_HTML}</div>
    </div>
    <div id="reader-wrap"></div>
  </div>
</div>
<script>
var _volId = null;
var _saveTimer = null;
var _progMap = {};

// Intercept anchor clicks to scroll instead of navigate (which triggers sandbox error)
document.addEventListener("click", function(e) {
    var a = e.target.closest("a");
    if (!a) return;
    var href = a.getAttribute("href");
    if (href && href.charAt(0) === "#") {
        e.preventDefault();
        e.stopPropagation();
        var target = document.getElementById(href.slice(1));
        if (target) target.scrollIntoView({ behavior: "smooth" });
    }
}, true);

// Progress save — send plain object (channel receives it as-is per docs)
function startSave(id) {
    stopSave();
    _saveTimer = setInterval(function() {
        var m = document.getElementById("main");
        if (!m || m.scrollHeight <= m.clientHeight) return;
        var pct = Math.round(m.scrollTop / (m.scrollHeight - m.clientHeight) * 1000) / 10;
        if (window.webview) window.webview.send("save-progress", { id: id, pct: pct });
    }, 2000);
}
function stopSave() { if (_saveTimer) { clearInterval(_saveTimer); _saveTimer = null; } }

function saveNow() {
    if (!_volId) return;
    var m = document.getElementById("main");
    if (!m || m.scrollHeight <= m.clientHeight) return;
    var pct = Math.round(m.scrollTop / (m.scrollHeight - m.clientHeight) * 1000) / 10;
    if (window.webview) window.webview.send("save-progress", { id: _volId, pct: pct });
}

function restoreScroll(pct) {
    if (!pct || pct <= 0) return;
    var m = document.getElementById("main");
    if (!m) return;
    setTimeout(function() { m.scrollTop = (pct / 100) * (m.scrollHeight - m.clientHeight); }, 300);
}

function refreshBars(map) {
    Object.keys(map).forEach(function(id) {
        var b = document.getElementById("pb-" + id);
        if (b) b.style.width = (map[id] || 0) + "%";
    });
}

function openVol(id, nameEnc) {
    _volId = id;
    document.getElementById("home-wrap").style.display = "none";
    document.getElementById("reader-wrap").style.display = "block";
    document.getElementById("back-btn").style.display = "inline-block";
    document.getElementById("page-title").textContent = decodeURIComponent(nameEnc);
    document.getElementById("reader-wrap").innerHTML = '<div class="spinner"><div class="ring"></div></div>';
    document.getElementById("main").scrollTop = 0;
    if (window.webview) window.webview.send("load-volume", id);
}

function goHome() {
    saveNow();
    stopSave();
    _volId = null;
    if (window.webview) window.webview.send("go-home", null);
    document.getElementById("home-wrap").style.display = "block";
    document.getElementById("reader-wrap").style.display = "none";
    document.getElementById("reader-wrap").innerHTML = "";
    document.getElementById("back-btn").style.display = "none";
    document.getElementById("page-title").textContent = "";
    document.getElementById("main").scrollTop = 0;
}

if (window.webview) {
    window.webview.on("pageContent", function(html) {
        var r = document.getElementById("reader-wrap");
        if (!html || html === "__LOADING__") {
            r.innerHTML = '<div class="spinner"><div class="ring"></div></div>';
            return;
        }
        r.innerHTML = html;
        document.getElementById("main").scrollTop = 0;
        var savedPct = _progMap[_volId] || 0;
        restoreScroll(savedPct);
        startSave(_volId);
    });

    window.webview.on("progressMap", function(map) {
        _progMap = map || {};
        refreshBars(_progMap);
    });
}
</script>
</body>
</html>`);
    });
}

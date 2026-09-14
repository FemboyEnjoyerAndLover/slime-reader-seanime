/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

function init() {
    $ui.register((ctx) => {
        console.log("[slime-reader] registered");

        const BASE = "https://tensurafan.github.io";

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

        // Cover URL: /ln/sources/Volume 6/illustrations/cover.png (try png, fallback jpeg handled in HTML)
        function coverUrl(coverSrc: string): string {
            return `${BASE}/ln/sources/${encodeURIComponent(coverSrc)}/illustrations/cover.png`;
        }

        // Build static card HTML — embedded directly so grid renders immediately on load
        const CARDS_HTML = VOLUMES.map(v => {
            const cover = coverUrl(v.coverSrc);
            const pctKey = `sr_prog_${v.id}`;
            return `<div class="card" data-id="${v.id}" onclick="openVol('${v.id}','${v.name}','${v.path}')">` +
                `<div class="cover">` +
                `<img src="${cover}" onerror="this.src='${cover.replace('.png','.jpeg')}'" alt="${v.name}">` +
                `<div class="pbar-wrap"><div class="pbar-fill" id="pb-${v.id}" style="width:0%"></div></div>` +
                `</div>` +
                `<div class="vinfo"><div class="vname">${v.name}</div></div>` +
                `</div>`;
        }).join("");

        const pageContent = ctx.state<string>("");
        const isLoading   = ctx.state<boolean>(false);
        const currentVol  = ctx.state<string>("");

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

        webview.channel.sync("pageContent", pageContent);
        webview.channel.sync("isLoading",   isLoading);
        webview.channel.sync("currentVol",  currentVol);

        webview.channel.on("load-volume", async (volId: string) => {
            console.log("[slime-reader] load-volume: " + volId);
            const vol = VOLUMES.find(v => v.id === volId);
            if (!vol) return;
            isLoading.set(true);
            currentVol.set(volId);
            try {
                const res = await ctx.fetch(BASE + vol.path);
                if (!res.ok) {
                    pageContent.set(`<p style="color:#f0883e">HTTP ${res.status} loading ${vol.name}</p>`);
                } else {
                    let html = res.text();

                    // Fix ALL template expression variants — extract the fallback (last |..| segment)
                    // Covers: {:expr:}|fallback| and also nested parens like {:this.app.capitalCase(...):}|fallback|
                    html = html.replace(/\{:[^}]*?\}[^|]*\|([^|]*)\|/g, "$1");
                    // Catch any remaining {anything}|fallback| patterns
                    html = html.replace(/\{[^}]*\}\|([^|]*)\|/g, "$1");

                    // Fix image paths to absolute URLs
                    html = html.replace(/src="\/ln\//g, `src="${BASE}/ln/`);

                    // Strip scripts, styles, nav, header, footer
                    html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
                    html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
                    html = html.replace(/<nav[\s\S]*?<\/nav>/gi, "");
                    html = html.replace(/<header[\s\S]*?<\/header>/gi, "");
                    html = html.replace(/<footer[\s\S]*?<\/footer>/gi, "");

                    // Remove onclick attributes (the site's term-picker handlers)
                    html = html.replace(/ onclick="[^"]*"/g, "");

                    pageContent.set(html);
                }
            } catch(e: any) {
                pageContent.set(`<p style="color:#f0883e">Error: ${String(e)}</p>`);
            }
            isLoading.set(false);
        });

        webview.channel.on("go-home", (_: any) => {
            currentVol.set("");
            pageContent.set("");
        });

        const tray = ctx.newTray({
            tooltipText: "Slime Reader",
            iconUrl: "data:image/svg+xml," + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ee8a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
            ),
            withContent: false,
        });

        tray.onClick(() => {
            ctx.screen.navigateTo(webview.getScreenPath());
        });

        webview.setContent(() => `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body { height: 100%; color-scheme: dark; background: #0d1117; color: #e2e8f0; font-family: -apple-system, "Segoe UI", system-ui, sans-serif; overflow: hidden; }
#app { display: flex; flex-direction: column; height: 100vh; }
#topbar { display: flex; align-items: center; gap: 10px; padding: 10px 18px; background: #161b22; border-bottom: 1px solid #30363d; flex-shrink: 0; }
.logo { font-weight: 700; font-size: .95rem; color: #7ee8a2; }
#back-btn { display: none; background: transparent; border: 1px solid #30363d; color: #8b949e; padding: 5px 12px; border-radius: 6px; cursor: pointer; font-size: .82rem; }
#back-btn:hover { background: #21262d; color: #e2e8f0; }
#page-title { flex: 1; font-size: .82rem; color: #8b949e; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
#main { flex: 1; overflow-y: auto; overflow-x: hidden; }
/* HOME */
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
/* READER */
#reader-wrap { display: none; padding: 32px 24px 80px; max-width: 760px; margin: 0 auto; font-size: 18px; line-height: 1.85; font-family: 'Georgia', serif; }
#reader-wrap p { margin-bottom: 1.1em; }
#reader-wrap img { max-width: 100%; border-radius: 6px; margin: 10px auto; display: block; }
#reader-wrap h1 { font-family: system-ui, sans-serif; color: #7ee8a2; margin: 1.3em 0 .4em; font-size: 1.4rem; }
#reader-wrap h1.title { font-size: 1.6rem; }
#reader-wrap a { color: #7ee8a2; text-decoration: none; }
#reader-wrap .clickable { cursor: default; border-bottom: none; }
#reader-wrap .scenebreak { text-align: center; margin: 1.5em 0; }
#reader-wrap .ornament-soft { width: 60px; opacity: .4; }
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
// ── Progress (localStorage) ──────────────────────────────────────
var PROG_PREFIX = "sr_prog_";

function getProgress(volId) {
    try { return parseFloat(localStorage.getItem(PROG_PREFIX + volId) || "0") || 0; }
    catch(e) { return 0; }
}

function setProgress(volId, pct) {
    try { localStorage.setItem(PROG_PREFIX + volId, String(pct)); } catch(e) {}
}

// Load and show progress bars on all cards
function refreshProgressBars() {
    document.querySelectorAll(".card").forEach(function(card) {
        var id = card.dataset.id;
        var pct = getProgress(id);
        var bar = document.getElementById("pb-" + id);
        if (bar) bar.style.width = pct + "%";
    });
}

// ── Scroll save ───────────────────────────────────────────────────
var _currentVolId = null;
var _scrollTimer  = null;

function startScrollSave(volId) {
    stopScrollSave();
    _currentVolId = volId;
    _scrollTimer = setInterval(function() {
        var main = document.getElementById("main");
        if (!main || main.scrollHeight <= main.clientHeight) return;
        var pct = Math.round(main.scrollTop / (main.scrollHeight - main.clientHeight) * 1000) / 10;
        setProgress(volId, pct);
    }, 2000);
}

function stopScrollSave() {
    if (_scrollTimer) { clearInterval(_scrollTimer); _scrollTimer = null; }
}

function restoreScroll(volId) {
    var pct = getProgress(volId);
    if (pct <= 0) return;
    var main = document.getElementById("main");
    if (!main) return;
    setTimeout(function() {
        main.scrollTop = (pct / 100) * (main.scrollHeight - main.clientHeight);
    }, 150);
}

// ── Navigation ────────────────────────────────────────────────────
function openVol(id, name, path) {
    stopScrollSave();
    document.getElementById("home-wrap").style.display = "none";
    document.getElementById("reader-wrap").style.display = "block";
    document.getElementById("back-btn").style.display = "inline-block";
    document.getElementById("page-title").textContent = name;
    document.getElementById("reader-wrap").innerHTML =
        '<div class="spinner"><div class="ring"></div></div>';
    document.getElementById("main").scrollTop = 0;
    if (window.webview) window.webview.send("load-volume", id);
    _currentVolId = id;
}

function goHome() {
    stopScrollSave();
    if (_currentVolId) {
        // Save current scroll before leaving
        var main = document.getElementById("main");
        if (main && main.scrollHeight > main.clientHeight) {
            var pct = Math.round(main.scrollTop / (main.scrollHeight - main.clientHeight) * 1000) / 10;
            setProgress(_currentVolId, pct);
        }
    }
    _currentVolId = null;
    if (window.webview) window.webview.send("go-home", null);
    document.getElementById("home-wrap").style.display = "block";
    document.getElementById("reader-wrap").style.display = "none";
    document.getElementById("reader-wrap").innerHTML = "";
    document.getElementById("back-btn").style.display = "none";
    document.getElementById("page-title").textContent = "";
    document.getElementById("main").scrollTop = 0;
    refreshProgressBars();
}

// ── Channel ───────────────────────────────────────────────────────
if (window.webview) {
    window.webview.on("pageContent", function(html) {
        if (!html) return;
        var r = document.getElementById("reader-wrap");
        r.innerHTML = html;
        document.getElementById("main").scrollTop = 0;
        // Restore saved scroll position
        if (_currentVolId) {
            restoreScroll(_currentVolId);
            startScrollSave(_currentVolId);
        }
    });
}

// ── Init ──────────────────────────────────────────────────────────
refreshProgressBars();
</script>
</body>
</html>`);
    });
}

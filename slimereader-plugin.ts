/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

function init() {
    $ui.register((ctx) => {
        console.log("[slime-reader] registered");

        const BASE = "https://tensurafan.github.io";

        const VOLUMES = [
            { id: "v6",    name: "Volume 6",                 path: "/ln/v6.html",    emoji: "🟢" },
            { id: "v7",    name: "Volume 7",                 path: "/ln/v7.html",    emoji: "⚔️" },
            { id: "v8",    name: "Volume 8",                 path: "/ln/v8.html",    emoji: "🌀" },
            { id: "v8_5",  name: "Vol 8.5 Side Stories",     path: "/ln/v8.5.html",  emoji: "📖" },
            { id: "v9",    name: "Volume 9",                 path: "/ln/v9.html",    emoji: "🌿" },
            { id: "v10",   name: "Volume 10",                path: "/ln/v10.html",   emoji: "💥" },
            { id: "v11",   name: "Volume 11",                path: "/ln/v11.html",   emoji: "👑" },
            { id: "v12",   name: "Volume 12",                path: "/ln/v12.html",   emoji: "🔒" },
            { id: "v13",   name: "Volume 13",                path: "/ln/v13.html",   emoji: "🗺️" },
            { id: "v13_5", name: "Vol 13.5 Side Stories",    path: "/ln/v13.5.html", emoji: "📖" },
            { id: "v14",   name: "Volume 14",                path: "/ln/v14.html",   emoji: "🌪️" },
            { id: "v15",   name: "Volume 15",                path: "/ln/v15.html",   emoji: "🏚️" },
            { id: "v16",   name: "Volume 16 (MTL)",          path: "/ln/v16.html",   emoji: "🌌" },
            { id: "v17",   name: "Volume 17 (MTL)",          path: "/ln/v17.html",   emoji: "🐉" },
            { id: "v18",   name: "Volume 18 (MTL)",          path: "/ln/v18.html",   emoji: "⚡" },
            { id: "v19",   name: "Volume 19 (MTL)",          path: "/ln/v19.html",   emoji: "🌟" },
            { id: "v20",   name: "Volume 20 (MTL)",          path: "/ln/v20.html",   emoji: "✨" },
            { id: "b1",    name: "Booklets 1-4",             path: "/ln/b1.html",    emoji: "📚" },
            { id: "b5",    name: "Booklets 5-8",             path: "/ln/b5.html",    emoji: "📚" },
        ];

        // Keep references to the key elements so we never re-query them
        let _body: any = null;
        let _root: any = null;
        let _content: any = null;  // the scrollable content div inside root

        const CSS = `
#sr-root{position:fixed;inset:0;z-index:99999;background:#0d1117;color:#e2e8f0;font-family:-apple-system,"Segoe UI",system-ui,sans-serif;display:flex;flex-direction:column;}
#sr-topbar{display:flex;align-items:center;gap:10px;padding:10px 18px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0;}
#sr-logo{font-weight:700;font-size:.95rem;color:#7ee8a2;}
#sr-back{background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:.82rem;}
#sr-back:hover{background:#21262d;color:#e2e8f0;}
#sr-title{flex:1;font-size:.82rem;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0;}
#sr-close{background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:.82rem;}
#sr-close:hover{background:#21262d;color:#e2e8f0;}
#sr-content{flex:1;overflow-y:auto;overflow-x:hidden;padding:24px 20px;}
#sr-content p{margin-bottom:1.1em;}
#sr-content img{max-width:100%;border-radius:6px;margin:10px auto;display:block;}
#sr-content h1{font-family:system-ui,sans-serif;color:#7ee8a2;margin:1.3em 0 .4em;font-size:1.4rem;}
#sr-content a{color:#7ee8a2;}
.sr-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:14px;max-width:1050px;margin:0 auto;}
.sr-hero{background:linear-gradient(135deg,#1a2332,#0d2137);border:1px solid #30363d;border-radius:12px;padding:28px 36px;margin-bottom:28px;display:flex;align-items:center;gap:24px;max-width:1050px;margin-left:auto;margin-right:auto;}
.sr-hero h1{font-size:1.35rem;font-weight:800;color:#7ee8a2;margin:0 0 5px;}
.sr-hero p{color:#8b949e;font-size:.85rem;line-height:1.55;margin:0;}
.sr-card{background:#161b22;border:1px solid #21262d;border-radius:9px;overflow:hidden;cursor:pointer;}
.sr-card:hover{border-color:#7ee8a2;}
.sr-cover{width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);display:flex;align-items:center;justify-content:center;font-size:2rem;border-bottom:1px solid #21262d;}
.sr-vinfo{padding:8px 10px 11px;}
.sr-vname{font-size:.74rem;font-weight:600;color:#c9d1d9;line-height:1.3;}
.sr-reader{max-width:760px;margin:0 auto;font-size:18px;line-height:1.85;font-family:'Georgia',serif;}
::-webkit-scrollbar{width:5px;}::-webkit-scrollbar-track{background:transparent;}::-webkit-scrollbar-thumb{background:#30363d;border-radius:3px;}
        `;

        function cleanHtml(html: string): string {
            html = html.replace(/\{:[^|]*:\}\|([^|]*)\|/g, "$1");
            html = html.replace(/\{[^}|]*\}\|([^|]*)\|/g, "$1");
            html = html.replace(/src="\/ln\//g, `src="${BASE}/ln/`);
            html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
            html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
            html = html.replace(/<nav[\s\S]*?<\/nav>/gi, "");
            html = html.replace(/<header[\s\S]*?<\/header>/gi, "");
            html = html.replace(/<footer[\s\S]*?<\/footer>/gi, "");
            return html;
        }

        function homeHTML(): string {
            const cards = VOLUMES.map(v =>
                `<div class="sr-card" data-vol="${v.id}">
                    <div class="sr-cover">${v.emoji}</div>
                    <div class="sr-vinfo"><div class="sr-vname">${v.name}</div></div>
                </div>`
            ).join("");
            return `
                <div class="sr-hero">
                    <div style="font-size:48px;flex-shrink:0">🟢</div>
                    <div>
                        <h1>That Time I Got Reincarnated as a Slime</h1>
                        <p>Fan-translated LNs · Vols 6–20 + Side Stories</p>
                    </div>
                </div>
                <div class="sr-grid">${cards}</div>`;
        }

        // Build the full-screen overlay. Only called once.
        async function buildUI() {
            try {
                console.log("[slime-reader] building UI");

                // Inject CSS
                const styleEl = await ctx.dom.createElement("style");
                styleEl.setAttribute("id", "sr-style");
                styleEl.setCssText(CSS);
                _body.append(styleEl);

                // Root container
                _root = await ctx.dom.createElement("div");
                _root.setAttribute("id", "sr-root");

                // Topbar
                const topbar = await ctx.dom.createElement("div");
                topbar.setAttribute("id", "sr-topbar");
                topbar.setProperty("innerHTML",
                    `<span id="sr-logo">🟢 Slime Reader</span>
                     <button id="sr-back" style="display:none">← Back</button>
                     <span id="sr-title"></span>
                     <button id="sr-close">✕ Close</button>`
                );
                _root.append(topbar);

                // Scrollable content area
                _content = await ctx.dom.createElement("div");
                _content.setAttribute("id", "sr-content");
                _content.setProperty("innerHTML", homeHTML());
                _root.append(_content);

                // Append root to body — everything is in the DOM now
                _body.append(_root);
                console.log("[slime-reader] root appended");

                // Now wire events using stored references — no querying needed
                // Close button
                const closeBtn = await ctx.dom.queryOne("#sr-close");
                if (closeBtn) {
                    closeBtn.addEventListener("click", async () => {
                        console.log("[slime-reader] close clicked");
                        const r = await ctx.dom.queryOne("#sr-root");
                        const s = await ctx.dom.queryOne("#sr-style");
                        if (r) r.remove();
                        if (s) s.remove();
                        _root = null;
                        _content = null;
                    });
                }

                // Back button
                const backBtn = await ctx.dom.queryOne("#sr-back");
                if (backBtn) {
                    backBtn.addEventListener("click", async () => {
                        console.log("[slime-reader] back clicked");
                        const t = await ctx.dom.queryOne("#sr-title");
                        if (t) t.setProperty("textContent", "");
                        const b = await ctx.dom.queryOne("#sr-back");
                        if (b) b.setStyle("display", "none");
                        _content.setProperty("innerHTML", homeHTML());
                        // Re-wire volume cards
                        await wireCards();
                    });
                }

                // Wire volume cards
                await wireCards();

                console.log("[slime-reader] UI ready");
            } catch(e: any) {
                console.error("[slime-reader] buildUI error: " + String(e));
            }
        }

        async function wireCards() {
            try {
                const cards = await ctx.dom.query(".sr-card");
                console.log("[slime-reader] wiring " + cards.length + " cards");
                for (const card of cards) {
                    const volId = await card.getAttribute("data-vol");
                    if (!volId) continue;
                    const vol = VOLUMES.find(v => v.id === volId);
                    if (!vol) continue;
                    // Capture vol in closure
                    (function(v) {
                        card.addEventListener("click", async () => {
                            console.log("[slime-reader] opening " + v.name);
                            await openVolume(v);
                        });
                    })(vol);
                }
            } catch(e: any) {
                console.error("[slime-reader] wireCards error: " + String(e));
            }
        }

        async function openVolume(vol: { id: string; name: string; path: string; emoji: string }) {
            try {
                // Update topbar
                const t = await ctx.dom.queryOne("#sr-title");
                if (t) t.setProperty("textContent", vol.name);
                const b = await ctx.dom.queryOne("#sr-back");
                if (b) b.setStyle("display", "inline-block");

                // Show loading
                _content.setProperty("innerHTML",
                    `<div class="sr-reader"><p style="color:#8b949e;padding-top:40px;text-align:center">Loading ${vol.name}…</p></div>`
                );

                // Fetch volume HTML
                console.log("[slime-reader] fetching " + BASE + vol.path);
                const res = ctx.fetch(BASE + vol.path);
                if (!res.ok) throw new Error("HTTP " + res.status);
                const html = cleanHtml(res.text());

                _content.setProperty("innerHTML", `<div class="sr-reader">${html}</div>`);
                console.log("[slime-reader] loaded " + vol.name);
            } catch(e: any) {
                console.error("[slime-reader] openVolume error: " + String(e));
                _content.setProperty("innerHTML",
                    `<div class="sr-reader"><p style="color:#f0883e;padding:40px">
                        Failed to load ${vol.name}: ${String(e)}<br><br>
                        <a href="${BASE + vol.path}" target="_blank" style="color:#f0883e">${BASE + vol.path}</a>
                    </p></div>`
                );
            }
        }

        // Tray
        const tray = ctx.newTray({
            tooltipText: "Slime Reader",
            iconUrl: "data:image/svg+xml," + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ee8a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
            ),
            withContent: false,
        });

        tray.onClick(async () => {
            console.log("[slime-reader] tray clicked");
            try {
                // If already open, do nothing
                if (await ctx.dom.queryOne("#sr-root")) {
                    console.log("[slime-reader] already open");
                    return;
                }
                _body = await ctx.dom.queryOne("body");
                if (!_body) { console.error("[slime-reader] no body"); return; }
                await buildUI();
            } catch(e: any) {
                console.error("[slime-reader] tray error: " + String(e));
            }
        });
    });
}

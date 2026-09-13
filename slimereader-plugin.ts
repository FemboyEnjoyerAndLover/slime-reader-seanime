/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

// Slime Reader – uses ctx.dom API exclusively (no script injection).
// UI is injected as HTML via setProperty("innerHTML"), interactivity via
// server-side addEventListener which calls back into this plugin.

function init() {
    $ui.register((ctx) => {
        console.log("[slime-reader] init");

        const BASE = "https://tensurafan.github.io";

        const VOLUMES = [
            { id: "v6",    name: "Volume 6",                 path: "/ln/v6.html",    emoji: "🟢" },
            { id: "v7",    name: "Volume 7",                 path: "/ln/v7.html",    emoji: "⚔️" },
            { id: "v8",    name: "Volume 8",                 path: "/ln/v8.html",    emoji: "🌀" },
            { id: "v8_5",  name: "Volume 8.5 Side Stories",  path: "/ln/v8.5.html",  emoji: "📖" },
            { id: "v9",    name: "Volume 9",                 path: "/ln/v9.html",    emoji: "🌿" },
            { id: "v10",   name: "Volume 10",                path: "/ln/v10.html",   emoji: "💥" },
            { id: "v11",   name: "Volume 11",                path: "/ln/v11.html",   emoji: "👑" },
            { id: "v12",   name: "Volume 12",                path: "/ln/v12.html",   emoji: "🔒" },
            { id: "v13",   name: "Volume 13",                path: "/ln/v13.html",   emoji: "🗺️" },
            { id: "v13_5", name: "Volume 13.5 Side Stories", path: "/ln/v13.5.html", emoji: "📖" },
            { id: "v14",   name: "Volume 14",                path: "/ln/v14.html",   emoji: "🌪️" },
            { id: "v15",   name: "Volume 15",                path: "/ln/v15.html",   emoji: "🏚️" },
            { id: "v16",   name: "Volume 16 (Edited MTL)",   path: "/ln/v16.html",   emoji: "🌌" },
            { id: "v17",   name: "Volume 17 (Edited MTL)",   path: "/ln/v17.html",   emoji: "🐉" },
            { id: "v18",   name: "Volume 18 (Edited MTL)",   path: "/ln/v18.html",   emoji: "⚡" },
            { id: "v19",   name: "Volume 19 (Edited MTL)",   path: "/ln/v19.html",   emoji: "🌟" },
            { id: "v20",   name: "Volume 20 (Edited MTL)",   path: "/ln/v20.html",   emoji: "✨" },
            { id: "b1",    name: "Special Booklets 1-4",     path: "/ln/b1.html",    emoji: "📚" },
            { id: "b5",    name: "Special Booklets 5-8",     path: "/ln/b5.html",    emoji: "📚" },
        ];

        // ── state ─────────────────────────────────────────────────────────────
        const currentVol = ctx.state<string | null>(null);
        const chapterHtml = ctx.state<string>("");
        const loading = ctx.state<boolean>(false);
        const errorMsg = ctx.state<string>("");

        // ── helpers ───────────────────────────────────────────────────────────
        function progressKey(id: string) { return "sr5_prog_" + id; }

        function getProgress(id: string): number {
            try {
                const v = $storage.get<string>(progressKey(id));
                return v ? parseFloat(v) : 0;
            } catch(_) { return 0; }
        }

        function setProgress(id: string, pct: number) {
            try { $storage.set(progressKey(id), String(pct)); } catch(_) {}
        }

        // ── fetch volume ──────────────────────────────────────────────────────
        async function loadVolume(vol: { id: string; name: string; path: string; emoji: string }) {
            loading.set(true);
            errorMsg.set("");
            currentVol.set(vol.id);
            chapterHtml.set("<p style='color:#8b949e;padding:20px'>Loading " + vol.name + "…</p>");

            try {
                const res = ctx.fetch(BASE + vol.path);
                if (!res.ok) throw new Error("HTTP " + res.status);
                let html = res.text();

                // Clean template expressions
                html = html.replace(/\{:[^|]*:\}\|([^|]*)\|/g, "$1");
                html = html.replace(/\{[^}|]*\}\|([^|]*)\|/g, "$1");
                // Fix image paths
                html = html.replace(/src="\/ln\//g, 'src="' + BASE + '/ln/');
                // Strip scripts and styles from the fetched HTML
                html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
                html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
                html = html.replace(/<nav[\s\S]*?<\/nav>/gi, "");
                html = html.replace(/<header[\s\S]*?<\/header>/gi, "");
                html = html.replace(/<footer[\s\S]*?<\/footer>/gi, "");

                chapterHtml.set(html);
                loading.set(false);
            } catch(e: any) {
                errorMsg.set("Failed to load " + vol.name + ": " + (e?.message || String(e)));
                chapterHtml.set("");
                loading.set(false);
            }
        }

        // ── CSS ───────────────────────────────────────────────────────────────
        const CSS = `
            #sr-root { position:fixed;inset:0;z-index:99999;background:#0d1117;display:flex;flex-direction:column;font-family:-apple-system,"Segoe UI",system-ui,sans-serif;color:#e2e8f0; }
            #sr-bar { display:flex;align-items:center;gap:10px;padding:10px 18px;background:#161b22;border-bottom:1px solid #30363d;flex-shrink:0; }
            .sr-logo { font-weight:700;font-size:.95rem;color:#7ee8a2; }
            #sr-close { background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:.85rem;margin-left:auto; }
            #sr-close:hover { background:#21262d;color:#e2e8f0; }
            #sr-back { background:transparent;border:1px solid #30363d;color:#8b949e;padding:5px 12px;border-radius:6px;cursor:pointer;font-size:.85rem;display:none; }
            #sr-back.show { display:inline-block; }
            #sr-back:hover { background:#21262d;color:#e2e8f0; }
            #sr-bar-title { flex:1;font-size:.82rem;color:#8b949e;overflow:hidden;text-overflow:ellipsis;white-space:nowrap; }
            #sr-main { flex:1;overflow-y:auto;overflow-x:hidden; }
            #sr-home { padding:24px 20px;max-width:1050px;margin:0 auto; }
            .sr-hero { background:linear-gradient(135deg,#1a2332,#0d2137);border:1px solid #30363d;border-radius:12px;padding:28px 36px;margin-bottom:28px;display:flex;align-items:center;gap:24px; }
            .sr-hero-ico { font-size:48px;flex-shrink:0; }
            .sr-hero h1 { font-size:1.35rem;font-weight:800;color:#7ee8a2;margin:0 0 5px; }
            .sr-hero p { color:#8b949e;font-size:.85rem;line-height:1.55;margin:0; }
            .sr-sec { font-size:.88rem;font-weight:700;color:#c9d1d9;margin:0 0 13px;display:flex;align-items:center;gap:8px; }
            .sr-sec::after { content:'';flex:1;height:1px;background:#21262d; }
            .sr-grid { display:grid;grid-template-columns:repeat(auto-fill,minmax(145px,1fr));gap:14px;margin-bottom:32px; }
            .sr-card { background:#161b22;border:1px solid #21262d;border-radius:9px;overflow:hidden;cursor:pointer;transition:all .18s; }
            .sr-card:hover { border-color:#7ee8a2;transform:translateY(-2px);box-shadow:0 8px 20px rgba(0,0,0,.4); }
            .sr-cover { width:100%;aspect-ratio:2/3;background:linear-gradient(135deg,#1f2a38,#0d1a28);display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:2rem;border-bottom:1px solid #21262d;position:relative; }
            .sr-vnum { font-size:.54rem;font-weight:700;letter-spacing:.1em;text-transform:uppercase;color:#7ee8a2;background:rgba(0,0,0,.75);padding:2px 6px;border-radius:3px;position:absolute;top:6px;left:6px; }
            .sr-pb { position:absolute;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,.1); }
            .sr-pbf { height:100%;background:#7ee8a2; }
            .sr-rdg { position:absolute;top:6px;right:6px;background:#7ee8a2;color:#0d1117;font-size:.5rem;font-weight:800;text-transform:uppercase;padding:2px 5px;border-radius:3px; }
            .sr-vinfo { padding:8px 10px 11px; }
            .sr-vname { font-size:.74rem;font-weight:600;color:#c9d1d9;line-height:1.3;margin-bottom:2px; }
            #sr-reader { padding:32px 24px 80px;max-width:760px;margin:0 auto;font-size:18px;line-height:1.85;color:#e2e8f0;font-family:'Georgia',serif; }
            #sr-reader p { margin-bottom:1.1em; }
            #sr-reader img { max-width:100%;border-radius:6px;margin:10px auto;display:block; }
            #sr-reader h1 { font-family:system-ui,sans-serif;color:#7ee8a2;margin:1.3em 0 .4em;font-size:1.4rem; }
            ::-webkit-scrollbar { width:5px; } ::-webkit-scrollbar-track { background:transparent; } ::-webkit-scrollbar-thumb { background:#30363d;border-radius:3px; }
        `;

        // ── build shell once on tray click ────────────────────────────────────
        async function buildUI() {
            const body = await ctx.dom.queryOne("body");
            if (!body) return;

            // Inject CSS
            const styleEl = await ctx.dom.createElement("style");
            styleEl.setAttribute("id", "sr-style");
            styleEl.setCssText(CSS);
            body.append(styleEl);

            // Build root div with home page HTML
            const root = await ctx.dom.createElement("div");
            root.setAttribute("id", "sr-root");
            root.setProperty("innerHTML", buildHomeHTML());
            body.append(root);

            // Wire close button
            const closeBtn = await ctx.dom.queryOne("#sr-close");
            if (closeBtn) closeBtn.addEventListener("click", async () => {
                const r = await ctx.dom.queryOne("#sr-root");
                const s = await ctx.dom.queryOne("#sr-style");
                if (r) r.remove();
                if (s) s.remove();
            });

            // Wire volume cards
            const cards = await ctx.dom.query(".sr-card");
            for (const card of cards) {
                const volId = await card.getAttribute("data-id");
                card.addEventListener("click", async () => {
                    const vol = VOLUMES.find(v => v.id === volId);
                    if (!vol) return;
                    await showReader(vol);
                });
            }
        }

        async function showReader(vol: { id: string; name: string; path: string; emoji: string }) {
            // Update topbar
            const titleEl = await ctx.dom.queryOne("#sr-bar-title");
            if (titleEl) titleEl.setProperty("textContent", vol.name);
            const backBtn = await ctx.dom.queryOne("#sr-back");
            if (backBtn) backBtn.addClass("show");

            // Show loading in main
            const main = await ctx.dom.queryOne("#sr-main");
            if (!main) return;
            main.setProperty("innerHTML", `<div id="sr-reader"><p style="color:#8b949e">Loading ${vol.name}…</p></div>`);

            // Fetch volume
            try {
                const res = ctx.fetch(BASE + vol.path);
                if (!res.ok) throw new Error("HTTP " + res.status);
                let html = res.text();
                html = html.replace(/\{:[^|]*:\}\|([^|]*)\|/g, "$1");
                html = html.replace(/\{[^}|]*\}\|([^|]*)\|/g, "$1");
                html = html.replace(/src="\/ln\//g, `src="${BASE}/ln/`);
                html = html.replace(/<script[\s\S]*?<\/script>/gi, "");
                html = html.replace(/<style[\s\S]*?<\/style>/gi, "");
                html = html.replace(/<nav[\s\S]*?<\/nav>/gi, "");
                html = html.replace(/<header[\s\S]*?<\/header>/gi, "");
                html = html.replace(/<footer[\s\S]*?<\/footer>/gi, "");
                main.setProperty("innerHTML", `<div id="sr-reader">${html}</div>`);
            } catch(e: any) {
                main.setProperty("innerHTML", `<div id="sr-reader"><p style="color:#f0883e">Failed to load: ${e?.message || e}</p><p><a href="${BASE + vol.path}" target="_blank" style="color:#f0883e">${BASE + vol.path}</a></p></div>`);
            }
        }

        function buildHomeHTML(): string {
            const cards = VOLUMES.map(v => {
                const pct = getProgress(v.id);
                return `<div class="sr-card" data-id="${v.id}">
                    <div class="sr-cover">${v.emoji}
                        <span class="sr-vnum">${v.id}</span>
                        ${pct > 0 ? '<span class="sr-rdg">Reading</span>' : ''}
                        <div class="sr-pb"><div class="sr-pbf" style="width:${pct}%"></div></div>
                    </div>
                    <div class="sr-vinfo"><div class="sr-vname">${v.name}</div></div>
                </div>`;
            }).join("");

            return `
                <div id="sr-bar">
                    <span class="sr-logo">🟢 Slime Reader</span>
                    <button id="sr-back">← Back</button>
                    <span id="sr-bar-title"></span>
                    <button id="sr-close">✕</button>
                </div>
                <div id="sr-main">
                    <div id="sr-home">
                        <div class="sr-hero">
                            <div class="sr-hero-ico">🟢</div>
                            <div>
                                <h1>That Time I Got Reincarnated as a Slime</h1>
                                <p>Fan-translated LNs · Vols 6–20 + Side Stories</p>
                            </div>
                        </div>
                        <div class="sr-sec">All Volumes</div>
                        <div class="sr-grid">${cards}</div>
                    </div>
                </div>`;
        }

        // ── tray ──────────────────────────────────────────────────────────────
        const tray = ctx.newTray({
            tooltipText: "Slime Reader",
            iconUrl: "data:image/svg+xml," + encodeURIComponent(
                `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ee8a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`
            ),
            withContent: false,
        });

        tray.onClick(async () => {
            console.log("[slime-reader] Tray clicked.");
            if (await ctx.dom.queryOne("#sr-root")) {
                console.log("[slime-reader] Already open.");
                return;
            }
            await buildUI();
            console.log("[slime-reader] UI built.");
        });
    });
}

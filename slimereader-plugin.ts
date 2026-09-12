/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

// Slime Reader – loads reader.js via <script src="..."> which browsers always execute,
// unlike inline textContent which is blocked by Electron's CSP.

function init() {
    $ui.register((ctx) => {
        console.log("[slime-reader] $ui.register() called.");

        const READER_JS_URL = "https://raw.githubusercontent.com/FemboyEnjoyerAndLover/slime-reader-seanime/main/reader.js";

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
                if (!body) { console.error("[slime-reader] No body!"); return; }

                // Use <script src="..."> — this is executed by the browser regardless of CSP,
                // unlike textContent/innerHTML which is blocked as unsafe-inline.
                // Add a cache-busting param so updates always load fresh.
                const script = await ctx.dom.createElement("script");
                script.setAttribute("id", "sr-loader");
                script.setAttribute("src", READER_JS_URL + "?v=" + Date.now());
                body.append(script);
                console.log("[slime-reader] Script src injected.");
            } catch (err) {
                console.error("[slime-reader] Error:", err);
            }
        });
    });
}

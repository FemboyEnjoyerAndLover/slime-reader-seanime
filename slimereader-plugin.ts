/// <reference path="./plugin.d.ts" />
/// <reference path="./system.d.ts" />
/// <reference path="./app.d.ts" />
/// <reference path="./core.d.ts" />

// =============================================================================
// Slime Reader Plugin for Seanime Denshi
// Displays That Time I Got Reincarnated as a Slime light novels from
// https://tensurafan.github.io with persistent reading progress.
// =============================================================================

function init() {
    $ui.register((ctx) => {

        // -----------------------------------------------------------------------
        // STORAGE HELPERS
        // Progress is saved via $storage (plugin-side) and also synced
        // into the webview via channel so the iframe can restore scroll.
        // -----------------------------------------------------------------------
        function saveProgress(volumeKey: string, chapterId: string, scrollPct: number) {
            $storage.set("progress." + volumeKey + ".chapterId", chapterId);
            $storage.set("progress." + volumeKey + ".scrollPct", scrollPct);
            $storage.set("progress." + volumeKey + ".savedAt", Date.now());
        }

        function loadProgress(volumeKey: string): { chapterId: string; scrollPct: number } | null {
            try {
                const chapterId = $storage.get<string>("progress." + volumeKey + ".chapterId");
                const scrollPct = $storage.get<number>("progress." + volumeKey + ".scrollPct");
                if (!chapterId) return null;
                return { chapterId, scrollPct: scrollPct || 0 };
            } catch (_) {
                return null;
            }
        }

        // -----------------------------------------------------------------------
        // STATE (shared to webview via channel.sync)
        // -----------------------------------------------------------------------
        const readerState = ctx.state<{
            page: string;                 // "home" | "reader"
            volumeKey: string;
            chapterUrl: string;
            chapterTitle: string;
            scrollPct: number;
            savedProgress: { chapterId: string; scrollPct: number } | null;
        }>({
            page: "home",
            volumeKey: "",
            chapterUrl: "",
            chapterTitle: "",
            scrollPct: 0,
            savedProgress: null,
        });

        // -----------------------------------------------------------------------
        // WEBVIEW – full screen with sidebar button
        // -----------------------------------------------------------------------
        const panel = ctx.newWebview({
            slot: "screen",
            fullWidth: true,
            autoHeight: false,
            height: "100vh",
            sidebar: {
                label: "Slime Reader",
                icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`,
            },
        });

        // Sync state → webview
        panel.channel.sync("state", readerState);

        // Handle save-progress event from webview
        panel.channel.on("save-progress", (data: { volumeKey: string; chapterId: string; scrollPct: number }) => {
            if (!data || !data.volumeKey) return;
            saveProgress(data.volumeKey, data.chapterId, data.scrollPct);
            // Update synced state so "continue reading" badge refreshes
            readerState.set(prev => ({
                ...prev,
                savedProgress: { chapterId: data.chapterId, scrollPct: data.scrollPct },
            }));
        });

        // Handle load-progress request from webview
        panel.channel.on("load-progress", (volumeKey: string) => {
            const progress = loadProgress(volumeKey);
            readerState.set(prev => ({
                ...prev,
                volumeKey,
                savedProgress: progress,
            }));
        });

        // Handle navigate-to-reader: webview picked a volume+chapter
        panel.channel.on("open-reader", (data: { volumeKey: string; chapterUrl: string; chapterTitle: string }) => {
            const progress = loadProgress(data.volumeKey);
            readerState.set({
                page: "reader",
                volumeKey: data.volumeKey,
                chapterUrl: data.chapterUrl,
                chapterTitle: data.chapterTitle,
                scrollPct: 0,
                savedProgress: progress,
            });
        });

        // Handle back to home
        panel.channel.on("go-home", (_) => {
            readerState.set(prev => ({ ...prev, page: "home" }));
        });

        // -----------------------------------------------------------------------
        // HTML CONTENT
        // The webview itself fetches tensurafan.github.io pages via fetch().
        // Progress is restored by scrolling to the saved percentage.
        // -----------------------------------------------------------------------
        panel.setContent(() => `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Slime Reader</title>
    <style>
        /* ---- Reset & Base ---- */
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        html {
            color-scheme: dark;
            height: 100%;
        }

        body {
            background: #0d1117;
            color: #e2e8f0;
            font-family: -apple-system, "Segoe UI", system-ui, sans-serif;
            height: 100%;
            overflow: hidden;
        }

        /* ---- Layout ---- */
        #app {
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
        }

        /* ---- Top Bar ---- */
        #topbar {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 20px;
            background: #161b22;
            border-bottom: 1px solid #30363d;
            flex-shrink: 0;
            z-index: 10;
        }

        #topbar .logo {
            display: flex;
            align-items: center;
            gap: 8px;
            font-weight: 700;
            font-size: 1.1rem;
            color: #7ee8a2;
        }

        #topbar .logo svg { color: #7ee8a2; }

        #back-btn {
            background: transparent;
            border: 1px solid #30363d;
            color: #8b949e;
            padding: 6px 12px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            display: none;
            align-items: center;
            gap: 6px;
            transition: all 0.2s;
        }
        #back-btn:hover { background: #21262d; color: #e2e8f0; }
        #back-btn.visible { display: flex; }

        #chapter-title-bar {
            flex: 1;
            font-size: 0.9rem;
            color: #8b949e;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }

        #reader-settings-btn {
            background: transparent;
            border: 1px solid #30363d;
            color: #8b949e;
            padding: 6px 10px;
            border-radius: 6px;
            cursor: pointer;
            display: none;
            align-items: center;
        }
        #reader-settings-btn:hover { background: #21262d; }
        #reader-settings-btn.visible { display: flex; }

        /* ---- Main Content Area ---- */
        #main {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            position: relative;
        }

        /* ---- Home Page ---- */
        #home-page {
            padding: 32px 24px;
            max-width: 1100px;
            margin: 0 auto;
        }

        .hero-banner {
            background: linear-gradient(135deg, #1a2332 0%, #0d2137 50%, #1a1a2e 100%);
            border: 1px solid #30363d;
            border-radius: 16px;
            padding: 40px 48px;
            margin-bottom: 40px;
            display: flex;
            align-items: center;
            gap: 32px;
            position: relative;
            overflow: hidden;
        }

        .hero-banner::before {
            content: "";
            position: absolute;
            top: -50px; right: -50px;
            width: 300px; height: 300px;
            background: radial-gradient(circle, rgba(126,232,162,0.08) 0%, transparent 70%);
            pointer-events: none;
        }

        .hero-slime {
            font-size: 64px;
            flex-shrink: 0;
            filter: drop-shadow(0 0 20px rgba(126,232,162,0.4));
        }

        .hero-text h1 {
            font-size: 1.8rem;
            font-weight: 800;
            color: #7ee8a2;
            margin-bottom: 8px;
            line-height: 1.2;
        }

        .hero-text p {
            color: #8b949e;
            font-size: 0.95rem;
            line-height: 1.6;
            max-width: 500px;
        }

        .section-title {
            font-size: 1.1rem;
            font-weight: 700;
            color: #c9d1d9;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .section-title::after {
            content: "";
            flex: 1;
            height: 1px;
            background: #21262d;
        }

        /* Volume Grid */
        .volume-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
            gap: 20px;
            margin-bottom: 48px;
        }

        .volume-card {
            background: #161b22;
            border: 1px solid #21262d;
            border-radius: 12px;
            overflow: hidden;
            cursor: pointer;
            transition: all 0.2s;
            position: relative;
        }

        .volume-card:hover {
            border-color: #7ee8a2;
            transform: translateY(-2px);
            box-shadow: 0 8px 24px rgba(0,0,0,0.4);
        }

        .volume-cover {
            width: 100%;
            aspect-ratio: 2/3;
            background: linear-gradient(135deg, #1f2a38, #0d1a28);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            border-bottom: 1px solid #21262d;
            position: relative;
            overflow: hidden;
        }

        .volume-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
            position: absolute;
            inset: 0;
        }

        .volume-cover .vol-num {
            font-size: 0.65rem;
            font-weight: 700;
            letter-spacing: 0.1em;
            text-transform: uppercase;
            color: #7ee8a2;
            background: rgba(0,0,0,0.7);
            padding: 2px 8px;
            border-radius: 4px;
            position: absolute;
            top: 8px; left: 8px;
            z-index: 2;
        }

        .progress-bar-wrap {
            position: absolute;
            bottom: 0; left: 0; right: 0;
            height: 3px;
            background: rgba(255,255,255,0.1);
        }

        .progress-bar-fill {
            height: 100%;
            background: #7ee8a2;
            transition: width 0.3s;
        }

        .volume-info {
            padding: 10px 12px 14px;
        }

        .volume-info .vol-title {
            font-size: 0.82rem;
            font-weight: 600;
            color: #c9d1d9;
            line-height: 1.3;
            margin-bottom: 4px;
        }

        .volume-info .vol-sub {
            font-size: 0.72rem;
            color: #6e7681;
        }

        .continue-badge {
            position: absolute;
            top: 8px; right: 8px;
            background: #7ee8a2;
            color: #0d1117;
            font-size: 0.6rem;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.08em;
            padding: 2px 6px;
            border-radius: 4px;
            z-index: 2;
        }

        /* ---- Volume Detail / Chapter List ---- */
        #volume-page {
            padding: 32px 24px;
            max-width: 900px;
            margin: 0 auto;
        }

        .volume-detail-header {
            display: flex;
            gap: 24px;
            margin-bottom: 32px;
            padding-bottom: 24px;
            border-bottom: 1px solid #21262d;
        }

        .volume-detail-cover {
            width: 120px;
            flex-shrink: 0;
            aspect-ratio: 2/3;
            background: linear-gradient(135deg, #1f2a38, #0d1a28);
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2.5rem;
            border: 1px solid #30363d;
            overflow: hidden;
        }

        .volume-detail-cover img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .volume-detail-meta h2 {
            font-size: 1.4rem;
            font-weight: 700;
            color: #c9d1d9;
            margin-bottom: 6px;
        }

        .volume-detail-meta p {
            color: #8b949e;
            font-size: 0.9rem;
            margin-bottom: 12px;
        }

        .continue-btn {
            background: #7ee8a2;
            color: #0d1117;
            border: none;
            padding: 8px 18px;
            border-radius: 8px;
            font-weight: 700;
            font-size: 0.9rem;
            cursor: pointer;
            transition: opacity 0.2s;
        }

        .continue-btn:hover { opacity: 0.85; }

        .chapter-list {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .chapter-item {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px 16px;
            background: #161b22;
            border: 1px solid #21262d;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.15s;
        }

        .chapter-item:hover {
            background: #1c2128;
            border-color: #30363d;
        }

        .chapter-item.active {
            border-color: #7ee8a2;
            background: rgba(126,232,162,0.06);
        }

        .chapter-item .ch-icon {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #30363d;
            flex-shrink: 0;
        }

        .chapter-item.active .ch-icon { background: #7ee8a2; }

        .chapter-item .ch-title {
            flex: 1;
            font-size: 0.9rem;
            color: #c9d1d9;
        }

        .chapter-item.active .ch-title { color: #7ee8a2; font-weight: 600; }

        .ch-bookmark { font-size: 0.75rem; color: #7ee8a2; flex-shrink: 0; }

        /* ---- Reader Page ---- */
        #reader-page {
            display: flex;
            flex-direction: column;
            height: 100%;
            overflow: hidden;
        }

        #reader-nav {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 8px 16px;
            background: #161b22;
            border-bottom: 1px solid #21262d;
            flex-shrink: 0;
        }

        #reader-nav button {
            background: #21262d;
            border: 1px solid #30363d;
            color: #c9d1d9;
            padding: 6px 14px;
            border-radius: 6px;
            cursor: pointer;
            font-size: 0.85rem;
            white-space: nowrap;
            transition: all 0.15s;
        }

        #reader-nav button:hover:not(:disabled) { background: #30363d; }
        #reader-nav button:disabled { opacity: 0.3; cursor: not-allowed; }

        #chapter-select {
            flex: 1;
            background: #21262d;
            border: 1px solid #30363d;
            color: #c9d1d9;
            padding: 6px 10px;
            border-radius: 6px;
            font-size: 0.85rem;
        }

        #reader-content-wrap {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
        }

        #reader-content {
            max-width: 760px;
            margin: 0 auto;
            padding: 40px 32px 80px;
            font-size: 18px;
            line-height: 1.85;
            color: #e2e8f0;
            font-family: 'Georgia', serif;
        }

        #reader-content p { margin-bottom: 1.2em; }
        #reader-content img { max-width: 100%; border-radius: 8px; margin: 12px 0; }
        #reader-content h1, #reader-content h2, #reader-content h3 {
            font-family: system-ui, sans-serif;
            color: #7ee8a2;
            margin: 1.5em 0 0.5em;
        }

        /* ---- Settings Panel ---- */
        #settings-panel {
            position: fixed;
            top: 56px; right: 0;
            width: 280px;
            background: #161b22;
            border: 1px solid #30363d;
            border-radius: 0 0 0 12px;
            padding: 16px;
            z-index: 100;
            display: none;
            box-shadow: -4px 4px 24px rgba(0,0,0,0.5);
        }
        #settings-panel.open { display: block; }

        .settings-row {
            margin-bottom: 16px;
        }

        .settings-row label {
            display: block;
            font-size: 0.8rem;
            color: #8b949e;
            margin-bottom: 6px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
        }

        .settings-row input[type=range] {
            width: 100%;
            accent-color: #7ee8a2;
        }

        .settings-row select {
            width: 100%;
            background: #21262d;
            border: 1px solid #30363d;
            color: #c9d1d9;
            padding: 6px 8px;
            border-radius: 6px;
            font-size: 0.85rem;
        }

        .theme-btns {
            display: flex;
            gap: 6px;
        }

        .theme-btn {
            flex: 1;
            padding: 6px;
            border-radius: 6px;
            border: 2px solid #30363d;
            cursor: pointer;
            font-size: 0.78rem;
            font-weight: 600;
        }

        .theme-btn.active { border-color: #7ee8a2; }
        .theme-btn[data-theme="dark"] { background: #0d1117; color: #e2e8f0; }
        .theme-btn[data-theme="sepia"] { background: #f4ecd8; color: #5b4636; }
        .theme-btn[data-theme="light"] { background: #f5f5f5; color: #1a1a1a; }

        /* ---- Loading Spinner ---- */
        .spinner {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 200px;
            gap: 16px;
        }

        .spinner-ring {
            width: 40px;
            height: 40px;
            border: 3px solid #21262d;
            border-top-color: #7ee8a2;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        .spinner p { color: #6e7681; font-size: 0.9rem; }

        /* ---- Error / Empty ---- */
        .error-box {
            margin: 40px auto;
            max-width: 480px;
            background: #1c1c1c;
            border: 1px solid #f0883e44;
            border-radius: 12px;
            padding: 24px;
            text-align: center;
            color: #f0883e;
        }

        .error-box p { margin-top: 8px; color: #8b949e; font-size: 0.9rem; }
        .error-box button {
            margin-top: 16px;
            background: #f0883e;
            color: white;
            border: none;
            padding: 8px 20px;
            border-radius: 6px;
            cursor: pointer;
            font-weight: 600;
        }

        /* Scrollbar */
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #30363d; border-radius: 3px; }
        ::-webkit-scrollbar-thumb:hover { background: #484f58; }
    </style>
</head>
<body>
<div id="app">
    <!-- TOP BAR -->
    <div id="topbar">
        <div class="logo">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
            Slime Reader
        </div>
        <button id="back-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"/>
            </svg>
            Back
        </button>
        <span id="chapter-title-bar"></span>
        <button id="reader-settings-btn" title="Reader settings">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="3"/>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
        </button>
    </div>

    <!-- SETTINGS PANEL -->
    <div id="settings-panel">
        <div class="settings-row">
            <label>Theme</label>
            <div class="theme-btns">
                <button class="theme-btn active" data-theme="dark">Dark</button>
                <button class="theme-btn" data-theme="sepia">Sepia</button>
                <button class="theme-btn" data-theme="light">Light</button>
            </div>
        </div>
        <div class="settings-row">
            <label>Font Size: <span id="font-size-label">18</span>px</label>
            <input type="range" id="font-size-slider" min="13" max="28" value="18">
        </div>
        <div class="settings-row">
            <label>Line Height: <span id="line-height-label">1.85</span></label>
            <input type="range" id="line-height-slider" min="1.2" max="2.5" step="0.05" value="1.85">
        </div>
        <div class="settings-row">
            <label>Font Family</label>
            <select id="font-family-select">
                <option value="Georgia, serif">Georgia (Serif)</option>
                <option value="system-ui, sans-serif">System Sans-Serif</option>
                <option value="'Courier New', monospace">Courier (Mono)</option>
            </select>
        </div>
        <div class="settings-row">
            <label>Max Width: <span id="max-width-label">760</span>px</label>
            <input type="range" id="max-width-slider" min="400" max="1100" step="20" value="760">
        </div>
    </div>

    <!-- MAIN -->
    <div id="main">
        <div id="home-page"></div>
        <div id="volume-page" style="display:none;"></div>
        <div id="reader-page" style="display:none;">
            <div id="reader-nav">
                <button id="prev-ch-btn">← Prev</button>
                <select id="chapter-select"></select>
                <button id="next-ch-btn">Next →</button>
            </div>
            <div id="reader-content-wrap">
                <div id="reader-content"></div>
            </div>
        </div>
    </div>
</div>

<script>
(function() {
"use strict";

// ============================================================
// VOLUME CATALOGUE
// tensurafan.github.io uses a predictable URL structure.
// Adjust vol/chapterSlugs as needed if the site changes.
// ============================================================
const BASE = "https://tensurafan.github.io";

const VOLUMES = [
    { key: "vol1",  label: "Volume 1",  title: "That Time I Got Reincarnated as a Slime", emoji: "🟢",
      chapterBase: BASE + "/vol1/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Birth of a Slime", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Starting a New Life", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Naming", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – Meeting with the Goblins", path: "ch4/" },
        { id: "ch5", title: "Chapter 5 – Goblins and Direwolves", path: "ch5/" },
        { id: "ch6", title: "Chapter 6 – Resolve", path: "ch6/" },
        { id: "ch7", title: "Chapter 7 – Jura Forest", path: "ch7/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol2",  label: "Volume 2",  title: "The Dwarven Kingdom Arc", emoji: "⚒️",
      chapterBase: BASE + "/vol2/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Dwarves and Elves", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Kingdom of the Dwarves", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Trouble in the Royal Capital", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – Orc Disaster", path: "ch4/" },
        { id: "ch5", title: "Chapter 5 – The Orc Lord", path: "ch5/" },
        { id: "ch6", title: "Chapter 6 – The Battle Begins", path: "ch6/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol3",  label: "Volume 3",  title: "The Orc Disaster Arc", emoji: "🐗",
      chapterBase: BASE + "/vol3/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Gathering Forces", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – The Lizardmen", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Entering the Fray", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – Encounter with the Orc Lord", path: "ch4/" },
        { id: "ch5", title: "Chapter 5 – Rimuru vs Orc Lord", path: "ch5/" },
        { id: "ch6", title: "Chapter 6 – Aftermath", path: "ch6/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol4",  label: "Volume 4",  title: "Tempest Founding Arc", emoji: "🏰",
      chapterBase: BASE + "/vol4/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Peaceful Days", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – The Demon Lords", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Milim's Visit", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – Founding Ceremony", path: "ch4/" },
        { id: "ch5", title: "Chapter 5 – Intrigue", path: "ch5/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol5",  label: "Volume 5",  title: "Kingdom of Farmus", emoji: "⚔️",
      chapterBase: BASE + "/vol5/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Kingdom of Farmus", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Holy Knight", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Invasion", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – Despair", path: "ch4/" },
        { id: "ch5", title: "Chapter 5 – Rimuru's Rage", path: "ch5/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol6",  label: "Volume 6",  title: "Walpurgis", emoji: "🌙",
      chapterBase: BASE + "/vol6/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Demon Lord", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Walpurgis", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Conflict", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – Resolution", path: "ch4/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol7",  label: "Volume 7",  title: "Eurazania Arc", emoji: "🐾",
      chapterBase: BASE + "/vol7/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Diplomatic Mission", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Beast Kingdom", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Tension", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – War", path: "ch4/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol8",  label: "Volume 8",  title: "Labyrinth Arc", emoji: "🌀",
      chapterBase: BASE + "/vol8/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – The Labyrinth", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Veldora's Return", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Trial", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – Awakening", path: "ch4/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol9",  label: "Volume 9",  title: "Eurazania Restored", emoji: "🌿",
      chapterBase: BASE + "/vol9/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Restoration", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Albis", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Cooperation", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – New Bonds", path: "ch4/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol10", label: "Volume 10", title: "Tenma Great War", emoji: "💥",
      chapterBase: BASE + "/vol10/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Prelude to War", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Eastern Empire", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – The Angels Descend", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – Rimuru's Resolve", path: "ch4/" },
        { id: "ch5", title: "Chapter 5 – True Demon Lord", path: "ch5/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol11", label: "Volume 11", title: "King of Monsters", emoji: "👑",
      chapterBase: BASE + "/vol11/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Aftermath", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Reconstruction", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – New Enemy", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – King of Monsters", path: "ch4/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol12", label: "Volume 12", title: "Sealed Foes", emoji: "🔒",
      chapterBase: BASE + "/vol12/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Ancient Gods", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – The Sealed One", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Breaking Seals", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – Confrontation", path: "ch4/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol13", label: "Volume 13", title: "Road to the Empire", emoji: "🗺️",
      chapterBase: BASE + "/vol13/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Empire's Schemes", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Infiltration", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Clash", path: "ch3/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol14", label: "Volume 14", title: "Invaders", emoji: "🌪️",
      chapterBase: BASE + "/vol14/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Invasion Begins", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – Desperation", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Counterattack", path: "ch3/" },
        { id: "ch4", title: "Chapter 4 – End of War", path: "ch4/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol15", label: "Volume 15", title: "The Empire's Fall", emoji: "🏚️",
      chapterBase: BASE + "/vol15/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1 – Shattered Empire", path: "ch1/" },
        { id: "ch2", title: "Chapter 2 – The Emperor", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Final Battle", path: "ch3/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol16", label: "Volume 16", title: "Beginning of the End", emoji: "🌌",
      chapterBase: BASE + "/vol16/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1", path: "ch1/" },
        { id: "ch2", title: "Chapter 2", path: "ch2/" },
        { id: "ch3", title: "Chapter 3", path: "ch3/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol17", label: "Volume 17", title: "Dragon vs Demon", emoji: "🐉",
      chapterBase: BASE + "/vol17/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1", path: "ch1/" },
        { id: "ch2", title: "Chapter 2", path: "ch2/" },
        { id: "ch3", title: "Chapter 3", path: "ch3/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol18", label: "Volume 18", title: "King of Tempest", emoji: "⚡",
      chapterBase: BASE + "/vol18/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1", path: "ch1/" },
        { id: "ch2", title: "Chapter 2", path: "ch2/" },
        { id: "ch3", title: "Chapter 3", path: "ch3/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol19", label: "Volume 19", title: "The True Dragon", emoji: "🌟",
      chapterBase: BASE + "/vol19/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1", path: "ch1/" },
        { id: "ch2", title: "Chapter 2", path: "ch2/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol20", label: "Volume 20", title: "Beyond the Stars", emoji: "✨",
      chapterBase: BASE + "/vol20/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1", path: "ch1/" },
        { id: "ch2", title: "Chapter 2", path: "ch2/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
    { key: "vol21", label: "Volume 21", title: "Finale", emoji: "🏁",
      chapterBase: BASE + "/vol21/",
      chapters: [
        { id: "prologue", title: "Prologue", path: "prologue/" },
        { id: "ch1", title: "Chapter 1", path: "ch1/" },
        { id: "ch2", title: "Chapter 2", path: "ch2/" },
        { id: "ch3", title: "Chapter 3 – Final Chapter", path: "ch3/" },
        { id: "epilogue", title: "Epilogue", path: "epilogue/" },
      ]
    },
];

// ============================================================
// LOCAL PROGRESS STORAGE (synced with plugin $storage via channel)
// We also keep a local Map here so the UI can react instantly.
// ============================================================
const Progress = {
    _cache: {},    // { [volumeKey]: { chapterId, scrollPct } }

    get: function(volumeKey) {
        return Progress._cache[volumeKey] || null;
    },

    set: function(volumeKey, chapterId, scrollPct) {
        Progress._cache[volumeKey] = { chapterId: chapterId, scrollPct: scrollPct };
        if (window.webview) {
            window.webview.send("save-progress", {
                volumeKey: volumeKey,
                chapterId: chapterId,
                scrollPct: scrollPct
            });
        }
    }
};

// ============================================================
// READER SETTINGS
// ============================================================
const Settings = {
    _data: {
        theme: "dark",
        fontSize: 18,
        lineHeight: 1.85,
        fontFamily: "Georgia, serif",
        maxWidth: 760
    },

    _themes: {
        dark:  { bg: "#0d1117", text: "#e2e8f0" },
        sepia: { bg: "#f4ecd8", text: "#5b4636" },
        light: { bg: "#f5f5f5", text: "#1a1a1a" }
    },

    load: function() {
        try {
            var raw = localStorage.getItem("slimereader_settings");
            if (raw) Object.assign(Settings._data, JSON.parse(raw));
        } catch(_) {}
    },

    save: function() {
        try { localStorage.setItem("slimereader_settings", JSON.stringify(Settings._data)); } catch(_) {}
    },

    apply: function() {
        var s = Settings._data;
        var rc = document.getElementById("reader-content");
        var body = document.body;
        var t = Settings._themes[s.theme] || Settings._themes.dark;
        if (rc) {
            rc.style.fontSize = s.fontSize + "px";
            rc.style.lineHeight = s.lineHeight;
            rc.style.fontFamily = s.fontFamily;
            rc.style.maxWidth = s.maxWidth + "px";
            rc.style.color = t.text;
        }
        var wrap = document.getElementById("reader-content-wrap");
        if (wrap) wrap.style.background = t.bg;
        body.style.background = (s.theme === "dark") ? "#0d1117" : t.bg;

        // Sync UI controls
        document.querySelectorAll(".theme-btn").forEach(function(btn) {
            btn.classList.toggle("active", btn.dataset.theme === s.theme);
        });
        var fs = document.getElementById("font-size-slider");
        var lh = document.getElementById("line-height-slider");
        var ff = document.getElementById("font-family-select");
        var mw = document.getElementById("max-width-slider");
        if (fs) { fs.value = s.fontSize; document.getElementById("font-size-label").textContent = s.fontSize; }
        if (lh) { lh.value = s.lineHeight; document.getElementById("line-height-label").textContent = s.lineHeight; }
        if (ff) ff.value = s.fontFamily;
        if (mw) { mw.value = s.maxWidth; document.getElementById("max-width-label").textContent = s.maxWidth; }
    }
};

// ============================================================
// APP STATE
// ============================================================
var App = {
    page: "home",           // "home" | "volume" | "reader"
    currentVolume: null,    // VOLUMES entry
    currentChapterIdx: 0,
    chapters: [],           // copy of currentVolume.chapters
    scrollSaveTimer: null
};

// ============================================================
// DOM HELPERS
// ============================================================
function show(id) { var el = document.getElementById(id); if (el) el.style.display = "block"; }
function hide(id) { var el = document.getElementById(id); if (el) el.style.display = "none"; }
function text(id, val) { var el = document.getElementById(id); if (el) el.textContent = val; }
function q(sel) { return document.querySelector(sel); }

// ============================================================
// FETCHING CHAPTER CONTENT
// We load the raw HTML from tensurafan.github.io and extract
// the main content node. Because of CORS we use no-cors mode
// and fall back gracefully.
// ============================================================
async function fetchChapterContent(url) {
    var resp = await fetch(url, { mode: "cors", credentials: "omit" });
    if (!resp.ok) throw new Error("HTTP " + resp.status);
    var html = await resp.text();
    var parser = new DOMParser();
    var doc = parser.parseFromString(html, "text/html");

    // Try common selectors used on GitHub Pages book sites
    var content =
        doc.querySelector("article") ||
        doc.querySelector(".content") ||
        doc.querySelector(".post-content") ||
        doc.querySelector("main") ||
        doc.querySelector("#content") ||
        doc.querySelector(".markdown-body") ||
        doc.body;

    if (!content) throw new Error("No content found");

    // Strip nav, header, footer, scripts, style tags
    ["nav","header","footer","script","style","iframe",".nav",".navbar",".footer","#nav","#header","#footer"].forEach(function(sel) {
        content.querySelectorAll(sel).forEach(function(el) { el.remove(); });
    });

    // Rewrite relative image URLs to absolute
    content.querySelectorAll("img[src]").forEach(function(img) {
        var src = img.getAttribute("src");
        if (src && !src.startsWith("http")) {
            img.setAttribute("src", new URL(src, url).href);
        }
    });

    return content.innerHTML;
}

// ============================================================
// SCROLL PROGRESS
// ============================================================
function getScrollPct() {
    var wrap = document.getElementById("reader-content-wrap");
    if (!wrap || wrap.scrollHeight <= wrap.clientHeight) return 0;
    return Math.round((wrap.scrollTop / (wrap.scrollHeight - wrap.clientHeight)) * 1000) / 10;
}

function restoreScroll(targetPct) {
    var wrap = document.getElementById("reader-content-wrap");
    if (!wrap || targetPct <= 0) return;
    setTimeout(function() {
        wrap.scrollTop = (targetPct / 100) * (wrap.scrollHeight - wrap.clientHeight);
    }, 120);
}

function startScrollSaving(volumeKey, chapterId) {
    if (App.scrollSaveTimer) clearInterval(App.scrollSaveTimer);
    App.scrollSaveTimer = setInterval(function() {
        Progress.set(volumeKey, chapterId, getScrollPct());
    }, 3000);
}

function stopScrollSaving() {
    if (App.scrollSaveTimer) { clearInterval(App.scrollSaveTimer); App.scrollSaveTimer = null; }
}

// ============================================================
// HOME PAGE
// ============================================================
function renderHome() {
    App.page = "home";
    stopScrollSaving();
    hide("volume-page");
    hide("reader-page");
    show("home-page");

    document.getElementById("back-btn").classList.remove("visible");
    document.getElementById("reader-settings-btn").classList.remove("visible");
    document.getElementById("chapter-title-bar").textContent = "";

    var homePage = document.getElementById("home-page");

    // Find any in-progress volume to show as "continue reading"
    var continueVol = null;
    var continueChIdx = 0;
    for (var vi = 0; vi < VOLUMES.length; vi++) {
        var p = Progress.get(VOLUMES[vi].key);
        if (p && p.chapterId) { continueVol = VOLUMES[vi]; break; }
    }

    var continueHtml = "";
    if (continueVol) {
        var cProg = Progress.get(continueVol.key);
        var cChIdx = continueVol.chapters.findIndex(function(c) { return c.id === cProg.chapterId; });
        if (cChIdx < 0) cChIdx = 0;
        continueChIdx = cChIdx;
        continueHtml = "<div class=\"section-title\" style=\"margin-bottom:16px;\">Continue Reading</div>" +
            "<div style=\"background:#161b22;border:1px solid #7ee8a28f;border-radius:12px;padding:20px 24px;" +
            "margin-bottom:40px;display:flex;align-items:center;gap:20px;cursor:pointer;\" id=\"continue-reading-banner\">" +
            "<div style=\"font-size:2.5rem;\">🟢</div>" +
            "<div style=\"flex:1;\">" +
            "<div style=\"font-size:0.75rem;color:#7ee8a2;text-transform:uppercase;letter-spacing:0.08em;font-weight:700;margin-bottom:4px;\">Pick up where you left off</div>" +
            "<div style=\"font-weight:700;color:#c9d1d9;font-size:1.05rem;\">" + continueVol.label + ": " + continueVol.title + "</div>" +
            "<div style=\"color:#8b949e;font-size:0.85rem;margin-top:3px;\">" + continueVol.chapters[cChIdx].title + " · " + cProg.scrollPct + "% read</div>" +
            "</div>" +
            "<button style=\"background:#7ee8a2;color:#0d1117;border:none;padding:10px 20px;border-radius:8px;font-weight:700;cursor:pointer;\">Continue</button>" +
            "</div>";
    }

    var gridItems = VOLUMES.map(function(vol) {
        var p = Progress.get(vol.key);
        var pct = p ? p.scrollPct : 0;
        var badge = p ? "<span class=\"continue-badge\">Reading</span>" : "";
        return "<div class=\"volume-card\" data-vol-key=\"" + vol.key + "\">" +
            "<div class=\"volume-cover\">" + vol.emoji +
            "<span class=\"vol-num\">" + vol.label + "</span>" +
            badge +
            "<div class=\"progress-bar-wrap\"><div class=\"progress-bar-fill\" style=\"width:" + pct + "%\"></div></div>" +
            "</div>" +
            "<div class=\"volume-info\">" +
            "<div class=\"vol-title\">" + vol.title + "</div>" +
            "<div class=\"vol-sub\">" + vol.chapters.length + " chapters</div>" +
            "</div></div>";
    }).join("");

    homePage.innerHTML =
        "<div class=\"hero-banner\">" +
        "<div class=\"hero-slime\">🟢</div>" +
        "<div class=\"hero-text\">" +
        "<h1>That Time I Got Reincarnated as a Slime</h1>" +
        "<p>Satoru Mikami — average 37-year-old salaryman — gets reincarnated as a slime in a fantasy world. " +
        "Read all 21 light novel volumes. Your progress is saved automatically.</p>" +
        "</div></div>" +
        continueHtml +
        "<div class=\"section-title\">All Volumes</div>" +
        "<div class=\"volume-grid\">" + gridItems + "</div>";

    // Events
    homePage.querySelectorAll(".volume-card").forEach(function(card) {
        card.addEventListener("click", function() {
            var vol = VOLUMES.find(function(v) { return v.key === card.dataset.volKey; });
            if (vol) renderVolumePage(vol);
        });
    });

    var contBanner = document.getElementById("continue-reading-banner");
    if (contBanner && continueVol) {
        var _cvi = continueVol;
        var _cIdx = continueChIdx;
        contBanner.addEventListener("click", function() {
            renderVolumePage(_cvi, _cIdx);
        });
    }
}

// ============================================================
// VOLUME PAGE (Chapter List)
// ============================================================
function renderVolumePage(vol, autoChapterIdx) {
    App.page = "volume";
    App.currentVolume = vol;
    App.chapters = vol.chapters;
    stopScrollSaving();
    hide("home-page");
    hide("reader-page");
    show("volume-page");

    document.getElementById("back-btn").classList.add("visible");
    document.getElementById("reader-settings-btn").classList.remove("visible");
    document.getElementById("chapter-title-bar").textContent = vol.label + " — " + vol.title;

    var progress = Progress.get(vol.key);
    var lastChId = progress ? progress.chapterId : null;

    var chapListHtml = vol.chapters.map(function(ch, idx) {
        var isLast = lastChId && ch.id === lastChId;
        var bookmark = isLast ? "<span class=\"ch-bookmark\">📖 In progress</span>" : "";
        return "<div class=\"chapter-item" + (isLast ? " active" : "") + "\" data-ch-idx=\"" + idx + "\">" +
            "<div class=\"ch-icon\"></div>" +
            "<span class=\"ch-title\">" + ch.title + "</span>" +
            bookmark + "</div>";
    }).join("");

    var continueBtn = lastChId ?
        "<button class=\"continue-btn\" id=\"vol-continue-btn\">Continue Reading</button>" : "";

    var volPage = document.getElementById("volume-page");
    volPage.innerHTML =
        "<div class=\"volume-detail-header\">" +
        "<div class=\"volume-detail-cover\">" + vol.emoji + "</div>" +
        "<div class=\"volume-detail-meta\">" +
        "<h2>" + vol.label + "</h2>" +
        "<p>" + vol.title + " · " + vol.chapters.length + " chapters</p>" +
        (progress ? "<p style=\"font-size:0.82rem;color:#7ee8a2;\">Progress: " + progress.scrollPct + "% through <em>" +
            (vol.chapters.find(function(c) { return c.id === progress.chapterId; }) || {}).title + "</em></p>" : "") +
        continueBtn +
        "</div></div>" +
        "<div class=\"section-title\">Chapters</div>" +
        "<div class=\"chapter-list\">" + chapListHtml + "</div>";

    volPage.querySelectorAll(".chapter-item").forEach(function(item) {
        item.addEventListener("click", function() {
            var idx = parseInt(item.dataset.chIdx, 10);
            renderReader(vol, idx);
        });
    });

    var cb = document.getElementById("vol-continue-btn");
    if (cb && lastChId) {
        var resumeIdx = vol.chapters.findIndex(function(c) { return c.id === lastChId; });
        if (resumeIdx < 0) resumeIdx = 0;
        cb.addEventListener("click", function() { renderReader(vol, resumeIdx, progress.scrollPct); });
    }

    // Auto-open chapter if specified (from "continue reading" banner)
    if (typeof autoChapterIdx === "number") {
        var savedScroll = progress ? progress.scrollPct : 0;
        renderReader(vol, autoChapterIdx, savedScroll);
    }
}

// ============================================================
// READER
// ============================================================
async function renderReader(vol, chapterIdx, resumeScrollPct) {
    App.page = "reader";
    App.currentVolume = vol;
    App.currentChapterIdx = chapterIdx;
    App.chapters = vol.chapters;
    stopScrollSaving();

    hide("home-page");
    hide("volume-page");
    show("reader-page");

    document.getElementById("back-btn").classList.add("visible");
    document.getElementById("reader-settings-btn").classList.add("visible");

    var chapter = vol.chapters[chapterIdx];
    var chapterTitleBar = document.getElementById("chapter-title-bar");
    chapterTitleBar.textContent = vol.label + " · " + chapter.title;
    document.getElementById("chapter-title-bar").textContent = vol.label + " · " + chapter.title;

    // Populate chapter dropdown
    var sel = document.getElementById("chapter-select");
    sel.innerHTML = vol.chapters.map(function(ch, i) {
        return "<option value=\"" + i + "\"" + (i === chapterIdx ? " selected" : "") + ">" + ch.title + "</option>";
    }).join("");

    // Nav buttons
    document.getElementById("prev-ch-btn").disabled = chapterIdx === 0;
    document.getElementById("next-ch-btn").disabled = chapterIdx === vol.chapters.length - 1;

    // Content
    var contentDiv = document.getElementById("reader-content");
    contentDiv.innerHTML = "<div class=\"spinner\"><div class=\"spinner-ring\"></div><p>Loading chapter…</p></div>";

    var url = vol.chapterBase + chapter.path;

    try {
        var html = await fetchChapterContent(url);
        contentDiv.innerHTML = html;
        Settings.apply();

        // Restore scroll
        var scrollTo = (typeof resumeScrollPct === "number") ? resumeScrollPct :
            (Progress.get(vol.key) && Progress.get(vol.key).chapterId === chapter.id ? Progress.get(vol.key).scrollPct : 0);
        restoreScroll(scrollTo);

        // Save progress immediately
        Progress.set(vol.key, chapter.id, scrollTo || 0);

        // Start auto-saving scroll position
        startScrollSaving(vol.key, chapter.id);

    } catch (err) {
        contentDiv.innerHTML =
            "<div class=\"error-box\">" +
            "<strong>⚠️ Could not load chapter</strong>" +
            "<p>Failed to fetch from <code>" + url + "</code>.<br>" + err.message + "</p>" +
            "<p style=\"margin-top:8px;\">The site may require direct browser access. " +
            "Try opening <a href=\"" + url + "\" target=\"_blank\" style=\"color:#f0883e;\">" + url + "</a> directly.</p>" +
            "<button onclick=\"renderReader(App.currentVolume, App.currentChapterIdx)\">Retry</button>" +
            "</div>";
    }
}

// ============================================================
// EVENT: Settings Panel
// ============================================================
document.getElementById("reader-settings-btn").addEventListener("click", function(e) {
    e.stopPropagation();
    document.getElementById("settings-panel").classList.toggle("open");
});

document.addEventListener("click", function(e) {
    var panel = document.getElementById("settings-panel");
    if (panel.classList.contains("open") && !panel.contains(e.target) && e.target.id !== "reader-settings-btn") {
        panel.classList.remove("open");
    }
});

// Theme buttons
document.querySelectorAll(".theme-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
        Settings._data.theme = btn.dataset.theme;
        Settings.save();
        Settings.apply();
    });
});

// Sliders
function bindSlider(sliderId, labelId, key, transform) {
    var el = document.getElementById(sliderId);
    if (!el) return;
    el.addEventListener("input", function() {
        var val = transform ? transform(el.value) : el.value;
        Settings._data[key] = val;
        document.getElementById(labelId).textContent = val;
        Settings.save();
        Settings.apply();
    });
}

bindSlider("font-size-slider",   "font-size-label",   "fontSize",   function(v){ return parseInt(v); });
bindSlider("line-height-slider", "line-height-label", "lineHeight", function(v){ return parseFloat(v); });
bindSlider("max-width-slider",   "max-width-label",   "maxWidth",   function(v){ return parseInt(v); });

var ffSel = document.getElementById("font-family-select");
if (ffSel) {
    ffSel.addEventListener("change", function() {
        Settings._data.fontFamily = ffSel.value;
        Settings.save();
        Settings.apply();
    });
}

// ============================================================
// EVENT: Reader Navigation
// ============================================================
document.getElementById("prev-ch-btn").addEventListener("click", function() {
    if (App.currentChapterIdx > 0) {
        Progress.set(App.currentVolume.key, App.chapters[App.currentChapterIdx].id, getScrollPct());
        renderReader(App.currentVolume, App.currentChapterIdx - 1);
    }
});

document.getElementById("next-ch-btn").addEventListener("click", function() {
    if (App.currentChapterIdx < App.chapters.length - 1) {
        Progress.set(App.currentVolume.key, App.chapters[App.currentChapterIdx].id, getScrollPct());
        renderReader(App.currentVolume, App.currentChapterIdx + 1);
    }
});

document.getElementById("chapter-select").addEventListener("change", function(e) {
    var idx = parseInt(e.target.value, 10);
    if (idx !== App.currentChapterIdx) {
        Progress.set(App.currentVolume.key, App.chapters[App.currentChapterIdx].id, getScrollPct());
        renderReader(App.currentVolume, idx);
    }
});

// ============================================================
// EVENT: Back Button
// ============================================================
document.getElementById("back-btn").addEventListener("click", function() {
    if (App.page === "reader") {
        Progress.set(App.currentVolume.key, App.chapters[App.currentChapterIdx].id, getScrollPct());
        renderVolumePage(App.currentVolume);
    } else if (App.page === "volume") {
        renderHome();
    }
});

// ============================================================
// WEBVIEW CHANNEL: receive progress from plugin $storage
// ============================================================
if (window.webview) {
    window.webview.on("state", function(state) {
        if (state && state.savedProgress && state.volumeKey) {
            Progress._cache[state.volumeKey] = state.savedProgress;
        }
    });
}

// ============================================================
// INIT
// ============================================================
Settings.load();
renderHome();

})();
</script>
</body>
</html>`);

        // Tray icon as an alternative entry point
        const tray = ctx.newTray({
            tooltipText: "Slime Reader",
            iconUrl: "data:image/svg+xml," + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7ee8a2" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`),
            withContent: false,
        });

        tray.onClick(() => {
            // Navigate to the webview screen
            ctx.screen.navigateTo(panel.getScreenPath());
        });
    });
}

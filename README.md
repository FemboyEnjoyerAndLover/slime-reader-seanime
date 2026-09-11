# Slime Reader — Seanime Plugin

Read all 21 volumes of *That Time I Got Reincarnated as a Slime* (TenSura) light novel from [tensurafan.github.io](https://tensurafan.github.io) directly inside Seanime Denshi. Progress is saved automatically.

---

## Features

- 📚 All 21 volumes in a clean sidebar reader
- 💾 Automatic reading progress saved every 3 seconds (per volume, per chapter, scroll position)
- 📖 "Continue Reading" banner on home screen takes you right back to where you left off
- ⚙️ Customisable reader: dark / sepia / light theme, font size, line height, max width
- Accessible from the Seanime sidebar **and** a tray icon

---

## Installation

### Development (local)

1. Copy this folder anywhere on your machine.
2. Edit `slimereader-plugin.json` and set `payloadURI` to the **absolute path** of `slimereader-plugin.ts`:
   ```
   "payloadURI": "C:/Users/You/slimereader-plugin/slimereader-plugin.ts"
   ```
   On Linux/macOS:
   ```
   "payloadURI": "/home/you/slimereader-plugin/slimereader-plugin.ts"
   ```
3. Place `slimereader-plugin.json` in Seanime's **extensions** folder (inside your data directory).
4. Restart Seanime (or go to *Extensions → Reload* if you have dev mode open).
5. Accept the permissions popup (storage + network access to tensurafan.github.io).

### Shared (GitHub hosting)

1. Push both files to a public GitHub repo.
2. In `slimereader-plugin.json`, replace `payloadURI` with the raw GitHub URL of the `.ts` file, and remove `isDevelopment`.
3. Share the raw URL of the `.json` manifest with anyone who wants to install it.

---

## How progress works

- Every **3 seconds** while reading, the current chapter ID and scroll percentage are saved via Seanime's `$storage` API (persistent, survives app restarts).
- When you open a volume, the last-read chapter is highlighted and a **Continue** button appears.
- The home screen shows a **"Continue Reading"** banner for the most recently read volume.
- Progress bars on volume cards show how far through each volume you are (based on scroll %).

---

## Adjusting the chapter list

The `VOLUMES` array in `slimereader-plugin.ts` lists every volume and its chapters with the URL path on tensurafan.github.io. If the site changes its URL structure, or you want to add chapters, edit that array.

The current structure assumes paths like:
```
https://tensurafan.github.io/vol1/prologue/
https://tensurafan.github.io/vol1/ch1/
```

If the actual paths differ, update the `path` field in each chapter entry accordingly.

---

## Troubleshooting

**"Could not load chapter" error**  
The plugin fetches HTML from tensurafan.github.io via `fetch()` inside the webview iframe. If the site adds CORS restrictions, fetching may fail. In that case, click the provided link to open the chapter in a browser tab. You can also ask me for the EPUBs — the plugin can be extended with a local EPUB loader similar to the Light Novel plugin approach.

**Progress not saving**  
Make sure you granted the `storage` permission when installing the plugin.

**Type errors during development**  
Download the type definition files from the Seanime docs and place them next to the `.ts` file:
- [plugin.d.ts](https://raw.githubusercontent.com/5rahim/seanime/refs/heads/main/internal/extension_repo/goja_plugin_types/plugin.d.ts)
- [app.d.ts](https://raw.githubusercontent.com/5rahim/seanime/refs/heads/main/internal/extension_repo/goja_plugin_types/app.d.ts)
- [system.d.ts](https://raw.githubusercontent.com/5rahim/seanime/refs/heads/main/internal/extension_repo/goja_plugin_types/system.d.ts)
- [core.d.ts](https://raw.githubusercontent.com/5rahim/seanime/refs/heads/main/internal/extension_repo/goja_plugin_types/core.d.ts)

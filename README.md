# VELVET COAST — GTA 6 Cover Art Maker

[![make.fun competition](https://make.fun/badge/gta6-cover-art-01.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun rank](https://make.fun/badge/gta6-cover-art-01/hqnsyhrn/gta6-cover-art-01-v11/rank.svg)](https://make.fun/bounty/gta6-cover-art-01)
[![make.fun reward](https://make.fun/badge/gta6-cover-art-01/hqnsyhrn/gta6-cover-art-01-v11/reward.svg)](https://make.fun/bounty/gta6-cover-art-01)

An entry for the [make.fun "Make GTA 6 Cover Art" bounty](https://make.fun/bounty/gta6-cover-art-01).

## What it is

**VELVET COAST** turns your own photos into a GTA-style cover poster. It runs
entirely offline in a desktop browser — no network, no upload, your photos
never leave your machine.

- **Six real faces, every panel.** The poster is a cast of six — THE DRIVER,
  THE BOSS, THE ANGLER, THE FIXER, THE INSIDER and THE LOOKOUT — each panel
  holding a real photo face, most of them looking straight at the viewer.
- **Three full-strength designs.** Main Grid (Sunset), Hero Trio (Neon) and
  Single Hero (Violet) — each a complete polished poster with its own layout,
  grade and captions, not a weak alternate.
- **Your photos, your crop.** "Add photos" or drag-and-drop onto any panel,
  drag the photo inside the preview to reposition it, zoom slider to crop it,
  and edit every caption (place · time · hook).
- **One-click export.** PNG in all three post sizes: 1080 × 1350 portrait,
  1920 × 1080 widescreen and 1080 × 1080 square.
- **The details:** giant striped-chrome VELVET COAST title over the photos,
  bold script line "one last golden hour" on a solid dark band, one WANTED
  pill, one gold ORIGINAL COVER ART seal, COMING SOON · VOL. 01 strip.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

## Files

- `app/index.html` — the editor
- `app/style.css` — dark purple editor theme
- `app/src/poster.js` — the poster renderer (layouts, grades, chrome title)
- `app/src/editor.js` — upload flow, crop, captions, export
- `app/samples/` — six cast photos: two house-kit photos plus four
  AI-generated original portraits (all faces are originals, not game art)
- `screenshots/` — the four entry screenshots

All heroes are AI-generated originals or house-kit photos. No Rockstar logo,
artwork or font is used anywhere.

# The Residence

Real-estate landing page with a scroll-driven film hero: the house rises from open plot → structure → finished villa → interiors as you scroll.

**Stack:** React 19 + Vite. Static output, no backend yet.

```
npm install
npm run dev      # local
npm run build    # → dist/
```

## How the hero works

`src/hooks/useScrollFilm.js` draws WebP frames on a `<canvas>` and maps scroll position → frame index (eased). Frames live in `public/frames/`:

| set | path | frames | size | used when |
|---|---|---|---|---|
| desktop | `frames/f001–f240.webp` | 240 × 1280×720 | 19 MB | landscape / ≥ 820 px wide |
| mobile | `frames/m/f001–f240.webp` | 240 × 810×1080 (portrait centre crop) | 12 MB | portrait < 820 px |
| preview | `frames/lo/` | 24 × 640×360 (every 10th) | 0.4 MB | both — loads first so the hero is never black |

Every frame of the 10 s source film is used, and adjacent frames are crossfaded by the fractional scroll position. They load coarse-to-fine, so the film is scrubbable within a second and sharpens as the rest arrives.

Chapter captions, nav, feature lists, specs and contact details all live in `src/data/content.js`. Specs and contact are placeholders.

## Regenerating frames

From the source video (`construction-to-villa.mp4`, 1280×720 @ 24 fps, 10 s):

```sh
# desktop — every frame at source resolution
ffmpeg -i construction-to-villa.mp4 -an -c:v libwebp -quality 82 public/frames/f%03d.webp

# mobile — 3:4 centre crop at 810x1080
ffmpeg -i construction-to-villa.mp4 -an -vf "crop=ih*3/4:ih:(iw-ih*3/4)/2:0,scale=810:1080:flags=lanczos" -c:v libwebp -quality 80 public/frames/m/f%03d.webp

# preview — 640 wide; keep only f001, f011, f021 … in public/frames/lo/
ffmpeg -i construction-to-villa.mp4 -an -vf scale=640:-2 -c:v libwebp -quality 70 /tmp/lo/f%03d.webp
```

If the frame count changes, update `SRC_TOTAL` and `pickSet()` in `useScrollFilm.js`, and the chapter `from`/`to` ranges in `content.js`.

## Deploy

Cloudflare Pages: build command `npm run build`, output directory `dist`. GitHub Pages works the same way.

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
| desktop | `frames/f001–f460.webp` | 460 × 1920×1080 | 43 MB | landscape / ≥ 820 px wide |
| mobile | `frames/m/f001–f460.webp` | 460 × 810×1080 (portrait centre crop) | 24 MB | portrait < 820 px |
| preview | `frames/lo/` | 46 × 640×360 (every 10th) | 1.2 MB | both — loads first so the hero is never black |

Frames are cut at 10 fps from the 46 s source film and adjacent frames are crossfaded by the fractional scroll position, so motion reads as continuous. They load coarse-to-fine, so the film is scrubbable within a second and sharpens as the rest arrives.

Chapter captions, nav, feature lists, specs and contact details all live in `src/data/content.js`. Specs and contact are placeholders.

## Regenerating frames

From the source video (CapCut export, 3840×2160 @ 50 fps, 48 s; the last 2 s are a CapCut outro card, hence `-t 46`):

```sh
# desktop — 10 fps, 1920 wide
ffmpeg -t 46 -i source.mov -an -vf "fps=10,scale=1920:-2:flags=lanczos" -c:v libwebp -quality 74 public/frames/f%03d.webp

# mobile — 10 fps, 3:4 centre crop at 810x1080
ffmpeg -t 46 -i source.mov -an -vf "fps=10,crop=ih*3/4:ih:(iw-ih*3/4)/2:0,scale=810:1080:flags=lanczos" -c:v libwebp -quality 80 public/frames/m/f%03d.webp

# preview — every 10th of the 10 fps cut, 640 wide, keeping the desktop numbering (f001, f011, …)
ffmpeg -t 46 -i source.mov -an -vf "fps=10,scale=640:-2" -c:v libwebp -quality 70 /tmp/lo/f%03d.webp
# then keep only f001, f011, f021 … in public/frames/lo/
```

If the frame count or fps changes, update `SRC_TOTAL`, `LO_STEP` and `pickSet()` in `useScrollFilm.js`.

## Deploy

Cloudflare Pages: build command `npm run build`, output directory `dist`. GitHub Pages works the same way.

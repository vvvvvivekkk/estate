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
| desktop | `frames/f001–f300.webp` | 300 × 1920×1080 | 29 MB | landscape / ≥ 820 px wide |
| mobile | `frames/m/f001–f150.webp` | 150 × 810×1080 (portrait centre crop) | 7 MB | portrait < 820 px |
| preview | `frames/lo/` | 50 × 640×360 (every 6th) | 1.2 MB | both — loads first so the hero is never black |

Frames load coarse-to-fine, so the film is scrubbable within a second and sharpens as the rest arrives.

Chapter captions, nav, feature lists, specs and contact details all live in `src/data/content.js`. Specs and contact are placeholders.

## Regenerating frames

From a 4K JPG sequence (e.g. an ezgif export) in the current directory:

```sh
# desktop — every frame, 1920 wide
ls ezgif-frame-*.jpg | sort | awk '{printf "%s %03d\n",$0,NR}' | xargs -P 8 -n 2 sh -c \
  'ffmpeg -v error -i "$0" -vf scale=1920:-2 -c:v libwebp -quality 80 -y public/frames/f$1.webp'

# mobile — every 2nd frame, 3:4 centre crop
ls ezgif-frame-*.jpg | sort | awk 'NR%2==1{printf "%s %03d\n",$0,(NR+1)/2}' | xargs -P 8 -n 2 sh -c \
  'ffmpeg -v error -i "$0" -vf "crop=ih*3/4:ih:(iw-ih*3/4)/2:0,scale=810:1080" -c:v libwebp -quality 78 -y public/frames/m/f$1.webp'

# preview — every 6th frame, 640 wide (keep source numbering: f001, f007, …)
ls ezgif-frame-*.jpg | sort | awk 'NR%6==1{printf "%s %03d\n",$0,NR}' | xargs -P 8 -n 2 sh -c \
  'ffmpeg -v error -i "$0" -vf scale=640:-2 -c:v libwebp -quality 70 -y public/frames/lo/f$1.webp'
```

If the frame counts change, update `SRC_TOTAL` and `pickSet()` in `useScrollFilm.js`.

## Deploy

Cloudflare Pages: build command `npm run build`, output directory `dist`. GitHub Pages works the same way.

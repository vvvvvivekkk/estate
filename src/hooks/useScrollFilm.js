import { useEffect, useRef, useState } from 'react'

/**
 * Scroll-scrubbed frame film on a <canvas>.
 *
 * Two frame sets, picked once at mount by screen shape:
 *   desktop : /frames/f001-f300.webp    1920x1080, every source frame
 *   mobile  : /frames/m/f001-f150.webp   810x1080 portrait centre crop, every 2nd source frame
 *   preview : /frames/lo/f001,f007,...  640x360, every 6th source frame (shared; paints first)
 *
 * Returns refs for the canvas + the tall stage, plus live progress / load state.
 */
const SRC_TOTAL = 300
const LO_STEP = 6

function pickSet() {
  const mobile = window.innerWidth < 820 && window.innerHeight > window.innerWidth
  return mobile
    ? { dir: '/frames/m/', n: 150, step: 2 }
    : { dir: '/frames/', n: 300, step: 1 }
}

const pad = (i) => String(i + 1).padStart(3, '0')

export function useScrollFilm({ ease = 0.14, reduced = false } = {}) {
  const canvasRef = useRef(null)
  const stageRef = useRef(null)
  const [progress, setProgress] = useState(0)
  const [loadPct, setLoadPct] = useState(0)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return
    const ctx = canvas.getContext('2d')
    const SET = pickSet()
    const FRAMES = SET.n

    const imgs = new Array(FRAMES)
    const hiFlags = new Array(FRAMES)
    const lo = {}
    const loFlags = {}
    let loaded = 0
    let lastKey = ''
    let currentFrame = 0
    let target = 0
    let current = 0
    let raf = 0
    let alive = true

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    function place(im) {
      const cw = canvas.width, ch = canvas.height
      const iw = im.naturalWidth || 1920, ih = im.naturalHeight || 1080
      const s = Math.max(cw / iw, ch / ih)
      const dw = iw * s, dh = ih * s
      return [(cw - dw) / 2, (ch - dh) / 2, dw, dh]
    }
    function drawImg(im, key) {
      ctx.globalAlpha = 1
      ctx.drawImage(im, ...place(im))
      lastKey = key
    }
    /* Crossfade: when both neighbours of the fractional position are loaded, blend them
       so motion reads as continuous instead of stepping frame to frame. */
    function drawBlend(a, b, t) {
      ctx.globalAlpha = 1
      ctx.drawImage(imgs[a], ...place(imgs[a]))
      ctx.globalAlpha = t
      ctx.drawImage(imgs[b], ...place(imgs[b]))
      ctx.globalAlpha = 1
      lastKey = 'b' + a + ':' + Math.round(t * 64)
    }

    function nearestLo(i) {
      const src = Math.round((i * SET.step) / LO_STEP) * LO_STEP
      for (let d = 0; d < SRC_TOTAL; d += LO_STEP) {
        if (loFlags[src - d]) return src - d
        if (loFlags[src + d]) return src + d
      }
      return -1
    }

    // exact hi → hi neighbour within 2 → nearest preview → nearest hi anywhere
    function best(i) {
      if (hiFlags[i]) return { im: imgs[i], key: 'h' + i }
      for (let d = 1; d <= 2; d++) {
        if (i - d >= 0 && hiFlags[i - d]) return { im: imgs[i - d], key: 'h' + (i - d) }
        if (i + d < FRAMES && hiFlags[i + d]) return { im: imgs[i + d], key: 'h' + (i + d) }
      }
      const l = nearestLo(i)
      if (l >= 0) return { im: lo[l], key: 'l' + l }
      for (let e = 3; e < FRAMES; e++) {
        if (i - e >= 0 && hiFlags[i - e]) return { im: imgs[i - e], key: 'h' + (i - e) }
        if (i + e < FRAMES && hiFlags[i + e]) return { im: imgs[i + e], key: 'h' + (i + e) }
      }
      return null
    }

    let currentPos = 0 // fractional frame
    function drawLatest() {
      if (!alive) return
      const a = Math.floor(currentPos), t = currentPos - a, b2 = Math.min(FRAMES - 1, a + 1)
      if (t > 0.02 && t < 0.98 && hiFlags[a] && hiFlags[b2]) {
        const key = 'b' + a + ':' + Math.round(t * 64)
        if (key !== lastKey) drawBlend(a, b2, t)
        return
      }
      const b = best(currentFrame)
      if (b && b.key !== lastKey) drawImg(b.im, b.key)
    }

    function loadHi(i, cb) {
      if (imgs[i]) { cb && cb(); return }
      const im = new Image()
      im.onload = () => {
        hiFlags[i] = true
        loaded++
        if (alive) setLoadPct(Math.round((loaded / FRAMES) * 100))
        if (loaded >= FRAMES && alive) setReady(true)
        cb && cb()
      }
      im.onerror = () => { loaded++; cb && cb() }
      im.src = SET.dir + 'f' + pad(i) + '.webp'
      imgs[i] = im
    }
    function loadLo(src, cb) {
      if (lo[src]) { cb && cb(); return }
      const im = new Image()
      im.onload = () => { loFlags[src] = true; cb && cb() }
      im.onerror = () => cb && cb()
      im.src = '/frames/lo/f' + pad(src) + '.webp'
      lo[src] = im
    }

    // coarse-to-fine order for the hi-res set
    const hiQueue = []
    const seen = {}
    for (const step of [24, 12, 6, 3, 1]) {
      for (let i = 0; i < FRAMES; i += step) if (!seen[i]) { seen[i] = true; hiQueue.push(i) }
    }
    const loQueue = []
    for (let k = 0; k < SRC_TOTAL; k += LO_STEP) loQueue.push(k)
    let inflight = 0
    const MAX = 6
    function pump() {
      while (alive && inflight < MAX && (loQueue.length || hiQueue.length)) {
        if (loQueue.length) {
          const li = loQueue.shift()
          if (lo[li]) continue
          inflight++
          loadLo(li, () => { inflight--; drawLatest(); pump() })
        } else {
          const i = hiQueue.shift()
          if (imgs[i]) continue
          inflight++
          loadHi(i, () => { inflight--; drawLatest(); pump() })
        }
      }
    }

    function resize() {
      canvas.width = Math.round(canvas.clientWidth * dpr)
      canvas.height = Math.round(canvas.clientHeight * dpr)
      lastKey = ''
      drawLatest()
    }

    function scrollProgress() {
      const total = stage.offsetHeight - window.innerHeight
      if (total <= 0) return 0
      const s = -stage.getBoundingClientRect().top
      return Math.max(0, Math.min(1, s / total))
    }

    function tick() {
      if (!alive) return
      target = scrollProgress()
      current += (target - current) * ease
      if (Math.abs(target - current) < 0.0005) current = target
      currentPos = current * (FRAMES - 1)
      currentFrame = Math.round(currentPos)
      drawLatest()
      setProgress(current)
      raf = requestAnimationFrame(tick)
    }

    window.addEventListener('resize', resize, { passive: true })
    resize()

    if (reduced) {
      // no scrub: just show the finished house
      loadHi(FRAMES - 1, () => { drawImg(imgs[FRAMES - 1], 'h' + (FRAMES - 1)); setReady(true) })
    } else {
      loadLo(0, () => { drawLatest(); loadHi(0, () => { drawLatest(); pump() }) })
      raf = requestAnimationFrame(tick)
    }

    return () => {
      alive = false
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
    }
  }, [ease, reduced])

  return { canvasRef, stageRef, progress, loadPct, ready }
}

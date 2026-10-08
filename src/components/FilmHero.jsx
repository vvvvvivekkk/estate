import { useScrollFilm } from '../hooks/useScrollFilm'
import { chapters } from '../data/content'
import { useReducedMotion } from '../hooks/useReducedMotion'

export default function FilmHero() {
  const reduced = useReducedMotion()
  const { canvasRef, stageRef, progress, loadPct, ready } = useScrollFilm({ reduced })

  // hero copy + scroll hint fade over the first half-viewport of scroll
  const vh = typeof window !== 'undefined' ? window.innerHeight || 1 : 1
  const scrollY = typeof window !== 'undefined' ? window.scrollY : 0
  const fade = Math.max(0, Math.min(1, 1 - scrollY / (vh * 0.5)))
  const hintFade = Math.max(0, 1 - scrollY / (vh * 0.3))
  const pct = Math.round(progress * 100)

  return (
    <section className="film" id="hero" ref={stageRef} aria-label="A walk through the residence">
      <div className="film-pin">
        <canvas id="film" ref={canvasRef} aria-hidden="true" />

        <div
          className="hero-copy"
          style={{ opacity: fade, transform: `translateY(${(1 - fade) * -20}px)`, pointerEvents: fade < 0.1 ? 'none' : 'auto' }}
        >
          <p className="label">A Private Residence</p>
          <h1>Where Architecture Meets Living</h1>
          <p className="sub">Scroll to walk through the house, from the pool terrace to its private rooms.</p>
          <a className="btn btn-primary" href="#viewing">Schedule a Private Viewing <span aria-hidden="true">→</span></a>
        </div>

        {!reduced && chapters.map((c) => {
          const state = progress >= c.from && progress <= c.to ? 'on' : progress < c.from ? 'off-down' : 'off-up'
          return (
            <div key={c.num} className={'chapter ' + state}>
              <p className="num">{c.num.toUpperCase()}</p>
              <h2>{c.title}</h2>
              <p>{c.body}</p>
            </div>
          )
        })}

        <div className={'loading' + (ready ? ' done' : '')}>Loading film · <span>{loadPct}</span>%</div>
        <div className="scroll-hint" aria-hidden="true" style={{ opacity: hintFade }}><span>Scroll</span><span className="track" /></div>
        <div className="progress" aria-hidden="true">
          <span>{pct < 10 ? '0' + pct : pct}</span>
          <span className="bar"><i style={{ width: pct + '%' }} /></span>
        </div>
      </div>
    </section>
  )
}

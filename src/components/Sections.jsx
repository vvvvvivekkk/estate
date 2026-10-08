import Reveal from './Reveal'
import { architecture, living, specs, contact } from '../data/content'

function FeatureList({ items }) {
  return (
    <ul className="feature-list">
      {items.map((f) => <li key={f.h}><h3>{f.h}</h3><p>{f.p}</p></li>)}
    </ul>
  )
}

function Split({ id, title, children }) {
  return (
    <section className="section" id={id}>
      <Reveal className="wrap grid-2">
        <div><h2 style={{ fontSize: 'var(--fs-h2)' }}>{title}</h2></div>
        <div>{children}</div>
      </Reveal>
    </section>
  )
}

export function Overview() {
  return (
    <section className="section" id="overview">
      <Reveal className="wrap">
        <p className="label" style={{ marginBottom: '1.4rem' }}>Property Overview</p>
        <p className="statement">A residence conceived not as a structure, but as a way of <em>living with light</em>, space and view.</p>
        <p className="body" style={{ marginTop: '2rem' }}>From the pool terrace to the private wing, the home unfolds as a single continuous gesture. Each space leads quietly into the next, and every threshold has been considered.</p>
      </Reveal>
    </section>
  )
}

export function Architecture() {
  return (
    <Split id="architecture" title="Architecture">
      <p className="lead">A disciplined composition of form, structure and material, where the building and its light are inseparable.</p>
      <FeatureList items={architecture} />
    </Split>
  )
}

export function Living() {
  return (
    <Split id="living" title="Living">
      <p className="lead">An open-plan living environment framed by glass and sky.</p>
      <p className="body">The home is organised around generous volumes and uninterrupted sightlines. Rooms flow into one another with ease, yet each keeps its own sense of quiet and seclusion. Light moves through the plan from morning to evening.</p>
      <FeatureList items={living} />
    </Split>
  )
}

export function Specs() {
  return (
    <section className="section" id="specs">
      <Reveal className="wrap">
        <p className="label">Specifications</p>
        <dl className="specs" aria-label="Key figures">
          {specs.map((s) => (
            <div key={s.k}><dt>{s.k}</dt><dd>{s.v}{s.u && <small>{s.u}</small>}</dd></div>
          ))}
        </dl>
        <p className="body" style={{ fontSize: '.85rem', marginTop: '1rem', color: 'var(--ink-faint)' }}>Figures shown are indicative placeholders pending final survey.</p>
      </Reveal>
    </section>
  )
}

export function Viewing() {
  return (
    <Split id="viewing" title="Private Viewing">
      <p className="lead">The residence is shown by appointment only.</p>
      <p className="body">Enquiries are handled personally and in confidence. Share a preferred date and we will arrange a time to walk the house with you at the hour it looks its best.</p>
      <div className="cta">
        <a className="btn btn-primary" href="#viewing">Request an Appointment <span aria-hidden="true">→</span></a>
        <a className="btn btn-ghost" href="#top">Watch Again</a>
      </div>
      <dl className="meta">
        {contact.map((c) => <div key={c.k}><dt>{c.k}</dt><dd>{c.v}</dd></div>)}
      </dl>
    </Split>
  )
}

export function Footer() {
  return (
    <footer className="foot">
      <span>The Residence · a private architectural presentation</span>
      <span>Details are placeholder and to be confirmed.</span>
    </footer>
  )
}

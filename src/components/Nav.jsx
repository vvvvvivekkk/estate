import { useEffect, useState } from 'react'
import { nav } from '../data/content'

export default function Nav() {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24)
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => window.removeEventListener('scroll', on)
  }, [])
  return (
    <header>
      <nav className={'nav' + (scrolled ? ' scrolled' : '')} aria-label="Primary">
        <a className="brand" href="#top"><span className="dot" aria-hidden="true" />The Residence</a>
        <ul className="nav-links">
          {nav.map((n) => <li key={n.href}><a href={n.href}>{n.label}</a></li>)}
        </ul>
      </nav>
    </header>
  )
}

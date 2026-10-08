import { useEffect, useRef, useState } from 'react'

/** Fades children in once they scroll into view. */
export default function Reveal({ as: Tag = 'div', className = '', children, ...rest }) {
  const ref = useRef(null)
  const [shown, setShown] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el || !('IntersectionObserver' in window)) { setShown(true); return }
    const io = new IntersectionObserver((es) => {
      es.forEach((en) => { if (en.isIntersecting) { setShown(true); io.unobserve(en.target) } })
    }, { threshold: 0.15 })
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return <Tag ref={ref} className={`reveal${shown ? ' in' : ''} ${className}`.trim()} {...rest}>{children}</Tag>
}

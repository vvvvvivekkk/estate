import { useEffect, useState } from 'react'

export function useReducedMotion() {
  const q = () => typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)')
  const [reduced, setReduced] = useState(() => !!(q() && q().matches))
  useEffect(() => {
    const m = q(); if (!m) return
    const on = (e) => setReduced(e.matches)
    m.addEventListener('change', on)
    return () => m.removeEventListener('change', on)
  }, [])
  return reduced
}

import { useEffect, useRef, useState } from 'react'

// Adds a scroll-triggered reveal. Returns a ref + `visible` flag. Uses a single
// IntersectionObserver per element and unobserves after the first reveal so it
// stays cheap. If IntersectionObserver is unavailable (or SSR), it reveals
// immediately so content is never hidden.
export function useReveal({ threshold = 0.15, rootMargin = '0px 0px -10% 0px' } = {}) {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    if (typeof IntersectionObserver === 'undefined') {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true)
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold, rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [visible, threshold, rootMargin])

  return { ref, visible }
}

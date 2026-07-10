import { useEffect, useState } from 'react'

// Background video for the hero. The source is the client's own homepage
// Elementor background video (YouTube `pdMCfQUGtiQ`, starting at 8s).
//
// To keep mobile fast and respect user preferences, the video only loads when:
//   - the viewport is desktop-width (min-width: 768px), AND
//   - the user has NOT requested reduced motion.
// Otherwise the poster image alone is shown. The poster also covers the loading
// gap on desktop. Muted + inline autoplay + loop; no controls; privacy domain.
const VIDEO_ID = 'pdMCfQUGtiQ'
const START = 8

export default function BackgroundVideo({ poster, alt }) {
  const [enabled, setEnabled] = useState(false)

  useEffect(() => {
    const motionOk = !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const desktop = window.matchMedia('(min-width: 768px)')
    const update = () => setEnabled(desktop.matches && motionOk)
    update()
    desktop.addEventListener('change', update)
    return () => desktop.removeEventListener('change', update)
  }, [])

  const src =
    `https://www.youtube-nocookie.com/embed/${VIDEO_ID}` +
    `?autoplay=1&mute=1&controls=0&loop=1&playlist=${VIDEO_ID}` +
    `&start=${START}&playsinline=1&modestbranding=1&rel=0&showinfo=0&disablekb=1`

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden bg-charcoal-950">
      {/* Poster: always rendered, sits under the video so there is no flash. */}
      <img
        src={poster}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        fetchPriority="high"
      />
      {enabled && (
        <iframe
          title="HK Vastgoed & Onderhoud — dakwerk"
          src={src}
          allow="autoplay; encrypted-media; picture-in-picture"
          aria-hidden="true"
          tabIndex={-1}
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2"
        />
      )}
    </div>
  )
}

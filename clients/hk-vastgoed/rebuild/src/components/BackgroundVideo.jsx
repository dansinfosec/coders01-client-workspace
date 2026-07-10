import { useEffect, useState } from 'react'

const VIDEO_ID = 'pdMCfQUGtiQ'
const START_TIME = 8

export default function BackgroundVideo({ poster, alt = '' }) {
  const [showVideo, setShowVideo] = useState(false)

  useEffect(() => {
    const desktopQuery = window.matchMedia('(min-width: 768px)')
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')

    const updateVideoState = () => {
      setShowVideo(desktopQuery.matches && !motionQuery.matches)
    }

    updateVideoState()

    desktopQuery.addEventListener?.('change', updateVideoState)
    motionQuery.addEventListener?.('change', updateVideoState)

    return () => {
      desktopQuery.removeEventListener?.('change', updateVideoState)
      motionQuery.removeEventListener?.('change', updateVideoState)
    }
  }, [])

  const videoUrl =
    `https://www.youtube.com/embed/${VIDEO_ID}` +
    `?autoplay=1` +
    `&mute=1` +
    `&controls=0` +
    `&loop=1` +
    `&playlist=${VIDEO_ID}` +
    `&start=${START_TIME}` +
    `&playsinline=1` +
    `&rel=0` +
    `&disablekb=1` +
    `&iv_load_policy=3`

  return (
    <div
      className="absolute inset-0 z-0 overflow-hidden bg-charcoal-950"
      aria-hidden="true"
    >
      <img
        src={poster}
        alt={alt}
        className="absolute inset-0 z-0 h-full w-full object-cover object-center"
        loading="eager"
        fetchPriority="high"
      />

      {showVideo && (
  <iframe
  title="HK Vastgoed & Onderhoud dakwerk"
  src="https://www.youtube.com/embed/pdMCfQUGtiQ?controls=1"
  allow="autoplay; encrypted-media; fullscreen"
  allowFullScreen
  className="absolute inset-0 z-10 h-full w-full border-0"
/>
      )}

      <div className="absolute inset-0 z-20 bg-gradient-to-r from-black/85 via-black/60 to-black/35" />
    </div>
  )
}
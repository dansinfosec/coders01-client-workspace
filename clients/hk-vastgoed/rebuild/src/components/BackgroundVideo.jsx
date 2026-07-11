import { useEffect, useState } from 'react'

// Ambient hero background video — the client's own homepage video
// (https://youtu.be/pdMCfQUGtiQ, starting at 8s), rebuilt from the Elementor
// background-video setting found in the crawled site.
//
// Behaviour:
//   - Desktop only (min-width: 768px) AND no prefers-reduced-motion:
//     the video loads muted, autoplays inline, loops, shows no controls.
//   - Mobile / reduced-motion / while loading / if the embed fails:
//     the static poster image is shown instead.
//
// The iframe is purely decorative: pointer-events disabled, hidden from the
// accessibility tree and tab order. Text readability overlays live in Hero.jsx
// (z-10/z-20 above this z-0 container); this component only supplies a subtle
// uniform scrim so video brightness stays consistent.
//
// youtube-nocookie.com is used for the privacy-enhanced embed. Embedding of
// this video is evidenced by the client's own site, which serves it through
// YouTube's iframe API as an Elementor background video.
const VIDEO_ID = 'pdMCfQUGtiQ'
const START_TIME = 8

const EMBED_URL =
  `https://www.youtube-nocookie.com/embed/${VIDEO_ID}` +
  `?autoplay=1` +
  `&mute=1` +
  `&controls=0` +
  `&loop=1` +
  `&playlist=${VIDEO_ID}` + // required for loop=1 to work
  `&start=${START_TIME}` +
  `&playsinline=1` +
  `&rel=0` +
  `&disablekb=1` +
  `&iv_load_policy=3` +
  `&modestbranding=1`

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

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-charcoal-950" aria-hidden="true">
      {/* Poster: always rendered under the iframe, so mobile, reduced-motion,
          slow loads and failed embeds all fall back to the static image. */}
      <img
        src={poster}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center"
        loading="eager"
        fetchpriority="high"
      />

      {showVideo && (
        <iframe
          title="HK Vastgoed & Onderhoud — dakwerk (achtergrondvideo)"
          src={EMBED_URL}
          allow="autoplay; encrypted-media"
          tabIndex={-1}
          // 16:9 "cover" sizing: oversize the iframe from the centre so the
          // video fills the hero without letterboxing, whatever its shape.
          className="pointer-events-none absolute left-1/2 top-1/2 h-[56.25vw] min-h-full w-[177.78vh] min-w-full -translate-x-1/2 -translate-y-1/2 border-0"
        />
      )}

      {/* Subtle uniform scrim; the stronger readability gradients are in Hero. */}
      <div className="pointer-events-none absolute inset-0 bg-charcoal-950/35" />
    </div>
  )
}

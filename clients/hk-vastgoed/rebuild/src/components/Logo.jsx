// Text-based brand wordmark. The client's raster logo was a small UI asset that
// was filtered out during scraping; this clean SVG monogram + wordmark uses the
// brand colours and can be swapped for the official logo file when available.
export default function Logo({ invert = false, className = '' }) {
  const ink = invert ? '#ffffff' : '#0f172a'
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg width="34" height="34" viewBox="0 0 64 64" aria-hidden="true" className="shrink-0">
        <rect width="64" height="64" rx="14" fill="#1f5544" />
        <path d="M18 44V20h5v9.5h9V20h5v24h-5V34h-9v10z" fill="#ffffff" />
        <path d="M40 44V20h5v10l8-10h6l-9 11 9 13h-6l-8-11v11z" fill="#4aa485" />
      </svg>
      <span className="leading-tight">
        <span className="block text-[15px] font-extrabold tracking-tight" style={{ color: ink }}>
          HK Vastgoed
        </span>
        <span
          className="block text-[11px] font-semibold uppercase tracking-[0.18em]"
          style={{ color: invert ? 'rgba(255,255,255,0.7)' : '#4aa485' }}
        >
          &amp; Onderhoud
        </span>
      </span>
    </span>
  )
}

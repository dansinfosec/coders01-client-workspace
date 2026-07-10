import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { company } from '../data/company.js'

// Lightweight per-route SEO for this SPA: sets document.title, meta description,
// canonical link and og:title/description on navigation. No external dependency.
// For production SEO at scale, consider SSR/prerender or react-helmet-async.
function upsertMeta(attr, key, content) {
  if (!content) return
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) {
    el = document.createElement('meta')
    el.setAttribute(attr, key)
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function upsertCanonical(href) {
  let el = document.head.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

export default function Seo({ title, description }) {
  const { pathname } = useLocation()
  const fullTitle = title ? `${title} — ${company.name}` : `${company.name} — Dakdekker & vastgoedonderhoud`

  useEffect(() => {
    document.title = fullTitle
    upsertMeta('name', 'description', description)
    upsertMeta('property', 'og:title', fullTitle)
    upsertMeta('property', 'og:description', description)
    // Canonical uses the current origin so it works on any deploy domain.
    upsertCanonical(`${window.location.origin}${pathname}`)
  }, [fullTitle, description, pathname])

  return null
}

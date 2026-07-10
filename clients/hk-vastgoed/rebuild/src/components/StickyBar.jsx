import { Link, useLocation } from 'react-router-dom'
import { company } from '../data/company.js'

// Mobile-only sticky bottom conversion bar: Bellen + Offerte (+ WhatsApp when
// enabled). Hidden on the privacy and terms pages per requirements.
const HIDDEN_PATHS = ['/privacybeleid', '/algemene-voorwaarden']

export default function StickyBar() {
  const { pathname } = useLocation()
  if (HIDDEN_PATHS.includes(pathname)) return null

  const hasWa = company.whatsapp?.enabled

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-sand-200 bg-white/95 pb-[env(safe-area-inset-bottom)] shadow-[0_-4px_16px_rgba(28,25,23,0.1)] backdrop-blur md:hidden">
      <div className={`grid ${hasWa ? 'grid-cols-3' : 'grid-cols-2'} gap-2 p-2.5`}>
        <a href={company.phone.href} className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-brand-600/30 bg-white px-3 py-2.5 text-sm font-semibold text-brand-700">
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
            <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Bellen
        </a>
        {hasWa && (
          <a
            href={company.whatsapp.href}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#25D366] px-3 py-2.5 text-sm font-semibold text-white"
          >
            <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.6.2-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3z" />
            </svg>
            WhatsApp
          </a>
        )}
        <Link to="/offerte" className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-600 px-3 py-2.5 text-sm font-semibold text-white">
          Offerte
        </Link>
      </div>
    </div>
  )
}

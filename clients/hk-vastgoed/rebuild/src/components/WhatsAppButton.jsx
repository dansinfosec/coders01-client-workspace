import { company } from '../data/company.js'

// Reusable WhatsApp CTA. Renders nothing when WhatsApp is disabled in data, so
// the whole app respects the single `company.whatsapp.enabled` switch.
export default function WhatsAppButton({ label = 'WhatsApp ons', className = '' }) {
  if (!company.whatsapp?.enabled) return null
  return (
    <a
      href={company.whatsapp.href}
      target="_blank"
      rel="noopener noreferrer"
      className={`btn-wa ${className}`.trim()}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M17.5 14.4c-.3-.2-1.7-.8-2-.9-.3-.1-.5-.2-.6.2-.2.3-.7.9-.8 1-.2.2-.3.2-.6.1-.3-.2-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.2-.6-1.5-.9-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.3.3-1 .9-1 2.3s1 2.7 1.2 2.9c.1.2 2 3.1 4.9 4.3.7.3 1.2.5 1.6.6.7.2 1.3.2 1.8.1.5-.1 1.7-.7 1.9-1.4.2-.7.2-1.2.2-1.4-.1-.1-.3-.2-.6-.3zM12 21.5a9.5 9.5 0 01-4.8-1.3l-.3-.2-3.5.9.9-3.4-.2-.4A9.5 9.5 0 1112 21.5zm0-21A11.5 11.5 0 002 18l-1.5 5.5L6 22a11.5 11.5 0 006 1.6A11.5 11.5 0 0012 .5z" />
      </svg>
      {label}
    </a>
  )
}

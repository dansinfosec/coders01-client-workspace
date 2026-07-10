import { useEffect, useState } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import Logo from './Logo.jsx'
import Button from './Button.jsx'
import { company } from '../data/company.js'

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/diensten', label: 'Diensten' },
  { to: '/projecten', label: 'Projecten' },
  { to: '/over-ons', label: 'Over ons' },
  { to: '/contact', label: 'Contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { pathname } = useLocation()

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  // Elevate + tighten the header once the user scrolls past the top.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Lock body scroll while the mobile menu is open.
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-brand-700' : 'text-ink-soft hover:text-brand-700'
    }`

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-all duration-300 ${
        scrolled
          ? 'border-sand-200 bg-white/90 shadow-sm backdrop-blur'
          : 'border-transparent bg-white/70 backdrop-blur'
      }`}
    >
      <nav className={`container-content flex items-center justify-between transition-all duration-300 ${scrolled ? 'h-14' : 'h-16'}`} aria-label="Hoofdmenu">
        <Link to="/" aria-label={`${company.name} — home`} className="transition-transform hover:scale-[1.02]">
          <Logo />
        </Link>

        <div className="hidden items-center gap-1 lg:flex">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden items-center gap-3 lg:flex">
          <a href={company.phone.href} className="flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-800">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012 4.2 2 2 0 014 2h3a2 2 0 012 1.7c.1.9.3 1.8.6 2.6a2 2 0 01-.5 2.1L8 9.6a16 16 0 006 6l1.2-1.1a2 2 0 012.1-.5c.8.3 1.7.5 2.6.6a2 2 0 011.7 2z" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {company.phone.display}
          </a>
          <Button to="/offerte">Offerte aanvragen</Button>
        </div>

        <button
          type="button"
          className="inline-flex items-center rounded-md p-2 text-ink lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? 'Menu sluiten' : 'Menu openen'}
          onClick={() => setOpen((v) => !v)}
        >
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile menu with a smooth height/opacity transition. */}
      <div
        id="mobile-menu"
        className={`overflow-hidden border-sand-200 bg-white transition-all duration-300 ease-out lg:hidden ${
          open ? 'max-h-[26rem] border-t opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="container-content flex flex-col gap-1 py-4">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
          <div className="mt-3 flex flex-col gap-2">
            <a href={company.phone.href} className="btn-secondary">
              Bel {company.phone.display}
            </a>
            <Button to="/offerte">Offerte aanvragen</Button>
          </div>
        </div>
      </div>
    </header>
  )
}

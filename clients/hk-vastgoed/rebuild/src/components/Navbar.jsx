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
  const { pathname } = useLocation()

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setOpen(false)
  }, [pathname])

  const linkClass = ({ isActive }) =>
    `rounded-md px-3 py-2 text-sm font-medium transition-colors ${
      isActive ? 'text-brand-700' : 'text-ink-soft hover:text-brand-700'
    }`

  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 backdrop-blur">
      <nav className="container-content flex h-16 items-center justify-between" aria-label="Hoofdmenu">
        <Link to="/" aria-label={`${company.name} — home`}>
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
          <a href={company.phone.href} className="text-sm font-semibold text-brand-700">
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

      {open && (
        <div id="mobile-menu" className="border-t border-slate-100 bg-white lg:hidden">
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
      )}
    </header>
  )
}

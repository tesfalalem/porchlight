import { COMPANY } from '@porchlight/shared';
import clsx from 'clsx';
import { ArrowRight, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/apartments', label: 'Residences' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed inset-x-0 top-0 z-50 flex justify-center px-3 pt-3 sm:px-6 sm:pt-5 pointer-events-none">
      {/* ── Pill container ── */}
      <div className="pointer-events-auto w-full max-w-5xl">
        {/* Main pill bar */}
        <header
          className={clsx(
            'flex items-center justify-between gap-4 rounded-2xl px-6 py-4 sm:px-8 sm:py-5',
            'bg-navy-900/90 backdrop-blur-xl',
            'shadow-[0_8px_32px_rgba(0,0,0,0.28)] ring-1 ring-white/10',
            open ? 'rounded-b-none' : '',
          )}
        >
          {/* Left — branding */}
          <Link to="/" className="shrink-0" onClick={() => setOpen(false)}>
            <div className="flex items-center gap-2.5">
              {/* Logo mark — clipped to remove white padding */}
              <div className="h-9 w-9 sm:h-11 sm:w-11 overflow-hidden rounded-lg bg-white flex items-center justify-center shrink-0">
                <img
                  src="/logo.png"
                  alt=""
                  className="h-[130%] w-[130%] object-cover object-[center_20%]"
                  style={{ marginTop: '-18%' }}
                />
              </div>
              {/* Wordmark */}
              <div className="flex flex-col leading-none">
                <span className="font-display text-sm font-bold tracking-[0.18em] text-cream sm:text-base">
                  PORCHLIGHT
                </span>
                <span className="text-[8px] uppercase tracking-[0.22em] text-cream/50 sm:text-[9px]">
                  Apartments
                </span>
              </div>
            </div>
          </Link>

          {/* Right — nav links + hamburger */}
          <div className="flex items-center gap-6 shrink-0">
            {/* Desktop nav */}
            <nav className="hidden items-center gap-7 lg:flex" aria-label="Main">
              {links.map(({ to, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  className={({ isActive }) =>
                    clsx(
                      'text-xs font-medium uppercase tracking-[0.16em] transition-colors',
                      isActive ? 'text-sage' : 'text-cream/75 hover:text-cream',
                    )
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/8 text-cream transition hover:bg-white/15 active:scale-95 lg:hidden"
              aria-expanded={open}
              aria-label={open ? 'Close menu' : 'Open menu'}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </header>

        {/* ── Mobile drawer (attached beneath the pill) ── */}
        {open && (
          <nav
            className={clsx(
              'rounded-b-2xl px-3 pb-4 pt-2 lg:hidden',
              'bg-navy-950/95 backdrop-blur-xl',
              'shadow-[0_16px_40px_rgba(0,0,0,0.35)] ring-1 ring-white/10 ring-t-0',
            )}
            aria-label="Mobile"
          >
            <ul className="space-y-0.5">
              {links.map(({ to, label }) => (
                <li key={to}>
                  <NavLink
                    to={to}
                    end={to === '/'}
                    onClick={() => setOpen(false)}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center justify-between rounded-xl px-4 py-3 font-display text-lg tracking-wide transition-colors',
                        isActive
                          ? 'bg-white/10 text-sage font-bold'
                          : 'text-cream/85 hover:bg-white/5 hover:text-cream',
                      )
                    }
                  >
                    <span>{label}</span>
                    <ArrowRight className="h-4 w-4 opacity-40" />
                  </NavLink>
                </li>
              ))}
            </ul>

            {/* Quick-contact shortcuts */}
            <div className="mt-3 border-t border-cream/10 pt-4">
              <p className="mb-2.5 px-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Quick Inquiries
              </p>
              <div className="grid grid-cols-2 gap-2">
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-3 text-xs font-bold text-cream transition active:scale-95"
                >
                  <Phone className="h-3.5 w-3.5 text-accent" />
                  Call Desk
                </a>
                <a
                  href={`https://wa.me/${COMPANY.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600/90 py-3 text-xs font-bold text-white shadow-sm transition active:scale-95"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </a>
              </div>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
}

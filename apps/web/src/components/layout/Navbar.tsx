import { COMPANY } from '@porchlight/shared';
import clsx from 'clsx';
import { ArrowRight, Menu, MessageCircle, Phone, X } from 'lucide-react';
import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Home' },
  { to: '/apartments', label: 'Residences' },
  { to: '/about', label: 'Our Story' },
  { to: '/contact', label: 'Contact' },
];

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-navy-900 text-cream">
      <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 sm:py-6 lg:px-8">

        {/* Left — branding */}
        <Link to="/" className="flex flex-col items-start">
          <p className="font-display text-base font-medium tracking-[0.22em] text-cream sm:text-xl sm:tracking-[0.28em]">
            PORCHLIGHT
          </p>
          <p className="text-[9px] uppercase tracking-[0.28em] text-sage sm:text-[10px]">Bole · Addis Ababa</p>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {links.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                clsx(
                  'text-xs font-medium uppercase tracking-[0.18em] transition',
                  isActive ? 'text-sage' : 'text-cream/80 hover:text-cream',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Mobile hamburger */}
        <div className="flex items-center lg:hidden">
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-cream transition active:scale-95"
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open ? (
        <nav className="border-t border-cream/10 bg-navy-950/95 px-5 py-6 backdrop-blur-xl lg:hidden" aria-label="Mobile">
          <ul className="space-y-1">
            {links.map(({ to, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    clsx(
                      'flex items-center justify-between rounded-xl px-4 py-3 font-display text-xl tracking-wide transition-colors',
                      isActive ? 'bg-white/10 text-sage font-bold' : 'text-cream/90 hover:bg-white/5 hover:text-cream',
                    )
                  }
                >
                  <span>{label}</span>
                  <ArrowRight className="h-4 w-4 opacity-40" />
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Quick-contact mobile shortcuts */}
          <div className="mt-6 border-t border-cream/10 pt-5">
            <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Quick Inquiries</p>
            <div className="grid grid-cols-2 gap-2.5">
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
      ) : null}
    </header>
  );
}

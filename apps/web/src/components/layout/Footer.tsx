import { Link } from 'react-router-dom';
import { COMPANY } from '@porchlight/shared';
import { MapPin, Phone, Mail } from 'lucide-react';

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/apartments', label: 'Residences' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

const socialLinks = [
  {
    href: COMPANY.social.facebook,
    label: 'Facebook',
    bgClass: 'bg-[#1877F2] hover:bg-[#166fe5]',
    path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z',
  },
  {
    href: COMPANY.social.tiktok,
    label: 'TikTok',
    bgClass: 'bg-black hover:bg-neutral-800',
    path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z',
  },
  {
    href: COMPANY.social.instagram,
    label: 'Instagram',
    bgClass: 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] hover:opacity-90',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z',
  },
  {
    href: 'https://t.me/porchlightapartment',
    label: 'Telegram',
    bgClass: 'bg-[#229ED9] hover:bg-[#1e8ec3]',
    path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z',
  },
  {
    href: COMPANY.social.linkedin,
    label: 'LinkedIn',
    bgClass: 'bg-[#0A66C2] hover:bg-[#095196]',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
];

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[#E9E5E0] bg-[#34282D] text-white/70">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-8 sm:py-10">
        {/* ── Top Header: Brand Logo & Title ── */}
        <div className="border-b border-white/10 pb-4">
          <Link to="/" aria-label="Porchlight – Home" className="inline-flex items-center gap-2.5 shrink-0">
            <div className="h-7 w-7 overflow-hidden rounded-sm bg-white flex items-center justify-center shrink-0">
              <img
                src="/logo.png"
                alt="Porchlight"
                className="h-[140%] w-[140%] object-cover object-[center_18%]"
                style={{ marginTop: '-20%' }}
              />
            </div>
            <span className="font-display text-xs sm:text-sm font-semibold tracking-[0.16em] sm:tracking-[0.18em] text-white">
              PORCHLIGHT
            </span>
          </Link>
        </div>

        {/* ── Main Content: Clean side-by-side columns (2 cols on mobile, 3 on sm+) ── */}
        <div className="grid grid-cols-2 gap-6 pt-5 sm:grid-cols-3 sm:gap-10">
          {/* Navigate */}
          <div>
            <p className="mb-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Navigate
            </p>
            <ul className="space-y-1.5">
              {navLinks.map(({ to, label }) => (
                <li key={to}>
                  <Link to={to} className="text-[12px] sm:text-[13px] text-white/70 transition hover:text-white">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact with Colored Social Media Icons below */}
          <div>
            <p className="mb-2.5 text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Contact
            </p>
            <ul className="space-y-2">
              <li>
                <a
                  href={`tel:${COMPANY.phone}`}
                  className="flex items-center gap-2 text-[12px] sm:text-[13px] text-white/70 transition hover:text-white"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0 text-white/40" />
                  <span className="truncate">{COMPANY.phone}</span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${COMPANY.email}`}
                  className="flex items-center gap-2 text-[12px] sm:text-[13px] text-white/70 transition hover:text-white"
                >
                  <Mail className="h-3.5 w-3.5 shrink-0 text-white/40" />
                  <span className="truncate">{COMPANY.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-2 text-[12px] sm:text-[13px] text-white/60">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-white/40" />
                <span>Bole, Addis Ababa</span>
              </li>
            </ul>

            {/* Social media icons below the contact list */}
            <div className="mt-3.5 flex items-center gap-2">
              {socialLinks.map(({ href, label, path, bgClass }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${bgClass} text-white shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md`}
                >
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>

          {/* About / Residence (visible on tablet and desktop) */}
          <div className="hidden sm:block">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/40">
              Residence
            </p>
            <p className="text-[13px] leading-relaxed text-white/50">
              Modern fully furnished serviced apartments in Bole, Addis Ababa, designed for comfort, security, and flexible corporate and private leases.
            </p>
          </div>
        </div>
      </div>

      {/* ── Bottom Bar: Copyright & Legal side-by-side ── */}
      <div className="border-t border-white/8">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-8">
          <p className="text-[11px] sm:text-[12px] text-white/40">
            © {year} Porchlight Apartment. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[11px] sm:text-[12px] text-white/40">
            <Link to="/privacy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <span>·</span>
            <Link to="/terms" className="transition hover:text-white">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

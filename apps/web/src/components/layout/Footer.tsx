import { Link } from 'react-router-dom';
import { COMPANY } from '@porchlight/shared';
import { Building2, MapPin, Phone, Mail } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-navy-950 text-slate-300">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4 sm:gap-10">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent sm:h-10 sm:w-10">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-display text-base font-bold text-white sm:text-lg">{COMPANY.name}</p>
                <p className="text-[10px] uppercase tracking-widest text-slate-400 sm:text-xs">Bole, Addis Ababa</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-slate-400 sm:mt-4 sm:text-sm">{COMPANY.tagline}</p>
          </div>

          {/* Quick Links & Support: 2 columns on mobile, direct columns on sm+ */}
          <div className="grid grid-cols-2 gap-6 sm:contents">
            {/* Navigation */}
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent sm:mb-4">Quick Links</p>
              <ul className="space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
                {[
                  { to: '/', label: 'Home' },
                  { to: '/apartments', label: 'Apartments' },
                  { to: '/about', label: 'About Us' },
                ].map((l) => (
                  <li key={l.to}>
                    <Link to={l.to} className="inline-block py-0.5 text-slate-300 transition-colors hover:text-white">{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent sm:mb-4">Support</p>
              <ul className="space-y-2 text-xs sm:space-y-2.5 sm:text-sm">
                <li><Link to="/contact" className="inline-block py-0.5 text-slate-300 transition-colors hover:text-white">Contact</Link></li>
                <li><Link to="/privacy" className="inline-block py-0.5 text-slate-300 transition-colors hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="inline-block py-0.5 text-slate-300 transition-colors hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Contact + Social Icons */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-accent sm:mb-4">Contact Info</p>
            <ul className="space-y-2.5 text-xs sm:space-y-3 sm:text-sm">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                <span className="text-slate-400">{COMPANY.address}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 shrink-0 text-accent" />
                <a href={`tel:${COMPANY.phone}`} className="font-medium text-slate-300 hover:text-white transition-colors">{COMPANY.phone}</a>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 shrink-0 text-accent" />
                <a href={`mailto:${COMPANY.email}`} className="font-medium text-slate-300 hover:text-white transition-colors">{COMPANY.email}</a>
              </li>
              <li className="text-xs text-slate-500 pt-0.5">{COMPANY.workingHours}</li>
            </ul>

            {/* Social icons */}
            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5">
              {/* Facebook */}
              <a href={COMPANY.social.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1877F2] text-white transition hover:-translate-y-0.5 hover:shadow-lg sm:h-9 sm:w-9">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              {/* Telegram */}
              <a href="https://t.me/porchlightapartment" target="_blank" rel="noreferrer" aria-label="Telegram"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#229ED9] text-white transition hover:-translate-y-0.5 hover:shadow-lg sm:h-9 sm:w-9">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </a>
              {/* LinkedIn */}
              <a href={COMPANY.social.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn"
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A66C2] text-white transition hover:-translate-y-0.5 hover:shadow-lg sm:h-9 sm:w-9">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
              {/* Instagram */}
              <a href={COMPANY.social.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"
                className="flex h-8 w-8 items-center justify-center rounded-full text-white transition hover:-translate-y-0.5 hover:shadow-lg sm:h-9 sm:w-9"
                style={{ background: 'linear-gradient(45deg,#f09433,#e6683c,#dc2743,#cc2366,#bc1888)' }}>
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 py-4 text-center text-xs text-slate-400 sm:py-5">
        <p className="mx-auto max-w-7xl px-4">
          © {new Date().getFullYear()} {COMPANY.name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

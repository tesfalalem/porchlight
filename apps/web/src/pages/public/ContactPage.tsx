import { COMPANY } from '@porchlight/shared';
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react';
import { InquiryForm } from '../../components/forms/InquiryForm';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function ContactPage() {
  useDocumentTitle('Contact — Porchlight Apartments');

  return (
    <div className="bg-white">
      {/* ── Header ── */}
      <div className="border-b border-[#E9E5E0] px-5 py-8 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="kicker-accent mb-1.5 text-[10px] sm:text-xs">Get in Touch</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-950 sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-2.5 max-w-xl text-[13px] sm:text-[15px] leading-relaxed text-slate-500">
            Questions about availability, pricing, or viewings? Our team responds within one business day.
          </p>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-12">

          {/* Form */}
          <div className="lg:col-span-7">
            <h2 className="font-display text-lg sm:text-2xl font-semibold text-navy-950 mb-4 sm:mb-6">Send a message</h2>
            <InquiryForm />
          </div>

          {/* Contact details + map */}
          <div className="space-y-5 sm:space-y-6 lg:col-span-5">
            {/* Contact list */}
            <div className="divide-y divide-[#E9E5E0] border border-[#E9E5E0] rounded-xl overflow-hidden">
              {[
                { icon: MapPin,       label: 'Address',       value: COMPANY.address,  href: 'https://maps.google.com/?q=Porchlight+Apartments+Bole+Addis+Ababa', external: true  },
                { icon: Phone,        label: 'Phone',         value: COMPANY.phone,    href: `tel:${COMPANY.phone}`,                                             external: false },
                { icon: Mail,         label: 'Email',         value: COMPANY.email,    href: `mailto:${COMPANY.email}`,                                          external: false },
                { icon: MessageCircle,label: 'WhatsApp',      value: 'Chat with us',   href: `https://wa.me/${COMPANY.whatsapp.replace(/\D/g, '')}`,             external: true  },
                { icon: Clock,        label: 'Working Hours', value: COMPANY.workingHours, href: undefined,                                                     external: false },
              ].map(({ icon: Icon, label, value, href, external }) => (
                <div key={label} className="flex items-start gap-3 sm:gap-3.5 bg-white px-3.5 py-3 sm:px-4 sm:py-3.5">
                  <Icon className="mt-0.5 h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-accent" />
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">{label}</p>
                    {href ? (
                      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noreferrer' : undefined}
                        className="mt-0.5 block text-xs sm:text-[13px] font-medium text-navy-950 transition hover:text-accent truncate">
                        {value}
                      </a>
                    ) : (
                      <p className="mt-0.5 text-xs sm:text-[13px] font-medium text-slate-600">{value}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Map */}
            <div className="overflow-hidden rounded-xl border border-[#E9E5E0]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.677421793918!2d38.78397397483259!3d9.00180039105844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85771a56ea35%3A0xba9aa88b7ce682!2sPorchlight%20apartments!5e0!3m2!1sen!2set!4v1789989139257!5m2!1sen!2set"
                width="100%"
                height="240"
                className="h-52 w-full sm:h-60"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Porchlight Apartments location"
              />
            </div>

            {/* Social */}
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Follow Us</p>
              <div className="flex items-center gap-2.5">
                {[
                  { href: COMPANY.social.facebook, label: 'Facebook', bg: '#1877F2', path: 'M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z' },
                  { href: COMPANY.social.tiktok, label: 'TikTok', bg: '#000000', path: 'M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z' },
                  { href: COMPANY.social.instagram, label: 'Instagram', bg: '#E1306C', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
                  { href: 'https://t.me/porchlightapartment', label: 'Telegram', bg: '#229ED9', path: 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z' },
                  { href: COMPANY.social.linkedin, label: 'LinkedIn', bg: '#0A66C2', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' },
                ].map(({ href, label, bg, path }) => (
                  <a key={label} href={href} target="_blank" rel="noreferrer" aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded text-white transition hover:opacity-85"
                    style={{ backgroundColor: bg }}>
                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24"><path d={path}/></svg>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

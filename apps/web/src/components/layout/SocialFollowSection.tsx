import { Facebook, Instagram } from 'lucide-react';
import { COMPANY } from '@porchlight/shared';

export function SocialFollowSection() {
  return (
    <section
      className="rounded-xl bg-navy-950 px-3 py-8 text-center text-white shadow-sm sm:rounded-2xl sm:px-10 sm:py-16"
      aria-label="Follow us"
    >
      <div className="mx-auto max-w-2xl">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Follow Us</p>
        <h2 className="mt-2 font-display text-xl font-extrabold tracking-tight sm:mt-3 sm:text-3xl">Stay Connected</h2>
        <div className="mx-auto mt-2 h-0.5 w-8 rounded-full bg-accent sm:mt-3 sm:h-1 sm:w-16" />
        <p className="mt-2 text-xs text-slate-300 sm:mt-4 sm:text-base">
          Follow us on social media for the latest updates and available units.
        </p>
        <div className="mt-5 flex flex-col sm:flex-row justify-center gap-3 sm:mt-8 sm:gap-4">
          <a
            href={COMPANY.social.facebook}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#1877F2] bg-[#1877F2] px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#166fe0] sm:w-auto sm:gap-3 sm:px-8 sm:py-3.5 sm:text-sm"
          >
            <Facebook className="h-4 w-4 sm:h-5 sm:w-5" />
            Facebook
          </a>
          <a
            href={COMPANY.social.tiktok}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-black bg-black px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-neutral-800 sm:w-auto sm:gap-3 sm:px-8 sm:py-3.5 sm:text-sm"
          >
            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.04-.1z" />
            </svg>
            TikTok
          </a>
          <a
            href={COMPANY.social.instagram}
            target="_blank"
            rel="noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-[#E1306C] bg-transparent px-6 py-3 text-xs font-bold text-white shadow-md transition-all hover:bg-[#E1306C] sm:w-auto sm:gap-3 sm:px-8 sm:py-3.5 sm:text-sm"
          >
            <Instagram className="h-4 w-4 sm:h-5 sm:w-5" />
            Instagram
          </a>
        </div>
      </div>
    </section>
  );
}

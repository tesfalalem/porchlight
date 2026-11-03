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

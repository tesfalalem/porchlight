import { ArrowRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

export function AboutPage() {
  useDocumentTitle('About Us — Porchlight Apartments');

  return (
    <div className="bg-white">
      {/* ── Header ── */}
      <div className="border-b border-[#E9E5E0] px-5 py-10 sm:px-8 sm:py-14">
        <div className="mx-auto max-w-6xl">
          <p className="kicker-accent mb-2">Our Story</p>
          <h1 className="font-display text-4xl font-semibold tracking-tight text-navy-950 sm:text-5xl">
            About Porchlight
          </h1>
          <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-slate-500">
            A sanctuary of comfort and peace of mind in Bole, Addis Ababa.
          </p>
        </div>
      </div>

      {/* ── Apartments section ── */}
      <section className="py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="overflow-hidden rounded-xl border border-[#E9E5E0]">
              <img
                src="/building.jpg"
                alt="Porchlight furnished apartment interior"
                className="aspect-[4/3] h-full w-full object-cover"
                loading="lazy"
              />
            </div>
            <div>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
                Built around the feeling of home.
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                Porchlight is a collection of 24 fully furnished apartments in Bole, Addis Ababa. Our 16 two-bedroom apartments and eight three-bedroom apartments each come with two bathrooms, giving you a choice of spaces for your stay.
              </p>
              <p className="mt-3 text-[15px] leading-relaxed text-slate-600">
                Whether you're visiting with family, travelling with friends, or staying alongside colleagues, you'll find a space that fits.
              </p>
              <Link
                to="/apartments"
                className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-hover"
              >
                Explore residences <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="border-t border-[#E9E5E0] bg-[#F8F6F2] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl mb-10">
            By the numbers
          </h2>
          <div className="grid grid-cols-2 gap-px border border-[#E9E5E0] bg-[#E9E5E0] sm:grid-cols-4">
            {[
              { value: '24', label: 'Residences', sub: 'Exclusively in Bole' },
              { value: '2 & 3', label: 'Bedroom suites', sub: 'Each with 2 bathrooms' },
              { value: '100%', label: 'Power & water', sub: 'Uninterrupted backup' },
              { value: '24/7', label: 'Security', sub: 'Guarded private access' },
            ].map(({ value, label, sub }) => (
              <div key={label} className="flex flex-col gap-1 bg-white p-6">
                <span className="font-display text-3xl font-semibold text-navy-950 sm:text-4xl">{value}</span>
                <span className="text-[13px] font-semibold text-navy-950">{label}</span>
                <span className="text-[12px] text-slate-500">{sub}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Location ── */}
      <section className="border-t border-[#E9E5E0] py-14 sm:py-20">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            <div>
              <p className="kicker-accent mb-2">Location</p>
              <h2 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
                The Bole Advantage
              </h2>
              <p className="mt-4 text-[15px] leading-relaxed text-slate-600">
                Situated in Bole, Porchlight places you in the diplomatic, business, and culinary nexus of Addis Ababa — while remaining on a quiet residential street that shelters you from traffic and noise.
              </p>
              <div className="mt-5 flex items-start gap-2 text-[14px] text-slate-500">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                Bole, Addis Ababa, Ethiopia
              </div>
            </div>
            <div className="overflow-hidden rounded-xl border border-[#E9E5E0]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.677421793918!2d38.78397397483259!3d9.00180039105844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85771a56ea35%3A0xba9aa88b7ce682!2sPorchlight%20apartments!5e0!3m2!1sen!2set!4v1789989139257!5m2!1sen!2set"
                width="100%"
                height="300"
                className="h-64 w-full sm:h-72"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Porchlight location map"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

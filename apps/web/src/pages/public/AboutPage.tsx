import { ArrowRight, Compass, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

const LIVING_IMAGE = '/building.jpg';

export function AboutPage() {
  useDocumentTitle('About Us — Porchlight Luxury Residences');

  return (
    <div className="bg-white">

      {/* ── 1. HEADER (Matches ContactPage styling exactly) ── */}
      <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 sm:pt-14 lg:px-8">
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Our Story</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">
          About Us
        </h1>
        <div className="mt-2 h-1 w-12 rounded-full bg-accent" />
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
          A sanctuary of comfort, style, and peace of mind in Bole, Addis Ababa.
        </p>
      </div>

      {/* ── 2. OUR APARTMENTS (2-Column layout matching screenshot) ── */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Centered Title with Accent Underline */}
          <div className="text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">
              Our Apartments
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-accent" />
          </div>

          {/* 2-Column Content: Image Left, Text Right */}
          <div className="mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-center">
            {/* Left Column: Image */}
            <div className="lg:col-span-6">
              <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-200/80 bg-slate-100 shadow-xl shadow-navy-950/5">
                <img
                  src={LIVING_IMAGE}
                  alt="Porchlight luxury furnished apartment interior"
                  className="h-full w-full object-cover aspect-[4/3] sm:aspect-[16/11] transition-transform duration-700 ease-out hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>

            {/* Right Column: Exact User Copy */}
            <div className="lg:col-span-6 space-y-6">
              <h3 className="font-display text-2xl font-bold text-navy-950 sm:text-3xl lg:text-4xl leading-snug">
                Built around the feeling of home.
              </h3>

              <p className="text-base sm:text-lg leading-relaxed text-slate-600">
                Porchlight is a collection of 24 fully furnished apartments in Bole, Addis Ababa. Our 16 two-bedroom apartments and eight three-bedroom apartments each come with two bathrooms, giving you a choice of spaces for your stay.
              </p>

              <p className="text-base sm:text-lg leading-relaxed text-slate-600">
                There's room to spend time together and room for privacy. Whether you're visiting with family, travelling with friends, or staying alongside colleagues, you can find a space that fits.
              </p>

              <div className="pt-2">
                <Link
                  to="/apartments"
                  className="inline-flex items-center gap-2.5 rounded-xl bg-accent px-7 py-3.5 text-sm sm:text-base font-bold text-white shadow-lg shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:scale-105 active:scale-95"
                >
                  <span>Explore the apartment options</span>
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. WHO WE ARE (Matches screenshot structure & preserves Porchlight story) ── */}
      <section className="py-16 sm:py-24 bg-slate-50/70 border-t border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Centered Title with Accent Underline */}
          <div className="text-center">
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">
              Who We Are
            </h2>
            <div className="mx-auto mt-3 h-1 w-16 rounded-full bg-accent" />
            <p className="mx-auto mt-5 max-w-3xl text-base sm:text-lg leading-relaxed text-slate-600">
              Porchlight was founded with a singular conviction: that finding a furnished residence in Addis Ababa should never mean compromising on dependable infrastructure, residential tranquility, or genuine hospitality.
            </p>
          </div>

          {/* Stats Grid */}
          <div className="mt-12 rounded-3xl border border-slate-200/90 bg-white p-6 sm:p-10 shadow-xl shadow-navy-950/5">
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 md:divide-x md:divide-slate-100">
              <div className="text-center sm:px-4">
                <p className="font-display text-4xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">24</p>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-accent">Curated Residences</p>
                <p className="mt-0.5 text-xs text-slate-400">Exclusively in Bole</p>
              </div>

              <div className="text-center sm:px-4">
                <p className="font-display text-4xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">2 & 3</p>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-accent">Bedroom Suites</p>
                <p className="mt-0.5 text-xs text-slate-400">Each with 2 Bathrooms</p>
              </div>

              <div className="text-center sm:px-4">
                <p className="font-display text-4xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">100%</p>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-accent">Power & Water</p>
                <p className="mt-0.5 text-xs text-slate-400">Uninterrupted Backup</p>
              </div>

              <div className="text-center sm:px-4">
                <p className="font-display text-4xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">24/7</p>
                <p className="mt-1.5 text-xs font-bold uppercase tracking-wider text-accent">Concierge & Security</p>
                <p className="mt-0.5 text-xs text-slate-400">Guarded Private Access</p>
              </div>
            </div>
          </div>

          {/* Neighborhood & Address */}
          <div className="mt-16 grid gap-12 lg:grid-cols-12 lg:items-center">
            {/* Left Narrative */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3.5 py-1 text-xs font-bold text-slate-700 shadow-sm">
                <Compass className="h-3.5 w-3.5 text-accent" />
                Neighborhood & Address
              </div>

              <h3 className="font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
                The Bole Advantage:<br />
                <span className="text-accent">Addis Ababa’s Most Coveted District</span>
              </h3>

              <p className="text-base leading-relaxed text-slate-600 sm:text-lg">
                Location shapes how you experience a city. Situated in Bole, Porchlight places you in the diplomatic, business, and culinary nexus of the capital, while remaining tucked away on a quiet residential street that shelters you from traffic and commotion.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <p className="text-sm font-bold text-navy-950">✈️ Bole Int. Airport</p>
                  <p className="text-xs text-slate-500">8 minutes direct drive</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <p className="text-sm font-bold text-navy-950">🏛️ UNECA & AU HQ</p>
                  <p className="text-xs text-slate-500">10-14 minutes corridor</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <p className="text-sm font-bold text-navy-950">☕ Medhanialem Cafés</p>
                  <p className="text-xs text-slate-500">4 minutes walking distance</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-sm">
                  <p className="text-sm font-bold text-navy-950">🏥 Premier Healthcare</p>
                  <p className="text-xs text-slate-500">Nordic & Korean Hospitals</p>
                </div>
              </div>
            </div>

            {/* Right Map Card */}
            <div className="lg:col-span-5">
              <div className="relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-xl shadow-navy-950/8">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.677421793918!2d38.78397397483259!3d9.00180039105844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85771a56ea35%3A0xba9aa88b7ce682!2sPorchlight%20apartments!5e0!3m2!1sen!2set!4v1789989139257!5m2!1sen!2set"
                  width="100%"
                  height="340"
                  className="w-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Porchlight location map"
                />
                <div className="border-t border-slate-100 p-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-accent shrink-0" />
                    <span className="text-xs font-bold text-navy-950">Bole, Addis Ababa, Ethiopia</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}

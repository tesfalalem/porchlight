import { COMPANY } from '@porchlight/shared';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, MapPin, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ApartmentCard } from '../../components/apartments/ApartmentCard';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { BUILDING_AMENITIES } from '../../data/buildingAmenities';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchApartments } from '../../services/apartmentsApi';
import { getAmenityIcon } from '../../utils/amenityIcons';

const HERO_IMAGE = '/building.jpg';

export function HomePage() {
  useDocumentTitle('Porchlight Apartments — Bole, Addis Ababa');

  const apartmentsQuery = useQuery({
    queryKey: ['apartments'],
    queryFn: () => fetchApartments(),
  });

  const featuredApartments = (apartmentsQuery.data ?? []).slice(0, 3);

  return (
    <div>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative flex min-h-[calc(100svh-56px)] flex-col justify-end overflow-hidden bg-[#34282D]">
        <img
          src={HERO_IMAGE}
          alt=""
          fetchPriority="high"
          width={1920}
          height={1080}
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#34282D]/85 via-[#34282D]/30 to-transparent" />

        <div className="relative z-10 px-5 pb-10 sm:px-10 sm:pb-16 md:max-w-3xl lg:pb-20">
          <p className="kicker mb-3 text-white/60">Bole, Addis Ababa</p>

          <h1 className="font-display text-[2rem] font-semibold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
            Live beautifully<br />in Bole.
          </h1>

          <p className="mt-3 max-w-md text-[14px] leading-relaxed text-white/70 sm:text-[15px]">
            Discover thoughtfully furnished residences designed for comfortable city living.
          </p>

          <div className="mt-6 flex flex-wrap gap-2.5">
            <Link
              to="/apartments"
              className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover active:scale-[0.98]"
            >
              Explore Residences
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tour"
              className="inline-flex items-center gap-2 rounded-lg border border-white/25 px-5 py-2.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/8"
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              Video Tour
            </Link>
          </div>
        </div>
      </section>

      {/* ── FEATURED RESIDENCES ──────────────────────────────── */}
      <section className="bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">

          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="kicker-accent mb-1">Available Residences</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
                Find your residence
              </h2>
            </div>
            <Link
              to="/apartments"
              className="shrink-0 inline-flex items-center gap-1 text-sm font-semibold text-accent transition hover:text-accent-hover"
            >
              View all <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          {apartmentsQuery.isLoading && <LoadingState label="Loading residences…" />}
          {apartmentsQuery.isError && <ErrorState onRetry={() => void apartmentsQuery.refetch()} />}
          {!apartmentsQuery.isLoading && !apartmentsQuery.isError && (
            featuredApartments.length === 0
              ? <EmptyState message="No residences available at this time." />
              : <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
                  {featuredApartments.map((apt) => (
                    <ApartmentCard key={apt.id} apartment={apt} />
                  ))}
                </div>
          )}
        </div>
      </section>

      {/* ── AMENITIES ────────────────────────────────────────── */}
      <section className="border-t border-[#E9E5E0] bg-[#F8F6F2] py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">

          <div className="mb-6 flex items-end justify-between gap-4 sm:mb-8">
            <div>
              <p className="kicker-accent mb-1">Building Features</p>
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
                Everything included
              </h2>
            </div>
          </div>

          {/* 2-col mobile → 4-col sm+ amenity grid */}
          <div className="grid grid-cols-2 gap-px border border-[#E9E5E0] bg-[#E9E5E0] sm:grid-cols-4">
            {BUILDING_AMENITIES.map((a) => {
              const Icon = getAmenityIcon(a.icon ?? a.slug);
              return (
                <div key={a.id} className="flex items-start gap-3 bg-white p-3.5 sm:p-4">
                  <Icon className="mt-0.5 h-4 w-4 shrink-0 text-accent" aria-hidden />
                  <div className="min-w-0">
                    <span className="block text-[13px] font-semibold text-navy-950 leading-tight">{a.name}</span>
                    {a.description && (
                      <span className="mt-0.5 block text-[11px] leading-snug text-slate-500 line-clamp-2">
                        {a.description}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── LOCATION ─────────────────────────────────────────── */}
      <section className="border-t border-[#E9E5E0] bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-8">

          <div className="mb-6 sm:mb-8">
            <p className="kicker-accent mb-1">Location</p>
            <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-950 sm:text-3xl">
              Bole, Addis Ababa
            </h2>
          </div>

          {/* On mobile: map first (visual), contact below; on md+ side by side */}
          <div className="grid gap-6 md:grid-cols-2 md:items-start">
            {/* Contact details */}
            <div className="order-2 md:order-1">
              <ul className="space-y-3 text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span>{COMPANY.address}</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-4 w-4 shrink-0" />
                  <a href={`tel:${COMPANY.phone}`} className="font-semibold text-navy-950 hover:text-accent transition-colors">
                    {COMPANY.phone}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-4 w-4 shrink-0" />
                  <a href={`mailto:${COMPANY.email}`} className="font-semibold text-navy-950 hover:text-accent transition-colors">
                    {COMPANY.email}
                  </a>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="h-4 w-4 shrink-0" />
                  <span className="text-slate-500">{COMPANY.workingHours}</span>
                </li>
              </ul>
              <Link
                to="/contact"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-accent-hover"
              >
                Get in touch <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Map */}
            <div className="order-1 overflow-hidden rounded-lg border border-[#E9E5E0] md:order-2">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.677421793918!2d38.78397397483259!3d9.00180039105844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85771a56ea35%3A0xba9aa88b7ce682!2sPorchlight%20apartments!5e0!3m2!1sen!2set!4v1789989139257!5m2!1sen!2set"
                width="100%"
                height="260"
                className="h-52 w-full sm:h-64"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Porchlight Apartments location"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

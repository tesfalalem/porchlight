import { COMPANY } from '@porchlight/shared';
import { useQuery } from '@tanstack/react-query';
import { ArrowRight, MapPin, Play } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AmenityCard } from '../../components/apartments/AmenityCard';
import { ApartmentGrid } from '../../components/apartments/ApartmentGrid';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { BUILDING_AMENITIES } from '../../data/buildingAmenities';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchApartments } from '../../services/apartmentsApi';

const HERO_IMAGE = '/building.jpg';

export function HomePage() {
  useDocumentTitle('Modern furnished apartments in Bole, Addis Ababa');

  const apartmentsQuery = useQuery({
    queryKey: ['apartments'],
    queryFn: () => fetchApartments(),
  });

  const featuredApartments = (apartmentsQuery.data ?? []).slice(0, 3);

  return (
    <div>
      {/* ── HERO: CINEMATIC FULL-WIDTH CENTERED LAYOUT ── */}
      <section className="relative min-h-[calc(100vh-72px)] sm:min-h-[calc(100vh-88px)] flex items-center justify-center overflow-hidden bg-navy-950 text-white">
        {/* Full-bleed background image */}
        <div className="absolute inset-0 z-0">
          <img
            src={HERO_IMAGE}
            alt="Porchlight Luxury Furnished Apartments in Bole"
            fetchPriority="high"
            width={1920}
            height={1080}
            className="h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-black/5" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        </div>

        {/* Centered Content Container */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-20 text-center sm:px-6 sm:py-28 lg:px-8 lg:py-32">

          <h1 className="mt-6 font-display text-4xl font-black leading-[1.15] tracking-tight text-navy-950 sm:text-6xl md:text-7xl">
            <span className="bg-white/75 backdrop-blur-sm px-4 py-2 box-decoration-clone leading-[1.35]">
              Find Your Next Home in Bole, Addis Ababa
            </span>
          </h1>

          {/* Centered Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
            <Link
              to="/apartments"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-white px-8 py-4 text-sm sm:text-base font-bold text-navy-950 shadow-xl transition-all duration-200 hover:bg-slate-100 hover:scale-105 active:scale-95"
            >
              <span>Explore Apartments</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/tour"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2.5 rounded-xl bg-accent px-8 py-4 text-sm sm:text-base font-bold text-white shadow-xl shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:scale-105 active:scale-95"
            >
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-white">
                <Play className="h-3 w-3 fill-current ml-0.5" />
              </div>
              <span>Watch Video Tour</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ── FIND YOUR APARTMENT ── */}
      <section className="bg-white py-10 sm:py-16">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Choose Your Space</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">
              Find Your Apartment
            </h2>
            <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-accent" />
            <p className="mx-auto mt-3 max-w-lg text-sm text-slate-500 sm:text-base">
              Choose the apartment that fits your needs.
            </p>
          </div>

          {apartmentsQuery.isLoading ? <LoadingState label="Loading apartments…" /> : null}
          {apartmentsQuery.isError ? (
            <ErrorState onRetry={() => void apartmentsQuery.refetch()} />
          ) : null}
          {!apartmentsQuery.isLoading && !apartmentsQuery.isError && (
            <>
              {featuredApartments.length === 0 ? (
                <EmptyState message="No apartments available at this time." />
              ) : (
                <>
                  <ApartmentGrid apartments={featuredApartments} />
                  <div className="mt-10 flex justify-center">
                    <Link
                      to="/apartments"
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3.5 text-sm font-bold text-white shadow-md shadow-accent/25 transition-all duration-200 hover:bg-accent-hover hover:scale-105 active:scale-95"
                    >
                      <span>See All Apartments</span>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </section>

      {/* ── BUILDING AMENITIES ── */}
      <section className="bg-white py-10 sm:py-24">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">BUILDING AMENITIES</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy-950 sm:text-5xl">
              Everything You Need
            </h2>
            <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-accent" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-5">
            {BUILDING_AMENITIES.map((a) => (
              <AmenityCard key={a.id} amenity={a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── VISIT US ── */}
      <section className="border-t border-slate-200 bg-slate-50 py-12 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center sm:mb-12">
            <p className="text-xs font-bold uppercase tracking-widest text-accent">Find Us</p>
            <h2 className="mt-2 font-display text-2xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Visit Us in Bole</h2>
            <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-accent" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 items-start gap-6 sm:gap-10">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-8">
              <ul className="space-y-3 text-xs sm:space-y-4 sm:text-sm">
                <li className="flex items-start gap-2.5 sm:gap-3">
                  <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <span className="font-medium text-slate-700">{COMPANY.address}</span>
                </li>
                <li><a href={`tel:${COMPANY.phone}`} className="font-bold text-navy-900 hover:text-accent">{COMPANY.phone}</a></li>
                <li><a href={`mailto:${COMPANY.email}`} className="font-bold text-navy-900 hover:text-accent">{COMPANY.email}</a></li>
                <li className="text-slate-500">{COMPANY.workingHours}</li>
              </ul>
              <Link
                to="/contact"
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-xs font-bold text-white shadow-sm shadow-accent/20 transition hover:bg-accent-hover sm:mt-6 sm:py-3.5 sm:text-sm"
              >
                Get Directions & Contact <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.677421793918!2d38.78397397483259!3d9.00180039105844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85771a56ea35%3A0xba9aa88b7ce682!2sPorchlight%20apartments!5e0!3m2!1sen!2set!4v1789989139257!5m2!1sen!2set"
                width="100%"
                height="300"
                className="h-64 w-full sm:h-[300px]"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Porchlight location"
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

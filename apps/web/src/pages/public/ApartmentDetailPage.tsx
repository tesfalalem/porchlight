import { COMPANY } from '@porchlight/shared';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Check,
  ChevronRight,
  ExternalLink,
  Heart,
  Home,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Play,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getAmenityIcon } from '../../utils/amenityIcons';
import { ImageGallery } from '../../components/apartments/ImageGallery';
import { ApartmentCard } from '../../components/apartments/ApartmentCard';
import { InquiryForm } from '../../components/forms/InquiryForm';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatPrice } from '../../utils/format';
import { fetchApartment, fetchApartments } from '../../services/apartmentsApi';

export function ApartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { backTo?: string; backLabel?: string } | null;
  const backTo = state?.backTo ?? '/apartments';
  const backLabel = state?.backLabel ?? 'All Apartments';

  // Share link feedback toast
  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Saved / Favorite state
  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('porchlight_saved_residences') || '[]');
      return Array.isArray(saved) && saved.includes(id);
    } catch {
      return false;
    }
  });

  const handleToggleSave = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('porchlight_saved_residences') || '[]');
      let updated: string[];
      if (saved.includes(id!)) {
        updated = saved.filter((item) => item !== id);
        setIsSaved(false);
      } else {
        updated = [...saved, id!];
        setIsSaved(true);
      }
      localStorage.setItem('porchlight_saved_residences', JSON.stringify(updated));
    } catch {
      setIsSaved(!isSaved);
    }
  };

  const query = useQuery({
    queryKey: ['apartment', id],
    queryFn: () => fetchApartment(id!),
    enabled: Boolean(id),
  });

  const apt = query.data;

  // Similar apartments query
  const similarQuery = useQuery({
    queryKey: ['apartments', 'similar', apt?.type],
    queryFn: () => fetchApartments(),
    enabled: Boolean(apt?.type),
  });

  const similarApartments = (similarQuery.data ?? [])
    .filter((a) => a.id !== id)
    .slice(0, 3);

  useDocumentTitle(apt ? `${apt.name} — Unit ${apt.number} | Porchlight` : 'Residence Details — Porchlight');

  if (query.isLoading) return <LoadingState label="Loading apartment residence details…" />;
  if (query.isError || !apt) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-24 text-center">
        <ErrorState message="We could not find or load this apartment residence." onRetry={() => void query.refetch()} />
        <Link
          to={backTo}
          className="mt-8 inline-flex items-center gap-2 rounded-2xl bg-navy-950 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-navy-900"
        >
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>
      </div>
    );
  }

  const cleanPhone = COMPANY.whatsapp.replace(/\D/g, '');

  return (
    <div className="animate-fade-in bg-slate-50/50 pb-28">
      {/* ── BREADCRUMB & UTILITY ACTION HEADER ── */}
      <div className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-3.5 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-500 overflow-x-auto no-scrollbar py-0.5">
            <Link to="/" className="flex items-center gap-1 transition hover:text-navy-950">
              <Home className="h-3.5 w-3.5" />
              <span>Home</span>
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <Link to={backTo} className="transition hover:text-navy-950 truncate max-w-[150px] sm:max-w-none">
              {backLabel}
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />
            <span className="font-bold text-navy-950 truncate max-w-[180px] sm:max-w-none">
              Unit {apt.number} · {apt.name}
            </span>
          </nav>

          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Share Link Button */}
            <div className="relative">
              <button
                type="button"
                onClick={handleShare}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 shadow-2xs transition hover:bg-slate-50 active:scale-95"
                title="Share this apartment"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Share2 className="h-3.5 w-3.5 text-slate-500" />}
                <span>{copied ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Save / Favorite Button */}
            <button
              type="button"
              onClick={handleToggleSave}
              className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold shadow-2xs transition active:scale-95 ${
                isSaved
                  ? 'border-red-200 bg-red-50 text-red-600'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
              title={isSaved ? 'Remove from saved' : 'Save this apartment'}
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-500'}`} />
              <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
            </button>

            {/* Virtual Tour Quick Link */}
            <Link
              to="/tour"
              className="inline-flex items-center gap-1.5 rounded-xl border border-accent/30 bg-accent/5 px-3 py-1.5 text-xs font-bold text-accent shadow-2xs transition hover:bg-accent/10 active:scale-95"
            >
              <Play className="h-3.5 w-3.5 fill-accent text-accent" />
              <span>Virtual Tour</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        {/* ── PHOTO GALLERY ── */}
        <ImageGallery images={apt.images} apartmentName={apt.name} />

        {/* ── 2-COLUMN MAIN CONTENT GRID ── */}
        <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-10">
          {/* ── LEFT: DETAILS & FEATURES (8 COLS) ── */}
          <div className="space-y-8 lg:col-span-7 xl:col-span-8">
            {/* Primary Residence Info Card */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                      <Sparkles className="h-3 w-3" /> Bole Prime Living
                    </span>
                    <span className="text-xs text-slate-400">·</span>
                    <span className="text-xs font-bold text-slate-500">Unit {apt.number}</span>
                  </div>
                  <h1 className="mt-1 font-display text-2xl font-black tracking-tight text-navy-950 sm:text-4xl">
                    {apt.name}
                  </h1>
                  <p className="mt-1.5 flex items-center gap-2 text-xs font-semibold text-slate-500 sm:text-sm">
                    <MapPin className="h-4 w-4 shrink-0 text-accent" />
                    <span>{apt.location}</span>
                    {apt.floor != null ? <span className="text-slate-300">·</span> : null}
                    {apt.floor != null ? (
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-navy-900 font-bold text-xs">
                        Floor {apt.floor}
                      </span>
                    ) : null}
                  </p>
                </div>

                <StatusBadge status={apt.availabilityStatus} availableFrom={apt.availableFrom} />
              </div>

              {/* Core Specs Metric Pills */}
              <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:bg-slate-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <BedDouble className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bedrooms</p>
                    <p className="font-display text-sm font-bold text-navy-950 sm:text-base">
                      {apt.bedrooms} {apt.bedrooms === 1 ? 'Bed' : 'Beds'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:bg-slate-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Bath className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Bathrooms</p>
                    <p className="font-display text-sm font-bold text-navy-950 sm:text-base">
                      {apt.bathrooms} {apt.bathrooms === 1 ? 'Bath' : 'Baths'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:bg-slate-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Maximize2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Area</p>
                    <p className="font-display text-sm font-bold text-navy-950 sm:text-base">
                      {apt.size ? `${apt.size} m²` : 'Spacious'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/80 p-3.5 transition hover:bg-slate-50">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Building Level</p>
                    <p className="font-display text-sm font-bold text-navy-950 sm:text-base">
                      {apt.floor != null ? `Floor ${apt.floor}` : 'Mid-High'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Monthly Rate Showcase Banner */}
              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-accent/20 bg-gradient-to-r from-accent/5 via-accent/10 to-transparent p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Lease Rate</p>
                  <p className="font-display text-2xl font-extrabold text-navy-950 sm:text-3xl">
                    {formatPrice(apt.price)} <span className="text-sm font-semibold text-slate-500">ETB / month</span>
                  </p>
                </div>
                <div className="rounded-xl border border-accent/20 bg-white/80 px-3.5 py-2 text-xs font-semibold text-slate-700 shadow-2xs backdrop-blur-sm sm:text-right">
                  <span className="block font-bold text-emerald-700">✓ Inclusive Living</span>
                  <span className="text-[11px] text-slate-500">WiFi, 24/7 Generator, Reserve Water & Parking included</span>
                </div>
              </div>
            </div>

            {/* Features & Amenities */}
            {apt.amenities.length > 0 && (
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="font-display text-xl font-bold tracking-tight text-navy-950 sm:text-2xl">
                      Features & Amenities
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Everything installed and maintained directly by building management
                    </p>
                  </div>
                  <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                    {apt.amenities.length} Included
                  </span>
                </div>

                <ul className="mt-6 grid grid-cols-1 gap-3.5 sm:grid-cols-2 md:grid-cols-3">
                  {apt.amenities.map((a) => {
                    const Icon = getAmenityIcon(a.icon ?? a.slug);
                    return (
                      <li
                        key={a.id}
                        className="group flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/60 p-3.5 transition-all duration-200 hover:border-accent/40 hover:bg-white hover:shadow-md"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-950/5 text-navy-800 transition-colors group-hover:bg-accent group-hover:text-white">
                          <Icon className="h-4 w-4" aria-hidden />
                        </div>
                        <div className="min-w-0">
                          <span className="block text-xs font-bold text-navy-950 truncate">{a.name}</span>
                          <span className="block text-[11px] text-slate-400 truncate">
                            {a.description || 'Verified on-site'}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            )}

            {/* Building & Floor Specifications Table */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
              <h2 className="font-display text-xl font-bold tracking-tight text-navy-950 sm:text-2xl">
                Building & Residence Specifications
              </h2>
              <div className="mt-5 divide-y divide-slate-100 text-xs sm:text-sm">
                <div className="flex justify-between py-3">
                  <span className="font-medium text-slate-500">Unit Number</span>
                  <span className="font-bold text-navy-950">Unit {apt.number}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-slate-500">Residence Type</span>
                  <span className="font-bold text-navy-950">{apt.type}</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-slate-500">Story / Floor</span>
                  <span className="font-bold text-navy-950">
                    {apt.floor != null ? `Floor ${apt.floor} (Stories 3–10)` : 'Upper Level'}
                  </span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-slate-500">Vertical Transit</span>
                  <span className="font-bold text-navy-950">Dual High-Speed Elevators + Service Stairs</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-slate-500">Furnishing State</span>
                  <span className="font-bold text-navy-950">Fully Furnished & Ready for Move-In</span>
                </div>
                <div className="flex justify-between py-3">
                  <span className="font-medium text-slate-500">Management & Maintenance</span>
                  <span className="font-bold text-accent">Direct Porchlight On-Site Management</span>
                </div>
              </div>
            </div>

            {/* Prime Bole Location & Neighborhood Guide */}
            <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-xs sm:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="font-display text-xl font-bold tracking-tight text-navy-950 sm:text-2xl">
                    Location & Neighborhood
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Centrally located in Bole, Addis Ababa with quick access to key destinations
                  </p>
                </div>
                <a
                  href="https://maps.google.com/?q=Porchlight+Apartments+Bole+Addis+Ababa"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                >
                  <span>Open in Google Maps</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </div>

              {/* Commute Highlights */}
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                  <span className="text-lg">✈️</span>
                  <p className="mt-1 font-bold text-navy-950 text-xs sm:text-sm">7 Mins</p>
                  <p className="text-[10px] font-semibold text-slate-400">Bole Int'l Airport</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                  <span className="text-lg">🛍️</span>
                  <p className="mt-1 font-bold text-navy-950 text-xs sm:text-sm">3 Mins</p>
                  <p className="text-[10px] font-semibold text-slate-400">Edna Mall & Cinema</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                  <span className="text-lg">☕</span>
                  <p className="mt-1 font-bold text-navy-950 text-xs sm:text-sm">2 Mins</p>
                  <p className="text-[10px] font-semibold text-slate-400">Tomoca & Cafes</p>
                </div>
                <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-3 text-center">
                  <span className="text-lg">🏥</span>
                  <p className="mt-1 font-bold text-navy-950 text-xs sm:text-sm">5 Mins</p>
                  <p className="text-[10px] font-semibold text-slate-400">Medical Clinics</p>
                </div>
              </div>

              {/* Embedded Map */}
              <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200/90 shadow-xs">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3940.677421793918!2d38.78397397483259!3d9.00180039105844!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x164b85771a56ea35%3A0xba9aa88b7ce682!2sPorchlight%20apartments!5e0!3m2!1sen!2set!4v1789989139257!5m2!1sen!2set"
                  width="100%"
                  height="260"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="strict-origin-when-cross-origin"
                  title="Porchlight Apartments Location Map"
                />
              </div>
            </div>
          </div>

          {/* ── RIGHT: STICKY LEASING HUB & INQUIRY FORM (4 COLS) ── */}
          <aside id="inquiry-section" className="space-y-6 lg:col-span-5 xl:col-span-4 scroll-mt-24">
            <div className="sticky top-6 space-y-6">
              {/* Main Booking Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-6 shadow-md shadow-navy-950/5 sm:p-7">
                <div className="border-b border-slate-100 pb-5">
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Lease Pricing</p>
                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-display text-3xl font-black text-navy-950 sm:text-4xl">
                      {formatPrice(apt.price)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">ETB / month</span>
                  </div>
                  <p className="mt-1 text-[11px] font-medium text-emerald-700">
                    ✓ Zero broker commission · Direct landlord lease
                  </p>
                </div>

                {/* Instant Communication CTAs */}
                <div className="mt-5 space-y-2.5">
                  <a
                    href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                      `Hello, I would like to inquire about ${apt.name} (Unit ${apt.number}) priced at ${formatPrice(apt.price)} ETB/mo. Is it available for a viewing?`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#25D366] py-3 text-xs font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-[#20ba5a] active:scale-95"
                  >
                    <MessageCircle className="h-4 w-4" />
                    Chat with Leasing Agent on WhatsApp
                  </a>

                  <a
                    href={`tel:${COMPANY.phone}`}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-2.5 text-xs font-bold text-navy-950 shadow-2xs transition hover:bg-slate-50 active:scale-95"
                  >
                    <Phone className="h-3.5 w-3.5 text-accent" />
                    Call Office: {COMPANY.phone}
                  </a>
                </div>

                {/* Form Divider */}
                <div className="relative my-6 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-100" />
                  </div>
                  <span className="relative bg-white px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Or send online inquiry
                  </span>
                </div>

                {/* Inquiry Form */}
                <InquiryForm defaultApartmentId={apt.id} />
              </div>

              {/* Porchlight Resident Guarantee Card */}
              <div className="rounded-3xl border border-slate-200/90 bg-white p-5 shadow-xs space-y-3 text-xs">
                <p className="font-bold uppercase tracking-wider text-slate-400">
                  Porchlight Living Guarantee
                </p>
                <div className="flex items-start gap-2.5 text-slate-600">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>
                    <strong>100% Genuine Photography</strong> — every unit photo represents the exact finishes.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-600">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>
                    <strong>Rapid Maintenance Team</strong> on-site to handle repairs, plumbing, or electrical issues.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 text-slate-600">
                  <Check className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
                  <span>
                    <strong>Flexible Corporate Leases</strong> with diplomatic invoicing & VAT documentation.
                  </span>
                </div>
              </div>
            </div>
          </aside>
        </div>

        {/* ── SIMILAR RESIDENCES SECTION ── */}
        {similarApartments.length > 0 && (
          <section className="mt-16 sm:mt-24 border-t border-slate-200/80 pt-12">
            <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-accent">
                  Compare Options
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold tracking-tight text-navy-950 sm:text-3xl">
                  Similar Residences You Might Like
                </h2>
              </div>
              <Link
                to={backTo}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-accent hover:underline"
              >
                <span>Browse all {backLabel.toLowerCase()}</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {similarApartments.map((otherApt) => (
                <ApartmentCard key={otherApt.id} apartment={otherApt} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── MOBILE STICKY CONVERSION BAR ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200/90 bg-white/95 px-4 py-3 shadow-2xl backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Monthly Rent</p>
            <p className="font-display text-base font-black text-navy-950 sm:text-lg">
              {formatPrice(apt.price)} <span className="text-xs font-normal text-slate-500">/ mo</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                `Hello, I'm interested in ${apt.name} (Unit ${apt.number}). Is it available?`,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-emerald-50 text-emerald-600 shadow-2xs transition hover:bg-emerald-100"
              aria-label="Contact via WhatsApp"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('inquiry-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-accent/25 transition active:scale-95 sm:text-sm"
            >
              Inquire / Book
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

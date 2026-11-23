import { COMPANY } from '@porchlight/shared';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  MapPin,
  Maximize2,
  MessageCircle,
  Phone,
  Play,
  Share2,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getAmenityIcon } from '../../utils/amenityIcons';
import { ApartmentCard } from '../../components/apartments/ApartmentCard';
import { InquiryForm } from '../../components/forms/InquiryForm';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatPrice } from '../../utils/format';
import { fetchApartment, fetchApartments } from '../../services/apartmentsApi';

// ── Minimal inline gallery (mobile-first, full-width) ────────────────────────
function Gallery({ images, name }: { images: { url: string; alt?: string | null; isPrimary?: boolean; sortOrder?: number }[]; name?: string }) {
  const sorted = useMemo(
    () => [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [images],
  );
  const [idx, setIdx] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);
  const touchX = useRef<number | null>(null);

  const prev = () => setIdx((i) => (i === 0 ? sorted.length - 1 : i - 1));
  const next = () => setIdx((i) => (i === sorted.length - 1 ? 0 : i + 1));

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setLbIdx((i) => (i === sorted.length - 1 ? 0 : i + 1));
      if (e.key === 'ArrowLeft') setLbIdx((i) => (i === 0 ? sorted.length - 1 : i - 1));
      if (e.key === 'Escape') setLightbox(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightbox, sorted.length]);

  if (!sorted.length) return (
    <div className="flex aspect-[4/3] w-full items-center justify-center bg-[#F3F0EC]">
      <span className="text-sm text-slate-400">No photographs available</span>
    </div>
  );

  const current = sorted[idx];

  return (
    <>
      {/* Main viewer */}
      <div
        className="relative w-full overflow-hidden bg-[#1A1214]"
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current === null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (dx < -40) next();
          else if (dx > 40) prev();
          touchX.current = null;
        }}
      >
        <div className="aspect-[4/3] sm:aspect-[16/9]">
          <img
            key={idx}
            src={current.url}
            alt={current.alt ?? name ?? 'Residence photograph'}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Counter */}
        <div className="absolute bottom-3 left-3 rounded bg-black/50 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
          {idx + 1} / {sorted.length}
        </div>

        {/* Fullscreen */}
        <button
          type="button"
          onClick={() => { setLbIdx(idx); setLightbox(true); }}
          className="absolute bottom-3 right-3 rounded bg-black/50 px-2.5 py-1.5 text-[11px] font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
          aria-label="Open fullscreen gallery"
        >
          View all {sorted.length} photos
        </button>

        {/* Prev/Next — only when multiple images */}
        {sorted.length > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm transition hover:bg-black/60"
              aria-label="Next photo"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {sorted.length > 1 && (
        <div className="flex gap-1.5 overflow-x-auto bg-[#1A1214] px-1 pb-1 no-scrollbar">
          {sorted.map((img, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIdx(i)}
              className={`h-14 w-20 shrink-0 overflow-hidden rounded transition ${
                i === idx ? 'ring-2 ring-accent ring-offset-1 ring-offset-[#1A1214]' : 'opacity-50 hover:opacity-80'
              }`}
              aria-label={`Photo ${i + 1}`}
            >
              <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Fullscreen gallery">
          <div className="flex h-12 shrink-0 items-center justify-between px-4">
            <span className="text-[13px] font-medium text-white/60">
              {lbIdx + 1} / {sorted.length}
            </span>
            <button
              type="button"
              onClick={() => setLightbox(false)}
              className="flex h-8 w-8 items-center justify-center rounded text-white/60 hover:text-white"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="relative flex flex-1 items-center justify-center px-4">
            <img
              src={sorted[lbIdx].url}
              alt={sorted[lbIdx].alt ?? ''}
              className="max-h-full max-w-full object-contain"
            />
            {sorted.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLbIdx((i) => (i === 0 ? sorted.length - 1 : i - 1))}
                  className="absolute left-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setLbIdx((i) => (i === sorted.length - 1 ? 0 : i + 1))}
                  className="absolute right-2 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails strip */}
          <div className="flex h-16 shrink-0 items-center gap-1.5 overflow-x-auto px-4 no-scrollbar">
            {sorted.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setLbIdx(i)}
                className={`h-11 w-16 shrink-0 overflow-hidden rounded transition ${
                  i === lbIdx ? 'ring-2 ring-accent' : 'opacity-40 hover:opacity-70'
                }`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}

// ── Availability-aware action CTA ────────────────────────────────────────────
function AvailabilityCTA({ status, cleanPhone, apt }: {
  status: string;
  cleanPhone: string;
  apt: { name: string; number: string; price: number };
}) {
  const waMsg = encodeURIComponent(
    status === 'Occupied'
      ? `Hello, I'm interested in a residence like Unit ${apt.number} at Porchlight. Please notify me when something similar becomes available.`
      : status === 'Upcoming' || status === 'Coming Soon'
      ? `Hello, I'd like to get updates on Unit ${apt.number} at Porchlight when it becomes available.`
      : `Hello, I would like to schedule a viewing for ${apt.name}. Is it available?`,
  );

  if (status === 'Occupied') {
    return (
      <div className="rounded-lg border border-[#E9E5E0] p-4 text-center">
        <p className="text-[13px] font-semibold text-slate-700">This residence is currently occupied.</p>
        <p className="mt-1 text-[12px] text-slate-500">Register your interest and we'll notify you when it becomes available.</p>
        <a
          href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
          target="_blank"
          rel="noreferrer"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-sm font-semibold text-white transition hover:bg-[#20ba5a]"
        >
          <MessageCircle className="h-4 w-4" /> Register Interest
        </a>
        <Link
          to="/apartments"
          className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#E9E5E0] py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-[#F3F0EC]"
        >
          Explore Available Residences
        </Link>
      </div>
    );
  }

  if (status === 'Upcoming' || status === 'Coming Soon') {
    return (
      <div className="space-y-2">
        <a
          href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
          target="_blank"
          rel="noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-sm font-semibold text-white transition hover:bg-[#20ba5a]"
        >
          <MessageCircle className="h-4 w-4" /> Get Availability Updates
        </a>
        <a
          href={`tel:${COMPANY.phone}`}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E9E5E0] py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-[#F3F0EC]"
        >
          <Phone className="h-4 w-4" /> Call Office
        </a>
      </div>
    );
  }

  // Available
  return (
    <div className="space-y-2">
      <a
        href={`https://wa.me/${cleanPhone}?text=${waMsg}`}
        target="_blank"
        rel="noreferrer"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] py-2.5 text-sm font-semibold text-white transition hover:bg-[#20ba5a]"
      >
        <MessageCircle className="h-4 w-4" /> Schedule a Viewing
      </a>
      <a
        href={`tel:${COMPANY.phone}`}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-[#E9E5E0] py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-[#F3F0EC]"
      >
        <Phone className="h-4 w-4" /> Call Office
      </a>
    </div>
  );
}

// ── Main page ────────────────────────────────────────────────────────────────
export function ApartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const state = location.state as { backTo?: string; backLabel?: string } | null;
  const backTo = state?.backTo ?? '/apartments';
  const backLabel = state?.backLabel ?? 'All Residences';

  const [copied, setCopied] = useState(false);
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const [isSaved, setIsSaved] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('porchlight_saved_residences') || '[]');
      return Array.isArray(saved) && saved.includes(id);
    } catch { return false; }
  });

  const handleToggleSave = () => {
    try {
      const saved: string[] = JSON.parse(localStorage.getItem('porchlight_saved_residences') || '[]');
      const updated = saved.includes(id!)
        ? saved.filter((x) => x !== id)
        : [...saved, id!];
      localStorage.setItem('porchlight_saved_residences', JSON.stringify(updated));
      setIsSaved(!isSaved);
    } catch { setIsSaved(!isSaved); }
  };

  const query = useQuery({
    queryKey: ['apartment', id],
    queryFn: () => fetchApartment(id!),
    enabled: Boolean(id),
  });

  const apt = query.data;

  const similarQuery = useQuery({
    queryKey: ['apartments'],
    queryFn: () => fetchApartments(),
    enabled: Boolean(apt?.type),
  });

  const similarApartments = (similarQuery.data ?? []).filter((a) => a.id !== id).slice(0, 3);

  useDocumentTitle(
    apt
      ? apt.name.toLowerCase().includes(apt.number.toLowerCase())
        ? `${apt.name} | Porchlight`
        : `Unit ${apt.number} — ${apt.name} | Porchlight`
      : 'Residence — Porchlight',
  );

  if (query.isLoading) return <LoadingState label="Loading residence…" />;
  if (query.isError || !apt) {
    return (
      <div className="mx-auto max-w-xl px-5 py-24 text-center">
        <ErrorState message="We could not find this residence." onRetry={() => void query.refetch()} />
        <Link to={backTo} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to listings
        </Link>
      </div>
    );
  }

  const cleanPhone = COMPANY.whatsapp.replace(/\D/g, '');

  return (
    <div className="bg-white pb-24 lg:pb-0">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-[#E9E5E0] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-3">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 overflow-x-auto no-scrollbar text-[12px] text-slate-500">
            <Link to="/" className="flex items-center gap-1 hover:text-navy-950 shrink-0">
              <Home className="h-3 w-3" /><span>Home</span>
            </Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
            <Link to={backTo} className="hover:text-navy-950 shrink-0 max-w-[120px] truncate">{backLabel}</Link>
            <ChevronRight className="h-3 w-3 shrink-0 text-slate-300" />
            <span className="font-semibold text-navy-950 truncate max-w-[160px]">Unit {apt.number}</span>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5">
            <button
              type="button"
              onClick={handleShare}
              aria-label="Share this residence"
              className="flex h-8 items-center gap-1.5 rounded border border-[#E9E5E0] px-2.5 text-[12px] font-medium text-slate-600 hover:bg-[#F3F0EC] transition"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-[#27866A]" /> : <Share2 className="h-3.5 w-3.5" />}
              {copied ? 'Copied' : 'Share'}
            </button>
            <button
              type="button"
              onClick={handleToggleSave}
              aria-label={isSaved ? 'Remove from saved' : 'Save this residence'}
              className={`flex h-8 w-8 items-center justify-center rounded border transition ${
                isSaved ? 'border-red-200 bg-red-50 text-red-500' : 'border-[#E9E5E0] text-slate-500 hover:bg-[#F3F0EC]'
              }`}
            >
              <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-red-500' : ''}`} />
            </button>
            <Link
              to="/tour"
              className="flex h-8 items-center gap-1.5 rounded border border-[#E9E5E0] px-2.5 text-[12px] font-medium text-slate-600 hover:bg-[#F3F0EC] transition"
            >
              <Play className="h-3.5 w-3.5 fill-current" /> Tour
            </Link>
          </div>
        </div>
      </div>

      {/* ── Gallery ── */}
      <Gallery images={apt.images} name={apt.name} />

      {/* ── Page body ── */}
      <div className="mx-auto max-w-6xl px-5 pt-8 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">

          {/* ── LEFT column ── */}
          <div className="space-y-8 lg:col-span-7">

            {/* Identity */}
            <div>
              <StatusBadge status={apt.availabilityStatus} availableFrom={apt.availableFrom} />
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
                {apt.name}
              </h1>
              <p className="mt-1 text-[13px] text-slate-500">
                {apt.name.toLowerCase().includes(apt.number.toLowerCase())
                  ? apt.type
                  : `Unit ${apt.number} · ${apt.type}`}
                {apt.floor != null ? ` · Floor ${apt.floor}` : ''}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-[13px] text-slate-500">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                {apt.location}{apt.floor != null ? ` · Floor ${apt.floor}` : ''}
              </p>

              {/* Price */}
              <div className="mt-5 flex items-baseline gap-2">
                <span className="font-display text-3xl font-semibold text-navy-950">
                  {formatPrice(apt.price)}
                </span>
                <span className="text-sm text-slate-500">ETB / month</span>
              </div>
              <p className="mt-1 text-[12px] text-[#27866A] font-medium">
                Zero broker commission · Direct landlord lease
              </p>
            </div>

            {/* Specs */}
            <div className="grid grid-cols-3 gap-px border border-[#E9E5E0] bg-[#E9E5E0]">
              <div className="flex flex-col items-center gap-1 bg-white py-5 px-3 text-center">
                <BedDouble className="h-4 w-4 text-slate-400" aria-hidden />
                <span className="text-lg font-semibold text-navy-950">{apt.bedrooms}</span>
                <span className="text-[11px] text-slate-500">Bedrooms</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-white py-5 px-3 text-center">
                <Bath className="h-4 w-4 text-slate-400" aria-hidden />
                <span className="text-lg font-semibold text-navy-950">{apt.bathrooms}</span>
                <span className="text-[11px] text-slate-500">Bathrooms</span>
              </div>
              <div className="flex flex-col items-center gap-1 bg-white py-5 px-3 text-center">
                <Maximize2 className="h-4 w-4 text-slate-400" aria-hidden />
                <span className="text-lg font-semibold text-navy-950">{apt.size ?? '—'}</span>
                <span className="text-[11px] text-slate-500">m²</span>
              </div>
            </div>

            {/* Description */}
            {apt.description && (
              <div>
                <h2 className="font-display text-xl font-semibold text-navy-950 mb-3">About this residence</h2>
                <p className="text-[14px] leading-relaxed text-slate-600">{apt.description}</p>
              </div>
            )}

            {/* Amenities */}
            {apt.amenities.length > 0 && (
              <div>
                <h2 className="font-display text-xl font-semibold text-navy-950 mb-1">Features & Amenities</h2>
                <p className="mb-4 text-[12px] text-slate-500">{apt.amenities.length} included</p>
                <div className="grid grid-cols-2 gap-px border border-[#E9E5E0] bg-[#E9E5E0] sm:grid-cols-3">
                  {apt.amenities.map((a) => {
                    const Icon = getAmenityIcon(a.icon ?? a.slug);
                    return (
                      <div key={a.id} className="flex items-center gap-3 bg-white p-4">
                        <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden />
                        <span className="text-[13px] font-medium text-navy-950">{a.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Specifications table */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy-950 mb-3">Specifications</h2>
              <dl className="divide-y divide-[#E9E5E0] text-[13px]">
                {[
                  ['Unit Number', `Unit ${apt.number}`],
                  ['Type', apt.type],
                  ['Floor', apt.floor != null ? `Floor ${apt.floor}` : '—'],
                  ['Furnishing', 'Fully furnished, move-in ready'],
                  ['Management', 'Direct Porchlight on-site management'],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2.5">
                    <dt className="text-slate-500">{label}</dt>
                    <dd className="font-semibold text-navy-950 text-right max-w-[55%]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            {/* Map */}
            <div>
              <h2 className="font-display text-xl font-semibold text-navy-950 mb-3">Location</h2>
              <div className="overflow-hidden rounded-lg border border-[#E9E5E0]">
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
            </div>
          </div>

          {/* ── RIGHT column — sticky inquiry panel ── */}
          <aside
            id="inquiry-section"
            className="scroll-mt-20 lg:col-span-5"
          >
            <div className="lg:sticky lg:top-20 space-y-5">
              {/* Price card */}
              <div className="rounded-xl border border-[#E9E5E0] bg-white p-5">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Monthly Rent</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-3xl font-semibold text-navy-950">{formatPrice(apt.price)}</span>
                  <span className="text-sm text-slate-500">ETB / month</span>
                </div>
                <StatusBadge status={apt.availabilityStatus} availableFrom={apt.availableFrom} />

                <div className="mt-4">
                  <AvailabilityCTA status={apt.availabilityStatus} cleanPhone={cleanPhone} apt={{ name: apt.name, number: apt.number, price: apt.price }} />
                </div>

                {apt.availabilityStatus === 'Available' && (
                  <>
                    <div className="relative my-5 text-center">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-[#E9E5E0]" />
                      </div>
                      <span className="relative bg-white px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                        Or enquire online
                      </span>
                    </div>
                    <InquiryForm defaultApartmentId={apt.id} />
                  </>
                )}
              </div>

              {/* Guarantees */}
              <div className="rounded-xl border border-[#E9E5E0] bg-[#F8F6F2] p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400 mb-3">Our Commitment</p>
                <ul className="space-y-2.5">
                  {[
                    'Genuine property photography — no staging or replacements',
                    'On-site maintenance team for all repairs',
                    'Flexible corporate leases with VAT documentation',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2 text-[12px] text-slate-600">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#27866A]" aria-hidden />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </aside>
        </div>

        {/* ── Similar residences ── */}
        {similarApartments.length > 0 && (
          <section className="mt-16 border-t border-[#E9E5E0] pt-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <h2 className="font-display text-2xl font-semibold tracking-tight text-navy-950">
                Other residences
              </h2>
              <Link to={backTo} className="text-sm font-semibold text-accent hover:underline">
                Browse all
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
              {similarApartments.map((a) => (
                <ApartmentCard key={a.id} apartment={a} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-[#E9E5E0] bg-white px-5 py-3 lg:hidden">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Monthly rent</p>
            <p className="font-display text-lg font-semibold text-navy-950">
              {formatPrice(apt.price)} <span className="text-[12px] font-normal text-slate-500">ETB/mo</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {/* WhatsApp — always present, label changes by status */}
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                apt.availabilityStatus === 'Occupied'
                  ? `Hello, I'd like to register interest for Unit ${apt.number} at Porchlight.`
                  : `Hello, I'd like to enquire about Unit ${apt.number} — is it available?`
              )}`}
              target="_blank"
              rel="noreferrer"
              aria-label="Contact via WhatsApp"
              className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#25D366] text-white"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            {apt.availabilityStatus === 'Available' ? (
              <button
                type="button"
                onClick={() => document.getElementById('inquiry-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-hover active:scale-[0.98]"
              >
                Enquire Now
              </button>
            ) : apt.availabilityStatus === 'Occupied' ? (
              <button
                type="button"
                onClick={() => document.getElementById('inquiry-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-lg border border-[#E9E5E0] px-4 py-2.5 text-[13px] font-semibold text-navy-950 transition hover:bg-[#F3F0EC]"
              >
                Register Interest
              </button>
            ) : (
              <button
                type="button"
                onClick={() => document.getElementById('inquiry-section')?.scrollIntoView({ behavior: 'smooth' })}
                className="rounded-lg border border-[#E9E5E0] px-4 py-2.5 text-[13px] font-semibold text-navy-950 transition hover:bg-[#F3F0EC]"
              >
                Get Updates
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

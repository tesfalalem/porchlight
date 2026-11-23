import { COMPANY } from '@porchlight/shared';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Heart,
  Home,
  Layers,
  MapPin,
  Maximize2,
  MessageCircle,
  Play,
  Share2,
  ShieldCheck,
  Sparkles,
  Tag,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getAmenityIcon } from '../../utils/amenityIcons';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatPrice } from '../../utils/format';
import { fetchApartment } from '../../services/apartmentsApi';

// ── Contained gallery with smooth animated image change ──────────────────────
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
    <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-6 sm:pt-6">
      <div className="flex aspect-[16/10] max-h-[360px] w-full items-center justify-center rounded-2xl border border-[#E9E5E0] bg-[#F3F0EC]">
        <span className="text-sm text-slate-400">No photographs available</span>
      </div>
    </div>
  );

  const current = sorted[idx];

  return (
    <>
      {/* Contained, reduced-size gallery */}
      <div className="mx-auto max-w-4xl px-4 pt-4 sm:px-6 sm:pt-6">
        {/* Main viewer with compact dimensions and rounded frame */}
        <div
          className="relative aspect-[16/10] sm:aspect-[16/9] max-h-[380px] sm:max-h-[440px] w-full overflow-hidden rounded-2xl border border-[#E9E5E0] bg-[#1A1214] shadow-xs"
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (dx < -40) next();
            else if (dx > 40) prev();
            touchX.current = null;
          }}
        >
          <img
            key={idx}
            src={current.url}
            alt={current.alt ?? name ?? 'Residence photograph'}
            className="h-full w-full object-cover animate-gallery-fade"
          />

          {/* Counter */}
          <div className="absolute bottom-3 left-3 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs">
            {idx + 1} / {sorted.length}
          </div>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={() => { setLbIdx(idx); setLightbox(true); }}
            className="absolute bottom-3 right-3 rounded-md bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white backdrop-blur-xs transition hover:bg-black/80"
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
                className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-xs transition hover:bg-black/75 hover:scale-105 active:scale-95"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={next}
                className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-xs transition hover:bg-black/75 hover:scale-105 active:scale-95"
                aria-label="Next photo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {sorted.length > 1 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {sorted.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                className={`h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-200 ${
                  i === idx
                    ? 'ring-2 ring-accent ring-offset-2 ring-offset-[#F8F6F2] opacity-100 scale-[1.02]'
                    : 'opacity-50 hover:opacity-85'
                }`}
                aria-label={`Photo ${i + 1}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" loading="lazy" />
              </button>
            ))}
          </div>
        )}
      </div>

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
          <div className="relative flex flex-1 items-center justify-center p-4">
            <img
              key={lbIdx}
              src={sorted[lbIdx].url}
              alt=""
              className="max-h-[85vh] max-w-full rounded-lg object-contain animate-gallery-fade"
            />
            {sorted.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setLbIdx((i) => (i === 0 ? sorted.length - 1 : i - 1))}
                  className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() => setLbIdx((i) => (i === sorted.length - 1 ? 0 : i + 1))}
                  className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>
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
    <div className="bg-[#FAF8F5] pb-24 lg:pb-16 min-h-screen">
      {/* ── Breadcrumb ── */}
      <div className="border-b border-[#E9E5E0] bg-white">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
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
            <Link
              to="/tour"
              className="flex h-8 items-center gap-1.5 rounded border border-[#E9E5E0] bg-white px-2.5 text-[12px] font-medium text-slate-600 hover:bg-[#F3F0EC] transition"
            >
              <Play className="h-3.5 w-3.5 fill-current text-accent" /> Tour
            </Link>
          </div>
        </div>
      </div>

      {/* ── Gallery with reduced size & animational change ── */}
      <Gallery images={apt.images} name={apt.name} />

      {/* ── Page body ── */}
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="space-y-8 sm:space-y-10">

          {/* ── 1. HEADER & IDENTITY ── */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusBadge status={apt.availabilityStatus} availableFrom={apt.availableFrom} />
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleShare}
                  aria-label="Share this residence"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-[#E9E5E0] bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-[#F3F0EC] hover:text-navy-950 active:scale-95"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-[#27866A]" /> : <Share2 className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Link Copied!' : 'Share'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleToggleSave}
                  aria-label={isSaved ? 'Remove from saved' : 'Save this residence'}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    isSaved
                      ? 'border-red-200 bg-red-50 text-red-600'
                      : 'border-[#E9E5E0] bg-white text-slate-600 hover:bg-[#F3F0EC]'
                  }`}
                >
                  <Heart className={`h-3.5 w-3.5 ${isSaved ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{isSaved ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>

            {/* Title & Metadata Pills */}
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight text-navy-950 sm:text-4xl lg:text-[42px] leading-tight">
                {apt.name}
              </h1>
              <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs sm:text-[13px] text-slate-500">
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-[#E9E5E0] px-2.5 py-1 font-medium text-slate-700 shadow-2xs">
                  <Home className="h-3.5 w-3.5 text-slate-400" />
                  {apt.type}
                </span>
                {apt.floor != null && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-[#E9E5E0] px-2.5 py-1 font-medium text-slate-700 shadow-2xs">
                    <Layers className="h-3.5 w-3.5 text-slate-400" />
                    Floor {apt.floor}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-md bg-white border border-[#E9E5E0] px-2.5 py-1 font-medium text-slate-700 shadow-2xs">
                  <MapPin className="h-3.5 w-3.5 text-accent" />
                  {apt.location}
                </span>
              </div>
            </div>

            {/* Price Card */}
            <div className="rounded-2xl border border-[#E9E5E0] bg-gradient-to-br from-white via-white to-[#FDFBF8] p-5 sm:p-6 shadow-xs">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-400">Monthly Rent</p>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-950">
                    {formatPrice(apt.price)}
                  </span>
                  <span className="text-sm font-medium text-slate-500">ETB / month</span>
                </div>
                <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#27866A]">
                  <ShieldCheck className="h-4 w-4" />
                  Zero broker commission · Direct landlord lease
                </p>
              </div>
            </div>
          </div>

          {/* ── 2. KEY STATS TILES (INTERACTIVE CARDS) ── */}
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
              <div className="group rounded-2xl border border-[#E9E5E0] bg-white p-4 sm:p-5 text-center shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                  <BedDouble className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-navy-950">{apt.bedrooms}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Bedrooms</p>
              </div>

              <div className="group rounded-2xl border border-[#E9E5E0] bg-white p-4 sm:p-5 text-center shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                  <Bath className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-navy-950">{apt.bathrooms}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Bathrooms</p>
              </div>

              <div className="group rounded-2xl border border-[#E9E5E0] bg-white p-4 sm:p-5 text-center shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                  <Maximize2 className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-navy-950">
                  {apt.size ?? '—'} <span className="text-sm font-normal text-slate-400">m²</span>
                </p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Living Space</p>
              </div>

              <div className="group rounded-2xl border border-[#E9E5E0] bg-white p-4 sm:p-5 text-center shadow-2xs transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-md">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                  <Layers className="h-5 w-5" aria-hidden />
                </div>
                <p className="mt-3 font-display text-2xl sm:text-3xl font-bold text-navy-950">
                  {apt.floor != null ? `Floor ${apt.floor}` : '—'}
                </p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">Building Level</p>
              </div>
            </div>
          </div>

          {/* ── 3. ABOUT THIS RESIDENCE ── */}
          {apt.description && (
            <div className="rounded-2xl border border-[#E9E5E0] bg-gradient-to-br from-white via-[#FCFAF7] to-white p-6 sm:p-8 shadow-xs">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">Overview</p>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-navy-950">
                About this residence
              </h2>
              <p className="mt-3 text-[14px] sm:text-[15px] leading-relaxed text-slate-600">
                {apt.description}
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-2 pt-4 border-t border-[#E9E5E0]/70 text-xs text-slate-500 font-medium">
                <span className="inline-flex items-center gap-1 rounded-md bg-white border border-[#E9E5E0] px-2.5 py-1 shadow-2xs">
                  <Sparkles className="h-3 w-3 text-accent" /> Move-in Ready
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white border border-[#E9E5E0] px-2.5 py-1 shadow-2xs">
                  <Check className="h-3 w-3 text-[#27866A]" /> 24/7 Power Backup
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white border border-[#E9E5E0] px-2.5 py-1 shadow-2xs">
                  <Check className="h-3 w-3 text-[#27866A]" /> Reserve Water Supply
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-white border border-[#E9E5E0] px-2.5 py-1 shadow-2xs">
                  <Check className="h-3 w-3 text-[#27866A]" /> Guarded Access
                </span>
              </div>
            </div>
          )}

          {/* ── 4. FEATURES & AMENITIES ── */}
          {apt.amenities.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-xl sm:text-2xl font-bold text-navy-950">Features & Amenities</h2>
                  <p className="mt-0.5 text-xs text-slate-500">Every amenity provided for your comfort and convenience</p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  {apt.amenities.length} Included
                </span>
              </div>

              {/* 4-column balanced responsive interactive cards (no blank cells) */}
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                {apt.amenities.map((a) => {
                  const Icon = getAmenityIcon(a.icon ?? a.slug);
                  return (
                    <div
                      key={a.id}
                      className="group flex items-center gap-3 rounded-xl border border-[#E9E5E0] bg-white p-3.5 transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-[#FDFBF7] hover:shadow-xs"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/8 text-accent transition-colors duration-200 group-hover:bg-accent group-hover:text-white">
                        <Icon className="h-4 w-4" aria-hidden />
                      </div>
                      <span className="text-[13px] font-semibold text-navy-950 transition-colors group-hover:text-accent truncate">
                        {a.name}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── 5. SPECIFICATIONS CARD ── */}
          <div>
            <div className="mb-4">
              <h2 className="font-display text-xl sm:text-2xl font-bold text-navy-950">Specifications</h2>
              <p className="mt-0.5 text-xs text-slate-500">Property details, leasing terms, and architectural specs</p>
            </div>

            <div className="rounded-2xl border border-[#E9E5E0] bg-white p-4 sm:p-6 shadow-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {[
                  { label: 'Unit Number', value: `Unit ${apt.number}`, Icon: Tag },
                  { label: 'Residence Type', value: apt.type, Icon: Building2 },
                  { label: 'Floor Level', value: apt.floor != null ? `Floor ${apt.floor}` : '—', Icon: Layers },
                  { label: 'Furnishing', value: 'Fully furnished, move-in ready', Icon: Sparkles },
                  { label: 'Management', value: 'Direct Porchlight on-site management', Icon: ShieldCheck },
                  { label: 'Lease Documentation', value: 'Corporate & private leases with VAT', Icon: CheckCircle2 },
                ].map(({ label, value, Icon }) => (
                  <div
                    key={label}
                    className="flex items-center gap-3.5 rounded-xl border border-[#F3F0EC] bg-[#FAF8F5]/60 p-4 transition-all duration-200 hover:bg-white hover:border-accent/30 hover:shadow-2xs"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#E9E5E0]/60 text-navy-950">
                      <Icon className="h-4 w-4 text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-slate-400">{label}</p>
                      <p className="text-[13px] sm:text-[14px] font-semibold text-navy-950 truncate">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Mobile sticky bottom bar ── */}
      <div className="fixed bottom-0 inset-x-0 z-40 border-t border-[#E9E5E0] bg-white px-5 py-3 lg:hidden shadow-lg">
        <div className="mx-auto flex max-w-lg items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium text-slate-400">Monthly rent</p>
            <p className="font-display text-lg font-semibold text-navy-950">
              {formatPrice(apt.price)} <span className="text-[12px] font-normal text-slate-500">ETB/mo</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
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
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                apt.availabilityStatus === 'Occupied'
                  ? `Hello, I'd like to register interest for Unit ${apt.number} at Porchlight.`
                  : `Hello, I'd like to enquire about Unit ${apt.number} — is it available?`
              )}`}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg bg-accent px-4 py-2.5 text-[13px] font-semibold text-white transition hover:bg-accent-hover active:scale-[0.98]"
            >
              {apt.availabilityStatus === 'Occupied' ? 'Register Interest' : 'Enquire Now'}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

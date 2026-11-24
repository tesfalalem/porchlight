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
  Image as ImageIcon,
  Layers,
  MapPin,
  Maximize2,
  Play,
  Share2,
  ShieldCheck,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { getAmenityIcon } from '../../utils/amenityIcons';
import { ErrorState } from '../../components/common/ErrorState';
import { ApartmentDetailSkeleton } from '../../components/apartments/ApartmentDetailSkeleton';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatPrice } from '../../utils/format';
import { fetchApartment } from '../../services/apartmentsApi';
import { InquiryForm } from '../../components/forms/InquiryForm';

// ── Contained gallery with smooth animated image change ──────────────────────
function Gallery({ images, name }: { images: { url: string; alt?: string | null; isPrimary?: boolean; sortOrder?: number }[]; name?: string }) {
  const sorted = useMemo(
    () => [...images].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [images],
  );
  const [idx, setIdx] = useState(0);
  const [direction, setDirection] = useState<'initial' | 'next' | 'prev'>('initial');
  const [animKey, setAnimKey] = useState(0);
  const [isMainLoaded, setIsMainLoaded] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Lightbox state with smooth closing transition
  const [lightbox, setLightbox] = useState(false);
  const [lightboxClosing, setLightboxClosing] = useState(false);
  const [lbIdx, setLbIdx] = useState(0);
  const [lbDirection, setLbDirection] = useState<'initial' | 'next' | 'prev'>('initial');
  const [lbAnimKey, setLbAnimKey] = useState(0);
  const touchX = useRef<number | null>(null);
  const lbTouchX = useRef<number | null>(null);

  // IntersectionObserver for gentle scroll-in fade & rise
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const openLightboxAt = (i: number) => {
    setLbIdx(i);
    setLbDirection('initial');
    setLbAnimKey((k) => k + 1);
    setLightboxClosing(false);
    setLightbox(true);
  };

  const closeLightbox = () => {
    setLightboxClosing(true);
    setTimeout(() => {
      setLightbox(false);
      setLightboxClosing(false);
    }, 280);
  };

  const prev = () => {
    setDirection('prev');
    setAnimKey((k) => k + 1);
    setIsMainLoaded(false);
    setIdx((i) => (i === 0 ? sorted.length - 1 : i - 1));
  };

  const next = () => {
    setDirection('next');
    setAnimKey((k) => k + 1);
    setIsMainLoaded(false);
    setIdx((i) => (i === sorted.length - 1 ? 0 : i + 1));
  };

  const goTo = (targetIdx: number) => {
    if (targetIdx === idx) return;
    setDirection(targetIdx > idx ? 'next' : 'prev');
    setAnimKey((k) => k + 1);
    setIsMainLoaded(false);
    setIdx(targetIdx);
  };

  const lbPrev = () => {
    setLbDirection('prev');
    setLbAnimKey((k) => k + 1);
    setLbIdx((i) => (i === 0 ? sorted.length - 1 : i - 1));
  };

  const lbNext = () => {
    setLbDirection('next');
    setLbAnimKey((k) => k + 1);
    setLbIdx((i) => (i === sorted.length - 1 ? 0 : i + 1));
  };

  // Keyboard nav for lightbox
  useEffect(() => {
    if (!lightbox) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') lbNext();
      if (e.key === 'ArrowLeft') lbPrev();
      if (e.key === 'Escape') closeLightbox();
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
  const animationClass =
    direction === 'initial'
      ? 'animate-gallery-initial'
      : direction === 'next'
        ? 'animate-gallery-next'
        : 'animate-gallery-prev';

  const lbAnimationClass =
    lbDirection === 'initial'
      ? 'animate-gallery-fade'
      : lbDirection === 'next'
        ? 'animate-gallery-next'
        : 'animate-gallery-prev';

  return (
    <>
      {/* Contained, reduced-size gallery with scroll-in animation */}
      <div
        ref={containerRef}
        className={`mx-auto max-w-4xl px-4 pt-4 sm:px-6 sm:pt-6 transition-all duration-700 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
          }`}
      >
        {/* Main viewer with compact dimensions and rounded frame */}
        <div
          className="group relative aspect-[16/10] sm:aspect-[16/9] max-h-[380px] sm:max-h-[440px] w-full cursor-pointer overflow-hidden rounded-2xl border border-[#E9E5E0] bg-[#1A1214] shadow-xs select-none"
          onClick={() => openLightboxAt(idx)}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (dx < -40) next();
            else if (dx > 40) prev();
            touchX.current = null;
          }}
        >
          {/* Skeleton placeholder while main image loads */}
          {!isMainLoaded && (
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-[#EFECE8] shimmer-bg">
              <div className="flex flex-col items-center gap-2 text-slate-400">
                <ImageIcon className="h-8 w-8 stroke-[1.5] animate-pulse" />
              </div>
            </div>
          )}

          <img
            key={`${idx}-${animKey}`}
            src={current.url}
            alt={current.alt ?? name ?? 'Residence photograph'}
            onLoad={() => setIsMainLoaded(true)}
            className={`relative z-1 h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform ${animationClass}`}
          />

          {/* Elegant hover overlay cue to expand */}
          <div className="absolute inset-0 z-2 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 pointer-events-none flex items-end justify-center pb-4 sm:pb-5">
            <span className="flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-medium text-white shadow-sm backdrop-blur-md">
              <Maximize2 className="h-3.5 w-3.5" /> Click to expand
            </span>
          </div>

          {/* Counter badge */}
          <div className="absolute bottom-3 left-3 z-3 rounded-md bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white shadow-xs backdrop-blur-xs">
            {idx + 1} / {sorted.length}
          </div>

          {/* Fullscreen button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLightboxAt(idx);
            }}
            className="absolute bottom-3 right-3 z-3 flex items-center gap-1.5 rounded-md bg-black/65 px-2.5 py-1 text-[11px] font-medium text-white shadow-xs backdrop-blur-xs transition hover:bg-black/85"
            aria-label="Open fullscreen gallery"
          >
            <Maximize2 className="h-3 w-3" />
            <span>View all {sorted.length} photos</span>
          </button>

          {/* Prev/Next arrows — stop propagation so it doesn't open lightbox */}
          {sorted.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3 top-1/2 z-3 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-black/80 hover:scale-110 active:scale-95"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3 top-1/2 z-3 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-white shadow-md backdrop-blur-xs transition-all duration-200 hover:bg-black/80 hover:scale-110 active:scale-95"
                aria-label="Next photo"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails with elegant hover zoom & lift */}
        {sorted.length > 1 && (
          <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {sorted.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => goTo(i)}
                className={`group relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-xl transition-all duration-300 hover:-translate-y-0.5 ${i === idx
                  ? 'ring-2 ring-accent ring-offset-2 ring-offset-[#FAF8F5] opacity-100 shadow-sm scale-[1.02]'
                  : 'opacity-55 hover:opacity-100'
                  }`}
                aria-label={`Photo ${i + 1}`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 will-change-transform"
                  loading="lazy"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox with smooth entry and exit transitions */}
      {lightbox && (
        <div
          className={`fixed inset-0 z-[60] flex flex-col bg-black/95 backdrop-blur-md transition-opacity duration-300 ease-out animate-lightbox-backdrop ${lightboxClosing ? 'opacity-0' : 'opacity-100'
            }`}
          role="dialog"
          aria-modal="true"
          aria-label="Fullscreen gallery"
          onClick={closeLightbox}
        >
          {/* Top bar */}
          <div
            className="flex h-14 shrink-0 items-center justify-between px-4 sm:px-6 z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-[13px] font-medium tracking-wide text-white/70">
              {lbIdx + 1} of {sorted.length}
            </span>
            <button
              type="button"
              onClick={closeLightbox}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white/80 transition-all hover:bg-white/20 hover:text-white hover:scale-105 active:scale-95"
              aria-label="Close gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Main viewer inside lightbox */}
          <div
            className="relative flex flex-1 items-center justify-center p-4 sm:p-6"
            onClick={(e) => e.stopPropagation()}
            onTouchStart={(e) => { lbTouchX.current = e.touches[0].clientX; }}
            onTouchEnd={(e) => {
              if (lbTouchX.current === null) return;
              const dx = e.changedTouches[0].clientX - lbTouchX.current;
              if (dx < -40) lbNext();
              else if (dx > 40) lbPrev();
              lbTouchX.current = null;
            }}
          >
            <div
              className={`relative flex items-center justify-center transition-all duration-300 animate-lightbox-content ${lightboxClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
                }`}
            >
              <img
                key={`lb-${lbIdx}-${lbAnimKey}`}
                src={sorted[lbIdx].url}
                alt=""
                className={`max-h-[80vh] max-w-full rounded-xl object-contain shadow-2xl ${lbAnimationClass}`}
              />
            </div>

            {sorted.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={lbPrev}
                  className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/90 backdrop-blur-xs transition-all duration-200 hover:bg-white/25 hover:text-white hover:scale-110 active:scale-95 shadow-lg"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={lbNext}
                  className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white/90 backdrop-blur-xs transition-all duration-200 hover:bg-white/25 hover:text-white hover:scale-110 active:scale-95 shadow-lg"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Bottom thumbnail strip inside lightbox */}
          <div
            className="flex h-20 shrink-0 items-center justify-center gap-2 overflow-x-auto px-4 pb-3 no-scrollbar z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {sorted.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setLbDirection(i > lbIdx ? 'next' : 'prev');
                  setLbAnimKey((k) => k + 1);
                  setLbIdx(i);
                }}
                className={`group relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 overflow-hidden rounded-lg transition-all duration-300 ${i === lbIdx
                  ? 'ring-2 ring-accent scale-105 opacity-100'
                  : 'opacity-40 hover:opacity-80 hover:scale-100'
                  }`}
              >
                <img
                  src={img.url}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                  loading="lazy"
                />
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

  if (query.isLoading) return <ApartmentDetailSkeleton backTo={backTo} backLabel={backLabel} />;
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

  return (
    <div className="bg-[#FAF8F5] pb-16 min-h-screen">
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
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${isSaved
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

          {/* ── 5. CONTACT / INQUIRY FORM ── */}
          <div id="inquire-form" className="rounded-2xl border border-[#E9E5E0] bg-white p-6 sm:p-8 shadow-xs scroll-mt-24">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-accent" />
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-accent">Direct Contact</p>
              </div>
              <h2 className="font-display text-xl sm:text-2xl font-bold text-navy-950">
                Inquire About Unit {apt.number}
              </h2>
              <p className="mt-1 text-xs sm:text-[13px] text-slate-500">
                Interested in this residence? Submit your details below and our property management team will respond directly.
              </p>
            </div>

            <InquiryForm
              defaultApartmentId={apt.id}
              apartmentName={apt.name}
              apartmentNumber={apt.number}
            />
          </div>

        </div>
      </div>
    </div>
  );
}

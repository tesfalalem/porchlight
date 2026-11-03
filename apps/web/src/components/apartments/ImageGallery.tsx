import type { ApartmentImageDto } from '@porchlight/shared';
import clsx from 'clsx';
import {
  ChevronLeft,
  ChevronRight,
  Grid,
  Image as ImageIcon,
  Maximize2,
  Pause,
  Play,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';

interface ImageGalleryProps {
  images: ApartmentImageDto[];
  apartmentName?: string;
}

export function ImageGallery({ images, apartmentName }: ImageGalleryProps) {
  const sorted = useMemo(
    () => [...images].sort((a, b) => a.sortOrder - b.sortOrder),
    [images],
  );

  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false); // Default manual to avoid jarring auto-flips
  const [viewMode, setViewMode] = useState<'grid' | 'carousel'>('grid');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-scroll slideshow when active
  useEffect(() => {
    if (sorted.length <= 1 || !isPlaying || viewMode !== 'carousel' || lightboxOpen) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setIndex((i) => (i === sorted.length - 1 ? 0 : i + 1));
    }, 5000); // Friendly 5s pace

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [sorted.length, isPlaying, viewMode, lightboxOpen]);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!lightboxOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowRight') {
        setLightboxIndex((i) => (i === sorted.length - 1 ? 0 : i + 1));
      }
      if (e.key === 'ArrowLeft') {
        setLightboxIndex((i) => (i === 0 ? sorted.length - 1 : i - 1));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, sorted.length]);

  if (!sorted.length) {
    return (
      <div className="flex aspect-[16/10] w-full flex-col items-center justify-center rounded-3xl border border-slate-200 bg-slate-100 text-slate-400">
        <ImageIcon className="h-12 w-12 stroke-[1.5]" />
        <p className="mt-3 text-sm font-semibold">No residence photography uploaded</p>
      </div>
    );
  }

  const openLightboxAt = (i: number) => {
    setLightboxIndex(i);
    setLightboxOpen(true);
  };

  const prev = () => {
    setIndex((i) => (i === 0 ? sorted.length - 1 : i - 1));
  };
  const next = () => {
    setIndex((i) => (i === sorted.length - 1 ? 0 : i + 1));
  };

  const current = sorted[index] ?? sorted[0];

  return (
    <div className="space-y-4">
      {/* ── TOP GALLERY CONTROLS (GRID vs SLIDESHOW) ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          <span className="flex items-center gap-1.5 rounded-lg bg-navy-950/5 px-2.5 py-1 text-navy-900">
            <ImageIcon className="h-3.5 w-3.5 text-accent" />
            {sorted.length} {sorted.length === 1 ? 'Photograph' : 'High-Res Photographs'}
          </span>
          <span className="hidden sm:inline text-slate-400">· Click any photo to expand fullscreen</span>
        </div>

        {sorted.length >= 3 && (
          <div className="hidden sm:flex items-center rounded-xl border border-slate-200 bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition',
                viewMode === 'grid'
                  ? 'bg-navy-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50',
              )}
            >
              <Grid className="h-3.5 w-3.5" />
              Bento Grid
            </button>
            <button
              type="button"
              onClick={() => setViewMode('carousel')}
              className={clsx(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition',
                viewMode === 'carousel'
                  ? 'bg-navy-950 text-white shadow-xs'
                  : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50',
              )}
            >
              <Maximize2 className="h-3.5 w-3.5" />
              Slideshow
            </button>
          </div>
        )}
      </div>

      {/* ── BENTO MOSAIC GRID VIEW (DESKTOP) ── */}
      {viewMode === 'grid' && sorted.length >= 3 ? (
        <div className="relative hidden sm:grid grid-cols-4 grid-rows-2 gap-3 h-[420px] lg:h-[480px] xl:h-[520px] rounded-3xl overflow-hidden shadow-lg shadow-navy-950/5 border border-slate-200/90 bg-slate-900">
          {/* Main Hero Photo (Left 2 cols, span 2 rows) */}
          <div
            onClick={() => openLightboxAt(0)}
            className="group relative col-span-2 row-span-2 cursor-pointer overflow-hidden bg-slate-800"
          >
            <img
              src={sorted[0].url}
              alt={sorted[0].alt ?? apartmentName ?? 'Main residence photo'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/15" />
            <div className="absolute left-4 top-4 rounded-full bg-navy-950/70 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
              Primary Feature
            </div>
          </div>

          {/* Secondary Photo 1 */}
          <div
            onClick={() => openLightboxAt(1)}
            className="group relative col-span-1 row-span-1 cursor-pointer overflow-hidden bg-slate-800"
          >
            <img
              src={sorted[1].url}
              alt={sorted[1].alt ?? 'Residence view'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/15" />
          </div>

          {/* Secondary Photo 2 */}
          <div
            onClick={() => openLightboxAt(2)}
            className="group relative col-span-1 row-span-1 cursor-pointer overflow-hidden bg-slate-800"
          >
            <img
              src={sorted[2].url}
              alt={sorted[2].alt ?? 'Residence view'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/15" />
          </div>

          {/* Secondary Photo 3 */}
          <div
            onClick={() => openLightboxAt(sorted[3] ? 3 : 0)}
            className="group relative col-span-1 row-span-1 cursor-pointer overflow-hidden bg-slate-800"
          >
            <img
              src={sorted[3]?.url ?? sorted[0].url}
              alt={sorted[3]?.alt ?? 'Residence view'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/15" />
          </div>

          {/* Secondary Photo 4 + "Show all photos" overlay */}
          <div
            onClick={() => openLightboxAt(sorted[4] ? 4 : 0)}
            className="group relative col-span-1 row-span-1 cursor-pointer overflow-hidden bg-slate-800"
          >
            <img
              src={sorted[4]?.url ?? sorted[1]?.url ?? sorted[0].url}
              alt={sorted[4]?.alt ?? 'Residence view'}
              className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-navy-950/0 transition-colors duration-300 group-hover:bg-navy-950/15" />
          </div>

          {/* "Show all photos" floating pill button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLightboxAt(0);
            }}
            className="absolute bottom-4 right-4 flex items-center gap-2 rounded-2xl border border-white/30 bg-white/90 px-4 py-2.5 text-xs font-bold text-navy-950 shadow-xl backdrop-blur-md transition-all hover:scale-105 hover:bg-white active:scale-95"
          >
            <Grid className="h-4 w-4 text-accent" />
            Show all {sorted.length} photos
          </button>
        </div>
      ) : null}

      {/* ── CAROUSEL / SLIDESHOW VIEW (OR MOBILE SCREEN FALLBACK) ── */}
      <div className={clsx(viewMode === 'grid' && sorted.length >= 3 ? 'sm:hidden' : 'block')}>
        <div
          className="group relative aspect-[4/3] sm:aspect-[16/10] max-h-[560px] overflow-hidden rounded-3xl bg-slate-950 shadow-xl shadow-navy-950/10 cursor-pointer"
          onClick={() => openLightboxAt(index)}
        >
          {/* Subtle blurred backdrop for vertical/tall images so they fit naturally without black voids */}
          <div
            className="absolute inset-0 scale-125 bg-cover bg-center opacity-30 blur-2xl"
            style={{ backgroundImage: `url(${current.url})` }}
          />

          <img
            key={current.url}
            src={current.url}
            alt={current.alt ?? 'Apartment photography'}
            className="relative z-10 h-full w-full object-contain sm:object-cover transition-transform duration-700 ease-out group-hover:scale-102"
          />

          {/* Subtle Top & Bottom vignette */}
          <div className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-t from-navy-950/40 via-transparent to-navy-950/20" />

          {/* Top Controls: Counter + Fullscreen + Play/Pause */}
          <div className="absolute left-4 right-4 top-4 z-30 flex items-center justify-between">
            <div className="rounded-full border border-white/20 bg-navy-950/75 px-3.5 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
              {index + 1} / {sorted.length}
            </div>

            <div className="flex items-center gap-2">
              {sorted.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsPlaying(!isPlaying);
                  }}
                  className="rounded-full border border-white/20 bg-navy-950/75 p-2 text-white shadow-md backdrop-blur-md transition hover:bg-accent active:scale-95"
                  title={isPlaying ? 'Pause slideshow' : 'Play slideshow'}
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                </button>
              )}

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  openLightboxAt(index);
                }}
                className="flex items-center gap-1.5 rounded-full border border-white/20 bg-navy-950/75 px-3 py-1.5 text-xs font-bold text-white shadow-md backdrop-blur-md transition hover:bg-accent active:scale-95"
              >
                <Maximize2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Fullscreen</span>
              </button>
            </div>
          </div>

          {/* Left & Right Navigation Arrows */}
          {sorted.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  prev();
                }}
                className="absolute left-3.5 top-1/2 z-30 -translate-y-1/2 rounded-2xl border border-white/20 bg-white/90 p-3 text-navy-950 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-accent hover:text-white active:scale-95"
                aria-label="Previous photograph"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  next();
                }}
                className="absolute right-3.5 top-1/2 z-30 -translate-y-1/2 rounded-2xl border border-white/20 bg-white/90 p-3 text-navy-950 shadow-xl backdrop-blur-md transition-all hover:scale-110 hover:bg-accent hover:text-white active:scale-95"
                aria-label="Next photograph"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}

          {/* Dot Indicators */}
          {sorted.length > 1 && (
            <div className="absolute bottom-4 left-1/2 z-30 flex -translate-x-1/2 gap-1.5">
              {sorted.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIndex(i);
                  }}
                  aria-label={`Go to image ${i + 1}`}
                  className={clsx(
                    'rounded-full transition-all duration-300',
                    i === index
                      ? 'w-6 h-1.5 bg-accent shadow-sm'
                      : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/90',
                  )}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails Filmstrip below */}
        {sorted.length > 1 && (
          <div className="mt-3 flex gap-2.5 sm:gap-3 overflow-x-auto pb-2 no-scrollbar">
            {sorted.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setIndex(i)}
                className={clsx(
                  'relative h-16 w-24 sm:h-20 sm:w-32 shrink-0 overflow-hidden rounded-2xl border-2 transition-all duration-200',
                  i === index
                    ? 'border-accent shadow-md shadow-accent/25 scale-102 ring-2 ring-accent/30'
                    : 'border-transparent opacity-65 hover:opacity-100 hover:scale-102',
                )}
                aria-label={`Select photograph ${i + 1}`}
              >
                <img src={img.url} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── IMMERSIVE FULLSCREEN LIGHTBOX MODAL ── */}
      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-navy-950/98 backdrop-blur-2xl text-white">
          {/* Lightbox Header Bar */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <span className="font-display font-bold text-white text-base sm:text-lg">
                {apartmentName ?? 'Apartment Photography'}
              </span>
              <span className="rounded-full bg-white/10 px-3 py-0.5 text-xs font-semibold text-slate-300">
                Photo {lightboxIndex + 1} of {sorted.length}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              className="rounded-xl border border-white/20 bg-white/10 p-2.5 text-white transition hover:bg-white hover:text-navy-950 active:scale-95"
              aria-label="Close fullscreen gallery"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Lightbox Main Stage */}
          <div className="relative flex-1 flex items-center justify-center p-4 sm:p-8 overflow-hidden select-none">
            <img
              src={sorted[lightboxIndex].url}
              alt={sorted[lightboxIndex].alt ?? 'Apartment photography'}
              className="max-h-[75vh] max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-2xl transition-all duration-300"
            />

            {/* Left / Right Nav in Lightbox */}
            {sorted.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((i) => (i === 0 ? sorted.length - 1 : i - 1))
                  }
                  className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-navy-900/80 p-3.5 text-white shadow-xl backdrop-blur-md transition hover:scale-110 hover:bg-accent active:scale-95"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setLightboxIndex((i) => (i === sorted.length - 1 ? 0 : i + 1))
                  }
                  className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 rounded-2xl border border-white/20 bg-navy-900/80 p-3.5 text-white shadow-xl backdrop-blur-md transition hover:scale-110 hover:bg-accent active:scale-95"
                  aria-label="Next image"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}
          </div>

          {/* Lightbox Filmstrip Footer */}
          {sorted.length > 1 && (
            <div className="border-t border-white/10 px-6 py-4 bg-navy-950/60 backdrop-blur-md">
              <div className="mx-auto flex max-w-4xl justify-center gap-2.5 overflow-x-auto no-scrollbar">
                {sorted.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() => setLightboxIndex(i)}
                    className={clsx(
                      'relative h-14 w-20 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200',
                      i === lightboxIndex
                        ? 'border-accent scale-105 shadow-md shadow-accent/50 ring-2 ring-accent/40 opacity-100'
                        : 'border-transparent opacity-50 hover:opacity-90',
                    )}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

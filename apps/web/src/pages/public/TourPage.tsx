import { COMPANY } from '@porchlight/shared';
import {
  ArrowRight,
  Maximize2,
  MessageCircle,
  Phone,
  Play,
  Sparkles,
  Volume2,
  VolumeX,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';

interface TourVideoCardProps {
  id: string;
  label: string;
  type: string;
  specs: string;
  src: string;
  link: string;
  linkLabel: string;
}

const TOURS: TourVideoCardProps[] = [
  {
    id: '2bed',
    label: '2 Bedroom',
    type: '2 Bedroom Luxury Suite',
    specs: '2 Beds · 2 Baths · Floors 3–10',
    src: '/videos/2bed-tour.mp4',
    link: '/apartments/2-bedroom',
    linkLabel: 'View 2 Bedroom Apartments',
  },
  {
    id: '3bed',
    label: '3 Bedroom',
    type: '3 Bedroom Family Residence',
    specs: '3 Beds · 3 Baths · Floors 3–10',
    src: '/videos/3bed-tour.mp4',
    link: '/apartments/3-bedroom',
    linkLabel: 'View 3 Bedroom Apartments',
  },
];

function VideoCard({ tour }: { tour: TourVideoCardProps }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.requestFullscreen) {
      videoRef.current.requestFullscreen();
    }
  };

  return (
    <article className="group flex flex-col overflow-hidden rounded-3xl border border-slate-200/90 bg-white shadow-sm transition-all duration-300 hover:border-slate-300 hover:shadow-xl">
      {/* Video Viewport — Consistent 9:16 portrait ratio with balanced height */}
      <div
        onClick={togglePlay}
        className="relative aspect-[9/16] max-h-[500px] sm:max-h-[540px] w-full cursor-pointer overflow-hidden bg-navy-950"
      >
        <video
          ref={videoRef}
          src={tour.src}
          loop
          playsInline
          muted={isMuted}
          preload="metadata"
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
        />

        {/* Ambient Top & Bottom Vignettes */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-navy-950/65 via-transparent to-navy-950/35" />

        {/* Floating Top Header inside Video */}
        <div className="absolute left-4 right-4 top-4 z-20 flex items-center justify-between">
          <span className="rounded-full bg-navy-950/80 px-3 py-1 text-xs font-bold text-white shadow-md backdrop-blur-md">
            {tour.label} Tour
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={toggleMute}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-950/80 text-white shadow-md backdrop-blur-md transition hover:bg-accent active:scale-95"
              title={isMuted ? 'Unmute video audio' : 'Mute video audio'}
            >
              {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={toggleFullscreen}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-navy-950/80 text-white shadow-md backdrop-blur-md transition hover:bg-accent active:scale-95"
              title="View fullscreen"
            >
              <Maximize2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Center Play Button Overlay (when paused) */}
        {!isPlaying && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-navy-950/20 backdrop-blur-[1px] transition-all">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/40 bg-white/95 text-navy-950 shadow-2xl transition hover:scale-110 active:scale-95">
              <Play className="ml-1 h-7 w-7 fill-navy-950 text-navy-950" />
            </div>
          </div>
        )}

        {/* Bottom Play Status Indicator */}
        <div className="absolute bottom-3.5 left-4 right-4 z-20 flex items-center justify-between text-white/90">
          <span className="text-[11px] font-bold uppercase tracking-wider">
            {isPlaying ? 'Playing Walkthrough' : 'Click to Play'}
          </span>
          <span className="rounded-full bg-white/20 px-2.5 py-0.5 text-[10px] font-bold backdrop-blur-sm">
            4K Tour
          </span>
        </div>
      </div>

      {/* Info & Navigation — Clean, Modern & Focused */}
      <div className="flex flex-1 flex-col justify-between p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-bold text-navy-950 sm:text-xl">
            {tour.type}
          </h2>
          <p className="mt-1 text-xs font-semibold text-slate-500">
            {tour.specs}
          </p>
        </div>

        <div className="mt-5 sm:mt-6">
          <Link
            to={tour.link}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-xs sm:text-sm font-bold text-white shadow-sm shadow-accent/20 transition hover:bg-accent-hover active:scale-95"
          >
            <span>{tour.linkLabel}</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function TourPage() {
  useDocumentTitle('Watch the Tour — Porchlight Residences');
  const cleanPhone = COMPANY.whatsapp.replace(/\D/g, '');

  return (
    <div className="min-h-screen bg-slate-50/70 pb-20">
      {/* ── CLEAN, MODERN HERO HEADER ── */}
      <div className="border-b border-slate-200/80 bg-white px-4 pt-12 pb-8 sm:pt-16 sm:pb-10 text-center sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-bold uppercase tracking-widest text-accent">
            <Sparkles className="h-3.5 w-3.5" /> Virtual Experience
          </div>

          <h1 className="mt-3 font-display text-3xl font-black tracking-tight text-navy-950 sm:text-4xl md:text-5xl">
            Watch the Tour
          </h1>
          <div className="mx-auto mt-2.5 h-1 w-12 rounded-full bg-accent" />
          <p className="mt-3 text-sm text-slate-500 sm:text-base">
            Explore our apartments from the comfort of your home before scheduling a visit.
          </p>
        </div>
      </div>

      {/* ── SIDE-BY-SIDE VIDEO GRID (MAIN FOCUS) ── */}
      <div className="mx-auto max-w-4xl px-4 pt-8 pb-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-8">
          {TOURS.map((tour) => (
            <VideoCard key={tour.id} tour={tour} />
          ))}
        </div>
      </div>

      {/* ── SUBTLE IN-PERSON INVITATION FOOTER ── */}
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xs">
          <div>
            <h3 className="font-display text-base font-bold text-navy-950">
              Prefer to see the apartments in person?
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Our on-site leasing concierge is available Mon–Sat (9 AM – 6 PM) for private walkthroughs in Bole.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
            <a
              href={`https://wa.me/${cleanPhone}?text=${encodeURIComponent(
                'Hello, I would like to schedule an in-person viewing of the Porchlight apartments in Bole.',
              )}`}
              target="_blank"
              rel="noreferrer"
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition hover:bg-[#20ba5a] active:scale-95"
            >
              <MessageCircle className="h-4 w-4" />
              <span>WhatsApp</span>
            </a>
            <a
              href={`tel:${COMPANY.phone}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-navy-950 shadow-2xs transition hover:bg-slate-50 active:scale-95"
            >
              <Phone className="h-3.5 w-3.5 text-accent" />
              <span>Call</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

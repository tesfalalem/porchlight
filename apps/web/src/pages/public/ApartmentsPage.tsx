import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  FilterX,
  Layers,
  MapPin,
  Maximize2,
  PhoneCall,
  RotateCcw,
  SlidersHorizontal,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import type { ApartmentListItemDto } from '@porchlight/shared';
import { StatusBadge } from '../../components/common/StatusBadge';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonCard } from '../../components/common/LoadingState';
import { CalendarModal, formatDisplayDate } from '../../components/apartments/CalendarModal';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchApartments } from '../../services/apartmentsApi';
import { formatPrice } from '../../utils/format';

// ── Helpers ──────────────────────────────────────────────────────────────────
function floorLabel(n: number | null | undefined): string {
  if (n === null || n === undefined || n === 0) return 'Ground Floor';
  const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
  return `${n}${suffix} Floor`;
}

function primaryImage(apartment: ApartmentListItemDto): string {
  const primary = apartment.images?.find((i) => i.isPrimary) ?? apartment.images?.[0];
  return primary?.url ?? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';
}

export function ApartmentsPage() {
  useDocumentTitle('Residences in Bole — Porchlight');

  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('bedrooms') || searchParams.get('type');
  const [bedroomFilter, setBedroomFilter] = useState<'all' | '2' | '3'>(
    initialType === '2' ? '2' : initialType === '3' ? '3' : 'all'
  );

  const [floorFilter, setFloorFilter] = useState('');
  const [floorOpen, setFloorOpen] = useState(false);
  const floorButtonRef = useRef<HTMLButtonElement>(null);
  const floorDropdownRef = useRef<HTMLDivElement>(null);

  const [availableOnly, setAvailableOnly] = useState(false);
  const [calStart, setCalStart] = useState('');
  const [calEnd, setCalEnd] = useState('');
  const [calOpen, setCalOpen] = useState(false);
  const calButtonRef = useRef<HTMLButtonElement>(null);

  // Sync state with URL params if changed externally
  useEffect(() => {
    const typeParam = searchParams.get('bedrooms') || searchParams.get('type');
    if (typeParam === '2' || typeParam === '3') {
      setBedroomFilter(typeParam);
    } else if (!typeParam) {
      setBedroomFilter('all');
    }
  }, [searchParams]);

  const handleBedroomSwitch = (nextType: 'all' | '2' | '3') => {
    setBedroomFilter(nextType);
    const newParams = new URLSearchParams(searchParams);
    if (nextType === 'all') {
      newParams.delete('bedrooms');
      newParams.delete('type');
    } else {
      newParams.set('bedrooms', nextType);
      newParams.delete('type');
    }
    setSearchParams(newParams, { replace: true });
  };

  // Close floor dropdown on click outside or Escape
  useEffect(() => {
    if (!floorOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        floorButtonRef.current &&
        !floorButtonRef.current.contains(e.target as Node) &&
        floorDropdownRef.current &&
        !floorDropdownRef.current.contains(e.target as Node)
      ) {
        setFloorOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setFloorOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [floorOpen]);

  const apartmentsQuery = useQuery({
    queryKey: ['apartments'],
    queryFn: () => fetchApartments(),
  });

  const allApartments = apartmentsQuery.data ?? [];

  // Floor counts based on current residence-type selection
  const floorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    const relevant =
      bedroomFilter === 'all'
        ? allApartments
        : allApartments.filter((a) => String(a.bedrooms) === bedroomFilter);

    relevant.forEach((a) => {
      const f = String(a.floor ?? 0);
      counts[f] = (counts[f] ?? 0) + 1;
    });
    return counts;
  }, [allApartments, bedroomFilter]);

  // Dynamically populated floors from dataset + default range
  const floorOptions = useMemo(() => {
    const floorSet = new Set<number>();
    allApartments.forEach((a) => {
      if (a.floor !== null && a.floor !== undefined) {
        floorSet.add(a.floor);
      }
    });

    // If dataset has standard floors 3..10, include them
    [3, 4, 5, 6, 7, 8, 9, 10].forEach((f) => floorSet.add(f));

    const sortedFloors = Array.from(floorSet).sort((a, b) => a - b);

    return [
      { value: '', label: 'All Floors', sublabel: 'All Available Stories' },
      ...sortedFloors.map((f) => ({
        value: String(f),
        label: floorLabel(f),
        sublabel: undefined,
      })),
    ];
  }, [allApartments]);

  const selectedFloorOption = floorOptions.find((o) => o.value === floorFilter) ?? floorOptions[0];

  // Combined logical AND filtering
  const filtered = useMemo(() => {
    let list = allApartments;

    // 1. Residence Type Filter
    if (bedroomFilter !== 'all') {
      list = list.filter((a) => String(a.bedrooms) === bedroomFilter);
    }

    // 2. Floor Filter
    if (floorFilter !== '') {
      list = list.filter((a) => String(a.floor ?? 0) === floorFilter);
    }

    // 3. Available Now Filter
    if (availableOnly) {
      list = list.filter((a) => a.availabilityStatus === 'Available');
    }

    // 4. Move-in Date Filter
    if (calStart) {
      const [ey, em, ed] = (calEnd || calStart).split('-').map(Number);
      const cutoff = new Date(ey, em - 1, ed, 23, 59, 59, 999);

      list = list.filter((a) => {
        // Occupied units cannot be moved into
        if (a.availabilityStatus === 'Occupied') return false;

        // Immediately available units
        if (a.availabilityStatus === 'Available') {
          if (!a.availableFrom) return true;
          return new Date(a.availableFrom) <= cutoff;
        }

        // Upcoming / Coming soon units with an availableFrom date
        if (a.availabilityStatus === 'Upcoming' || (a.availabilityStatus as string) === 'Coming Soon') {
          if (!a.availableFrom) return false;
          return new Date(a.availableFrom) <= cutoff;
        }

        return false;
      });
    }

    return list;
  }, [allApartments, bedroomFilter, floorFilter, availableOnly, calStart, calEnd]);

  const hasFilters = bedroomFilter !== 'all' || floorFilter !== '' || availableOnly || calStart !== '';

  const resetAllFilters = () => {
    handleBedroomSwitch('all');
    setFloorFilter('');
    setFloorOpen(false);
    setAvailableOnly(false);
    setCalStart('');
    setCalEnd('');
  };

  const resetFloorAndDate = () => {
    setFloorFilter('');
    setFloorOpen(false);
    setCalStart('');
    setCalEnd('');
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ── 1. HEADER & SEGMENTED RESIDENCE-TYPE SWITCHER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/90 via-white to-slate-50/40 border-b border-slate-200/80 pt-10 pb-16 sm:pt-14 sm:pb-22">
        <div className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-sky-400/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {/* Left Column: Eyebrow, Title, Description */}
            <div className="space-y-3">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition hover:text-navy-950"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back to Home
              </Link>

              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/25 bg-accent/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-accent shadow-xs">
                  <Sparkles className="h-3 w-3" /> Bole Residences · Addis Ababa
                </span>
              </div>

              <h1 className="font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-5xl lg:text-6xl">
                Residences in{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
                  Bole
                </span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Explore our fully furnished luxury residences in Bole, Addis Ababa. Featuring round-the-clock
                security, dedicated generator backup, reserve water storage, and assigned resident parking.
              </p>
            </div>

            {/* Right Column: Segmented Residence-Type Switcher */}
            <div className="flex w-full flex-col items-start gap-2 sm:w-auto md:items-end">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Residence Type
              </span>
              <div
                role="tablist"
                aria-label="Residence Type Filter"
                className="grid w-full grid-cols-3 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-md shadow-navy-950/5 sm:inline-flex sm:w-auto"
              >
                <button
                  type="button"
                  role="tab"
                  aria-selected={bedroomFilter === 'all'}
                  onClick={() => handleBedroomSwitch('all')}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
                    bedroomFilter === 'all'
                      ? 'bg-navy-950 text-white shadow-md'
                      : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
                  }`}
                >
                  <Layers className="h-4 w-4" />
                  All Units
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={bedroomFilter === '2'}
                  onClick={() => handleBedroomSwitch('2')}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
                    bedroomFilter === '2'
                      ? 'bg-navy-950 text-white shadow-md'
                      : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
                  }`}
                >
                  <BedDouble className="h-4 w-4" />
                  2 Bedroom
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={bedroomFilter === '3'}
                  onClick={() => handleBedroomSwitch('3')}
                  className={`inline-flex items-center justify-center gap-1.5 sm:gap-2 rounded-xl px-3.5 py-2.5 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
                    bedroomFilter === '3'
                      ? 'bg-navy-950 text-white shadow-md'
                      : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
                  }`}
                >
                  <BedDouble className="h-4 w-4" />
                  3 Bedroom
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. HORIZONTAL FILTER BAR (ROUNDED ELEVATED CARD) ── */}
      <div className="sticky top-[57px] z-30 -mt-6 sm:-mt-8">
        <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
          <div className="rounded-2xl sm:rounded-3xl border border-slate-200/90 bg-white/95 p-3.5 sm:p-5 shadow-xl shadow-navy-950/8 backdrop-blur-xl ring-1 ring-slate-900/5 transition-all">
            <div className="flex flex-col gap-3.5 lg:flex-row lg:items-center lg:justify-between">

              {/* Mobile/Tablet Header: Results Count & Filter Title */}
              <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-100 lg:hidden">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-700 block">
                      Filter Residences
                    </span>
                    <span className="text-[11px] text-slate-400">Addis Ababa · Bole</span>
                  </div>
                </div>
                <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3.5 py-1.5 text-xs font-bold text-navy-950 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                  {filtered.length} {filtered.length === 1 ? 'Residence' : 'Residences'} Available
                </span>
              </div>

              {/* Filtering Controls */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                {/* Floor Dropdown */}
                <div className="relative">
                  <button
                    ref={floorButtonRef}
                    type="button"
                    onClick={() => setFloorOpen((v) => !v)}
                    className={`inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold sm:font-bold transition-all shadow-xs ${
                      floorFilter !== ''
                        ? 'border border-accent bg-accent text-white shadow-md shadow-accent/25 ring-2 ring-accent/20'
                        : floorOpen
                        ? 'border border-accent bg-white text-navy-950 shadow-md ring-2 ring-accent/20'
                        : 'border border-slate-200/90 bg-slate-50/80 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                    aria-expanded={floorOpen}
                    aria-haspopup="listbox"
                  >
                    <Building2
                      className={`h-4 w-4 sm:h-4.5 sm:w-4.5 ${floorFilter !== '' ? 'text-white' : 'text-accent'}`}
                    />
                    <span>{selectedFloorOption.label}</span>
                    {floorFilter !== '' ? (
                      <span
                        role="button"
                        title="Clear floor filter"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFloorFilter('');
                        }}
                        className="rounded-full p-0.5 text-white/80 hover:bg-white/20 hover:text-white transition ml-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <ChevronDown
                        className={`h-4 w-4 transition-transform duration-200 ${
                          floorFilter !== '' ? 'text-white/80' : 'text-slate-400'
                        } ${floorOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {/* Dropdown Menu */}
                  {floorOpen && (
                    <div
                      ref={floorDropdownRef}
                      className="absolute left-0 top-full mt-2.5 z-50 w-72 sm:w-80 origin-top-left rounded-2xl border border-slate-200/90 bg-white p-2 shadow-2xl shadow-navy-950/15 ring-1 ring-slate-900/5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-150"
                      role="listbox"
                    >
                      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="h-4 w-4 text-accent" />
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
                            Select Floor
                          </span>
                        </div>
                        {floorFilter !== '' ? (
                          <button
                            type="button"
                            onClick={() => {
                              setFloorFilter('');
                              setFloorOpen(false);
                            }}
                            className="text-xs font-bold text-accent hover:underline"
                          >
                            Reset to All
                          </button>
                        ) : (
                          <span className="text-[11px] font-semibold text-slate-400">All Available Stories</span>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-1 p-0.5 no-scrollbar">
                        {floorOptions.map((opt) => {
                          const isSelected = floorFilter === opt.value;
                          const count =
                            opt.value === ''
                              ? (bedroomFilter === 'all'
                                  ? allApartments.length
                                  : allApartments.filter((a) => String(a.bedrooms) === bedroomFilter).length)
                              : (floorCounts[opt.value] ?? 0);

                          return (
                            <button
                              key={opt.value}
                              type="button"
                              role="option"
                              aria-selected={isSelected}
                              onClick={() => {
                                setFloorFilter(opt.value);
                                setFloorOpen(false);
                              }}
                              className={`flex items-center justify-between w-full px-3.5 py-2.5 text-sm font-semibold rounded-xl transition text-left ${
                                isSelected
                                  ? 'bg-accent/10 text-accent font-bold ring-1 ring-accent/25 shadow-2xs'
                                  : 'text-slate-700 hover:bg-slate-50 hover:text-navy-950'
                              }`}
                            >
                              <div className="flex items-center gap-2.5">
                                <div
                                  className={`flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs ${
                                    isSelected
                                      ? 'bg-accent text-white'
                                      : 'bg-slate-100 text-slate-600'
                                  }`}
                                >
                                  {opt.value || 'All'}
                                </div>
                                <div>
                                  <div className="leading-tight text-navy-950 font-bold">{opt.label}</div>
                                  {opt.sublabel && (
                                    <div className="text-[11px] font-normal text-slate-400">
                                      {opt.sublabel}
                                    </div>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-2">
                                <span
                                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
                                    count > 0
                                      ? isSelected
                                        ? 'bg-accent text-white'
                                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                                      : 'bg-slate-100 text-slate-400'
                                  }`}
                                >
                                  {count} {count === 1 ? 'unit' : 'units'}
                                </span>
                                {isSelected && (
                                  <Check className="h-4 w-4 text-accent shrink-0" />
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="h-8 w-px bg-slate-200/90 hidden sm:block mx-0.5" />

                {/* Additional Feature & Date Filters */}
                <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                  {/* "Available Now" Toggle Pill */}
                  <button
                    type="button"
                    onClick={() => setAvailableOnly((v) => !v)}
                    className={`inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold sm:font-bold transition-all shadow-xs ${
                      availableOnly
                        ? 'border border-emerald-300 bg-emerald-50 text-emerald-900 font-bold shadow-sm ring-2 ring-emerald-500/20'
                        : 'border border-slate-200/90 bg-slate-50/80 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <span
                      className={`h-2.5 w-2.5 rounded-full transition-all ${
                        availableOnly ? 'bg-emerald-500 animate-pulse ring-4 ring-emerald-500/20' : 'bg-slate-400'
                      }`}
                    />
                    <span>Available Now</span>
                  </button>

                  {/* Move-in Date Button */}
                  <button
                    ref={calButtonRef}
                    type="button"
                    onClick={() => setCalOpen((v) => !v)}
                    className={`inline-flex items-center gap-2.5 rounded-2xl px-4 py-2.5 sm:px-5 sm:py-3 text-sm font-semibold sm:font-bold transition-all shadow-xs ${
                      calStart
                        ? 'border border-accent bg-accent/10 text-accent font-bold shadow-sm ring-2 ring-accent/20'
                        : calOpen
                        ? 'border border-accent bg-white text-navy-950 shadow-md ring-2 ring-accent/20'
                        : 'border border-slate-200/90 bg-slate-50/80 text-slate-700 hover:bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <Calendar className="h-4 w-4 sm:h-4.5 sm:w-4.5 text-accent" />
                    <span>
                      {calStart && calEnd
                        ? `${formatDisplayDate(calStart)} → ${formatDisplayDate(calEnd)}`
                        : calStart
                        ? `Move-in: ${formatDisplayDate(calStart)}`
                        : 'Move-in Date'}
                    </span>
                    {calStart ? (
                      <span
                        role="button"
                        title="Clear date"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCalStart('');
                          setCalEnd('');
                        }}
                        className="rounded-full p-0.5 text-slate-400 hover:bg-slate-200 hover:text-navy-950 transition ml-0.5"
                      >
                        <X className="h-3.5 w-3.5" />
                      </span>
                    ) : (
                      <ChevronDown
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                          calOpen ? 'rotate-180' : ''
                        }`}
                      />
                    )}
                  </button>

                  {/* Reset Filters */}
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 sm:px-4.5 sm:py-3 text-sm font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50/60 hover:text-red-700 shadow-2xs"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Clear Filters</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Floating Calendar Modal (Portal) */}
              <CalendarModal
                isOpen={calOpen}
                onClose={() => setCalOpen(false)}
                anchorEl={calButtonRef.current}
                rangeStart={calStart}
                rangeEnd={calEnd}
                onSelect={(s, e) => {
                  setCalStart(s);
                  setCalEnd(e);
                }}
                onReset={() => {
                  setCalStart('');
                  setCalEnd('');
                }}
              />

              {/* Desktop Live Results Badge */}
              <div className="hidden lg:flex items-center gap-2 shrink-0">
                <div className="inline-flex items-center gap-2.5 rounded-2xl border border-slate-200/90 bg-slate-50/90 px-5 py-3 text-sm font-bold text-navy-950 shadow-2xs">
                  <span className="h-2 w-2 rounded-full bg-accent animate-pulse ring-4 ring-accent/15" />
                  <span>
                    {filtered.length} {filtered.length === 1 ? 'Residence' : 'Residences'} Available
                  </span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* ── 3. LISTINGS GRID & BALANCED 3-COLUMN LAYOUT ── */}
      <main className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {apartmentsQuery.isLoading ? (
            /* Responsive 3-column loading skeletons */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : apartmentsQuery.isError ? (
            <ErrorState onRetry={() => void apartmentsQuery.refetch()} />
          ) : filtered.length > 0 ? (
            /* Responsive 3-column cards grid */
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((apt) => (
                <article
                  key={apt.id}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1"
                >
                  <Link
                    to={`/apartments/${apt.id}`}
                    state={{
                      backLabel: 'All Residences',
                      backTo: '/apartments',
                    }}
                    className="relative block aspect-[4/3] overflow-hidden bg-slate-100"
                  >
                    <img
                      src={primaryImage(apt)}
                      alt={apt.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />
                    <div className="absolute left-3 top-3">
                      <StatusBadge status={apt.availabilityStatus} availableFrom={apt.availableFrom} />
                    </div>
                    {apt.floor !== null && apt.floor !== undefined && (
                      <div className="absolute right-3 bottom-3 rounded-full bg-navy-950/80 px-3 py-1 text-xs font-semibold text-white shadow-sm backdrop-blur-md">
                        {floorLabel(apt.floor)}
                      </div>
                    )}
                  </Link>

                  <div className="flex flex-1 flex-col p-4 sm:p-6">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-medium text-navy-950 sm:text-2xl">
                          <Link
                            to={`/apartments/${apt.id}`}
                            state={{
                              backLabel: 'All Residences',
                              backTo: '/apartments',
                            }}
                            className="hover:text-accent transition-colors"
                          >
                            {apt.name}
                          </Link>
                        </h3>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
                          Unit {apt.number} · {apt.type}
                        </p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="font-display text-lg font-bold text-accent">{formatPrice(apt.price)}</p>
                        <p className="text-[10px] uppercase tracking-wider text-slate-400">/month</p>
                      </div>
                    </div>

                    <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                      {apt.location}
                    </p>

                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <div className="grid grid-cols-3 gap-2 text-xs text-navy-800">
                        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-2">
                          <BedDouble className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-navy-950">
                            {apt.bedrooms} {apt.bedrooms === 1 ? 'Bed' : 'Beds'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-2">
                          <Bath className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-navy-950">
                            {apt.bathrooms} {apt.bathrooms === 1 ? 'Bath' : 'Baths'}
                          </span>
                        </div>
                        {apt.size ? (
                          <div className="flex items-center gap-1.5 rounded-xl bg-slate-50 px-2 py-2">
                            <Maximize2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span className="font-semibold text-navy-950">{apt.size} m²</span>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-5 border-t border-slate-100 pt-4">
                      <Link
                        to={`/apartments/${apt.id}`}
                        state={{
                          backLabel: 'All Residences',
                          backTo: '/apartments',
                        }}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-accent py-2.5 text-xs font-bold text-white shadow-sm shadow-accent/20 transition-all hover:bg-accent-hover hover:-translate-y-0.5 active:scale-95"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            /* Balanced 3-column empty/placeholder cards when 0 residences match */
            <div className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Placeholder Card 1: Clear Filters */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
                      <FilterX className="h-6 w-6" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-bold text-slate-600 mb-2">
                      0 Matches Found
                    </span>
                    <h3 className="font-display text-lg font-bold text-navy-950">
                      No Exact Matches
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      No units currently match your combined filter selection. Clear filters to see all available residences.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetAllFilters}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-navy-950 py-2.5 text-xs font-bold text-white transition hover:bg-slate-800"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Reset All Filters
                    </button>
                  </div>
                </div>

                {/* Placeholder Card 2: Adjust Floor & Date */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-accent/10 text-accent mb-4">
                      <SlidersHorizontal className="h-6 w-6" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-[11px] font-bold text-accent mb-2">
                      Search Tip
                    </span>
                    <h3 className="font-display text-lg font-bold text-navy-950">
                      Broaden Floor or Dates
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Try selecting "All Floors" or removing the move-in date cutoff to discover units opening up soon.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={resetFloorAndDate}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 py-2.5 text-xs font-bold text-slate-700 transition hover:bg-white hover:border-slate-300"
                    >
                      Clear Floor & Date Only
                    </button>
                  </div>
                </div>

                {/* Placeholder Card 3: Contact Concierge */}
                <div className="flex flex-col justify-between rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
                  <div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 mb-4">
                      <PhoneCall className="h-6 w-6" />
                    </div>
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 mb-2">
                      Direct Concierge
                    </span>
                    <h3 className="font-display text-lg font-bold text-navy-950">
                      Custom Inquiries & Waitlist
                    </h3>
                    <p className="mt-2 text-xs leading-relaxed text-slate-500">
                      Need a specific floor plan, corporate booking, or custom move-in date? Our on-site leasing team is ready to assist.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-slate-100">
                    <Link
                      to="/contact"
                      className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-2.5 text-xs font-bold text-white transition hover:bg-accent-hover shadow-sm"
                    >
                      Contact Concierge
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

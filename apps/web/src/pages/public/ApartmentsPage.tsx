import { useQuery } from '@tanstack/react-query';
import {
  Calendar,
  ChevronDown,
  RotateCcw,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApartmentCard } from '../../components/apartments/ApartmentCard';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonCard } from '../../components/common/LoadingState';
import { CalendarModal, formatDisplayDate } from '../../components/apartments/CalendarModal';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchApartments } from '../../services/apartmentsApi';

function floorLabel(n: number | null | undefined): string {
  if (n === null || n === undefined || n === 0) return 'Ground';
  const s = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
  return `${n}${s} Floor`;
}

export function ApartmentsPage() {
  useDocumentTitle('Residences in Bole — Porchlight');

  const [searchParams, setSearchParams] = useSearchParams();
  const initType = searchParams.get('bedrooms') || searchParams.get('type');
  const [bedroomFilter, setBedroomFilter] = useState<'all' | '2' | '3'>(
    initType === '2' ? '2' : initType === '3' ? '3' : 'all',
  );
  const [floorFilter, setFloorFilter] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [calOpen, setCalOpen] = useState(false);
  const calButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = searchParams.get('bedrooms') || searchParams.get('type');
    if (t === '2' || t === '3') setBedroomFilter(t);
    else if (!t) setBedroomFilter('all');
  }, [searchParams]);

  const handleBedroomSwitch = (v: 'all' | '2' | '3') => {
    setBedroomFilter(v);
    const p = new URLSearchParams(searchParams);
    if (v === 'all') { p.delete('bedrooms'); p.delete('type'); }
    else { p.set('bedrooms', v); p.delete('type'); }
    setSearchParams(p, { replace: true });
  };

  // Pass date filters to the API — server does the overlap exclusion
  const queryKey = ['apartments', checkIn, checkOut];
  const apartmentsQuery = useQuery({
    queryKey,
    queryFn: () => fetchApartments({
      checkIn: checkIn || undefined,
      checkOut: checkOut || undefined,
    }),
  });

  const allApartments = apartmentsQuery.data ?? [];

  const floorOptions = useMemo(() => {
    const s = new Set<number>();
    allApartments.forEach((a) => { if (a.floor != null) s.add(a.floor); });
    [3, 4, 5, 6, 7, 8, 9, 10].forEach((f) => s.add(f));
    return ['', ...Array.from(s).sort((a, b) => a - b).map(String)];
  }, [allApartments]);

  // Client-side filters: type + floor (date filter already applied server-side)
  const filtered = useMemo(() => {
    let list = allApartments;
    if (bedroomFilter !== 'all') list = list.filter((a) => String(a.bedrooms) === bedroomFilter);
    if (floorFilter) list = list.filter((a) => String(a.floor ?? 0) === floorFilter);
    return list;
  }, [allApartments, bedroomFilter, floorFilter]);

  const hasDateFilter = checkIn !== '';
  const hasFilters = bedroomFilter !== 'all' || floorFilter !== '' || hasDateFilter;

  const resetAll = () => {
    handleBedroomSwitch('all');
    setFloorFilter('');
    setCheckIn('');
    setCheckOut('');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2]">

      {/* ── Page header ── */}
      <div className="border-b border-[#E9E5E0] bg-white px-5 py-6 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <p className="kicker-accent mb-1.5 text-[10px] sm:text-xs">Bole, Addis Ababa</p>
          <h1 className="font-display text-2xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
            Residences in Bole
          </h1>
          <p className="mt-1.5 text-[12.5px] sm:text-[14px] text-slate-500">
            Select your move-in and move-out dates to see available residences.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">

        {/* ── Filter bar ── */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 sm:gap-4">
            
            {/* Filter controls row */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3.5">
              {/* Bedroom Segmented Tabs */}
              <div className="flex items-center overflow-hidden rounded-xl border border-[#E0DCD6] bg-white p-0.5 sm:p-1 shadow-2xs shrink-0">
                {([['all', 'All'], ['2', '2 Bed'], ['3', '3 Bed']] as const).map(([v, label]) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => handleBedroomSwitch(v)}
                    aria-pressed={bedroomFilter === v}
                    className={`px-3 sm:px-5 py-1.5 sm:py-2 text-xs sm:text-[14.5px] font-semibold rounded-lg transition-all whitespace-nowrap cursor-pointer ${
                      bedroomFilter === v
                        ? 'bg-navy-950 text-white shadow-xs'
                        : 'text-slate-600 hover:text-navy-950 hover:bg-[#F3F0EC]'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Date range picker trigger */}
              <div className="relative shrink-0">
                <button
                  ref={calButtonRef}
                  type="button"
                  onClick={() => setCalOpen((v) => !v)}
                  className={`inline-flex items-center gap-1.5 sm:gap-2 rounded-xl border px-3 sm:px-4.5 py-1.5 sm:py-2.5 text-xs sm:text-[14.5px] font-semibold whitespace-nowrap transition-all shadow-2xs cursor-pointer ${
                    hasDateFilter
                      ? 'border-accent bg-accent/10 text-accent font-bold ring-2 ring-accent/20'
                      : 'border-[#E0DCD6] bg-white text-slate-700 hover:border-slate-300 hover:bg-[#FAF8F5] hover:text-navy-950'
                  }`}
                >
                  <Calendar className="h-3.5 w-3.5 sm:h-4.5 sm:w-4.5 text-accent shrink-0" />
                  <span>
                    {checkIn && checkOut
                      ? `${formatDisplayDate(checkIn)} - ${formatDisplayDate(checkOut)}`
                      : checkIn
                      ? `From ${formatDisplayDate(checkIn)}`
                      : 'Select dates'}
                  </span>
                  {hasDateFilter ? (
                    <span
                      role="button"
                      title="Clear date filter"
                      onClick={(e) => {
                        e.stopPropagation();
                        setCheckIn('');
                        setCheckOut('');
                      }}
                      className="rounded-full p-0.5 text-accent hover:bg-accent/20 transition ml-0.5"
                    >
                      <X className="h-3.5 w-3.5" />
                    </span>
                  ) : (
                    <ChevronDown className={`h-3.5 w-3.5 sm:h-4 sm:w-4 text-slate-400 transition-transform duration-200 ${calOpen ? 'rotate-180 text-navy-950' : ''}`} />
                  )}
                </button>
                <CalendarModal
                  isOpen={calOpen}
                  onClose={() => setCalOpen(false)}
                  anchorEl={calButtonRef.current}
                  rangeStart={checkIn}
                  rangeEnd={checkOut}
                  onSelect={(s, e) => { setCheckIn(s); setCheckOut(e); }}
                  onReset={() => { setCheckIn(''); setCheckOut(''); }}
                />
              </div>

              {/* Floor dropdown */}
              <div className="relative shrink-0">
                <select
                  value={floorFilter}
                  onChange={(e) => setFloorFilter(e.target.value)}
                  aria-label="Filter by floor"
                  className={`appearance-none rounded-xl border pl-3 pr-8 py-1.5 sm:pl-4 sm:pr-10 sm:py-2.5 text-xs sm:text-[14.5px] font-semibold transition-all shadow-2xs cursor-pointer ${
                    floorFilter !== ''
                      ? 'border-navy-950 bg-navy-950 text-white shadow-xs'
                      : 'border-[#E0DCD6] bg-white text-slate-700 hover:border-slate-300 hover:bg-[#FAF8F5] hover:text-navy-950'
                  }`}
                >
                  <option value="" className="text-navy-950 bg-white">All Floors</option>
                  {floorOptions.filter(v => v !== '').map((v) => (
                    <option key={v} value={v} className="text-navy-950 bg-white">{floorLabel(Number(v))}</option>
                  ))}
                </select>
                <ChevronDown className={`pointer-events-none absolute right-2.5 sm:right-3.5 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 ${floorFilter !== '' ? 'text-white' : 'text-slate-400'}`} />
              </div>
            </div>

            {/* Results count & Reset */}
            <div className="flex items-center gap-2.5 sm:gap-3 ml-auto shrink-0">
              <span className="text-[11px] sm:text-[13px] font-medium text-slate-500">
                {apartmentsQuery.isLoading ? '…' : `${filtered.length} ${filtered.length === 1 ? 'residence' : 'residences'}${hasDateFilter ? ' available' : ''}`}
              </span>

              {hasFilters && (
                <button
                  type="button"
                  onClick={resetAll}
                  className="flex items-center gap-1 sm:gap-1.5 rounded-lg border border-[#E0DCD6] bg-white px-2.5 py-1 sm:px-3 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-slate-600 shadow-2xs hover:bg-[#F3F0EC] hover:text-accent transition-colors"
                >
                  <RotateCcw className="h-3 w-3" /> Reset filters
                </button>
              )}
            </div>
          </div>

          {/* Date filter banner */}
          {hasDateFilter && !apartmentsQuery.isLoading && (
            <div className="flex items-center gap-2 rounded-xl border border-accent/20 bg-accent/5 px-3.5 py-2 sm:px-4 sm:py-2.5 text-xs sm:text-sm font-medium text-accent">
              <Calendar className="h-4 w-4 shrink-0" />
              <span>
                {filtered.length > 0
                  ? `Showing ${filtered.length} ${filtered.length === 1 ? 'residence' : 'residences'} available from ${formatDisplayDate(checkIn)}${checkOut ? ` to ${formatDisplayDate(checkOut)}` : ''}`
                  : `No residences available for the selected dates`
                }
              </span>
            </div>
          )}
        </div>

        {/* ── Listings grid ── */}
        {apartmentsQuery.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
        ) : apartmentsQuery.isError ? (
          <ErrorState onRetry={() => void apartmentsQuery.refetch()} />
        ) : filtered.length === 0 ? (
          <div className="py-20 text-center">
            <Calendar className="mx-auto h-10 w-10 text-slate-300 mb-4" />
            <p className="font-display text-xl font-semibold text-navy-950">
              {hasDateFilter ? 'No residences available for these dates' : 'No residences match your filters'}
            </p>
            <p className="mt-2 text-[14px] text-slate-500">
              {hasDateFilter
                ? 'Try different dates or clear the date filter to see all residences.'
                : 'Try broadening your search or clearing filters.'}
            </p>
            <button
              type="button"
              onClick={resetAll}
              className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#E9E5E0] bg-white px-5 py-2.5 text-sm font-semibold text-navy-950 transition hover:bg-[#F3F0EC]"
            >
              <RotateCcw className="h-4 w-4" /> Clear all filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
            {filtered.map((apt) => (
              <ApartmentCard
                key={apt.id}
                apartment={apt}
                linkState={{ backLabel: 'All Residences', backTo: '/apartments' }}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

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
  const [availableOnly, setAvailableOnly] = useState(false);
  const [calStart, setCalStart] = useState('');
  const [calEnd, setCalEnd] = useState('');
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

  const apartmentsQuery = useQuery({ queryKey: ['apartments'], queryFn: () => fetchApartments() });
  const allApartments = apartmentsQuery.data ?? [];

  const floorOptions = useMemo(() => {
    const s = new Set<number>();
    allApartments.forEach((a) => { if (a.floor != null) s.add(a.floor); });
    [3, 4, 5, 6, 7, 8, 9, 10].forEach((f) => s.add(f));
    return ['', ...Array.from(s).sort((a, b) => a - b).map(String)];
  }, [allApartments]);

  const filtered = useMemo(() => {
    let list = allApartments;
    if (bedroomFilter !== 'all') list = list.filter((a) => String(a.bedrooms) === bedroomFilter);
    if (floorFilter) list = list.filter((a) => String(a.floor ?? 0) === floorFilter);
    if (availableOnly) list = list.filter((a) => a.availabilityStatus === 'Available');
    if (calStart) {
      const [ey, em, ed] = (calEnd || calStart).split('-').map(Number);
      const cutoff = new Date(ey, em - 1, ed, 23, 59, 59, 999);
      list = list.filter((a) => {
        if (a.availabilityStatus === 'Occupied') return false;
        if (a.availabilityStatus === 'Available') return !a.availableFrom || new Date(a.availableFrom) <= cutoff;
        if (a.availabilityStatus === 'Upcoming' || (a.availabilityStatus as string) === 'Coming Soon')
          return !!a.availableFrom && new Date(a.availableFrom) <= cutoff;
        return false;
      });
    }
    return list;
  }, [allApartments, bedroomFilter, floorFilter, availableOnly, calStart, calEnd]);

  const hasFilters = bedroomFilter !== 'all' || floorFilter !== '' || availableOnly || calStart !== '';

  const resetAll = () => {
    handleBedroomSwitch('all');
    setFloorFilter('');
    setAvailableOnly(false);
    setCalStart('');
    setCalEnd('');
  };

  return (
    <div className="min-h-screen bg-[#F8F6F2]">

      {/* ── Page header ── */}
      <div className="border-b border-[#E9E5E0] bg-white px-5 py-8 sm:px-8 sm:py-10">
        <div className="mx-auto max-w-6xl">
          <p className="kicker-accent mb-2">Bole, Addis Ababa</p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-navy-950 sm:text-4xl">
            Residences in Bole
          </h1>
          <p className="mt-2 text-[14px] text-slate-500">
            Fully furnished residences available for immediate and upcoming lease.
          </p>
        </div>
      </div>

      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-8 sm:py-8">

        {/* ── Inline filter bar ── */}
        <div className="mb-6 space-y-3">

          {/* Row 1: Type + count + clear */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Bedroom type tabs */}
            <div className="flex items-center overflow-hidden rounded-lg border border-[#E9E5E0] bg-white shrink-0">
              {([['all', 'All'], ['2', '2 Bed'], ['3', '3 Bed']] as const).map(([v, label]) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => handleBedroomSwitch(v)}
                  aria-pressed={bedroomFilter === v}
                  className={`px-3.5 py-2 text-[13px] font-medium transition-colors whitespace-nowrap ${
                    bedroomFilter === v
                      ? 'bg-navy-950 text-white'
                      : 'text-slate-600 hover:bg-[#F3F0EC] hover:text-navy-950'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Result count */}
            <span className="text-[13px] text-slate-500 ml-1">
              {filtered.length} {filtered.length === 1 ? 'residence' : 'residences'}
            </span>

            {/* Clear all */}
            {hasFilters && (
              <button
                type="button"
                onClick={resetAll}
                className="ml-auto flex items-center gap-1 text-[12px] font-medium text-slate-400 hover:text-accent transition-colors"
              >
                <RotateCcw className="h-3 w-3" /> Reset
              </button>
            )}
          </div>

          {/* Row 2: Secondary filters — floor, availability, move-in date */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-0.5">

            {/* Floor dropdown */}
            <div className="relative shrink-0">
              <select
                value={floorFilter}
                onChange={(e) => setFloorFilter(e.target.value)}
                aria-label="Filter by floor"
                className={`appearance-none rounded-md border pr-7 pl-3 py-1.5 text-[12px] font-medium transition-colors cursor-pointer ${
                  floorFilter !== ''
                    ? 'border-navy-950 bg-navy-950 text-white'
                    : 'border-[#E9E5E0] bg-white text-slate-600 hover:bg-[#F3F0EC]'
                }`}
              >
                <option value="">All Floors</option>
                {floorOptions.filter(v => v !== '').map((v) => (
                  <option key={v} value={v}>{floorLabel(Number(v))}</option>
                ))}
              </select>
              <ChevronDown className={`pointer-events-none absolute right-2 top-1/2 h-3 w-3 -translate-y-1/2 ${floorFilter !== '' ? 'text-white' : 'text-slate-400'}`} />
            </div>

            {/* Divider */}
            <div className="h-5 w-px shrink-0 bg-[#E9E5E0]" />

            {/* Available Now toggle */}
            <button
              type="button"
              onClick={() => setAvailableOnly((v) => !v)}
              aria-pressed={availableOnly}
              className={`flex shrink-0 items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                availableOnly
                  ? 'border-[#27866A] bg-[#27866A]/10 text-[#27866A]'
                  : 'border-[#E9E5E0] bg-white text-slate-600 hover:bg-[#F3F0EC]'
              }`}
            >
              <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${availableOnly ? 'bg-[#27866A]' : 'bg-slate-300'}`} />
              Available Now
              {availableOnly && <X className="h-3 w-3 ml-0.5" onClick={(e) => { e.stopPropagation(); setAvailableOnly(false); }} />}
            </button>

            {/* Move-in date */}
            <div className="relative shrink-0">
              <button
                ref={calButtonRef}
                type="button"
                onClick={() => setCalOpen((v) => !v)}
                className={`flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                  calStart
                    ? 'border-accent bg-accent/10 text-accent'
                    : 'border-[#E9E5E0] bg-white text-slate-600 hover:bg-[#F3F0EC]'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                {calStart
                  ? calEnd
                    ? `${formatDisplayDate(calStart)} - ${formatDisplayDate(calEnd)}`
                    : formatDisplayDate(calStart)
                  : 'Move-in date'}
                {calStart
                  ? <X className="h-3 w-3 ml-0.5" onClick={(e) => { e.stopPropagation(); setCalStart(''); setCalEnd(''); }} />
                  : <ChevronDown className={`h-3 w-3 ml-0.5 transition-transform ${calOpen ? 'rotate-180' : ''}`} />
                }
              </button>
              <CalendarModal
                isOpen={calOpen}
                onClose={() => setCalOpen(false)}
                anchorEl={calButtonRef.current}
                rangeStart={calStart}
                rangeEnd={calEnd}
                onSelect={(s, e) => { setCalStart(s); setCalEnd(e); }}
                onReset={() => { setCalStart(''); setCalEnd(''); }}
              />
            </div>

          </div>
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
            <p className="font-display text-xl font-semibold text-navy-950">No residences match your filters</p>
            <p className="mt-2 text-[14px] text-slate-500">Try broadening your search or clearing filters.</p>
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

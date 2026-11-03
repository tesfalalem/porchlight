import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Check,
  ChevronDown,
  ChevronUp,
  MapPin,
  Maximize2,
  RotateCcw,
  Sparkles,
  X,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { SkeletonCard } from '../../components/common/LoadingState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchApartments } from '../../services/apartmentsApi';
import { formatPrice } from '../../utils/format';

// ── Helpers ──────────────────────────────────────────────────────────────────
function floorLabel(n: number | null | undefined): string {
  if (n === null || n === undefined || n === 0) return 'Ground Floor';
  const suffix = n === 1 ? 'st' : n === 2 ? 'nd' : n === 3 ? 'rd' : 'th';
  return `${n}${suffix} Floor`;
}

function primaryImage(images: { url: string; isPrimary: boolean }[]): string {
  return (
    (images.find((i) => i.isPrimary) ?? images[0])?.url ??
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80'
  );
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

const DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

// ── Separated Floating Calendar Prompt (Matches Screenshot 2) ────────────────
function CalendarModal({
  isOpen,
  onClose,
  anchorEl,
  rangeStart,
  rangeEnd,
  onSelect,
  onReset,
}: {
  isOpen: boolean;
  onClose: () => void;
  anchorEl: HTMLElement | null;
  rangeStart: string;
  rangeEnd: string;
  onSelect: (start: string, end: string) => void;
  onReset: () => void;
}) {
  const today = new Date();
  const initialDate = rangeStart ? new Date(rangeStart) : today;
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [coords, setCoords] = useState<{ top?: number; bottom?: number; left: number } | null>(null);

  // Synchronize view month & year with selected date when opened
  useEffect(() => {
    if (isOpen) {
      if (rangeStart) {
        const [y, m] = rangeStart.split('-').map(Number);
        if (!isNaN(y) && !isNaN(m)) {
          setViewYear(y);
          setViewMonth(m - 1);
        }
      } else {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
      }
    }
  }, [isOpen, rangeStart]);

  // Position calculation (floating popover below or above anchor on desktop, centered on mobile)
  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!anchorEl || window.innerWidth < 640) {
        setCoords(null);
        return;
      }
      const rect = anchorEl.getBoundingClientRect();
      const popoverWidth = 320;
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - popoverWidth - 16);
      }
      // If there is room below, place below; otherwise place above
      if (rect.bottom + 380 <= window.innerHeight) {
        setCoords({
          top: rect.bottom + 8,
          left,
        });
      } else {
        const bottom = Math.max(16, window.innerHeight - rect.top + 8);
        setCoords({
          bottom,
          left,
        });
      }
    };

    updatePosition();
    window.addEventListener('resize', updatePosition);
    window.addEventListener('scroll', updatePosition, true);
    return () => {
      window.removeEventListener('resize', updatePosition);
      window.removeEventListener('scroll', updatePosition, true);
    };
  }, [isOpen, anchorEl]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const daysInCurrentMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();
  // Monday is 0
  const firstDayOfWeek = (new Date(viewYear, viewMonth, 1).getDay() + 6) % 7;

  type CellData = {
    day: number;
    month: number;
    year: number;
    dateStr: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  };

  const cells: CellData[] = [];

  // Trailing days from previous month
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const d = daysInPrevMonth - i;
    const pDate = new Date(viewYear, viewMonth - 1, d);
    cells.push({
      day: d,
      month: pDate.getMonth(),
      year: pDate.getFullYear(),
      dateStr: toYMD(pDate),
      isCurrentMonth: false,
      isToday: toYMD(pDate) === toYMD(today),
    });
  }

  // Days of current month
  for (let d = 1; d <= daysInCurrentMonth; d++) {
    const cDate = new Date(viewYear, viewMonth, d);
    cells.push({
      day: d,
      month: viewMonth,
      year: viewYear,
      dateStr: toYMD(cDate),
      isCurrentMonth: true,
      isToday: toYMD(cDate) === toYMD(today),
    });
  }

  // Leading days of next month (fill up to 35 or 42 cells)
  const totalCells = cells.length <= 35 ? 35 : 42;
  let nextDay = 1;
  while (cells.length < totalCells) {
    const nDate = new Date(viewYear, viewMonth + 1, nextDay);
    cells.push({
      day: nextDay,
      month: nDate.getMonth(),
      year: nDate.getFullYear(),
      dateStr: toYMD(nDate),
      isCurrentMonth: false,
      isToday: toYMD(nDate) === toYMD(today),
    });
    nextDay++;
  }

  const handleDayClick = (dateStr: string) => {
    if (!rangeStart || (rangeStart && rangeEnd)) {
      onSelect(dateStr, '');
    } else {
      if (dateStr < rangeStart) {
        onSelect(dateStr, rangeStart);
      } else {
        onSelect(rangeStart, dateStr);
      }
    }
  };

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((y) => y - 1);
      setViewMonth(11);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((y) => y + 1);
      setViewMonth(0);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const modalBody = (
    <div
      className={
        coords
          ? 'w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl shadow-navy-950/15 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150'
          : 'w-full max-w-[320px] overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl shadow-navy-950/15 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150'
      }
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header — Month Year & Chevrons */}
      <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
        <span className="text-sm font-bold text-navy-950 tracking-wide">
          {MONTHS[viewMonth]} {viewYear}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            title="Previous Month"
            onClick={prevMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy-950 transition"
          >
            <ChevronUp className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Next Month"
            onClick={nextMonth}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-navy-950 transition"
          >
            <ChevronDown className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Close"
            onClick={onClose}
            className="ml-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-navy-950 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Days of week headers (Mo Tu We Th Fr Sa Su) */}
      <div className="grid grid-cols-7 pt-2.5 pb-1.5 text-center">
        {DAYS.map((d) => (
          <div key={d} className="text-[11px] font-bold uppercase text-slate-400">
            {d}
          </div>
        ))}
      </div>

      {/* Calendar Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 gap-x-1 text-center">
        {cells.map((cell, idx) => {
          const isStart = cell.dateStr === rangeStart;
          const isEnd = cell.dateStr === rangeEnd;
          const inRange = !!(rangeStart && rangeEnd && cell.dateStr > rangeStart && cell.dateStr < rangeEnd);
          const isSelected = isStart || isEnd;

          return (
            <button
              key={idx}
              type="button"
              onClick={() => handleDayClick(cell.dateStr)}
              className={`h-8 w-8 mx-auto flex items-center justify-center text-xs transition font-semibold rounded-lg ${
                isSelected
                  ? 'bg-accent text-white font-bold shadow-md shadow-accent/25 ring-2 ring-accent/30'
                  : inRange
                  ? 'bg-accent/15 text-accent'
                  : cell.isCurrentMonth
                  ? 'text-slate-800 hover:bg-slate-100 hover:text-navy-950'
                  : 'text-slate-300 hover:bg-slate-50 font-normal'
              } ${cell.isToday && !isSelected ? 'border border-accent/50 text-accent font-bold' : ''}`}
            >
              {cell.day}
            </button>
          );
        })}
      </div>

      {/* Quick Presets */}
      <div className="mt-3 flex items-center gap-1.5 pt-2.5 border-t border-slate-100 text-xs">
        <span className="text-slate-400 mr-0.5 font-medium text-[11px]">Quick:</span>
        <button
          type="button"
          onClick={() => onSelect(toYMD(today), '')}
          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-navy-950 font-semibold transition text-xs"
        >
          Today
        </button>
        <button
          type="button"
          onClick={() => {
            const in2w = new Date();
            in2w.setDate(in2w.getDate() + 14);
            onSelect(toYMD(in2w), '');
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-navy-950 font-semibold transition text-xs"
        >
          +2 Weeks
        </button>
        <button
          type="button"
          onClick={() => {
            const nextM = new Date();
            nextM.setMonth(nextM.getMonth() + 1);
            nextM.setDate(1);
            onSelect(toYMD(nextM), '');
          }}
          className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-navy-950 font-semibold transition text-xs"
        >
          Next Month
        </button>
      </div>

      {/* Footer Actions */}
      <div className="mt-2.5 flex items-center justify-between pt-2.5 border-t border-slate-100">
        <button
          type="button"
          onClick={onReset}
          className="text-xs font-semibold text-slate-500 hover:text-navy-950 transition"
        >
          Reset Date
        </button>
        <div className="flex items-center gap-2">
          {rangeStart && (
            <span className="text-xs font-semibold text-accent max-w-[120px] truncate">
              {rangeEnd ? `${formatDisplayDate(rangeStart)} → ${formatDisplayDate(rangeEnd)}` : formatDisplayDate(rangeStart)}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-accent px-3.5 py-1.5 text-xs font-bold text-white shadow-sm transition hover:bg-accent-hover"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(
    <>
      {/* Backdrop overlay */}
      <div
        className="fixed inset-0 z-[9998] bg-navy-950/40 backdrop-blur-xs"
        onClick={onClose}
      />
      {/* Floating or Centered Modal */}
      {coords ? (
        <div
          style={{
            position: 'fixed',
            ...(coords.top !== undefined ? { top: `${coords.top}px` } : {}),
            ...(coords.bottom !== undefined ? { bottom: `${coords.bottom}px` } : {}),
            left: `${coords.left}px`,
            zIndex: 9999,
          }}
        >
          {modalBody}
        </div>
      ) : (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 pointer-events-none">
          <div className="pointer-events-auto">
            {modalBody}
          </div>
        </div>
      )}
    </>,
    document.body
  );
}

// ── Main Page Component ────────────────────────────────────────────────────────
export function BedroomListingPage() {
  const { pathname } = useLocation();
  const bedrooms = pathname.includes('2-bedroom') ? 2 : pathname.includes('3-bedroom') ? 3 : null;
  const label = bedrooms === 2 ? '2 Bedroom' : bedrooms === 3 ? '3 Bedroom' : '';
  const bedroomsParam = bedrooms === 2 ? '2-bedroom' : '3-bedroom';

  useDocumentTitle(`${label} Apartments in Bole — Porchlight`);

  const [floorFilter, setFloorFilter] = useState('');
  const [floorOpen, setFloorOpen] = useState(false);
  const floorButtonRef = useRef<HTMLButtonElement>(null);
  const floorDropdownRef = useRef<HTMLDivElement>(null);

  const [availableOnly, setAvailableOnly] = useState(false);
  const [calStart, setCalStart] = useState('');
  const [calEnd, setCalEnd] = useState('');
  const [calOpen, setCalOpen] = useState(false);
  const calButtonRef = useRef<HTMLButtonElement>(null);

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

  const query = useQuery({
    queryKey: ['apartments', 'bedroom-listing', bedrooms],
    queryFn: () => fetchApartments({ bedrooms: bedrooms ?? undefined }),
    enabled: bedrooms !== null,
  });

  const floorCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    (query.data ?? []).forEach((a) => {
      const f = String(a.floor ?? 0);
      counts[f] = (counts[f] ?? 0) + 1;
    });
    return counts;
  }, [query.data]);

  // Floors 3rd to 10th floor (always displayed, even if no units are assigned)
  const floorOptions = useMemo(() => {
    const floorSet = new Set<number>([3, 4, 5, 6, 7, 8, 9, 10]);
    (query.data ?? []).forEach((a) => {
      if (a.floor !== null && a.floor !== undefined) floorSet.add(a.floor);
    });
    const sortedFloors = Array.from(floorSet).sort((a, b) => a - b);

    return [
      { value: '', label: 'All Floors', sublabel: 'All Stories (3rd – 10th Floor)' },
      ...sortedFloors.map((f) => ({
        value: String(f),
        label: floorLabel(f),
        sublabel: undefined,
      })),
    ];
  }, [query.data]);

  const selectedFloorOption = floorOptions.find((o) => o.value === floorFilter) ?? floorOptions[0];

  const filtered = useMemo(() => {
    let list = query.data ?? [];

    if (floorFilter !== '') {
      list = list.filter((a) => String(a.floor ?? 0) === floorFilter);
    }

    if (availableOnly) {
      list = list.filter((a) => a.availabilityStatus === 'Available');
    }

    if (calStart) {
      const [ey, em, ed] = (calEnd || calStart).split('-').map(Number);
      const cutoff = new Date(ey, em - 1, ed, 23, 59, 59, 999);

      list = list.filter((a) => {
        // Occupied apartments cannot be moved into
        if (a.availabilityStatus === 'Occupied') return false;

        // If Available, it is move-in ready immediately
        if (a.availabilityStatus === 'Available') {
          if (!a.availableFrom) return true;
          return new Date(a.availableFrom) <= cutoff;
        }

        // If Upcoming, it must become available on or before cutoff
        if (a.availabilityStatus === 'Upcoming' || (a.availabilityStatus as string) === 'Coming Soon') {
          if (!a.availableFrom) return false;
          return new Date(a.availableFrom) <= cutoff;
        }

        return false;
      });
    }

    return list;
  }, [query.data, floorFilter, availableOnly, calStart, calEnd]);

  const hasFilters = !!(floorFilter || availableOnly || calStart);
  const resetFilters = () => {
    setFloorFilter('');
    setFloorOpen(false);
    setAvailableOnly(false);
    setCalStart('');
    setCalEnd('');
  };

  if (bedrooms === null) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-500">Invalid bedroom type.</p>
        <Link to="/apartments" className="mt-4 inline-block text-accent underline">
          Back to all apartments
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* ── 1. HEADER: SUBTLE ICE CANVAS & BEDROOM SWITCHER ── */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-50/90 via-white to-slate-50/40 border-b border-slate-200/80 pt-10 pb-16 sm:pt-14 sm:pb-22">
        {/* Subtle decorative glow accents */}
        <div className="pointer-events-none absolute -left-40 top-0 h-80 w-80 rounded-full bg-accent/5 blur-3xl" />
        <div className="pointer-events-none absolute -right-40 top-10 h-80 w-80 rounded-full bg-sky-400/5 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            {/* Left Content */}
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
                {label}{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-blue-700">
                  Apartments
                </span>
              </h1>

              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                Curated, fully furnished {label.toLowerCase()} residences with private bathrooms, 24/7 dedicated generator power backup, reserve water storage, and assigned parking.
              </p>
            </div>

            {/* Instant Bedroom Switcher Pill */}
            <div className="flex w-full flex-col items-start gap-2 sm:w-auto md:items-end">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Switch Residence Type
              </span>
              <div className="grid w-full grid-cols-2 rounded-2xl border border-slate-200/90 bg-white p-1.5 shadow-md shadow-navy-950/5 sm:inline-flex sm:w-auto">
                <Link
                  to="/apartments/2-bedroom"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
                    bedrooms === 2
                      ? 'bg-navy-950 text-white shadow-md'
                      : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
                  }`}
                >
                  <BedDouble className="h-4 w-4" />
                  2 Bedroom
                </Link>
                <Link
                  to="/apartments/3-bedroom"
                  className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all sm:px-5 sm:text-sm ${
                    bedrooms === 3
                      ? 'bg-navy-950 text-white shadow-md'
                      : 'text-slate-600 hover:text-navy-950 hover:bg-slate-50'
                  }`}
                >
                  <BedDouble className="h-4 w-4" />
                  3 Bedroom
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. FLOATING FILTER BAR (SPACIOUS & LUXURIOUS) ── */}
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

              {/* Filtering Controls — Generously sized, spacious, and ergonomic */}
              <div className="flex flex-wrap items-center gap-2.5 sm:gap-3.5">
                {/* Floor Dropdown (Stories 3 to 10) */}
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
                          <span className="text-[11px] font-semibold text-slate-400">Stories 3–10</span>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto space-y-1 p-0.5 no-scrollbar">
                        {floorOptions.map((opt) => {
                          const isSelected = floorFilter === opt.value;
                          const count =
                            opt.value === ''
                              ? (query.data?.length ?? 0)
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
                        className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${calOpen ? 'rotate-180' : ''}`}
                      />
                    )}
                  </button>

                  {/* Reset Filters */}
                  {hasFilters && (
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="inline-flex items-center gap-2 rounded-2xl border border-dashed border-slate-300 px-4 py-2.5 sm:px-4.5 sm:py-3 text-sm font-semibold text-slate-600 transition hover:border-red-300 hover:bg-red-50/60 hover:text-red-700 shadow-2xs"
                    >
                      <RotateCcw className="h-4 w-4" />
                      <span>Clear Filters</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Separated Floating Calendar Modal / Prompt (Portal) */}
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

      {/* ── 3. LISTINGS GRID ── */}
      <main className="py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {query.isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </div>
          ) : query.isError ? (
            <ErrorState onRetry={() => void query.refetch()} />
          ) : filtered.length > 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filtered.map((apt) => (
                <Link
                  key={apt.id}
                  to={`/apartments/${apt.id}`}
                  state={{
                    backLabel: `${label} Apartments`,
                    backTo: `/apartments/${bedroomsParam}`,
                  }}
                  className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:border-accent/40"
                >
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    <img
                      src={primaryImage(apt.images)}
                      alt={apt.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
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
                  </div>

                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg font-bold text-navy-950 transition-colors group-hover:text-accent">
                          {apt.name}
                        </h3>
                        <p className="mt-0.5 text-xs font-medium text-slate-400">Unit {apt.number}</p>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-bold text-accent">
                        {apt.bedrooms} Bed
                      </span>
                    </div>

                    <p className="mt-2.5 flex items-center gap-1.5 text-xs text-slate-500">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
                      {apt.location}
                    </p>

                    <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                      <div className="flex items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-2">
                        <BedDouble className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-navy-950">{apt.bedrooms} Beds</span>
                      </div>
                      <div className="flex items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-2">
                        <Bath className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="font-semibold text-navy-950">{apt.bathrooms} Baths</span>
                      </div>
                      {apt.size ? (
                        <div className="flex items-center gap-1 rounded-xl bg-slate-50 px-2.5 py-2">
                          <Maximize2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span className="font-semibold text-navy-950">{apt.size} m²</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
                      <div>
                        <p className="font-display text-lg font-extrabold text-navy-950">
                          {formatPrice(apt.price)}
                        </p>
                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                          / month
                        </p>
                      </div>
                      <span className="inline-flex items-center rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm shadow-accent/25 transition-all group-hover:bg-accent-hover group-hover:-translate-y-0.5">
                        View Details
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center">
              <EmptyState message={`No ${label.toLowerCase()} apartments match your filters.`} />
              {hasFilters && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  <RotateCcw className="h-4 w-4" /> Clear all filters
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

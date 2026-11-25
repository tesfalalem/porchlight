import { ChevronDown, ChevronUp, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function formatDisplayDate(dateStr: string): string {
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

export function CalendarModal({
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

  useEffect(() => {
    if (!isOpen) return;

    const updatePosition = () => {
      if (!anchorEl || window.innerWidth < 640) {
        setCoords(null);
        return;
      }
      const rect = anchorEl.getBoundingClientRect();
      const popoverWidth = 320;
      const popoverHeight = 440;
      let left = rect.left;
      if (left + popoverWidth > window.innerWidth - 16) {
        left = Math.max(16, window.innerWidth - popoverWidth - 16);
      }
      if (rect.bottom + popoverHeight <= window.innerHeight - 16) {
        setCoords({
          top: rect.bottom + 8,
          left,
        });
      } else if (rect.top - popoverHeight >= 16) {
        setCoords({
          bottom: window.innerHeight - rect.top + 8,
          left,
        });
      } else {
        setCoords({
          top: Math.max(16, window.innerHeight - popoverHeight - 16),
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
          ? 'w-[320px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl shadow-navy-950/20 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150'
          : 'w-full max-w-[320px] max-h-[calc(100vh-32px)] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-4 text-slate-900 shadow-2xl shadow-navy-950/20 ring-1 ring-slate-900/5 animate-in fade-in zoom-in-95 duration-150'
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

      {/* Days of week headers */}
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
      <div
        className="fixed inset-0 z-[9998] bg-navy-950/40 backdrop-blur-xs"
        onClick={onClose}
      />
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

import type { AvailabilityStatus, InquiryStatus } from '@porchlight/shared';
import clsx from 'clsx';
import { formatDate } from '../../utils/format';

type BadgeStatus = AvailabilityStatus | InquiryStatus | string;

const styles: Record<string, { bg: string; dot: string }> = {
  Available:    { bg: 'bg-white text-emerald-700 border-emerald-400 shadow-md', dot: 'bg-emerald-500' },
  Occupied:     { bg: 'bg-white text-slate-700 border-slate-400 shadow-md', dot: 'bg-slate-500' },
  Upcoming:     { bg: 'bg-white text-amber-700 border-amber-400 shadow-md', dot: 'bg-amber-500' },
  'Coming Soon':{ bg: 'bg-white text-amber-700 border-amber-400 shadow-md', dot: 'bg-amber-500' },
  Unavailable:  { bg: 'bg-white text-rose-700 border-rose-400 shadow-md', dot: 'bg-rose-500' },
  New:          { bg: 'bg-sky-500/10 text-sky-800 border-sky-200/60 backdrop-blur-md', dot: 'bg-sky-500' },
  Contacted:    { bg: 'bg-violet-500/10 text-violet-800 border-violet-200/60 backdrop-blur-md', dot: 'bg-violet-500' },
  'In Progress':{ bg: 'bg-amber-500/10 text-amber-900 border-amber-200/60 backdrop-blur-md', dot: 'bg-amber-500' },
  Resolved:     { bg: 'bg-emerald-500/10 text-emerald-800 border-emerald-200/60 backdrop-blur-md', dot: 'bg-emerald-500' },
  Closed:       { bg: 'bg-slate-500/10 text-slate-600 border-slate-200/60 backdrop-blur-md', dot: 'bg-slate-400' },
};

export function StatusBadge({
  status,
  availableFrom,
}: {
  status: BadgeStatus;
  availableFrom?: string | null;
}) {
  // Derive human-readable label
  let label: string;
  if (status === 'Available' && !availableFrom) {
    label = 'Available Now';
  } else if (status === 'Available' && availableFrom) {
    label = `Available on ${formatDate(availableFrom)}`;
  } else if ((status === 'Upcoming' || status === 'Coming Soon') && availableFrom) {
    label = `Upcoming (${formatDate(availableFrom)})`;
  } else if (status === 'Upcoming' || status === 'Coming Soon') {
    label = 'Upcoming';
  } else if (status === 'Occupied') {
    label = 'Currently Unavailable';
  } else {
    label = status;
  }
  const config = styles[status] ?? { bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' };

  return (
    <span
      className={clsx(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold shadow-sm transition-all',
        config.bg,
      )}
    >
      <span className={clsx('h-1.5 w-1.5 rounded-full animate-pulse-subtle', config.dot)} />
      {label}
    </span>
  );
}

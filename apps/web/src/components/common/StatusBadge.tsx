import type { AvailabilityStatus, InquiryStatus } from '@porchlight/shared';
import clsx from 'clsx';
import { formatDate } from '../../utils/format';

type BadgeStatus = AvailabilityStatus | InquiryStatus | string;

interface StyleConfig { text: string; dot: string }

const styles: Record<string, StyleConfig> = {
  Available:     { text: 'text-[#27866A]',  dot: 'bg-[#27866A]' },
  Occupied:      { text: 'text-slate-500',   dot: 'bg-slate-400' },
  Upcoming:      { text: 'text-amber-700',   dot: 'bg-amber-500' },
  'Coming Soon': { text: 'text-amber-700',   dot: 'bg-amber-500' },
  Unavailable:   { text: 'text-red-600',     dot: 'bg-red-500'   },
  New:           { text: 'text-accent',       dot: 'bg-accent'    },
  Contacted:     { text: 'text-purple-700',  dot: 'bg-purple-500' },
  'In Progress': { text: 'text-amber-700',   dot: 'bg-amber-500' },
  Resolved:      { text: 'text-[#27866A]',   dot: 'bg-[#27866A]' },
  Closed:        { text: 'text-slate-400',   dot: 'bg-slate-300' },
};

function getLabel(status: BadgeStatus, availableFrom?: string | null): string {
  if (status === 'Available' && !availableFrom) return 'Available Now';
  if (status === 'Available' && availableFrom) return `Available on ${formatDate(availableFrom)}`;
  if ((status === 'Upcoming' || status === 'Coming Soon') && availableFrom)
    return `Available from ${formatDate(availableFrom)}`;
  if (status === 'Upcoming' || status === 'Coming Soon') return 'Available Soon';
  if (status === 'Occupied') return 'Currently Occupied';
  return status as string;
}

export function StatusBadge({
  status,
  availableFrom,
}: {
  status: BadgeStatus;
  availableFrom?: string | null;
}) {
  const label = getLabel(status, availableFrom);
  const cfg = styles[status as string] ?? { text: 'text-slate-500', dot: 'bg-slate-400' };

  return (
    <span
      className={clsx('inline-flex items-center gap-1.5 text-[12px] font-medium', cfg.text)}
      role="status"
      aria-label={label}
    >
      <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', cfg.dot)} aria-hidden />
      {label}
    </span>
  );
}

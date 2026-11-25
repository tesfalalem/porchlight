import type { AvailabilityStatus, InquiryStatus } from '@porchlight/shared';
import clsx from 'clsx';
import { formatAvailabilityLabel } from '../../utils/format';

type BadgeStatus = AvailabilityStatus | InquiryStatus | string;

interface StyleConfig { text: string; dot: string }

const styles: Record<string, StyleConfig> = {
  New:           { text: 'text-accent',       dot: 'bg-accent'    },
  Contacted:     { text: 'text-purple-700',  dot: 'bg-purple-500' },
  'In Progress': { text: 'text-amber-700',   dot: 'bg-amber-500' },
  Resolved:      { text: 'text-[#27866A]',   dot: 'bg-[#27866A]' },
  Closed:        { text: 'text-slate-400',   dot: 'bg-slate-300' },
};

export function StatusBadge({
  status,
  availableFrom,
}: {
  status?: BadgeStatus;
  availableFrom?: string | null;
}) {
  // If it's an inquiry status (New, Contacted, In Progress, Resolved, Closed)
  if (status && styles[status as string]) {
    const cfg = styles[status as string];
    return (
      <span
        className={clsx('inline-flex items-center gap-1.5 text-[12px] font-medium', cfg.text)}
        role="status"
        aria-label={status as string}
      >
        <span className={clsx('h-1.5 w-1.5 shrink-0 rounded-full', cfg.dot)} aria-hidden />
        {status}
      </span>
    );
  }

  // Apartment availability status: uniform compact "Available from [Date]"
  const label = formatAvailabilityLabel(availableFrom);
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[11px] sm:text-[12px] font-normal sm:font-semibold text-[#27866A]"
      role="status"
      aria-label={label}
    >
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#27866A]" aria-hidden />
      {label}
    </span>
  );
}

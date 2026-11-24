import type { ApartmentListItemDto } from '@porchlight/shared';
import { Bath, BedDouble, Layers, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';

function primaryImage(apartment: ApartmentListItemDto): string {
  const primary = apartment.images?.find((i) => i.isPrimary) ?? apartment.images?.[0];
  return primary?.url ?? '';
}

function statusConfig(status: string): {
  label: string;
  color: string;
  dot: string;
  ring: string;
  bg: string;
} {
  if (status === 'Available')
    return {
      label: 'Available',
      color: 'text-emerald-800',
      dot: 'bg-emerald-500',
      ring: 'ring-2 ring-emerald-500/25',
      bg: 'bg-white/95 border-emerald-200/90 shadow-xs',
    };
  if (status === 'Occupied')
    return {
      label: 'Occupied',
      color: 'text-slate-700',
      dot: 'bg-slate-400',
      ring: 'ring-2 ring-slate-400/25',
      bg: 'bg-white/95 border-slate-200/90 shadow-xs',
    };
  if (status === 'Upcoming' || status === 'Coming Soon')
    return {
      label: 'Coming Soon',
      color: 'text-amber-800',
      dot: 'bg-amber-500',
      ring: 'ring-2 ring-amber-500/25',
      bg: 'bg-white/95 border-amber-200/90 shadow-xs',
    };
  return {
    label: status,
    color: 'text-slate-700',
    dot: 'bg-slate-400',
    ring: 'ring-2 ring-slate-400/25',
    bg: 'bg-white/95 border-slate-200/90 shadow-xs',
  };
}

export function ApartmentCard({
  apartment,
  linkState,
}: {
  apartment: ApartmentListItemDto;
  linkState?: { backLabel?: string; backTo?: string };
}) {
  const imgSrc = primaryImage(apartment);
  const { label, color, dot, ring, bg } = statusConfig(apartment.availabilityStatus);

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-xl border border-[#E9E5E0] bg-white transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/40 hover:shadow-md">
      {/* ── Photo Container ── */}
      <Link
        to={`/apartments/${apartment.id}`}
        state={linkState}
        className="relative block aspect-[16/10] overflow-hidden bg-[#F3F0EC]"
        tabIndex={-1}
        aria-hidden="true"
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            alt=""
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <span className="text-[11px] text-slate-400">No photo</span>
          </div>
        )}

        {/* Status Pill Badge (Top Left Overlay) */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 z-10">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 sm:px-3 sm:py-1 text-xs sm:text-[13px] font-semibold backdrop-blur-md transition-all ${bg} ${color}`}
          >
            <span className={`h-2 w-2 shrink-0 rounded-full ${dot} ${ring}`} />
            <span>{label}</span>
          </span>
        </div>

        {/* Floor Badge (Bottom Right Overlay) */}
        {apartment.floor != null && (
          <div className="absolute bottom-2.5 right-2.5 sm:bottom-3 sm:right-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-black/75 px-2.5 py-1 sm:px-3 sm:py-1 text-xs sm:text-[13px] font-medium text-white shadow-sm backdrop-blur-md">
              <Layers className="h-3.5 w-3.5 text-white/80 shrink-0" aria-hidden="true" />
              <span>{apartment.floor === 0 ? 'Ground Floor' : `Floor ${apartment.floor}`}</span>
            </span>
          </div>
        )}
      </Link>

      {/* ── Info Body ── */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3">
        <div className="space-y-1.5">
          {/* Price Row: Full rental amount + /month */}
          <div className="flex items-baseline flex-wrap gap-x-1 leading-none">
            <span className="font-display text-[13px] sm:text-base font-bold text-navy-950 leading-tight">
              {formatPrice(apartment.price)}
            </span>
            <span className="text-[10px] sm:text-[11px] font-normal text-slate-400">
              /month
            </span>
          </div>

          {/* Desktop-only Apartment Name (Hidden on Mobile) */}
          <h3 className="hidden sm:block font-display text-[14px] font-semibold text-navy-950 truncate leading-snug group-hover:text-accent transition-colors">
            <Link to={`/apartments/${apartment.id}`} state={linkState} className="hover:underline">
              {apartment.name}
            </Link>
          </h3>

          {/* Mobile Vertical Specs (Bedroom, Bathroom, m²) */}
          <div className="flex flex-col gap-1 pt-0.5 text-[11px] text-slate-600 sm:hidden">
            <div className="flex items-center gap-1.5 font-medium leading-none">
              <BedDouble className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{apartment.bedrooms} Bedroom</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium leading-none">
              <Bath className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{apartment.bathrooms} Bathroom</span>
            </div>
            {apartment.size ? (
              <div className="flex items-center gap-1.5 font-medium text-slate-500 leading-none">
                <Maximize2 className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                <span>{apartment.size} m²</span>
              </div>
            ) : null}
          </div>

          {/* Desktop Specs Row (sm+) */}
          <div className="hidden sm:flex items-center gap-2 border-t border-[#F3F0EC] pt-2 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <BedDouble className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{apartment.bedrooms} Bedroom</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 font-medium">
              <Bath className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{apartment.bathrooms} Bathroom</span>
            </span>
            {apartment.size ? (
              <>
                <span className="text-slate-300">·</span>
                <span className="ml-auto font-medium text-slate-400">{apartment.size} m²</span>
              </>
            ) : null}
          </div>
        </div>

        {/* View Details Button */}
        <Link
          to={`/apartments/${apartment.id}`}
          state={linkState}
          className="mt-2.5 inline-flex w-full items-center justify-center rounded-lg border border-[#E9E5E0] bg-slate-50/70 py-1.5 text-[11px] sm:text-xs font-semibold text-navy-950 transition-colors hover:border-accent hover:bg-accent hover:text-white"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

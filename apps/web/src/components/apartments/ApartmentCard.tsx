import type { ApartmentListItemDto } from '@porchlight/shared';
import { Bath, BedDouble, Layers, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatAvailabilityLabel, formatPrice } from '../../utils/format';

function primaryImage(apartment: ApartmentListItemDto): string {
  const primary = apartment.images?.find((i) => i.isPrimary) ?? apartment.images?.[0];
  return primary?.url ?? '';
}

export function ApartmentCard({
  apartment,
  linkState,
}: {
  apartment: ApartmentListItemDto;
  linkState?: { backLabel?: string; backTo?: string };
}) {
  const imgSrc = primaryImage(apartment);

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

        {/* Availability Badge (Bottom Right Overlay - Compact Pill) */}
        <div className="absolute bottom-1.5 right-1.5 sm:bottom-2.5 sm:right-2.5 z-10 max-w-[calc(100%-12px)] sm:max-w-none">
          <span className="inline-flex items-center gap-1 sm:gap-1.5 rounded-full border border-emerald-200/90 bg-white/95 px-1.5 py-0.5 sm:px-2.5 sm:py-0.5 text-[9.5px] sm:text-[11.5px] font-normal sm:font-semibold text-emerald-800 shadow-2xs backdrop-blur-md whitespace-nowrap tracking-tight sm:tracking-normal">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500 ring-1 sm:ring-2 ring-emerald-500/25" />
            <span className="truncate">{formatAvailabilityLabel(apartment.availableFrom)}</span>
          </span>
        </div>
      </Link>

      {/* ── Info Body ── */}
      <div className="flex flex-1 flex-col justify-between p-2.5 sm:p-3 lg:p-3.5">
        <div className="space-y-1.5 lg:space-y-2">
          {/* Price Row: Full rental amount + /month */}
          <div className="flex items-baseline flex-wrap gap-x-1 leading-none">
            <span className="font-display text-[12.5px] sm:text-base font-bold text-navy-950 leading-tight">
              {formatPrice(apartment.price)}
            </span>
            <span className="text-[9.5px] sm:text-[11px] font-normal text-slate-400">
              /month
            </span>
          </div>

          {/* Desktop-only Apartment Name (Hidden on Mobile) */}
          <h3 className="hidden sm:block font-display text-[14px] lg:text-[15px] font-semibold text-navy-950 truncate leading-snug group-hover:text-accent transition-colors">
            <Link to={`/apartments/${apartment.id}`} state={linkState} className="hover:underline">
              {apartment.name}
            </Link>
          </h3>

          {/* Mobile Vertical Specs (Bedroom, Bathroom, Floor, m²) */}
          <div className="flex flex-col gap-1 pt-0.5 text-[10.5px] text-slate-600 sm:hidden">
            <div className="flex items-center gap-1.5 font-medium leading-none">
              <BedDouble className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{apartment.bedrooms} Bedroom</span>
            </div>
            <div className="flex items-center gap-1.5 font-medium leading-none">
              <Bath className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{apartment.bathrooms} Bathroom</span>
            </div>
            {apartment.floor != null && (
              <div className="flex items-center gap-1.5 font-medium leading-none">
                <Layers className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
                <span>{apartment.floor === 0 ? 'Ground Floor' : `Floor ${apartment.floor}`}</span>
              </div>
            )}
            {apartment.size ? (
              <div className="flex items-center gap-1.5 font-medium text-slate-500 leading-none">
                <Maximize2 className="h-3 w-3 shrink-0 text-slate-400" aria-hidden="true" />
                <span>{apartment.size} m²</span>
              </div>
            ) : null}
          </div>

          {/* Desktop Specs Row (sm+) */}
          <div className="hidden sm:flex items-center gap-2 lg:gap-2.5 border-t border-[#F3F0EC] pt-2 lg:pt-2.5 text-[11px] lg:text-[11.5px] text-slate-500">
            <span className="flex items-center gap-1 font-medium">
              <BedDouble className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{apartment.bedrooms} Bedroom</span>
            </span>
            <span className="text-slate-300">·</span>
            <span className="flex items-center gap-1 font-medium">
              <Bath className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
              <span>{apartment.bathrooms} Bathroom</span>
            </span>
            {apartment.floor != null && (
              <>
                <span className="text-slate-300">·</span>
                <span className="flex items-center gap-1 font-medium">
                  <Layers className="h-3.5 w-3.5 shrink-0 text-slate-400" aria-hidden="true" />
                  <span>{apartment.floor === 0 ? 'Ground Floor' : `Floor ${apartment.floor}`}</span>
                </span>
              </>
            )}
            {apartment.size ? (
              <>
                <span className="text-slate-300">·</span>
                <span className="ml-auto font-medium text-slate-400">{apartment.size} m²</span>
              </>
            ) : null}
          </div>
        </div>

        {/* View Details Button */}
        <div className="mt-2.5 sm:mt-3 lg:mt-3.5">
          <Link
            to={`/apartments/${apartment.id}`}
            state={linkState}
            className="inline-flex w-full items-center justify-center rounded-lg border border-[#E9E5E0] bg-white py-1.5 lg:py-2 text-[11px] sm:text-[13px] font-semibold text-navy-950 transition-colors hover:border-accent hover:bg-accent/5 hover:text-accent"
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}

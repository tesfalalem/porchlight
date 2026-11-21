import type { ApartmentListItemDto } from '@porchlight/shared';
import { Bath, BedDouble, MapPin, Maximize2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatPrice } from '../../utils/format';
import { StatusBadge } from '../common/StatusBadge';

function primaryImage(apartment: ApartmentListItemDto): string {
  const primary = apartment.images.find((i) => i.isPrimary) ?? apartment.images[0];
  return primary?.url ?? 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&q=80';
}

export function ApartmentCard({ apartment }: { apartment: ApartmentListItemDto }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:border-accent/40 hover:shadow-xl hover:-translate-y-1">
      <Link to={`/apartments/${apartment.id}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
        <img
          src={primaryImage(apartment)}
          alt={apartment.name}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950/50 via-transparent to-transparent" />
        <div className="absolute left-3 top-3">
          <StatusBadge status={apartment.availabilityStatus} availableFrom={apartment.availableFrom} />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-display text-xl font-medium text-navy-950 sm:text-2xl">
              <Link to={`/apartments/${apartment.id}`} className="hover:text-accent">
                {apartment.name}
              </Link>
            </h3>
            <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Unit {apartment.number} · {apartment.type}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-display text-lg text-accent">{formatPrice(apartment.price)}</p>
            <p className="text-[10px] uppercase tracking-wider text-slate-400">/month</p>
          </div>
        </div>

        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-600">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-accent" />
          {apartment.location}
        </p>

        <div className="mt-4 border-t border-slate-100 pt-4">
          <div className="grid grid-cols-3 gap-2 text-xs text-navy-800">
            {apartment.size ? (
              <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-2">
                <Maximize2 className="h-3.5 w-3.5 text-slate-400" />
                <span>{apartment.size} m²</span>
              </div>
            ) : null}
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-2">
              <BedDouble className="h-3.5 w-3.5 text-slate-400" />
              <span>{apartment.bedrooms} {apartment.bedrooms === 1 ? 'Bed' : 'Beds'}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-2">
              <Bath className="h-3.5 w-3.5 text-slate-400" />
              <span>{apartment.bathrooms} {apartment.bathrooms === 1 ? 'Bath' : 'Baths'}</span>
            </div>
          </div>
        </div>

        <Link
          to={`/apartments/${apartment.id}`}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-accent py-2.5 text-xs font-bold text-white shadow-sm shadow-accent/20 transition hover:bg-accent-hover active:scale-95"
        >
          View Details
        </Link>
      </div>
    </article>
  );
}

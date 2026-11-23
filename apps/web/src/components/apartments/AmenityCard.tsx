import type { AmenityDto } from '@porchlight/shared';
import { getAmenityIcon } from '../../utils/amenityIcons';

export function AmenityCard({ amenity }: { amenity: AmenityDto }) {
  const Icon = getAmenityIcon(amenity.icon ?? amenity.slug);
  return (
    <div className="flex items-center gap-3 py-3 border-b border-[#E9E5E0] last:border-0">
      <Icon className="h-4 w-4 shrink-0 text-accent" aria-hidden />
      <div className="min-w-0">
        <span className="block text-[13px] font-semibold text-navy-950">{amenity.name}</span>
        {amenity.description && (
          <span className="block text-[12px] text-slate-500 leading-snug">{amenity.description}</span>
        )}
      </div>
    </div>
  );
}

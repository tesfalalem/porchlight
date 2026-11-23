import type { ApartmentListItemDto } from '@porchlight/shared';
import { ApartmentCard } from './ApartmentCard';

export function ApartmentGrid({ apartments }: { apartments: ApartmentListItemDto[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-3">
      {apartments.map((a) => (
        <ApartmentCard key={a.id} apartment={a} />
      ))}
    </div>
  );
}



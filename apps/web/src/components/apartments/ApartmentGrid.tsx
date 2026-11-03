import type { ApartmentListItemDto } from '@porchlight/shared';
import { ApartmentCard } from './ApartmentCard';

export function ApartmentGrid({ apartments }: { apartments: ApartmentListItemDto[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {apartments.map((a) => (
        <ApartmentCard key={a.id} apartment={a} />
      ))}
    </div>
  );
}



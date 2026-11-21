import type { AmenityDto } from '@porchlight/shared';

export const BUILDING_AMENITIES: AmenityDto[] = [
  {
    id: 'security',
    name: '24/7 Security',
    slug: 'security',
    icon: 'shield',
    description: 'Round-the-clock security personnel',
  },
  {
    id: 'cctv',
    name: 'CCTV',
    slug: 'cctv',
    icon: 'camera',
    description: 'CCTV monitoring throughout the property',
  },
  {
    id: 'generator',
    name: 'Generator',
    slug: 'generator',
    icon: 'zap',
    description: 'Backup power during outages',
  },
  {
    id: 'laundry',
    name: 'In-unit Laundry',
    slug: 'laundry',
    icon: 'shirt',
    description: 'In-unit laundry facilities',
  },
  {
    id: 'washer-dryer',
    name: 'In-unit Washer & Dryer',
    slug: 'washer-dryer',
    icon: 'wind',
    description: 'Private washer and dryer in every unit',
  },
  {
    id: 'parking',
    name: 'Parking',
    slug: 'parking',
    icon: 'car',
    description: 'Dedicated parking for residents',
  },
];

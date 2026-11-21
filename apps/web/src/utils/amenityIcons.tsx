import {
  Camera,
  Car,
  Refrigerator,
  Shield,
  Shirt,
  Wifi,
  Wind,
  Zap,
  type LucideIcon,
} from 'lucide-react';

const MAP: Record<string, LucideIcon> = {
  car: Car,
  parking: Car,
  wifi: Wifi,
  zap: Zap,
  generator: Zap,
  shield: Shield,
  security: Shield,
  camera: Camera,
  cctv: Camera,
  shirt: Shirt,
  laundry: Shirt,
  refrigerator: Refrigerator,
  wind: Wind,
  'washer-dryer': Wind,
  washerdryer: Wind,
};

export function getAmenityIcon(slugOrIcon: string | null | undefined): LucideIcon {
  if (!slugOrIcon) return Shield;
  const key = slugOrIcon.toLowerCase();
  return MAP[key] ?? MAP[key.replace(/-/g, '')] ?? Shield;
}

import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { env } from '../src/config/env.js';

const prisma = new PrismaClient();

const AMENITIES = [
  { name: 'Parking', slug: 'parking', icon: 'car', description: 'Dedicated parking for residents' },
  { name: 'WiFi', slug: 'wifi', icon: 'wifi', description: 'High-speed internet connectivity' },
  { name: 'Generator', slug: 'generator', icon: 'zap', description: 'Backup power during outages' },
  { name: '24/7 Security', slug: 'security', icon: 'shield', description: 'Round-the-clock security personnel' },
  { name: 'CCTV', slug: 'cctv', icon: 'camera', description: 'CCTV monitoring throughout the property' },
  { name: 'In-unit Laundry', slug: 'laundry', icon: 'shirt', description: 'In-unit laundry facilities' },
  { name: 'Refrigerator', slug: 'refrigerator', icon: 'refrigerator', description: 'Full-size refrigerator included' },
  {
    name: 'In-unit Washer & Dryer',
    slug: 'washer-dryer',
    icon: 'wind',
    description: 'Private washer and dryer in every unit',
  },
];

const PLACEHOLDER_IMAGES = [
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200&q=80',
];

async function main() {
  const passwordHash = await bcrypt.hash(env.adminPassword, 12);
  await prisma.adminUser.upsert({
    where: { email: env.adminEmail },
    update: {},
    create: {
      email: env.adminEmail,
      passwordHash,
      name: env.adminName,
    },
  });

  for (const a of AMENITIES) {
    await prisma.amenity.upsert({
      where: { slug: a.slug },
      update: { name: a.name, icon: a.icon, description: a.description },
      create: a,
    });
  }

  const allAmenities = await prisma.amenity.findMany();
  const amenityIds = allAmenities.map((a) => a.id);

  const apartments = [
    {
      name: 'Bole Skyline Suite',
      number: 'A-101',
      type: '1 Bedroom',
      floor: 1,
      bedrooms: 1,
      bathrooms: 1,
      size: 65,
      price: 45000,
      availabilityStatus: 'Available',
      description:
        'A bright one-bedroom suite with modern furnishings, open living area, and views toward Bole. Ideal for professionals seeking comfort and convenience close to restaurants and business centers.',
    },
    {
      name: 'Porchlight Corner Residence',
      number: 'B-204',
      type: '2 Bedroom',
      floor: 2,
      bedrooms: 2,
      bathrooms: 2,
      size: 95,
      price: 72000,
      availabilityStatus: 'Upcoming',
      availableFrom: new Date('2026-11-01'),
      description:
        'Spacious two-bedroom corner unit with separate dining space, premium finishes, and in-unit laundry. Perfect for small families or shared living with room to work from home.',
    },
    {
      name: 'Executive Loft',
      number: 'C-305',
      type: 'Studio',
      floor: 3,
      bedrooms: 0,
      bathrooms: 1,
      size: 48,
      price: 38000,
      availabilityStatus: 'Occupied',
      description:
        'Efficient studio layout with smart storage, quality mattress and linens, and a dedicated work nook. A practical choice for short or extended stays in Bole.',
    },
  ];

  for (let i = 0; i < apartments.length; i++) {
    const apt = apartments[i];
    const existing = await prisma.apartment.findUnique({ where: { number: apt.number } });
    if (existing) continue;

    const created = await prisma.apartment.create({
      data: {
        name: apt.name,
        number: apt.number,
        description: apt.description,
        type: apt.type,
        location: 'Bole, Addis Ababa',
        floor: apt.floor,
        bedrooms: apt.bedrooms,
        bathrooms: apt.bathrooms,
        size: apt.size,
        price: apt.price,
        availabilityStatus: apt.availabilityStatus,
        availableFrom: 'availableFrom' in apt ? apt.availableFrom : null,
        apartmentAmenities: {
          create: amenityIds.map((amenityId) => ({ amenityId })),
        },
        images: {
          create: PLACEHOLDER_IMAGES.map((url, idx) => ({
            url,
            alt: `${apt.name} — photo ${idx + 1}`,
            sortOrder: idx,
            isPrimary: idx === 0,
          })),
        },
      },
    });
    console.log('Seeded apartment', created.number);
  }

  console.log('Seed completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
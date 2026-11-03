export const AVAILABILITY_STATUSES = [
  'Available',
  'Upcoming',
  'Occupied',
] as const;

export const INQUIRY_STATUSES = [
  'New',
  'Contacted',
  'In Progress',
  'Resolved',
  'Closed',
] as const;

export const COMPANY = {
  name: 'Porchlight Apartment',
  tagline: 'Live Better. Here in Bole.',
  location: 'Bole, Addis Ababa, Ethiopia',
  address: 'Bole, Addis Ababa, Ethiopia',
  phone: '+251 911 000 000',
  email: 'info@porchlight.com',
  whatsapp: '+251911000000',
  workingHours: 'Mon–Sat: 9:00 AM – 6:00 PM',
  social: {
    facebook: 'https://web.facebook.com/profile.php?id=61576106316704',
    instagram: 'https://www.instagram.com/porchlight_apartments/',
    linkedin: 'https://linkedin.com/company/porchlightapartment',
  },
} as const;

export const ABOUT_COPY = {
  intro:
    'Porchlight Apartment is a modern furnished apartment property located in Bole, Addis Ababa, Ethiopia, offering comfortable and convenient living in one of the city\'s well-known areas. Our apartments are designed for people who value comfort, convenience, security, and a quality living environment. Each apartment is fully furnished and equipped with essential facilities to make everyday living easier.',
  location:
    'Located in Bole, Porchlight Apartment provides convenient access to restaurants, shopping areas, business centers, transportation, and other important services in Addis Ababa. Whether staying for work, business, or everyday living, our goal is to provide a welcoming and comfortable place that feels like home.',
  commitment:
    'At Porchlight Apartment, we focus on providing a clean, comfortable, and convenient living experience for our residents. Your comfort is our priority.',
} as const;

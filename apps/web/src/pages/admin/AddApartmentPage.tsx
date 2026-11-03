import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  Bath,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  Clock,
  ImagePlus,
  Layers,
  MapPin,
  Maximize2,
  Sparkles,
  Star,
  Trash2,
  UploadCloud,
  AlertCircle,
} from 'lucide-react';
import { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import type { AvailabilityStatus } from '@porchlight/shared';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { createApartment } from '../../services/apartmentsApi';
import { fetchAmenities } from '../../services/amenitiesApi';
import { formatPrice } from '../../utils/format';
import { getApiErrorMessage } from '../../lib/apiClient';
import { getAmenityIcon } from '../../utils/amenityIcons';

const COMMON_FACILITIES = [
  { name: '24/7 Security', slug: 'security', icon: 'shield', description: 'Round-the-clock security personnel' },
  { name: 'Generator', slug: 'generator', icon: 'zap', description: 'Standby backup power generator during outages' },
  { name: 'CCTV', slug: 'cctv', icon: 'camera', description: 'Comprehensive property surveillance cameras' },
  { name: 'Parking', slug: 'parking', icon: 'car', description: 'Dedicated resident vehicle parking space' },
];

const UNIT_FACILITIES = [
  { name: 'Refrigerator', slug: 'refrigerator', icon: 'refrigerator', description: 'Full-size in-unit refrigerator' },
  { name: 'In-unit Laundry', slug: 'laundry', icon: 'shirt', description: 'Private in-unit laundry space' },
  { name: 'In-unit Washer & Dryer', slug: 'washer-dryer', icon: 'wind', description: 'Dedicated in-suite washer and dryer' },
  { name: 'WiFi', slug: 'wifi', icon: 'wifi', description: 'High-speed wireless internet connection' },
];

interface ImageItem {
  id: string;
  url: string;
  alt: string;
  isPrimary: boolean;
}

const APARTMENT_TYPES = [
  '2 Bedroom',
  '3 Bedroom',
] as const;

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1200&q=80';

export function AddApartmentPage() {
  useDocumentTitle('Add New Apartment — Management');
  const navigate = useNavigate();
  const qc = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [number, setNumber] = useState('');
  const [name, setName] = useState('');
  const [hasCustomName, setHasCustomName] = useState(false);
  const [type, setType] = useState('');
  const [location, setLocation] = useState('Bole, Addis Ababa');
  const [floor, setFloor] = useState('2');
  const [bedrooms, setBedrooms] = useState('2');
  const [bathrooms, setBathrooms] = useState('');
  const [size, setSize] = useState('95');
  const [price, setPrice] = useState('65000');
  const [description, setDescription] = useState(
    'A beautifully furnished modern residence featuring open living spaces, high-end kitchen appliances, and 24/7 backup power located in central Bole.',
  );
  const [availabilityStatus, setAvailabilityStatus] = useState<AvailabilityStatus>('Available');
  const [availableFrom, setAvailableFrom] = useState('');

  // Images state
  const [images, setImages] = useState<ImageItem[]>([
    {
      id: 'img-1',
      url: DEFAULT_IMAGE,
      alt: 'Living room view',
      isPrimary: true,
    },
  ]);
  const [urlInput, setUrlInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch amenities to send IDs on creation
  const amenitiesQuery = useQuery({
    queryKey: ['amenities'],
    queryFn: () => fetchAmenities(),
  });

  // Handle auto-naming when unit number changes unless user typed custom name
  const handleNumberChange = (val: string) => {
    setNumber(val);
    if (!hasCustomName) {
      setName(val.trim() ? `Porchlight Suite ${val.trim()}` : '');
    }
  };

  const handleNameChange = (val: string) => {
    setName(val);
    setHasCustomName(true);
  };

  // Image actions
  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setImages((prev) => [
          ...prev,
          {
            id: `upload-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            url: dataUrl,
            alt: file.name,
            isPrimary: prev.length === 0,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const addImageUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImages((prev) => [
      ...prev,
      {
        id: `url-${Date.now()}`,
        url: trimmed,
        alt: `Apartment photo ${prev.length + 1}`,
        isPrimary: prev.length === 0,
      },
    ]);
    setUrlInput('');
  };

  const setPrimaryImage = (id: string) => {
    setImages((prev) =>
      prev.map((img) => ({
        ...img,
        isPrimary: img.id === id,
      })),
    );
  };

  const removeImage = (id: string) => {
    setImages((prev) => {
      const next = prev.filter((img) => img.id !== id);
      if (next.length > 0 && !next.some((i) => i.isPrimary)) {
        next[0].isPrimary = true;
      }
      return next;
    });
  };

  // Mutation
  const mutation = useMutation({
    mutationFn: () => {
      const parsedPrice = Number(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        throw new Error('Please enter a valid monthly price');
      }

      if (!type.trim()) {
        throw new Error('Please select an apartment classification (2 Bedroom or 3 Bedroom)');
      }

      if (!bathrooms.trim()) {
        throw new Error('Please select the number of bathrooms (2 or 3 Bathrooms)');
      }

      const finalName = name.trim() || `Unit ${number.trim()}`;

      return createApartment({
        name: finalName,
        number: number.trim(),
        description: description.trim(),
        type,
        location: location.trim(),
        floor: floor ? Number(floor) : null,
        bedrooms: Number(bedrooms),
        bathrooms: Number(bathrooms),
        size: size ? Number(size) : null,
        price: parsedPrice,
        availabilityStatus,
        availableFrom: availabilityStatus === 'Upcoming' && availableFrom ? availableFrom : null,
        amenityIds: (amenitiesQuery.data ?? []).map((a) => a.id),
        images: images.map((img, idx) => ({
          url: img.url,
          alt: img.alt || `${finalName} photo`,
          sortOrder: idx,
          isPrimary: img.isPrimary,
        })),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'apartments'] });
      await qc.invalidateQueries({ queryKey: ['apartments'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/admin/apartments');
    },
    onError: (e) => {
      setError(getApiErrorMessage(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  // Form submission handler with clear validation messages
  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);

    if (!number.trim()) {
      setError('Please enter a Unit Number (e.g. A-101 or B-204).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!type.trim()) {
      setError('Please select an Apartment Classification (2 Bedroom or 3 Bedroom).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!bathrooms.trim()) {
      setError('Please select the number of Bathrooms (2 or 3 Bathrooms).');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const parsedPrice = Number(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      setError('Please enter a valid monthly rent in ETB.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (!description.trim()) {
      setError('Please provide an apartment description.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (images.length === 0) {
      setError('Please add at least one photograph for this apartment.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    mutation.mutate();
  };

  return (
    <div className="space-y-8 pb-16">
      {/* ── TOP HEADER & BREADCRUMBS ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/apartments"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-navy-950"
            title="Return to apartments"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                <Sparkles className="h-3 w-3" /> Inventory Management
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-medium text-slate-500">New Unit</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-navy-950 sm:text-3xl">
              Add New Apartment
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/apartments"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => handleSubmit()}
            disabled={mutation.isPending}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/25 transition hover:bg-accent-hover active:scale-95 disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            {mutation.isPending ? 'Adding Apartment…' : 'Add Apartment'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold">Unable to create apartment</p>
            <p className="mt-0.5 text-xs text-red-600">{error}</p>
          </div>
        </div>
      ) : null}

      {/* ── MAIN WORKSPACE ── */}
      <div className="mx-auto max-w-4xl">
        <form onSubmit={handleSubmit} noValidate className="space-y-6">
          {/* Card 1: Identity & Class */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900/5 text-navy-900">
                <Building2 className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-bold text-navy-950">1. Unit Details & Identification</h2>
            </div>

            <div className="mt-5 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Unit Number <span className="text-red-500">*</span>
                  </span>
                  <input
                    required
                    type="text"
                    value={number}
                    onChange={(e) => handleNumberChange(e.target.value)}
                    placeholder="e.g. A-101, B-204"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                  />
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Public Residence Name
                  </span>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => handleNameChange(e.target.value)}
                    placeholder="e.g. Bole Skyline Suite"
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                  />
                </label>
              </div>

              {/* Classification & Bathrooms Side-by-Side */}
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Apartment Classification <span className="text-red-500">*</span>
                  </span>
                  <select
                    required
                    value={type}
                    onChange={(e) => {
                      const val = e.target.value;
                      setType(val);
                      if (val === '2 Bedroom') setBedrooms('2');
                      if (val === '3 Bedroom') setBedrooms('3');
                    }}
                    className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 bg-white"
                  >
                    <option value="">— None —</option>
                    {APARTMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Bathrooms <span className="text-red-500">*</span>
                  </span>
                  <div className="relative mt-1.5">
                    <Bath className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-accent" />
                    <select
                      required
                      value={bathrooms}
                      onChange={(e) => setBathrooms(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-semibold text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 bg-white"
                    >
                      <option value="">— None —</option>
                      <option value="2">2 Bathrooms</option>
                      <option value="3">3 Bathrooms</option>
                    </select>
                  </div>
                </label>
              </div>

              {/* Location, Floor Level & Size */}
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Location
                  </span>
                  <div className="relative mt-1.5">
                    <MapPin className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-accent" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="Bole, Addis Ababa"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Floor Level
                  </span>
                  <div className="relative mt-1.5">
                    <Layers className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      value={floor}
                      onChange={(e) => setFloor(e.target.value)}
                      placeholder="e.g. 2"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Floor Area (m²)
                  </span>
                  <div className="relative mt-1.5">
                    <Maximize2 className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      placeholder="95"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-8 py-2.5 text-sm font-semibold text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                    <span className="pointer-events-none absolute right-3 top-3 text-xs font-bold text-slate-400">
                      m²
                    </span>
                  </div>
                </label>
              </div>

              {/* Description */}
              <label className="block">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Editorial Description <span className="text-red-500">*</span>
                  </span>
                  <span className="text-[11px] text-slate-400">{description.length} characters</span>
                </div>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Detail the layout, natural lighting, work desks, kitchen features, and ambience…"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm leading-relaxed text-slate-700 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                />
              </label>
            </div>
          </section>

          {/* Card 2: Pricing & Availability */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <CheckCircle2 className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-bold text-navy-950">2. Pricing & Availability Status</h2>
            </div>

            <div className="mt-5 space-y-5">
              {/* Monthly Rate */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Monthly Rent (ETB) <span className="text-red-500">*</span>
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <span className="pointer-events-none absolute left-4 text-xs font-extrabold text-accent">
                    ETB
                  </span>
                  <input
                    required
                    type="number"
                    min="0"
                    step="any"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="45000"
                    className="w-full rounded-xl border border-slate-200 pl-14 pr-24 py-3 text-lg font-extrabold text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                  />
                  <span className="pointer-events-none absolute right-4 text-xs font-semibold text-slate-400">
                    / month
                  </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                  <p className="text-xs text-slate-500">
                    Formatted rate:{' '}
                    <span className="font-bold text-navy-900">
                      {formatPrice(Number(price) || 0)} ETB
                    </span>
                  </p>
                </div>
              </div>

              {/* Status Visual Selection Cards */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Current Availability
                </label>
                <div className="mt-2 grid gap-3 sm:grid-cols-3">
                  {[
                    {
                      key: 'Available',
                      title: 'Available Now',
                      icon: CheckCircle2,
                      activeCls: 'border-emerald-500 bg-emerald-50/50 text-emerald-950 ring-2 ring-emerald-500/20',
                      badgeCls: 'bg-emerald-100 text-emerald-700',
                    },
                    {
                      key: 'Upcoming',
                      title: 'Upcoming',
                      icon: Clock,
                      activeCls: 'border-amber-500 bg-amber-50/50 text-amber-950 ring-2 ring-amber-500/20',
                      badgeCls: 'bg-amber-100 text-amber-700',
                    },
                    {
                      key: 'Occupied',
                      title: 'Occupied',
                      icon: Building2,
                      activeCls: 'border-sky-500 bg-sky-50/50 text-sky-950 ring-2 ring-sky-500/20',
                      badgeCls: 'bg-sky-100 text-sky-700',
                    },
                  ].map((s) => {
                    const Icon = s.icon;
                    const isSelected = availabilityStatus === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setAvailabilityStatus(s.key as AvailabilityStatus)}
                        className={`flex flex-col items-start rounded-xl border p-4 text-left transition ${
                          isSelected
                            ? s.activeCls
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <Icon className={`h-4 w-4 ${isSelected ? 'text-accent' : 'text-slate-400'}`} />
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.badgeCls}`}>
                            {s.key}
                          </span>
                        </div>
                        <p className="mt-2 text-sm font-bold">{s.title}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Available From Field */}
              {availabilityStatus === 'Upcoming' && (
                <div className="rounded-xl border border-amber-200 bg-amber-50/50 p-4">
                  <label className="block">
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-900">
                      Available From Date
                    </span>
                    <div className="relative mt-1.5 max-w-xs">
                      <Calendar className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-amber-600" />
                      <input
                        type="date"
                        value={availableFrom}
                        onChange={(e) => setAvailableFrom(e.target.value)}
                        className="w-full rounded-xl border border-amber-300 bg-white pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                      />
                    </div>
                  </label>
                </div>
              )}
            </div>
          </section>


          {/* Card 3: Media & Visual Gallery */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900/5 text-navy-900">
                  <ImagePlus className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-navy-950">3. Photography & Visual Gallery</h2>
                </div>
              </div>
              <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-bold text-slate-700">
                {images.length} {images.length === 1 ? 'Photo' : 'Photos'}
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                handleFiles(e.dataTransfer.files);
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-5 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 text-center transition ${
                isDragging
                  ? 'border-accent bg-accent/5'
                  : 'border-slate-200 bg-slate-50/50 hover:border-accent/40 hover:bg-slate-50'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm border border-slate-200 text-accent">
                <UploadCloud className="h-6 w-6" />
              </div>
              <p className="mt-3 text-sm font-bold text-navy-950">
                Click to upload photos or drag and drop
              </p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {/* URL input fallback */}
            <div className="mt-4 flex gap-2">
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="Or paste an image web link (https://...)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
                className="flex-1 rounded-xl border border-slate-200 px-4 py-2 text-xs font-medium text-slate-700 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
              />
              <button
                type="button"
                onClick={addImageUrl}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-navy-900 transition hover:bg-slate-50"
              >
                Add Link
              </button>
            </div>

            {/* Gallery Thumbnails */}
            {images.length > 0 && (
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={`group relative aspect-[4/3] overflow-hidden rounded-xl border bg-slate-100 ${
                      img.isPrimary ? 'border-accent ring-2 ring-accent/30' : 'border-slate-200'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition group-hover:opacity-100" />

                    {/* Star / Primary cover badge */}
                    {img.isPrimary ? (
                      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-md bg-accent px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                        <Star className="h-3 w-3 fill-white" /> Cover Photo
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPrimaryImage(img.id);
                        }}
                        className="absolute left-2 top-2 hidden rounded-md bg-white/90 p-1.5 text-slate-700 shadow-sm transition hover:bg-white hover:text-accent group-hover:block"
                        title="Set as primary cover"
                      >
                        <Star className="h-3.5 w-3.5" />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeImage(img.id);
                      }}
                      className="absolute right-2 top-2 rounded-md bg-black/60 p-1.5 text-white transition hover:bg-red-600"
                      title="Remove image"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Card 4: Standard Included Amenities & Features */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-navy-950">4. Amenities & Facilities</h2>
                </div>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 px-3 py-1 text-xs font-bold text-emerald-700">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" /> All 8 Standard
              </span>
            </div>

            <div className="mt-5 space-y-6">
              {/* Common / Building Facilities */}
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Building2 className="h-4 w-4 text-accent" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Common Building Facilities
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {COMMON_FACILITIES.map((facility) => {
                    const Icon = getAmenityIcon(facility.slug);
                    return (
                      <div
                        key={facility.name}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-accent shadow-xs">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-navy-950">{facility.name}</p>
                          </div>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Check className="h-3 w-3 stroke-[3]" /> Common
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Private In-Unit Amenities */}
              <div className="border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-4 w-4 text-accent" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Private In-Unit Amenities
                  </h3>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {UNIT_FACILITIES.map((facility) => {
                    const Icon = getAmenityIcon(facility.slug);
                    return (
                      <div
                        key={facility.name}
                        className="flex items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 transition"
                      >
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white border border-slate-200 text-accent shadow-xs">
                            <Icon className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-navy-950">{facility.name}</p>
                          </div>
                        </div>
                        <span className="shrink-0 inline-flex items-center gap-1 rounded-md bg-emerald-100/70 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                          <Check className="h-3 w-3 stroke-[3]" /> In-Unit
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="flex items-center justify-between pt-4">
            <Link
              to="/admin/apartments"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={mutation.isPending}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-8 py-3 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hover active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="h-4 w-4" />
              {mutation.isPending ? 'Adding Apartment…' : 'Add Apartment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

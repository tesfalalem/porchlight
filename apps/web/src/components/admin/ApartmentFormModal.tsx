import type { AmenityDto, ApartmentDetailDto } from '@porchlight/shared';
import { zodResolver } from '@hookform/resolvers/zod';
import { ImagePlus, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Modal } from '../common/Modal';

const schema = z.object({
  number: z.string().min(1),
  description: z.string().min(1),
  location: z.string().min(1),
  floor: z.coerce.number().optional().nullable(),
  bedrooms: z.coerce.number().min(0),
  size: z.coerce.number().optional().nullable(),
  price: z.coerce.number().min(0),
  availabilityStatus: z.enum(['Available', 'Occupied', 'Upcoming', 'Coming Soon']),
  availableFrom: z.string().optional(),
  amenityIds: z.array(z.string()).optional(),
  imageUrls: z.string(),
});

type FormValues = z.infer<typeof schema>;

export function ApartmentFormModal({
  open,
  onClose,
  amenities,
  initial,
  onSubmit,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  amenities: AmenityDto[];
  initial?: ApartmentDetailDto | null;
  onSubmit: (payload: Record<string, unknown>) => void;
  loading?: boolean;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedPreviews, setUploadedPreviews] = useState<{ name: string; dataUrl: string }[]>([]);

  const {
    register,
    handleSubmit,
    getValues,
    setValue,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    values: initial
      ? {
          number: initial.number,
          description: initial.description,
          location: initial.location,
          floor: initial.floor,
          bedrooms: initial.bedrooms,
          size: initial.size,
          price: initial.price,
          availabilityStatus: initial.availabilityStatus,
          availableFrom: initial.availableFrom?.slice(0, 10) ?? '',
          amenityIds: [],
          imageUrls: initial.images.map((i) => i.url).join('\n'),
        }
      : {
          number: '',
          description: '',
          location: 'Bole, Addis Ababa',
          floor: null,
          bedrooms: 1,
          size: null,
          price: 0,
          availabilityStatus: 'Available',
          availableFrom: '',
          amenityIds: [],
          imageUrls: '',
        },
  });

  // Handle file uploads — convert to data URLs and append to imageUrls textarea
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        setUploadedPreviews((prev) => [...prev, { name: file.name, dataUrl }]);
        const current = getValues('imageUrls').trim();
        setValue('imageUrls', current ? `${current}\n${dataUrl}` : dataUrl);
      };
      reader.readAsDataURL(file);
    });

    // Reset file input so same file can be re-selected
    e.target.value = '';
  };

  const removePreview = (index: number) => {
    const removed = uploadedPreviews[index];
    setUploadedPreviews((prev) => prev.filter((_, i) => i !== index));
    const current = getValues('imageUrls');
    const updated = current
      .split('\n')
      .filter((line) => line.trim() !== removed.dataUrl)
      .join('\n');
    setValue('imageUrls', updated);
  };

  const submit = (values: FormValues) => {
    const urls = values.imageUrls
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);
    onSubmit({
      ...values,
      name: initial?.name ?? `Unit ${values.number}`,
      type: initial?.type ?? 'Apartment',
      bathrooms: initial?.bathrooms ?? 1,
      floor: values.floor ?? null,
      size: values.size ?? null,
      availableFrom: values.availableFrom || null,
      amenityIds: amenities.map((a) => a.id),
      images: urls.map((url, index) => ({
        url,
        sortOrder: index,
        isPrimary: index === 0,
      })),
    });
  };

  return (
    <Modal open={open} title={initial ? 'Edit apartment' : 'Add apartment'} onClose={onClose}>
      <form onSubmit={handleSubmit(submit)} className="space-y-3 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block sm:col-span-2">
            Number
            <input {...register('number')} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
        </div>
        <label className="block">
          Description
          <textarea rows={3} {...register('description')} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            Location
            <input {...register('location')} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block">
            Floor
            <input type="number" {...register('floor')} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block">
            Price
            <input type="number" {...register('price')} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block">
            Bedrooms
            <input type="number" {...register('bedrooms')} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block">
            Size (m²)
            <input type="number" {...register('size')} className="mt-1 w-full rounded-lg border px-3 py-2" />
          </label>
          <label className="block">
            Availability
            <select {...register('availabilityStatus')} className="mt-1 w-full rounded-lg border px-3 py-2">
              <option value="Available">Available Now</option>
              <option value="Upcoming">Upcoming (set date below)</option>
              <option value="Occupied">Currently Unavailable</option>
            </select>
          </label>
        </div>
        <label className="block">
          Available from
          <input type="date" {...register('availableFrom')} className="mt-1 w-full rounded-lg border px-3 py-2" />
        </label>

        {/* Images section */}
        <div className="space-y-2">
          <p className="font-medium">Images</p>

          {/* Upload button */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 py-3 text-sm text-slate-500 transition hover:border-navy-900/40 hover:bg-slate-50 hover:text-navy-900"
          >
            <ImagePlus className="h-4 w-4" />
            Upload images from device
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleFileChange}
          />

          {/* Uploaded previews */}
          {uploadedPreviews.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {uploadedPreviews.map((p, i) => (
                <div key={i} className="relative h-16 w-20 overflow-hidden rounded-lg border border-slate-200">
                  <img src={p.dataUrl} alt={p.name} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removePreview(i)}
                    className="absolute right-0.5 top-0.5 rounded-full bg-black/60 p-0.5 text-white hover:bg-black/80"
                    aria-label="Remove"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* URL textarea — smaller */}
          <label className="block">
            <span className="text-xs text-slate-500">Or paste image URLs (one per line)</span>
            <textarea
              rows={2}
              {...register('imageUrls')}
              className="mt-1 w-full rounded-lg border px-3 py-2 font-mono text-xs"
              placeholder="https://example.com/image.jpg"
            />
          </label>
        </div>

        {Object.keys(errors).length ? (
          <p className="text-xs text-red-600">Please check required fields.</p>
        ) : null}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-lg border px-4 py-2">
            Cancel
          </button>
          <button type="submit" disabled={loading} className="rounded-lg bg-navy-900 px-4 py-2 text-white disabled:opacity-60">
            {loading ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

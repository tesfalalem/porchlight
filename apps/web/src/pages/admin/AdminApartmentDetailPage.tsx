import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AVAILABILITY_STATUSES } from '@porchlight/shared';
import {
  ArrowLeft, Bath, BedDouble, Check, ChevronRight, DollarSign,
  ExternalLink, ImagePlus, MapPin, Maximize2,
  Pencil, Trash2, X, AlertCircle
} from 'lucide-react';
import { useState, useRef } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { deleteApartment, fetchApartment, updateApartment } from '../../services/apartmentsApi';
import { fetchAmenities } from '../../services/amenitiesApi';
import { fetchInquiries } from '../../services/inquiriesApi';
import { formatPrice } from '../../utils/format';
import { getApiErrorMessage } from '../../lib/apiClient';

const inputCls =
  'mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 bg-white';

export function AdminApartmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [statusSuccessToast, setStatusSuccessToast] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const query = useQuery({
    queryKey: ['admin', 'apartment', id],
    queryFn: () => fetchApartment(id!),
    enabled: Boolean(id),
  });

  const amenitiesQuery = useQuery({
    queryKey: ['amenities'],
    queryFn: fetchAmenities,
  });

  const inquiriesQuery = useQuery({
    queryKey: ['admin', 'inquiries'],
    queryFn: () => fetchInquiries(),
  });

  const apt = query.data;

  // Attached inquiries for this apartment
  const unitInquiries = (inquiriesQuery.data ?? []).filter((inq) => inq.apartmentId === id);

  // Edit Form State
  const [editForm, setEditForm] = useState({
    number: '',
    name: '',
    description: '',
    location: '',
    floor: '',
    bedrooms: '',
    bathrooms: '1',
    size: '',
    price: '',
    availabilityStatus: 'Available',
    availableFrom: '',
  });
  const [uploadedPreviews, setUploadedPreviews] = useState<{ dataUrl: string }[]>([]);
  const [imageUrls, setImageUrls] = useState('');

  // Quick Status Form State (in sidebar)
  const [quickStatus, setQuickStatus] = useState('');
  const [quickAvailableFrom, setQuickAvailableFrom] = useState('');

  useDocumentTitle(apt ? `${apt.name} (Unit ${apt.number}) — Admin` : 'Apartment Details');

  // Sync quick status when apt loads
  const currentStatus = quickStatus || (apt?.availabilityStatus ?? 'Available');
  const currentAvailDate = quickAvailableFrom !== '' ? quickAvailableFrom : (apt?.availableFrom?.slice(0, 10) ?? '');

  const startEdit = () => {
    if (!apt) return;
    setEditForm({
      number: apt.number,
      name: apt.name,
      description: apt.description,
      location: apt.location,
      floor: apt.floor?.toString() ?? '',
      bedrooms: apt.bedrooms.toString(),
      bathrooms: apt.bathrooms?.toString() ?? '1',
      size: apt.size?.toString() ?? '',
      price: Number(apt.price).toString(),
      availabilityStatus: apt.availabilityStatus,
      availableFrom: apt.availableFrom?.slice(0, 10) ?? '',
    });
    setUploadedPreviews([]);
    setImageUrls('');
    setSaveError(null);
    setIsEditModalOpen(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = () => setUploadedPreviews((prev) => [...prev, { dataUrl: reader.result as string }]);
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const updateMutation = useMutation({
    mutationFn: () => {
      const urls = [
        ...uploadedPreviews.map((p) => p.dataUrl),
        ...imageUrls.split('\n').map((s) => s.trim()).filter(Boolean),
      ];
      const existingImages = apt?.images.map((i) => i.url) ?? [];
      const finalUrls = urls.length > 0 ? urls : existingImages;

      return updateApartment(id!, {
        name: editForm.name || `Unit ${editForm.number}`,
        number: editForm.number,
        description: editForm.description,
        type: apt?.type ?? 'Apartment',
        location: editForm.location,
        floor: editForm.floor ? Number(editForm.floor) : null,
        bedrooms: Number(editForm.bedrooms),
        bathrooms: Number(editForm.bathrooms) || 1,
        size: editForm.size ? Number(editForm.size) : null,
        price: Number(editForm.price),
        availabilityStatus: editForm.availabilityStatus,
        availableFrom: editForm.availableFrom || null,
        amenityIds: amenitiesQuery.data?.map((a) => a.id) ?? [],
        images: finalUrls.map((url, i) => ({ url, sortOrder: i, isPrimary: i === 0 })),
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'apartment', id] });
      await qc.invalidateQueries({ queryKey: ['admin', 'apartments'] });
      await qc.invalidateQueries({ queryKey: ['apartments'] });
      setIsEditModalOpen(false);
      setSaveError(null);
      setUploadedPreviews([]);
      setImageUrls('');
    },
    onError: (e) => setSaveError(getApiErrorMessage(e)),
  });

  // Quick Status update mutation
  const quickStatusMutation = useMutation({
    mutationFn: (newStatus: string) =>
      updateApartment(id!, {
        ...apt,
        availabilityStatus: newStatus,
        availableFrom: currentAvailDate || null,
        images: apt?.images ?? [],
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'apartment', id] });
      await qc.invalidateQueries({ queryKey: ['admin', 'apartments'] });
      await qc.invalidateQueries({ queryKey: ['apartments'] });
      setStatusSuccessToast(true);
      setTimeout(() => setStatusSuccessToast(false), 2500);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteApartment(id!),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'apartments'] });
      navigate('/admin/apartments');
    },
  });

  if (query.isLoading) return <LoadingState label="Loading apartment details…" />;

  if (query.isError || !apt) {
    return (
      <div className="py-16 text-center">
        <ErrorState message="Could not load apartment." onRetry={() => void query.refetch()} />
        <Link to="/admin/apartments" className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Apartments
        </Link>
      </div>
    );
  }

  const images = apt.images && apt.images.length > 0 ? apt.images : [{ id: 'default', url: '/building.jpg', isPrimary: true, sortOrder: 0 }];
  const currentImg = images[activeImageIndex] ?? images[0];

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* ── BREADCRUMBS & TOP BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link to="/admin/apartments" className="transition hover:text-navy-900">
              Apartments
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-navy-900 font-bold">Unit {apt.number}</span>
          </nav>
          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-950">
              {apt.name}
            </h1>
            <span className="rounded-xl bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600 border border-slate-200">
              Unit {apt.number}
            </span>
            <StatusBadge status={apt.availabilityStatus} availableFrom={apt.availableFrom} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Link
            to={`/apartments/${apt.id}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
          >
            <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
            Public View
          </Link>
          <button
            type="button"
            onClick={startEdit}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-md shadow-accent/20 transition hover:bg-accent-hover active:scale-95"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Unit
          </button>
        </div>
      </div>

      {/* ── HERO METRIC TILES (4 CARDS) ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Monthly Rent */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Monthly Rent</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-navy-900">{formatPrice(apt.price)}</p>
          <p className="text-[11px] font-semibold text-slate-400">Fixed rate</p>
        </div>

        {/* Bedrooms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bedrooms</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <BedDouble className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-navy-900">{apt.bedrooms}</p>
          <p className="text-[11px] font-semibold text-slate-400">Furnished</p>
        </div>

        {/* Bathrooms */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Bathrooms</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Bath className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-navy-900">{apt.bathrooms ?? 1}</p>
          <p className="text-[11px] font-semibold text-slate-400">Full bath</p>
        </div>

        {/* Floor & Size */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Floor & Size</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Maximize2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-2xl font-black text-navy-900">
            {apt.size ? `${apt.size} m²` : 'Standard'}
          </p>
          <p className="text-[11px] font-semibold text-slate-400">
            {apt.floor !== null && apt.floor !== undefined ? `Floor ${apt.floor}` : 'Ground Floor'}
          </p>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN CANVAS & SIDEBAR ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── MAIN CONTENT (LEFT 65%) ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Media & Interactive Gallery */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl bg-slate-100">
              <img
                src={currentImg.url}
                alt={apt.name}
                className="h-full w-full object-cover transition-transform duration-300"
              />
              <div className="absolute bottom-3 right-3 rounded-full bg-navy-950/70 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
                {activeImageIndex + 1} / {images.length}
              </div>
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="mt-3 flex gap-2.5 overflow-x-auto pb-1">
                {images.map((img, idx) => (
                  <button
                    key={img.id || idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-xl border-2 transition ${
                      activeImageIndex === idx ? 'border-accent shadow-md scale-95' : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img.url} alt="" className="h-full w-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Description & Overview */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-navy-900">Overview & Description</h2>
            <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-600">
              {apt.description || 'No description provided for this apartment.'}
            </p>
          </div>

          {/* Amenities Chips */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-base font-bold text-navy-900">Included Amenities</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {apt.amenities && apt.amenities.length > 0 ? (
                apt.amenities.map((am) => (
                  <span
                    key={am.id}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs font-semibold text-slate-700"
                  >
                    <Check className="h-3.5 w-3.5 text-accent" />
                    {am.name}
                  </span>
                ))
              ) : (
                <p className="text-xs italic text-slate-400">Standard full furnishing included.</p>
              )}
            </div>
          </div>

          {/* Attached Inquiries for this unit */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-900">Inquiries For This Unit</h2>
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                {unitInquiries.length} {unitInquiries.length === 1 ? 'Lead' : 'Leads'}
              </span>
            </div>

            {unitInquiries.length > 0 ? (
              <div className="mt-4 divide-y divide-slate-100">
                {unitInquiries.map((inq) => (
                  <div key={inq.id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                    <div>
                      <Link
                        to={`/admin/inquiries/${inq.id}`}
                        className="font-bold text-sm text-navy-900 hover:text-accent transition"
                      >
                        {inq.subject}
                      </Link>
                      <p className="text-xs text-slate-400 mt-0.5">
                        From {inq.customer?.name ?? 'Anonymous'} · {new Date(inq.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={inq.status} />
                      <Link
                        to={`/admin/inquiries/${inq.id}`}
                        className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-3 text-xs italic text-slate-400">
                No inquiries specifically tied to this unit yet.
              </p>
            )}
          </div>
        </div>

        {/* ── ACTION & SUMMARY RAIL (RIGHT 35%) ── */}
        <div className="space-y-6">
          {/* Quick Status Control */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-navy-900">Status & Availability</h2>

            {statusSuccessToast && (
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-2.5 text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                <Check className="h-4 w-4 text-emerald-600" /> Status updated successfully!
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Current Status
              </label>
              <select
                value={currentStatus}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickStatus(val);
                  quickStatusMutation.mutate(val);
                }}
                disabled={quickStatusMutation.isPending}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-navy-900 focus:border-accent focus:bg-white focus:outline-none"
              >
                {AVAILABILITY_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400">
                Available From
              </label>
              <input
                type="date"
                value={currentAvailDate}
                onChange={(e) => {
                  const val = e.target.value;
                  setQuickAvailableFrom(val);
                  updateApartment(id!, { ...apt, availableFrom: val || null }).then(() => {
                    qc.invalidateQueries({ queryKey: ['admin', 'apartment', id] });
                  });
                }}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700 focus:border-accent focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Location & Metadata */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-navy-900">Property Details</h2>

            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <MapPin className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400">Location</p>
                <p className="text-sm font-bold text-navy-900">{apt.location}</p>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Unit Type</span>
                <span className="font-semibold text-slate-700">{apt.type}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Registered</span>
                <span className="font-semibold text-slate-700">{new Date(apt.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Modified</span>
                <span className="font-semibold text-slate-700">{new Date(apt.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>Danger Zone</span>
            </div>
            <p className="text-xs text-red-600">
              Permanently delete this apartment and remove it from all listings.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white"
            >
              Delete Apartment
            </button>
          </div>
        </div>
      </div>

      {/* ── DELETE CONFIRMATION MODAL ── */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-600">
              <Trash2 className="h-6 w-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-navy-900">Delete this apartment permanently?</h3>
              <p className="mt-1 text-sm text-slate-500">
                Are you sure you want to delete <strong>{apt.name} (Unit {apt.number})</strong>? All data and photos will be removed permanently.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                disabled={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate()}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white shadow hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? 'Deleting…' : 'Yes, Delete'}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                className="flex-1 rounded-xl border border-slate-200 bg-white py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── EDIT MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-navy-900">Edit Apartment</h3>
                <p className="text-xs text-slate-400">Update unit details, specs, and photos</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {saveError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {saveError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
              className="mt-5 space-y-4"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Unit Number *</label>
                  <input
                    required
                    value={editForm.number}
                    onChange={(e) => setEditForm((f) => ({ ...f, number: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Display Name</label>
                  <input
                    value={editForm.name}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className={inputCls}
                    placeholder={`Unit ${editForm.number}`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Monthly Price *</label>
                  <input
                    type="number"
                    required
                    value={editForm.price}
                    onChange={(e) => setEditForm((f) => ({ ...f, price: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bedrooms *</label>
                  <input
                    type="number"
                    required
                    value={editForm.bedrooms}
                    onChange={(e) => setEditForm((f) => ({ ...f, bedrooms: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Bathrooms</label>
                  <input
                    type="number"
                    value={editForm.bathrooms}
                    onChange={(e) => setEditForm((f) => ({ ...f, bathrooms: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Floor</label>
                  <input
                    type="number"
                    value={editForm.floor}
                    onChange={(e) => setEditForm((f) => ({ ...f, floor: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Size (m²)</label>
                  <input
                    type="number"
                    value={editForm.size}
                    onChange={(e) => setEditForm((f) => ({ ...f, size: e.target.value }))}
                    className={inputCls}
                  />
                </div>
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Location</label>
                  <input
                    value={editForm.location}
                    onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                    className={inputCls}
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Description</label>
                <textarea
                  rows={3}
                  value={editForm.description}
                  onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))}
                  className={inputCls}
                />
              </div>

              {/* Photo Upload Section */}
              <div className="border-t border-slate-100 pt-4">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Add New Photos</label>
                <div className="mt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
                  >
                    <ImagePlus className="h-4 w-4 text-accent" /> Upload Images
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>
                {uploadedPreviews.length > 0 && (
                  <div className="mt-3 flex gap-2 overflow-x-auto">
                    {uploadedPreviews.map((p, idx) => (
                      <img key={idx} src={p.dataUrl} alt="" className="h-14 w-20 rounded-lg object-cover border" />
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl border border-slate-200 px-5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="rounded-xl bg-accent px-6 py-2.5 text-xs font-bold text-white shadow-md shadow-accent/25 hover:bg-accent-hover disabled:opacity-50"
                >
                  {updateMutation.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

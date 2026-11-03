import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Building2, Calendar, Check, ChevronRight, Copy, ExternalLink,
  Mail, MessageCircle, Pencil, Phone, Trash2,
  X, AlertCircle
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { deleteCustomer, fetchCustomer, updateCustomer } from '../../services/customersApi';
import { getApiErrorMessage } from '../../lib/apiClient';

type CustomerStatusType = 'new' | 'in-process' | 'active' | 'past';

function getCustomerStatus(notes: string | null | undefined): CustomerStatusType {
  const n = notes?.toLowerCase() ?? '';
  if (n.includes('active') || n.includes('renting')) return 'active';
  if (n.includes('process') || n.includes('pending')) return 'in-process';
  if (n.includes('past') || n.includes('left') || n.includes('moved')) return 'past';
  return 'new';
}

const STATUS_BADGE: Record<CustomerStatusType, string> = {
  new: 'bg-sky-50 text-sky-700 border-sky-200',
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'in-process': 'bg-amber-50 text-amber-700 border-amber-200',
  past: 'bg-slate-100 text-slate-600 border-slate-200',
};

const STATUS_LABEL: Record<CustomerStatusType, string> = {
  new: 'New Customer',
  active: 'Active Tenant',
  'in-process': 'In Process',
  past: 'Past Tenant',
};

const CUSTOMER_STAGES: { key: CustomerStatusType; label: string }[] = [
  { key: 'new', label: 'New' },
  { key: 'in-process', label: 'In Process' },
  { key: 'active', label: 'Active Tenant' },
  { key: 'past', label: 'Past Tenant' },
];

function updateNotesWithStatus(currentNotes: string | null | undefined, newStatus: CustomerStatusType): string {
  const cleaned = (currentNotes ?? '').replace(/^\[Status:\s*[^\]]+\]\s*/i, '').trim();
  const label = STATUS_LABEL[newStatus];
  return `[Status: ${label}] ${cleaned}`.trim();
}

const inputCls =
  'mt-1 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20 bg-white';

export function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [editError, setEditError] = useState<string | null>(null);

  // Quick note state
  const [quickNote, setQuickNote] = useState('');
  const [isSavingNote, setIsSavingNote] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  const query = useQuery({
    queryKey: ['admin', 'customer', id],
    queryFn: () => fetchCustomer(id!),
    enabled: Boolean(id),
  });

  const customer = query.data;

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name ?? '',
        email: customer.email ?? '',
        phone: customer.phone ?? '',
        notes: customer.notes ?? '',
      });
    }
  }, [customer]);

  useDocumentTitle(customer ? `${customer.name} — Customer` : 'Customer Details');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      updateCustomer(id!, {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        notes: formData.notes || null,
      }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'customer', id] });
      await qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      setIsEditModalOpen(false);
      setEditError(null);
    },
    onError: (err) => setEditError(getApiErrorMessage(err)),
  });

  const statusMutation = useMutation({
    mutationFn: (newStatus: CustomerStatusType) => {
      const updatedNotes = updateNotesWithStatus(customer?.notes, newStatus);
      return updateCustomer(id!, {
        name: customer!.name,
        email: customer!.email,
        phone: customer!.phone,
        notes: updatedNotes,
      });
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'customer', id] });
      await qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      await qc.invalidateQueries({ queryKey: ['dashboard', 'stats'] });
    },
  });

  const handleAppendNote = async () => {
    if (!quickNote.trim() || !customer) return;
    setIsSavingNote(true);
    const dateStr = new Date().toLocaleDateString();
    const updatedNotes = customer.notes
      ? `${customer.notes}\n[${dateStr}] ${quickNote.trim()}`
      : `[${dateStr}] ${quickNote.trim()}`;

    try {
      await updateCustomer(id!, {
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        notes: updatedNotes,
      });
      await qc.invalidateQueries({ queryKey: ['admin', 'customer', id] });
      setQuickNote('');
    } finally {
      setIsSavingNote(false);
    }
  };

  const deleteMutation = useMutation({
    mutationFn: () => deleteCustomer(id!),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      navigate('/admin/customers');
    },
  });

  if (query.isLoading) return <LoadingState label="Loading customer details…" />;

  if (query.isError || !customer) {
    return (
      <div className="py-16 text-center">
        <ErrorState message="Could not load customer details." onRetry={() => void query.refetch()} />
        <Link to="/admin/customers" className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Customers
        </Link>
      </div>
    );
  }

  const status = getCustomerStatus(customer.notes);
  const initials = customer.name
    ? customer.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CU';

  const cleanPhone = customer.phone ? customer.phone.replace(/\D/g, '') : '';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* ── BREADCRUMBS & TOP BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link to="/admin/customers" className="transition hover:text-navy-900">
              Customers
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-navy-900 font-bold">{customer.name}</span>
          </nav>

          <div className="mt-2.5 flex flex-wrap items-center gap-3.5">
            {/* Initials Avatar */}
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-accent to-blue-400 text-white font-bold text-base shadow-md shadow-accent/20">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-950">
                  {customer.name}
                </h1>
                <span className={`inline-flex items-center rounded-xl border px-3 py-1 text-xs font-bold ${STATUS_BADGE[status]}`}>
                  {STATUS_LABEL[status]}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">ID: {customer.id}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {customer.phone && (
            <a
              href={`tel:${customer.phone}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <Phone className="h-3.5 w-3.5 text-accent" />
              Call
            </a>
          )}
          {customer.email && (
            <a
              href={`mailto:${customer.email}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <Mail className="h-3.5 w-3.5 text-accent" />
              Email
            </a>
          )}
          <button
            type="button"
            onClick={() => setIsEditModalOpen(true)}
            className="inline-flex items-center gap-1.5 rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-md shadow-accent/20 transition hover:bg-accent-hover active:scale-95"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit Profile
          </button>
        </div>
      </div>



      {/* ── 2-COLUMN MAIN CANVAS & SIDEBAR ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── MAIN CONTENT (LEFT 65%) ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Inquiries & Applications History */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-900">Inquiries & Applications</h2>
              <span className="rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
                {customer.inquiries?.length ?? 0} Records
              </span>
            </div>

            {customer.inquiries && customer.inquiries.length > 0 ? (
              <div className="mt-4 divide-y divide-slate-100">
                {customer.inquiries.map((inq) => (
                  <div key={inq.id} className="flex flex-wrap items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                    <div className="space-y-1">
                      <Link
                        to={`/admin/inquiries/${inq.id}`}
                        className="group inline-flex items-center gap-1.5 font-bold text-navy-900 hover:text-accent transition"
                      >
                        {inq.subject}
                        <ExternalLink className="h-3.5 w-3.5 opacity-0 transition group-hover:opacity-100" />
                      </Link>
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        {inq.apartment && (
                          <span className="inline-flex items-center gap-1 font-semibold text-navy-900 bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                            <Building2 className="h-3 w-3 text-accent" />
                            {inq.apartment.name} ({inq.apartment.number})
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-slate-400">
                          <Calendar className="h-3 w-3" />
                          {new Date(inq.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <StatusBadge status={inq.status} />
                      <Link
                        to={`/admin/inquiries/${inq.id}`}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        View
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-4 text-xs italic text-slate-400">
                No inquiries or rental requests submitted by this customer yet.
              </p>
            )}
          </div>

          {/* Notes & Tenancy Timeline */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-navy-900">Notes & Tenancy History</h2>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200">
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {customer.notes || <span className="italic text-slate-400">No notes recorded for this customer.</span>}
              </p>
            </div>

            {/* Quick Add Note box */}
            <div className="border-t border-slate-100 pt-4">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">+ Append Quick Note</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. Paid deposit for Unit 102, moving in next week…"
                  value={quickNote}
                  onChange={(e) => setQuickNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAppendNote();
                  }}
                  className="flex-1 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-accent focus:outline-none"
                />
                <button
                  type="button"
                  disabled={!quickNote.trim() || isSavingNote}
                  onClick={handleAppendNote}
                  className="rounded-xl bg-accent px-4 py-2 text-xs font-bold text-white shadow-sm shadow-accent/20 transition hover:bg-accent-hover disabled:opacity-50"
                >
                  {isSavingNote ? 'Saving…' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── ACTION & SUMMARY RAIL (RIGHT 35%) ── */}
        <div className="space-y-6">
          {/* Customer Status Dropdown Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-navy-900">Customer Status</h2>
              <span className={`inline-flex items-center rounded-xl border px-2.5 py-0.5 text-xs font-bold ${STATUS_BADGE[status]}`}>
                {STATUS_LABEL[status]}
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Update Status
              </label>
              <select
                value={status}
                disabled={statusMutation.isPending}
                onChange={(e) => statusMutation.mutate(e.target.value as CustomerStatusType)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-navy-900 focus:border-accent focus:bg-white focus:outline-none cursor-pointer"
              >
                {CUSTOMER_STAGES.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Contact Details Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-navy-900">Contact Information</h2>

            {/* Email */}
            <div className="flex items-start justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Mail className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Email</p>
                  <a href={`mailto:${customer.email}`} className="text-xs font-bold text-navy-900 hover:text-accent">
                    {customer.email}
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(customer.email, 'email')}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition"
                title="Copy email"
              >
                {copiedField === 'email' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* Phone */}
            <div className="flex items-start justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 text-accent">
                  <Phone className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Phone</p>
                  <a href={`tel:${customer.phone}`} className="text-xs font-bold text-navy-900 hover:text-accent">
                    {customer.phone}
                  </a>
                </div>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(customer.phone, 'phone')}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600 transition"
                title="Copy phone"
              >
                {copiedField === 'phone' ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            {/* Quick WhatsApp Link */}
            {cleanPhone && (
              <a
                href={`https://wa.me/${cleanPhone}`}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-center gap-2 rounded-xl bg-[#25D366] py-2.5 text-xs font-bold text-white shadow-sm transition hover:bg-[#20ba5a] active:scale-95"
              >
                <MessageCircle className="h-4 w-4" /> Message on WhatsApp
              </a>
            )}
          </div>

          {/* Account Metadata */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-navy-900">Record Info</h2>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Total Inquiries</span>
                <span className="font-bold text-navy-900">{customer.inquiries?.length ?? 0}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2">
                <span className="text-slate-400">Registered</span>
                <span className="font-semibold text-slate-700">{new Date(customer.createdAt).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Updated</span>
                <span className="font-semibold text-slate-700">{new Date(customer.updatedAt).toLocaleString()}</span>
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
              Permanently delete this customer and detach all inquiries.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white"
            >
              Delete Customer
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
              <h3 className="text-lg font-bold text-navy-900">Delete this customer permanently?</h3>
              <p className="mt-1 text-sm text-slate-500">
                Are you sure you want to remove <strong>{customer.name}</strong>? This action cannot be undone.
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

      {/* ── EDIT PROFILE MODAL ── */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/60 p-4 backdrop-blur-sm">
          <div className="relative max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 sm:p-8 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-bold text-navy-900">Edit Customer Profile</h3>
                <p className="text-xs text-slate-400">Update name, contact info, and notes</p>
              </div>
              <button
                type="button"
                onClick={() => setIsEditModalOpen(false)}
                className="rounded-xl p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                {editError}
              </div>
            )}

            <form
              onSubmit={(e) => {
                e.preventDefault();
                updateMutation.mutate();
              }}
              className="mt-5 space-y-4"
            >
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Full Name *</label>
                <input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  className={inputCls}
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notes & Status</label>
                <textarea
                  rows={4}
                  value={formData.notes}
                  onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
                  placeholder="e.g. Active tenant renting Unit 102..."
                  className={inputCls}
                />
                <p className="mt-1 text-[11px] text-slate-400">
                  Tip: include keywords like &quot;active&quot;, &quot;pending&quot;, or &quot;past&quot; to adjust status badge.
                </p>
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

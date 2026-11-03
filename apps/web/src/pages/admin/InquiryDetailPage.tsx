import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft, Building2, Calendar, Check, ChevronRight, Copy, ExternalLink,
  Mail, MessageCircle, MessageSquare, Phone, Trash2, User, AlertCircle
} from 'lucide-react';
import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { LoadingState } from '../../components/common/LoadingState';
import { ErrorState } from '../../components/common/ErrorState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { deleteInquiry, fetchInquiry, updateInquiry } from '../../services/inquiriesApi';

const INQUIRY_STATUSES = ['New', 'Contacted', 'In Progress', 'Resolved'] as const;

export function InquiryDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const query = useQuery({
    queryKey: ['admin', 'inquiry', id],
    queryFn: () => fetchInquiry(id!),
    enabled: Boolean(id),
  });

  const inq = query.data;

  useDocumentTitle(inq ? `${inq.subject} — Inquiry Details` : 'Inquiry Details');

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const statusMutation = useMutation({
    mutationFn: (newStatus: string) => updateInquiry(id!, { status: newStatus }),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'inquiry', id] });
      await qc.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteInquiry(id!),
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      navigate('/admin/inquiries');
    },
  });

  if (query.isLoading) return <LoadingState label="Loading inquiry details…" />;

  if (query.isError || !inq) {
    return (
      <div className="py-16 text-center">
        <ErrorState message="Could not load inquiry details." onRetry={() => void query.refetch()} />
        <Link to="/admin/inquiries" className="mt-4 inline-flex items-center gap-2 text-sm text-accent hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to Inquiries
        </Link>
      </div>
    );
  }

  const cleanPhone = inq.customer?.phone ? inq.customer.phone.replace(/\D/g, '') : '';
  const customerInitials = inq.customer?.name
    ? inq.customer.name
        .split(' ')
        .map((p) => p[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'CU';

  return (
    <div className="mx-auto max-w-7xl space-y-6 pb-12">
      {/* ── BREADCRUMBS & TOP BAR ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div>
          <nav className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <Link to="/admin/inquiries" className="transition hover:text-navy-900">
              Inquiries
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-slate-300" />
            <span className="text-navy-900 font-bold truncate max-w-xs">{inq.subject}</span>
          </nav>

          <div className="mt-2.5 flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl sm:text-4xl font-extrabold tracking-tight text-navy-950">
              {inq.subject}
            </h1>
            <StatusBadge status={inq.status} />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {inq.customer?.phone && (
            <a
              href={`tel:${inq.customer.phone}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <Phone className="h-3.5 w-3.5 text-accent" />
              Call
            </a>
          )}
          {cleanPhone && (
            <a
              href={`https://wa.me/${cleanPhone}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#25D366] px-3.5 py-2 text-xs font-bold text-white shadow-sm transition hover:bg-[#20ba5a] active:scale-95"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </a>
          )}
          {inq.customer?.email && (
            <a
              href={`mailto:${inq.customer.email}`}
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              <Mail className="h-3.5 w-3.5 text-accent" />
              Email
            </a>
          )}
        </div>
      </div>


      {/* ── HERO METRIC TILES ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {/* Customer */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customer</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <User className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-black text-navy-900 truncate">{inq.customer?.name ?? 'Anonymous'}</p>
          <p className="text-[11px] font-semibold text-slate-400">Lead</p>
        </div>

        {/* Date Submitted */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Received</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-black text-navy-900">
            {new Date(inq.createdAt).toLocaleDateString()}
          </p>
          <p className="text-[11px] font-semibold text-slate-400">
            {new Date(inq.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>

        {/* Target Unit */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Apartment</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <Building2 className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-black text-navy-900 truncate">
            {inq.apartment ? `Unit ${inq.apartment.number}` : 'General Inquiry'}
          </p>
          <p className="text-[11px] font-semibold text-slate-400">
            {inq.apartment?.name ?? 'Property-wide'}
          </p>
        </div>

        {/* Status */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Status</p>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-accent/10 text-accent">
              <MessageSquare className="h-4 w-4" />
            </div>
          </div>
          <p className="mt-2 text-lg font-black text-navy-900">{inq.status}</p>
          <p className="text-[11px] font-semibold text-slate-400">Live stage</p>
        </div>
      </div>

      {/* ── 2-COLUMN MAIN CANVAS & SIDEBAR ── */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* ── MAIN CONTENT (LEFT 65%) ── */}
        <div className="space-y-6 lg:col-span-2">
          {/* Message Content */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-accent to-blue-400 font-bold text-white text-sm shadow">
                  {customerInitials}
                </div>
                <div>
                  <p className="font-bold text-navy-900">{inq.customer?.name}</p>
                  <p className="text-xs text-slate-400">
                    Sent on {new Date(inq.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Subject</p>
              <h2 className="text-lg font-bold text-navy-900 mt-1">{inq.subject}</h2>
            </div>

            <div className="rounded-xl bg-slate-50 p-5 border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Message Body</p>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                {inq.message || <span className="italic text-slate-400">No message body provided.</span>}
              </p>
            </div>
          </div>
        </div>

        {/* ── ACTION & SUMMARY RAIL (RIGHT 35%) ── */}
        <div className="space-y-6">
          {/* Status Control */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3">
            <h2 className="text-base font-bold text-navy-900">Inquiry Status</h2>
            <select
              value={inq.status}
              disabled={statusMutation.isPending}
              onChange={(e) => statusMutation.mutate(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs font-bold text-navy-900 focus:border-accent focus:bg-white focus:outline-none"
            >
              {INQUIRY_STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          {/* Customer Details Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-navy-900">Customer Details</h2>

            <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent font-bold text-sm">
                {customerInitials}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-navy-900 truncate">{inq.customer?.name}</p>
                {inq.customer?.id && (
                  <Link
                    to={`/admin/customers/${inq.customer.id}`}
                    className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                  >
                    View Customer Profile <ChevronRight className="h-3 w-3" />
                  </Link>
                )}
              </div>
            </div>

            {/* Email */}
            {inq.customer?.email && (
              <div className="flex items-start justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Mail className="h-4 w-4 text-accent shrink-0" />
                  <a href={`mailto:${inq.customer.email}`} className="text-xs font-bold text-navy-900 hover:text-accent truncate">
                    {inq.customer.email}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inq.customer!.email, 'email')}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-600"
                  title="Copy email"
                >
                  {copiedField === 'email' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}

            {/* Phone */}
            {inq.customer?.phone && (
              <div className="flex items-start justify-between rounded-xl bg-slate-50 p-3 border border-slate-200/80">
                <div className="flex items-center gap-2.5 min-w-0">
                  <Phone className="h-4 w-4 text-accent shrink-0" />
                  <a href={`tel:${inq.customer.phone}`} className="text-xs font-bold text-navy-900 hover:text-accent truncate">
                    {inq.customer.phone}
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => copyToClipboard(inq.customer!.phone, 'phone')}
                  className="rounded-lg p-1 text-slate-400 hover:bg-white hover:text-slate-600"
                  title="Copy phone"
                >
                  {copiedField === 'phone' ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Requested Apartment Card */}
          {inq.apartment && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-navy-900">Requested Apartment</h2>

              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="rounded-md bg-white px-2 py-0.5 text-xs font-bold text-navy-900 border">
                      Unit {inq.apartment.number}
                    </span>
                    <h3 className="font-bold text-sm text-navy-900 mt-2">{inq.apartment.name}</h3>
                  </div>
                </div>

                <Link
                  to={`/admin/apartments/${inq.apartment.id}`}
                  className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline"
                >
                  View Apartment Specs <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="rounded-2xl border border-red-200 bg-red-50/40 p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2 text-red-800 font-bold text-sm">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span>Danger Zone</span>
            </div>
            <p className="text-xs text-red-600">
              Permanently delete this inquiry from the system.
            </p>
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="w-full rounded-xl border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 shadow-sm transition hover:bg-red-600 hover:text-white"
            >
              Delete Inquiry
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
              <h3 className="text-lg font-bold text-navy-900">Delete this inquiry permanently?</h3>
              <p className="mt-1 text-sm text-slate-500">
                Are you sure you want to delete inquiry <strong>{inq.subject}</strong> from <strong>{inq.customer?.name}</strong>? This action cannot be undone.
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
    </div>
  );
}

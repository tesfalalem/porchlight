import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  AlertCircle,
  ArrowLeft,
  Bath,
  BedDouble,
  Building2,
  Calendar,
  Check,
  CheckCircle2,
  DollarSign,
  FileText,
  Mail,
  Phone,
  Shield,
  Sparkles,
  User,
  UserPlus,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { createCustomer } from '../../services/customersApi';
import { fetchApartments } from '../../services/apartmentsApi';
import { createInquiry } from '../../services/inquiriesApi';
import { formatPrice } from '../../utils/format';
import { getApiErrorMessage } from '../../lib/apiClient';

// Safe date parsing & display helpers avoiding timezone shifts
function parseYmd(ymd: string): Date | null {
  if (!ymd) return null;
  const parts = ymd.split('-');
  if (parts.length !== 3) return null;
  const [y, m, d] = parts.map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDateDisplay(ymd: string): string {
  const date = parseYmd(ymd);
  if (!date) return ymd;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }); // e.g. "13 Nov 2026"
}

function addMonthsToYmd(ymd: string, months: number): string {
  const parsed = parseYmd(ymd) ?? new Date();
  const date = new Date(parsed.getFullYear(), parsed.getMonth() + months, parsed.getDate());
  const yr = date.getFullYear();
  const mo = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${day}`;
}

function getLeaseDuration(startStr: string, endStr: string): { days: number; text: string } | null {
  const start = parseYmd(startStr);
  const end = parseYmd(endStr);
  if (!start || !end || end <= start) return null;

  const diffTime = end.getTime() - start.getTime();
  const days = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let text = '';
  if (days >= 360) {
    const wholeYears = Math.floor(days / 365.25);
    const remMonths = Math.round((days % 365.25) / 30.4375);
    if (remMonths === 0 || remMonths >= 11) {
      const displayYears = remMonths >= 11 ? wholeYears + 1 : wholeYears;
      text = `${displayYears} ${displayYears === 1 ? 'Year' : 'Years'} (${days} days)`;
    } else {
      const years = +(days / 365.25).toFixed(1);
      text = `${years} Years (${days} days)`;
    }
  } else if (days >= 28) {
    const months = Math.round(days / 30.4375);
    text = `${months} ${months === 1 ? 'Month' : 'Months'} (${days} days)`;
  } else {
    text = `${days} ${days === 1 ? 'Day' : 'Days'}`;
  }
  return { days, text };
}

type CustomerStage = 'active' | 'in process' | 'new' | 'past';

const STAGES: {
  key: CustomerStage;
  label: string;
  sub: string;
  badgeCls: string;
  activeCls: string;
}[] = [
  {
    key: 'active',
    label: 'Active Tenant',
    sub: 'Currently residing in a Porchlight unit',
    badgeCls: 'bg-emerald-100 text-emerald-800',
    activeCls: 'border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/20 text-emerald-950',
  },
  {
    key: 'in process',
    label: 'In Process',
    sub: 'Application approved / lease in progress',
    badgeCls: 'bg-amber-100 text-amber-800',
    activeCls: 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 text-amber-950',
  },
  {
    key: 'new',
    label: 'New Lead',
    sub: 'Inquiring or scheduling a property tour',
    badgeCls: 'bg-sky-100 text-sky-800',
    activeCls: 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 text-sky-950',
  },
  {
    key: 'past',
    label: 'Past Tenant',
    sub: 'Former resident / lease ended',
    badgeCls: 'bg-slate-100 text-slate-700',
    activeCls: 'border-slate-500 bg-slate-50 ring-2 ring-slate-500/20 text-slate-900',
  },
];

export function AddCustomerPage() {
  useDocumentTitle('Register Customer — Porchlight CRM');
  const navigate = useNavigate();
  const qc = useQueryClient();

  // Primary fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('+251 ');
  const [stage, setStage] = useState<CustomerStage>('active');

  // Extended CRM fields
  const [idNumber, setIdNumber] = useState('');
  const [organization, setOrganization] = useState('');
  const [apartmentId, setApartmentId] = useState('');
  const [leaseStart, setLeaseStart] = useState('');
  const [leaseEnd, setLeaseEnd] = useState('');
  const [deposit, setDeposit] = useState('');
  const [notes, setNotes] = useState('');

  const [error, setError] = useState<string | null>(null);

  // Queries
  const apartmentsQuery = useQuery({
    queryKey: ['apartments', 'all'],
    queryFn: () => fetchApartments({}),
  });

  const selectedApartment =
    apartmentsQuery.data?.find((a) => a.id === apartmentId) ?? null;

  // Normalized today's date
  const todayYmd = useMemo(() => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }, []);

  const apartmentAvailableYmd = useMemo(() => {
    if (!selectedApartment?.availableFrom) return null;
    return selectedApartment.availableFrom.slice(0, 10);
  }, [selectedApartment]);

  // Comprehensive Date Validation
  const dateError = useMemo<string | null>(() => {
    if (leaseEnd && !leaseStart) {
      return 'Please choose a Move-In / Start Date first before selecting a Lease End Date.';
    }

    if (leaseStart && leaseEnd) {
      if (leaseEnd < leaseStart) {
        return `Invalid date order: Lease End Date (${formatDateDisplay(leaseEnd)}) cannot be earlier than Move-In Date (${formatDateDisplay(leaseStart)}).`;
      }
      if (leaseEnd === leaseStart) {
        return 'Lease End Date cannot be on the exact same date as Move-In Date. Tenancy requires at least 1 day.';
      }
    }

    if (leaseStart && apartmentAvailableYmd && leaseStart < apartmentAvailableYmd) {
      return `Unit ${selectedApartment?.number ?? ''} is not available until ${formatDateDisplay(apartmentAvailableYmd)}. Move-In Date cannot precede unit availability.`;
    }

    if (stage !== 'past' && leaseEnd && leaseEnd < todayYmd) {
      return `Lease End Date (${formatDateDisplay(leaseEnd)}) is in the past. Active or upcoming tenants must have an ongoing or future lease term.`;
    }

    return null;
  }, [leaseStart, leaseEnd, apartmentAvailableYmd, selectedApartment, stage, todayYmd]);

  const durationInfo = useMemo(() => {
    if (!leaseStart || !leaseEnd || dateError) return null;
    return getLeaseDuration(leaseStart, leaseEnd);
  }, [leaseStart, leaseEnd, dateError]);

  const handleApplyPreset = (months: number) => {
    let start = leaseStart;
    if (!start) {
      const base = apartmentAvailableYmd && apartmentAvailableYmd > todayYmd ? apartmentAvailableYmd : todayYmd;
      start = base;
      setLeaseStart(base);
    }
    const end = addMonthsToYmd(start, months);
    setLeaseEnd(end);
  };

  // Mutation
  const mutation = useMutation({
    mutationFn: async () => {
      if (dateError) {
        setError(dateError);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        throw new Error(dateError);
      }

      // Structure the notes so it retains clean compatibility with dashboard & detail parsers
      const stageLabel =
        STAGES.find((s) => s.key === stage)?.label ?? 'Active Tenant';

      const structuredNotesParts = [`[Status: ${stageLabel}]`];

      if (idNumber.trim()) {
        structuredNotesParts.push(`[ID/Passport: ${idNumber.trim()}]`);
      }
      if (organization.trim()) {
        structuredNotesParts.push(`[Org: ${organization.trim()}]`);
      }
      if (leaseStart || leaseEnd) {
        structuredNotesParts.push(
          `[Lease: ${leaseStart || 'N/A'} to ${leaseEnd || 'Open'}]`,
        );
      }
      if (deposit.trim()) {
        structuredNotesParts.push(`[Deposit: ${deposit.trim()} ETB]`);
      }
      if (notes.trim()) {
        structuredNotesParts.push(notes.trim());
      }

      const finalNotes = structuredNotesParts.join(' ');

      const customer = await createCustomer({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        notes: finalNotes || undefined,
      });

      // If an apartment is linked, also create an inquiry/booking record
      if (apartmentId) {
        await createInquiry({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          phone: phone.trim(),
          apartmentId,
          subject:
            stage === 'active'
              ? `Active Tenancy — Unit ${selectedApartment?.number ?? ''}`
              : `Customer Registration — Unit ${selectedApartment?.number ?? ''}`,
          message:
            notes.trim() ||
            `Registered as ${stageLabel} by admin management.`,
        });
      }

      return customer;
    },
    onSuccess: async () => {
      await qc.invalidateQueries({ queryKey: ['admin', 'customers'] });
      await qc.invalidateQueries({ queryKey: ['admin', 'inquiries'] });
      await qc.invalidateQueries({ queryKey: ['dashboard'] });
      navigate('/admin/customers');
    },
    onError: (e) => {
      setError(getApiErrorMessage(e));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    },
  });

  const isReady = Boolean(name.trim() && email.trim() && phone.trim() && !dateError);

  // Clean phone for WhatsApp preview
  const digitsOnly = phone.replace(/[^0-9]/g, '');

  return (
    <div className="space-y-8 pb-16">
      {/* ── TOP HEADER & BREADCRUMBS ── */}
      <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 shadow-sm transition hover:bg-slate-50 hover:text-navy-950"
            title="Return to customers"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                <Sparkles className="h-3 w-3" /> Resident Directory & CRM
              </span>
              <span className="text-xs text-slate-400">/</span>
              <span className="text-xs font-medium text-slate-500">New Registration</span>
            </div>
            <h1 className="mt-1 font-display text-2xl font-extrabold text-navy-950 sm:text-3xl">
              Register New Customer
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/customers"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
          >
            Cancel
          </Link>
          <button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !isReady}
            title={dateError ? dateError : undefined}
            className="inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-2.5 text-sm font-bold text-white shadow-md shadow-accent/25 transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <UserPlus className="h-4 w-4" />
            {mutation.isPending ? 'Registering…' : 'Register Customer'}
          </button>
        </div>
      </div>

      {error ? (
        <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
          <div>
            <p className="font-semibold">Registration Failed</p>
            <p className="mt-0.5 text-xs text-red-600">{error}</p>
          </div>
        </div>
      ) : null}

      {/* ── TWO-COLUMN MAIN WORKSPACE ── */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* ── LEFT: FORM INPUTS (7 COLS) ── */}
        <div className="space-y-6 lg:col-span-7 xl:col-span-8">
          {/* Section 1: Customer Profile */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900/5 text-navy-900">
                <User className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-bold text-navy-950">1. Customer Identification & Contact</h2>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Full Name <span className="text-red-500">*</span>
                </span>
                <div className="relative mt-1.5">
                  <User className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Abebe Kebede, Sarah Jenkins"
                    className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                  />
                </div>
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Email Address <span className="text-red-500">*</span>
                  </span>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tenant@example.com"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Phone / Mobile <span className="text-red-500">*</span>
                  </span>
                  <div className="relative mt-1.5">
                    <Phone className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-accent" />
                    <input
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+251 911 234 567"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                </label>
              </div>

              {/* Status Radio Cards */}
              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Customer Lifecycle Status
                </label>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {STAGES.map((s) => {
                    const isSelected = stage === s.key;
                    return (
                      <button
                        key={s.key}
                        type="button"
                        onClick={() => setStage(s.key)}
                        className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${
                          isSelected
                            ? s.activeCls
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/80'
                        }`}
                      >
                        <div className="flex w-full items-center justify-between">
                          <span className="text-sm font-bold">{s.label}</span>
                          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${s.badgeCls}`}>
                            {s.key}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Optional Identity & Employer */}
              <div className="grid gap-4 pt-2 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    National ID or Passport Number
                  </span>
                  <div className="relative mt-1.5">
                    <Shield className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      placeholder="e.g. ET-99882211 or Passport No."
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                </label>

                <label className="block">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Organization / Company
                  </span>
                  <div className="relative mt-1.5">
                    <Building2 className="pointer-events-none absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. UN / NGO / Embassy / Corporation"
                      className="w-full rounded-xl border border-slate-200 pl-10 pr-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                    />
                  </div>
                </label>
              </div>
            </div>
          </section>

          {/* Section 2: Apartment Assignment & Stay Terms */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                <Building2 className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-bold text-navy-950">2. Residence Assignment & Lease Terms</h2>
            </div>

            <div className="mt-5 space-y-4">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Assigned Apartment
                </span>
                <select
                  value={apartmentId}
                  onChange={(e) => setApartmentId(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-navy-950 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15 bg-white"
                >
                  <option value="">— None (Prospect / General Lead) —</option>
                  {(apartmentsQuery.data ?? []).map((apt) => (
                    <option key={apt.id} value={apt.id}>
                      Unit {apt.number} · {apt.name} — {formatPrice(apt.price)} ETB/mo ({apt.availabilityStatus})
                    </option>
                  ))}
                </select>
              </label>

              {/* Apartment Preview Card if selected */}
              {selectedApartment && (
                <div className="rounded-xl border border-accent/20 bg-accent/5 p-4 transition">
                  <div className="flex items-start gap-4">
                    {selectedApartment.images[0] ? (
                      <img
                        src={selectedApartment.images[0].url}
                        alt=""
                        className="h-20 w-28 shrink-0 rounded-lg object-cover border border-slate-200 shadow-sm"
                      />
                    ) : (
                      <div className="flex h-20 w-28 shrink-0 items-center justify-center rounded-lg bg-slate-200">
                        <Building2 className="h-8 w-8 text-slate-400" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-bold text-navy-950">{selectedApartment.name}</p>
                          <p className="text-xs font-semibold text-slate-500">
                            Unit {selectedApartment.number} · {selectedApartment.type}
                          </p>
                        </div>
                        <StatusBadge status={selectedApartment.availabilityStatus} />
                      </div>

                      <div className="mt-2.5 flex flex-wrap items-center gap-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1 font-semibold text-navy-900">
                          <BedDouble className="h-3.5 w-3.5 text-accent" />
                          {selectedApartment.bedrooms} Beds
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-navy-900">
                          <Bath className="h-3.5 w-3.5 text-accent" />
                          {selectedApartment.bathrooms} Baths
                        </span>
                        <span className="font-bold text-accent">
                          {formatPrice(selectedApartment.price)} ETB / mo
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Lease dates & deposit if apartment is assigned */}
                  <div className="mt-4 border-t border-accent/15 pt-4">
                    <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-navy-900">
                          Lease Term & Financials
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Accurate move-in and lease expiration dates ensure consistent tenant agreements.
                        </p>
                      </div>

                      {apartmentAvailableYmd && (
                        <span className="rounded-lg bg-sky-50 px-2.5 py-1 text-[11px] font-semibold text-sky-800 border border-sky-200">
                          Unit Available From: {formatDateDisplay(apartmentAvailableYmd)}
                        </span>
                      )}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <label className="block">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">Move-In / Start Date</span>
                          {leaseStart && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {formatDateDisplay(leaseStart)}
                            </span>
                          )}
                        </div>
                        <div className="relative mt-1">
                          <Calendar className={`pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 ${dateError ? 'text-red-500' : 'text-slate-400'}`} />
                          <input
                            type="date"
                            value={leaseStart}
                            min={stage !== 'past' ? (apartmentAvailableYmd || todayYmd) : undefined}
                            max={leaseEnd || undefined}
                            onChange={(e) => setLeaseStart(e.target.value)}
                            className={`w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs font-medium transition focus:outline-none ${
                              dateError
                                ? 'border-red-400 bg-red-50/20 text-red-950 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                : leaseStart
                                ? 'border-emerald-300 bg-white text-navy-950 focus:border-accent focus:ring-2 focus:ring-accent/15'
                                : 'border-slate-200 bg-white text-navy-950 focus:border-accent focus:ring-2 focus:ring-accent/15'
                            }`}
                          />
                        </div>
                      </label>

                      <label className="block">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-700">Lease End Date</span>
                          {leaseEnd && (
                            <span className="text-[10px] font-semibold text-slate-400">
                              {formatDateDisplay(leaseEnd)}
                            </span>
                          )}
                        </div>
                        <div className="relative mt-1">
                          <Calendar className={`pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 ${dateError ? 'text-red-500' : 'text-slate-400'}`} />
                          <input
                            type="date"
                            value={leaseEnd}
                            min={leaseStart || (stage !== 'past' ? todayYmd : undefined)}
                            onChange={(e) => setLeaseEnd(e.target.value)}
                            className={`w-full rounded-lg border pl-8 pr-3 py-1.5 text-xs font-medium transition focus:outline-none ${
                              dateError
                                ? 'border-red-400 bg-red-50/20 text-red-950 focus:border-red-500 focus:ring-2 focus:ring-red-100'
                                : leaseEnd
                                ? 'border-emerald-300 bg-white text-navy-950 focus:border-accent focus:ring-2 focus:ring-accent/15'
                                : 'border-slate-200 bg-white text-navy-950 focus:border-accent focus:ring-2 focus:ring-accent/15'
                            }`}
                          />
                        </div>
                      </label>

                      <label className="block">
                        <span className="text-[11px] font-bold text-slate-700">Security Deposit (ETB)</span>
                        <div className="relative mt-1">
                          <DollarSign className="pointer-events-none absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
                          <input
                            type="number"
                            value={deposit}
                            onChange={(e) => setDeposit(e.target.value)}
                            placeholder="e.g. 50000"
                            className="w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 py-1.5 text-xs font-medium text-navy-950 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                          />
                        </div>
                      </label>
                    </div>

                    {/* Quick Duration Presets for accurate input */}
                    <div className="mt-3 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mr-1">
                        Quick Presets:
                      </span>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(3)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs transition hover:border-accent/40 hover:bg-slate-50 hover:text-accent active:scale-95"
                      >
                        +3 Months
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(6)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs transition hover:border-accent/40 hover:bg-slate-50 hover:text-accent active:scale-95"
                      >
                        +6 Months
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(12)}
                        className="rounded-lg border border-accent/40 bg-accent/5 px-2.5 py-1 text-[11px] font-bold text-accent shadow-xs transition hover:bg-accent/10 active:scale-95"
                      >
                        +1 Year (Standard)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyPreset(24)}
                        className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 shadow-xs transition hover:border-accent/40 hover:bg-slate-50 hover:text-accent active:scale-95"
                      >
                        +2 Years
                      </button>
                      {(leaseStart || leaseEnd) && (
                        <button
                          type="button"
                          onClick={() => {
                            setLeaseStart('');
                            setLeaseEnd('');
                          }}
                          className="ml-auto text-[11px] font-medium text-slate-400 hover:text-slate-600 underline"
                        >
                          Clear dates
                        </button>
                      )}
                    </div>

                    {/* Live Validation Alert / Duration Badge */}
                    {dateError ? (
                      <div className="mt-3.5 flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50/90 p-3 text-xs text-red-800">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                        <div className="min-w-0 flex-1">
                          <p className="font-bold text-red-900">Invalid Date Configuration</p>
                          <p className="mt-0.5 text-red-700">{dateError}</p>
                        </div>
                      </div>
                    ) : durationInfo ? (
                      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-emerald-200 bg-emerald-50/90 px-3.5 py-2 text-xs text-emerald-900">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                          <span className="font-bold text-emerald-950">Valid Lease Term:</span>
                          <span className="font-bold text-emerald-700">{durationInfo.text}</span>
                        </div>
                        <span className="text-[11px] font-medium text-emerald-800">
                          {formatDateDisplay(leaseStart)} &rarr; {formatDateDisplay(leaseEnd)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Section 3: Notes & Accommodations */}
          <section className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-sm">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-navy-900/5 text-navy-900">
                <FileText className="h-4 w-4" />
              </div>
              <h2 className="font-display text-lg font-bold text-navy-950">3. Staff Notes & Special Requests</h2>
            </div>

            <div className="mt-5">
              <label className="block">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Internal Notes & Preferences
                </span>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Record tenant preferences, vehicle license plate for parking, emergency contact details, or lease terms…"
                  className="mt-1.5 w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm leading-relaxed text-slate-700 transition focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/15"
                />
              </label>
            </div>
          </section>

          {/* Bottom Actions */}
          <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <Link
              to="/admin/customers"
              className="rounded-xl border border-slate-200 bg-white px-6 py-3 text-center text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              Cancel
            </Link>
            <div className="flex flex-col items-stretch sm:items-end gap-1.5">
              <button
                type="button"
                onClick={() => mutation.mutate()}
                disabled={mutation.isPending || !isReady}
                title={dateError ? dateError : undefined}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-accent px-8 py-3 text-sm font-bold text-white shadow-lg shadow-accent/25 transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
              >
                <UserPlus className="h-4 w-4" />
                {mutation.isPending ? 'Registering…' : 'Register Customer'}
              </button>
              {dateError && (
                <p className="text-[11px] font-medium text-red-600 flex items-center gap-1 justify-center sm:justify-end">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" /> Resolve date validation to enable registration
                </p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: STICKY CUSTOMER PREVIEW & SHORTCUTS (5 COLS) ── */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="sticky top-6 space-y-6">
            {/* Live Customer Card Preview */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Customer Profile Card
                </p>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
                  Preview
                </span>
              </div>

              {/* Avatar + Name */}
              <div className="flex items-center gap-3.5">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-tr from-navy-950 to-blue-900 text-lg font-extrabold text-white shadow-md">
                  {name
                    ? name
                        .split(' ')
                        .map((p) => p[0])
                        .slice(0, 2)
                        .join('')
                        .toUpperCase()
                    : 'AK'}
                </div>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-bold text-navy-950 truncate">
                    {name || 'Prospective Customer'}
                  </h3>
                  <p className="text-xs text-slate-500 truncate">{organization || 'Individual Tenant'}</p>
                  <div className="mt-1">
                    <span
                      className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                        STAGES.find((s) => s.key === stage)?.badgeCls
                      }`}
                    >
                      {STAGES.find((s) => s.key === stage)?.label}
                    </span>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="truncate font-medium">{email || 'No email specified'}</span>
                </div>
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone className="h-3.5 w-3.5 text-accent shrink-0" />
                  <span className="font-semibold">{phone || 'No phone entered'}</span>
                </div>
                {idNumber && (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Shield className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                    <span className="font-medium">ID: {idNumber}</span>
                  </div>
                )}
              </div>

              {/* Assigned Apartment Callout */}
              <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Assigned Unit
                </p>
                {selectedApartment ? (
                  <div className="mt-1 space-y-1">
                    <p className="font-bold text-navy-950">
                      Unit {selectedApartment.number} — {selectedApartment.name}
                    </p>
                    <p className="text-slate-500">
                      {formatPrice(selectedApartment.price)} ETB/mo
                    </p>
                    {(leaseStart || leaseEnd) && (
                      <div className="mt-2.5 rounded-lg border border-slate-200/80 bg-white p-2.5 text-[11px] space-y-1">
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium">Move-In:</span>
                          <span className="font-bold text-navy-950">
                            {leaseStart ? formatDateDisplay(leaseStart) : 'Not specified'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-slate-600">
                          <span className="font-medium">Lease End:</span>
                          <span className="font-bold text-navy-950">
                            {leaseEnd ? formatDateDisplay(leaseEnd) : 'Open-ended'}
                          </span>
                        </div>
                        {dateError ? (
                          <div className="mt-1 flex items-center gap-1 text-[10px] font-bold text-red-600">
                            <AlertCircle className="h-3 w-3 shrink-0" /> Invalid Date Order
                          </div>
                        ) : durationInfo ? (
                          <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1 text-emerald-700 font-bold">
                            <span>Duration:</span>
                            <span>{durationInfo.text}</span>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-1 text-slate-500 italic">No apartment attached yet</p>
                )}
              </div>

              {/* Quick Communication preview buttons */}
              {digitsOnly.length >= 9 && (
                <div className="mt-4 border-t border-slate-100 pt-3">
                  <a
                    href={`https://wa.me/${digitsOnly}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 py-2 text-xs font-bold text-emerald-800 transition hover:bg-emerald-100"
                  >
                    <Phone className="h-3.5 w-3.5 text-emerald-600" />
                    WhatsApp Direct Chat Ready
                  </a>
                </div>
              )}
            </div>

            {/* Quick Tips */}
            <div className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-sm text-xs space-y-2.5">
              <p className="font-bold uppercase tracking-wider text-slate-400">
                Staff CRM Tips
              </p>
              <div className="flex items-start gap-2 text-slate-600">
                <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  Registering with status <strong>Active Tenant</strong> links inquiries and updates tenant metrics on the main dashboard.
                </span>
              </div>
              <div className="flex items-start gap-2 text-slate-600">
                <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                <span>
                  Adding a move-in date automatically generates an internal reservation ticket.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

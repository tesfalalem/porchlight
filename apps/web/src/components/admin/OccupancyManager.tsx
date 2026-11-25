import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Calendar, Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import { useState } from 'react';
import type { OccupancyPeriodDto } from '@porchlight/shared';
import {
  fetchOccupancyPeriods,
  createOccupancyPeriod,
  updateOccupancyPeriod,
  deleteOccupancyPeriod,
} from '../../services/apartmentsApi';
import { getApiErrorMessage } from '../../lib/apiClient';

interface Props {
  apartmentId: string;
}

interface PeriodForm {
  startDate: string;
  endDate: string;
  tenantNote: string;
}

const emptyForm: PeriodForm = { startDate: '', endDate: '', tenantNote: '' };

const inputCls =
  'w-full rounded-lg border border-[#E9E5E0] bg-white px-3 py-2 text-sm focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent/20 transition-colors';

export function OccupancyManager({ apartmentId }: Props) {
  const qc = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PeriodForm>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const periodsQuery = useQuery({
    queryKey: ['occupancy', apartmentId],
    queryFn: () => fetchOccupancyPeriods(apartmentId),
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ['occupancy', apartmentId] });
    qc.invalidateQueries({ queryKey: ['apartments'] });
    qc.invalidateQueries({ queryKey: ['admin', 'apartment', apartmentId] });
  };

  const createMutation = useMutation({
    mutationFn: () => createOccupancyPeriod(apartmentId, {
      startDate: form.startDate,
      endDate: form.endDate,
      tenantNote: form.tenantNote || null,
    }),
    onSuccess: () => { invalidate(); setShowForm(false); setForm(emptyForm); setFormError(null); },
    onError: (e) => setFormError(getApiErrorMessage(e)),
  });

  const updateMutation = useMutation({
    mutationFn: (id: string) => updateOccupancyPeriod(apartmentId, id, {
      startDate: form.startDate,
      endDate: form.endDate,
      tenantNote: form.tenantNote || null,
    }),
    onSuccess: () => { invalidate(); setEditingId(null); setForm(emptyForm); setFormError(null); },
    onError: (e) => setFormError(getApiErrorMessage(e)),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteOccupancyPeriod(apartmentId, id),
    onSuccess: () => { invalidate(); setDeletingId(null); },
  });

  const startEdit = (p: OccupancyPeriodDto) => {
    setEditingId(p.id);
    setShowForm(false);
    setForm({ startDate: p.startDate, endDate: p.endDate, tenantNote: p.tenantNote ?? '' });
    setFormError(null);
  };

  const cancelEdit = () => { setEditingId(null); setForm(emptyForm); setFormError(null); };
  const cancelAdd = () => { setShowForm(false); setForm(emptyForm); setFormError(null); };

  const formatDate = (d: string) =>
    new Date(d + 'T00:00:00').toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  const periods = periodsQuery.data ?? [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-navy-900">Occupancy Periods</h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Dates when this unit is occupied. Customers selecting these dates will not see this apartment.
          </p>
        </div>
        {!showForm && !editingId && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-accent-hover"
          >
            <Plus className="h-3.5 w-3.5" /> Add Period
          </button>
        )}
      </div>

      {/* Add form */}
      {showForm && (
        <div className="rounded-xl border border-[#E9E5E0] bg-[#F8F6F2] p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-700">New Occupancy Period</p>
          {formError && (
            <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Start Date</span>
              <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={`mt-1 ${inputCls}`} required />
            </label>
            <label className="block">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">End Date</span>
              <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className={`mt-1 ${inputCls}`} required />
            </label>
          </div>
          <label className="block">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Note (optional)</span>
            <input type="text" placeholder="e.g. Corporate tenant" value={form.tenantNote} onChange={(e) => setForm((f) => ({ ...f, tenantNote: e.target.value }))} className={`mt-1 ${inputCls}`} />
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={!form.startDate || !form.endDate || createMutation.isPending}
              onClick={() => createMutation.mutate()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
            >
              <Check className="h-3.5 w-3.5" /> {createMutation.isPending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" onClick={cancelAdd} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E9E5E0] bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-[#F3F0EC]">
              <X className="h-3.5 w-3.5" /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* List */}
      {periodsQuery.isLoading ? (
        <p className="text-xs text-slate-400 py-4 text-center">Loading…</p>
      ) : periods.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#E9E5E0] py-8 text-center">
          <Calendar className="mx-auto h-7 w-7 text-slate-300 mb-2" />
          <p className="text-sm font-semibold text-slate-500">No occupancy periods set</p>
          <p className="text-xs text-slate-400 mt-1">This apartment shows as available for all dates.</p>
        </div>
      ) : (
        <div className="divide-y divide-[#E9E5E0] rounded-xl border border-[#E9E5E0] bg-white overflow-hidden">
          {periods.map((p) => (
            <div key={p.id} className="p-4">
              {editingId === p.id ? (
                <div className="space-y-3">
                  {formError && (
                    <p className="text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{formError}</p>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Start Date</span>
                      <input type="date" value={form.startDate} onChange={(e) => setForm((f) => ({ ...f, startDate: e.target.value }))} className={`mt-1 ${inputCls}`} />
                    </label>
                    <label className="block">
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">End Date</span>
                      <input type="date" value={form.endDate} onChange={(e) => setForm((f) => ({ ...f, endDate: e.target.value }))} className={`mt-1 ${inputCls}`} />
                    </label>
                  </div>
                  <input type="text" placeholder="Note (optional)" value={form.tenantNote} onChange={(e) => setForm((f) => ({ ...f, tenantNote: e.target.value }))} className={inputCls} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!form.startDate || !form.endDate || updateMutation.isPending}
                      onClick={() => updateMutation.mutate(p.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-4 py-2 text-xs font-semibold text-white transition hover:bg-accent-hover disabled:opacity-50"
                    >
                      <Check className="h-3.5 w-3.5" /> {updateMutation.isPending ? 'Saving…' : 'Update'}
                    </button>
                    <button type="button" onClick={cancelEdit} className="inline-flex items-center gap-1.5 rounded-lg border border-[#E9E5E0] bg-white px-4 py-2 text-xs font-semibold text-slate-600 transition hover:bg-[#F3F0EC]">
                      <X className="h-3.5 w-3.5" /> Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent mt-0.5">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-navy-950">
                        {formatDate(p.startDate)} — {formatDate(p.endDate)}
                      </p>
                      {p.tenantNote && (
                        <p className="text-xs text-slate-500 mt-0.5">{p.tenantNote}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => startEdit(p)}
                      className="flex h-7 w-7 items-center justify-center rounded border border-[#E9E5E0] text-slate-400 hover:text-accent hover:border-accent transition"
                      aria-label="Edit period"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {deletingId === p.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => deleteMutation.mutate(p.id)}
                          disabled={deleteMutation.isPending}
                          className="rounded bg-red-600 px-2 py-1 text-[11px] font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          Confirm
                        </button>
                        <button type="button" onClick={() => setDeletingId(null)} className="rounded border border-[#E9E5E0] px-2 py-1 text-[11px] font-semibold text-slate-600 hover:bg-[#F3F0EC]">
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setDeletingId(p.id)}
                        className="flex h-7 w-7 items-center justify-center rounded border border-[#E9E5E0] text-slate-400 hover:text-red-600 hover:border-red-200 transition"
                        aria-label="Delete period"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

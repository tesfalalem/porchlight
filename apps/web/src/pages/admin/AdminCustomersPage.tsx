import { useQuery } from '@tanstack/react-query';
import { UserPlus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/admin/DataTable';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { Pagination, paginate } from '../../components/common/Pagination';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchCustomers } from '../../services/customersApi';
import type { CustomerDto } from '@porchlight/shared';

const PAGE_SIZE = 10;

type TabType = 'all' | 'active' | 'in-process' | 'past' | 'new';

const TABS: { key: TabType; label: string; color: string }[] = [
  { key: 'all',        label: 'All',         color: '' },
  { key: 'new',        label: 'New',         color: 'text-sky-700' },
  { key: 'in-process', label: 'In Process',  color: 'text-amber-700' },
  { key: 'active',     label: 'Active',      color: 'text-emerald-700' },
  { key: 'past',       label: 'Past',        color: 'text-slate-500' },
];

function getStatus(c: CustomerDto): TabType {
  const n = c.notes?.toLowerCase() ?? '';
  if (n.includes('active') || n.includes('renting')) return 'active';
  if (n.includes('process') || n.includes('pending')) return 'in-process';
  if (n.includes('past') || n.includes('left') || n.includes('moved')) return 'past';
  return 'new'; // no status set = new customer
}

const STATUS_BADGE: Record<TabType, string> = {
  all:          '',
  new:          'bg-sky-100 text-sky-800',
  active:       'bg-emerald-100 text-emerald-800',
  'in-process': 'bg-amber-100 text-amber-800',
  past:         'bg-slate-100 text-slate-600',
};

const STATUS_LABEL: Record<TabType, string> = {
  all:          '',
  new:          'New',
  active:       'Active',
  'in-process': 'In Process',
  past:         'Past',
};

export function AdminCustomersPage() {
  useDocumentTitle('Customers');
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<TabType>('all');
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: ['admin', 'customers', search],
    queryFn: () => fetchCustomers(search || undefined),
  });

  const allCustomers = listQuery.data ?? [];

  const tabCounts = useMemo<Record<TabType, number>>(() => {
    const counts: Record<TabType, number> = { all: allCustomers.length, new: 0, active: 0, 'in-process': 0, past: 0 };
    allCustomers.forEach((c) => { counts[getStatus(c)]++; });
    return counts;
  }, [allCustomers]);

  const filteredCustomers = useMemo(() => {
    if (tab === 'all') return allCustomers;
    return allCustomers.filter((c) => getStatus(c) === tab);
  }, [allCustomers, tab]);

  const { slice: pageRows, pageCount } = useMemo(
    () => paginate(filteredCustomers, page, PAGE_SIZE),
    [filteredCustomers, page],
  );

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Resident Directory</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Customers</h1>
          <div className="mt-2 h-1 w-12 rounded-full bg-accent" />
          <p className="mt-2.5 text-sm text-slate-500">Manage tenants, track rental history, and register new customers.</p>
        </div>
        <Link
          to="/admin/customers/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-accent/25 transition hover:bg-accent-hover active:scale-95"
        >
          <UserPlus className="h-4 w-4" />
          Add Customer
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="mt-6 flex flex-wrap gap-2">
        {TABS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => { setTab(key); setPage(1); }}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
              tab === key
                ? 'bg-accent text-white shadow shadow-accent/25'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
            }`}
          >
            {label}
            <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
              tab === key ? 'bg-white/20 text-white' : 'bg-white text-slate-600'
            }`}>
              {tabCounts[key]}
            </span>
          </button>
        ))}
      </div>

      {/* Search */}
      <input
        type="search"
        placeholder="Search name, email, phone…"
        value={search}
        onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        className="mt-4 w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10"
      />

      {/* Table */}
      <div className="mt-6">
        {listQuery.isLoading ? <LoadingState /> : null}
        {listQuery.isError ? <ErrorState onRetry={() => void listQuery.refetch()} /> : null}
        {pageRows.length ? (
          <>
            <DataTable columns={['Customer', 'Contact', 'Status', 'Date Added']}>
              {pageRows.map((c) => {
                const status = getStatus(c);
                return (
                  <tr
                    key={c.id}
                    className="cursor-pointer hover:bg-slate-50"
                    onClick={() => navigate(`/admin/customers/${c.id}`)}
                  >
                    <td className="px-4 py-3">
                      <p className="font-bold text-navy-900">{c.name}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-slate-700">{c.email}</p>
                      <p className="text-xs text-slate-500">{c.phone}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-xl px-3 py-1 text-xs font-bold ${STATUS_BADGE[status]}`}>
                        {STATUS_LABEL[status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </DataTable>
            <Pagination className="mt-4" page={page} pageCount={pageCount} onPageChange={setPage} />
          </>
        ) : listQuery.isSuccess ? (
          <EmptyState message="No customers found." />
        ) : null}
      </div>
    </div>
  );
}

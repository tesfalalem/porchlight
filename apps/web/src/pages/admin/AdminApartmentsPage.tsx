import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/admin/DataTable';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { Pagination, paginate } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { formatPrice } from '../../utils/format';
import { fetchApartments } from '../../services/apartmentsApi';

export function AdminApartmentsPage() {
  useDocumentTitle('Apartments');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const apartmentsQuery = useQuery({
    queryKey: ['admin', 'apartments', search],
    queryFn: () => fetchApartments({
      includeArchived: false,
      search: search || undefined,
    }),
  });

  useEffect(() => { setPage(1); }, [search]);

  const { slice: rows, pageCount } = useMemo(() => {
    return paginate(apartmentsQuery.data ?? [], page, 10);
  }, [apartmentsQuery.data, page]);

  return (
    <div>
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-accent">Portfolio Management</p>
          <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Apartments</h1>
          <div className="mt-2 h-1 w-12 rounded-full bg-accent" />
          <p className="mt-2.5 text-sm text-slate-500">Manage 24 furnished residences, floor assignments, and live availability.</p>
        </div>
        <Link
          to="/admin/apartments/new"
          className="inline-flex items-center gap-2 rounded-xl bg-accent px-4 py-2.5 text-sm font-bold text-white shadow-sm shadow-accent/25 transition hover:bg-accent-hover active:scale-95"
        >
          + Add apartment
        </Link>
      </div>

      {/* Filters */}
      <div className="mt-5 flex flex-wrap gap-3">
        <input
          type="search"
          placeholder="Search by name, unit, location…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10"
        />
      </div>

      {/* Table */}
      <div className="mt-6">
        {apartmentsQuery.isLoading ? <LoadingState /> : null}
        {apartmentsQuery.isError ? <ErrorState onRetry={() => void apartmentsQuery.refetch()} /> : null}
        {rows.length ? (
          <>
            <DataTable columns={['Unit', 'Type', 'Price', 'Availability', 'Date']}>
              {rows.map((a) => (
                <tr
                  key={a.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/admin/apartments/${a.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-bold text-navy-900">{a.name}</p>
                    <p className="text-xs text-slate-400">{a.number}</p>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-600">{a.type}</td>
                  <td className="px-4 py-3 font-semibold text-navy-900">{formatPrice(a.price)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge status={a.availabilityStatus} availableFrom={a.availableFrom} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(a.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination className="mt-4" page={page} pageCount={pageCount} onPageChange={setPage} />
          </>
        ) : apartmentsQuery.isSuccess ? (
          <EmptyState message="No apartments found." />
        ) : null}
      </div>
    </div>
  );
}

import { useQuery } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DataTable } from '../../components/admin/DataTable';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { Pagination, paginate } from '../../components/common/Pagination';
import { StatusBadge } from '../../components/common/StatusBadge';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchInquiries } from '../../services/inquiriesApi';

export function AdminInquiriesPage() {
  useDocumentTitle('Inquiries');
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const listQuery = useQuery({
    queryKey: ['admin', 'inquiries', search],
    queryFn: () => fetchInquiries({ search: search || undefined }),
  });

  useEffect(() => { setPage(1); }, [search]);

  const inquiries = listQuery.data ?? [];
  const totalNew = inquiries.filter((i) => i.status === 'New').length;

  const { slice: pageRows, pageCount } = useMemo(
    () => paginate(inquiries, page, 10),
    [inquiries, page],
  );

  return (
    <div>
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Leasing &amp; Bookings</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Inquiries</h1>
        <div className="mt-2 h-1 w-12 rounded-full bg-accent" />
        <p className="mt-2.5 text-sm text-slate-500">
          Incoming requests and tour bookings submitted through the public website.
          {totalNew > 0 ? (
            <span className="ml-2 inline-flex items-center rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-bold text-accent">
              {totalNew} new
            </span>
          ) : null}
        </p>
      </div>

      {/* Search */}
      <div className="mt-5">
        <input
          type="search"
          placeholder="Search by subject, message, name, email, or phone…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:border-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900/10"
        />
      </div>

      {/* Table */}
      <div className="mt-6">
        {listQuery.isLoading ? <LoadingState /> : null}
        {listQuery.isError ? <ErrorState onRetry={() => void listQuery.refetch()} /> : null}
        {pageRows.length ? (
          <>
            <DataTable columns={['Subject & Message', 'Inquirer', 'Apartment', 'Status', 'Date']}>
              {pageRows.map((i) => (
                <tr
                  key={i.id}
                  className="cursor-pointer hover:bg-slate-50"
                  onClick={() => navigate(`/admin/inquiries/${i.id}`)}
                >
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy-900">{i.subject}</p>
                    <p className="mt-0.5 line-clamp-1 text-xs text-slate-400">{i.message}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-slate-800">{i.name || i.customer?.name || 'Website Inquirer'}</p>
                    <p className="text-xs text-slate-400">{i.phone || i.customer?.phone || i.email || i.customer?.email}</p>
                  </td>
                  <td className="px-4 py-3">
                    {i.apartment ? (
                      <span className="inline-flex items-center gap-1 rounded-lg bg-navy-900/8 px-2 py-1 text-xs font-medium text-navy-900">
                        {i.apartment.name} · {i.apartment.number}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">General</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={i.status} />
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(i.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </DataTable>
            <Pagination className="mt-4" page={page} pageCount={pageCount} onPageChange={setPage} />
          </>
        ) : listQuery.isSuccess ? (
          <EmptyState message="No public inquiries yet." />
        ) : null}
      </div>
    </div>
  );
}

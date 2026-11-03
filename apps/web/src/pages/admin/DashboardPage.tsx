import { useQuery } from '@tanstack/react-query';
import { Building2, Users, MessageSquare, CheckCircle, Clock, Home, TrendingUp } from 'lucide-react';
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Link } from 'react-router-dom';
import { ErrorState } from '../../components/common/ErrorState';
import { LoadingState } from '../../components/common/LoadingState';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { fetchDashboardStats } from '../../services/dashboardApi';

const AVAIL_COLORS: Record<string, string> = {
  Available:    '#10b981',
  Upcoming:     '#f59e0b',
  Occupied:     '#087EAE',
  'Coming Soon': '#f59e0b',
  Unavailable:  '#ef4444',
};

const INQUIRY_COLORS = ['#345beb', '#0ea5e9', '#f59e0b', '#10b981', '#94a3b8'];

export function DashboardPage() {
  useDocumentTitle('Dashboard');
  const query = useQuery({ queryKey: ['dashboard', 'stats'], queryFn: fetchDashboardStats });

  if (query.isLoading) return <LoadingState label="Loading dashboard…" />;
  if (query.isError || !query.data) return <ErrorState onRetry={() => void query.refetch()} />;

  const s = query.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <p className="text-xs font-bold uppercase tracking-widest text-accent">Management Overview</p>
        <h1 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-navy-950 sm:text-4xl">Dashboard</h1>
        <div className="mt-2 h-1 w-12 rounded-full bg-accent" />
        <p className="mt-2.5 text-sm text-slate-500">Live operational overview of Porchlight Apartment residences and inquiries.</p>
      </div>

      {/* ── Apartments Section ── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Building2 className="h-4 w-4 text-accent" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Apartments</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Units', value: s.totalApartments, icon: Home, color: 'bg-navy-900/8 text-navy-900' },
            { label: 'Available', value: s.available, icon: CheckCircle, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'Upcoming', value: s.upcoming ?? s.comingSoon, icon: Clock, color: 'bg-amber-100 text-amber-700' },
            { label: 'Occupied', value: s.occupied, icon: Building2, color: 'bg-sky-100 text-sky-700' },
          ].map(({ label, value, icon: Icon, color }) => (
            <Link key={label} to="/admin/apartments" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-navy-900/20">
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-3 text-3xl font-extrabold text-navy-900">{value}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Customers Section ── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <Users className="h-4 w-4 text-accent" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Customers</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Total Customers', value: s.totalCustomers, color: 'bg-navy-900/8 text-navy-900' },
            { label: 'Active Tenants', value: s.activeCustomers, color: 'bg-emerald-100 text-emerald-700' },
            { label: 'In Process', value: s.inProcessCustomers, color: 'bg-amber-100 text-amber-700' },
            { label: 'Past Tenants', value: s.pastCustomers, color: 'bg-slate-100 text-slate-600' },
          ].map(({ label, value, color }) => (
            <Link key={label} to="/admin/customers" className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md hover:border-navy-900/20">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-extrabold text-navy-900">{value}</p>
              <div className={`mt-2 inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ${color}`}>
                {label === 'Total Customers' ? 'All' : label.split(' ')[0]}
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Inquiries Section ── */}
      <div>
        <div className="mb-3 flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-accent" />
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Inquiries</p>
        </div>
        <Link to="/admin/inquiries" className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-6 py-4 shadow-sm transition hover:shadow-md hover:border-navy-900/20">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/15 text-accent">
            <MessageSquare className="h-5 w-5" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">New Inquiries</p>
            <p className="text-3xl font-extrabold text-navy-900">{s.newInquiries}</p>
          </div>
          {s.newInquiries > 0 && (
            <span className="ml-2 rounded-full bg-sky-100 px-3 py-1 text-xs font-bold text-sky-800">
              Needs attention
            </span>
          )}
        </Link>
      </div>

      {/* ── Charts ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Availability pie */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="h-4 w-4 text-accent" />
            <h2 className="font-bold text-navy-900">Apartment Availability</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">Distribution by status</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={s.availabilityDistribution}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  label={({ status, count }) => `${status}: ${count}`}
                  labelLine={false}
                >
                  {s.availabilityDistribution.map((entry) => (
                    <Cell key={entry.status} fill={AVAIL_COLORS[entry.status] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip formatter={(value, name) => [value, name]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-3 flex flex-wrap gap-3">
            {s.availabilityDistribution.map((d) => (
              <div key={d.status} className="flex items-center gap-1.5 text-xs">
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: AVAIL_COLORS[d.status] ?? '#94a3b8' }} />
                <span className="text-slate-600">{d.status} ({d.count})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inquiries bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-1">
            <MessageSquare className="h-4 w-4 text-accent" />
            <h2 className="font-bold text-navy-900">Inquiries by Status</h2>
          </div>
          <p className="text-xs text-slate-400 mb-4">From public website submissions</p>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={s.inquiriesByStatus} barCategoryGap="35%">
                <XAxis dataKey="status" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                  {s.inquiriesByStatus.map((_, i) => (
                    <Cell key={i} fill={INQUIRY_COLORS[i % INQUIRY_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ── Recent Inquiries ── */}
      {s.recentInquiries.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-accent" />
              <h2 className="font-bold text-navy-900">Recent Inquiries</h2>
            </div>
            <Link to="/admin/inquiries" className="text-xs font-semibold text-navy-800 hover:underline">
              View all →
            </Link>
          </div>
          <ul className="divide-y divide-slate-100">
            {s.recentInquiries.map((i) => (
              <li key={i.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-semibold text-navy-900">{i.subject}</p>
                  <p className="text-xs text-slate-400">{i.customerName}</p>
                </div>
                <div className="shrink-0 text-right">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
                    i.status === 'New' ? 'bg-sky-100 text-sky-800' :
                    i.status === 'Resolved' ? 'bg-emerald-100 text-emerald-800' :
                    i.status === 'Closed' ? 'bg-slate-100 text-slate-600' :
                    'bg-amber-100 text-amber-800'
                  }`}>
                    {i.status}
                  </span>
                  <p className="mt-0.5 text-xs text-slate-400">{new Date(i.createdAt).toLocaleDateString()}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

import clsx from 'clsx';
import { Building2, LayoutDashboard, LogOut, MessageSquare, Settings, Users } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const links = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/apartments', label: 'Apartments', icon: Building2 },
  { to: '/admin/customers', label: 'Customers', icon: Users },
  { to: '/admin/inquiries', label: 'Inquiries', icon: MessageSquare },
  { to: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminSidebar({ mobileOpen, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const { logout, admin } = useAuth();

  return (
    <aside
      className={clsx(
        'flex w-64 shrink-0 flex-col border-r border-navy-900/40 bg-navy-950 text-slate-200 shadow-xl z-30',
        mobileOpen ? 'fixed inset-y-0 left-0 z-40 md:static' : 'hidden md:flex',
      )}
    >
      <div className="border-b border-white/10 px-6 py-6">
        <div className="flex items-center gap-2">
          <p className="font-display text-xl font-bold tracking-tight text-white">Porchlight</p>
          <span className="h-2 w-2 rounded-full bg-accent" />
        </div>
        <p className="text-xs font-medium uppercase tracking-widest text-accent mt-0.5">Admin Portal</p>
        {admin ? <p className="mt-2 truncate text-xs font-medium text-slate-400 bg-white/5 rounded-lg px-2.5 py-1 border border-white/10">{admin.email}</p> : null}
      </div>

      <nav className="flex-1 space-y-1.5 p-4" aria-label="Admin">
        {links.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) =>
              clsx(
                'flex items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-accent text-white shadow-md shadow-accent/30'
                  : 'text-slate-300 hover:bg-white/10 hover:text-white',
              )
            }
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden />
            {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={() => {
            logout();
            window.location.href = '/admin/login';
          }}
          className="flex w-full items-center gap-3.5 rounded-2xl px-4 py-3 text-sm font-semibold text-slate-300 transition-colors hover:bg-rose-500/10 hover:text-rose-300"
        >
          <LogOut className="h-4 w-4" />
          Log out
        </button>
      </div>
    </aside>
  );
}

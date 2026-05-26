import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  HardHat,
  Wallet,
  LogOut,
  Zap,
} from 'lucide-react';
import clsx from 'clsx';

import { useAuthStore } from '../store/auth';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Utilisateurs', icon: Users },
  { to: '/professionals', label: 'Professionnels', icon: HardHat },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/withdrawals', label: 'Retraits', icon: Wallet },
];

export function Layout() {
  const navigate = useNavigate();
  const { user, clear } = useAuthStore();

  const logout = () => {
    clear();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-64 flex-col bg-taara-900 px-4 py-6 text-white lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2 text-lg font-bold">
          <Zap className="h-6 w-6 text-taara-500" />
          TAARA Admin
        </div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                  isActive
                    ? 'bg-taara-600/30 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white',
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-6 border-t border-white/10 pt-4">
          <div className="px-2 pb-3 text-xs text-slate-400">
            {user?.firstName} {user?.lastName}
            <div className="text-[10px] uppercase tracking-wider text-taara-500">
              {user?.userType}
            </div>
          </div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

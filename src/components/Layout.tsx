import { NavLink, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  HardHat,
  Wallet,
  LogOut,
  Zap,
  BadgeCheck,
} from 'lucide-react';
import clsx from 'clsx';

import { useAuthStore } from '../store/auth';
import { PageTransition } from './fx/Motion';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/users', label: 'Utilisateurs', icon: Users },
  { to: '/professionals', label: 'Professionnels', icon: HardHat },
  { to: '/subscriptions', label: 'Abonnements', icon: BadgeCheck },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/withdrawals', label: 'Retraits', icon: Wallet },
];

export function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const outlet = useOutlet();
  const { user, clear } = useAuthStore();

  const logout = () => {
    clear();
    navigate('/login');
  };

  return (
    <div className="relative flex min-h-screen">
      <aside className="sticky top-0 hidden h-screen w-64 flex-col border-r border-white/[0.08] bg-night-900 px-4 py-6 text-white lg:flex">
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8 flex items-center gap-2 px-2 font-display text-lg font-bold"
        >
          <span className="relative flex h-8 w-8 items-center justify-center rounded-md bg-taara-500">
            <Zap className="h-5 w-5 text-night-900" />
          </span>
          TAARA <span className="font-normal text-slate-400">Admin</span>
        </motion.div>
        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, label, icon: Icon, end }, i) => (
            <motion.div
              key={to}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 * i }}
            >
              <NavLink
                to={to}
                end={end}
                className={({ isActive }) =>
                  clsx(
                    'group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition',
                    isActive ? 'text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white',
                  )
                }
              >
                {({ isActive }) => (
                  <>
                    {isActive && (
                      <motion.span
                        layoutId="nav-active"
                        className="absolute inset-0 rounded-md border-l-2 border-taara-500 bg-white/[0.05]"
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 32,
                        }}
                      />
                    )}
                    <Icon className={clsx('relative h-4 w-4', isActive && 'text-taara-500')} />
                    <span className="relative">{label}</span>
                  </>
                )}
              </NavLink>
            </motion.div>
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

      <main className="relative flex-1 overflow-y-auto">
        {/* Navigation mobile */}
        <div className="sticky top-0 z-20 flex gap-1 overflow-x-auto border-b border-white/10 bg-night-900 px-3 py-2 lg:hidden">
          {NAV.map(({ to, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                clsx(
                  'whitespace-nowrap rounded-full px-3 py-1 text-xs',
                  isActive ? 'bg-taara-500 text-night-900' : 'text-slate-300',
                )
              }
            >
              {label}
            </NavLink>
          ))}
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
          <AnimatePresence mode="wait">
            <PageTransition key={location.pathname}>{outlet}</PageTransition>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

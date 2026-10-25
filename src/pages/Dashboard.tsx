import { lazy, Suspense, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users,
  HardHat,
  Briefcase,
  Coins,
  TrendingUp,
  BadgeCheck,
  Hourglass,
} from 'lucide-react';

import { api } from '../lib/api';
import { CountUp, StatCard } from '../components/fx/Motion';
import { SafeCanvas } from '../components/three/Backdrop';
import { hasWebGL, GOLD } from '../components/three/support';

const NEUTRAL = '#5b6578';

const MetricsScene = lazy(() => import('../components/three/MetricsScene'));

interface Report {
  users: { total: number; clients: number; pros: number; verifiedPros: number };
  jobs: { total: number; completed: number; active: number };
  diagnostics: { last30Days: number };
  subscriptions: {
    active: number;
    paying: number;
    trial: number;
    expired: number;
    monthlyRevenue: number;
    lifetimeRevenue: number;
    monthlyPrice: number;
    currency: string;
  };
  revenue: {
    monthlyGross: number;
    monthlyCommission: number;
    lifetimeCommission: number;
    currency: string;
  };
}

const fcfa = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA';

export function DashboardPage() {
  const { data, isLoading } = useQuery<Report>({
    queryKey: ['admin', 'reports'],
    queryFn: async () => (await api.get<Report>('/admin/reports')).data,
  });
  const webgl = useMemo(() => hasWebGL(), []);

  const metrics = data
    ? [
        { label: 'Utilisateurs', value: data.users.total, color: NEUTRAL },
        { label: 'Pros', value: data.users.pros, color: NEUTRAL },
        {
          label: 'Abonnés',
          value: data.subscriptions.paying,
          color: GOLD,
        },
        {
          label: 'En essai',
          value: data.subscriptions.trial,
          color: NEUTRAL,
        },
        { label: 'Jobs', value: data.jobs.total, color: NEUTRAL },
        {
          label: 'Diagnostics 30j',
          value: data.diagnostics.last30Days,
          color: NEUTRAL,
        },
      ]
    : [];

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight">Tableau de bord</h1>
        <p className="mt-1 text-sm text-slate-400">
          Vue d'ensemble de la plateforme, en temps réel.
        </p>
      </motion.div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <motion.div
            className="h-12 w-12 rounded-full border-2 border-taara-500/30 border-t-taara-500"
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 0.9, ease: 'linear' }}
          />
        </div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              delay={0}
              icon={<Users className="h-5 w-5 text-slate-400" />}
              label="Utilisateurs"
              value={data.users.total}
              hint={`${data.users.clients} clients · ${data.users.pros} pros`}
            />
            <Stat
              delay={0.06}
              icon={<HardHat className="h-5 w-5 text-slate-400" />}
              label="Pros vérifiés"
              value={data.users.verifiedPros}
              hint={`sur ${data.users.pros} pros`}
            />
            <Stat
              delay={0.12}
              icon={<Briefcase className="h-5 w-5 text-slate-400" />}
              label="Jobs terminés"
              value={data.jobs.completed}
              hint={`${data.jobs.active} en cours · ${data.jobs.total} total`}
            />
            <Stat
              delay={0.18}
              icon={<TrendingUp className="h-5 w-5 text-slate-400" />}
              label="Diagnostics (30j)"
              value={data.diagnostics.last30Days}
            />
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.25, duration: 0.6 }}
            className="card relative mt-6 overflow-hidden p-0"
          >
            <div className="flex items-center justify-between px-5 pt-5">
              <div className="flex items-center gap-2 text-sm text-slate-300">Vue d’ensemble</div>
              <div className="text-xs text-slate-500">Faites glisser pour tourner</div>
            </div>
            <div className="h-[340px] w-full">
              {webgl ? (
                <SafeCanvas>
                  <Suspense fallback={<FlatBars metrics={metrics} />}>
                    <MetricsScene metrics={metrics} />
                  </Suspense>
                </SafeCanvas>
              ) : (
                <FlatBars metrics={metrics} />
              )}
            </div>
          </motion.div>

          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              delay={0.3}
              icon={<BadgeCheck className="h-5 w-5 text-slate-400" />}
              label="Pros abonnés (payants)"
              value={data.subscriptions.paying}
              hint={`${data.subscriptions.trial} en essai gratuit`}
            />
            <Stat
              delay={0.36}
              icon={<Hourglass className="h-5 w-5 text-slate-400" />}
              label="Abonnements expirés"
              value={data.subscriptions.expired}
              hint="Pros masqués dans l'app"
            />
            <Money
              delay={0.42}
              label="Abonnements — ce mois"
              value={data.subscriptions.monthlyRevenue}
              sub={`${fcfa(data.subscriptions.monthlyPrice)} / pro / mois`}
              highlight
            />
            <Money
              delay={0.48}
              label="Abonnements — cumul"
              value={data.subscriptions.lifetimeRevenue}
              sub="Revenus TAARA depuis le début"
            />
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <Money
              delay={0.54}
              label="Volume des jobs payés (ce mois)"
              value={data.revenue.monthlyGross}
              sub="Payé en direct aux pros — non encaissé par TAARA"
            />
          </div>
        </>
      ) : null}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
  hint,
  delay,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  delay: number;
}) {
  return (
    <StatCard delay={delay}>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="rounded-lg bg-white/5 p-1.5">{icon}</span>
      </div>
      <div className="font-display text-3xl font-semibold">
        <CountUp value={value} />
      </div>
      {hint ? <div className="mt-1 text-xs text-slate-500">{hint}</div> : null}
    </StatCard>
  );
}

function Money({
  label,
  value,
  sub,
  delay,
  highlight,
}: {
  label: string;
  value: number;
  sub: string;
  delay: number;
  highlight?: boolean;
}) {
  return (
    <StatCard delay={delay} className={highlight ? 'border-taara-500/30' : undefined}>
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-400">
        <Coins className="h-4 w-4 text-taara-500" />
        {label}
      </div>
      <div
        className={
          highlight
            ? 'font-display text-2xl font-semibold text-taara-500'
            : 'font-display text-2xl font-semibold'
        }
      >
        <CountUp value={value} format={fcfa} />
      </div>
      <div className="mt-1 text-xs text-slate-500">{sub}</div>
    </StatCard>
  );
}

/** Repli sans WebGL : histogramme animé en CSS. */
function FlatBars({ metrics }: { metrics: { label: string; value: number; color?: string }[] }) {
  const max = Math.max(1, ...metrics.map((m) => m.value));
  return (
    <div className="flex h-full items-end justify-center gap-6 px-6 pb-8">
      {metrics.map((m, i) => (
        <div key={m.label} className="flex w-16 flex-col items-center gap-2">
          <div className="font-display text-sm font-semibold">
            {m.value.toLocaleString('fr-FR')}
          </div>
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: `${20 + (m.value / max) * 200}px` }}
            transition={{
              delay: 0.1 * i,
              type: 'spring',
              stiffness: 120,
              damping: 14,
            }}
            className="w-full rounded-t-lg"
            style={{
              background: `linear-gradient(to top, ${m.color ?? GOLD}55, ${m.color ?? GOLD})`,
              boxShadow: `0 0 24px ${m.color ?? GOLD}55`,
            }}
          />
          <div className="text-center text-[10px] uppercase tracking-wider text-slate-400">
            {m.label}
          </div>
        </div>
      ))}
    </div>
  );
}

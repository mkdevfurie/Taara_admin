import { useQuery } from '@tanstack/react-query';
import { Users, HardHat, Briefcase, Coins, TrendingUp } from 'lucide-react';
import { api } from '../lib/api';

interface Report {
  users: { total: number; clients: number; pros: number; verifiedPros: number };
  jobs: { total: number; completed: number; active: number };
  diagnostics: { last30Days: number };
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

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Dashboard</h1>
      <p className="mb-6 text-sm text-slate-500">Vue d'ensemble de la plateforme TAARA.</p>

      {isLoading ? (
        <div className="text-sm text-slate-500">Chargement…</div>
      ) : data ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat
              icon={<Users className="h-5 w-5 text-taara-600" />}
              label="Utilisateurs"
              value={data.users.total}
              hint={`${data.users.clients} clients · ${data.users.pros} pros`}
            />
            <Stat
              icon={<HardHat className="h-5 w-5 text-emerald-600" />}
              label="Pros vérifiés"
              value={data.users.verifiedPros}
              hint={`sur ${data.users.pros} pros`}
            />
            <Stat
              icon={<Briefcase className="h-5 w-5 text-amber-600" />}
              label="Jobs terminés"
              value={data.jobs.completed}
              hint={`${data.jobs.active} en cours · ${data.jobs.total} total`}
            />
            <Stat
              icon={<TrendingUp className="h-5 w-5 text-rose-600" />}
              label="Diagnostics (30j)"
              value={data.diagnostics.last30Days}
            />
          </div>

          <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
            <RevenueCard
              label="Revenus du mois"
              value={fcfa(data.revenue.monthlyGross)}
              sub={`Commission : ${fcfa(data.revenue.monthlyCommission)}`}
            />
            <RevenueCard
              label="Commission cumulée"
              value={fcfa(data.revenue.lifetimeCommission)}
              sub="Depuis le début"
            />
            <RevenueCard
              label="Devise"
              value={data.revenue.currency}
              sub="XOF (Franc CFA)"
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
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div className="card">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        {icon}
      </div>
      <div className="text-2xl font-semibold">{value}</div>
      {hint ? <div className="mt-1 text-xs text-slate-400">{hint}</div> : null}
    </div>
  );
}

function RevenueCard({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="card">
      <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
        <Coins className="h-4 w-4 text-taara-600" />
        {label}
      </div>
      <div className="text-xl font-semibold">{value}</div>
      <div className="mt-1 text-xs text-slate-400">{sub}</div>
    </div>
  );
}

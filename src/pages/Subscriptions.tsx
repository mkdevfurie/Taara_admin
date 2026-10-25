import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';
import { AxiosError } from 'axios';

import { api } from '../lib/api';

type Status = 'trial' | 'active' | 'expired' | 'none';
type Channel = 'T_MONEY' | 'FLOOZ' | 'CASH' | 'OTHER' | 'TRIAL';

interface SubscriptionRow {
  id: string;
  subscriptionEndsAt: string | null;
  subscriptionStatus: Status;
  specialties: string[];
  serviceZone: string[];
  isVerified: boolean;
  user: { id: string; firstName: string; lastName: string; email: string; phone: string };
  subscriptions: {
    channel: Channel;
    amount: number;
    reference: string | null;
    createdAt: string;
  }[];
}

interface Paged<T> {
  items: T[];
  total: number;
}

interface Plans {
  monthlyPrice: number;
  trialMonths: number;
  paymentNumbers: { tMoney: string | null; flooz: string | null };
}

const STATUS: Record<Status, { label: string; className: string }> = {
  trial: { label: 'Essai', className: 'bg-sky-500/15 text-sky-300' },
  active: { label: 'Actif', className: 'bg-emerald-500/15 text-emerald-300' },
  expired: { label: 'Expiré', className: 'bg-rose-500/15 text-rose-300' },
  none: { label: 'Aucun', className: 'bg-white/10 text-slate-300' },
};

const CHANNELS: { value: Channel; label: string }[] = [
  { value: 'T_MONEY', label: 'T-Money' },
  { value: 'FLOOZ', label: 'Flooz' },
  { value: 'CASH', label: 'Espèces' },
  { value: 'OTHER', label: 'Autre' },
  { value: 'TRIAL', label: 'Offert (gratuit)' },
];

const fcfa = (n: number) =>
  new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(n) + ' FCFA';
const date = (s: string | null) => (s ? new Date(s).toLocaleDateString('fr-FR') : '—');

export function SubscriptionsPage() {
  const [filter, setFilter] = useState<Status | 'all'>('all');
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<SubscriptionRow | null>(null);

  const { data: plans } = useQuery<Plans>({
    queryKey: ['subscriptions', 'plans'],
    queryFn: async () => (await api.get<Plans>('/subscriptions/plans')).data,
  });

  const { data, isLoading } = useQuery<Paged<SubscriptionRow>>({
    queryKey: ['admin', 'subscriptions', filter, q],
    queryFn: async () =>
      (
        await api.get<Paged<SubscriptionRow>>('/admin/subscriptions', {
          params: {
            status: filter === 'all' ? undefined : filter,
            q: q || undefined,
            perPage: 100,
          },
        })
      ).data,
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Abonnements des pros</h1>
      <p className="mb-6 text-sm text-slate-400">
        Le pro paie {plans ? fcfa(plans.monthlyPrice) : '…'} / mois par Mobile Money
        {plans?.paymentNumbers.tMoney ? ` (T-Money ${plans.paymentNumbers.tMoney})` : ''}
        {plans?.paymentNumbers.flooz ? ` (Flooz ${plans.paymentNumbers.flooz})` : ''}. Vérifiez la
        réception du paiement, puis activez ou prolongez son abonnement. Seuls les pros actifs ou en
        essai apparaissent dans l'app.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <input
          className="input max-w-xs"
          placeholder="Nom, email ou téléphone…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        {(['all', 'trial', 'active', 'expired'] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={clsx(
              'rounded-full px-3 py-1 text-xs font-medium',
              filter === s
                ? 'bg-taara-600 text-white'
                : 'bg-white/5 text-slate-300 ring-1 ring-white/10',
            )}
          >
            {s === 'all' ? 'Tous' : STATUS[s].label}
          </button>
        ))}
      </div>

      <div className="card overflow-x-auto p-0">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3">Pro</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Fin</th>
              <th className="px-4 py-3">Dernier paiement</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Chargement…
                </td>
              </tr>
            ) : data && data.items.length > 0 ? (
              data.items.map((p) => {
                const last = p.subscriptions[0];
                return (
                  <tr key={p.id} className="border-b border-white/10 last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {p.user.firstName} {p.user.lastName}
                      </div>
                      <div className="text-xs text-slate-400">
                        {p.user.phone} · {p.user.email}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={clsx(
                          'rounded-full px-2 py-0.5 text-xs font-medium',
                          STATUS[p.subscriptionStatus].className,
                        )}
                      >
                        {STATUS[p.subscriptionStatus].label}
                      </span>
                    </td>
                    <td className="px-4 py-3">{date(p.subscriptionEndsAt)}</td>
                    <td className="px-4 py-3 text-xs text-slate-400">
                      {last
                        ? `${CHANNELS.find((c) => c.value === last.channel)?.label ?? last.channel} · ${fcfa(last.amount)}${last.reference ? ` · réf. ${last.reference}` : ''}`
                        : '—'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button onClick={() => setEditing(p)} className="btn-primary">
                        <CalendarPlus className="h-4 w-4" />
                        {p.subscriptionStatus === 'expired' || p.subscriptionStatus === 'none'
                          ? 'Activer'
                          : 'Prolonger'}
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Aucun pro pour ce filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="mt-3 text-xs text-slate-400">{data ? `${data.total} pros` : ''}</div>

      {editing && plans ? (
        <ActivateModal
          pro={editing}
          monthlyPrice={plans.monthlyPrice}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </div>
  );
}

function ActivateModal({
  pro,
  monthlyPrice,
  onClose,
}: {
  pro: SubscriptionRow;
  monthlyPrice: number;
  onClose: () => void;
}) {
  const queryClient = useQueryClient();
  const [months, setMonths] = useState(1);
  const [channel, setChannel] = useState<Channel>('T_MONEY');
  const [amount, setAmount] = useState(String(monthlyPrice));
  const [reference, setReference] = useState('');

  const free = channel === 'TRIAL';
  const activate = useMutation({
    mutationFn: () =>
      api.post(`/admin/professionals/${pro.id}/subscription`, {
        months,
        channel,
        amount: free ? 0 : Number(amount),
        reference: reference.trim() || undefined,
      }),
    onSuccess: () => {
      toast.success('Abonnement mis à jour');
      queryClient.invalidateQueries({ queryKey: ['admin', 'subscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'reports'] });
      onClose();
    },
    onError: (e: AxiosError<{ message?: string | string[] }>) => {
      const m = e.response?.data?.message;
      toast.error(Array.isArray(m) ? m.join(', ') : (m ?? 'Erreur lors de l’activation'));
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="card w-full max-w-md">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Abonnement — {pro.user.firstName} {pro.user.lastName}
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-300"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mb-4 text-xs text-slate-400">
          Fin actuelle : {date(pro.subscriptionEndsAt)}. La durée s'ajoute à la fin actuelle si
          l'abonnement est encore en cours, sinon elle part d'aujourd'hui.
        </p>

        <label className="mb-1 block text-xs font-medium text-slate-300">Durée</label>
        <div className="mb-4 flex gap-2">
          {[1, 3, 6, 12].map((m) => (
            <button
              key={m}
              onClick={() => {
                setMonths(m);
                setAmount(String(monthlyPrice * m));
              }}
              className={clsx(
                'flex-1 rounded-lg px-3 py-2 text-sm',
                months === m ? 'bg-taara-600 text-white' : 'bg-white/10 text-slate-200',
              )}
            >
              {m} mois
            </button>
          ))}
        </div>

        <label className="mb-1 block text-xs font-medium text-slate-300">Moyen de paiement</label>
        <select
          className="input mb-4"
          value={channel}
          onChange={(e) => setChannel(e.target.value as Channel)}
        >
          {CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>

        {!free ? (
          <>
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Montant reçu (FCFA)
            </label>
            <input
              className="input mb-4"
              type="number"
              min={0}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <label className="mb-1 block text-xs font-medium text-slate-300">
              Référence de la transaction (recommandé)
            </label>
            <input
              className="input mb-4"
              placeholder="Ex : ID de transaction T-Money"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </>
        ) : null}

        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="btn-outline">
            Annuler
          </button>
          <button
            onClick={() => activate.mutate()}
            disabled={activate.isPending || (!free && !(Number(amount) >= 0))}
            className="btn-primary"
          >
            Valider {months} mois
          </button>
        </div>
      </div>
    </div>
  );
}

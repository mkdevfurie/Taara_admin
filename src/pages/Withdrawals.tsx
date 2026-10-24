import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

import { api } from '../lib/api';

interface Withdrawal {
  id: string;
  amount: number;
  description: string | null;
  createdAt: string;
  wallet: {
    user: { id: string; firstName: string; lastName: string; email: string; phone: string };
  };
}

export function WithdrawalsPage() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Withdrawal[]>({
    queryKey: ['admin', 'withdrawals'],
    queryFn: async () => (await api.get<Withdrawal[]>('/admin/withdrawals/pending')).data,
  });

  const approve = useMutation({
    mutationFn: (id: string) => api.post(`/admin/withdrawals/${id}/approve`),
    onSuccess: () => {
      toast.success('Retrait validé');
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
    },
    onError: () => toast.error('Erreur de validation'),
  });

  const reject = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      api.post(`/admin/withdrawals/${id}/reject`, { reason }),
    onSuccess: () => {
      toast.success('Retrait refusé — montant recrédité');
      queryClient.invalidateQueries({ queryKey: ['admin', 'withdrawals'] });
    },
    onError: () => toast.error('Erreur lors du refus'),
  });

  const askReject = (id: string) => {
    const reason = window.prompt('Motif du refus (visible par le pro) :');
    if (reason === null) return;
    reject.mutate({ id, reason: reason.trim() || undefined });
  };

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Retraits en attente</h1>
      <p className="mb-6 text-sm text-slate-500">
        Vérifiez le compte du pro, effectuez le virement / Mobile Money, puis validez.
      </p>

      {isLoading ? (
        <div className="text-sm text-slate-500">Chargement…</div>
      ) : data && data.length > 0 ? (
        <div className="space-y-3">
          {data.map((w) => (
            <div key={w.id} className="card flex items-center justify-between">
              <div>
                <div className="font-medium">
                  {w.wallet.user.firstName} {w.wallet.user.lastName}
                </div>
                <div className="text-xs text-slate-400">
                  {w.wallet.user.email} · {w.wallet.user.phone}
                </div>
                <div className="mt-1 text-xs text-slate-500">{w.description}</div>
                <div className="mt-1 text-xs text-slate-400">
                  {new Date(w.createdAt).toLocaleString('fr-FR')}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-xs text-slate-400">Montant</div>
                  <div className="text-lg font-semibold text-taara-700">
                    {Math.abs(w.amount).toLocaleString('fr-FR')} FCFA
                  </div>
                </div>
                <button
                  onClick={() => askReject(w.id)}
                  disabled={reject.isPending || approve.isPending}
                  className="btn-outline text-red-600"
                >
                  <XCircle className="h-4 w-4" /> Refuser
                </button>
                <button
                  onClick={() => approve.mutate(w.id)}
                  disabled={approve.isPending || reject.isPending}
                  className="btn-primary"
                >
                  <CheckCircle2 className="h-4 w-4" /> Valider
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card text-center text-sm text-slate-500">
          Aucun retrait en attente.
        </div>
      )}
    </div>
  );
}

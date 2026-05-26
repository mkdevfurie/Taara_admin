import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, ShieldX, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import { api } from '../lib/api';

interface ProUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  isBanned: boolean;
}

interface Pro {
  id: string;
  specialties: string[];
  certifications: string[];
  experience: number;
  bio: string | null;
  serviceZone: string[];
  isVerified: boolean;
  rating: number;
  totalJobs: number;
  hourlyRate: number;
  user: ProUser;
}

interface Paged<T> {
  items: T[];
  total: number;
}

export function ProfessionalsPage() {
  const [filter, setFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Paged<Pro>>({
    queryKey: ['admin', 'pros', filter],
    queryFn: async () =>
      (
        await api.get<Paged<Pro>>('/admin/professionals', {
          params: {
            verifiedOnly: filter === 'verified' ? true : filter === 'unverified' ? false : undefined,
            perPage: 50,
          },
        })
      ).data,
  });

  const verify = useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean }) =>
      api.put(`/admin/professionals/${id}/verify`, { verified }),
    onSuccess: (_d, vars) => {
      toast.success(vars.verified ? 'Pro vérifié' : 'Vérification retirée');
      queryClient.invalidateQueries({ queryKey: ['admin', 'pros'] });
    },
    onError: () => toast.error('Erreur lors de la vérification'),
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Professionnels</h1>
      <p className="mb-6 text-sm text-slate-500">Validez ou retirez la vérification des pros.</p>

      <div className="mb-4 flex gap-2">
        {(['all', 'verified', 'unverified'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'btn',
              filter === f ? 'bg-taara-600 text-white' : 'bg-white text-slate-600 border border-slate-200',
            )}
          >
            {f === 'all' ? 'Tous' : f === 'verified' ? 'Vérifiés' : 'À vérifier'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-500">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.items.map((p) => (
            <div key={p.id} className="card">
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <div className="font-semibold">
                    {p.user.firstName} {p.user.lastName}
                  </div>
                  <div className="text-xs text-slate-400">{p.user.email}</div>
                </div>
                {p.isVerified ? (
                  <span className="badge bg-emerald-100 text-emerald-700">Vérifié</span>
                ) : (
                  <span className="badge bg-amber-100 text-amber-700">À vérifier</span>
                )}
              </div>
              <div className="mt-2 flex flex-wrap gap-1">
                {p.specialties.map((s) => (
                  <span key={s} className="badge bg-taara-100 text-taara-700">
                    {s}
                  </span>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <div className="text-slate-400">Tarif</div>
                  <div className="font-medium">{p.hourlyRate} FCFA/h</div>
                </div>
                <div>
                  <div className="text-slate-400">Jobs</div>
                  <div className="font-medium">{p.totalJobs}</div>
                </div>
                <div>
                  <div className="text-slate-400">Note</div>
                  <div className="flex items-center gap-1 font-medium">
                    <Star className="h-3 w-3 text-amber-500" />
                    {p.rating.toFixed(1)}
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Zones : {p.serviceZone.join(', ') || '—'}
              </div>
              <div className="mt-2 text-xs text-slate-500">
                {p.certifications.length} certification(s)
              </div>
              <div className="mt-4 flex gap-2">
                {p.isVerified ? (
                  <button
                    onClick={() => verify.mutate({ id: p.id, verified: false })}
                    className="btn-outline text-xs"
                  >
                    <ShieldX className="h-3.5 w-3.5" /> Retirer
                  </button>
                ) : (
                  <button
                    onClick={() => verify.mutate({ id: p.id, verified: true })}
                    className="btn-primary text-xs"
                  >
                    <ShieldCheck className="h-3.5 w-3.5" /> Vérifier
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

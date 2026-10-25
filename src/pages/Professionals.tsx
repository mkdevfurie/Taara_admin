import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FileText, Phone, ShieldCheck, ShieldX, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import { api } from '../lib/api';

interface ProUser {
  id: string;
  email: string;
  phone: string;
  createdAt: string;
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
  guarantorName: string | null;
  guarantorPhone: string | null;
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
            verifiedOnly:
              filter === 'verified' ? true : filter === 'unverified' ? false : undefined,
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
      <p className="mb-6 text-sm text-slate-400">
        Aucun diplôme n'est exigé. Avant de vérifier un pro : appelez-le, regardez ses preuves
        (photos de réparations, atelier, attestation…) ou appelez sa personne garante. Il est prévenu
        dans l'app dès que vous validez.
      </p>

      <div className="mb-4 flex gap-2">
        {(['all', 'verified', 'unverified'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={clsx(
              'btn',
              filter === f
                ? 'bg-taara-500 text-night-900'
                : 'border border-white/10 text-slate-300',
            )}
          >
            {f === 'all' ? 'Tous' : f === 'verified' ? 'Vérifiés' : 'À vérifier'}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-sm text-slate-400">Chargement…</div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {data?.items.map((p) => {
            const missing = [
              p.specialties.length === 0 && 'spécialités',
              p.serviceZone.length === 0 && 'zone',
              !p.hourlyRate && 'tarif',
              (p.bio ?? '').trim().length < 20 && 'présentation',
              p.certifications.length === 0 && !p.guarantorPhone && 'preuves ou garant',
            ].filter(Boolean) as string[];
            return (
              <div key={p.id} className="card flex flex-col">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold">
                      {p.user.firstName} {p.user.lastName}
                    </div>
                    <div className="text-xs text-slate-400">{p.user.email}</div>
                  </div>
                  {p.isVerified ? (
                    <span className="badge bg-emerald-500/15 text-emerald-300">Vérifié</span>
                  ) : (
                    <span className="badge bg-amber-500/15 text-amber-300">À vérifier</span>
                  )}
                </div>
                <a
                  href={`tel:${p.user.phone}`}
                  className="flex items-center gap-1.5 text-sm text-slate-200 hover:text-taara-500"
                >
                  <Phone className="h-3.5 w-3.5" /> {p.user.phone}
                </a>
                <div className="mt-3 flex flex-wrap gap-1">
                  {p.specialties.map((s) => (
                    <span key={s} className="badge bg-white/10 text-slate-200">
                      {s}
                    </span>
                  ))}
                </div>
                {p.bio ? <p className="mt-3 line-clamp-3 text-sm text-slate-300">{p.bio}</p> : null}
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <div className="text-slate-400">Tarif</div>
                    <div className="font-medium">
                      {p.hourlyRate ? `${p.hourlyRate} FCFA/h` : '—'}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Expérience</div>
                    <div className="font-medium">{p.experience ? `${p.experience} ans` : '—'}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Note</div>
                    <div className="flex items-center gap-1 font-medium">
                      <Star className="h-3 w-3 text-amber-500" />
                      {p.rating ? p.rating.toFixed(1) : '—'} · {p.totalJobs} jobs
                    </div>
                  </div>
                </div>
                <div className="mt-2 text-xs text-slate-400">
                  Zones : {p.serviceZone.join(', ') || '—'}
                </div>

                <div className="mt-3">
                  <div className="mb-1.5 text-xs text-slate-400">
                    Justificatifs ({p.certifications.length})
                  </div>
                  {p.certifications.length ? (
                    <div className="flex flex-wrap gap-2">
                      {p.certifications.map((url, i) =>
                        url.toLowerCase().endsWith('.pdf') ? (
                          <a
                            key={url}
                            href={url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex h-16 w-16 flex-col items-center justify-center gap-1 rounded-md border border-white/10 text-[10px] text-slate-300 hover:border-taara-500"
                          >
                            <FileText className="h-5 w-5" /> PDF {i + 1}
                          </a>
                        ) : (
                          <a key={url} href={url} target="_blank" rel="noopener noreferrer">
                            <img
                              src={url}
                              alt={`Justificatif ${i + 1}`}
                              className="h-16 w-16 rounded-md border border-white/10 object-cover hover:border-taara-500"
                            />
                          </a>
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-500">Aucun document envoyé.</div>
                  )}
                </div>

                {p.guarantorPhone ? (
                  <div className="mt-3 rounded-md border border-white/10 px-3 py-2 text-xs">
                    <div className="text-slate-400">Personne garante</div>
                    <div className="mt-0.5 text-slate-200">
                      {p.guarantorName || 'Sans nom'} ·{' '}
                      <a href={`tel:${p.guarantorPhone}`} className="hover:text-taara-500">
                        {p.guarantorPhone}
                      </a>
                    </div>
                  </div>
                ) : null}

                {missing.length && !p.isVerified ? (
                  <div className="mt-3 rounded-md bg-amber-500/10 px-3 py-2 text-xs text-amber-300">
                    Fiche incomplète : {missing.join(', ')}
                  </div>
                ) : null}

                <div className="mt-auto flex gap-2 pt-4">
                  {p.isVerified ? (
                    <button
                      onClick={() => verify.mutate({ id: p.id, verified: false })}
                      className="btn-outline text-xs"
                    >
                      <ShieldX className="h-3.5 w-3.5" /> Retirer
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (
                          missing.length &&
                          !window.confirm(
                            `Fiche incomplète (${missing.join(', ')}). Vérifier ce pro quand même ?`,
                          )
                        )
                          return;
                        verify.mutate({ id: p.id, verified: true });
                      }}
                      className="btn-primary text-xs"
                    >
                      <ShieldCheck className="h-3.5 w-3.5" /> Vérifier
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

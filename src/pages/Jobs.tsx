import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import clsx from 'clsx';
import { api } from '../lib/api';

type JobStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

interface Job {
  id: string;
  status: JobStatus;
  quotedPrice: number;
  actualPrice?: number;
  createdAt: string;
  jobRequest: { client: { firstName: string; lastName: string } };
  professional: { user: { firstName: string; lastName: string } };
  diagnostic: { problemType: string };
}

interface Paged<T> {
  items: T[];
  total: number;
}

const STATUS_COLORS: Record<JobStatus, string> = {
  PENDING: 'bg-amber-100 text-amber-300',
  ACCEPTED: 'bg-blue-100 text-blue-700',
  IN_PROGRESS: 'bg-indigo-100 text-indigo-700',
  COMPLETED: 'bg-emerald-100 text-emerald-300',
  CANCELLED: 'bg-rose-100 text-rose-300',
};

export function JobsPage() {
  const [status, setStatus] = useState<JobStatus | ''>('');

  const { data, isLoading } = useQuery<Paged<Job>>({
    queryKey: ['admin', 'jobs', status],
    queryFn: async () =>
      (
        await api.get<Paged<Job>>('/admin/jobs', {
          params: { status: status || undefined, perPage: 50 },
        })
      ).data,
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Jobs</h1>
      <p className="mb-6 text-sm text-slate-400">Tous les jobs de la plateforme.</p>

      <div className="mb-4 flex flex-wrap gap-2">
        {(['', 'PENDING', 'ACCEPTED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'] as const).map(
          (s) => (
            <button
              key={s || 'all'}
              onClick={() => setStatus(s)}
              className={clsx(
                'btn text-xs',
                status === s
                  ? 'bg-taara-600 text-white'
                  : 'bg-white/5 text-slate-300 border border-white/10',
              )}
            >
              {s || 'Tous'}
            </button>
          ),
        )}
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-white/5 text-left text-xs uppercase tracking-wider text-slate-400">
            <tr>
              <th className="px-4 py-3">Client</th>
              <th className="px-4 py-3">Pro</th>
              <th className="px-4 py-3">Type</th>
              <th className="px-4 py-3">Prix</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3">Date</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                  Chargement…
                </td>
              </tr>
            ) : (
              data?.items.map((j) => (
                <tr key={j.id} className="border-t border-white/10">
                  <td className="px-4 py-3">
                    {j.jobRequest.client.firstName} {j.jobRequest.client.lastName}
                  </td>
                  <td className="px-4 py-3">
                    {j.professional.user.firstName} {j.professional.user.lastName}
                  </td>
                  <td className="px-4 py-3 text-slate-300">{j.diagnostic.problemType}</td>
                  <td className="px-4 py-3">{j.actualPrice ?? j.quotedPrice} FCFA</td>
                  <td className="px-4 py-3">
                    <span className={clsx('badge', STATUS_COLORS[j.status])}>{j.status}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-400">
                    {new Date(j.createdAt).toLocaleDateString('fr-FR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-white/10 px-4 py-3 text-xs text-slate-400">
          {data ? `${data.total} jobs` : ''}
        </div>
      </div>
    </div>
  );
}

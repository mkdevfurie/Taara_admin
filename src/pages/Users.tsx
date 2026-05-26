import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Ban, CheckCircle2, Search } from 'lucide-react';
import toast from 'react-hot-toast';
import clsx from 'clsx';

import { api } from '../lib/api';

interface User {
  id: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  userType: 'CLIENT' | 'PRO' | 'ADMIN';
  isVerified: boolean;
  isBanned: boolean;
  profileImage?: string | null;
  createdAt: string;
}

interface Paged<T> {
  items: T[];
  page: number;
  perPage: number;
  total: number;
}

export function UsersPage() {
  const [q, setQ] = useState('');
  const [userType, setUserType] = useState<'' | 'CLIENT' | 'PRO' | 'ADMIN'>('');
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery<Paged<User>>({
    queryKey: ['admin', 'users', q, userType],
    queryFn: async () =>
      (
        await api.get<Paged<User>>('/admin/users', {
          params: { q: q || undefined, userType: userType || undefined, perPage: 30 },
        })
      ).data,
  });

  const banMutation = useMutation({
    mutationFn: ({ id, banned }: { id: string; banned: boolean }) =>
      banned ? api.delete(`/admin/users/${id}`) : api.put(`/admin/users/${id}/unban`),
    onSuccess: (_d, vars) => {
      toast.success(vars.banned ? 'Utilisateur banni' : 'Utilisateur réactivé');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: () => toast.error('Action impossible'),
  });

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Utilisateurs</h1>
      <p className="mb-6 text-sm text-slate-500">
        Gérez les comptes clients, professionnels et admins.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            className="input pl-9"
            placeholder="Rechercher email, nom, téléphone…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value as typeof userType)}
          className="input max-w-xs"
        >
          <option value="">Tous les rôles</option>
          <option value="CLIENT">Clients</option>
          <option value="PRO">Pros</option>
          <option value="ADMIN">Admins</option>
        </select>
      </div>

      <div className="card overflow-hidden p-0">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
            <tr>
              <th className="px-4 py-3">Utilisateur</th>
              <th className="px-4 py-3">Rôle</th>
              <th className="px-4 py-3">Contact</th>
              <th className="px-4 py-3">Statut</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-500">
                  Chargement…
                </td>
              </tr>
            ) : (
              data?.items.map((u) => (
                <tr key={u.id} className="border-t border-slate-100">
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      {u.firstName} {u.lastName}
                    </div>
                    <div className="text-xs text-slate-400">{u.id}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={clsx(
                        'badge',
                        u.userType === 'ADMIN'
                          ? 'bg-rose-100 text-rose-700'
                          : u.userType === 'PRO'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700',
                      )}
                    >
                      {u.userType}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    <div>{u.email}</div>
                    <div className="text-xs text-slate-400">{u.phone}</div>
                  </td>
                  <td className="px-4 py-3">
                    {u.isBanned ? (
                      <span className="badge bg-rose-100 text-rose-700">Banni</span>
                    ) : u.isVerified ? (
                      <span className="badge bg-emerald-100 text-emerald-700">Vérifié</span>
                    ) : (
                      <span className="badge bg-slate-100 text-slate-600">Non vérifié</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {u.userType !== 'ADMIN' && (
                      <button
                        className="btn-outline text-xs"
                        onClick={() => banMutation.mutate({ id: u.id, banned: !u.isBanned })}
                      >
                        {u.isBanned ? (
                          <>
                            <CheckCircle2 className="h-3.5 w-3.5" /> Réactiver
                          </>
                        ) : (
                          <>
                            <Ban className="h-3.5 w-3.5" /> Bannir
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          {data ? `${data.total} utilisateurs` : ''}
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

import { api } from '../lib/api';
import { useAuthStore } from '../store/auth';

export function LoginPage() {
  const navigate = useNavigate();
  const setSession = useAuthStore((s) => s.setSession);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (data.user.userType !== 'ADMIN') {
        toast.error('Accès réservé aux administrateurs');
        return;
      }
      setSession({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
      });
      navigate('/');
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string | string[] } } }).response
        ?.data?.message;
      toast.error(
        Array.isArray(message) ? message.join(', ') : (message ?? 'Identifiants invalides'),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="card relative p-8">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-taara-500/20 blur-3xl"
          />
          <div className="relative mb-6 flex items-center gap-3 font-display text-2xl font-bold text-white">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-taara-500">
              <Zap className="h-6 w-6 text-night-900" />
            </span>
            TAARA Admin
          </div>
          <p className="relative mb-6 text-sm text-slate-400">
            Connectez-vous à votre console d'administration.
          </p>
          <form onSubmit={submit} className="relative space-y-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Email</label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
                placeholder="admin@taara.app"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-300">Mot de passe</label>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
                placeholder="••••••••"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Connexion…' : 'Se connecter'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

import { Navigate, Route, Routes } from 'react-router-dom';

import { LoginPage } from './pages/Login';
import { DashboardPage } from './pages/Dashboard';
import { UsersPage } from './pages/Users';
import { ProfessionalsPage } from './pages/Professionals';
import { JobsPage } from './pages/Jobs';
import { WithdrawalsPage } from './pages/Withdrawals';
import { Layout } from './components/Layout';
import { useAuthStore } from './store/auth';

function RequireAdmin({ children }: { children: React.ReactNode }) {
  const { user, accessToken } = useAuthStore();
  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (user.userType !== 'ADMIN') return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <RequireAdmin>
            <Layout />
          </RequireAdmin>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="users" element={<UsersPage />} />
        <Route path="professionals" element={<ProfessionalsPage />} />
        <Route path="jobs" element={<JobsPage />} />
        <Route path="withdrawals" element={<WithdrawalsPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

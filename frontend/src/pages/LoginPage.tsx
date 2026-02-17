import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { TopNav } from '../components/TopNav';
import { api } from '../api';

export function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await api.login({ email, password });
      localStorage.setItem('accessToken', response.accessToken);

      if (response.role === 'ADMIN') navigate('/dashboard/admin');
      else if (response.role === 'PROVIDER') navigate('/dashboard/practitioner');
      else navigate('/dashboard/client');

    } catch (err) {
      setError('Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-brand-50 to-emerald-50">
      <TopNav />
      <main className="mx-auto flex max-w-4xl flex-col gap-10 px-4 pb-16 pt-10 md:flex-row md:items-center">
        
        <section className="flex-1">
          <h1 className="text-2xl font-semibold text-slate-900">Welcome back</h1>
          <p className="mt-2 text-sm text-slate-600">Sign in to manage your wellness sessions and connect with practitioners.</p>
        </section>

        <section className="flex-1">
          <div className="rounded-2xl bg-white p-6 shadow-soft-card">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-700">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                  placeholder="••••••••"
                />
              </div>
              {error && <p className="text-xs text-red-600">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="mt-2 w-full rounded-full bg-brand-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <p className="mt-4 text-center text-xs text-slate-600">
              New to Wellness Hub?{' '}
              <Link to="/register" className="font-semibold text-brand-700 hover:text-brand-900">
                Create an account
              </Link>
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}

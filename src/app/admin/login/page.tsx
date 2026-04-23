/**
 * Admin Login Page
 * /admin/login - 管理后台登录页面
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/admin/theme-editor');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050A] flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-emerald-400 font-mono text-sm mb-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            FRI ADMIN
          </div>
          <h1 className="text-white text-2xl font-bold">Theme Editor</h1>
          <p className="text-white/40 text-sm mt-1">Enter password to continue</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg 
                         text-white placeholder-white/30 focus:outline-none focus:border-emerald-400/50
                         transition-colors"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-400 text-sm text-center bg-red-400/10 py-2 rounded">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-500/50
                       text-black font-medium rounded-lg transition-colors
                       disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Login'}
          </button>
        </form>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-8">
          Protected admin area
        </p>
      </div>
    </div>
  );
}

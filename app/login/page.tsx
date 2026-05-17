'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (res.ok) {
      const data = await res.json();
      const role = data.role;
      if (role === 'ADMIN') {
        window.location.href = '/admin/dashboard';
      } else if (role === 'MANAGER') {
        window.location.href = '/manager/team';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      setError('Invalid email or password');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-900 via-surface-800 to-surface-900 flex items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPbmVyIj48cGF0aCBkPSJNMzAgMzBoMzB2MzBIMzBWMzBoeiIgZmlsbD0ibm9uZSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-[0.03]"></div>
      
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-accent-500/10 rounded-full blur-3xl"></div>

      <div className="max-w-md w-full relative animate-fade-in">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-brand-500 to-brand-600 rounded-2xl shadow-lg shadow-brand-500/30 mb-6">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2L2 7l10 5 10-5-10-5z"/>
              <path d="M2 17l10 5 10-5"/>
              <path d="M2 12l10 5 10-5"/>
            </svg>
          </div>
          <h1 className="text-4xl font-black text-white tracking-tight mb-2">
            AtomQuest
          </h1>
          <p className="text-surface-400 font-medium text-sm tracking-wide">Goal Setting & Performance Portal</p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2.5">Corporate Email</label>
              <input 
                type="email" 
                required
                className="input-field"
                placeholder="name@atomberg.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2.5">Access Password</label>
              <input 
                type="password" 
                required
                className="input-field"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-500"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <p className="text-red-600 text-sm font-medium">{error}</p>
              </div>
            )}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-brand-500/20 transition-all transform active:scale-[0.99]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Authenticating...
                </span>
              ) : 'Sign In to Portal'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-surface-100">
            <h3 className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-4 text-center">Demo Accounts</h3>
            <div className="grid grid-cols-1 gap-3">
              {[
                { role: 'Employee', email: 'emp@demo.com', color: 'bg-brand-50 text-brand-600' },
                { role: 'Manager', email: 'mgr@demo.com', color: 'bg-purple-50 text-purple-600' },
                { role: 'Admin', email: 'admin@demo.com', color: 'bg-amber-50 text-amber-600' }
              ].map((d) => (
                <div key={d.role} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 border border-surface-100">
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${d.color}`}>{d.role}</span>
                   <span className="text-sm font-medium text-surface-600">{d.email}</span>
                </div>
              ))}
              <p className="text-xs text-center text-surface-400 mt-3 font-medium">Master Password: <span className="text-surface-700 font-semibold">password123</span></p>
            </div>
          </div>
        </div>
        
        <p className="text-center mt-8 text-surface-500 text-xs font-medium tracking-wider">
          Atomberg Technologies © 2025
        </p>
      </div>
    </div>
  );
}
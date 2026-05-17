'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [stats, setStats] = useState<any>(null);
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);

  useEffect(() => {
    async function fetchData() {
      const [statsRes, cyclesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/cycles')
      ]);
      const statsData = await statsRes.json();
      const cyclesData = await cyclesRes.json();
      setStats(statsData);
      setCycles(cyclesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  const toggleCycle = async (id: string) => {
    const res = await fetch(`/api/admin/cycles/${id}/toggle`, { method: 'POST' });
    if (res.ok) window.location.reload();
  };

  const pushSharedGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setPushing(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = {
      thrustArea: formData.get('thrustArea'),
      title: formData.get('title'),
      description: formData.get('description'),
      uomType: formData.get('uomType'),
      target: formData.get('target'),
      weightage: parseInt(formData.get('weightage') as string),
    };

    const res = await fetch('/api/admin/shared-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      showToast('Shared Goal pushed to all employees successfully!', 'success');
      (e.target as HTMLFormElement).reset();
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to push shared goal', 'error');
    }
    setPushing(false);
  };

  const handleUnlock = async (employeeId: string) => {
    const res = await fetch('/api/goals/unlock', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId }),
    });
    if (res.ok) {
      showToast('Goal sheet unlocked successfully', 'success');
      window.location.reload();
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to unlock', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-surface-500 font-medium">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Loading Governance...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-amber-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Governance Dashboard</h1>
              <p className="text-surface-500 font-medium">Global oversight of organizational performance</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/dashboard" className="btn-secondary text-sm py-2 px-4 bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100">Overview</Link>
            <Link href="/admin/cycles" className="btn-secondary text-sm py-2 px-4">Cycles</Link>
            <Link href="/admin/shared-goals" className="btn-secondary text-sm py-2 px-4">Shared Goals</Link>
            <Link href="/admin/users" className="btn-secondary text-sm py-2 px-4">Directory</Link>
            <Link href="/admin/analytics" className="btn-secondary text-sm py-2 px-4">Analytics</Link>
            <Link href="/admin/escalations" className="btn-secondary text-sm py-2 px-4">Escalations</Link>
            <Link href="/admin/notifications" className="btn-secondary text-sm py-2 px-4">Notifications</Link>
            <Link href="/admin/audit" className="btn-secondary text-sm py-2 px-4">Audit Log</Link>
            <a href="/api/admin/export" className="btn-secondary text-sm py-2 px-4" download>CSV</a>
            <a href="/api/admin/export/excel" className="btn-primary text-sm py-2 px-4" download>Excel</a>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="card p-6 animate-fade-in animate-stagger-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Adoption</h3>
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-surface-900">{stats.completionRate.toFixed(1)}%</span>
              <span className="text-emerald-600 text-sm font-semibold">Active</span>
            </div>
          </div>
          <div className="card p-6 animate-fade-in animate-stagger-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Total Goals</h3>
            </div>
            <span className="text-3xl font-bold text-surface-900">{stats.totalGoals}</span>
          </div>
          <div className="card p-6 animate-fade-in animate-stagger-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Pending</h3>
            </div>
            <span className="text-3xl font-bold text-amber-600">{stats.statusCounts['SUBMITTED'] || 0}</span>
          </div>
          <div className="card p-6 animate-fade-in animate-stagger-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-red-600"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Alerts</h3>
            </div>
            <span className="text-3xl font-bold text-red-600">{stats.escalations.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="card overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50 flex justify-between items-center">
                <h2 className="text-base font-bold text-surface-900">Review Cycles</h2>
                <button className="text-xs font-semibold bg-surface-900 text-white px-3 py-1.5 rounded-lg hover:bg-surface-800 transition-colors">+ New</button>
              </div>
              <div className="divide-y divide-surface-50">
                {cycles.map((c: any) => (
                  <div key={c.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-50 transition-colors">
                    <div>
                      <div className="font-semibold text-surface-900">{c.name}</div>
                      <div className="text-xs text-surface-500 mt-0.5">{c.windowOpen} — {c.windowClose}</div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`badge ${c.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {c.isActive ? 'Active' : 'Closed'}
                      </span>
                      <button 
                        onClick={() => toggleCycle(c.id)}
                        className={`text-xs font-semibold px-3 py-1.5 rounded-lg transition-all ${
                          c.isActive ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-brand-50 text-brand-600 hover:bg-brand-100'
                        }`}
                      >
                        {c.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
                <h2 className="text-base font-bold text-surface-900">Quarterly Check-in Compliance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-100">
                      <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Employee</th>
                      {['Q1','Q2','Q3','Q4'].map(q => (
                        <th key={q} className="px-3 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-center">{q}</th>
                      ))}
                      <th className="px-3 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-50">
                    {stats.quarterlyCompliance.map((row: any) => (
                      <tr key={row.name} className="hover:bg-surface-50">
                        <td className="px-4 py-3 font-medium text-surface-900 text-sm">{row.name}</td>
                        {row.quarters.map((q: any) => (
                          <td key={q.quarter} className="px-3 py-3 text-center">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                              q.total === 0 ? 'text-surface-300' :
                              q.checkedIn >= q.total ? 'text-emerald-600' :
                              q.checkedIn > 0 ? 'text-amber-600' : 'text-red-400'
                            }`}>
                              {q.total === 0 ? '—' : `${q.checkedIn}/${q.total}`}
                            </span>
                          </td>
                        ))}
                        <td className="px-3 py-3 text-right">
                          <button 
                            onClick={() => handleUnlock(row.id)}
                            className="text-xs font-semibold bg-surface-100 text-surface-500 px-3 py-1.5 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all"
                          >
                            Unlock
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="card overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
                <h2 className="text-base font-bold text-surface-900">Manager Compliance</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-100">
                      <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Manager</th>
                      <th className="px-3 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-center">Team</th>
                      {['Q1','Q2','Q3','Q4'].map(q => (
                        <th key={q} className="px-3 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-center">{q}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-50">
                    {stats.managerCompliance.map((m: any) => (
                      <tr key={m.name} className="hover:bg-surface-50">
                        <td className="px-4 py-3 font-medium text-surface-900 text-sm">{m.name}</td>
                        <td className="px-3 py-3 text-center text-surface-600 text-sm">{m.teamSize}</td>
                        {m.teamCheckinRates.map((r: any) => (
                          <td key={r.quarter} className="px-3 py-3 text-center">
                            <span className={`text-xs font-semibold ${
                              r.total === 0 ? 'text-surface-300' :
                              r.rate >= 80 ? 'text-emerald-600' :
                              r.rate >= 50 ? 'text-amber-600' : 'text-red-400'
                            }`}>
                              {r.total === 0 ? '—' : `${r.rate}%`}
                            </span>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="card overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-surface-900 bg-surface-900 text-white">
                <h2 className="text-sm font-bold">Push Global KPI</h2>
                <p className="text-xs text-surface-400 mt-1">Disseminate goal to all employees</p>
              </div>
              <form onSubmit={pushSharedGoal} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Thrust Area</label>
                  <input name="thrustArea" required className="input-field text-sm" placeholder="e.g. Innovation" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Goal Title</label>
                  <input name="title" required className="input-field text-sm" placeholder="e.g. Patent Filing" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Target</label>
                    <input name="target" required className="input-field text-sm" placeholder="2" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Weight</label>
                    <input name="weightage" type="number" defaultValue="10" required className="input-field text-sm" />
                  </div>
                </div>
                <button 
                  disabled={pushing}
                  className="w-full btn-primary text-sm disabled:opacity-50"
                >
                  {pushing ? 'Propagating...' : 'Broadcast KPI'}
                </button>
              </form>
            </section>

            <section className="card p-6 animate-fade-in">
              <h3 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Recent Activity</h3>
              <div className="space-y-3">
                {stats.recentCheckins.map((ci: any) => (
                  <div key={ci.id} className="text-sm pb-3 border-b border-surface-100 last:border-0">
                    <span className="font-semibold text-brand-600 mr-2">{ci.quarter}</span>
                    <span className="text-surface-600">Goal {ci.goalId.slice(-4)} updated</span>
                    <div className="text-xs text-surface-400 mt-1">{new Date(ci.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <Link href="/admin/audit" className="block text-center mt-4 text-xs font-semibold text-brand-600 hover:underline">View Full Audit</Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
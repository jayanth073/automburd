'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { Users, Target, Clock, AlertTriangle, FileText, Download } from 'lucide-react';

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
        <header className="mb-8 animate-fade-in flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-surface-900 tracking-tight">Governance Overview</h1>
            <p className="text-sm text-surface-500 mt-1">Global oversight of organizational performance</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/api/admin/export" className="btn-secondary text-sm py-1.5 px-3" download>
              <Download size={14} className="mr-2" /> CSV
            </a>
            <a href="/api/admin/export/excel" className="btn-primary text-sm py-1.5 px-3" download>
              <FileText size={14} className="mr-2" /> Excel
            </a>
          </div>
        

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-5 animate-fade-in animate-stagger-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-surface-500 text-sm font-medium">Adoption</h3>
              <Users size={16} className="text-surface-400" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-semibold text-surface-900">{stats.completionRate.toFixed(1)}%</span>
            </div>
          </div>
          
          <div className="card p-5 animate-fade-in animate-stagger-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-surface-500 text-sm font-medium">Total Goals</h3>
              <Target size={16} className="text-surface-400" />
            </div>
            <span className="text-2xl font-semibold text-surface-900">{stats.totalGoals}</span>
          </div>

          <div className="card p-5 animate-fade-in animate-stagger-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-surface-500 text-sm font-medium">Pending Review</h3>
              <Clock size={16} className="text-surface-400" />
            </div>
            <span className="text-2xl font-semibold text-surface-900">{stats.statusCounts['SUBMITTED'] || 0}</span>
          </div>

          <div className="card p-5 animate-fade-in animate-stagger-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-surface-500 text-sm font-medium">Active Alerts</h3>
              <AlertTriangle size={16} className="text-surface-400" />
            </div>
            <span className="text-2xl font-semibold text-surface-900">{stats.escalations.length}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <section className="card overflow-hidden animate-fade-in">
              <div className="px-5 py-4 border-b border-surface-200 flex justify-between items-center">
                <h2 className="text-sm font-semibold text-surface-900">Review Cycles</h2>
                <button className="text-xs font-medium bg-surface-100 text-surface-900 px-3 py-1.5 rounded-md hover:bg-surface-200 transition-colors">+ New Cycle</button>
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
                        className={`text-xs font-medium px-3 py-1.5 rounded-md transition-all ${
                          c.isActive ? 'text-red-600 hover:bg-red-50' : 'text-surface-900 hover:bg-surface-100'
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
              <div className="px-5 py-4 border-b border-surface-200">
                <h2 className="text-sm font-semibold text-surface-900">Quarterly Check-in Compliance</h2>
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
              <div className="px-5 py-4 border-b border-surface-200">
                <h2 className="text-sm font-semibold text-surface-900">Manager Compliance</h2>
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
            <section className="card overflow-hidden animate-fade-in">
              <div className="px-5 py-4 border-b border-surface-200 bg-surface-50/50">
                <h2 className="text-sm font-semibold text-surface-900">Push Global KPI</h2>
                <p className="text-xs text-surface-500 mt-1">Disseminate goal to all employees</p>
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

            <section className="card p-5 animate-fade-in">
              <h3 className="text-sm font-semibold text-surface-900 mb-4">Recent Activity</h3>
              <div className="space-y-4">
                {stats.recentCheckins.map((ci: any) => (
                  <div key={ci.id} className="text-sm pb-4 border-b border-surface-100 last:border-0 last:pb-0 flex items-start justify-between">
                    <div>
                      <span className="font-medium text-surface-900 mr-2">{ci.quarter} Check-in</span>
                      <span className="text-surface-500">Goal {ci.goalId.slice(-4)} updated</span>
                    </div>
                    <div className="text-xs text-surface-400">{new Date(ci.createdAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
              <Link href="/admin/audit" className="block text-center mt-4 text-xs font-medium text-surface-500 hover:text-surface-900">View Full Audit</Link>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

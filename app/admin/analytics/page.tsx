'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch('/api/admin/analytics');
      const data = await res.json();
      setAnalytics(data);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Loading analytics...</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-8">
        <Link href="/admin/dashboard" className="text-surface-500 hover:text-surface-900 text-sm font-medium mb-4 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-surface-900">Analytics Dashboard</h1>
        <p className="text-surface-500">Quarter-on-quarter trends and organizational insights</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="card p-6">
          <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Total Employees</div>
          <div className="text-3xl font-bold text-surface-900">{analytics?.overview?.totalEmployees}</div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Total Goals</div>
          <div className="text-3xl font-bold text-surface-900">{analytics?.overview?.totalGoals}</div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Completion Rate</div>
          <div className="text-3xl font-bold text-brand-600">{analytics?.overview?.completionRate}%</div>
        </div>
        <div className="card p-6">
          <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2">Avg Score</div>
          <div className="text-3xl font-bold text-emerald-600">{analytics?.overview?.avgScore}%</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <section className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Quarterly Trends</h2>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {analytics?.quarterlyTrends?.map((q: any) => (
                <div key={q.quarter} className="flex items-center justify-between">
                  <span className="font-semibold text-surface-700">{q.quarter}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-surface-500">{q.totalCheckins} check-ins</span>
                    <span className="text-sm font-bold text-brand-600">{q.avgScore}% avg</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Goal Distribution by Status</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics?.goalDistributionByStatus?.map((s: any) => (
                <div key={s.status} className="flex items-center gap-4">
                  <span className="w-24 text-sm text-surface-600">{s.status}</span>
                  <div className="flex-1 bg-surface-100 rounded-full h-4">
                    <div 
                      className="bg-brand-500 h-4 rounded-full" 
                      style={{ width: `${s.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-surface-700 w-12 text-right">{s.percentage}%</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <section className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Goals by Thrust Area</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics?.goalDistributionByArea?.map((a: any) => (
                <div key={a.area} className="flex items-center gap-4">
                  <span className="w-32 text-sm text-surface-600 truncate">{a.area}</span>
                  <div className="flex-1 bg-surface-100 rounded-full h-4">
                    <div 
                      className="bg-accent-500 h-4 rounded-full" 
                      style={{ width: `${a.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-surface-700 w-12 text-right">{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Goals by UoM Type</h2>
          </div>
          <div className="p-6">
            <div className="space-y-3">
              {analytics?.goalDistributionByUom?.map((u: any) => (
                <div key={u.uom} className="flex items-center gap-4">
                  <span className="w-32 text-sm text-surface-600">{u.uom}</span>
                  <div className="flex-1 bg-surface-100 rounded-full h-4">
                    <div 
                      className="bg-emerald-500 h-4 rounded-full" 
                      style={{ width: `${u.percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-surface-700 w-12 text-right">{u.count}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {analytics?.departmentHeatmap && analytics.departmentHeatmap.length > 0 && (
        <section className="card overflow-hidden mb-8">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Department Heatmap — Avg Score by Thrust Area</h2>
          </div>
          <div className="overflow-x-auto p-6">
            <table className="w-full text-center text-sm">
              <thead>
                <tr className="border-b border-surface-200">
                  <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase text-left">Thrust Area</th>
                  {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
                    <th key={q} className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase">{q}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {analytics.departmentHeatmap.map((row: any) => (
                  <tr key={row.area} className="hover:bg-surface-50">
                    <td className="px-4 py-3 font-semibold text-surface-700 text-left">{row.area}</td>
                    {['Q1', 'Q2', 'Q3', 'Q4'].map(q => {
                      const val = parseFloat(row[q] || '0');
                      const intensity = Math.min(val / 100, 1);
                      return (
                        <td key={q} className="px-4 py-3">
                          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold"
                            style={{
                              backgroundColor: `rgba(14, 165, 233, ${intensity * 0.3})`,
                              color: intensity > 0.5 ? '#0c4a6e' : '#71717a'
                            }}
                          >
                            {row[q] || '-'}%
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
          <h2 className="text-lg font-bold text-surface-900">Manager Effectiveness Dashboard</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-surface-100">
                <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase">Manager</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase">Team Size</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase">Total Goals</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase">Approval Rate</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase">Check-ins</th>
                <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase">Feedback Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-50">
              {analytics?.managerEffectiveness?.map((m: any) => (
                <tr key={m.managerId} className="hover:bg-surface-50">
                  <td className="px-6 py-4 font-semibold text-surface-900">{m.managerName}</td>
                  <td className="px-6 py-4 text-surface-600">{m.teamSize}</td>
                  <td className="px-6 py-4 text-surface-600">{m.teamGoals}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${parseFloat(m.approvalRate) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {m.approvalRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-surface-600">{m.totalCheckins}</td>
                  <td className="px-6 py-4">
                    <span className={`font-semibold ${parseFloat(m.feedbackRate) >= 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {m.feedbackRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
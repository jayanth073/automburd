'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CyclesPage() {
  const [cycles, setCycles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchCycles() {
      const res = await fetch('/api/admin/cycles');
      if (res.ok) {
        const data = await res.json();
        setCycles(data);
      }
      setLoading(false);
    }
    fetchCycles();
  }, []);

  const toggleActive = async (id: string) => {
    const res = await fetch(`/api/admin/cycles/${id}/toggle`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      const target = cycles.find(c => c.id === id);
      const activating = target && !target.isActive;
      setCycles(cycles.map(c =>
        c.id === id ? { ...c, isActive: !c.isActive } :
        activating ? { ...c, isActive: false } : c
      ));
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Loading...</div></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-8">
        <Link href="/admin/dashboard" className="text-surface-500 hover:text-surface-900 text-sm font-medium mb-4 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-surface-900 mb-2">Cycle Management</h1>
        <p className="text-surface-500">Configure active windows for goal setting and check-ins</p>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-50 text-surface-400 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">Cycle Name</th>
              <th className="px-6 py-4">Window Open</th>
              <th className="px-6 py-4">Window Close</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {cycles.map(cycle => (
              <tr key={cycle.id} className="hover:bg-surface-50">
                <td className="px-6 py-4 font-bold text-surface-900">{cycle.name}</td>
                <td className="px-6 py-4 text-surface-500 font-mono">{cycle.windowOpen}</td>
                <td className="px-6 py-4 text-surface-500 font-mono">{cycle.windowClose}</td>
                <td className="px-6 py-4">
                  <span className={`badge ${cycle.isActive ? 'badge-success' : 'badge-neutral'}`}>
                    {cycle.isActive ? 'ACTIVE' : 'INACTIVE'}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => toggleActive(cycle.id)}
                    className={`text-xs font-semibold ${cycle.isActive ? 'text-red-600 hover:text-red-700' : 'text-brand-600 hover:text-brand-700'}`}
                  >
                    {cycle.isActive ? 'Deactivate' : 'Set Active'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
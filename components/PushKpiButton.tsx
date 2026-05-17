'use client';

import { useState } from 'react';
import { useToast } from '@/components/Toast';

export default function PushKpiButton() {
  const { showToast } = useToast();
  const [open, setOpen] = useState(false);
  const [thrustArea, setThrustArea] = useState('');
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');
  const [weightage, setWeightage] = useState('10');
  const [pushing, setPushing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!thrustArea || !title || !target || !weightage) return;
    setPushing(true);

    const res = await fetch('/api/admin/shared-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ thrustArea, title, target, weightage: parseInt(weightage), description: 'Departmental Shared Goal' })
    });

    if (res.ok) {
      showToast('KPI pushed to all direct reports!', 'success');
      setOpen(false);
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to push KPI', 'error');
    }
    setPushing(false);
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm flex items-center gap-2 border-brand-200 text-brand-600 hover:bg-brand-50"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
        Push Departmental KPI
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setOpen(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-surface-900 mb-4">Push Departmental KPI</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Thrust Area</label>
                <input value={thrustArea} onChange={e => setThrustArea(e.target.value)} required className="input-field text-sm" placeholder="e.g. Innovation" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Goal Title</label>
                <input value={title} onChange={e => setTitle(e.target.value)} required className="input-field text-sm" placeholder="e.g. Patent Filing" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Target Value</label>
                <input value={target} onChange={e => setTarget(e.target.value)} required className="input-field text-sm" placeholder="2" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Weightage (%)</label>
                <input value={weightage} onChange={e => setWeightage(e.target.value)} type="number" min="1" max="100" required className="input-field text-sm" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary text-sm flex-1">Cancel</button>
                <button type="submit" disabled={pushing} className="btn-primary text-sm flex-1 disabled:opacity-50">
                  {pushing ? 'Pushing...' : 'Push KPI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
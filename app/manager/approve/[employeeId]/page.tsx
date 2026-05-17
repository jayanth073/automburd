'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function ApprovalPage({ params }: { params: { employeeId: string } }) {
  const { showToast } = useToast();
  const [goals, setGoals] = useState<any[]>([]);
  const [managerComment, setManagerComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/goals?employeeId=${params.employeeId}`);
      const reportGoals = await res.json();
      setGoals(reportGoals.filter((g: any) => g.status === 'SUBMITTED'));
      setLoading(false);
    }
    fetchData();
  }, [params.employeeId]);

  const handleUpdateTarget = (goalId: string, newTarget: string) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, target: newTarget } : g));
  };

  const handleUpdateWeightage = (goalId: string, newWeightage: string) => {
    setGoals(goals.map(g => g.id === goalId ? { ...g, weightage: parseInt(newWeightage) || 0 } : g));
  };

  const handleAction = async (action: 'APPROVE' | 'RETURN') => {
    setSaving(true);

    const res = await fetch('/api/goals/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        employeeId: params.employeeId,
        action,
        managerComment,
        goals: goals.map(g => ({ id: g.id, target: g.target, weightage: g.weightage })),
      }),
    });

    if (res.ok) {
      router.push('/manager/team');
    } else {
      const data = await res.json();
      showToast(data.error || 'Action failed', 'error');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-surface-500 font-medium">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Loading...
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-8">
        <Link href="/manager/team" className="text-surface-500 hover:text-surface-900 text-sm font-medium mb-4 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Team
        </Link>
        <h1 className="text-3xl font-bold text-surface-900">Goal Sheet Review</h1>
      </header>

      <div className="space-y-6 mb-8">
        {goals.length === 0 ? (
          <div className="card p-12 text-center border border-dashed border-surface-200">
            <div className="w-16 h-16 bg-surface-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            </div>
            <h3 className="text-lg font-bold text-surface-900 mb-1">No Pending Goals</h3>
            <p className="text-surface-500 text-sm">This employee does not have any goal sheets currently pending manager approval.</p>
          </div>
        ) : (
          goals.map((goal: any) => (
            <div key={goal.id} className="card p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <span className="badge badge-info mb-2">{goal.thrustArea}</span>
                  <h3 className="text-lg font-bold text-surface-900">{goal.title}</h3>
                </div>
                <span className="font-bold bg-surface-100 px-3 py-1 rounded-lg text-surface-700">{goal.weightage}%</span>
              </div>
              <p className="text-surface-500 text-sm mb-6">{goal.description}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                  <label className="block text-xs font-semibold text-surface-400 mb-2">Adjust Target (Optional)</label>
                  <input 
                    type="text"
                    className="input-field text-sm"
                    value={goal.target}
                    onChange={(e) => handleUpdateTarget(goal.id, e.target.value)}
                  />
                </div>
                <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
                  <label className="block text-xs font-semibold text-surface-400 mb-2">Adjust Weightage (Optional)</label>
                  <input 
                    type="number"
                    min="10"
                    max="100"
                    className="input-field text-sm"
                    value={goal.weightage}
                    onChange={(e) => handleUpdateWeightage(goal.id, e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {goals.length > 0 && (
        <div className="space-y-6">
          <div className="card p-6">
            <label className="block text-sm font-semibold text-surface-600 mb-3">Manager Review Comments</label>
            <textarea 
              rows={4}
              className="input-field resize-none"
              placeholder="Provide feedback on the targets and thrust areas..."
              value={managerComment}
              onChange={(e) => setManagerComment(e.target.value)}
            />
          </div>

          <div className="flex gap-4 sticky bottom-6 bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-surface-200 shadow-lg">
            <button 
              disabled={saving}
              onClick={() => handleAction('RETURN')}
              className="flex-1 btn-secondary"
            >
              Return for Rework
            </button>
            <button 
              disabled={saving}
              onClick={() => handleAction('APPROVE')}
              className="flex-[2] bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              {saving ? 'Processing...' : 'Approve Sheet'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
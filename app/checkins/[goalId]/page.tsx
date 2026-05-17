'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

function CheckInForm({ params }: { params: { goalId: string } }) {
  const [goal, setGoal] = useState<any>(null);
  const [actual, setActual] = useState('');
  const [progressStatus, setProgressStatus] = useState('ON_TRACK');
  const [quarter, setQuarter] = useState('Q1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const redirectTimer = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const q = searchParams.get('quarter');
    if (q) setQuarter(q);

    async function fetchData() {
      const res = await fetch('/api/goals');
      const goals = await res.json();
      const g = goals.find((x: any) => x.id === params.goalId);
      setGoal(g);
      setLoading(false);
    }
    fetchData();

    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, [params.goalId, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const res = await fetch('/api/checkins', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        goalId: params.goalId,
        actualAchievement: actual,
        progressStatus,
        quarter,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setResult(data);
      redirectTimer.current = setTimeout(() => router.push('/checkins'), 3000);
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to submit check-in', 'error');
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Loading...</div></div>;
  if (!goal) return <div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Goal not found</div></div>;

  return (
    <div className="max-w-2xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-8">
        <Link href="/checkins" className="text-surface-500 hover:text-surface-900 text-sm font-medium flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Check-ins
        </Link>
        <h1 className="text-3xl font-bold text-surface-900">Quarterly Check-in</h1>
        <p className="text-surface-500 mt-2">{goal.title}</p>
      </header>

      <div className="card p-8 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
            <span className="text-xs font-medium text-surface-400 block mb-1 uppercase">Target</span>
            <span className="text-lg font-bold text-surface-900">{goal.target}</span>
          </div>
          <div className="bg-surface-50 p-4 rounded-xl border border-surface-200">
            <span className="text-xs font-medium text-surface-400 block mb-1 uppercase">UoM</span>
            <span className="text-lg font-bold font-mono text-surface-900">{goal.uomType}</span>
          </div>
        </div>

        {result ? (
          <div className="text-center py-10">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><polyline points="20 6 9 17 4 12"/></svg>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-surface-900">Check-in Successful!</h2>
            <div className="text-4xl font-black text-emerald-600 mb-4">
              {(result.computedScore * 100).toFixed(0)}% Score
            </div>
            <p className="text-surface-500 text-sm italic">Redirecting to check-ins dashboard...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-surface-600 mb-2">Quarter</label>
              <select
                className="input-field"
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
              >
                <option value="Q1">Quarter 1 (July)</option>
                <option value="Q2">Quarter 2 (October)</option>
                <option value="Q3">Quarter 3 (January)</option>
                <option value="Q4">Quarter 4 (March/April)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-600 mb-2">Actual Achievement</label>
              <input 
                type={goal.uomType === 'TIMELINE' ? 'date' : 'text'}
                required
                className="input-field"
                placeholder="Enter current result"
                value={actual}
                onChange={(e) => setActual(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-surface-600 mb-2">Progress Status</label>
              <select
                className="input-field"
                value={progressStatus}
                onChange={(e) => setProgressStatus(e.target.value)}
              >
                <option value="NOT_STARTED">Not Started</option>
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>

            <button 
              type="submit"
              disabled={saving}
              className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Submit Check-in'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function CheckInPage(props: any) {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Loading...</div></div>}>
      <CheckInForm {...props} />
    </Suspense>
  );
}
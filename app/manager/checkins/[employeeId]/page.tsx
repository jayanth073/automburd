'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function ReviewCheckinsPage({ params }: { params: { employeeId: string } }) {
  const [goals, setGoals] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [quarter, setQuarter] = useState('Q1');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      const resG = await fetch(`/api/goals?employeeId=${params.employeeId}`);
      const empGoals = await resG.json();
      setGoals(empGoals.filter((g: any) => g.status === 'APPROVED'));

      const resC = await fetch('/api/checkins');
      const allCheckins = await resC.json();
      setCheckIns(allCheckins);
      
      setLoading(false);
    }
    fetchData();
  }, [params.employeeId]);

  const handleSaveComment = async (goalId: string, comment: string) => {
    setSaving(goalId);
    const res = await fetch(`/api/checkins/comment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ goalId, quarter, managerComment: comment }),
    });
    if (res.ok) {
      setCheckIns(prev => prev.map(ci => 
        (ci.goalId === goalId && ci.quarter === quarter) ? { ...ci, managerComment: comment } : ci
      ));
    }
    setSaving(null);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Loading...</div></div>;

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link href="/manager/team" className="text-surface-500 hover:text-surface-900 text-sm font-medium mb-4 inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Team
          </Link>
          <h1 className="text-3xl font-bold text-surface-900">Review Check-ins</h1>
          <p className="text-surface-500">Quarterly progress tracking and feedback</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Review Window</label>
          <select 
            value={quarter}
            onChange={(e) => setQuarter(e.target.value)}
            className="input-field text-sm w-32"
          >
            <option value="Q1">Quarter 1</option>
            <option value="Q2">Quarter 2</option>
            <option value="Q3">Quarter 3</option>
            <option value="Q4">Quarter 4</option>
          </select>
        </div>
      </header>

      <div className="space-y-6">
        {goals.map((goal: any) => {
          const checkIn = checkIns.find(ci => ci.goalId === goal.id && ci.quarter === quarter);
          
          return (
            <div key={goal.id} className="card p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="badge badge-info mb-2">{goal.thrustArea}</span>
                  <h3 className="text-lg font-bold text-surface-900">{goal.title}</h3>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-surface-400 mb-1">Target</div>
                  <div className="text-sm font-mono font-semibold text-surface-700">{goal.target}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-surface-50 p-5 rounded-xl border border-surface-200">
                  <div className="text-xs font-bold text-surface-400 uppercase mb-4">Employee Update</div>
                  {checkIn ? (
                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <div>
                          <div className="text-xs text-surface-400 uppercase">Actual</div>
                          <div className="text-2xl font-bold text-emerald-600">{checkIn.actualAchievement}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-surface-400 uppercase">Score</div>
                          <div className="text-xl font-bold text-brand-600">{(checkIn.computedScore * 100).toFixed(0)}%</div>
                        </div>
                      </div>
                      <div>
                        <span className={`badge ${
                          checkIn.progressStatus === 'COMPLETED' ? 'badge-success' :
                          checkIn.progressStatus === 'ON_TRACK' ? 'badge-info' :
                          'badge-error'
                        }`}>
                          {checkIn.progressStatus}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-surface-400 italic text-sm py-4">No check-in submitted for {quarter}.</div>
                  )}
                </div>

                <div className="bg-surface-50 p-5 rounded-xl border border-surface-200">
                  <div className="text-xs font-bold text-surface-400 uppercase mb-4">Manager Feedback</div>
                  <textarea 
                    key={`${goal.id}-${quarter}`}
                    defaultValue={checkIn?.managerComment || ''}
                    className="input-field resize-none h-24 mb-3"
                    placeholder="Add your review comments here..."
                    onBlur={(e) => handleSaveComment(goal.id, e.target.value)}
                  />
                  <div className="text-xs text-surface-400">
                    {saving === goal.id ? 'Saving...' : 'Auto-saved when you click away.'}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div className="card p-16 text-center">
            <p className="text-surface-500">This employee has no approved goals yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
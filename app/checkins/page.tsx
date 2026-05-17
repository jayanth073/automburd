'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CheckInsDashboard() {
  const [goals, setGoals] = useState<any[]>([]);
  const [checkIns, setCheckIns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quarter, setQuarter] = useState('Q1');

  useEffect(() => {
    async function fetchData() {
      const [goalsRes, checkinsRes] = await Promise.all([
        fetch('/api/goals'),
        fetch('/api/checkins')
      ]);
      if (goalsRes.ok) {
        const goalsData = await goalsRes.json();
        if (Array.isArray(goalsData)) setGoals(goalsData.filter((g: any) => g.status === 'APPROVED'));
      }
      if (checkinsRes.ok) {
        const checkinsData = await checkinsRes.json();
        if (Array.isArray(checkinsData)) setCheckIns(checkinsData);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

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
    <div className="min-h-screen pb-20">
      <div className="max-w-6xl mx-auto px-6 pt-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold text-surface-900 mb-2">Quarterly Check-ins</h1>
            <p className="text-surface-500 font-medium">Track achievement against your commitments</p>
          </div>
          <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-surface-200 shadow-sm">
            {['Q1', 'Q2', 'Q3', 'Q4'].map(q => (
              <button 
                key={q}
                onClick={() => setQuarter(q)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  quarter === q ? 'bg-brand-600 text-white shadow-md' : 'text-surface-500 hover:text-surface-900'
                }`}
              >
                {q}
              </button>
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {goals.map((goal: any) => {
            const checkIn = checkIns.find(ci => ci.goalId === goal.id && ci.quarter === quarter);
            return (
              <div key={goal.id} className="card p-6 hover:border-brand-200 transition-all group">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="badge badge-neutral">{goal.thrustArea}</span>
                    </div>
                    <h3 className="text-lg font-bold text-surface-900 mb-2 group-hover:text-brand-600 transition-colors">{goal.title}</h3>
                    <p className="text-sm text-surface-500 line-clamp-2">{goal.description}</p>
                    
                    <div className="mt-5 flex items-center gap-6">
                      <div>
                        <div className="text-xs font-medium text-surface-400 mb-1">Target</div>
                        <div className="text-sm font-bold text-surface-900">{goal.target}</div>
                      </div>
                      <div>
                        <div className="text-xs font-medium text-surface-400 mb-1">Weight</div>
                        <div className="text-sm font-bold text-brand-600">{goal.weightage}%</div>
                      </div>
                    </div>
                  </div>

                  <div className="md:w-64 bg-surface-50 rounded-xl p-5 border border-surface-100">
                    {checkIn ? (
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-surface-400">Actual</span>
                          <span className="text-sm font-bold text-surface-900">{checkIn.actualAchievement}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-medium text-surface-400">Score</span>
                          <span className="text-lg font-bold text-emerald-600">{(checkIn.computedScore * 100).toFixed(0)}%</span>
                        </div>
                        <div className="pt-3 border-t border-surface-200">
                          <span className="text-xs font-medium text-surface-400 block mb-2">Manager Feedback</span>
                          <p className="text-xs text-surface-600 italic">
                            {checkIn.managerComment ? `"${checkIn.managerComment}"` : "Awaiting review..."}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-center py-4">
                        <p className="text-xs font-medium text-surface-400 mb-4">No data for {quarter}</p>
                        <Link 
                          href={`/checkins/${goal.id}?quarter=${quarter}`}
                          className="btn-secondary text-sm w-full"
                        >
                          Start Check-in
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {goals.length === 0 && (
            <div className="card p-16 text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-surface-100 rounded-2xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <p className="text-surface-500 font-medium">No approved goals available for check-in</p>
              <Link href="/dashboard" className="text-brand-600 font-medium text-sm mt-3 inline-block hover:underline">Return to Dashboard</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
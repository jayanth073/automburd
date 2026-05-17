'use client';

import { useRouter } from 'next/navigation';

export default function ApprovalActions({ employeeId }: { employeeId: string }) {
  const router = useRouter();

  const handleAction = async (action: 'APPROVE' | 'RETURN') => {
    const res = await fetch('/api/goals/approve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ employeeId, action }),
    });

    if (res.ok) {
      router.push('/manager/team');
    } else {
      const data = await res.json();
      alert(data.error || 'Action failed');
    }
  };

  return (
    <div className="flex gap-4 p-4 bg-surface-50/80 backdrop-blur-xl rounded-2xl border border-surface-200 shadow-lg">
      <button 
        onClick={() => handleAction('RETURN')}
        className="flex-1 bg-surface-200 hover:bg-surface-300 text-surface-700 font-semibold py-3 rounded-xl transition-all"
      >
        Return for Rework
      </button>
      <button 
        onClick={() => handleAction('APPROVE')}
        className="flex-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
      >
        Approve Goal Sheet
      </button>
    </div>
  );
}
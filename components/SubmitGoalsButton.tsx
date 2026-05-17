'use client';

import { useToast } from '@/components/Toast';

export default function SubmitGoalsButton({ cycleId }: { cycleId?: string }) {
  const { showToast } = useToast();

  const handleSubmit = async () => {
    if (!cycleId) { showToast('No active cycle found', 'error'); return; }
    const res = await fetch('/api/goals/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cycleId }),
    });
    if (res.ok) {
      showToast('Goals submitted for approval!', 'success');
      window.location.reload();
    } else {
      const data = await res.json();
      showToast(data.error || 'Submission failed', 'error');
    }
  };

  return (
    <button 
      onClick={handleSubmit}
      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white font-semibold py-3 rounded-xl shadow-lg shadow-emerald-500/20 transition-all transform active:scale-[0.99]"
    >
      Submit Goal Sheet for Approval
    </button>
  );
}
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function EditGoalPage({ params }: { params: { id: string } }) {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    id: '',
    thrustArea: '',
    title: '',
    description: '',
    uomType: 'NUMERIC_MIN',
    target: '',
    weightage: '10',
    isShared: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isLocked, setIsLocked] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchGoal() {
      const res = await fetch('/api/goals');
      const goals = await res.json();
      const goal = goals.find((g: any) => g.id === params.id);
      if (goal) {
        setFormData({
          id: goal.id,
          thrustArea: goal.thrustArea,
          title: goal.title,
          description: goal.description,
          uomType: goal.uomType,
          target: goal.target,
          weightage: goal.weightage.toString(),
          isShared: goal.isShared || false,
        });
        setIsLocked((goal.isLocked && !goal.isShared) || (goal.status === 'APPROVED' && !goal.isShared));
      }
      setLoading(false);
    }
    fetchGoal();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const res = await fetch('/api/goals', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        target: formData.uomType === 'ZERO' ? '0' : formData.target
      }),
    });

    if (res.ok) {
      router.push('/dashboard');
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to update goal', 'error');
    }
    setSaving(false);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Loading...</div></div>;

  return (
    <div className="max-w-2xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-8">
        <Link href="/dashboard" className="text-surface-500 hover:text-surface-900 text-sm font-medium flex items-center gap-2 mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-surface-900">Edit Goal</h1>
      </header>

      <form onSubmit={handleSubmit} className="card p-8 space-y-6">
        {isLocked && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl text-amber-700 text-sm font-medium flex items-center gap-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
            This goal is locked. Contact Admin to request changes.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-surface-600 mb-2">Thrust Area</label>
            <input 
              type="text" 
              required
              className="input-field"
              value={formData.thrustArea}
              onChange={(e) => setFormData({...formData, thrustArea: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-600 mb-2">Unit of Measure</label>
            <select 
              className="input-field"
              value={formData.uomType}
              onChange={(e) => setFormData({...formData, uomType: e.target.value})}
            >
              <option value="NUMERIC_MIN">Numeric (Higher is Better)</option>
              <option value="NUMERIC_MAX">Numeric (Lower is Better)</option>
              <option value="TIMELINE">Timeline (Date-based)</option>
              <option value="ZERO">Zero-Target (Zero = 100%)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-surface-600 mb-2">Goal Title</label>
          <input 
            type="text" 
            required
            disabled={formData.isShared}
            className={`input-field ${formData.isShared ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-surface-600 mb-2">Description</label>
          <textarea 
            rows={3}
            disabled={formData.isShared}
            className={`input-field resize-none ${formData.isShared ? 'opacity-50 cursor-not-allowed' : ''}`}
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-surface-600 mb-2">Target Value</label>
            <input 
              type={formData.uomType === 'TIMELINE' ? 'date' : 'text'}
              required
              disabled={formData.uomType === 'ZERO' || formData.isShared}
              className={`input-field ${formData.isShared ? 'opacity-50 cursor-not-allowed' : ''}`}
              value={formData.target}
              onChange={(e) => setFormData({...formData, target: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-600 mb-2">Weightage (%)</label>
            <input 
              type="number" 
              min="10"
              max="100"
              required
              className="input-field"
              value={formData.weightage}
              onChange={(e) => setFormData({...formData, weightage: e.target.value})}
            />
          </div>
        </div>

        <button 
          type="submit"
          disabled={saving || isLocked}
          className="w-full btn-primary disabled:opacity-50"
        >
          {saving ? 'Saving...' : (isLocked ? 'Locked' : 'Update Goal')}
        </button>
      </form>
    </div>
  );
}
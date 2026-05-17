'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function NewGoalPage() {
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    thrustArea: '',
    title: '',
    description: '',
    uomType: 'NUMERIC_MIN',
    target: '',
    weightage: '10',
  });
  const [loading, setLoading] = useState(false);
  const [existingWeight, setExistingWeight] = useState(0);
  const router = useRouter();

  useEffect(() => {
    async function fetchWeight() {
      const res = await fetch('/api/goals');
      if (res.ok) {
        const goals = await res.json();
        const total = goals
          .filter((g: any) => !g.isShared)
          .reduce((sum: number, g: any) => sum + g.weightage, 0);
        setExistingWeight(total);
      }
    }
    fetchWeight();
  }, []);

  const totalPlanned = existingWeight + parseFloat(formData.weightage || '0');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const res = await fetch('/api/goals', {
      method: 'POST',
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
      showToast(data.error || 'Failed to create goal', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-2xl mx-auto px-6 pt-8">
        <header className="mb-8">
          <Link href="/dashboard" className="text-surface-500 hover:text-surface-900 text-sm font-medium flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-surface-900">Create New Goal</h1>
          <div className="mt-4 p-4 bg-surface-50 rounded-xl border border-surface-200 flex justify-between items-center">
            <span className="text-xs font-semibold text-surface-400 uppercase tracking-wider">Total Weightage</span>
            <span className={`text-xl font-bold ${totalPlanned > 100 ? 'text-red-500' : totalPlanned === 100 ? 'text-emerald-500' : 'text-brand-500'}`}>
              {totalPlanned}% / 100%
            </span>
          </div>
        </header>

        <form onSubmit={handleSubmit} className="card p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-surface-600 mb-2">Thrust Area</label>
              <input 
                type="text" 
                required
                className="input-field"
                placeholder="e.g. Operational Excellence"
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
              className="input-field"
              placeholder="Brief title of the KPI"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-surface-600 mb-2">Description</label>
            <textarea 
              rows={3}
              className="input-field resize-none"
              placeholder="Detailed description and target criteria"
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
                className="input-field"
                placeholder={formData.uomType === 'ZERO' ? '0' : 'e.g. 95% or 1000000'}
                value={formData.target}
                disabled={formData.uomType === 'ZERO'}
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
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Create Goal'}
          </button>
        </form>
      </div>
    </div>
  );
}
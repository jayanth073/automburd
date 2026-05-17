'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function SharedGoalsPage() {
  const { showToast } = useToast();
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    thrustArea: '',
    title: '',
    description: '',
    uomType: 'NUMERIC_MIN',
    target: '',
    weightage: '10',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function fetchEmployees() {
      const res = await fetch('/api/admin/employees');
      if (res.ok) {
        const data = await res.json();
        setEmployees(data);
      }
      setLoading(false);
    }
    fetchEmployees();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) { showToast('Select at least one employee', 'error'); return; }
    setSaving(true);
    
    const res = await fetch('/api/admin/shared-goals', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        targetEmployeeIds: selectedIds
      }),
    });

    if (res.ok) {
      router.push('/admin/dashboard');
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to push goals', 'error');
    }
    setSaving(false);
  };

  const toggleEmployee = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Loading...</div></div>;

  return (
    <div className="max-w-4xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-8">
        <Link href="/admin/dashboard" className="text-surface-500 hover:text-surface-900 text-sm font-medium mb-4 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-surface-900">Deploy Shared KPI</h1>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="card p-8 space-y-6">
          <h3 className="text-lg font-bold text-surface-900 mb-4">Goal Details</h3>
          <div>
            <label className="block text-sm font-semibold text-surface-600 mb-2">Thrust Area</label>
            <input type="text" required className="input-field" value={formData.thrustArea} onChange={(e) => setFormData({...formData, thrustArea: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-600 mb-2">Goal Title</label>
            <input type="text" required className="input-field" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-600 mb-2">Target</label>
            <input type="text" required className="input-field" value={formData.target} onChange={(e) => setFormData({...formData, target: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-semibold text-surface-600 mb-2">Weightage (%)</label>
            <input type="number" required className="input-field" value={formData.weightage} onChange={(e) => setFormData({...formData, weightage: e.target.value})} />
          </div>
        </div>

        <div className="card p-8 flex flex-col">
          <h3 className="text-lg font-bold text-surface-900 mb-4">Select Employees</h3>
          <div className="flex-1 overflow-y-auto space-y-2 max-h-[400px] mb-6">
            {employees.map((emp: any) => (
              <label key={emp.id} className="flex items-center gap-3 p-3 bg-surface-50 rounded-xl cursor-pointer hover:bg-surface-100 transition-colors border border-surface-100">
                <input 
                  type="checkbox" 
                  checked={selectedIds.includes(emp.id)}
                  onChange={() => toggleEmployee(emp.id)}
                  className="w-5 h-5 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                />
                <div>
                  <div className="text-sm font-medium text-surface-900">{emp.name}</div>
                  <div className="text-xs text-surface-500">{emp.email}</div>
                </div>
              </label>
            ))}
          </div>
          <button 
            type="submit"
            disabled={saving}
            className="w-full btn-primary"
          >
            {saving ? 'Deploying...' : `Deploy to ${selectedIds.length} Employees`}
          </button>
        </div>
      </form>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function EscalationsPage() {
  const [rules, setRules] = useState<any[]>([]);
  const [escalations, setEscalations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [rulesRes, escalationsRes] = await Promise.all([
      fetch('/api/admin/escalations?type=rules'),
      fetch('/api/admin/escalations')
    ]);
    if (rulesRes.ok) setRules(await rulesRes.json());
    if (escalationsRes.ok) setEscalations(await escalationsRes.json());
    setLoading(false);
  }

  const handleTrigger = async () => {
    setTriggering(true);
    await fetch('/api/admin/escalations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'trigger' })
    });
    await fetchData();
    setTriggering(false);
  };

  const handleResolve = async (id: string) => {
    await fetch('/api/admin/escalations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'resolve', escalationId: id })
    });
    await fetchData();
  };

  const handleEscalate = async (id: string) => {
    await fetch('/api/admin/escalations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'escalate', escalationId: id })
    });
    await fetchData();
  };

  const toggleRule = async (ruleId: string, isActive: boolean) => {
    await fetch('/api/admin/escalations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateRule', ruleId, updates: { isActive: !isActive } })
    });
    await fetchData();
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Loading...</div></div>;

  return (
    <div className="max-w-7xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-8">
        <Link href="/admin/dashboard" className="text-surface-500 hover:text-surface-900 text-sm font-medium mb-4 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Admin
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-surface-900">Escalation Module</h1>
            <p className="text-surface-500">Configure and monitor automated escalations</p>
          </div>
          <button 
            onClick={handleTrigger}
            disabled={triggering}
            className="btn-primary"
          >
            {triggering ? 'Checking...' : 'Check & Trigger Escalations'}
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <section className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Escalation Rules</h2>
          </div>
          <div className="divide-y divide-surface-100">
            {rules.map(rule => (
              <div key={rule.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-surface-900">{rule.name}</div>
                  <div className="text-sm text-surface-500">
                    Trigger after {rule.daysThreshold} days • Chain: {rule.escalationChain.join(' → ')}
                  </div>
                </div>
                <button 
                  onClick={() => toggleRule(rule.id, rule.isActive)}
                  className={`badge ${rule.isActive ? 'badge-success' : 'badge-neutral'}`}
                >
                  {rule.isActive ? 'Active' : 'Inactive'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Active Escalations</h2>
          </div>
          <div className="divide-y divide-surface-100 max-h-[400px] overflow-y-auto">
            {escalations.filter(e => e.status === 'ACTIVE').length === 0 ? (
              <div className="px-6 py-8 text-center text-surface-400">No active escalations</div>
            ) : (
              escalations.filter(e => e.status === 'ACTIVE').map(esc => (
                <div key={esc.id} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-semibold text-surface-900">{esc.employeeName}</span>
                    <span className="badge badge-error">Level {esc.currentLevel + 1}</span>
                  </div>
                  <div className="text-sm text-surface-500 mb-3">{esc.ruleName}</div>
                  <div className="flex gap-2">
                    <button onClick={() => handleResolve(esc.id)} className="btn-secondary text-xs py-1">Resolve</button>
                    <button onClick={() => handleEscalate(esc.id)} className="btn-danger text-xs py-1">Escalate</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      {escalations.filter(e => e.status === 'RESOLVED').length > 0 && (
        <section className="card overflow-hidden mt-8">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Resolved Escalations</h2>
          </div>
          <div className="divide-y divide-surface-100">
            {escalations.filter(e => e.status === 'RESOLVED').map(esc => (
              <div key={esc.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="font-semibold text-surface-900">{esc.employeeName}</div>
                  <div className="text-sm text-surface-500">{esc.ruleName}</div>
                </div>
                <span className="badge badge-success">Resolved</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
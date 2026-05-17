'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';

export default function UsersPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data);
    }
    setLoading(false);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const payload = Object.fromEntries(formData);
    
    // If managerId is empty string, make it null/undefined
    if (!payload.managerId) {
      delete payload.managerId;
    }

    const res = await fetch('/api/admin/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      showToast('User added successfully (Password: password123)', 'success');
      (e.target as HTMLFormElement).reset();
      fetchUsers();
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to add user', 'error');
    }
    setSubmitting(false);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
      return;
    }
    
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      showToast('User deleted successfully', 'success');
      fetchUsers();
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to delete user', 'error');
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-3 text-surface-500 font-medium">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
        </svg>
        Loading Directory...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/20 text-white">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Directory Management</h1>
              <p className="text-surface-500 font-medium">Add, remove, and manage employees and managers</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/dashboard" className="btn-secondary text-sm py-2 px-4">Overview</Link>
            <Link href="/admin/cycles" className="btn-secondary text-sm py-2 px-4">Cycles</Link>
            <Link href="/admin/shared-goals" className="btn-secondary text-sm py-2 px-4">Shared Goals</Link>
            <Link href="/admin/users" className="btn-secondary text-sm py-2 px-4 bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100">Directory</Link>
            <Link href="/admin/analytics" className="btn-secondary text-sm py-2 px-4">Analytics</Link>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <section className="card overflow-hidden animate-fade-in h-full">
              <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
                <h2 className="text-base font-bold text-surface-900">Current Users ({users.length})</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-surface-100">
                      <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Manager</th>
                      <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-50">
                    {users.map((u) => {
                      const mgr = users.find(m => m.id === u.managerId);
                      return (
                        <tr key={u.id} className="hover:bg-surface-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="font-semibold text-surface-900">{u.name}</div>
                            <div className="text-sm text-surface-500">{u.email}</div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`badge ${
                              u.role === 'ADMIN' ? 'badge-error' :
                              u.role === 'MANAGER' ? 'badge-warning' : 'badge-info'
                            }`}>
                              {u.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-surface-600">
                            {mgr ? mgr.name : '—'}
                          </td>
                          <td className="px-6 py-4 text-right">
                            {u.role !== 'ADMIN' && (
                              <button 
                                onClick={() => handleDeleteUser(u.id, u.name)}
                                className="text-xs font-semibold bg-red-50 text-red-600 px-3 py-1.5 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <section className="card overflow-hidden animate-fade-in">
              <div className="px-6 py-4 border-b border-surface-900 bg-surface-900 text-white">
                <h2 className="text-sm font-bold">Add New User</h2>
                <p className="text-xs text-surface-400 mt-1">Default password will be set to: password123</p>
              </div>
              <form onSubmit={handleAddUser} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Full Name</label>
                  <input name="name" required className="input-field text-sm" placeholder="e.g. Jane Doe" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Email Address</label>
                  <input type="email" name="email" required className="input-field text-sm" placeholder="jane@demo.com" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Role</label>
                  <select name="role" required className="input-field text-sm">
                    <option value="EMPLOYEE">Employee</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 uppercase tracking-wider mb-2">Reports To (Optional)</label>
                  <select name="managerId" className="input-field text-sm">
                    <option value="">None</option>
                    {users.filter(u => u.role === 'MANAGER' || u.role === 'ADMIN').map(mgr => (
                      <option key={mgr.id} value={mgr.id}>{mgr.name} ({mgr.role})</option>
                    ))}
                  </select>
                </div>
                <button 
                  disabled={submitting}
                  className="w-full btn-primary text-sm disabled:opacity-50 mt-2"
                >
                  {submitting ? 'Creating...' : 'Create User'}
                </button>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

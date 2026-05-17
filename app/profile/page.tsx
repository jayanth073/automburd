'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/components/Toast';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const sessionCookie = cookies.find(row => row.startsWith('session='));
    if (sessionCookie) {
      try {
        const payloadBase64 = sessionCookie.split('=')[1].split('.')[0];
        const userData = JSON.parse(atob(payloadBase64));
        setUser(userData);
      } catch (e) {
        setUser(null);
      }
    } else {
      router.push('/login');
    }
    setLoading(false);
  }, [router]);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const formData = new FormData(e.currentTarget as HTMLFormElement);
    const currentPassword = formData.get('currentPassword') as string;
    const newPassword = formData.get('newPassword') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (newPassword !== confirmPassword) {
      showToast('New passwords do not match', 'error');
      setSaving(false);
      return;
    }

    const res = await fetch('/api/auth/password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (res.ok) {
      showToast('Password updated successfully!', 'success');
      (e.target as HTMLFormElement).reset();
    } else {
      const data = await res.json();
      showToast(data.error || 'Failed to update password', 'error');
    }
    setSaving(false);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-surface-500 font-medium">Loading Profile...</div>
    </div>
  );

  if (!user) return null;

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-3xl mx-auto px-6 pt-10">
        <header className="mb-8 animate-fade-in">
          <Link href="/dashboard" className="text-surface-500 hover:text-surface-900 text-sm font-medium flex items-center gap-2 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Dashboard
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-500/20 text-white text-2xl font-bold">
              {user.name?.[0]}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Account Settings</h1>
              <p className="text-surface-500 font-medium">Manage your profile and security credentials</p>
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-1 space-y-6">
            <section className="card p-6 animate-fade-in">
              <h2 className="text-xs font-bold text-surface-400 uppercase tracking-wider mb-4">Profile Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-surface-500 mb-1">Full Name</label>
                  <div className="font-medium text-surface-900">{user.name}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 mb-1">Email Address</label>
                  <div className="font-medium text-surface-900">{user.email}</div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-surface-500 mb-1">Role</label>
                  <span className={`badge ${
                    user.role === 'ADMIN' ? 'badge-error' :
                    user.role === 'MANAGER' ? 'badge-warning' : 'badge-info'
                  }`}>
                    {user.role}
                  </span>
                </div>
              </div>
            </section>
          </div>

          <div className="md:col-span-2 space-y-6">
            <section className="card overflow-hidden animate-fade-in animate-stagger-1">
              <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
                <h2 className="text-base font-bold text-surface-900">Change Password</h2>
              </div>
              <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-surface-600 mb-2">Current Password</label>
                  <input 
                    type="password" 
                    name="currentPassword" 
                    required 
                    className="input-field" 
                    placeholder="Enter your current password" 
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 mb-2">New Password</label>
                    <input 
                      type="password" 
                      name="newPassword" 
                      required 
                      minLength={6}
                      className="input-field" 
                      placeholder="At least 6 characters" 
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-surface-600 mb-2">Confirm New Password</label>
                    <input 
                      type="password" 
                      name="confirmPassword" 
                      required 
                      minLength={6}
                      className="input-field" 
                      placeholder="Type it again" 
                    />
                  </div>
                </div>
                <div className="pt-2">
                  <button 
                    type="submit"
                    disabled={saving}
                    className="w-full sm:w-auto btn-primary disabled:opacity-50 px-8"
                  >
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

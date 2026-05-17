'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function NotificationsPage() {
  const [data, setData] = useState<any>(null);
  const [tab, setTab] = useState<'all' | 'emails' | 'teams'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const res = await fetch(`/api/admin/notifications?type=${tab === 'all' ? '' : tab}&limit=100`);
      if (res.ok) setData(await res.json());
      setLoading(false);
    }
    fetchData();
  }, [tab]);

  if (loading) return <div className="min-h-screen flex items-center justify-center"><div className="text-surface-500 font-medium">Loading notifications...</div></div>;

  const emails = data?.emails || [];
  const teams = data?.teams || [];
  const summary = data?.summary;

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-8">
        <Link href="/admin/dashboard" className="text-surface-500 hover:text-surface-900 text-sm font-medium mb-4 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-surface-900">Notification Center</h1>
        <p className="text-surface-500">Email and Teams notification activity log</p>
      </header>

      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card p-5">
            <div className="text-xs font-semibold text-surface-400 uppercase mb-1">Total Emails Sent</div>
            <div className="text-3xl font-bold text-surface-900">{summary.totalEmails}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold text-surface-400 uppercase mb-1">Teams Messages</div>
            <div className="text-3xl font-bold text-surface-900">{summary.totalTeams}</div>
          </div>
          <div className="card p-5">
            <div className="text-xs font-semibold text-surface-400 uppercase mb-1">Total Notifications</div>
            <div className="text-3xl font-bold text-brand-600">{summary.totalEmails + summary.totalTeams}</div>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        {(['all', 'emails', 'teams'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t ? 'bg-brand-600 text-white shadow-md' : 'bg-surface-100 text-surface-500 hover:text-surface-900'}`}>
            {t === 'all' ? 'All' : t === 'emails' ? 'Emails' : 'Teams'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {tab !== 'teams' && emails.map((e: any) => (
          <div key={e.id} className="card p-5 border-l-4 border-l-brand-500">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="badge badge-info text-[9px] mr-2">{e.type}</span>
                <span className="font-semibold text-surface-900">{e.subject}</span>
              </div>
              <span className="text-xs text-surface-400 font-mono">{new Date(e.sentAt).toLocaleString()}</span>
            </div>
            <div className="text-sm text-surface-500 mb-1">To: {e.to}</div>
            <div className="text-sm text-surface-600 bg-surface-50 p-3 rounded-lg">{e.body}</div>
            {e.deepLink && (
              <a href={e.deepLink} className="text-xs text-brand-600 hover:underline mt-2 inline-block">Open in Portal →</a>
            )}
          </div>
        ))}

        {tab !== 'emails' && teams.map((t: any) => (
          <div key={t.id} className="card p-5 border-l-4 border-l-purple-500">
            <div className="flex justify-between items-start mb-2">
              <div>
                <span className="badge badge-neutral text-[9px] mr-2">TEAMS</span>
                <span className="font-semibold text-surface-900">{t.channel}</span>
              </div>
              <span className="text-xs text-surface-400 font-mono">{new Date(t.sentAt).toLocaleString()}</span>
            </div>
            <div className="text-sm text-surface-600 bg-surface-50 p-3 rounded-lg">{t.message}</div>
          </div>
        ))}

        {emails.length === 0 && teams.length === 0 && (
          <div className="card p-12 text-center text-surface-400">No notifications have been sent yet.</div>
        )}
      </div>
    </div>
  );
}

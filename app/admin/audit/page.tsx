import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { readDb } from '@/lib/db';
import Link from 'next/link';

export default function AuditPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (session.role !== 'ADMIN') redirect('/dashboard');
  
  const db = readDb();

  const logs = [...(db.auditLogs || [])].reverse();

  return (
    <div className="max-w-6xl mx-auto px-6 pb-20 pt-8">
      <header className="mb-10">
        <Link href="/admin/dashboard" className="text-surface-500 hover:text-surface-900 text-sm font-medium mb-4 inline-flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
          Back to Admin
        </Link>
        <h1 className="text-3xl font-bold text-surface-900">System Audit Logs</h1>
        <p className="text-surface-500">Track all critical state changes and administrative actions</p>
      </header>

      <div className="card overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-surface-50 text-surface-400 uppercase text-xs font-semibold tracking-wider">
            <tr>
              <th className="px-6 py-4">Timestamp</th>
              <th className="px-6 py-4">Action</th>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Target</th>
              <th className="px-6 py-4">Details</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-100">
            {logs.map((log: any) => (
              <tr key={log.id} className="hover:bg-surface-50">
                <td className="px-6 py-4 text-surface-500 font-mono whitespace-nowrap">{new Date(log.changedAt).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <span className="badge badge-info">{log.changeType}</span>
                </td>
                <td className="px-6 py-4 text-surface-700">{log.userName || 'System'}</td>
                <td className="px-6 py-4 text-surface-500 truncate max-w-[150px]">{log.goalTitle || 'N/A'}</td>
                <td className="px-6 py-4 text-surface-400 italic truncate max-w-[200px]">{log.newValue || 'No details'}</td>
              </tr>
            ))}
            {logs.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-surface-400 italic">No audit records found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
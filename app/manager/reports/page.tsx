import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { QUARTERS } from '@/lib/constants';
import Link from 'next/link';

export default function ManagerReportsPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (session.role !== 'MANAGER' && session.role !== 'ADMIN') redirect('/dashboard');

  const db = readDb();
  const team = db.users.filter((u: any) => u.managerId === session.id);
  const teamIds = team.map((u: any) => u.id);

  const teamGoals = db.goals.filter((g: any) => teamIds.includes(g.employeeId));
  const teamCheckIns = db.checkIns.filter((ci: any) => {
    const goal = db.goals.find((g: any) => g.id === ci.goalId);
    return goal && teamIds.includes(goal.employeeId);
  });
  const teamAuditLogs = (db.auditLogs || []).filter((log: any) => {
    const goal = db.goals.find((g: any) => g.id === log.goalId);
    return goal && teamIds.includes(goal.employeeId);
  }).reverse();

  const quarterlyCompliance = team.map((emp: any) => {
    const empApprovedGoals = teamGoals.filter((g: any) => g.employeeId === emp.id && g.status === 'APPROVED');
    const quarters = QUARTERS.map(q => {
      const checkedIn = empApprovedGoals.filter(g =>
        teamCheckIns.some(ci => ci.goalId === g.id && ci.quarter === q)
      ).length;
      return { quarter: q, checkedIn, total: empApprovedGoals.length };
    });
    return { name: emp.name, email: emp.email, quarters };
  });

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-10">
        <header className="mb-8">
          <Link href="/manager/team" className="text-surface-500 hover:text-surface-900 text-sm font-medium mb-4 inline-flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            Back to Team
          </Link>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900 tracking-tight">Reports & Analytics</h1>
              <p className="text-surface-500 font-medium">Team performance tracking and audit trail</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link href="/manager/team" className="btn-secondary text-sm py-2 px-4">Team</Link>
            <Link href="/manager/reports" className="btn-secondary text-sm py-2 px-4 bg-brand-50 border-brand-200 text-brand-700 hover:bg-brand-100">Reports</Link>
            <a href="/api/admin/export" className="btn-secondary text-sm py-2 px-4" download>CSV Export</a>
            <a href="/api/admin/export/excel" className="btn-primary text-sm py-2 px-4" download>Excel Export</a>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="card p-6 animate-fade-in animate-stagger-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Team Size</h3>
            </div>
            <span className="text-3xl font-bold text-surface-900">{team.length}</span>
          </div>
          <div className="card p-6 animate-fade-in animate-stagger-2">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Total Goals</h3>
            </div>
            <span className="text-3xl font-bold text-surface-900">{teamGoals.length}</span>
          </div>
          <div className="card p-6 animate-fade-in animate-stagger-3">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Pending Review</h3>
            </div>
            <span className="text-3xl font-bold text-amber-600">{teamGoals.filter((g: any) => g.status === 'SUBMITTED').length}</span>
          </div>
        </div>

        <section className="card overflow-hidden animate-fade-in mb-8">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-base font-bold text-surface-900">Quarterly Check-in Compliance</h2>
            <p className="text-xs text-surface-400 mt-1">Target vs Actual achievement tracking per quarter</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="px-4 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Employee</th>
                  {['Q1','Q2','Q3','Q4'].map(q => (
                    <th key={q} className="px-3 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-center">{q}</th>
                  ))}
                  <th className="px-3 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {quarterlyCompliance.map((row: any) => (
                  <tr key={row.name} className="hover:bg-surface-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-surface-900 text-sm">{row.name}</div>
                      <div className="text-xs text-surface-400">{row.email}</div>
                    </td>
                    {row.quarters.map((q: any) => (
                      <td key={q.quarter} className="px-3 py-3 text-center">
                        <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                          q.total === 0 ? 'text-surface-300' :
                          q.checkedIn >= q.total ? 'text-emerald-600' :
                          q.checkedIn > 0 ? 'text-amber-600' : 'text-red-400'
                        }`}>
                          {q.total === 0 ? '—' : `${q.checkedIn}/${q.total}`}
                        </span>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-right">
                      <Link
                        href={`/manager/checkins/${team.find((e: any) => e.name === row.name)?.id}`}
                        className="text-xs font-semibold bg-surface-100 text-surface-500 px-3 py-1.5 rounded-lg hover:bg-brand-50 hover:text-brand-600 transition-all"
                      >
                        Review
                      </Link>
                    </td>
                  </tr>
                ))}
                {quarterlyCompliance.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-surface-400 italic">No team data available.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card overflow-hidden animate-fade-in">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-base font-bold text-surface-900">Audit Trail</h2>
            <p className="text-xs text-surface-400 mt-1">All changes made to your team goals — who changed what and when</p>
          </div>
          <div className="overflow-x-auto">
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
                {teamAuditLogs.slice(0, 50).map((log: any) => (
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
                {teamAuditLogs.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-surface-400 italic">No audit records found for your team.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

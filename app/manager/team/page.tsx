import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { readDb } from '@/lib/db';
import { QUARTERS } from '@/lib/constants';
import Link from 'next/link';
import PushKpiButton from '@/components/PushKpiButton';

export default function TeamPage() {
  const session = getSession();
  if (!session) redirect('/login');
  if (session.role !== 'MANAGER' && session.role !== 'ADMIN') redirect('/dashboard');
  
  const db = readDb();

  const team = db.users.filter((u: any) => u.managerId === session.id);
  const activeCycle = db.goalCycles.find((c: any) => c.isActive);

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      APPROVED: 'badge-success',
      'PENDING REVIEW': 'badge-warning',
      RETURNED: 'badge-error',
      DRAFT: 'badge-neutral',
      'NOT STARTED': 'badge-neutral',
    };
    return badges[status] || 'badge-neutral';
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-600"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-surface-900">Team Management</h1>
              <p className="text-surface-500 font-medium">Monitoring {team.length} direct reports</p>
            </div>
          </div>
          <PushKpiButton />
        </header>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-100 bg-surface-50/50">
            <h2 className="text-base font-bold text-surface-900">Direct Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-100">
                  <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Employee</th>
                  <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-center">Goals</th>
                  {['Q1','Q2','Q3','Q4'].map(q => (
                    <th key={q} className="px-2 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-center">{q}</th>
                  ))}
                  <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-center">Weight</th>
                  <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-semibold text-surface-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-50">
                {team.map((emp: any) => {
                  const empGoals = db.goals.filter((g: any) => g.employeeId === emp.id);
                  const approvedGoals = empGoals.filter((g: any) => g.status === 'APPROVED');
                  const totalWeight = empGoals.reduce((sum: number, g: any) => sum + g.weightage, 0);
                  const getQuarterCheckinCount = (q: string) =>
                    approvedGoals.filter((g: any) => db.checkIns.some((ci: any) => ci.goalId === g.id && ci.quarter === q)).length;
                  
                  let status = 'NOT STARTED';
                  if (empGoals.length > 0) {
                    if (empGoals.every((g: any) => g.status === 'APPROVED')) status = 'APPROVED';
                    else if (empGoals.some((g: any) => g.status === 'SUBMITTED')) status = 'PENDING REVIEW';
                    else if (empGoals.some((g: any) => g.status === 'RETURNED')) status = 'RETURNED';
                    else status = 'DRAFT';
                  }

                  return (
                    <tr key={emp.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-surface-900">{emp.name}</div>
                        <div className="text-sm text-surface-500">{emp.email}</div>
                      </td>
                      <td className="px-6 py-4 text-center text-surface-600">{empGoals.length}</td>
                      {['Q1','Q2','Q3','Q4'].map(q => {
                        const n = getQuarterCheckinCount(q);
                        return (
                          <td key={q} className="px-2 py-4 text-center">
                            <span className={`text-xs font-semibold ${
                              approvedGoals.length === 0 ? 'text-surface-200' :
                              n >= approvedGoals.length ? 'text-emerald-600' :
                              n > 0 ? 'text-amber-600' : 'text-red-300'
                            }`}>
                              {approvedGoals.length > 0 ? `${n}/${approvedGoals.length}` : '—'}
                            </span>
                          </td>
                        );
                      })}
                      <td className="px-6 py-4 text-center">
                        <span className={`font-bold ${totalWeight === 100 ? 'text-emerald-600' : 'text-amber-600'}`}>
                          {totalWeight}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`badge ${getStatusBadge(status)}`}>
                          {status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Link 
                            href={`/manager/approve/${emp.id}`}
                            className="btn-primary text-xs py-2"
                          >
                            Review Goals
                          </Link>
                          <Link 
                            href={`/manager/checkins/${emp.id}`}
                            className="btn-secondary text-xs py-2"
                          >
                            Check-ins
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {team.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-16 text-center text-surface-400 font-medium">
                      No direct reports found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
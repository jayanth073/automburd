import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { readDb } from '@/lib/db';
import Link from 'next/link';
import SubmitGoalsButton from '@/components/SubmitGoalsButton';

export default function DashboardPage() {
  const session = getSession();
  if (!session) redirect('/login');
  
  const db = readDb();

  const goals = db.goals.filter((g: any) => g.employeeId === session.id);
  const activeCycle = db.goalCycles.find((c: any) => c.isActive);

  let sheetStatus = 'NOT STARTED';
  let statusColor = 'text-surface-500';
  if (goals.length > 0) {
    if (goals.every((g: any) => g.status === 'APPROVED')) {
      sheetStatus = 'APPROVED';
      statusColor = 'text-emerald-600';
    } else if (goals.some((g: any) => g.status === 'SUBMITTED')) {
      sheetStatus = 'PENDING';
      statusColor = 'text-amber-600';
    } else if (goals.some((g: any) => g.status === 'RETURNED')) {
      sheetStatus = 'RETURNED';
      statusColor = 'text-red-600';
    } else {
      sheetStatus = 'DRAFT';
      statusColor = 'text-surface-600';
    }
  }

  const getStatusBadge = (status: string) => {
    const badges: Record<string, string> = {
      APPROVED: 'badge-success',
      SUBMITTED: 'badge-warning',
      RETURNED: 'badge-error',
      DRAFT: 'badge-neutral',
    };
    return badges[status] || 'badge-neutral';
  };

  return (
    <div className="min-h-screen pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <header className="mb-10 animate-fade-in">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-surface-900 tracking-tight mb-2">
                Welcome back, <span className="text-gradient">{session.name.split(' ')[0]}</span>
              </h1>
              <p className="text-surface-500 font-medium flex items-center gap-3">
                <span className="badge badge-info">{session.role}</span>
                <span className="text-surface-300">•</span>
                <span>Active Cycle: <span className="font-semibold text-surface-700">{activeCycle?.name || 'No Active Cycle'}</span></span>
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              {session.role === 'ADMIN' && (
                <Link href="/admin/dashboard" className="btn-secondary flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                  Admin
                </Link>
              )}
              {session.role === 'MANAGER' && (
                <Link href="/manager/team" className="btn-primary flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  My Team
                </Link>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="card p-6 animate-fade-in animate-stagger-1">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-brand-600"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Total Goals</h3>
            </div>
            <p className="text-3xl font-bold text-surface-900">{goals.length}</p>
          </div>
          <div className="card p-6 animate-fade-in animate-stagger-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-600"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Sheet Status</h3>
            </div>
            <p className={`text-xl font-bold ${statusColor}`}>{sheetStatus}</p>
          </div>
          <div className="card p-6 md:col-span-2 animate-fade-in animate-stagger-3">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-purple-600"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 className="text-surface-400 text-xs font-semibold uppercase tracking-wider">Deadline</h3>
            </div>
            <p className="text-2xl font-bold text-surface-900">
              {activeCycle?.windowClose ? new Date(activeCycle.windowClose).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not Defined'}
            </p>
          </div>
        </div>

        <div className="card overflow-hidden animate-fade-in animate-stagger-4">
          <div className="p-6 border-b border-surface-100 flex justify-between items-center bg-surface-50/50">
            <h2 className="text-lg font-bold text-surface-900">Performance Commitments</h2>
            {session.role === 'EMPLOYEE' && (goals.length === 0 || goals.every((g: any) => g.status === 'DRAFT' || g.status === 'RETURNED')) && (
              <Link 
                href="/goals/new"
                className="btn-primary text-sm"
              >
                + Create Goal
              </Link>
            )}
          </div>
          
          {goals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-surface-100">
                    <th className="px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Area</th>
                    <th className="px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Goal</th>
                    <th className="px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Target</th>
                    <th className="px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider text-center">Weight</th>
                    <th className="px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-xs font-semibold text-surface-400 uppercase tracking-wider text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-50">
                  {goals.map((goal: any) => (
                    <tr key={goal.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4">
                        <span className="badge badge-neutral">{goal.thrustArea}</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-surface-900">{goal.title}</div>
                        <div className="text-sm text-surface-500 mt-0.5 line-clamp-1">{goal.description}</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-mono text-sm font-medium text-surface-600">
                          {goal.uomType === 'ZERO' ? 'Zero' : goal.target}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-bold text-surface-700">{goal.weightage}%</span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-2">
                          <span className={`badge ${getStatusBadge(goal.status)}`}>
                            {goal.status}
                          </span>
                          {goal.status === 'RETURNED' && goal.managerComment && (
                            <div className="p-2 bg-red-50 border border-red-100 rounded-lg text-xs text-red-600 max-w-[180px]">
                              &ldquo;{goal.managerComment}&rdquo;
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {(goal.status === 'DRAFT' || goal.status === 'RETURNED') && (
                            <Link href={`/goals/edit/${goal.id}`} className="text-sm font-medium text-brand-600 hover:text-brand-700">Edit</Link>
                          )}
                          {goal.status === 'APPROVED' && (
                            <Link href={`/checkins/${goal.id}`} className="btn-secondary text-xs py-1.5 px-3">
                              Check-in
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-surface-100 rounded-2xl mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-400"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
              </div>
              <p className="text-surface-500 font-medium">No goals set for this cycle</p>
              <Link href="/goals/new" className="btn-primary mt-4 inline-flex">Create Your First Goal</Link>
            </div>
          )}
          
          {session.role === 'EMPLOYEE' && goals.length > 0 && goals.some((g: any) => g.status === 'DRAFT' || g.status === 'RETURNED') && (
            <div className="p-6 bg-surface-50 border-t border-surface-100">
              <SubmitGoalsButton cycleId={activeCycle?.id} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
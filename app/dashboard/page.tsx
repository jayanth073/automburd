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
  <div className="min-h-screen bg-gradient-to-br from-black via-zinc-950 to-zinc-900 text-white pb-12">

    <div className="max-w-7xl mx-auto px-6 pt-10">

      {/* HEADER */}

      <header className="mb-10">

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

          <div>

            <h1 className="text-5xl font-extrabold mb-3">
              Welcome Back,
              <span className="bg-gradient-to-r from-violet-500 to-cyan-400 bg-clip-text text-transparent ml-3">
                {session.name.split(' ')[0]}
              </span>
            </h1>

            <p className="text-zinc-400 text-lg">
              Active Cycle:
              <span className="text-white font-semibold ml-2">
                {activeCycle?.name || 'No Active Cycle'}
              </span>
            </p>

          </div>

          <div className="flex gap-4">

            {session.role === 'ADMIN' && (
              <Link
                href="/admin/dashboard"
                className="px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 transition-all"
              >
                Admin Panel
              </Link>
            )}

            {session.role === 'MANAGER' && (
              <Link
                href="/manager/team"
                className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 transition-all"
              >
                My Team
              </Link>
            )}

          </div>

        </div>

      </header>

      {/* STATS */}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

          <p className="text-zinc-400 mb-2">
            Total Goals
          </p>

          <h1 className="text-5xl font-extrabold text-violet-500">
            {goals.length}
          </h1>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

          <p className="text-zinc-400 mb-2">
            Sheet Status
          </p>

          <h1 className={`text-4xl font-extrabold ${statusColor}`}>
            {sheetStatus}
          </h1>

        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 shadow-2xl">

          <p className="text-zinc-400 mb-2">
            Deadline
          </p>

          <h1 className="text-3xl font-bold text-cyan-400">
            {activeCycle?.windowClose
              ? new Date(activeCycle.windowClose).toLocaleDateString()
              : 'Not Defined'}
          </h1>

        </div>

      </div>

      {/* GOALS TABLE */}

      <div className="bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl">

        <div className="flex items-center justify-between p-6 border-b border-zinc-800">

          <h2 className="text-2xl font-bold">
            Performance Goals
          </h2>

          {session.role === 'EMPLOYEE' && (
            <Link
              href="/goals/new"
              className="px-5 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 transition-all"
            >
              + Create Goal
            </Link>
          )}

        </div>

        {goals.length > 0 ? (

          <div className="overflow-x-auto">

            <table className="w-full">

              <thead className="bg-zinc-950">

                <tr>

                  <th className="p-5 text-left text-zinc-400">
                    Area
                  </th>

                  <th className="p-5 text-left text-zinc-400">
                    Goal
                  </th>

                  <th className="p-5 text-left text-zinc-400">
                    Target
                  </th>

                  <th className="p-5 text-left text-zinc-400">
                    Weight
                  </th>

                  <th className="p-5 text-left text-zinc-400">
                    Status
                  </th>

                  <th className="p-5 text-right text-zinc-400">
                    Action
                  </th>

                </tr>

              </thead>

              <tbody>

                {goals.map((goal: any) => (

                  <tr
                    key={goal.id}
                    className="border-t border-zinc-800 hover:bg-zinc-800/40 transition-all"
                  >

                    <td className="p-5">
                      <span className="px-3 py-1 rounded-xl bg-zinc-800 text-sm">
                        {goal.thrustArea}
                      </span>
                    </td>

                    <td className="p-5">

                      <h3 className="font-bold text-lg">
                        {goal.title}
                      </h3>

                      <p className="text-zinc-400 text-sm mt-1">
                        {goal.description}
                      </p>

                    </td>

                    <td className="p-5 text-cyan-400 font-semibold">
                      {goal.uomType === 'ZERO'
                        ? 'Zero'
                        : goal.target}
                    </td>

                    <td className="p-5 font-bold">
                      {goal.weightage}%
                    </td>

                    <td className="p-5">

                      <span className="px-4 py-2 rounded-xl bg-violet-600 text-white text-sm">
                        {goal.status}
                      </span>

                    </td>

                    <td className="p-5 text-right">

                      {(goal.status === 'DRAFT' ||
                        goal.status === 'RETURNED') && (

                        <Link
                          href={`/goals/edit/${goal.id}`}
                          className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition-all"
                        >
                          Edit
                        </Link>
                      )}

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

        ) : (

          <div className="p-20 text-center">

            <h2 className="text-3xl font-bold mb-4">
              No Goals Found
            </h2>

            <p className="text-zinc-400 mb-6">
              Create your first goal to get started.
            </p>

            <Link
              href="/goals/new"
              className="px-6 py-3 rounded-2xl bg-violet-600 hover:bg-violet-500 transition-all"
            >
              Create Goal
            </Link>

          </div>

        )}

      </div>

    </div>

  </div>
);
}

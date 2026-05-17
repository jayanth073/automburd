import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { QUARTERS } from '@/lib/constants';
import * as XLSX from 'xlsx';

export async function GET(_req: Request) {
  const session = getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
    return new Response('Unauthorized', { status: 401 });
  }

  const db = readDb();

  const headers = ['Employee', 'Role', 'Cycle', 'Goal Title', 'Target', 'Weightage', 'Q1 Actual', 'Q1 Score', 'Q2 Actual', 'Q2 Score', 'Q3 Actual', 'Q3 Score', 'Q4 Actual', 'Q4 Score', 'Status'];

  const rows = db.goals.map(goal => {
    const employee = db.users.find(u => u.id === goal.employeeId);
    const cycle = db.goalCycles.find(c => c.id === goal.cycleId);
    const getCi = (q: string) => db.checkIns.find(ci => ci.goalId === goal.id && ci.quarter === q);

    const row: Record<string, unknown> = {
      Employee: employee?.name || 'Unknown',
      Role: employee?.role || '',
      Cycle: cycle?.name || '',
      'Goal Title': goal.title,
      Target: goal.target,
      Weightage: goal.weightage,
    };

    QUARTERS.forEach(q => {
      const ci = getCi(q);
      row[`${q} Actual`] = ci?.actualAchievement || '';
      row[`${q} Score`] = ci?.computedScore ?? '';
    });

    row.Status = goal.status;
    return row;
  });

  const ws = XLSX.utils.json_to_sheet(rows, { header: headers });
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Goal Report');

  const wbBuf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

  return new Response(wbBuf, {
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Content-Disposition': 'attachment; filename="goal-report.xlsx"'
    }
  });
}

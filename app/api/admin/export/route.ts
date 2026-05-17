import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { QUARTERS } from '@/lib/constants';

function escapeCsv(value: unknown): string {
  const str = value == null ? '' : String(value);
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

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
    
    const fields = [
      escapeCsv(employee?.name || 'Unknown'),
      escapeCsv(employee?.role || ''),
      escapeCsv(cycle?.name || ''),
      escapeCsv(goal.title),
      escapeCsv(goal.target),
      escapeCsv(goal.weightage),
    ];
    
    QUARTERS.forEach(q => {
      const ci = getCi(q);
      fields.push(escapeCsv(ci?.actualAchievement || ''), escapeCsv(ci?.computedScore ?? ''));
    });
    
    fields.push(escapeCsv(goal.status));
    return fields.join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');

  return new Response(csvContent, {
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': 'attachment; filename="goal-report.csv"'
    }
  });
}

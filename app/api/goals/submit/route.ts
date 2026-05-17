import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isWindowOpen } from '@/lib/cycleGuard';
import { notifyManagerOnGoalSubmit } from '@/lib/notifications';
import type { Goal } from '@/lib/types';

export async function POST(req: Request) {
  const session = getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { cycleId } = await req.json();
  const db = readDb();

  if (!cycleId || !isWindowOpen(cycleId)) {
    return NextResponse.json({ error: 'Goal submission window is closed' }, { status: 400 });
  }

  const goals = db.goals.filter(g => 
    g.employeeId === session.id && 
    g.cycleId === cycleId && 
    (g.status === 'DRAFT' || g.status === 'RETURNED')
  );

  if (goals.length === 0) {
    return NextResponse.json({ error: 'No draft or returned goals found for this cycle' }, { status: 400 });
  }

  if (goals.length > 8) {
    return NextResponse.json({ error: 'Maximum 8 goals allowed' }, { status: 400 });
  }

  const underMin = goals.find(g => g.weightage < 10);
  if (underMin) {
    return NextResponse.json({ error: `Goal '${underMin.title}' has weightage below 10%` }, { status: 400 });
  }

  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0);
  if (Math.round(totalWeightage) !== 100) {
    return NextResponse.json({ error: `Total weightage is ${totalWeightage}%. Must be exactly 100%.` }, { status: 400 });
  }

  db.goals = db.goals.map(g => {
    if (g.employeeId === session.id && g.cycleId === cycleId && (g.status === 'DRAFT' || g.status === 'RETURNED')) {
      return { ...g, status: 'SUBMITTED' as const, updatedAt: new Date().toISOString() } as Goal;
    }
    return g;
  });

  writeDb(db);

  notifyManagerOnGoalSubmit(session.id);

  return NextResponse.json({ success: true });
}

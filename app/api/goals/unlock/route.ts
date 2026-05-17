import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Goal } from '@/lib/types';

export async function POST(req: Request) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { employeeId } = await req.json();
  const db = readDb();
  
  db.goals = db.goals.map(g => {
    if (g.employeeId === employeeId && !g.isShared) {
      return { 
        ...g, 
        isLocked: false, 
        status: g.status === 'APPROVED' ? 'RETURNED' : g.status,
        managerComment: 'Admin unlocked goal sheet for realignment.'
      } as Goal;
    }
    return g;
  });

  db.auditLogs.push({
    id: `log-${Date.now()}`,
    userId: session.id,
    userName: session.name,
    changeType: 'SYSTEM_UNLOCK',
    oldValue: 'APPROVED/LOCKED',
    newValue: 'RETURNED/UNLOCKED',
    changedAt: new Date().toISOString()
  });

  writeDb(db);
  return NextResponse.json({ success: true });
}

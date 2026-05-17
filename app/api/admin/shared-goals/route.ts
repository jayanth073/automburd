import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import type { Goal } from '@/lib/types';

export async function POST(req: Request) {
  const session = getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { thrustArea, title, description, uomType, target, weightage, targetEmployeeIds } = body;
  
  if (!thrustArea || !title || !target || !weightage) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  
  const db = readDb();
  const activeCycle = db.goalCycles.find(c => c.isActive);
  if (!activeCycle) {
    return NextResponse.json({ error: 'No active goal cycle' }, { status: 400 });
  }

  let recipients = db.users.filter(u => u.role === 'EMPLOYEE');
  
  if (session.role === 'ADMIN') {
    if (targetEmployeeIds) {
      recipients = db.users.filter(u => targetEmployeeIds.includes(u.id));
    }
  } else {
    const myReports = db.users.filter(u => u.managerId === session.id);
    recipients = targetEmployeeIds
      ? myReports.filter(u => targetEmployeeIds.includes(u.id))
      : myReports;
  }

  if (recipients.length === 0) {
    return NextResponse.json({ error: 'No recipients found' }, { status: 400 });
  }

  const parentGoalId = `sg${Date.now()}`;

  recipients.forEach(emp => {
    const sharedGoal: Goal = {
      id: `sg-${Date.now()}-${emp.id}`,
      employeeId: emp.id,
      cycleId: activeCycle.id,
      thrustArea,
      title,
      description: description || '',
      uomType: uomType || 'NUMERIC_MIN',
      target,
      weightage: parseFloat(weightage) || 10,
      status: 'APPROVED',
      isLocked: true,
      isShared: true,
      sharedFromId: parentGoalId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    db.goals.push(sharedGoal);
  });

  db.auditLogs.push({
    id: `log-${Date.now()}`,
    userId: session.id,
    userName: session.name,
    changeType: 'BROADCAST_KPI',
    oldValue: '',
    newValue: `Pushed shared goal: ${title} to ${recipients.length} employees.`,
    changedAt: new Date().toISOString()
  });

  writeDb(db);
  return NextResponse.json({ success: true, count: recipients.length });
}

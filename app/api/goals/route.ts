import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { isWindowOpen } from '@/lib/cycleGuard';
import type { Goal } from '@/lib/types';

export async function GET(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const employeeId = searchParams.get('employeeId');

  const db = readDb();
  let goals = db.goals;

  if (session.role === 'EMPLOYEE') {
    goals = goals.filter(g => g.employeeId === session.id);
  } else if (session.role === 'MANAGER') {
    const directReportIds = db.users.filter(u => u.managerId === session.id).map(u => u.id);
    
    if (employeeId) {
      if (!directReportIds.includes(employeeId) && employeeId !== session.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      goals = goals.filter(g => g.employeeId === employeeId);
    } else {
      goals = goals.filter(g => directReportIds.includes(g.employeeId) || g.employeeId === session.id);
    }
  } else if (session.role === 'ADMIN' && employeeId) {
    goals = goals.filter(g => g.employeeId === employeeId);
  }

  return NextResponse.json(goals);
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session || session.role !== 'EMPLOYEE') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const db = readDb();

  if (!body.thrustArea || !body.title || !body.target || !body.weightage) {
    return NextResponse.json({ error: 'Missing required fields: thrustArea, title, target, weightage' }, { status: 400 });
  }

  const activeCycle = db.goalCycles.find(c => c.isActive);
  if (!activeCycle) {
    return NextResponse.json({ error: 'No active goal cycle' }, { status: 400 });
  }

  if (!isWindowOpen(activeCycle.id)) {
    return NextResponse.json({ error: 'Goal creation window is closed' }, { status: 400 });
  }

  const existingGoals = db.goals.filter(g => 
    g.employeeId === session.id && g.cycleId === activeCycle.id && !g.isShared
  );

  if (existingGoals.length >= 8) {
    return NextResponse.json({ error: 'Maximum 8 goals allowed per employee' }, { status: 400 });
  }

  const weightage = parseFloat(body.weightage);
  if (weightage < 10) {
    return NextResponse.json({ error: 'Minimum weightage per goal is 10%' }, { status: 400 });
  }

  const totalWeightage = existingGoals.reduce((sum, g) => sum + g.weightage, 0) + weightage;
  if (totalWeightage > 100) {
    return NextResponse.json({ error: `Total weightage would be ${totalWeightage}%. Cannot exceed 100%.` }, { status: 400 });
  }

  const newGoal: Goal = {
    id: `g${Date.now()}`,
    employeeId: session.id,
    cycleId: activeCycle.id,
    thrustArea: body.thrustArea,
    title: body.title,
    description: body.description || '',
    uomType: body.uomType || 'NUMERIC_MIN',
    target: body.target,
    weightage,
    status: 'DRAFT',
    isLocked: false,
    isShared: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.goals.push(newGoal);
  writeDb(db);

  return NextResponse.json(newGoal);
}

export async function PUT(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const db = readDb();
  
  const goalIndex = db.goals.findIndex(g => g.id === body.id);
  if (goalIndex === -1) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  
  const goal = db.goals[goalIndex];
  
  const isOwner = goal.employeeId === session.id;
  const isManager = db.users.some(u => u.id === goal.employeeId && u.managerId === session.id);
  const isAdmin = session.role === 'ADMIN';

  if (!isOwner && !isManager && !isAdmin) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  if (goal.isShared && session.role !== 'ADMIN') {
    if (!isOwner || body.weightage === undefined || !Object.keys(body).every(k => k === 'id' || k === 'weightage')) {
      return NextResponse.json({ error: 'Shared goals can only adjust weightage' }, { status: 400 });
    }
  } else if (goal.isLocked && session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Goal is locked' }, { status: 400 });
  }

  if (body.weightage !== undefined) {
    const w = parseFloat(body.weightage);
    if (w < 10 || w > 100) {
      return NextResponse.json({ error: 'Weightage must be between 10% and 100%' }, { status: 400 });
    }
  }

  if (goal.isLocked) {
    const fieldsToLog = ['target', 'weightage', 'title', 'description'] as const;
    fieldsToLog.forEach(field => {
      if (body[field] !== undefined && body[field] !== goal[field]) {
        db.auditLogs.push({
          id: `log-${Date.now()}-${field}`,
          goalId: goal.id,
          userId: session.id,
          userName: session.name,
          goalTitle: goal.title,
          changeType: 'FIELD_EDIT',
          fieldName: field,
          oldValue: String(goal[field]),
          newValue: String(body[field]),
          changedAt: new Date().toISOString()
        });
      }
    });
  }

  const allowedFields: Record<string, unknown> = {};
  const safeFields = goal.isShared && session.role !== 'ADMIN' ? ['weightage'] : ['thrustArea', 'title', 'description', 'target', 'weightage', 'uomType'];
  safeFields.forEach(f => {
    if (body[f] !== undefined) allowedFields[f] = body[f];
  });

  db.goals[goalIndex] = {
    ...goal,
    ...allowedFields,
    id: goal.id,
    employeeId: goal.employeeId,
    cycleId: goal.cycleId,
    isShared: goal.isShared,
    sharedFromId: goal.sharedFromId,
    status: goal.status === 'RETURNED' ? 'DRAFT' : goal.status,
    updatedAt: new Date().toISOString()
  } as Goal;

  writeDb(db);
  return NextResponse.json(db.goals[goalIndex]);
}

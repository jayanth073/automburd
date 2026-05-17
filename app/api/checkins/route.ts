import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { notifyManagerOnCheckin } from '@/lib/notifications';
import { computeScore } from '@/lib/scoreEngine';
import { isCheckinWindowOpen } from '@/lib/cycleGuard';
import { SCORE_CAP, VALID_PROGRESS_STATUSES } from '@/lib/constants';
import type { CheckIn, Quarter } from '@/lib/types';

export async function GET(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = readDb();
  
  if (session.role === 'EMPLOYEE') {
    const myGoalIds = new Set(
      db.goals.filter(g => g.employeeId === session.id).map(g => g.id)
    );
    return NextResponse.json(db.checkIns.filter(ci => myGoalIds.has(ci.goalId)));
  }

  return NextResponse.json(db.checkIns);
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { goalId, actualAchievement, quarter, progressStatus } = body;

  if (!goalId || !quarter) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (!isCheckinWindowOpen(quarter)) {
    return NextResponse.json({ error: `Check-in window for ${quarter} is not currently open` }, { status: 400 });
  }

  if (progressStatus && !VALID_PROGRESS_STATUSES.includes(progressStatus)) {
    return NextResponse.json({ error: 'Invalid progress status' }, { status: 400 });
  }

  const db = readDb();
  const goal = db.goals.find(g => g.id === goalId);
  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });

  if (goal.status !== 'APPROVED') {
    return NextResponse.json({ error: 'Can only check in on approved goals' }, { status: 400 });
  }

  if (goal.employeeId !== session.id) {
    return NextResponse.json({ error: 'Cannot check in on goals you do not own' }, { status: 403 });
  }

  const score = computeScore(goal.uomType, goal.target, actualAchievement);
  const cappedScore = Math.min(score, SCORE_CAP);

  const checkIn: CheckIn = {
    id: `ci-${Date.now()}`,
    goalId,
    employeeId: goal.employeeId,
    quarter: quarter as Quarter,
    actualAchievement,
    progressStatus: progressStatus || 'ON_TRACK',
    computedScore: cappedScore,
    createdAt: new Date().toISOString()
  };

  const existingIdx = db.checkIns.findIndex(ci => ci.goalId === goalId && ci.quarter === quarter);
  if (existingIdx > -1) {
    db.checkIns[existingIdx] = { ...db.checkIns[existingIdx], ...checkIn, createdAt: db.checkIns[existingIdx].createdAt };
  } else {
    db.checkIns.push(checkIn);
  }

  if (!goal.isShared) {
    const relatedGoals = db.goals.filter(g => g.sharedFromId === goal.id);
    relatedGoals.forEach(rg => {
      const sharedCheckIn: CheckIn = { ...checkIn, id: `ci-sync-${Date.now()}-${rg.employeeId}`, goalId: rg.id, employeeId: rg.employeeId };
      const sIdx = db.checkIns.findIndex(ci => ci.goalId === rg.id && ci.quarter === quarter);
      if (sIdx > -1) db.checkIns[sIdx] = sharedCheckIn;
      else db.checkIns.push(sharedCheckIn);
    });
  }

  writeDb(db);

  notifyManagerOnCheckin(session.id, quarter);

  return NextResponse.json(checkIn);
}

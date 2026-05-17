import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getEscalationRules, getAllEscalations, checkAndTriggerEscalations, resolveEscalation, escalateToNextLevel, updateEscalationRule } from '@/lib/escalations';

export async function GET(req: Request) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');

  if (type === 'rules') {
    return NextResponse.json(getEscalationRules());
  }

  return NextResponse.json(getAllEscalations());
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { action, escalationId, ruleId, updates } = body;

  if (action === 'trigger') {
    const newEscalations = checkAndTriggerEscalations();
    return NextResponse.json({ success: true, count: newEscalations.length });
  }

  if (action === 'resolve') {
    const success = resolveEscalation(escalationId);
    return NextResponse.json({ success });
  }

  if (action === 'escalate') {
    const success = escalateToNextLevel(escalationId);
    return NextResponse.json({ success });
  }

  if (action === 'updateRule') {
    const updated = updateEscalationRule(ruleId, updates);
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
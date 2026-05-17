import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = readDb();
  const cycleIndex = db.goalCycles.findIndex(c => c.id === params.id);
  
  if (cycleIndex === -1) return NextResponse.json({ error: 'Cycle not found' }, { status: 404 });

  const newState = !db.goalCycles[cycleIndex].isActive;
  
  if (newState) {
    db.goalCycles.forEach(c => { c.isActive = false; });
  }
  
  db.goalCycles[cycleIndex].isActive = newState;
  writeDb(db);

  return NextResponse.json({ success: true });
}

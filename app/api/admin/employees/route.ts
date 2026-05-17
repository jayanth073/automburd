import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(_req: Request) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = readDb();
  const employees = db.users.filter(u => u.role === 'EMPLOYEE');
  
  return NextResponse.json(employees.map(e => ({
    id: e.id,
    name: e.name,
    email: e.email
  })));
}

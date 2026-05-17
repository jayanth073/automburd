import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = readDb();
  
  if (params.id === session.id) {
    return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
  }

  const userIndex = db.users.findIndex(u => u.id === params.id);
  if (userIndex === -1) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Cascading update: set managerId to undefined for direct reports
  db.users.forEach(u => {
    if (u.managerId === params.id) {
      u.managerId = undefined;
    }
  });

  db.users.splice(userIndex, 1);
  writeDb(db);

  return NextResponse.json({ success: true });
}

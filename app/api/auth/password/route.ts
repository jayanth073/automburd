import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import crypto from 'crypto';

export async function POST(req: Request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { currentPassword, newPassword } = await req.json();

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (newPassword.length < 6) {
      return NextResponse.json({ error: 'New password must be at least 6 characters long' }, { status: 400 });
    }

    const db = readDb();
    const userIndex = db.users.findIndex(u => u.id === session.id);
    
    if (userIndex === -1) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = db.users[userIndex];

    const currentHashed = crypto.createHash('sha256').update(currentPassword.trim()).digest('hex');
    if (user.password !== currentHashed) {
      return NextResponse.json({ error: 'Incorrect current password' }, { status: 400 });
    }

    const newHashed = crypto.createHash('sha256').update(newPassword.trim()).digest('hex');
    db.users[userIndex].password = newHashed;
    
    writeDb(db);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal server error', details: error?.message }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { readDb, writeDb } from '@/lib/db';
import { getSession } from '@/lib/auth';
import crypto from 'crypto';

export async function GET(_req: Request) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = readDb();
  
  // Return users without passwords
  const users = db.users.map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    managerId: u.managerId
  }));

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const { name, email, role, managerId } = body;

  if (!name || !email || !role) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const db = readDb();
  
  if (db.users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
    return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
  }

  const newId = `u${Date.now()}`;
  const hashedPassword = crypto.createHash('sha256').update('password123').digest('hex');

  const newUser: any = {
    id: newId,
    name,
    email,
    password: hashedPassword,
    role,
    managerId: managerId || undefined
  };

  db.users.push(newUser);
  writeDb(db);

  const { password, ...safeUser } = newUser;
  return NextResponse.json(safeUser);
}

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getAllAnalytics } from '@/lib/analytics';

export async function GET(_req: Request) {
  const session = getSession();
  if (!session || (session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const analytics = getAllAnalytics();
  return NextResponse.json(analytics);
}
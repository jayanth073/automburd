import { NextResponse } from 'next/server';
import { readDb } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function GET(req: Request) {
  const session = getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = readDb();
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type');
  const limit = parseInt(searchParams.get('limit') || '50');

  const notifications = db.notifications || { emails: [], teams: [] };
  const emails = notifications.emails || [];
  const teams = notifications.teams || [];

  if (type === 'emails') {
    return NextResponse.json({ emails: emails.slice(0, limit) });
  }
  if (type === 'teams') {
    return NextResponse.json({ teams: teams.slice(0, limit) });
  }

  return NextResponse.json({
    emails: emails.slice(0, limit),
    teams: teams.slice(0, limit),
    summary: {
      totalEmails: emails.length,
      totalTeams: teams.length,
      recentEmails: emails.slice(-5).map(e => ({
        type: e.type,
        to: e.to,
        subject: e.subject,
        sentAt: e.sentAt
      })),
      recentTeams: teams.slice(-5).map(t => ({
        channel: t.channel,
        message: t.message.substring(0, 50),
        sentAt: t.sentAt
      }))
    }
  });
}
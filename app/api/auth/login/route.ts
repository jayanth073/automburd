import crypto from 'crypto';
import { readDb } from '@/lib/db';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();
    const db = readDb();
    
    const safeEmail = (email || '').trim().toLowerCase();
    const safePassword = (password || '').trim();
    
    const hashedPassword = crypto.createHash('sha256').update(safePassword).digest('hex');
    
    const user = db.users.find(u => u.email.toLowerCase() === safeEmail && u.password === hashedPassword);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    
    const payload = JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role });
    const payloadBase64 = Buffer.from(payload).toString('base64');
    const secret = process.env.SESSION_SECRET || 'dev-secret-fixed-for-testing';
    const signature = crypto.createHmac('sha256', secret).update(payloadBase64).digest('base64');
    const sessionValue = `${payloadBase64}.${signature}`;
    
    return new Response(JSON.stringify({ success: true, role: user.role }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': `session=${sessionValue}; Path=/; Max-Age=28800; SameSite=Lax`,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error', details: error?.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

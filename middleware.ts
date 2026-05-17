import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

async function verifySessionSignature(sessionValue: string): Promise<any | null> {
  try {
    const secret = process.env.SESSION_SECRET || 'dev-secret-fixed-for-testing';

    const [payloadBase64, signature] = sessionValue.split('.');
    if (!payloadBase64 || !signature) return null;

    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const key = await crypto.subtle.importKey(
      'raw', keyData, { name: 'HMAC', hash: 'SHA-256' },
      false, ['verify']
    );

    const sigBuffer = Uint8Array.from(atob(signature), c => c.charCodeAt(0));
    const dataBuffer = encoder.encode(payloadBase64);

    const valid = await crypto.subtle.verify('HMAC', key, sigBuffer, dataBuffer);
    if (!valid) return null;

    return JSON.parse(atob(payloadBase64));
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session');
  const { pathname } = request.nextUrl;

  if (pathname === '/login' || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  if (!session) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const userData = await verifySessionSignature(session.value);
  if (!userData) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin') && userData.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }
  
  if (pathname.startsWith('/manager') && userData.role !== 'MANAGER' && userData.role !== 'ADMIN') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

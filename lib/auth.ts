import { cookies } from 'next/headers';
import crypto from 'crypto';

function getSessionSecret(): string {
  return process.env.SESSION_SECRET || 'dev-secret-fixed-for-testing';
}

function sign(payload: string) {
  return crypto.createHmac('sha256', getSessionSecret()).update(payload).digest('base64');
}

export function getSession() {
  const sessionCookie = cookies().get('session');
  if (!sessionCookie) return null;
  
  try {
    const [payloadBase64, signature] = sessionCookie.value.split('.');
    const expectedSignature = sign(payloadBase64);
    
    if (signature !== expectedSignature) {
      console.error('Invalid session signature');
      return null;
    }
    
    const userData = JSON.parse(Buffer.from(payloadBase64, 'base64').toString());
    return userData;
  } catch (e) {
    return null;
  }
}

import { SESSION_MAX_AGE_SECONDS } from './constants';
import type { User } from './types';

export function setSession(user: User) {
  const payload = JSON.stringify({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  });
  
  const payloadBase64 = Buffer.from(payload).toString('base64');
  const signature = sign(payloadBase64);
  const sessionValue = `${payloadBase64}.${signature}`;
  
  cookies().set('session', sessionValue, {
    path: '/',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE_SECONDS
  });
}

export function clearSession() {
  cookies().delete('session');
}

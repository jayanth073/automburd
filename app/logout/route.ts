import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const response = NextResponse.redirect(new URL('/login', req.url));
  response.headers.set('Set-Cookie', 'session=; Path=/; Max-Age=0');
  return response;
}

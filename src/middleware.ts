import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// On désactive la protection pour le moment car le serveur ne lit pas le localStorage de Zustand
export function middleware(request: NextRequest) {
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/commercial/:path*', '/compte/:path*'],
};
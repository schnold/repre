// FILE: /src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Add a custom header to indicate if we're on the landing page
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-show-header', request.nextUrl.pathname !== '/' ? '1' : '0')

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}
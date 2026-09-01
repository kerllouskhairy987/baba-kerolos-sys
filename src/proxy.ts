import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export const SESSION_COOKIE_NAME = 'session_token';

// Public routes that do not require a session
const PUBLIC_AUTH_ROUTES = ['/login', '/forgot-password'];
const RESET_FLOW_ROUTES = ['/verify', '/reset-password'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const hasSession = Boolean(sessionToken && sessionToken.trim() !== '');

  // 1. Homepage / is always publicly accessible for all users and search engines
  if (pathname === '/') {
    return NextResponse.next();
  }

  const isPublicAuthRoute = PUBLIC_AUTH_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );
  const isResetFlowRoute = RESET_FLOW_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  // 2. If user is authenticated and tries to access /login or /forgot-password -> redirect to home /
  if (hasSession && isPublicAuthRoute) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 3. If route is a public auth route or password reset flow route -> allow access
  if (isPublicAuthRoute || isResetFlowRoute) {
    return NextResponse.next();
  }

  // 4. Protected Routes: If user does not have a session cookie -> redirect to /login
  if (!hasSession) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     * - Static asset extensions (.png, .jpg, .jpeg, .gif, .svg, .webp, .css, .js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.(?:png|jpg|jpeg|gif|svg|webp|css|js)$).*)',
  ],
};

export default proxy;

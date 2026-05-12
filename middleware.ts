import { NextResponse } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
  locales: ['en', 'mn', 'de'],
  defaultLocale: 'mn',
  localePrefix: 'always',
});

const isProtectedRoute = createRouteMatcher([
  '/:locale/admin(.*)',
  '/:locale/dashboard(.*)',
  '/:locale/apply(.*)',
  '/:locale/student-information(.*)',
  '/:locale/submit-documents(.*)',
  '/:locale/prompt-dashboard(.*)',
  '/admin(.*)',
  '/dashboard(.*)',
  '/apply(.*)',
  '/student-information(.*)',
  '/submit-documents(.*)',
  '/prompt-dashboard(.*)',
  '/api/user(.*)',
  '/api/admin(.*)',
]);

const STATIC_PATHS = new Set([
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
  '/manifest.json',
  '/image.png',
]);

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  // Skip entirely for static assets
  if (STATIC_PATHS.has(pathname)) return;

  // Authenticate the request — this populates the auth context for route handlers
  const authObj = await auth();
  const { userId, redirectToSignIn } = authObj;

  // Redirect unauthenticated users away from protected routes
  if (isProtectedRoute(req) && !userId) {
    return redirectToSignIn({ returnBackUrl: req.url });
  }

  // API routes: auth context is now set, skip i18n and pass through
  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  // Pages: run i18n middleware
  return intlMiddleware(req);
});

export const config = {
  matcher: [
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt|json)).*)',
    '/(api|trpc)(.*)',
  ],
};

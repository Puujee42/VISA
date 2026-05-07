import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'mn', 'de'],
    defaultLocale: 'mn',
    localePrefix: 'always'
});

const isProtectedRoute = createRouteMatcher([
    '/:locale/admin(.*)',
    '/:locale/dashboard(.*)',
    '/:locale/apply(.*)',
    '/:locale/student-information(.*)',
    '/:locale/submit-documents(.*)',
    '/admin(.*)',
    '/dashboard(.*)',
    '/apply(.*)',
    '/student-information(.*)',
    '/submit-documents(.*)',
    '/api/user(.*)',
    '/api/admin(.*)'
]);

// 1. Mark the function as 'async'
export default clerkMiddleware(async (auth, req) => {
    const { pathname } = req.nextUrl;
    console.log('[Middleware] Processing URL:', req.url);

    // 2. Skip middleware entirely for SEO/static files
    if (
        pathname === '/robots.txt' ||
        pathname === '/sitemap.xml' ||
        pathname === '/favicon.ico' ||
        pathname === '/manifest.json' ||
        pathname === '/image.png'
    ) {
        return;
    }

    // 3. Await the auth() call to get the actual data
    const authObj = await auth();
    const userId = authObj.userId;
    const redirectToSignIn = authObj.redirectToSignIn;

    // 4. Protect Private Routes explicitly
    // If the route IS protected AND the user is NOT logged in
    if (isProtectedRoute(req) && !userId) {
        console.log('[Middleware] Protected route accessed without user, redirecting');
        return redirectToSignIn({ returnBackUrl: req.url });
    }

    // 5. Run i18n Middleware (skip for API routes)
    if (pathname.startsWith('/api')) {
        console.log('[Middleware] API route detected, skipping intlMiddleware');
        return; // Pass through to Next.js handler
    }

    console.log('[Middleware] Delegating to intlMiddleware');
    const response = intlMiddleware(req);
    console.log('[Middleware] intlMiddleware response status:', response.status);
    return response;
});

export const config = {
    matcher: [
        '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
        '/(api|trpc)(.*)',
    ],
};

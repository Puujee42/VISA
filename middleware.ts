import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import createMiddleware from 'next-intl/middleware';

const intlMiddleware = createMiddleware({
    locales: ['en', 'mn', 'de'],
    defaultLocale: 'mn',
    localePrefix: 'always'
});

const isPublicRoute = createRouteMatcher([
    '/',
    '/:locale(|/)',           // Matches /en, /mn, /de and /en/, /mn/, /de/
    '/:locale/sign-in(.*)',
    '/:locale/sign-up(.*)',
    '/:locale/join',
    '/:locale/about',
    '/:locale/aupair(.*)',
    '/:locale/lessons(.*)',
    '/:locale/events(.*)',
    '/:locale/news(.*)',
    '/:locale/contact',
    '/:locale/booking',
    '/:locale/shop(.*)',
    '/sign-in(.*)',
    '/sign-up(.*)',
    '/api/events(.*)',
    '/api/news(.*)',
    '/api/livekit(.*)',
    '/api/shopping(.*)'
]);

// 1. Mark the function as 'async'
export default clerkMiddleware(async (auth, req) => {
    console.log('[Middleware] Processing URL:', req.url);

    // 2. Await the auth() call to get the actual data
    const authObj = await auth();
    const userId = authObj.userId;
    const redirectToSignIn = authObj.redirectToSignIn;

    // 3. Protect Private Routes manually
    // If the route is NOT public AND the user is NOT logged in
    if (!isPublicRoute(req) && !userId) {
        console.log('[Middleware] Protected route accessed without user, redirecting');
        return redirectToSignIn({ returnBackUrl: req.url });
    }

    // 4. Run i18n Middleware
    if (req.nextUrl.pathname.startsWith('/api')) {
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

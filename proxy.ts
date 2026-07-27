import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { createClient } from "@/utils/supabase/middleware";

const intlMiddleware = createMiddleware({
  locales: ["en", "mn", "de"],
  defaultLocale: "mn",
  localePrefix: "always",
});

const STATIC_PATHS = new Set([
  "/robots.txt",
  "/sitemap.xml",
  "/favicon.ico",
  "/manifest.json",
  "/image.png",
]);

const PROTECTED_SUFFIXES = [
  "/dashboard",
  "/admin",
  "/student-information",
  "/submit-documents",
  "/prompt-dashboard",
];

function securityHeaders(response: NextResponse) {
  response.headers.set("X-DNS-Prefetch-Control", "on");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  return response;
}

function isProtectedPath(pathname: string) {
  return PROTECTED_SUFFIXES.some(
    (suffix) =>
      pathname === suffix ||
      pathname.endsWith(suffix) ||
      pathname.includes(`${suffix}/`),
  );
}

function localeFromPath(pathname: string) {
  const match = pathname.match(/^\/(en|mn|de)(?:\/|$)/);
  return match?.[1] || "mn";
}

function copyCookies(from: NextResponse, to: NextResponse) {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (STATIC_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  let user = null as { id: string } | null;
  let supabaseResponse: NextResponse | null = null;

  // Local auth fallback cookie
  try {
    const { LOCAL_SESSION_COOKIE, verifyLocalSession } = await import(
      "@/lib/localAuth"
    );
    const local = verifyLocalSession(
      request.cookies.get(LOCAL_SESSION_COOKIE)?.value,
    );
    if (local) user = { id: local.id };
  } catch {
    /* ignore */
  }

  try {
    const hasSupabase =
      !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
      !!(
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      );

    if (hasSupabase && !user) {
      const client = createClient(request);
      supabaseResponse = client.response;
      const { data } = await client.supabase.auth.getUser();
      user = data.user;
    } else if (hasSupabase && user) {
      // Still refresh supabase cookies if present, but don't block on failure
      try {
        const client = createClient(request);
        supabaseResponse = client.response;
        await client.supabase.auth.getUser();
      } catch {
        /* ignore */
      }
    }
  } catch (error) {
    console.error("[proxy] Supabase auth refresh failed:", error);
  }

  if (pathname.startsWith("/api")) {
    const apiResponse = securityHeaders(NextResponse.next());
    if (supabaseResponse) copyCookies(supabaseResponse, apiResponse);
    return apiResponse;
  }

  if (isProtectedPath(pathname) && !user) {
    const locale = localeFromPath(pathname);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}/sign-in`;
    url.searchParams.set("redirect", pathname);
    const redirect = NextResponse.redirect(url);
    if (supabaseResponse) copyCookies(supabaseResponse, redirect);
    return securityHeaders(redirect);
  }

  const intlResponse = intlMiddleware(request);
  if (intlResponse) {
    if (supabaseResponse) copyCookies(supabaseResponse, intlResponse);
    return securityHeaders(intlResponse);
  }

  return securityHeaders(supabaseResponse || NextResponse.next());
}

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|xml|txt|json)).*)",
    "/(api|trpc)(.*)",
  ],
};

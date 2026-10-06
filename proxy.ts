import { NextResponse, type NextRequest } from "next/server";

// The one account allowed into the admin console.
const ADMIN_EMAIL = "siafakonneh@gmail.com";
const USER_EMAIL_HEADER = "oai-authenticated-user-email";
const SIGN_IN_PATH = "/signin-with-chatgpt";

/**
 * proxy.ts is Next.js 16's replacement for middleware.ts.
 *
 * Path-based detection + first line of defense for the admin console.
 *
 * Public paths (/, /locations, /pricing, /contact, ...) pass straight through
 * and render the marketing site. Any /admin/* path is gated here:
 *   - anonymous visitor            -> redirected to ChatGPT sign-in
 *   - signed-in, non-admin visitor -> sent back to the public site
 *   - the admin                    -> allowed through
 *
 * The admin layout (requireAdmin) repeats this check server-side, so this
 * middleware is a fast redirect layer, not the only safeguard.
 */
export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // Only guard the admin surface.
  if (pathname !== "/admin" && !pathname.startsWith("/admin/")) {
    return NextResponse.next();
  }

  const email = request.headers.get(USER_EMAIL_HEADER);

  // Not signed in -> bounce to sign-in, returning to the requested admin path.
  if (!email) {
    const returnTo = `${pathname}${search || ""}`;
    const url = request.nextUrl.clone();
    url.pathname = SIGN_IN_PATH;
    url.search = `?return_to=${encodeURIComponent(returnTo)}`;
    return NextResponse.redirect(url);
  }

  // Signed in but not the admin -> back to the public homepage.
  if (email.trim().toLowerCase() !== ADMIN_EMAIL) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};

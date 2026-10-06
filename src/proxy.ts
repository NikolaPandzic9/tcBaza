import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const intlMiddleware = createMiddleware(routing);

/** erp.tcbaza.ba in production, erp.localhost:3000 in development. */
function isErpHost(host: string | null): boolean {
  if (!host) return false;
  const hostname = host.split(":")[0].toLowerCase();
  const configured = process.env.ERP_HOST?.split(":")[0].toLowerCase();
  return configured ? hostname === configured : hostname.startsWith("erp.");
}

/**
 * One deployment, two sites. Requests to the ERP subdomain are rewritten
 * into the app's /erp tree (the URL bar keeps clean paths like /termini);
 * everything else goes through next-intl's locale routing. The /erp tree
 * is unreachable from the public domain.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (isErpHost(request.headers.get("host"))) {
    const url = request.nextUrl.clone();
    if (pathname === "/erp" || pathname.startsWith("/erp/")) {
      url.pathname = pathname.slice(4) || "/";
      return NextResponse.redirect(url);
    }
    url.pathname = pathname === "/" ? "/erp" : `/erp${pathname}`;
    const response = NextResponse.rewrite(url);
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
    return response;
  }

  if (pathname === "/erp" || pathname.startsWith("/erp/")) {
    return new NextResponse("Not found", { status: 404 });
  }

  return intlMiddleware(request);
}

export const config = {
  // Skip API routes, uploaded media, static files and Next internals.
  matcher: ["/((?!api|media|_next|_vercel|.*\\..*).*)"],
};

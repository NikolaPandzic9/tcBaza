import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  // Skip the Sanity Studio, API routes, static files and Next internals —
  // the studio is an admin tool and is intentionally not localized.
  matcher: ["/((?!api|studio|_next|_vercel|.*\\..*).*)"],
};

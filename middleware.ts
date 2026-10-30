import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { isUnacceptable, prefersMarkdown } from "./lib/agents/accept";
import {
  MARKDOWN_PATH_HEADER,
  renderNotAcceptableMarkdown,
} from "./lib/agents/site-content";

const intlMiddleware = createMiddleware(routing);

function appendVaryAccept(headers: Headers): void {
  const existing = headers.get("Vary");
  if (!existing) {
    headers.set("Vary", "Accept, Accept-Encoding");
    return;
  }
  const parts = existing.split(",").map((part) => part.trim());
  if (parts.some((part) => part.toLowerCase() === "accept")) return;
  headers.set("Vary", [...parts, "Accept"].join(", "));
}

function isFrameworkRequest(request: NextRequest): boolean {
  return (
    request.headers.has("RSC") ||
    request.headers.has("Next-Router-Prefetch") ||
    request.headers.has("Next-Router-State-Tree")
  );
}

export default function middleware(request: NextRequest) {
  const accept = request.headers.get("accept");
  const negotiable =
    (request.method === "GET" || request.method === "HEAD") &&
    !isFrameworkRequest(request);

  if (negotiable && prefersMarkdown(accept)) {
    const url = request.nextUrl.clone();
    url.pathname = "/api/md";
    url.search = `?path=${encodeURIComponent(request.nextUrl.pathname)}`;
    const headers = new Headers(request.headers);
    headers.set(MARKDOWN_PATH_HEADER, request.nextUrl.pathname);
    return NextResponse.rewrite(url, { request: { headers } });
  }

  if (negotiable && isUnacceptable(accept)) {
    return new NextResponse(renderNotAcceptableMarkdown(accept ?? ""), {
      status: 406,
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        Vary: "Accept, Accept-Encoding",
      },
    });
  }

  const response = intlMiddleware(request);
  appendVaryAccept(response.headers);
  response.headers.set(
    "Link",
    `<${request.nextUrl.pathname}>; rel="alternate"; type="text/markdown"`,
  );
  return response;
}

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|r2-assets|svc|guides|llms\\.txt|llms-full\\.txt|openapi\\.json|robots\\.txt|sitemap\\.xml|.*\\..*).*)",
  ],
};

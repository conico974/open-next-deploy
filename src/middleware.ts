import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

declare global {
  var __CURRENT_REGION: string | undefined;
}

export function middleware(req: NextRequest) {
  globalThis.__CURRENT_REGION = req.headers.get("x-region") ?? undefined;
  if (req.nextUrl.pathname.startsWith("/dashboard") && req.method === "GET") {
    // Fake check for authentication
    if (req.cookies.get("token")?.value !== "admin") {
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }
  return NextResponse.next();
}

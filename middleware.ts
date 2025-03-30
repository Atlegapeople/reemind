// File: middleware.ts

import { type NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const loggedIn = req.cookies.get("reemind_user")?.value;

  // Protect only the /dashboard route
  if (req.nextUrl.pathname.startsWith("/dashboard") && !loggedIn) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard"],
};

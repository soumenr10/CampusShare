import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const publicPaths = [
  "/api/auth",
  "/api/items",
  "/api/notes",
  "/api/reviews",
  "/api/users",
];

const adminPaths = ["/api/admin"];

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip non-API routes and public GET endpoints
  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // Auth routes are always public
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // Public GET routes
  const isPublicGet =
    req.method === "GET" &&
    publicPaths.some((p) => pathname.startsWith(p));
  if (isPublicGet) {
    return NextResponse.next();
  }

  // All other API routes require authentication
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!token) {
    // For POST/PUT/DELETE, we must block. For GET, the individual routes handle it.
    if (req.method !== "GET") {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }
  }


  // Admin routes require ADMIN role
  if (adminPaths.some((p) => pathname.startsWith(p))) {
    if (token.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "Admin access required" },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/:path*"],
};

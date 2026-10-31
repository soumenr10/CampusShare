import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "./auth";
import type { SessionUser, ApiResponse } from "@/types";

/**
 * Get the current authenticated user from the session.
 * Returns null if not authenticated.
 */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return null;
  }
  return session.user as SessionUser;
}

/**
 * Require authentication. Returns the user or a 401 JSON response.
 * Usage:
 *   const authResult = await requireAuth();
 *   if (authResult instanceof NextResponse) return authResult;
 *   const user = authResult;
 */
export async function requireAuth(): Promise<SessionUser | NextResponse> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { success: false, error: "Authentication required. Please sign in again." } satisfies ApiResponse,
      { status: 401 }
    );
  }
  return user;
}

/**
 * Require admin role. Returns the admin user or a 401/403 JSON response.
 */
export async function requireAdmin(): Promise<SessionUser | NextResponse> {
  const result = await requireAuth();
  if (result instanceof NextResponse) return result;

  if (result.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, error: "Admin access required" } satisfies ApiResponse,
      { status: 403 }
    );
  }
  return result;
}

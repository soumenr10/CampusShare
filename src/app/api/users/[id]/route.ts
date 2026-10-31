import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { profileUpdateSchema } from "@/lib/validations";
import type { ApiResponse, UserProfile } from "@/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, email: true, name: true, collegeName: true, department: true,
        graduationYear: true, hostel: true, avatarUrl: true, bio: true,
        contactPreference: true, phone: true, rating: true, reviewCount: true,
        isVerified: true, role: true, createdAt: true, updatedAt: true,
        items: { orderBy: { createdAt: "desc" }, take: 20 },
        notes: { orderBy: { createdAt: "desc" }, take: 20 },
        reviewsReceived: {
          include: {
            reviewer: {
              select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
            },
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: user } satisfies ApiResponse<UserProfile>);
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const currentUser = authResult;

    if (currentUser.id !== id) {
      return NextResponse.json(
        { success: false, error: "You can only update your own profile" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = profileUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const updated = await prisma.user.update({
      where: { id },
      data: parsed.data,
      select: {
        id: true, email: true, name: true, collegeName: true, department: true,
        graduationYear: true, hostel: true, avatarUrl: true, bio: true,
        contactPreference: true, rating: true, reviewCount: true,
        isVerified: true, role: true, createdAt: true, updatedAt: true,
      },
    });

    return NextResponse.json({ success: true, data: updated } satisfies ApiResponse);
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

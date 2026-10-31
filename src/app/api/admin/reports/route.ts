import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import type { ApiResponse, PaginatedResponse, ReportWithDetails } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    const where = status ? { status: status as "PENDING" | "REVIEWED" | "RESOLVED" | "DISMISSED" } : {};

    const reports = await prisma.report.findMany({
      where,
      include: {
        reporter: {
          select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
        },
        item: true,
        note: true,
        reportedUser: {
          select: {
            id: true, email: true, name: true, collegeName: true, department: true,
            avatarUrl: true, rating: true, reviewCount: true, isVerified: true,
            role: true, createdAt: true, updatedAt: true, graduationYear: true,
            hostel: true, bio: true, contactPreference: true, phone: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: reports,
      pagination: { page: 1, limit: reports.length, total: reports.length, totalPages: 1 },
    } satisfies PaginatedResponse<ReportWithDetails>);
  } catch (error) {
    console.error("Error fetching reports:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

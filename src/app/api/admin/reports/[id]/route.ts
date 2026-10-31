import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import type { ApiResponse } from "@/types";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await requireAdmin();
    if (authResult instanceof NextResponse) return authResult;

    const body = await req.json();
    const { status } = body;

    if (!["PENDING", "REVIEWED", "RESOLVED", "DISMISSED"].includes(status)) {
      return NextResponse.json(
        { success: false, error: "Invalid status value" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const report = await prisma.report.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({ success: true, data: report } satisfies ApiResponse);
  } catch (error) {
    console.error("Error updating report:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

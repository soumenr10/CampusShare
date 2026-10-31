import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { itemUpdateSchema } from "@/lib/validations";
import type { ApiResponse, ItemWithSeller } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;

    const item = await prisma.item.findUnique({
      where: { id },
      include: {
        seller: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            rating: true,
            reviewCount: true,
            collegeName: true,
            department: true,
            contactPreference: true,
            phone: true,
            bio: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json(
        { success: false, error: "Item not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: item } satisfies ApiResponse);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const { id } = await params;

    // Verify ownership
    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    if (existingItem.sellerId !== user.id) {
      return NextResponse.json(
        { success: false, error: "You can only update your own items" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    const body = await req.json();
    const parsed = itemUpdateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(", "),
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const updatedItem = await prisma.item.update({
      where: { id },
      data: parsed.data,
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: updatedItem } satisfies ApiResponse<ItemWithSeller>
    );
  } catch (error) {
    console.error("Error updating item:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const { id } = await params;

    const existingItem = await prisma.item.findUnique({ where: { id } });
    if (!existingItem) {
      return NextResponse.json(
        { success: false, error: "Item not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // Owner or admin can delete
    if (existingItem.sellerId !== user.id && user.role !== "ADMIN") {
      return NextResponse.json(
        { success: false, error: "You do not have permission to delete this item" } satisfies ApiResponse,
        { status: 403 }
      );
    }

    await prisma.item.delete({ where: { id } });

    return NextResponse.json(
      { success: true, data: { message: "Item deleted successfully" } } satisfies ApiResponse
    );
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

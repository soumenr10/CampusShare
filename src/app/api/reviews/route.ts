import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { reviewSchema } from "@/lib/validations";
import type { ApiResponse, PaginatedResponse, ReviewWithReviewer } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sellerId = searchParams.get("sellerId");

    if (!sellerId) {
      return NextResponse.json(
        { success: false, error: "sellerId query parameter is required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const reviews = await prisma.review.findMany({
      where: { sellerId },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
        },
        item: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: reviews,
      pagination: { page: 1, limit: reviews.length, total: reviews.length, totalPages: 1 },
    } satisfies PaginatedResponse<ReviewWithReviewer>);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const body = await req.json();
    const parsed = reviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues.map((i) => i.message).join(", ") } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { sellerId, itemId, rating, comment } = parsed.data;

    if (user.id === sellerId) {
      return NextResponse.json(
        { success: false, error: "You cannot review yourself" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const item = await prisma.item.findUnique({ where: { id: itemId } });
    if (!item || item.status !== "SOLD") {
      return NextResponse.json(
        { success: false, error: "Item must be marked as sold before reviewing" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const existingReview = await prisma.review.findUnique({
      where: { reviewerId_itemId: { reviewerId: user.id, itemId } },
    });
    if (existingReview) {
      return NextResponse.json(
        { success: false, error: "You have already reviewed this item" } satisfies ApiResponse,
        { status: 409 }
      );
    }

    const review = await prisma.review.create({
      data: { reviewerId: user.id, sellerId, itemId, rating, comment },
      include: {
        reviewer: {
          select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
        },
      },
    });

    // Update seller average rating
    const agg = await prisma.review.aggregate({
      where: { sellerId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.user.update({
      where: { id: sellerId },
      data: {
        rating: agg._avg.rating ?? 0,
        reviewCount: agg._count.rating,
      },
    });

    return NextResponse.json(
      { success: true, data: review } satisfies ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating review:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

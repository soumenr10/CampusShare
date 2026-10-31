import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { itemSchema } from "@/lib/validations";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "@/lib/constants";
import type { ApiResponse, PaginatedResponse, ItemWithSeller } from "@/types";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10))
    );
    const skip = (page - 1) * limit;

    // Build filters
    const where: Prisma.ItemWhereInput = {};

    const category = searchParams.get("category");
    if (category) {
      where.category = category as Prisma.EnumCategoryFilter["equals"];
    }

    const condition = searchParams.get("condition");
    if (condition) {
      where.condition = condition as Prisma.EnumItemConditionFilter["equals"];
    }

    const status = searchParams.get("status");
    if (status) {
      where.status = status as Prisma.EnumItemStatusFilter["equals"];
    } else {
      where.status = "AVAILABLE";
    }

    const sellerId = searchParams.get("sellerId");
    if (sellerId && sellerId !== "me") {
      where.sellerId = sellerId;
    }

    const priceMin = searchParams.get("priceMin");
    if (priceMin) {
      where.price = { ...((where.price as Prisma.FloatFilter) || {}), gte: parseFloat(priceMin) };
    }

    const priceMax = searchParams.get("priceMax");
    if (priceMax) {
      where.price = { ...((where.price as Prisma.FloatFilter) || {}), lte: parseFloat(priceMax) };
    }

    const search = searchParams.get("search");
    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const [items, total] = await Promise.all([
      prisma.item.findMany({
        where,
        include: {
          seller: {
            select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.item.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: items,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    } satisfies PaginatedResponse<ItemWithSeller>);
  } catch (error) {
    console.error("Error fetching items:", error);
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
    const parsed = itemSchema.safeParse(body);
    if (!parsed.success) {
      console.log("Validation errors:", JSON.stringify(parsed.error?.format(), null, 2));
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((issue) => issue.message).join(", ") || "Validation failed",
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const item = await prisma.item.create({
      data: {
        ...parsed.data,
        sellerId: user.id,
      },
      include: {
        seller: {
          select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
        },
      },
    });

    return NextResponse.json(
      { success: true, data: item } satisfies ApiResponse<ItemWithSeller>,
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating item:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

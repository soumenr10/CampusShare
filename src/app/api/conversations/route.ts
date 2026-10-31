import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import type { ApiResponse, ConversationListItem } from "@/types";

export async function GET(_req: NextRequest) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user.id },
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({
      success: true,
      data: conversations,
    } satisfies ApiResponse<ConversationListItem[]>);
  } catch (error) {
    console.error("Error fetching conversations:", error);
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
    const { participantId } = body;

    if (!participantId || typeof participantId !== "string") {
      return NextResponse.json(
        { success: false, error: "participantId is required" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    if (participantId === user.id) {
      return NextResponse.json(
        { success: false, error: "Cannot start a conversation with yourself" } satisfies ApiResponse,
        { status: 400 }
      );
    }

    // Verify participant exists
    const participant = await prisma.user.findUnique({
      where: { id: participantId },
    });

    if (!participant) {
      return NextResponse.json(
        { success: false, error: "User not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    // Check if a conversation between these two users already exists
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user.id } } },
          { participants: { some: { userId: participantId } } },
        ],
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    if (existingConversation) {
      return NextResponse.json({
        success: true,
        data: existingConversation,
      } satisfies ApiResponse);
    }

    // Create a new conversation with both participants
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: user.id },
            { userId: participantId },
          ],
        },
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatarUrl: true, rating: true, reviewCount: true },
            },
          },
        },
        messages: true,
      },
    });

    return NextResponse.json(
      { success: true, data: conversation } satisfies ApiResponse,
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating conversation:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

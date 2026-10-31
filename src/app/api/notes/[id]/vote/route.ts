import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAuth } from "@/lib/auth-helpers";
import { voteSchema } from "@/lib/validations";
import type { ApiResponse } from "@/types";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await requireAuth();
    if (authResult instanceof NextResponse) return authResult;
    const user = authResult;

    const { id: noteId } = await params;

    // Verify note exists
    const note = await prisma.note.findUnique({ where: { id: noteId } });
    if (!note) {
      return NextResponse.json(
        { success: false, error: "Note not found" } satisfies ApiResponse,
        { status: 404 }
      );
    }

    const body = await req.json();
    const parsed = voteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues.map((i) => i.message).join(", "),
        } satisfies ApiResponse,
        { status: 400 }
      );
    }

    const { voteType } = parsed.data;

    // Check for existing vote
    const existingVote = await prisma.noteVote.findUnique({
      where: { noteId_userId: { noteId, userId: user.id } },
    });

    let upvoteDelta = 0;
    let downvoteDelta = 0;
    let action: "voted" | "toggled" | "switched";

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Same vote — toggle off (remove)
        await prisma.noteVote.delete({
          where: { id: existingVote.id },
        });

        if (voteType === "UP") upvoteDelta = -1;
        else downvoteDelta = -1;
        action = "toggled";
      } else {
        // Opposite vote — switch
        await prisma.noteVote.update({
          where: { id: existingVote.id },
          data: { voteType },
        });

        if (voteType === "UP") {
          upvoteDelta = 1;
          downvoteDelta = -1;
        } else {
          upvoteDelta = -1;
          downvoteDelta = 1;
        }
        action = "switched";
      }
    } else {
      // New vote
      await prisma.noteVote.create({
        data: { noteId, userId: user.id, voteType },
      });

      if (voteType === "UP") upvoteDelta = 1;
      else downvoteDelta = 1;
      action = "voted";
    }

    // Update note vote counts
    const updatedNote = await prisma.note.update({
      where: { id: noteId },
      data: {
        upvotes: { increment: upvoteDelta },
        downvotes: { increment: downvoteDelta },
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        action,
        upvotes: updatedNote.upvotes,
        downvotes: updatedNote.downvotes,
      },
    } satisfies ApiResponse);
  } catch (error) {
    console.error("Error voting on note:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" } satisfies ApiResponse,
      { status: 500 }
    );
  }
}

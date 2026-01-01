import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string; commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emoji } = await req.json();

    if (!emoji) {
      return NextResponse.json({ error: "Emoji is required" }, { status: 400 });
    }

    // Check if user already reacted with this emoji
    const existing = await prisma.commentReaction.findFirst({
      where: {
        commentId: params.commentId,
        userId: session.user.id!,
        emoji,
      },
    });

    if (existing) {
      // Remove reaction (toggle off)
      await prisma.commentReaction.delete({
        where: { id: existing.id },
      });
      return NextResponse.json({ removed: true });
    } else {
      // Add reaction
      const reaction = await prisma.commentReaction.create({
        data: {
          commentId: params.commentId,
          userId: session.user.id!,
          emoji,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      });
      return NextResponse.json(reaction);
    }
  } catch (error) {
    console.error("Error toggling reaction:", error);
    return NextResponse.json(
      { error: "Failed to toggle reaction" },
      { status: 500 }
    );
  }
}

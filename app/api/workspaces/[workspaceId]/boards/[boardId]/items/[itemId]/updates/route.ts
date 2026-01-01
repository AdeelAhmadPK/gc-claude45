import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const updates = await prisma.update.findMany({
      where: {
        itemId: params.itemId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(updates);
  } catch (error) {
    console.error("Error fetching updates:", error);
    return NextResponse.json({ error: "Failed to fetch updates" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { content } = await req.json();

    const update = await prisma.update.create({
      data: {
        content,
        itemId: params.itemId,
        userId: user.id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        action: "comment",
        entityType: "item",
        entityId: params.itemId,
        itemId: params.itemId,
        userId: user.id,
        metadata: { content: "added an update" },
      },
    });

    return NextResponse.json(update);
  } catch (error) {
    console.error("Error creating update:", error);
    return NextResponse.json({ error: "Failed to create update" }, { status: 500 });
  }
}

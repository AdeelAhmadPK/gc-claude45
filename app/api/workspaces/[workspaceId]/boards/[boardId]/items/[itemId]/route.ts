import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const updateItemSchema = z.object({
  name: z.string().min(1).max(500).optional(),
  description: z.string().optional(),
  groupId: z.string().optional(),
  position: z.number().int().min(0).optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = params;

    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        columnValues: {
          include: {
            column: true,
          },
        },
        _count: {
          select: {
            subitems: true,
            comments: true,
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    return NextResponse.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = params;
    const body = await req.json();
    const data = updateItemSchema.parse(body);

    // Update item
    const item = await prisma.item.update({
      where: { id: itemId },
      data,
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        columnValues: true,
        _count: {
          select: {
            subitems: true,
            comments: true,
          },
        },
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        itemId: item.id,
        userId: session.user.id,
        action: "ITEM_UPDATED",
        entityType: "ITEM",
        entityId: item.id,
        metadata: data,
      },
    });

    return NextResponse.json(item);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error updating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itemId } = params;

    // Soft delete by archiving
    await prisma.item.update({
      where: { id: itemId },
      data: { isArchived: true },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        itemId,
        userId: session.user.id,
        action: "ITEM_DELETED",
        entityType: "ITEM",
        entityId: itemId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

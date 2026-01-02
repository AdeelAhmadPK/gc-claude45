import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET subitems for an item
export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string; boardId: string; itemId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subitems = await prisma.item.findMany({
      where: {
        parentId: params.itemId,
        boardId: params.boardId,
      },
      include: {
        columnValues: {
          include: {
            column: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(subitems);
  } catch (error) {
    console.error("Error fetching subitems:", error);
    return NextResponse.json(
      { error: "Failed to fetch subitems" },
      { status: 500 }
    );
  }
}

// POST create a new subitem
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

    const body = await req.json();
    const { name } = body;

    // Get the parent item to use its group
    const parentItem = await prisma.item.findUnique({
      where: { id: params.itemId },
      select: { groupId: true },
    });

    if (!parentItem) {
      return NextResponse.json({ error: "Parent item not found" }, { status: 404 });
    }

    // Get the max position for subitems
    const maxPosition = await prisma.item.aggregate({
      where: {
        parentId: params.itemId,
      },
      _max: {
        position: true,
      },
    });

    const newPosition = (maxPosition._max.position || 0) + 1;

    const subitem = await prisma.item.create({
      data: {
        name,
        boardId: params.boardId,
        groupId: parentItem.groupId,
        parentId: params.itemId,
        position: newPosition,
        creatorId: user.id,
      },
      include: {
        columnValues: {
          include: {
            column: true,
          },
        },
      },
    });

    // Create activity log
    await prisma.activityLog.create({
      data: {
        action: "subitem_created",
        entityType: "item",
        entityId: subitem.id,
        itemId: params.itemId,
        userId: user.id,
        workspaceId: params.workspaceId,
        metadata: {
          subitemName: name,
          parentItemId: params.itemId,
        },
      },
    });

    return NextResponse.json(subitem, { status: 201 });
  } catch (error) {
    console.error("Error creating subitem:", error);
    return NextResponse.json(
      { error: "Failed to create subitem" },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const itemSchema = z.object({
  name: z.string().min(1).max(500),
  groupId: z.string(),
  description: z.string().optional(),
  parentId: z.string().optional(),
});

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string; boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { boardId } = params;
    const body = await req.json();
    const { name, groupId, description, parentId } = itemSchema.parse(body);

    // Get next position in group
    const lastItem = await prisma.item.findFirst({
      where: { groupId, parentId: parentId || null },
      orderBy: { position: "desc" },
    });

    const position = (lastItem?.position ?? -1) + 1;

    // Create item
    const item = await prisma.item.create({
      data: {
        name,
        description,
        boardId,
        groupId,
        parentId,
        position,
        creatorId: session.user.id,
      },
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
        action: "ITEM_CREATED",
        entityType: "ITEM",
        entityId: item.id,
        metadata: { name: item.name },
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error creating item:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string; boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { boardId } = params;

    const items = await prisma.item.findMany({
      where: {
        boardId,
        isArchived: false,
      },
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
        assignments: {
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
        },
        _count: {
          select: {
            subitems: true,
            comments: true,
          },
        },
      },
      orderBy: [{ groupId: "asc" }, { position: "asc" }],
    });

    return NextResponse.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

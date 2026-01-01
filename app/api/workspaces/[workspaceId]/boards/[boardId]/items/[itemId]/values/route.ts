import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const columnValueSchema = z.object({
  columnId: z.string(),
  value: z.any(),
});

export async function POST(
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
    const { columnId, value } = columnValueSchema.parse(body);

    // Upsert column value
    const columnValue = await prisma.columnValue.upsert({
      where: {
        itemId_columnId: {
          itemId,
          columnId,
        },
      },
      update: {
        value,
      },
      create: {
        itemId,
        columnId,
        value,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        itemId,
        userId: session.user.id,
        action: "COLUMN_VALUE_UPDATED",
        entityType: "COLUMN_VALUE",
        entityId: columnValue.id,
        metadata: { columnId, value },
      },
    });

    return NextResponse.json(columnValue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error updating column value:", error);
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
    const { columnId, value } = columnValueSchema.parse(body);

    // Upsert column value
    const columnValue = await prisma.columnValue.upsert({
      where: {
        itemId_columnId: {
          itemId,
          columnId,
        },
      },
      update: {
        value,
      },
      create: {
        itemId,
        columnId,
        value,
      },
    });

    // Log activity
    await prisma.activityLog.create({
      data: {
        itemId,
        userId: session.user.id,
        action: "COLUMN_VALUE_UPDATED",
        entityType: "COLUMN_VALUE",
        entityId: columnValue.id,
        metadata: { columnId, value },
      },
    });

    return NextResponse.json(columnValue);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error updating column value:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

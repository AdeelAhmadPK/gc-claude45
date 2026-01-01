import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { workspaceId: string; boardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, items, groups } = await req.json();

    if (type === "items") {
      // Reorder items within a group
      const updates = items.map((item: { id: string; position: number; groupId: string }) =>
        prisma.item.update({
          where: { id: item.id },
          data: {
            position: item.position,
            groupId: item.groupId,
          },
        })
      );

      await prisma.$transaction(updates);

      // Log activity
      await prisma.activityLog.create({
        data: {
          action: "REORDER",
          entityType: "ITEM",
          entityId: params.boardId,
          userId: session.user.id!,
          workspaceId: params.workspaceId,
          metadata: { items },
        },
      });

      return NextResponse.json({ success: true });
    }

    if (type === "groups") {
      // Reorder groups
      const updates = groups.map((group: { id: string; position: number }) =>
        prisma.group.update({
          where: { id: group.id },
          data: { position: group.position },
        })
      );

      await prisma.$transaction(updates);

      // Log activity
      await prisma.activityLog.create({
        data: {
          action: "REORDER",
          entityType: "GROUP",
          entityId: params.boardId,
          userId: session.user.id!,
          workspaceId: params.workspaceId,
          metadata: { groups },
        },
      });

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error) {
    console.error("Reorder error:", error);
    return NextResponse.json(
      { error: "Failed to reorder items" },
      { status: 500 }
    );
  }
}

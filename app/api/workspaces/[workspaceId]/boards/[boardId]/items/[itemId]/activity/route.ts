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

    const activities = await prisma.activityLog.findMany({
      where: {
        itemId: params.itemId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Map to the expected format
    const formattedActivities = activities.map(activity => ({
      id: activity.id,
      type: activity.action,
      description: activity.metadata ? JSON.stringify(activity.metadata) : activity.action,
      createdAt: activity.createdAt.toISOString(),
      user: activity.user,
      metadata: activity.metadata,
    }));

    return NextResponse.json(formattedActivities);
  } catch (error) {
    console.error("Error fetching activities:", error);
    return NextResponse.json({ error: "Failed to fetch activities" }, { status: 500 });
  }
}

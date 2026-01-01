import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dashboards = await prisma.dashboard.findMany({
      where: {
        workspaceId: params.workspaceId,
      },
      include: {
        widgets: {
          orderBy: {
            position: "asc",
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(dashboards);
  } catch (error) {
    console.error("Error fetching dashboards:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboards" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, description, layout } = await req.json();

    const dashboard = await prisma.dashboard.create({
      data: {
        name,
        description,
        workspaceId: params.workspaceId,
        creatorId: session.user.id!,
        layout: layout || {},
      },
      include: {
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(dashboard, { status: 201 });
  } catch (error) {
    console.error("Error creating dashboard:", error);
    return NextResponse.json(
      { error: "Failed to create dashboard" },
      { status: 500 }
    );
  }
}

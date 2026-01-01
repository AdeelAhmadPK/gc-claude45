import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(
  req: NextRequest,
  { params }: { params: { workspaceId: string; dashboardId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, title, config, position } = await req.json();

    const widget = await prisma.widget.create({
      data: {
        dashboardId: params.dashboardId,
        type,
        title,
        config: config || {},
        position: position || 0,
      },
    });

    return NextResponse.json(widget, { status: 201 });
  } catch (error) {
    console.error("Error creating widget:", error);
    return NextResponse.json(
      { error: "Failed to create widget" },
      { status: 500 }
    );
  }
}

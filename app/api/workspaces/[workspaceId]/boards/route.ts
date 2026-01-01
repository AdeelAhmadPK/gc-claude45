import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const boardSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  folderId: z.string().optional(),
});

export async function GET(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = params;

    // Check if user has access to workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const boards = await prisma.board.findMany({
      where: {
        workspaceId,
      },
      include: {
        folder: true,
        _count: {
          select: {
            items: true,
            columns: true,
          },
        },
      },
      orderBy: {
        position: "asc",
      },
    });

    return NextResponse.json(boards);
  } catch (error) {
    console.error("Error fetching boards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { workspaceId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceId } = params;

    // Check if user has access to workspace
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: session.user.id,
        },
      },
    });

    if (!member || (member.role !== "OWNER" && member.role !== "ADMIN" && member.role !== "MEMBER")) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, description, folderId } = boardSchema.parse(body);

    // Get next position
    const lastBoard = await prisma.board.findFirst({
      where: { workspaceId },
      orderBy: { position: "desc" },
    });

    const position = (lastBoard?.position ?? 0) + 1;

    // Create board with default columns
    const board = await prisma.board.create({
      data: {
        name,
        description,
        workspaceId,
        folderId,
        position,
        columns: {
          create: [
            { title: "Status", type: "STATUS", position: 0, settings: { labels: ["Not Started", "In Progress", "Done"] } },
            { title: "People", type: "PEOPLE", position: 1 },
            { title: "Due Date", type: "DUE_DATE", position: 2 },
            { title: "Priority", type: "STATUS", position: 3, settings: { labels: ["Low", "Medium", "High", "Critical"] } },
          ],
        },
        groups: {
          create: {
            title: "Group 1",
            position: 0,
          },
        },
      },
      include: {
        columns: true,
        groups: true,
      },
    });

    return NextResponse.json(board, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }

    console.error("Error creating board:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

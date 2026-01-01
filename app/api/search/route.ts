import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const query = searchParams.get("q");
    const type = searchParams.get("type"); // "items", "boards", "comments", "all"

    if (!query || query.trim().length < 2) {
      return NextResponse.json({ error: "Query must be at least 2 characters" }, { status: 400 });
    }

    const results: any = {
      items: [],
      boards: [],
      comments: [],
    };

    // Get user's workspaces
    const workspaces = await prisma.workspaceMember.findMany({
      where: {
        userId: session.user.id!,
      },
      select: {
        workspaceId: true,
      },
    });

    const workspaceIds = workspaces.map(w => w.workspaceId);

    if (workspaceIds.length === 0) {
      return NextResponse.json(results);
    }

    // Search items
    if (!type || type === "items" || type === "all") {
      results.items = await prisma.item.findMany({
        where: {
          board: {
            workspaceId: {
              in: workspaceIds,
            },
          },
          isArchived: false,
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          board: {
            select: {
              id: true,
              name: true,
              workspaceId: true,
            },
          },
          group: {
            select: {
              id: true,
              title: true,
            },
          },
        },
        take: 20,
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    // Search boards
    if (!type || type === "boards" || type === "all") {
      results.boards = await prisma.board.findMany({
        where: {
          workspaceId: {
            in: workspaceIds,
          },
          OR: [
            {
              name: {
                contains: query,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: query,
                mode: "insensitive",
              },
            },
          ],
        },
        include: {
          workspace: {
            select: {
              id: true,
              name: true,
            },
          },
          _count: {
            select: {
              items: true,
            },
          },
        },
        take: 10,
        orderBy: {
          updatedAt: "desc",
        },
      });
    }

    // Search comments
    if (!type || type === "comments" || type === "all") {
      results.comments = await prisma.comment.findMany({
        where: {
          item: {
            board: {
              workspaceId: {
                in: workspaceIds,
              },
            },
          },
          text: {
            contains: query,
            mode: "insensitive",
          },
        },
        include: {
          item: {
            select: {
              id: true,
              name: true,
              board: {
                select: {
                  id: true,
                  name: true,
                  workspaceId: true,
                },
              },
            },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
        take: 10,
        orderBy: {
          createdAt: "desc",
        },
      });
    }

    return NextResponse.json(results);
  } catch (error) {
    console.error("Error searching:", error);
    return NextResponse.json(
      { error: "Search failed" },
      { status: 500 }
    );
  }
}

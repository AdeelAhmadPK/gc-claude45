"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, FolderKanban, Users, Settings } from "lucide-react";
import Link from "next/link";

interface Board {
  id: string;
  name: string;
  description?: string;
  _count: {
    items: number;
    columns: number;
  };
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.workspaceId as string;
  
  const [boards, setBoards] = useState<Board[]>([]);
  const [workspace, setWorkspace] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWorkspaceData();
  }, [workspaceId]);

  const fetchWorkspaceData = async () => {
    try {
      // Fetch workspace details
      const workspaceRes = await fetch(`/api/workspaces`);
      if (workspaceRes.ok) {
        const workspaces = await workspaceRes.json();
        const currentWorkspace = workspaces.find((w: any) => w.id === workspaceId);
        setWorkspace(currentWorkspace);
      }

      // Fetch boards
      const boardsRes = await fetch(`/api/workspaces/${workspaceId}/boards`);
      if (boardsRes.ok) {
        const data = await boardsRes.json();
        setBoards(data);
      }
    } catch (error) {
      console.error("Error fetching workspace data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const createBoard = async () => {
    const boardName = prompt("Enter board name:");
    if (!boardName) return;

    try {
      const response = await fetch(`/api/workspaces/${workspaceId}/boards`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: boardName }),
      });

      if (response.ok) {
        const newBoard = await response.json();
        router.push(`/dashboard/workspaces/${workspaceId}/boards/${newBoard.id}`);
      }
    } catch (error) {
      console.error("Error creating board:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      {/* Workspace Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {workspace?.name || "Workspace"}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {boards.length} boards • {workspace?._count?.members || 0} members
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Users className="h-4 w-4 mr-2" />
            Invite Members
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Boards Section */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Boards
          </h2>
          <Button onClick={createBoard}>
            <Plus className="h-4 w-4 mr-2" />
            New Board
          </Button>
        </div>

        {boards.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="space-y-4">
              <FolderKanban className="h-12 w-12 text-gray-400 mx-auto" />
              <div>
                <h3 className="text-lg font-semibold">No boards yet</h3>
                <p className="text-gray-600 dark:text-gray-400 mt-2">
                  Create your first board to start organizing your work
                </p>
              </div>
              <Button onClick={createBoard}>
                <Plus className="h-4 w-4 mr-2" />
                Create Board
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <Link
                key={board.id}
                href={`/dashboard/workspaces/${workspaceId}/boards/${board.id}`}
              >
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FolderKanban className="h-5 w-5 mr-2 text-blue-600" />
                      {board.name}
                    </CardTitle>
                    {board.description && (
                      <CardDescription>{board.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {board._count.items} items • {board._count.columns} columns
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Templates</CardTitle>
              <CardDescription>
                Start from pre-built templates
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Import</CardTitle>
              <CardDescription>
                Import from Excel or CSV
              </CardDescription>
            </CardHeader>
          </Card>
          
          <Card className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
            <CardHeader>
              <CardTitle className="text-lg">Integrations</CardTitle>
              <CardDescription>
                Connect your tools
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  );
}

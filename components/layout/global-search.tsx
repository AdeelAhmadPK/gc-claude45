"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Search, X, FileText, MessageSquare, LayoutDashboard } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";

interface SearchResult {
  items: any[];
  boards: any[];
  comments: any[];
}

export function GlobalSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult>({ items: [], boards: [], comments: [] });
  const [isLoading, setIsLoading] = useState(false);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen(true);
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  useEffect(() => {
    if (debouncedQuery.trim().length >= 2) {
      performSearch(debouncedQuery);
    } else {
      setResults({ items: [], boards: [], comments: [] });
    }
  }, [debouncedQuery]);

  const performSearch = async (searchQuery: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&type=all`);
      if (response.ok) {
        const data = await response.json();
        setResults(data);
      }
    } catch (error) {
      console.error("Search error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const navigateToItem = (item: any) => {
    router.push(`/dashboard/workspaces/${item.board.workspaceId}/boards/${item.board.id}?item=${item.id}`);
    setIsOpen(false);
    setQuery("");
  };

  const navigateToBoard = (board: any) => {
    router.push(`/dashboard/workspaces/${board.workspace.id}/boards/${board.id}`);
    setIsOpen(false);
    setQuery("");
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
      >
        <Search className="h-4 w-4 text-gray-500" />
        <span className="text-sm text-gray-600 dark:text-gray-400">Search...</span>
        <kbd className="hidden sm:inline-block px-2 py-1 text-xs font-semibold text-gray-800 bg-gray-100 border border-gray-200 rounded dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600">
          ⌘K
        </kbd>
      </button>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40"
        onClick={() => setIsOpen(false)}
      />

      {/* Search Modal */}
      <div className="fixed inset-x-0 top-20 z-50 mx-auto max-w-2xl px-4">
        <Card className="p-4">
          {/* Search Input */}
          <div className="flex items-center gap-2 mb-4">
            <Search className="h-5 w-5 text-gray-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items, boards, and comments..."
              className="border-0 focus-visible:ring-0 text-lg"
              autoFocus
            />
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <>
                {/* Boards */}
                {results.boards.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Boards
                    </h3>
                    <div className="space-y-1">
                      {results.boards.map(board => (
                        <button
                          key={board.id}
                          onClick={() => navigateToBoard(board)}
                          className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <LayoutDashboard className="h-4 w-4 text-blue-500" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{board.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {board.workspace.name} • {board._count.items} items
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Items */}
                {results.items.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Items
                    </h3>
                    <div className="space-y-1">
                      {results.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => navigateToItem(item)}
                          className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <FileText className="h-4 w-4 text-green-500" />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{item.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.board.name} • {item.group.title}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Comments */}
                {results.comments.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase mb-2">
                      Comments
                    </h3>
                    <div className="space-y-1">
                      {results.comments.map(comment => (
                        <button
                          key={comment.id}
                          onClick={() => navigateToItem(comment.item)}
                          className="w-full flex items-center gap-3 p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                        >
                          <MessageSquare className="h-4 w-4 text-purple-500" />
                          <div className="flex-1 min-w-0">
                            <div className="text-sm truncate">{comment.text}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {comment.item.name} • by {comment.user.name || comment.user.email}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* No Results */}
                {query.trim().length >= 2 &&
                  !isLoading &&
                  results.items.length === 0 &&
                  results.boards.length === 0 &&
                  results.comments.length === 0 && (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <p>No results found for "{query}"</p>
                    </div>
                  )}

                {/* Empty State */}
                {query.trim().length < 2 && (
                  <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                    <p className="text-sm">Type to search across boards, items, and comments</p>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

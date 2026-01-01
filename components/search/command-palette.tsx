"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search,
  FileText,
  FolderKanban,
  MessageSquare,
  Paperclip,
  Users,
  Settings,
  Calendar,
  Clock,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface SearchResult {
  id: string;
  type: "item" | "board" | "comment" | "file" | "workspace";
  title: string;
  subtitle?: string;
  boardId?: string;
  workspaceId?: string;
  itemId?: string;
  date?: string;
  priority?: string;
}

interface CommandPaletteProps {
  workspaceId?: string;
}

export function CommandPalette({ workspaceId }: CommandPaletteProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Keyboard shortcut to open command palette
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  // Load recent searches from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("recentSearches");
    if (saved) {
      setRecentSearches(JSON.parse(saved));
    }
  }, []);

  // Search function
  useEffect(() => {
    const search = async () => {
      if (!query || query.length < 2) {
        setResults([]);
        return;
      }

      setLoading(true);
      try {
        const params = new URLSearchParams({
          q: query,
          ...(workspaceId && { workspaceId }),
        });

        const response = await fetch(`/api/search?${params}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setLoading(false);
      }
    };

    const debounce = setTimeout(search, 300);
    return () => clearTimeout(debounce);
  }, [query, workspaceId]);

  const handleSelect = (result: SearchResult) => {
    // Add to recent searches
    const newRecent = [query, ...recentSearches.filter((s) => s !== query)].slice(0, 5);
    setRecentSearches(newRecent);
    localStorage.setItem("recentSearches", JSON.stringify(newRecent));

    // Navigate to result
    if (result.type === "item" && result.workspaceId && result.boardId) {
      router.push(
        `/dashboard/workspaces/${result.workspaceId}/boards/${result.boardId}?itemId=${result.id}`
      );
    } else if (result.type === "board" && result.workspaceId) {
      router.push(`/dashboard/workspaces/${result.workspaceId}/boards/${result.id}`);
    } else if (result.type === "workspace") {
      router.push(`/dashboard/workspaces/${result.id}`);
    }

    setOpen(false);
    setQuery("");
  };

  const getResultIcon = (type: string) => {
    switch (type) {
      case "item":
        return <FileText className="w-4 h-4 mr-2 text-blue-600" />;
      case "board":
        return <FolderKanban className="w-4 h-4 mr-2 text-purple-600" />;
      case "comment":
        return <MessageSquare className="w-4 h-4 mr-2 text-green-600" />;
      case "file":
        return <Paperclip className="w-4 h-4 mr-2 text-orange-600" />;
      case "workspace":
        return <Users className="w-4 h-4 mr-2 text-indigo-600" />;
      default:
        return <Search className="w-4 h-4 mr-2 text-gray-600" />;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    if (!priority || priority === "NONE") return null;

    const colors = {
      URGENT: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
      HIGH: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
      MEDIUM: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
      LOW: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
    };

    return (
      <Badge variant="outline" className={colors[priority as keyof typeof colors]}>
        {priority}
      </Badge>
    );
  };

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    const type = result.type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(result);
    return acc;
  }, {} as Record<string, SearchResult[]>);

  const typeLabels = {
    item: "Items",
    board: "Boards",
    comment: "Comments",
    file: "Files",
    workspace: "Workspaces",
  };

  return (
    <>
      {/* Search button trigger */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 rounded-md hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      >
        <Search className="w-4 h-4" />
        <span className="hidden sm:inline">Search...</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs font-mono bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded">
          <span>⌘</span>
          <span>K</span>
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          placeholder="Search items, boards, comments, files..."
          value={query}
          onValueChange={setQuery}
        />
        <CommandList>
          {!query && recentSearches.length > 0 && (
            <>
              <CommandGroup heading="Recent Searches">
                {recentSearches.map((search, idx) => (
                  <CommandItem
                    key={idx}
                    onSelect={() => setQuery(search)}
                  >
                    <Clock className="w-4 h-4 mr-2 text-gray-400" />
                    {search}
                  </CommandItem>
                ))}
              </CommandGroup>
              <CommandSeparator />
            </>
          )}

          {!query && (
            <CommandGroup heading="Quick Actions">
              <CommandItem
                onSelect={() => {
                  if (workspaceId) {
                    router.push(`/dashboard/workspaces/${workspaceId}?action=new-board`);
                    setOpen(false);
                  }
                }}
              >
                <FolderKanban className="w-4 h-4 mr-2 text-purple-600" />
                Create new board
              </CommandItem>
              <CommandItem
                onSelect={() => {
                  router.push("/dashboard/settings");
                  setOpen(false);
                }}
              >
                <Settings className="w-4 h-4 mr-2 text-gray-600" />
                Settings
              </CommandItem>
            </CommandGroup>
          )}

          {loading && (
            <CommandEmpty>
              <div className="flex items-center justify-center py-6">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
              </div>
            </CommandEmpty>
          )}

          {!loading && query && results.length === 0 && (
            <CommandEmpty>No results found for "{query}"</CommandEmpty>
          )}

          {!loading &&
            Object.entries(groupedResults).map(([type, typeResults]) => (
              <React.Fragment key={type}>
                <CommandGroup heading={typeLabels[type as keyof typeof typeLabels]}>
                  {typeResults.map((result) => (
                    <CommandItem
                      key={result.id}
                      onSelect={() => handleSelect(result)}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center flex-1 min-w-0">
                        {getResultIcon(result.type)}
                        <div className="flex flex-col min-w-0">
                          <span className="truncate">{result.title}</span>
                          {result.subtitle && (
                            <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                              {result.subtitle}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        {getPriorityBadge(result.priority)}
                        {result.date && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {format(new Date(result.date), "MMM d")}
                          </span>
                        )}
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                <CommandSeparator />
              </React.Fragment>
            ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}

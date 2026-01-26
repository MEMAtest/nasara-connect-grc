"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2, FileText, Users, BookOpen, Boxes, ClipboardList, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  type: "assessment" | "policy" | "person" | "case_study" | "module" | "register";
  title: string;
  description: string;
  url: string;
  relevance: number;
  metadata?: Record<string, unknown>;
}

const typeIcons: Record<SearchResult["type"], React.ReactNode> = {
  assessment: <FileText className="h-4 w-4 text-blue-500" />,
  policy: <FileText className="h-4 w-4 text-purple-500" />,
  person: <Users className="h-4 w-4 text-teal-500" />,
  case_study: <BookOpen className="h-4 w-4 text-amber-500" />,
  module: <Boxes className="h-4 w-4 text-slate-500" />,
  register: <ClipboardList className="h-4 w-4 text-emerald-500" />,
};

const typeLabels: Record<SearchResult["type"], string> = {
  assessment: "Assessment",
  policy: "Policy",
  person: "Person",
  case_study: "Case Study",
  module: "Module",
  register: "Register",
};

export function GlobalSearch() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const groupedResults = useMemo(() => {
    const typeOrder: SearchResult["type"][] = [
      "module",
      "policy",
      "register",
      "assessment",
      "person",
      "case_study",
    ];
    const buckets = new Map<SearchResult["type"], Array<{ result: SearchResult; index: number }>>();

    results.forEach((result, index) => {
      const existing = buckets.get(result.type);
      if (existing) {
        existing.push({ result, index });
      } else {
        buckets.set(result.type, [{ result, index }]);
      }
    });

    return typeOrder
      .map((type) => {
        const items = buckets.get(type);
        if (!items?.length) return null;
        return { type, items };
      })
      .filter(Boolean) as Array<{ type: SearchResult["type"]; items: Array<{ result: SearchResult; index: number }> }>;
  }, [results]);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
        if (response.ok) {
          const data = await response.json();
          setResults(data.results || []);
          setSelectedIndex(0);
        }
      } catch (error) {
        console.error("Search failed:", error);
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!isOpen || results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            router.push(results[selectedIndex].url);
            setIsOpen(false);
            setQuery("");
          }
          break;
        case "Escape":
          setIsOpen(false);
          break;
      }
    },
    [isOpen, results, selectedIndex, router]
  );

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url);
    setIsOpen(false);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative">
      <div
        className={cn(
          "flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm shadow-sm transition",
          isOpen
            ? "border-teal-300 ring-2 ring-teal-200"
            : "border-slate-200 hover:border-slate-300"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" aria-hidden="true" />
        ) : (
          <Search className="h-4 w-4 text-slate-400" aria-hidden="true" />
        )}
        <input
          ref={inputRef}
          type="search"
          placeholder="Search modules, policies, registers..."
          className="w-44 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none lg:w-64"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(e.target.value.length >= 2);
          }}
          onFocus={() => query.length >= 2 && setIsOpen(true)}
          onKeyDown={handleKeyDown}
          aria-label="Search"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls="search-results"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setResults([]);
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="text-slate-400 hover:text-slate-600"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {isOpen && (
        <div
          id="search-results"
          className="absolute right-0 top-full z-50 mt-2 w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg"
          role="listbox"
        >
          {results.length === 0 && !isLoading && query.length >= 2 && (
            <div className="p-4 text-center text-sm text-slate-500">
              No results found for &quot;{query}&quot;
            </div>
          )}

          {results.length > 0 && (
            <ul className="max-h-80 overflow-y-auto py-2">
              {groupedResults.map((group, groupIndex) => (
                <React.Fragment key={`group-${group.type}`}>
                  <li
                    role="presentation"
                    className={cn(
                      "px-4 pb-1 pt-3 text-xs font-semibold uppercase tracking-wide text-slate-400",
                      groupIndex === 0 && "pt-1"
                    )}
                  >
                    {typeLabels[group.type]}
                  </li>
                  {group.items.map(({ result, index }) => (
                    <li
                      key={`${result.type}-${result.id}`}
                      role="option"
                      aria-selected={index === selectedIndex}
                      className={cn(
                        "flex cursor-pointer items-start gap-3 px-4 py-3 transition",
                        index === selectedIndex
                          ? "bg-teal-50"
                          : "hover:bg-slate-50"
                      )}
                      onClick={() => handleResultClick(result)}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="mt-0.5 flex-shrink-0">
                        {typeIcons[result.type]}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="truncate font-medium text-slate-900">
                            {result.title}
                          </span>
                          <span className="flex-shrink-0 rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                            {typeLabels[result.type]}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm text-slate-500">
                          {result.description}
                        </p>
                      </div>
                    </li>
                  ))}
                </React.Fragment>
              ))}
            </ul>
          )}

          <div className="border-t border-slate-100 bg-slate-50 px-4 py-2 text-xs text-slate-400">
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5 font-mono">↑↓</kbd> to navigate
            <span className="mx-2">·</span>
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5 font-mono">↵</kbd> to select
            <span className="mx-2">·</span>
            <kbd className="rounded bg-slate-200 px-1.5 py-0.5 font-mono">esc</kbd> to close
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2, X } from "lucide-react";

interface AddressSuggestion {
  id: string;
  text: string;
  line1: string;
  line2?: string;
  city: string;
  county?: string;
  postcode: string;
  country: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (address: {
    line1: string;
    line2?: string;
    city: string;
    postcode: string;
    country: string;
  }) => void;
  defaultValue?: string;
  placeholder?: string;
  disabled?: boolean;
}

const SEARCH_DEBOUNCE_MS = 300;

export function AddressAutocomplete({
  onAddressSelect,
  defaultValue = "",
  placeholder = "Start typing a UK postcode...",
  disabled = false,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(defaultValue);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search function with AbortController for race condition prevention
  const searchAddresses = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSuggestions([]);
      setMessage(null);
      return;
    }

    // Abort any previous in-flight request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/address/autocomplete?q=${encodeURIComponent(searchQuery)}&country=GB`,
        { signal: controller.signal }
      );

      if (response.ok) {
        const data = await response.json();
        setSuggestions(data.suggestions || []);
        setMessage(data.message || null);
      } else {
        setSuggestions([]);
        setMessage("Unable to search addresses. Please enter manually.");
      }
    } catch (error) {
      // Ignore aborted requests
      if (error instanceof Error && error.name === "AbortError") {
        return;
      }
      console.error("Address search error:", error);
      setSuggestions([]);
      setMessage("Address lookup unavailable. Please enter manually.");
    } finally {
      // Only set loading false if this is still the current request
      if (abortControllerRef.current === controller) {
        setIsLoading(false);
      }
    }
  }, []);

  // Handle input changes with debounce
  const handleInputChange = (value: string) => {
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce the search
    debounceRef.current = setTimeout(() => {
      searchAddresses(value);
    }, SEARCH_DEBOUNCE_MS);
  };

  // Handle suggestion selection
  const handleSelect = (suggestion: AddressSuggestion) => {
    setQuery(suggestion.postcode);
    setSuggestions([]);
    setMessage(null);

    onAddressSelect({
      line1: suggestion.line1 || "",
      line2: suggestion.line2,
      city: suggestion.city,
      postcode: suggestion.postcode,
      country: suggestion.country,
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (suggestions.length === 0) return;

    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setSelectedIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        event.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        event.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSelect(suggestions[selectedIndex]);
        }
        break;
      case "Escape":
        setSuggestions([]);
        setMessage(null);
        setSelectedIndex(-1);
        break;
    }
  };

  // Cleanup debounce and abort controller on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="space-y-2">
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className="pl-10 pr-10"
          aria-label="Address search"
          aria-expanded={suggestions.length > 0}
          aria-haspopup="listbox"
          aria-autocomplete="list"
          role="combobox"
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
        )}
        {!isLoading && query && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-slate-100"
            onClick={() => {
              setQuery("");
              setSuggestions([]);
              setMessage(null);
              inputRef.current?.focus();
            }}
          >
            <X className="h-3 w-3 text-slate-400" />
          </Button>
        )}
      </div>

      {/* Status messages */}
      {isLoading && (
        <p className="text-xs text-slate-500">Searching postcodes...</p>
      )}

      {/* Inline results list (like Companies House search) */}
      {!isLoading && suggestions.length > 0 && (
        <div className="max-h-48 overflow-y-auto rounded-md border border-slate-200 bg-white">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              type="button"
              className={`w-full border-b border-slate-100 px-3 py-2 text-left text-sm hover:bg-slate-50 ${
                index === selectedIndex ? "bg-slate-100" : ""
              }`}
              onClick={() => handleSelect(suggestion)}
            >
              <div className="flex items-start gap-2">
                <MapPin className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
                <div>
                  <p className="font-medium">{suggestion.postcode}</p>
                  <p className="text-xs text-slate-500">
                    {[suggestion.city, suggestion.county]
                      .filter(Boolean)
                      .join(", ")}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Message (no results or error) */}
      {!isLoading && !suggestions.length && message && (
        <p className="text-xs text-slate-500">{message}</p>
      )}
    </div>
  );
}

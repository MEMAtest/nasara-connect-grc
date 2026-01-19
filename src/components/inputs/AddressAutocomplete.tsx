"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Loader2, AlertCircle } from "lucide-react";

type AddressSuggestion = {
  place_id: number;
  display_name: string;
};

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  countryCodes?: string[];
  minQueryLength?: number;
}

export function AddressAutocomplete({
  value,
  onChange,
  placeholder,
  countryCodes,
  minQueryLength = 3,
}: AddressAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const countryParam = useMemo(() => {
    if (!countryCodes?.length) return "";
    return `&countrycodes=${countryCodes.join(",")}`;
  }, [countryCodes]);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (query.trim().length < minQueryLength) {
      setSuggestions([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    const handle = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=jsonv2&addressdetails=1&limit=5&q=${encodeURIComponent(
            query,
          )}${countryParam}`,
          {
            signal: controller.signal,
            headers: {
              "Accept-Language": "en-GB",
            },
          },
        );

        if (!response.ok) {
          setError("Address lookup unavailable. Please enter manually.");
          setSuggestions([]);
          setIsLoading(false);
          return;
        }

        const data = (await response.json()) as AddressSuggestion[];
        setSuggestions(data);
        setIsOpen(true);
        setIsLoading(false);

        if (data.length === 0) {
          setError("No addresses found. Try a different search or enter manually.");
        }
      } catch (err) {
        if ((err as DOMException).name === "AbortError") return;
        console.error("Address lookup error:", err);
        setError("Address lookup unavailable. Please enter manually.");
        setSuggestions([]);
        setIsOpen(false);
        setIsLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [query, countryParam, minQueryLength]);

  return (
    <div className="relative">
      <div className="relative">
        <Input
          value={query}
          onChange={(event) => {
            const next = event.target.value;
            setQuery(next);
            onChange(next);
            setError(null);
          }}
          placeholder={placeholder}
          onFocus={() => setIsOpen(Boolean(suggestions.length))}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
          className={error ? "border-amber-300" : ""}
        />
        {isLoading && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
          </div>
        )}
      </div>
      {error && (
        <div className="mt-1 flex items-center gap-1 text-xs text-amber-600">
          <AlertCircle className="h-3 w-3" />
          <span>{error}</span>
        </div>
      )}
      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-20 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion.place_id}
              type="button"
              className="block w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onChange(suggestion.display_name);
                setQuery(suggestion.display_name);
                setIsOpen(false);
                setError(null);
              }}
            >
              {suggestion.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

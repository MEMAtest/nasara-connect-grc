"use client";

import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";

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
      return;
    }

    const controller = new AbortController();
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
        if (!response.ok) return;
        const data = (await response.json()) as AddressSuggestion[];
        setSuggestions(data);
        setIsOpen(true);
      } catch (error) {
        if ((error as DOMException).name === "AbortError") return;
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [query, countryParam, minQueryLength]);

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(event) => {
          const next = event.target.value;
          setQuery(next);
          onChange(next);
        }}
        placeholder={placeholder}
        onFocus={() => setIsOpen(Boolean(suggestions.length))}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
      />
      {isOpen && suggestions.length ? (
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
              }}
            >
              {suggestion.display_name}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

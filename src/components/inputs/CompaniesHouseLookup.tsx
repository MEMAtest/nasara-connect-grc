"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

type CompanySearchItem = {
  title: string;
  company_number: string;
  company_status?: string;
  address_snippet?: string;
};

type CompanyProfile = {
  company_name: string;
  company_number: string;
  sic_codes?: string[];
  registered_office_address?: Record<string, string>;
};

interface CompaniesHouseLookupProps {
  onSelect: (data: { legalName: string; companyNumber: string; sicCodes: string[]; registeredAddress: string }) => void;
}

function formatAddress(address?: Record<string, string>) {
  if (!address) return "";
  const parts = [
    address.address_line_1,
    address.address_line_2,
    address.locality,
    address.region,
    address.postal_code,
    address.country,
  ]
    .filter(Boolean)
    .map((value) => value.trim());
  return parts.join(", ");
}

export function CompaniesHouseLookup({ onSelect }: CompaniesHouseLookupProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CompanySearchItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (trimmedQuery.length < 3) {
      setResults([]);
      setIsOpen(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const handle = window.setTimeout(async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/companies-house/search?q=${encodeURIComponent(trimmedQuery)}`, {
          signal: controller.signal,
        });
        if (response.status === 501) {
          setError("Companies House lookup is not configured yet.");
          setResults([]);
          setIsOpen(false);
          return;
        }
        if (!response.ok) {
          setError("Unable to fetch Companies House results.");
          setResults([]);
          setIsOpen(false);
          return;
        }
        const data = await response.json();
        setResults(data.items ?? []);
        setIsOpen(true);
      } catch (fetchError) {
        if ((fetchError as DOMException).name === "AbortError") return;
        setError("Unable to fetch Companies House results.");
        setResults([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, 350);

    return () => {
      controller.abort();
      window.clearTimeout(handle);
    };
  }, [trimmedQuery]);

  const handleSelect = async (companyNumber: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/companies-house/${companyNumber}`);
      if (!response.ok) {
        setError("Unable to fetch company details.");
        return;
      }
      const data = (await response.json()) as CompanyProfile;
      onSelect({
        legalName: data.company_name,
        companyNumber: data.company_number,
        sicCodes: data.sic_codes ?? [],
        registeredAddress: formatAddress(data.registered_office_address),
      });
      setQuery(data.company_name);
      setResults([]);
      setIsOpen(false);
    } catch (fetchError) {
      setError("Unable to fetch company details.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search Companies House"
          className="pl-10"
          onFocus={() => setIsOpen(Boolean(results.length))}
          onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        />
      </div>

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {isLoading ? <p className="text-xs text-slate-400">Searching Companies House…</p> : null}

      {isOpen && results.length ? (
        <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
          {results.map((item) => (
            <button
              key={item.company_number}
              type="button"
              className="w-full px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => handleSelect(item.company_number)}
            >
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-xs text-slate-500">
                {item.company_number} · {item.company_status ?? "Status unknown"}
              </p>
              {item.address_snippet ? <p className="text-xs text-slate-400">{item.address_snippet}</p> : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

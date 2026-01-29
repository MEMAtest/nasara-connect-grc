"use client";

import { useState, useCallback } from "react";
import {
  Search,
  Building2,
  User,
  Shield,
  AlertTriangle,
  Loader2,
  CheckCircle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  ClipboardList,
  UserCheck,
  Gavel,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

// Types for API responses
interface NormalizedFirm {
  frn: string;
  name: string;
  status: string;
  statusEffectiveDate: string;
  businessType?: string;
  psdStatus?: string;
  address?: {
    line1?: string;
    line2?: string;
    town?: string;
    county?: string;
    postcode?: string;
    country?: string;
  } | null;
  phone?: string;
  website?: string;
  companiesHouseNumber?: string;
}

interface NormalizedPermission {
  permission: string;
  investmentTypes?: string[];
  customerTypes?: string[];
  limitations?: string[];
  status: string;
}

interface NormalizedIndividual {
  irn: string;
  name: string;
  status: string;
  controlFunctions?: Array<{
    function: string;
    status: string;
    effectiveFrom: string;
    effectiveTo?: string;
  }>;
}

interface DisciplinaryAction {
  actionType: string;
  enforcementType?: string;
  date: string;
  summary: string;
}

interface SearchResult {
  type: "Firm" | "Individual";
  name: string;
  reference: string;
  status: string;
}

interface ControlFunctionEntry {
  firmName: string;
  frn: string;
  function: string;
  status: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

type LookupTab = "firm" | "individual" | "search";

interface FCALookupProps {
  onFirmSelected?: (firm: NormalizedFirm) => void;
  onIndividualSelected?: (individual: NormalizedIndividual) => void;
  className?: string;
  defaultFrn?: string;
}

export function FCALookup({
  onFirmSelected,
  onIndividualSelected,
  className = "",
  defaultFrn,
}: FCALookupProps) {
  const [activeTab, setActiveTab] = useState<LookupTab>("firm");
  const [query, setQuery] = useState(defaultFrn || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Results state
  const [firm, setFirm] = useState<NormalizedFirm | null>(null);
  const [permissions, setPermissions] = useState<NormalizedPermission[]>([]);
  const [individuals, setIndividuals] = useState<NormalizedIndividual[]>([]);
  const [disciplinaryHistory, setDisciplinaryHistory] = useState<DisciplinaryAction[]>([]);
  const [individual, setIndividual] = useState<NormalizedIndividual | null>(null);
  const [controlFunctions, setControlFunctions] = useState<ControlFunctionEntry[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["details"])
  );

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  // Clear results
  const clearResults = useCallback(() => {
    setFirm(null);
    setPermissions([]);
    setIndividuals([]);
    setDisciplinaryHistory([]);
    setIndividual(null);
    setControlFunctions([]);
    setSearchResults([]);
    setError(null);
  }, []);

  // Lookup firm by FRN
  const lookupFirm = async (frn: string) => {
    setIsLoading(true);
    clearResults();

    try {
      const firmRes = await fetch(`/api/fca-register/firm/${frn}`);
      if (!firmRes.ok) {
        const data = await firmRes.json();
        throw new Error(data.error || "Firm not found");
      }
      const firmData = await firmRes.json();
      setFirm(firmData.firm);
      onFirmSelected?.(firmData.firm);

      const [permResult, indResult, discResult] = await Promise.allSettled([
        fetch(`/api/fca-register/firm/${frn}/permissions`),
        fetch(`/api/fca-register/firm/${frn}/individuals`),
        fetch(`/api/fca-register/firm/${frn}/disciplinary-history`),
      ]);

      if (permResult.status === "fulfilled" && permResult.value.ok) {
        const permData = await permResult.value.json();
        setPermissions(permData.permissions || []);
      }

      if (indResult.status === "fulfilled" && indResult.value.ok) {
        const indData = await indResult.value.json();
        setIndividuals(indData.individuals || []);
      }

      if (discResult.status === "fulfilled" && discResult.value.ok) {
        const discData = await discResult.value.json();
        setDisciplinaryHistory(discData.actions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to lookup firm");
    } finally {
      setIsLoading(false);
    }
  };

  // Lookup individual by IRN
  const lookupIndividual = async (irn: string) => {
    setIsLoading(true);
    clearResults();

    try {
      const [indRes, cfRes] = await Promise.all([
        fetch(`/api/fca-register/individual/${irn}`),
        fetch(`/api/fca-register/individual/${irn}/control-functions`),
      ]);

      if (!indRes.ok) {
        const data = await indRes.json();
        throw new Error(data.error || "Individual not found");
      }

      const indData = await indRes.json();
      setIndividual(indData.individual);
      onIndividualSelected?.(indData.individual);

      if (cfRes.ok) {
        const cfData = await cfRes.json();
        setControlFunctions(cfData.controlFunctions || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to lookup individual");
    } finally {
      setIsLoading(false);
    }
  };

  // Search
  const performSearch = async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setError("Search query must be at least 2 characters");
      return;
    }

    setIsLoading(true);
    clearResults();
    setHasSearched(false);

    try {
      const res = await fetch(
        `/api/fca-register/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Search failed");
      }
      const data = await res.json();
      setSearchResults(data.results || []);
      setHasSearched(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to perform search");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    switch (activeTab) {
      case "firm":
        lookupFirm(query.trim());
        break;
      case "individual":
        lookupIndividual(query.trim());
        break;
      case "search":
        performSearch(query.trim());
        break;
    }
  };

  // Status badge component
  const StatusBadge = ({ status }: { status: string }) => {
    const isAuthorized = status === "Authorised" || status === "Registered" || status === "Active";
    const isCancelled = status.includes("Cancelled") || status.includes("No longer");
    const isBanned = status === "Banned";

    return (
      <Badge
        variant="outline"
        className={
          isAuthorized
            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
            : isBanned
            ? "bg-rose-50 text-rose-700 border-rose-200"
            : isCancelled
            ? "bg-slate-50 text-slate-700 border-slate-200"
            : "bg-amber-50 text-amber-700 border-amber-200"
        }
      >
        {isAuthorized ? (
          <CheckCircle className="h-3 w-3 mr-1" />
        ) : isBanned ? (
          <XCircle className="h-3 w-3 mr-1" />
        ) : (
          <AlertTriangle className="h-3 w-3 mr-1" />
        )}
        {status}
      </Badge>
    );
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" />
          <CardTitle className="text-lg">FCA Register Lookup</CardTitle>
        </div>
        <CardDescription>
          Search the FCA Register to verify firms and individuals
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as LookupTab);
          setQuery("");
          clearResults();
          setHasSearched(false);
        }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="firm" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              <span className="hidden sm:inline">Firm (FRN)</span>
              <span className="sm:hidden">FRN</span>
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">Individual (IRN)</span>
              <span className="sm:hidden">IRN</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="firm" className="mt-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter FRN (e.g., 122702)"
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="individual" className="mt-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Enter IRN"
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search firms or individuals..."
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !query.trim()}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {/* Firm Results */}
        {firm && (
          <div className="space-y-3">
            <Collapsible open={expandedSections.has("details")} onOpenChange={() => toggleSection("details")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">Firm Details</span>
                  </div>
                  {expandedSections.has("details") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{firm.name}</h4>
                      <p className="text-sm text-muted-foreground">FRN: {firm.frn}</p>
                    </div>
                    <StatusBadge status={firm.status} />
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Status Effective Date</dt>
                      <dd>{firm.statusEffectiveDate}</dd>
                    </div>
                    {firm.companiesHouseNumber && (
                      <div>
                        <dt className="text-muted-foreground">Companies House</dt>
                        <dd>{firm.companiesHouseNumber}</dd>
                      </div>
                    )}
                    {firm.address?.line1 && (
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">Address</dt>
                        <dd>
                          {[firm.address.line1, firm.address.line2, firm.address.town, firm.address.postcode]
                            .filter(Boolean)
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {firm.businessType && (
                    <Badge variant="secondary">{firm.businessType}</Badge>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={expandedSections.has("permissions")} onOpenChange={() => toggleSection("permissions")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">Permissions ({permissions.length})</span>
                  </div>
                  {expandedSections.has("permissions") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                  {permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No permissions found</p>
                  ) : (
                    permissions.map((perm, idx) => (
                      <div key={idx} className="p-2 bg-slate-50 rounded text-sm">
                        <div className="flex items-start justify-between gap-2">
                          <p className="font-medium">{perm.permission}</p>
                          <StatusBadge status={perm.status} />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={expandedSections.has("individuals")} onOpenChange={() => toggleSection("individuals")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">Approved Persons ({individuals.length})</span>
                  </div>
                  {expandedSections.has("individuals") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                  {individuals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No approved persons found</p>
                  ) : (
                    individuals.map((ind, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded text-sm">
                        <div>
                          <p className="font-medium">{ind.name}</p>
                          <p className="text-xs text-muted-foreground">IRN: {ind.irn}</p>
                        </div>
                        <StatusBadge status={ind.status} />
                      </div>
                    ))
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={expandedSections.has("disciplinary")} onOpenChange={() => toggleSection("disciplinary")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Gavel className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">Enforcement History ({disciplinaryHistory.length})</span>
                    {disciplinaryHistory.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {disciplinaryHistory.length} action{disciplinaryHistory.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.has("disciplinary") ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="border rounded-lg p-3">
                  {disciplinaryHistory.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded">
                      <CheckCircle className="h-4 w-4" />
                      No enforcement actions on record
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {disciplinaryHistory.map((action, idx) => (
                        <div key={idx} className="p-3 bg-rose-50 border border-rose-100 rounded text-sm">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium text-rose-900">{action.actionType}</p>
                              <p className="text-rose-700 mt-1 text-xs">{action.summary}</p>
                            </div>
                            <p className="text-xs text-rose-600 whitespace-nowrap">{action.date}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        )}

        {/* Individual Results */}
        {individual && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-lg">{individual.name}</h4>
                <p className="text-sm text-muted-foreground">IRN: {individual.irn}</p>
              </div>
              <StatusBadge status={individual.status} />
            </div>
            {controlFunctions.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2">Control Functions</h5>
                <div className="space-y-2">
                  {controlFunctions.map((cf, idx) => (
                    <div key={idx} className="flex items-start justify-between p-2 bg-slate-50 rounded text-sm">
                      <div>
                        <p className="font-medium">{cf.function}</p>
                        <p className="text-muted-foreground">{cf.firmName}</p>
                        <p className="text-xs text-muted-foreground">FRN: {cf.frn}</p>
                      </div>
                      <div className="text-right">
                        <StatusBadge status={cf.status} />
                        <p className="text-xs text-muted-foreground mt-1">From: {cf.effectiveFrom}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Found {searchResults.length} result{searchResults.length > 1 ? "s" : ""}
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(result.reference);
                    if (result.type === "Firm") {
                      setActiveTab("firm");
                      lookupFirm(result.reference);
                    } else {
                      setActiveTab("individual");
                      lookupIndividual(result.reference);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-left transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {result.type === "Firm" ? (
                      <Building2 className="h-4 w-4 text-slate-400" />
                    ) : (
                      <User className="h-4 w-4 text-slate-400" />
                    )}
                    <div>
                      <p className="font-medium">{result.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {result.type === "Firm" ? "FRN" : "IRN"}: {result.reference}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={result.status} />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* No results found after search */}
        {!isLoading && !error && hasSearched && searchResults.length === 0 && activeTab === "search" && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium">No results found</p>
            <p className="text-xs mt-1">
              Try searching with a different term or use the FRN/IRN tabs for direct lookup
            </p>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && !error && !firm && !individual && searchResults.length === 0 && !hasSearched && (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-8 w-8 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {activeTab === "firm"
                ? "Enter a Firm Reference Number (FRN) to look up firm details"
                : activeTab === "individual"
                ? "Enter an Individual Reference Number (IRN) to look up individual details"
                : "Search for firms or individuals by name"}
            </p>
          </div>
        )}

        {/* Footer link */}
        <div className="pt-2 border-t">
          <a
            href="https://register.fca.org.uk/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-blue-600 hover:underline flex items-center gap-1"
          >
            View on FCA Register
            <ExternalLink className="h-3 w-3" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

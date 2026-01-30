"use client";

import { useState } from "react";
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
  UserPlus,
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

export interface ControlFunctionEntry {
  firmName: string;
  frn: string;
  function: string;
  status: string;
  effectiveFrom: string;
  effectiveTo?: string;
}

type LookupTab = "firm" | "individual" | "search";

// Per-tab state types
interface FirmTabState {
  query: string;
  firm: NormalizedFirm | null;
  permissions: NormalizedPermission[];
  individuals: NormalizedIndividual[];
  disciplinaryHistory: DisciplinaryAction[];
  fetchErrors: Set<string>;
  secondaryLoading: boolean;
}

interface IndividualTabState {
  query: string;
  individual: NormalizedIndividual | null;
  controlFunctions: ControlFunctionEntry[];
  fetchErrors: Set<string>;
}

interface SearchTabState {
  query: string;
  searchResults: SearchResult[];
  hasSearched: boolean;
}

export interface FCAPersonToAdd {
  name: string;
  irn: string;
  status: string;
}

interface FCALookupProps {
  onFirmSelected?: (firm: NormalizedFirm) => void;
  onIndividualSelected?: (individual: NormalizedIndividual) => void;
  onAddPerson?: (person: FCAPersonToAdd) => void;
  /** IRNs that have already been added — renders a checkmark instead of the add button */
  addedIrns?: Set<string>;
  className?: string;
  defaultFrn?: string;
}

export function FCALookup({
  onFirmSelected,
  onIndividualSelected,
  onAddPerson,
  addedIrns,
  className = "",
  defaultFrn,
}: FCALookupProps) {
  const [activeTab, setActiveTab] = useState<LookupTab>("firm");

  // Shared loading/error state (only one operation at a time)
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Per-tab state — each tab keeps its own query and results
  const [firmTab, setFirmTab] = useState<FirmTabState>({
    query: defaultFrn || "",
    firm: null,
    permissions: [],
    individuals: [],
    disciplinaryHistory: [],
    fetchErrors: new Set(),
    secondaryLoading: false,
  });

  const [individualTab, setIndividualTab] = useState<IndividualTabState>({
    query: "",
    individual: null,
    controlFunctions: [],
    fetchErrors: new Set(),
  });

  const [searchTab, setSearchTab] = useState<SearchTabState>({
    query: "",
    searchResults: [],
    hasSearched: false,
  });

  // Expanded sections
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["details"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
  };

  // Lookup firm by FRN
  const lookupFirm = async (frn: string) => {
    setIsLoading(true);
    setError(null);
    setFirmTab((prev) => ({
      ...prev,
      firm: null,
      permissions: [],
      individuals: [],
      disciplinaryHistory: [],
      fetchErrors: new Set(),
      secondaryLoading: false,
    }));

    try {
      const firmRes = await fetch(`/api/fca-register/firm/${frn}`);
      if (!firmRes.ok) {
        const data = await firmRes.json();
        throw new Error(data.error || "Firm not found");
      }
      const firmData = await firmRes.json();
      setFirmTab((prev) => ({ ...prev, firm: firmData.firm }));
      onFirmSelected?.(firmData.firm);

      // Fetch secondary data
      setFirmTab((prev) => ({ ...prev, secondaryLoading: true }));
      const [permResult, indResult, discResult] = await Promise.allSettled([
        fetch(`/api/fca-register/firm/${frn}/permissions`),
        fetch(`/api/fca-register/firm/${frn}/individuals`),
        fetch(`/api/fca-register/firm/${frn}/disciplinary-history`),
      ]);

      const errors = new Set<string>();

      if (permResult.status === "fulfilled" && permResult.value.ok) {
        const permData = await permResult.value.json();
        setFirmTab((prev) => ({ ...prev, permissions: permData.permissions || [] }));
      } else {
        errors.add("permissions");
      }

      if (indResult.status === "fulfilled" && indResult.value.ok) {
        const indData = await indResult.value.json();
        setFirmTab((prev) => ({ ...prev, individuals: indData.individuals || [] }));
      } else {
        errors.add("individuals");
      }

      if (discResult.status === "fulfilled" && discResult.value.ok) {
        const discData = await discResult.value.json();
        setFirmTab((prev) => ({ ...prev, disciplinaryHistory: discData.actions || [] }));
      } else {
        errors.add("disciplinary");
      }

      setFirmTab((prev) => ({ ...prev, fetchErrors: errors, secondaryLoading: false }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to lookup firm");
    } finally {
      setIsLoading(false);
      setFirmTab((prev) => ({ ...prev, secondaryLoading: false }));
    }
  };

  // Lookup individual by IRN
  const lookupIndividual = async (irn: string) => {
    setIsLoading(true);
    setError(null);
    setIndividualTab((prev) => ({
      ...prev,
      individual: null,
      controlFunctions: [],
      fetchErrors: new Set(),
    }));

    try {
      const [indRes, cfRes] = await Promise.allSettled([
        fetch(`/api/fca-register/individual/${irn}`),
        fetch(`/api/fca-register/individual/${irn}/control-functions`),
      ]);

      if (indRes.status !== "fulfilled" || !indRes.value.ok) {
        const data = indRes.status === "fulfilled" ? await indRes.value.json() : null;
        throw new Error(data?.error || "Individual not found");
      }

      const indData = await indRes.value.json();
      setIndividualTab((prev) => ({ ...prev, individual: indData.individual }));
      onIndividualSelected?.(indData.individual);

      const errors = new Set<string>();
      if (cfRes.status === "fulfilled" && cfRes.value.ok) {
        const cfData = await cfRes.value.json();
        setIndividualTab((prev) => ({ ...prev, controlFunctions: cfData.controlFunctions || [] }));
      } else {
        errors.add("controlFunctions");
      }
      setIndividualTab((prev) => ({ ...prev, fetchErrors: errors }));
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
    setError(null);
    setSearchTab((prev) => ({ ...prev, searchResults: [], hasSearched: false }));

    try {
      const res = await fetch(
        `/api/fca-register/search?q=${encodeURIComponent(searchQuery)}`
      );
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Search failed");
      }
      const data = await res.json();
      setSearchTab((prev) => ({ ...prev, searchResults: data.results || [], hasSearched: true }));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to perform search");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (activeTab) {
      case "firm":
        if (firmTab.query.trim()) lookupFirm(firmTab.query.trim());
        break;
      case "individual":
        if (individualTab.query.trim()) lookupIndividual(individualTab.query.trim());
        break;
      case "search":
        if (searchTab.query.trim()) performSearch(searchTab.query.trim());
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

  // Section error indicator
  const SectionError = ({ section, errors }: { section: string; errors: Set<string> }) => {
    if (!errors.has(section)) return null;
    return (
      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 text-xs">
        <AlertTriangle className="h-3 w-3 mr-1" />
        Failed to load
      </Badge>
    );
  };

  // Determine what to show based on active tab
  const showFirmResults = activeTab === "firm" && firmTab.firm;
  const showIndividualResults = activeTab === "individual" && individualTab.individual;
  const showSearchResults = activeTab === "search" && searchTab.searchResults.length > 0;
  const showNoSearchResults = activeTab === "search" && !isLoading && !error && searchTab.hasSearched && searchTab.searchResults.length === 0;
  const showEmptyState = !isLoading && !error && (
    (activeTab === "firm" && !firmTab.firm) ||
    (activeTab === "individual" && !individualTab.individual) ||
    (activeTab === "search" && searchTab.searchResults.length === 0 && !searchTab.hasSearched)
  );

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-blue-600" aria-hidden="true" />
          <CardTitle className="text-lg">FCA Register Lookup</CardTitle>
        </div>
        <CardDescription>
          Search the FCA Register to verify firms and individuals
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Tabs — switching just changes the active tab, no state clearing */}
        <Tabs value={activeTab} onValueChange={(v) => {
          setActiveTab(v as LookupTab);
          setError(null);
          setIsLoading(false);
        }}>
          <TabsList className="grid w-full grid-cols-3" aria-label="FCA Register lookup type">
            <TabsTrigger value="firm" className="flex items-center gap-2">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Firm (FRN)</span>
              <span className="sm:hidden">FRN</span>
            </TabsTrigger>
            <TabsTrigger value="individual" className="flex items-center gap-2">
              <User className="h-4 w-4" aria-hidden="true" />
              <span className="hidden sm:inline">Individual (IRN)</span>
              <span className="sm:hidden">IRN</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" aria-hidden="true" />
              Search
            </TabsTrigger>
          </TabsList>

          <TabsContent value="firm" className="mt-4">
            <form onSubmit={handleSubmit} className="flex gap-2" role="search" aria-label="Look up firm by FRN">
              <Input
                type="text"
                value={firmTab.query}
                onChange={(e) => setFirmTab((prev) => ({ ...prev, query: e.target.value }))}
                placeholder="Enter FRN (e.g., 122702)"
                className="flex-1"
                aria-label="Firm Reference Number"
              />
              <Button type="submit" disabled={isLoading || !firmTab.query.trim()} aria-label="Look up firm">
                {isLoading && activeTab === "firm" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="individual" className="mt-4">
            <form onSubmit={handleSubmit} className="flex gap-2" role="search" aria-label="Look up individual by IRN">
              <Input
                type="text"
                value={individualTab.query}
                onChange={(e) => setIndividualTab((prev) => ({ ...prev, query: e.target.value }))}
                placeholder="Enter IRN"
                className="flex-1"
                aria-label="Individual Reference Number"
              />
              <Button type="submit" disabled={isLoading || !individualTab.query.trim()} aria-label="Look up individual">
                {isLoading && activeTab === "individual" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="search" className="mt-4">
            <form onSubmit={handleSubmit} className="flex gap-2" role="search" aria-label="Search FCA Register">
              <Input
                type="text"
                value={searchTab.query}
                onChange={(e) => setSearchTab((prev) => ({ ...prev, query: e.target.value }))}
                placeholder="Search firms or individuals..."
                className="flex-1"
                aria-label="Search query"
              />
              <Button type="submit" disabled={isLoading || !searchTab.query.trim()} aria-label="Search">
                {isLoading && activeTab === "search" ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : <Search className="h-4 w-4" aria-hidden="true" />}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        {/* Error Message */}
        {error && (
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-start gap-2" role="alert">
            <AlertTriangle className="h-4 w-4 text-rose-500 mt-0.5 shrink-0" aria-hidden="true" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {/* Firm Results */}
        {showFirmResults && (
          <div className="space-y-3">
            <Collapsible open={expandedSections.has("details")} onOpenChange={() => toggleSection("details")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    <span className="font-medium">Firm Details</span>
                  </div>
                  {expandedSections.has("details") ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-semibold text-lg">{firmTab.firm!.name}</h4>
                      <p className="text-sm text-muted-foreground">FRN: {firmTab.firm!.frn}</p>
                    </div>
                    <StatusBadge status={firmTab.firm!.status} />
                  </div>
                  <dl className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <dt className="text-muted-foreground">Status Effective Date</dt>
                      <dd>{firmTab.firm!.statusEffectiveDate}</dd>
                    </div>
                    {firmTab.firm!.companiesHouseNumber && (
                      <div>
                        <dt className="text-muted-foreground">Companies House</dt>
                        <dd>{firmTab.firm!.companiesHouseNumber}</dd>
                      </div>
                    )}
                    {firmTab.firm!.address?.line1 && (
                      <div className="col-span-2">
                        <dt className="text-muted-foreground">Address</dt>
                        <dd>
                          {[firmTab.firm!.address.line1, firmTab.firm!.address.line2, firmTab.firm!.address.town, firmTab.firm!.address.postcode]
                            .filter(Boolean)
                            .join(", ")}
                        </dd>
                      </div>
                    )}
                  </dl>
                  {firmTab.firm!.businessType && (
                    <Badge variant="secondary">{firmTab.firm!.businessType}</Badge>
                  )}
                </div>
              </CollapsibleContent>
            </Collapsible>

            <Collapsible open={expandedSections.has("permissions")} onOpenChange={() => toggleSection("permissions")}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    <span className="font-medium">Permissions ({firmTab.permissions.length})</span>
                    {firmTab.secondaryLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" aria-label="Loading permissions" />}
                    <SectionError section="permissions" errors={firmTab.fetchErrors} />
                  </div>
                  {expandedSections.has("permissions") ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                  {firmTab.fetchErrors.has("permissions") ? (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      Unable to load permissions. Try looking up the firm again.
                    </div>
                  ) : firmTab.permissions.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No permissions found</p>
                  ) : (
                    firmTab.permissions.map((perm, idx) => (
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
                    <UserCheck className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    <span className="font-medium">Approved Persons ({firmTab.individuals.length})</span>
                    {firmTab.secondaryLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" aria-label="Loading individuals" />}
                    <SectionError section="individuals" errors={firmTab.fetchErrors} />
                  </div>
                  {expandedSections.has("individuals") ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="border rounded-lg p-3 max-h-64 overflow-y-auto space-y-2">
                  {firmTab.fetchErrors.has("individuals") ? (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      Unable to load approved persons. Try looking up the firm again.
                    </div>
                  ) : firmTab.individuals.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No approved persons found</p>
                  ) : (
                    firmTab.individuals.map((ind, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-2 p-2 bg-slate-50 rounded text-sm">
                        <div className="min-w-0 flex-1">
                          <p className="font-medium">{ind.name}</p>
                          <p className="text-xs text-muted-foreground">IRN: {ind.irn}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <StatusBadge status={ind.status} />
                          {onAddPerson && (
                            addedIrns?.has(ind.irn) ? (
                              <span className="inline-flex items-center h-7 px-2 text-xs text-emerald-600" title="Added to People">
                                <CheckCircle className="h-3.5 w-3.5" />
                              </span>
                            ) : (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                                onClick={() => onAddPerson({ name: ind.name, irn: ind.irn, status: ind.status })}
                                title="Add to People"
                                aria-label={`Add ${ind.name} to People`}
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                              </Button>
                            )
                          )}
                        </div>
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
                    <Gavel className="h-4 w-4 text-slate-500" aria-hidden="true" />
                    <span className="font-medium">Enforcement History ({firmTab.disciplinaryHistory.length})</span>
                    {firmTab.secondaryLoading && <Loader2 className="h-3 w-3 animate-spin text-slate-400" aria-label="Loading enforcement history" />}
                    <SectionError section="disciplinary" errors={firmTab.fetchErrors} />
                    {!firmTab.fetchErrors.has("disciplinary") && firmTab.disciplinaryHistory.length > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {firmTab.disciplinaryHistory.length} action{firmTab.disciplinaryHistory.length > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                  {expandedSections.has("disciplinary") ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-3">
                <div className="border rounded-lg p-3">
                  {firmTab.fetchErrors.has("disciplinary") ? (
                    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded">
                      <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                      Unable to load enforcement history. Try looking up the firm again.
                    </div>
                  ) : firmTab.disciplinaryHistory.length === 0 ? (
                    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 p-3 rounded">
                      <CheckCircle className="h-4 w-4" aria-hidden="true" />
                      No enforcement actions on record
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {firmTab.disciplinaryHistory.map((action, idx) => (
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
        {showIndividualResults && (
          <div className="border rounded-lg p-4 space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-semibold text-lg">{individualTab.individual!.name}</h4>
                <p className="text-sm text-muted-foreground">IRN: {individualTab.individual!.irn}</p>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={individualTab.individual!.status} />
                {onAddPerson && (
                  addedIrns?.has(individualTab.individual!.irn) ? (
                    <Badge variant="outline" className="text-xs bg-emerald-50 text-emerald-700 border-emerald-200">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Added
                    </Badge>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-xs"
                      onClick={() => onAddPerson({
                        name: individualTab.individual!.name,
                        irn: individualTab.individual!.irn,
                        status: individualTab.individual!.status,
                      })}
                      aria-label={`Add ${individualTab.individual!.name} to People`}
                    >
                      <UserPlus className="h-3.5 w-3.5 mr-1.5" />
                      Add to People
                    </Button>
                  )
                )}
              </div>
            </div>
            {individualTab.fetchErrors.has("controlFunctions") ? (
              <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 p-3 rounded">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Unable to load control functions. Try looking up the individual again.
              </div>
            ) : individualTab.controlFunctions.length > 0 ? (
              <div>
                <h5 className="text-sm font-medium mb-2">Control Functions</h5>
                <div className="space-y-2">
                  {individualTab.controlFunctions.map((cf, idx) => (
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
            ) : null}
          </div>
        )}

        {/* Search Results */}
        {showSearchResults && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Found {searchTab.searchResults.length} result{searchTab.searchResults.length > 1 ? "s" : ""}
            </p>
            <div className="space-y-2 max-h-96 overflow-y-auto" role="list" aria-label="Search results">
              {searchTab.searchResults.map((result, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    if (result.type === "Firm") {
                      setFirmTab((prev) => ({ ...prev, query: result.reference }));
                      setActiveTab("firm");
                      lookupFirm(result.reference);
                    } else {
                      setIndividualTab((prev) => ({ ...prev, query: result.reference }));
                      setActiveTab("individual");
                      lookupIndividual(result.reference);
                    }
                  }}
                  className="w-full flex items-center justify-between p-3 bg-slate-50 hover:bg-slate-100 rounded-lg text-sm text-left transition-colors"
                  role="listitem"
                  aria-label={`${result.type}: ${result.name} (${result.type === "Firm" ? "FRN" : "IRN"}: ${result.reference})`}
                >
                  <div className="flex items-center gap-3">
                    {result.type === "Firm" ? (
                      <Building2 className="h-4 w-4 text-slate-400" aria-hidden="true" />
                    ) : (
                      <User className="h-4 w-4 text-slate-400" aria-hidden="true" />
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
        {showNoSearchResults && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="h-8 w-8 mx-auto mb-3 opacity-30" aria-hidden="true" />
            <p className="text-sm font-medium">No results found</p>
            <p className="text-xs mt-1">
              Try searching with a different term or use the FRN/IRN tabs for direct lookup
            </p>
          </div>
        )}

        {/* Empty state */}
        {showEmptyState && (
          <div className="text-center py-8 text-muted-foreground">
            <Info className="h-8 w-8 mx-auto mb-3 opacity-30" aria-hidden="true" />
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
            aria-label="View FCA Register website (opens in new tab)"
          >
            View on FCA Register
            <ExternalLink className="h-3 w-3" aria-hidden="true" />
          </a>
        </div>
      </CardContent>
    </Card>
  );
}

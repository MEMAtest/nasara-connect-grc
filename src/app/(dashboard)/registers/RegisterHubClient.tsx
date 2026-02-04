"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Search,
  FolderOpen,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RegisterCard } from "@/components/register-hub/RegisterCard";
import { RegisterDetailsSheet } from "@/components/register-hub/RegisterDetailsSheet";
import { FirmTypeSelector, FirmTypeBadge } from "@/components/register-hub/FirmTypeSelector";
import { SetupWizard } from "@/components/register-hub/wizard";
import { MyRegistersHub } from "@/components/register-hub/MyRegistersHub";
import { RegisterDefinitionRecord, RegisterSubscriptionRecord } from "@/lib/database";
import {
  FirmType,
  RegisterCategory,
  REGISTER_CATEGORIES,
  RecommendationLevel,
} from "@/lib/types/register-hub";
import { getRecommendationLevel } from "@/lib/register-hub/recommendations";

type ViewMode = "my-registers" | "browse";

type CategoryFilter = RegisterCategory | "all";

interface RegisterStat {
  code: string;
  count: number;
  activeCount?: number;
  pendingCount?: number;
}

export default function RegisterHubClient() {
  const [definitions, setDefinitions] = useState<RegisterDefinitionRecord[]>([]);
  const [subscriptions, setSubscriptions] = useState<RegisterSubscriptionRecord[]>([]);
  const [firmType, setFirmType] = useState<FirmType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Wizard state
  const [wizardCompleted, setWizardCompleted] = useState<boolean | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("my-registers");
  const [registerStats, setRegisterStats] = useState<Record<string, RegisterStat>>({});

  // UI State
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>("all");
  const [showFirmTypeSelector, setShowFirmTypeSelector] = useState(false);
  const [selectedDefinition, setSelectedDefinition] = useState<RegisterDefinitionRecord | null>(
    null
  );
  const [isToggling, setIsToggling] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch definitions
      const defRes = await fetch("/api/register-hub/definitions");
      if (!defRes.ok) throw new Error("Failed to load register definitions");
      const defData = await defRes.json();
      setDefinitions(defData.definitions || []);

      // Fetch my-registers (includes wizard status, subscriptions, and stats)
      const myRegRes = await fetch("/api/register-hub/my-registers");
      if (myRegRes.ok) {
        const myRegData = await myRegRes.json();
        setWizardCompleted(myRegData.wizardCompleted || false);
        setFirmType(myRegData.firmType as FirmType | null);
        setSubscriptions(myRegData.subscriptions || []);
        setRegisterStats(myRegData.registerStats || {});
      } else {
        // Fallback: fetch subscriptions separately
        const subRes = await fetch("/api/register-hub/subscriptions");
        if (!subRes.ok) throw new Error("Failed to load subscriptions");
        const subData = await subRes.json();
        setSubscriptions(subData.subscriptions || []);
        setWizardCompleted(false);

        // Fetch recommendations/firm type
        const recRes = await fetch("/api/register-hub/recommendations");
        if (recRes.ok) {
          const recData = await recRes.json();
          if (recData.firmType) {
            setFirmType(recData.firmType as FirmType);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Handle wizard completion
  const handleWizardComplete = async (selectedFirmType: FirmType, selectedRegisters: string[]) => {
    setIsToggling(true);
    try {
      const res = await fetch("/api/register-hub/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firmType: selectedFirmType,
          selectedRegisters,
        }),
      });
      if (!res.ok) throw new Error("Failed to complete setup");

      const data = await res.json();
      setFirmType(selectedFirmType);
      setWizardCompleted(true);
      setSubscriptions(data.subscriptions || []);
      setViewMode("my-registers");

      // Reload data to get stats
      await loadData();
    } catch (err) {
      console.error("Error completing wizard:", err);
    } finally {
      setIsToggling(false);
    }
  };

  // Handle firm type selection
  const handleFirmTypeSelect = async (type: FirmType) => {
    setIsToggling(true);
    try {
      const res = await fetch("/api/register-hub/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firmType: type }),
      });
      if (!res.ok) throw new Error("Failed to set firm type");

      setFirmType(type);
      setShowFirmTypeSelector(false);

      // Auto-enable mandatory registers
      const { mandatory } = (await res.json()).recommendations || {};
      if (mandatory && mandatory.length > 0) {
        await fetch("/api/register-hub/subscriptions", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            registerCodes: mandatory,
            enabled: true,
          }),
        });
        // Refresh subscriptions
        const subRes = await fetch("/api/register-hub/subscriptions");
        if (subRes.ok) {
          const subData = await subRes.json();
          setSubscriptions(subData.subscriptions || []);
        }
      }
    } catch (err) {
      console.error("Error setting firm type:", err);
    } finally {
      setIsToggling(false);
    }
  };

  // Handle register toggle
  const handleToggle = useCallback(async (code: string, enabled: boolean) => {
    setIsToggling(true);
    try {
      const res = await fetch("/api/register-hub/subscriptions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          registerCode: code,
          enabled,
        }),
      });
      if (!res.ok) throw new Error("Failed to update subscription");

      const data = await res.json();
      setSubscriptions((prev) => {
        const existing = prev.find((s) => s.register_code === code);
        if (existing) {
          return prev.map((s) => (s.register_code === code ? data.subscription : s));
        }
        return [...prev, data.subscription];
      });
    } catch (err) {
      console.error("Error toggling register:", err);
    } finally {
      setIsToggling(false);
    }
  }, []);

  // Get subscription for a register
  const getSubscription = useCallback(
    (code: string) => subscriptions.find((s) => s.register_code === code),
    [subscriptions]
  );

  // Get recommendation level for a register
  const getRecommendation = useCallback(
    (code: string): RecommendationLevel => getRecommendationLevel(code, firmType),
    [firmType]
  );

  // Filter and sort definitions
  const filteredDefinitions = useMemo(() => {
    let filtered = [...definitions];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d) =>
          d.name.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query) ||
          d.short_description?.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter !== "all") {
      filtered = filtered.filter((d) => d.category === categoryFilter);
    }

    // Sort: mandatory first, then recommended, then by sort_order
    return filtered.sort((a, b) => {
      const aLevel = getRecommendation(a.code);
      const bLevel = getRecommendation(b.code);
      const levelOrder = { mandatory: 0, recommended: 1, optional: 2 };
      const levelDiff = levelOrder[aLevel] - levelOrder[bLevel];
      if (levelDiff !== 0) return levelDiff;
      return a.sort_order - b.sort_order;
    });
  }, [definitions, searchQuery, categoryFilter, getRecommendation]);

  // Stats
  const stats = useMemo(() => {
    const enabled = subscriptions.filter((s) => s.enabled).length;
    const mandatory = definitions.filter(
      (d) => getRecommendation(d.code) === "mandatory"
    ).length;
    const implemented = definitions.filter((d) => d.is_implemented).length;
    return { total: definitions.length, enabled, mandatory, implemented };
  }, [definitions, subscriptions, getRecommendation]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[50vh] flex-col items-center justify-center gap-4">
        <AlertCircle className="h-12 w-12 text-red-500" />
        <p className="text-red-600">{error}</p>
        <Button onClick={loadData}>Retry</Button>
      </div>
    );
  }

  // Show wizard for first-time users
  if (wizardCompleted === false) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
              <FolderOpen className="h-6 w-6 text-teal-600" />
              Register Hub
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Set up your regulatory registers and compliance tracking
            </p>
          </div>
        </div>
        <SetupWizard onComplete={handleWizardComplete} isLoading={isToggling} />
      </div>
    );
  }

  // Show My Registers Hub for users who completed setup
  if (viewMode === "my-registers" && firmType) {
    const enabledCodes = subscriptions.filter((s) => s.enabled).map((s) => s.register_code);
    return (
      <div className="space-y-6">
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="my-registers">My Registers</TabsTrigger>
            <TabsTrigger value="browse">Browse All</TabsTrigger>
          </TabsList>
        </Tabs>
        <MyRegistersHub
          firmType={firmType}
          enabledRegisters={enabledCodes}
          registerStats={registerStats}
          onAddMore={() => setViewMode("browse")}
        />
      </div>
    );
  }

  // Browse view - show all registers
  return (
    <div className="space-y-6">
      {/* View Mode Tabs (if wizard completed) */}
      {wizardCompleted && firmType && (
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="my-registers">My Registers</TabsTrigger>
            <TabsTrigger value="browse">Browse All</TabsTrigger>
          </TabsList>
        </Tabs>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-slate-900">
            <FolderOpen className="h-6 w-6 text-teal-600" />
            Register Hub
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your regulatory registers and compliance tracking
          </p>
        </div>

        <div className="flex items-center gap-3">
          {firmType ? (
            <FirmTypeBadge firmType={firmType} onClick={() => setShowFirmTypeSelector(true)} />
          ) : (
            <Button
              variant="outline"
              onClick={() => setShowFirmTypeSelector(true)}
              className="gap-2"
            >
              <Building2 className="h-4 w-4" />
              Select Firm Type
            </Button>
          )}
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-teal-50">
              <FolderOpen className="h-5 w-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              <p className="text-xs text-slate-500">Total Registers</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.enabled}</p>
              <p className="text-xs text-slate-500">Enabled</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50">
              <AlertCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.mandatory}</p>
              <p className="text-xs text-slate-500">Mandatory</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{stats.implemented}</p>
              <p className="text-xs text-slate-500">Available</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            placeholder="Search registers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <Tabs
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as CategoryFilter)}
        >
          <TabsList className="h-10">
            <TabsTrigger value="all" className="text-xs">
              All
            </TabsTrigger>
            {(Object.keys(REGISTER_CATEGORIES) as RegisterCategory[]).map((cat) => (
              <TabsTrigger key={cat} value={cat} className="text-xs">
                {REGISTER_CATEGORIES[cat].label.split(" ")[0]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* No firm type prompt */}
      {!firmType && (
        <div className="rounded-xl border-2 border-dashed border-amber-300 bg-amber-50 p-6 text-center">
          <Building2 className="mx-auto h-10 w-10 text-amber-500" />
          <h3 className="mt-3 font-semibold text-amber-900">
            Select your firm type to get personalized recommendations
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            We&apos;ll highlight which registers are mandatory and recommended for your business.
          </p>
          <Button
            onClick={() => setShowFirmTypeSelector(true)}
            className="mt-4 bg-amber-500 hover:bg-amber-600"
          >
            Select Firm Type
          </Button>
        </div>
      )}

      {/* Register grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredDefinitions.map((def) => (
          <RegisterCard
            key={def.code}
            definition={def}
            subscription={getSubscription(def.code)}
            recommendationLevel={getRecommendation(def.code)}
            onToggle={handleToggle}
            onViewDetails={setSelectedDefinition}
            isLoading={isToggling}
          />
        ))}
      </div>

      {filteredDefinitions.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <FolderOpen className="h-12 w-12 text-slate-300" />
          <p className="mt-4 text-slate-500">No registers found matching your criteria</p>
          <Button
            variant="link"
            onClick={() => {
              setSearchQuery("");
              setCategoryFilter("all");
            }}
          >
            Clear filters
          </Button>
        </div>
      )}

      {/* Details sheet */}
      <RegisterDetailsSheet
        definition={selectedDefinition}
        subscription={selectedDefinition ? getSubscription(selectedDefinition.code) : undefined}
        recommendationLevel={
          selectedDefinition ? getRecommendation(selectedDefinition.code) : "optional"
        }
        firmType={firmType || undefined}
        open={!!selectedDefinition}
        onOpenChange={(open) => !open && setSelectedDefinition(null)}
        onToggle={handleToggle}
        isLoading={isToggling}
      />

      {/* Firm type selector */}
      <FirmTypeSelector
        open={showFirmTypeSelector}
        onOpenChange={setShowFirmTypeSelector}
        onSelect={handleFirmTypeSelect}
        currentFirmType={firmType}
        isLoading={isToggling}
      />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Plus,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  Clock,
  FileText,
  Users,
  Shield,
  AlertTriangle,
  Heart,
  Scale,
  Gift,
  Megaphone,
  Search,
  FileSearch,
  FileCheck,
  FileWarning,
  BarChart3,
  CreditCard,
  BookOpen,
  Award,
  Calendar,
  Briefcase,
  Database,
  ShieldAlert,
  Building2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { FirmType, FIRM_TYPES, REGISTER_CATEGORIES, RegisterCategory } from "@/lib/types/register-hub";
import { REGISTER_DEFINITIONS } from "@/lib/register-hub/definitions";

// Icon mapping for register codes
const REGISTER_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pep: Users,
  sanctions: Shield,
  "aml-cdd": FileSearch,
  "edd-cases": FileCheck,
  "sar-nca": FileWarning,
  "tx-monitoring": BarChart3,
  complaints: FileText,
  conflicts: Scale,
  "gifts-hospitality": Gift,
  "fin-prom": Megaphone,
  "vulnerable-customers": Heart,
  "product-governance": Search,
  "tc-record": BookOpen,
  "smcr-certification": Award,
  "regulatory-returns": Calendar,
  "pa-dealing": CreditCard,
  "insider-list": Database,
  "outside-business": Briefcase,
  incidents: AlertTriangle,
  "third-party": Building2,
  "data-breach-dsar": ShieldAlert,
  "op-resilience": Shield,
  "regulatory-breach": AlertCircle,
};

interface RegisterStat {
  code: string;
  count: number;
  activeCount?: number;
  pendingCount?: number;
}

type StatFilter = "all" | "has-records" | "pending" | "active";

interface MyRegistersHubProps {
  firmType: FirmType;
  enabledRegisters: string[];
  registerStats?: Record<string, RegisterStat>;
  onAddMore: () => void;
}

export function MyRegistersHub({
  firmType,
  enabledRegisters,
  registerStats = {},
  onAddMore,
}: MyRegistersHubProps) {
  const firmInfo = FIRM_TYPES[firmType];
  const [statFilter, setStatFilter] = useState<StatFilter>("all");

  const enabledRegisterDetails = useMemo(() => {
    return REGISTER_DEFINITIONS.filter(
      (r) => r.isImplemented && enabledRegisters.includes(r.code)
    ).sort((a, b) => a.sortOrder - b.sortOrder);
  }, [enabledRegisters]);

  const filteredRegisterDetails = useMemo(() => {
    if (statFilter === "all") return enabledRegisterDetails;
    return enabledRegisterDetails.filter((reg) => {
      const stats = registerStats[reg.code];
      if (!stats) return false;
      if (statFilter === "has-records") return (stats.count || 0) > 0;
      if (statFilter === "pending") return (stats.pendingCount || 0) > 0;
      if (statFilter === "active") return (stats.activeCount || 0) > 0;
      return true;
    });
  }, [enabledRegisterDetails, registerStats, statFilter]);

  const registersByCategory = useMemo(() => {
    const categories: Record<RegisterCategory, typeof enabledRegisterDetails> = {
      aml: [],
      conduct: [],
      governance: [],
      market_abuse: [],
      operational: [],
    };

    filteredRegisterDetails.forEach((reg) => {
      categories[reg.category].push(reg);
    });

    return categories;
  }, [filteredRegisterDetails]);

  // Calculate overall stats
  const totalStats = useMemo(() => {
    let total = 0;
    let pending = 0;
    let active = 0;

    Object.values(registerStats).forEach((stat) => {
      total += stat.count || 0;
      pending += stat.pendingCount || 0;
      active += stat.activeCount || 0;
    });

    return { total, pending, active };
  }, [registerStats]);

  const handleStatFilter = (filter: StatFilter) => {
    if (filter === "all") {
      setStatFilter("all");
      return;
    }
    setStatFilter((prev) => (prev === filter ? "all" : filter));
  };

  const statFilterLabels: Record<StatFilter, string> = {
    all: "All Registers",
    "has-records": "Registers with Records",
    pending: "Pending Review",
    active: "Active Items",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Registers</h1>
          <p className="text-sm text-slate-500">
            Your active compliance registers for {firmInfo.label}
          </p>
        </div>
        <Button onClick={onAddMore} variant="outline">
          <Plus className="mr-2 h-4 w-4" />
          Add More Registers
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={statFilter === "all"}
          onClick={() => handleStatFilter("all")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleStatFilter("all");
            }
          }}
          className={cn(
            "cursor-pointer transition-all",
            statFilter === "all" ? "border-teal-500 ring-2 ring-teal-100" : "hover:border-teal-200"
          )}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
              <FileText className="h-5 w-5 text-slate-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{enabledRegisters.length}</p>
              <p className="text-xs text-slate-500">Active Registers</p>
            </div>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={statFilter === "has-records"}
          onClick={() => handleStatFilter("has-records")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleStatFilter("has-records");
            }
          }}
          className={cn(
            "cursor-pointer transition-all",
            statFilter === "has-records"
              ? "border-teal-500 ring-2 ring-teal-100"
              : "hover:border-teal-200"
          )}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <Database className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalStats.total}</p>
              <p className="text-xs text-slate-500">Total Records</p>
            </div>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={statFilter === "pending"}
          onClick={() => handleStatFilter("pending")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleStatFilter("pending");
            }
          }}
          className={cn(
            "cursor-pointer transition-all",
            statFilter === "pending" ? "border-teal-500 ring-2 ring-teal-100" : "hover:border-teal-200"
          )}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalStats.pending}</p>
              <p className="text-xs text-slate-500">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card
          role="button"
          tabIndex={0}
          aria-pressed={statFilter === "active"}
          onClick={() => handleStatFilter("active")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              handleStatFilter("active");
            }
          }}
          className={cn(
            "cursor-pointer transition-all",
            statFilter === "active" ? "border-teal-500 ring-2 ring-teal-100" : "hover:border-teal-200"
          )}
        >
          <CardContent className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{totalStats.active}</p>
              <p className="text-xs text-slate-500">Active Items</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {statFilter !== "all" && (
        <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-4 py-2">
          <span className="text-sm text-slate-700">
            Filtered by: <strong>{statFilterLabels[statFilter]}</strong>
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStatFilter("all")}
            className="h-6 text-slate-600 hover:text-slate-700"
          >
            Clear filter
          </Button>
        </div>
      )}

      {/* Register Grid by Category */}
      <div className="space-y-6">
        {(Object.keys(registersByCategory) as RegisterCategory[]).map((category) => {
          const registers = registersByCategory[category];
          if (registers.length === 0) return null;

          const categoryInfo = REGISTER_CATEGORIES[category];

          return (
            <div key={category} className="space-y-3">
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-slate-700">{categoryInfo.label}</h2>
                <Badge variant="secondary" className="text-xs">
                  {registers.length}
                </Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {registers.map((register) => {
                  const Icon = REGISTER_ICONS[register.code] || FileText;
                  const stats = registerStats[register.code];

                  return (
                    <Link key={register.code} href={register.href}>
                      <Card className="group h-full cursor-pointer transition-all hover:border-teal-200 hover:shadow-md">
                        <CardHeader className="pb-2">
                          <div className="flex items-start justify-between">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 transition-colors group-hover:bg-teal-100">
                              <Icon className="h-5 w-5 text-slate-600 transition-colors group-hover:text-teal-600" />
                            </div>
                            <ChevronRight className="h-5 w-5 text-slate-300 transition-all group-hover:translate-x-1 group-hover:text-teal-500" />
                          </div>
                          <CardTitle className="mt-3 text-base font-semibold text-slate-900">
                            {register.name}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-slate-500 line-clamp-2">
                            {register.shortDescription}
                          </p>

                          {stats && (
                            <div className="mt-3 flex items-center gap-3 text-xs">
                              <span className="text-slate-600">
                                {stats.count || 0} records
                              </span>
                              {stats.pendingCount && stats.pendingCount > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-amber-100 text-amber-700"
                                >
                                  {stats.pendingCount} pending
                                </Badge>
                              )}
                              {stats.activeCount && stats.activeCount > 0 && (
                                <Badge
                                  variant="secondary"
                                  className="bg-emerald-100 text-emerald-700"
                                >
                                  {stats.activeCount} active
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {enabledRegisters.length > 0 && filteredRegisterDetails.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-sm text-slate-500">No registers match this filter.</p>
            <Button
              variant="link"
              onClick={() => setStatFilter("all")}
              className="mt-2 text-teal-600"
            >
              Clear filter
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {enabledRegisters.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
              <FileText className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-slate-900">No registers enabled</h3>
            <p className="mt-1 text-sm text-slate-500">
              Add registers to start tracking your compliance requirements
            </p>
            <Button onClick={onAddMore} className="mt-4 bg-teal-600 hover:bg-teal-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Registers
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

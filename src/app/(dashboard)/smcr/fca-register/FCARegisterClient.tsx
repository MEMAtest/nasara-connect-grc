"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { FCALookup, type FCAPersonToAdd } from "@/components/fca-register/FCALookup";
import { useSmcrData } from "../context/SmcrDataContext";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export function FCARegisterClient() {
  const { addPerson, activeFirmId, state } = useSmcrData();
  const { toast } = useToast();
  const [recentlyAdded, setRecentlyAdded] = useState<Set<string>>(new Set());

  // Reset the added-counter when the active firm changes
  const prevFirmIdRef = useRef(activeFirmId);
  useEffect(() => {
    if (prevFirmIdRef.current !== activeFirmId) {
      setRecentlyAdded(new Set());
      prevFirmIdRef.current = activeFirmId;
    }
  }, [activeFirmId]);

  const handleAddPerson = useCallback(async (person: FCAPersonToAdd) => {
    if (!activeFirmId) {
      toast({
        title: "No firm selected",
        description: "Please select a firm in Governance & People before adding people.",
        variant: "destructive",
      });
      return;
    }

    // Dedup check scoped to the active firm
    const existing = state.people.find(
      (p) => p.irn === person.irn && p.firmId === activeFirmId
    );
    if (existing) {
      toast({
        title: "Person already exists",
        description: `${existing.name} (IRN: ${person.irn}) is already in your People list.`,
        variant: "warning",
      });
      return;
    }

    try {
      await addPerson({
        name: person.name,
        email: "",
        department: "",
        irn: person.irn,
      });

      setRecentlyAdded((prev) => new Set(prev).add(person.irn));

      toast({
        title: "Person added",
        description: `${person.name} has been added to People.`,
        variant: "success",
      });
    } catch (err) {
      toast({
        title: "Failed to add person",
        description: err instanceof Error ? err.message : "An error occurred.",
        variant: "destructive",
      });
    }
  }, [activeFirmId, addPerson, state.people, toast]);

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">FCA Register</h1>
        <p className="text-muted-foreground mt-1">
          Look up firms and individuals on the FCA Register to verify regulatory status, permissions, and approved persons.
        </p>
      </div>

      {!activeFirmId && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-900">No firm selected</p>
            <p className="text-sm text-amber-700 mt-0.5">
              Select a firm from the Governance & People dashboard to enable adding individuals to your People list.
            </p>
          </div>
        </div>
      )}

      {recentlyAdded.size > 0 && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 flex items-center gap-2">
          <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" />
          <p className="text-sm text-emerald-700">
            <span className="font-medium">{recentlyAdded.size}</span> {recentlyAdded.size === 1 ? "person" : "people"} added to your People list this session.
          </p>
          <Badge variant="outline" className="text-xs bg-emerald-100 text-emerald-700 border-emerald-300 ml-auto">
            Go to People to complete their profiles
          </Badge>
        </div>
      )}

      <FCALookup
        className="border border-slate-200"
        onAddPerson={activeFirmId ? handleAddPerson : undefined}
        addedIrns={recentlyAdded}
      />
    </div>
  );
}

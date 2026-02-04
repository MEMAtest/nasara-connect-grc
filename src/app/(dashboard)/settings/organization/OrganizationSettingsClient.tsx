"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useOrganization } from "@/components/organization-provider";

interface OrganizationState {
  id: string;
  name: string;
  domain: string;
  plan: string;
}

const defaultOrg: OrganizationState = {
  id: "",
  name: "",
  domain: "",
  plan: "starter",
};

export function OrganizationSettingsClient() {
  const { organizationId } = useOrganization();
  const [organization, setOrganization] = useState<OrganizationState>(defaultOrg);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`/api/organizations/${organizationId}`);
        if (!response.ok) {
          throw new Error("Failed to load organization settings");
        }
        const data = await response.json();
        if (isMounted) {
          setOrganization({
            id: data.id,
            name: data.name || "",
            domain: data.domain || "",
            plan: data.plan || "starter",
          });
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : "Failed to load organization");
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    if (organizationId) {
      void load();
    }
    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  const handleSave = async () => {
    setIsSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const response = await fetch(`/api/organizations/${organizationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: organization.name, plan: organization.plan }),
      });
      if (!response.ok) {
        throw new Error("Failed to update organization");
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update organization");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/settings" aria-label="Back to settings">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Organization</h1>
            <p className="text-muted-foreground">Manage organization profile and plan</p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          Save
        </Button>
      </div>

      {error ? (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Organization updated.
        </div>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>Basic information used across the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orgName">Organization name</Label>
            <Input
              id="orgName"
              value={organization.name}
              onChange={(event) => setOrganization((prev) => ({ ...prev, name: event.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="orgDomain">Domain</Label>
            <Input id="orgDomain" value={organization.domain} readOnly />
          </div>
          <div className="space-y-2">
            <Label>Plan</Label>
            <Select
              value={organization.plan}
              onValueChange={(value) => setOrganization((prev) => ({ ...prev, plan: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter</SelectItem>
                <SelectItem value="growth">Growth</SelectItem>
                <SelectItem value="enterprise">Enterprise</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { RegisterClient } from "./register/RegisterClient";
import { useOrganization } from "@/components/organization-provider";
import { usePolicyProfile } from "@/lib/policies";

export function PoliciesClient() {
  const router = useRouter();
  const { organizationId } = useOrganization();
  const { profile, isLoading, error } = usePolicyProfile({ organizationId });
  const firmName =
    typeof profile?.firmProfile?.name === "string" ? profile.firmProfile.name.trim() : "";

  useEffect(() => {
    if (isLoading || error) return;
    if (!firmName) {
      router.replace("/policies/quick-create");
    }
  }, [error, firmName, isLoading, router]);

  if (!firmName && !error) {
    return null;
  }

  return <RegisterClient />;
}

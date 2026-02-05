"use client";

import { useSession } from "next-auth/react";
import { useOrganization } from "@/components/organization-provider";
import { useMemo } from "react";

/**
 * Client hook that exposes the current user's role and derived permissions.
 *
 * Primary source: session.user.role (from JWT — instant, no fetch).
 * Secondary source: confirmedRole from /api/organization/context (corrects
 * stale JWT within the same session).
 */
export function useUserRole() {
  const { data: session } = useSession();
  const { confirmedRole } = useOrganization();

  // Prefer the confirmed role from the API (freshest), fall back to JWT
  const role = confirmedRole ?? session?.user?.role ?? "viewer";

  return useMemo(() => {
    const isOwner = role === "owner";
    const isAdmin = role === "owner" || role === "admin";
    const isUser = role === "member";
    const isRestricted = role === "viewer";

    return {
      /** Raw DB role value */
      role,
      /** True if owner (original firm creator) */
      isOwner,
      /** True if owner or admin — full platform access */
      isAdmin,
      /** True if standard member */
      isUser,
      /** True if viewer — read-only */
      isRestricted,
      /** Can create and edit content (admin or member) */
      canEdit: isAdmin || isUser,
      /** Can delete content (admin only) */
      canDelete: isAdmin,
      /** Can manage team: invite, remove, change roles */
      canManageTeam: isAdmin,
      /** Can approve submissions */
      canApprove: isAdmin,
    };
  }, [role]);
}

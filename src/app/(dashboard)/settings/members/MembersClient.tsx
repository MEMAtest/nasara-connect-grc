"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useOrganization } from "@/components/organization-provider";
import { useUserRole } from "@/hooks/use-user-role";
import {
  getRoleLabel,
  ASSIGNABLE_ROLES,
  ADMIN_ASSIGNABLE_ROLES,
} from "@/lib/role-labels";

type OrganizationRole = "owner" | "admin" | "member" | "viewer";

interface MemberRecord {
  id: string;
  user_id: string;
  role: OrganizationRole;
  user_email?: string;
  user_name?: string | null;
}

interface InviteRecord {
  id: string;
  email: string;
  role: OrganizationRole;
  expires_at?: string | null;
  accepted_at?: string | null;
  created_at?: string;
}

export function MembersClient() {
  const { organizationId, userEmail } = useOrganization();
  const { canManageTeam, isOwner } = useUserRole();
  const [members, setMembers] = useState<MemberRecord[]>([]);
  const [invites, setInvites] = useState<InviteRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<string>("member");
  const [status, setStatus] = useState<string | null>(null);
  const [isSubmittingInvite, setIsSubmittingInvite] = useState(false);

  // Owners can assign Admin; other admins can only assign User/Restricted
  const roleOptions = useMemo(
    () => (isOwner ? ADMIN_ASSIGNABLE_ROLES : ASSIGNABLE_ROLES),
    [isOwner],
  );

  const pendingInvites = useMemo(
    () => invites.filter((invite) => !invite.accepted_at),
    [invites]
  );

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      setIsLoading(true);
      try {
        const membersResponse = await fetch(`/api/organizations/${organizationId}/members`);
        if (membersResponse.ok) {
          const memberData = await membersResponse.json();
          if (isMounted) setMembers(memberData);
        }

        const invitesResponse = await fetch(`/api/organizations/${organizationId}/invites`);
        if (invitesResponse.ok) {
          const inviteData = await invitesResponse.json();
          if (isMounted) setInvites(inviteData);
        }
      } catch {
        if (isMounted) setStatus("Failed to load members.");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    if (organizationId) {
      void load();
    }
    return () => {
      isMounted = false;
    };
  }, [organizationId]);

  const handleInvite = async () => {
    setStatus(null);
    const email = inviteEmail.trim().toLowerCase();
    if (!email) {
      setStatus("Enter an email to invite.");
      return;
    }

    setIsSubmittingInvite(true);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/invites`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Invite failed");
      }
      const invite = await response.json();
      setInvites((prev) => [invite, ...prev]);
      setInviteEmail("");
      setInviteRole("member");
      setStatus("Invite sent.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Invite failed");
    } finally {
      setIsSubmittingInvite(false);
    }
  };

  const handleRoleChange = async (memberId: string, role: OrganizationRole) => {
    setStatus(null);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Update failed");
      }
      const updated = await response.json();
      setMembers((prev) => prev.map((member) => (member.id === memberId ? updated : member)));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Update failed");
    }
  };

  const handleRemove = async (memberId: string) => {
    setStatus(null);
    try {
      const response = await fetch(`/api/organizations/${organizationId}/members/${memberId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error?.error || "Remove failed");
      }
      setMembers((prev) => prev.filter((member) => member.id !== memberId));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Remove failed");
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
            <h1 className="text-3xl font-bold tracking-tight">Members</h1>
            <p className="text-muted-foreground">
              {canManageTeam
                ? "Invite and manage organization members"
                : "View your organization's members"}
            </p>
          </div>
        </div>
      </div>

      {status ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {status}
        </div>
      ) : null}

      {/* Invite section — only visible to admins */}
      {canManageTeam ? (
        <Card>
          <CardHeader>
            <CardTitle>Invite member</CardTitle>
            <CardDescription>Send an invite to join your organization</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 space-y-2">
              <Label htmlFor="inviteEmail">Email</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                placeholder="name@company.com"
                onChange={(event) => setInviteEmail(event.target.value)}
              />
            </div>
            <div className="w-full md:w-48 space-y-2">
              <Label>Role</Label>
              <Select value={inviteRole} onValueChange={setInviteRole}>
                <SelectTrigger>
                  <SelectValue placeholder="Role" />
                </SelectTrigger>
                <SelectContent>
                  {roleOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleInvite} disabled={isSubmittingInvite} className="md:self-end">
              {isSubmittingInvite ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Plus className="mr-2 h-4 w-4" />
              )}
              Send Invite
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Current members</CardTitle>
          <CardDescription>Roles determine access across the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {members.map((member) => {
            const isSelf = userEmail != null && member.user_email === userEmail;
            const isMemberOwner = member.role === "owner";
            // Show actions only if: admin, not self, and not an owner row
            const showActions = canManageTeam && !isSelf && !isMemberOwner;

            return (
              <div
                key={member.id}
                className="flex flex-col gap-3 rounded-lg border border-slate-200 px-4 py-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium">
                    {member.user_name || member.user_email}
                    {isSelf ? (
                      <span className="text-xs text-slate-400">(You)</span>
                    ) : null}
                  </div>
                  <div className="text-xs text-slate-500">{member.user_email}</div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  {isMemberOwner ? (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800">
                      Owner
                    </Badge>
                  ) : showActions ? (
                    <>
                      <Select
                        value={member.role}
                        onValueChange={(value) => handleRoleChange(member.id, value as OrganizationRole)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue>
                            {getRoleLabel(member.role)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {roleOptions.map((opt) => (
                            <SelectItem key={opt.value} value={opt.value}>
                              {opt.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" onClick={() => handleRemove(member.id)}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    </>
                  ) : (
                    <Badge variant="secondary">{getRoleLabel(member.role)}</Badge>
                  )}
                </div>
              </div>
            );
          })}
          {!members.length ? (
            <div className="text-sm text-slate-500">No members found.</div>
          ) : null}
        </CardContent>
      </Card>

      {/* Pending invites — visible to all but actions only for admins */}
      <Card>
        <CardHeader>
          <CardTitle>Pending invites</CardTitle>
          <CardDescription>Invites awaiting acceptance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {pendingInvites.map((invite) => (
            <div
              key={invite.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 px-4 py-3"
            >
              <div>
                <div className="text-sm font-medium">{invite.email}</div>
                <div className="text-xs text-slate-500">
                  Expires {invite.expires_at ? new Date(invite.expires_at).toLocaleDateString() : "\u2014"}
                </div>
              </div>
              <Badge variant="secondary">{getRoleLabel(invite.role)}</Badge>
            </div>
          ))}
          {!pendingInvites.length ? (
            <div className="text-sm text-slate-500">No pending invites.</div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}

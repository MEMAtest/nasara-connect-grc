"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";

interface InviteData {
  id: string;
  organizationName: string;
  organizationId: string;
  role: string;
  expiresAt: string | null;
  acceptedAt: string | null;
  email: string;
  emailMatch: boolean;
}

type PageState = "loading" | "not-found" | "expired" | "already-accepted" | "email-mismatch" | "ready" | "accepting" | "accepted" | "error";

export default function InviteAcceptPage() {
  const { inviteId } = useParams<{ inviteId: string }>();
  const { status } = useSession();
  const router = useRouter();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [pageState, setPageState] = useState<PageState>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.replace(`/auth/login?callbackUrl=/invites/${inviteId}`);
      return;
    }

    if (status !== "authenticated") return;

    async function fetchInvite() {
      try {
        const res = await fetch(`/api/invites/${inviteId}`);
        if (res.status === 404) {
          setPageState("not-found");
          return;
        }
        if (!res.ok) {
          setPageState("error");
          setErrorMessage("Failed to load invitation details.");
          return;
        }
        const data: InviteData = await res.json();
        setInvite(data);

        if (data.acceptedAt) {
          setPageState("already-accepted");
        } else if (data.expiresAt && new Date(data.expiresAt).getTime() < Date.now()) {
          setPageState("expired");
        } else if (!data.emailMatch) {
          setPageState("email-mismatch");
        } else {
          setPageState("ready");
        }
      } catch {
        setPageState("error");
        setErrorMessage("Something went wrong. Please try again.");
      }
    }

    void fetchInvite();
  }, [status, inviteId, router]);

  const handleAccept = useCallback(async () => {
    if (!invite) return;
    setPageState("accepting");

    try {
      const res = await fetch(`/api/organizations/${invite.organizationId}/invites/${invite.id}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setPageState("error");
        setErrorMessage(data?.error || "Failed to accept invitation.");
        return;
      }

      // Set active org cookie via switch API
      await fetch("/api/user/switch-organization", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationId: invite.organizationId }),
      });

      setPageState("accepted");
      // Full reload to pick up new org in JWT
      window.location.href = "/authorization-pack";
    } catch {
      setPageState("error");
      setErrorMessage("Something went wrong. Please try again.");
    }
  }, [invite]);

  return (
    <div className="w-full max-w-md rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Organization Invitation</h1>
        <p className="mt-1 text-sm text-gray-500">Nasara Connect</p>
      </div>

      {pageState === "loading" && (
        <div className="flex items-center gap-3 py-8 text-gray-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-teal-600" />
          <span className="text-sm">Loading invitation...</span>
        </div>
      )}

      {pageState === "not-found" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Invitation not found</p>
          <p className="mt-1 text-sm text-red-600">This invitation may have been revoked or the link is invalid.</p>
        </div>
      )}

      {pageState === "expired" && invite && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Invitation expired</p>
          <p className="mt-1 text-sm text-amber-600">
            This invitation to join <strong>{invite.organizationName}</strong> has expired. Please ask your administrator to send a new one.
          </p>
        </div>
      )}

      {pageState === "already-accepted" && invite && (
        <div className="space-y-4">
          <div className="rounded-md border border-blue-200 bg-blue-50 p-4">
            <p className="text-sm font-medium text-blue-800">Already accepted</p>
            <p className="mt-1 text-sm text-blue-600">
              This invitation to <strong>{invite.organizationName}</strong> has already been accepted.
            </p>
          </div>
          <button
            onClick={() => { window.location.href = "/authorization-pack"; }}
            className="w-full rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
          >
            Go to Dashboard
          </button>
        </div>
      )}

      {pageState === "email-mismatch" && invite && (
        <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
          <p className="text-sm font-medium text-amber-800">Email mismatch</p>
          <p className="mt-1 text-sm text-amber-600">
            This invitation was sent to <strong>{invite.email}</strong>. Please sign in with that email address to accept it.
          </p>
        </div>
      )}

      {(pageState === "ready" || pageState === "accepting") && invite && (
        <div className="space-y-4">
          <div className="rounded-md border border-gray-200 bg-gray-50 p-4">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-gray-500">Organization</dt>
                <dd className="font-medium text-gray-900">{invite.organizationName}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Role</dt>
                <dd className="font-medium text-gray-900 capitalize">{invite.role}</dd>
              </div>
              {invite.expiresAt && (
                <div className="flex justify-between">
                  <dt className="text-gray-500">Expires</dt>
                  <dd className="text-gray-700">
                    {new Date(invite.expiresAt).toLocaleDateString("en-GB", {
                      day: "numeric", month: "short", year: "numeric",
                    })}
                  </dd>
                </div>
              )}
            </dl>
          </div>
          <button
            onClick={handleAccept}
            disabled={pageState === "accepting"}
            className="w-full rounded-md bg-teal-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {pageState === "accepting" ? "Accepting..." : "Accept Invitation"}
          </button>
        </div>
      )}

      {pageState === "accepted" && (
        <div className="rounded-md border border-green-200 bg-green-50 p-4">
          <p className="text-sm font-medium text-green-800">Invitation accepted!</p>
          <p className="mt-1 text-sm text-green-600">Redirecting to your dashboard...</p>
        </div>
      )}

      {pageState === "error" && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm font-medium text-red-800">Error</p>
          <p className="mt-1 text-sm text-red-600">{errorMessage}</p>
        </div>
      )}
    </div>
  );
}

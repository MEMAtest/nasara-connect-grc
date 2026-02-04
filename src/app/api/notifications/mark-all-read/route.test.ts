import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { markAllNotificationsRead } from "@/lib/server/notifications-store";
import { requireRole } from "@/lib/rbac";

vi.mock("@/lib/rbac", () => ({
  requireRole: vi.fn(),
}));

vi.mock("@/lib/server/notifications-store", () => ({
  markAllNotificationsRead: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  serverErrorResponse: vi.fn((message?: string) => new Response(JSON.stringify({ error: message ?? "" }), { status: 500 })),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

describe("Mark all read route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks notifications for the authenticated org", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      auth: { authenticated: true, userId: "user-1", userEmail: "user@example.com", userName: "User 1", organizationId: "org-abc" },
      error: undefined,
    });
    vi.mocked(markAllNotificationsRead).mockResolvedValue({ count: 2 });

    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/notifications/mark-all-read?organizationId=evil-org", {
      method: "POST",
    });
    const res = await POST(req as unknown as NextRequest);

    expect(markAllNotificationsRead).toHaveBeenCalledWith({
      organizationIds: ["org-abc"],
      userId: "user-1",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 2 });
  });
});

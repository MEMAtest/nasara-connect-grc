import { beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { createNotification, listNotifications } from "@/lib/server/notifications-store";
import { requireRole } from "@/lib/rbac";

vi.mock("@/lib/rbac", () => ({
  requireRole: vi.fn(),
}));

vi.mock("@/lib/server/notifications-store", () => ({
  listNotifications: vi.fn(),
  createNotification: vi.fn(),
}));

vi.mock("@/lib/api-auth", () => ({
  badRequestResponse: vi.fn((message: string) => new Response(JSON.stringify({ error: message }), { status: 400 })),
  serverErrorResponse: vi.fn((message?: string) => new Response(JSON.stringify({ error: message ?? "" }), { status: 500 })),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

describe("Notifications route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the authenticated org for GET requests", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      auth: { authenticated: true, userId: "user-1", userEmail: "user@example.com", userName: "User 1", organizationId: "org-abc" },
      error: undefined,
    });
    vi.mocked(listNotifications).mockResolvedValue({ notifications: [], unreadCount: 0 });

    const { GET } = await import("./route");

    const req = new Request(
      "http://localhost/api/notifications?organizationId=evil-org&limit=5&offset=1&unreadOnly=true"
    );
    const res = await GET(req as unknown as NextRequest);

    expect(listNotifications).toHaveBeenCalledWith({
      organizationIds: ["org-abc"],
      userId: "user-1",
      limit: 5,
      offset: 1,
      unreadOnly: true,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ notifications: [], unreadCount: 0 });
  });

  it("rejects manual notification creation on POST requests", async () => {
    vi.mocked(requireRole).mockResolvedValue({
      auth: { authenticated: true, userId: "user-1", userEmail: "user@example.com", userName: "User 1", organizationId: "org-123" },
      error: undefined,
    });

    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "Test notification",
        message: "hello",
        link: "https://example.com/bad",
        severity: "success",
      }),
    });

    const res = await POST(req as unknown as NextRequest);

    expect(createNotification).not.toHaveBeenCalled();
    expect(res.status).toBe(403);
    expect(await res.json()).toEqual({ error: "Manual notifications are disabled." });
  });
});

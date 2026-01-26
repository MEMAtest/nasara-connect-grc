import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { createNotification, listNotifications } from "@/lib/server/notifications-store";
import { requireAuth } from "@/lib/auth-utils";

vi.mock("@/lib/auth-utils", () => ({
  requireAuth: vi.fn(),
  DEFAULT_ORG_ID: "00000000-0000-0000-0000-000000000001",
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

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

describe("Notifications route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses the authenticated org for GET requests", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      auth: { userId: "user-1", userEmail: "user@example.com", organizationId: "default-org" },
      error: null,
    });
    vi.mocked(listNotifications).mockResolvedValue({ notifications: [], unreadCount: 0 });

    const { GET } = await import("./route");

    const req = new Request(
      "http://localhost/api/notifications?organizationId=evil-org&limit=5&offset=1&unreadOnly=true"
    );
    const res = await GET(req);

    expect(listNotifications).toHaveBeenCalledWith({
      organizationIds: ["default-org", DEFAULT_ORGANIZATION_ID, DEFAULT_ORG_ID],
      userId: "user-1",
      limit: 5,
      offset: 1,
      unreadOnly: true,
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ notifications: [], unreadCount: 0 });
  });

  it("drops external links on POST requests", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      auth: { userId: "user-1", userEmail: "user@example.com", organizationId: "org-123" },
      error: null,
    });
    vi.mocked(createNotification).mockResolvedValue({
      id: "note-1",
      organizationId: "org-123",
      userId: null,
      source: "custom",
      title: "Test notification",
      message: "hello",
      link: null,
      severity: "success",
      metadata: { actor: "user@example.com" },
      createdAt: new Date().toISOString(),
      readAt: null,
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

    const res = await POST(req);

    expect(createNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        organizationId: "org-123",
        title: "Test notification",
        link: null,
        severity: "success",
        source: "custom",
        metadata: { actor: "user@example.com" },
      })
    );
    expect(res.status).toBe(201);
  });
});

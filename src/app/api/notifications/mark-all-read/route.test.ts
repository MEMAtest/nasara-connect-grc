import { beforeEach, describe, expect, it, vi } from "vitest";
import { DEFAULT_ORGANIZATION_ID } from "@/lib/constants";
import { markAllNotificationsRead } from "@/lib/server/notifications-store";
import { requireAuth } from "@/lib/auth-utils";

vi.mock("@/lib/auth-utils", () => ({
  requireAuth: vi.fn(),
  DEFAULT_ORG_ID: "00000000-0000-0000-0000-000000000001",
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

const DEFAULT_ORG_ID = "00000000-0000-0000-0000-000000000001";

describe("Mark all read route", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("marks notifications for the authenticated org", async () => {
    vi.mocked(requireAuth).mockResolvedValue({
      auth: { userId: "user-1", userEmail: "user@example.com", organizationId: "default-org" },
      error: null,
    });
    vi.mocked(markAllNotificationsRead).mockResolvedValue({ count: 2 });

    const { POST } = await import("./route");

    const req = new Request("http://localhost/api/notifications/mark-all-read?organizationId=evil-org", {
      method: "POST",
    });
    const res = await POST(req);

    expect(markAllNotificationsRead).toHaveBeenCalledWith({
      organizationIds: ["default-org", DEFAULT_ORGANIZATION_ID, DEFAULT_ORG_ID],
      userId: "user-1",
    });
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ count: 2 });
  });
});

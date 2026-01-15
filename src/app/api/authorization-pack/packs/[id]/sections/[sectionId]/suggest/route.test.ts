import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";

const originalFetch = global.fetch;
const originalEnvKey = process.env.OPENROUTER_API_KEY;

// Mock all dependencies before importing the route
vi.mock("@/lib/auth-utils", () => ({
  requireAuth: vi.fn().mockResolvedValue({
    auth: { userId: "test-user", organizationId: "test-org" },
    error: null,
  }),
  isValidUUID: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/database", () => ({
  initDatabase: vi.fn().mockResolvedValue(undefined),
  getAuthorizationPack: vi.fn().mockResolvedValue({
    id: "00000000-0000-0000-0000-000000000001",
    name: "Test Pack",
    organization_id: "test-org",
    assessment_data: {
      basics: {
        legalName: "Test Firm Ltd",
        firmStage: "established",
        regulatedActivities: "payment-services",
        headcount: 15,
        primaryJurisdiction: "UK",
      },
    },
  }),
  getPackSection: vi.fn().mockResolvedValue({
    id: "00000000-0000-0000-0000-000000000002",
    pack_id: "00000000-0000-0000-0000-000000000001",
    template: {
      name: "Business Plan",
      guidance_text: "Describe your business model.",
    },
  }),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

// Helper to create streaming response mock
function createStreamingMock(content: string) {
  const encoder = new TextEncoder();
  const chunks = [
    `data: ${JSON.stringify({ choices: [{ delta: { content: content.slice(0, 20) } }] })}\n\n`,
    `data: ${JSON.stringify({ choices: [{ delta: { content: content.slice(20) } }] })}\n\n`,
    "data: [DONE]\n\n",
  ];

  let index = 0;
  return {
    ok: true,
    body: {
      getReader: () => ({
        read: async () => {
          if (index >= chunks.length) {
            return { done: true, value: undefined };
          }
          const chunk = chunks[index++];
          return { done: false, value: encoder.encode(chunk) };
        },
      }),
    },
  } as unknown as Response;
}

describe("Suggest route", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = originalEnvKey;
    vi.clearAllMocks();
  });

  it("calls OpenRouter API and returns response", async () => {
    const { POST } = await import("./route");

    const narrativeContent = "Test Firm Ltd is an established payment services firm...";
    global.fetch = vi.fn().mockResolvedValue(createStreamingMock(narrativeContent));

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/suggest", {
      method: "POST",
      body: JSON.stringify({
        promptKey: "business-model",
        promptTitle: "Business Model",
        promptGuidance: "Describe how the firm generates revenue",
        mode: "generate",
      }),
    });

    const res = await POST(req, {
      params: Promise.resolve({
        id: "00000000-0000-0000-0000-000000000001",
        sectionId: "00000000-0000-0000-0000-000000000002",
      }),
    });

    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledOnce();
  });

  it("returns 500 when API key is missing", async () => {
    const { POST } = await import("./route");
    delete process.env.OPENROUTER_API_KEY;

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/suggest", {
      method: "POST",
      body: JSON.stringify({
        promptKey: "business-model",
        promptTitle: "Business Model",
        promptGuidance: "Describe",
      }),
    });

    const res = await POST(req, {
      params: Promise.resolve({
        id: "00000000-0000-0000-0000-000000000001",
        sectionId: "00000000-0000-0000-0000-000000000002",
      }),
    });
    expect(res.status).toBe(500);

    const body = await res.json();
    expect(body.error).toContain("not configured");
  });

  it("returns 502 when AI service fails", async () => {
    const { POST } = await import("./route");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("Service unavailable"),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/suggest", {
      method: "POST",
      body: JSON.stringify({
        promptKey: "test",
        promptTitle: "Test",
        promptGuidance: "Test",
      }),
    });

    const res = await POST(req, {
      params: Promise.resolve({
        id: "00000000-0000-0000-0000-000000000001",
        sectionId: "00000000-0000-0000-0000-000000000002",
      }),
    });
    expect(res.status).toBe(502);

    const body = await res.json();
    expect(body.error).toContain("unavailable");
  });

  it("sends request with streaming enabled", async () => {
    const { POST } = await import("./route");

    const narrativeContent = "Enhanced version of the narrative...";
    global.fetch = vi.fn().mockResolvedValue(createStreamingMock(narrativeContent));

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/suggest", {
      method: "POST",
      body: JSON.stringify({
        promptKey: "business-model",
        promptTitle: "Business Model",
        promptGuidance: "Describe",
        existingContent: "We are a payment services company.",
        mode: "enhance",
      }),
    });

    const res = await POST(req, {
      params: Promise.resolve({
        id: "00000000-0000-0000-0000-000000000001",
        sectionId: "00000000-0000-0000-0000-000000000002",
      }),
    });

    expect(res.status).toBe(200);

    // Verify streaming was requested
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.stream).toBe(true);
  });

  it("builds system prompt with firm context", async () => {
    const { POST } = await import("./route");

    const narrativeContent = "Test content...";
    global.fetch = vi.fn().mockResolvedValue(createStreamingMock(narrativeContent));

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/suggest", {
      method: "POST",
      body: JSON.stringify({
        promptKey: "staffing",
        promptTitle: "Staffing",
        promptGuidance: "Describe staffing",
        mode: "generate",
      }),
    });

    const res = await POST(req, {
      params: Promise.resolve({
        id: "00000000-0000-0000-0000-000000000001",
        sectionId: "00000000-0000-0000-0000-000000000002",
      }),
    });

    expect(res.status).toBe(200);

    // Verify the system prompt was built
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.messages[0].role).toBe("system");
    expect(requestBody.messages[0].content).toContain("FCA");
  });
});

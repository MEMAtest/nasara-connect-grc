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

vi.mock("@/lib/authorization-pack-db", () => ({
  getAuthorizationProject: vi.fn().mockResolvedValue({
    id: "00000000-0000-0000-0000-000000000001",
    name: "Test Project",
    organization_id: "test-org",
  }),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

describe("Analyze route", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = originalEnvKey;
    vi.clearAllMocks();
  });

  it("calls OpenRouter API with correct structure", async () => {
    const { POST } = await import("./route");

    const mockAnalysis = {
      readiness: {
        businessPlanDraft: { suggested: "partial", reason: "Early stage", priority: "high" },
        financialModel: { suggested: "missing", reason: "No data", priority: "high" },
        technologyStack: { suggested: "missing", reason: "Needs docs", priority: "medium" },
        safeguardingSetup: { suggested: "missing", reason: "Critical", priority: "high" },
        amlFramework: { suggested: "missing", reason: "Mandatory", priority: "high" },
        riskFramework: { suggested: "missing", reason: "Required", priority: "medium" },
        governancePack: { suggested: "missing", reason: "Needed", priority: "medium" },
      },
      priorities: ["A", "B", "C"],
      risks: ["Risk1"],
      recommendations: ["Do this"],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
      }),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/projects/00000000-0000-0000-0000-000000000001/analyze", {
      method: "POST",
      body: JSON.stringify({
        basics: {
          legalName: "Test Firm Ltd",
          firmStage: "startup",
        },
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });

    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledOnce();

    // Verify the API was called with correct structure
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    expect(requestBody.messages[0].role).toBe("system");
    expect(requestBody.stream).toBe(false);
  });

  it("returns fallback analysis when API key is missing", async () => {
    const { POST } = await import("./route");
    delete process.env.OPENROUTER_API_KEY;

    const req = new Request("http://localhost/api/authorization-pack/projects/00000000-0000-0000-0000-000000000001/analyze", {
      method: "POST",
      body: JSON.stringify({ basics: { legalName: "Test" } }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.warning).toContain("baseline");
    expect(body.analysis).toBeTruthy();
  });

  it("returns fallback analysis when AI service fails", async () => {
    const { POST } = await import("./route");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("Service unavailable"),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/projects/00000000-0000-0000-0000-000000000001/analyze", {
      method: "POST",
      body: JSON.stringify({ basics: { legalName: "Test" } }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });
    expect(res.status).toBe(200);

    const body = await res.json();
    expect(body.warning).toContain("baseline");
    expect(body.analysis).toBeTruthy();
  });

  it("includes firm details in the prompt", async () => {
    const { POST } = await import("./route");

    const mockAnalysis = {
      readiness: {
        businessPlanDraft: { suggested: "partial", reason: "test", priority: "high" },
        financialModel: { suggested: "missing", reason: "test", priority: "high" },
        technologyStack: { suggested: "missing", reason: "test", priority: "medium" },
        safeguardingSetup: { suggested: "missing", reason: "test", priority: "high" },
        amlFramework: { suggested: "missing", reason: "test", priority: "high" },
        riskFramework: { suggested: "missing", reason: "test", priority: "medium" },
        governancePack: { suggested: "missing", reason: "test", priority: "medium" },
      },
      priorities: [],
      risks: [],
      recommendations: [],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockAnalysis) } }],
      }),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/projects/00000000-0000-0000-0000-000000000001/analyze", {
      method: "POST",
      body: JSON.stringify({
        basics: {
          legalName: "Acme Finance Ltd",
          firmStage: "growth",
          regulatedActivities: "investment-advice",
        },
      }),
    });

    const res = await POST(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });

    expect(res.status).toBe(200);

    // Verify the prompt includes the firm details
    const fetchCall = (global.fetch as ReturnType<typeof vi.fn>).mock.calls[0];
    const requestBody = JSON.parse(fetchCall[1].body);
    const userPrompt = requestBody.messages[1].content;
    expect(userPrompt).toContain("Acme Finance Ltd");
    expect(userPrompt).toContain("growth");
  });
});

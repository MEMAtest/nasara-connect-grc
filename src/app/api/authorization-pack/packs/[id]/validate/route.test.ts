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
  getPack: vi.fn().mockResolvedValue({
    id: "00000000-0000-0000-0000-000000000001",
    name: "Test Pack",
    organization_id: "test-org",
  }),
  getFullPackSectionsWithResponses: vi.fn().mockResolvedValue([
    {
      sectionKey: "business-plan",
      title: "Business Plan",
      description: "Test",
      displayOrder: 1,
      prompts: [
        { key: "bp-1", title: "Prompt", guidance: null, weight: 1, response: "<p>Test narrative content</p>" },
      ],
      evidence: [],
      narrativeCompletion: 75,
      evidenceCompletion: 0,
    },
    {
      sectionKey: "financial-model",
      title: "Financial Model",
      description: "Test",
      displayOrder: 2,
      prompts: [],
      evidence: [],
      narrativeCompletion: 0,
      evidenceCompletion: 0,
    },
  ]),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

describe("Validate route", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = originalEnvKey;
    vi.clearAllMocks();
  });

  it("returns validation result when AI succeeds", async () => {
    const { POST } = await import("./route");

    const mockValidation = {
      score: 75,
      issues: [
        {
          section: "Financial Model",
          type: "incomplete",
          description: "Section has no content",
          severity: "error",
        },
      ],
      ready: false,
      summary: "Pack needs additional work before submission.",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockValidation) } }],
      }),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/validate", {
      method: "POST",
    });

    const res = await POST(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.score).toBe(75);
    expect(body.issues).toHaveLength(1);
    expect(body.ready).toBe(false);
  });

  it("returns 500 when API key is missing", async () => {
    const { POST } = await import("./route");
    delete process.env.OPENROUTER_API_KEY;

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/validate", {
      method: "POST",
    });

    const res = await POST(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });
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

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/validate", {
      method: "POST",
    });

    const res = await POST(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });
    expect(res.status).toBe(502);

    const body = await res.json();
    expect(body.error).toContain("unavailable");
  });

  it("handles AI response wrapped in markdown code blocks", async () => {
    const { POST } = await import("./route");

    const mockValidation = {
      score: 90,
      issues: [],
      ready: true,
      summary: "Pack is ready for submission.",
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "```json\n" + JSON.stringify(mockValidation) + "\n```" } }],
      }),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/validate", {
      method: "POST",
    });

    const res = await POST(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.score).toBe(90);
    expect(body.ready).toBe(true);
  });

  it("returns fallback response when AI returns unparseable JSON", async () => {
    const { POST } = await import("./route");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "This is not valid JSON at all" } }],
      }),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/validate", {
      method: "POST",
    });

    const res = await POST(req, { params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }) });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.score).toBeDefined();
    expect(body.warning).toContain("could not be parsed");
  });
});

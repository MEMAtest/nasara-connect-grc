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
  getSectionWorkspace: vi.fn().mockResolvedValue({
    section: {
      id: "00000000-0000-0000-0000-000000000002",
      title: "Business Plan",
      description: "Describe your business model and regulatory compliance approach.",
    },
    prompts: [],
    evidence: [],
    tasks: [],
    reviewGates: [],
  }),
  listEvidence: vi.fn().mockResolvedValue([
    {
      id: "ev-1",
      name: "Business plan draft v1.pdf",
      status: "uploaded",
      description: "Initial business plan document",
      section_instance_id: "00000000-0000-0000-0000-000000000002",
    },
  ]),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

describe("Evidence gaps route", () => {
  beforeEach(() => {
    process.env.OPENROUTER_API_KEY = "test-key";
  });

  afterEach(() => {
    global.fetch = originalFetch;
    process.env.OPENROUTER_API_KEY = originalEnvKey;
    vi.clearAllMocks();
  });

  it("returns evidence gaps when AI succeeds", async () => {
    const { GET } = await import("./route");

    const mockGaps = {
      gaps: [
        {
          description: "Financial projections document",
          priority: "high",
          regulatoryBasis: "FCA requires 3-year financial forecasts",
          suggestedFormat: "Excel",
        },
        {
          description: "Organizational chart",
          priority: "medium",
          regulatoryBasis: "Governance structure documentation",
          suggestedFormat: "PDF",
        },
      ],
      completeness: 40,
      suggestions: ["Add financial projections", "Include governance structure diagram"],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: JSON.stringify(mockGaps) } }],
      }),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/evidence-gaps", {
      method: "GET",
    });

    const res = await GET(req, {
      params: Promise.resolve({
        id: "00000000-0000-0000-0000-000000000001",
        sectionId: "00000000-0000-0000-0000-000000000002",
      }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.gaps).toHaveLength(2);
    expect(body.completeness).toBe(40);
    expect(body.gaps[0].priority).toBe("high");
  });

  it("returns 500 when API key is missing", async () => {
    const { GET } = await import("./route");
    delete process.env.OPENROUTER_API_KEY;

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/evidence-gaps", {
      method: "GET",
    });

    const res = await GET(req, {
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
    const { GET } = await import("./route");

    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      text: vi.fn().mockResolvedValue("Service unavailable"),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/evidence-gaps", {
      method: "GET",
    });

    const res = await GET(req, {
      params: Promise.resolve({
        id: "00000000-0000-0000-0000-000000000001",
        sectionId: "00000000-0000-0000-0000-000000000002",
      }),
    });
    expect(res.status).toBe(502);

    const body = await res.json();
    expect(body.error).toContain("unavailable");
  });

  it("handles AI response wrapped in markdown code blocks", async () => {
    const { GET } = await import("./route");

    const mockGaps = {
      gaps: [],
      completeness: 100,
      suggestions: ["All required evidence is present"],
    };

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "```json\n" + JSON.stringify(mockGaps) + "\n```" } }],
      }),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/evidence-gaps", {
      method: "GET",
    });

    const res = await GET(req, {
      params: Promise.resolve({
        id: "00000000-0000-0000-0000-000000000001",
        sectionId: "00000000-0000-0000-0000-000000000002",
      }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.completeness).toBe(100);
    expect(body.gaps).toHaveLength(0);
  });

  it("returns fallback response when AI returns unparseable JSON", async () => {
    const { GET } = await import("./route");

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: vi.fn().mockResolvedValue({
        choices: [{ message: { content: "Unable to analyze evidence gaps" } }],
      }),
    } as unknown as Response);

    const req = new Request("http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/sections/00000000-0000-0000-0000-000000000002/evidence-gaps", {
      method: "GET",
    });

    const res = await GET(req, {
      params: Promise.resolve({
        id: "00000000-0000-0000-0000-000000000001",
        sectionId: "00000000-0000-0000-0000-000000000002",
      }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.gaps).toBeDefined();
    expect(body.warning).toContain("could not be parsed");
  });
});

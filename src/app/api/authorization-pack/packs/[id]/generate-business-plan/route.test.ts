import { beforeEach, afterEach, describe, expect, it, vi } from "vitest";
import type { ProfileQuestion } from "@/lib/business-plan-profile";

const mkdir = vi.fn().mockResolvedValue(undefined);
const writeFile = vi.fn().mockResolvedValue(undefined);
const unlink = vi.fn().mockResolvedValue(undefined);

const createProjectDocument = vi.fn().mockResolvedValue({ id: "project-doc-id" });
const createPackDocument = vi.fn().mockResolvedValue({ id: "pack-doc-id" });

vi.mock("fs", () => ({
  promises: {
    mkdir,
    writeFile,
    unlink,
  },
}));

vi.mock("@/lib/auth-utils", () => ({
  requireAuth: vi.fn().mockResolvedValue({
    auth: { userId: "test-user", organizationId: "test-org" },
    error: null,
  }),
  isValidUUID: vi.fn().mockReturnValue(true),
}));

vi.mock("@/lib/database", () => ({
  initDatabase: vi.fn(),
  createProjectDocument,
  deleteProjectDocument: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/authorization-pack-db", () => ({
  getPack: vi.fn().mockResolvedValue({
    id: "00000000-0000-0000-0000-000000000001",
    name: "Test Pack",
    organization_id: "test-org",
  }),
  getProjectByPackId: vi.fn().mockResolvedValue({
    id: "project-id",
    name: "Test Project",
    permissionCode: "payments",
    permissionName: "Payment Services",
    assessmentData: {
      basics: { legalName: "Test Firm Ltd" },
      businessPlanProfile: {
        responses: {
          "core-regulated-activities": "Payment initiation services",
          "core-perimeter-clarity": "documented",
          "payments-products": "Digital wallets",
          "core-customer-segments": ["retail"],
          "ops-stack": "AWS",
          "gov-oversight": "Board oversight",
          "fin-runway": "12 months",
        },
      },
    },
  }),
  createPackDocument,
  deletePackDocument: vi.fn().mockResolvedValue(true),
}));

vi.mock("@/lib/business-plan-profile", () => {
  const questions: ProfileQuestion[] = [
    {
      id: "core-regulated-activities",
      sectionId: "scope",
      prompt: "Activities",
      description: "Scope",
      type: "text",
    },
    {
      id: "core-perimeter-clarity",
      sectionId: "scope",
      prompt: "Out of scope",
      description: "Exclusions",
      type: "single-choice",
      options: [{ value: "documented", label: "Yes", score: 3 }],
    },
    {
      id: "payments-products",
      sectionId: "payments",
      prompt: "Payments products",
      description: "Products",
      type: "text",
    },
    {
      id: "core-customer-segments",
      sectionId: "model",
      prompt: "Customer segments",
      description: "Segments",
      type: "multi-choice",
      options: [{ value: "retail", label: "Retail", score: 2 }],
    },
    {
      id: "ops-stack",
      sectionId: "operations",
      prompt: "Tech stack",
      description: "Operations",
      type: "text",
    },
    {
      id: "gov-oversight",
      sectionId: "governance",
      prompt: "Governance",
      description: "Oversight",
      type: "text",
    },
    {
      id: "fin-runway",
      sectionId: "financials",
      prompt: "Runway",
      description: "Financials",
      type: "text",
    },
  ];

  return {
    buildProfileInsights: vi.fn().mockReturnValue({
      completionPercent: 80,
      sectionScores: [],
      packSectionScores: [],
      regulatorySignals: [{ label: "PERG 2", count: 3 }],
      activityHighlights: ["Payment initiation services"],
      perimeterOpinion: {
        verdict: "in-scope",
        summary: "Activities are in scope.",
        rationale: ["Provides payment services"],
        obligations: ["Safeguarding"],
      },
      focusAreas: ["Document outsourcing arrangements"],
    }),
    getProfileQuestions: vi.fn().mockReturnValue(questions),
    isProfilePermissionCode: vi.fn().mockReturnValue(true),
  };
});

vi.mock("@/lib/perimeter-opinion-pdf-builder", () => ({
  buildPerimeterOpinionPack: vi.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
}));

describe("Generate opinion pack route", () => {
  beforeEach(() => {
    delete process.env.OPENROUTER_API_KEY;
    delete process.env.BLOB_READ_WRITE_TOKEN;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("stores the PDF and creates document records", async () => {
    const { POST } = await import("./route");

    const req = new Request(
      "http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/generate-business-plan",
      { method: "POST" }
    );

    const res = await POST(req, {
      params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }),
    });

    expect(res.status).toBe(200);
    expect(writeFile).toHaveBeenCalledOnce();
    expect(createProjectDocument).toHaveBeenCalledOnce();
    expect(createPackDocument).toHaveBeenCalledOnce();

    const projectArgs = createProjectDocument.mock.calls[0][0];
    const packArgs = createPackDocument.mock.calls[0][0];

    expect(projectArgs.storage_key).toBe(packArgs.storageKey);
    expect(projectArgs.mime_type).toBe("application/pdf");
    expect(packArgs.mimeType).toBe("application/pdf");
  });
});

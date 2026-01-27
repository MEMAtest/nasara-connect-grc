import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ProfileQuestion, ProfileSection } from "@/lib/business-plan-profile";
import { getPack, getPackDocuments, getProjectByPackId } from "@/lib/authorization-pack-db";
import { getProfileQuestions, getProfileSections, isProfilePermissionCode } from "@/lib/business-plan-profile";
import { isValidUUID, requireAuth } from "@/lib/auth-utils";

vi.mock("@/lib/auth-utils", () => ({
  requireAuth: vi.fn(),
  isValidUUID: vi.fn(),
}));

vi.mock("@/lib/authorization-pack-db", () => ({
  getPack: vi.fn(),
  getProjectByPackId: vi.fn(),
  getPackDocuments: vi.fn(),
}));

vi.mock("@/lib/business-plan-profile", () => ({
  getProfileQuestions: vi.fn(),
  getProfileSections: vi.fn(),
  isProfilePermissionCode: vi.fn(),
}));

vi.mock("@/lib/logger", () => ({
  logError: vi.fn(),
}));

const sections: ProfileSection[] = [
  { id: "scope", title: "Scope", description: "Scope details" },
  { id: "model", title: "Model", description: "Model details" },
];

const questions: ProfileQuestion[] = [
  {
    id: "q1",
    sectionId: "scope",
    prompt: "Scope question",
    type: "text",
    required: true,
    label: "Scope question",
  } as ProfileQuestion,
  {
    id: "q2",
    sectionId: "model",
    prompt: "Model question",
    type: "boolean",
    required: true,
    label: "Model question",
  } as ProfileQuestion,
];

describe("Validate route", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(requireAuth).mockResolvedValue({
      auth: { userId: "test-user", organizationId: "test-org" },
      error: null,
    });
    vi.mocked(isValidUUID).mockReturnValue(true);
    vi.mocked(getPack).mockResolvedValue({
      id: "00000000-0000-0000-0000-000000000001",
      name: "Test Pack",
      organization_id: "test-org",
    });
    vi.mocked(getProjectByPackId).mockResolvedValue({
      id: "project-1",
      name: "Test Project",
      permissionCode: "payments",
      permissionName: "Payments",
      assessmentData: { businessPlanProfile: { responses: {} } },
    });
    vi.mocked(getPackDocuments).mockResolvedValue([]);
    vi.mocked(getProfileSections).mockReturnValue(sections);
    vi.mocked(getProfileQuestions).mockReturnValue(questions);
    vi.mocked(isProfilePermissionCode).mockReturnValue(true);
  });

  it("returns ready response when required answers present and opinion pack exists", async () => {
    vi.mocked(getProjectByPackId).mockResolvedValue({
      id: "project-1",
      name: "Test Project",
      permissionCode: "payments",
      permissionName: "Payments",
      assessmentData: {
        businessPlanProfile: {
          responses: { q1: "Yes", q2: true },
        },
      },
    });
    vi.mocked(getPackDocuments).mockResolvedValue([
      { section_code: "perimeter-opinion", storage_key: "file.pdf" },
    ]);

    const { POST } = await import("./route");
    const req = new Request(
      "http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/validate",
      { method: "POST" }
    );

    const res = await POST(req, {
      params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ready).toBe(true);
    expect(body.score).toBe(100);
    expect(body.issues).toHaveLength(0);
    expect(body.summary).toContain("Profile completion: 100%");
    expect(body.summary).toContain("Opinion pack: generated");
  });

  it("returns issues when required answers or opinion pack are missing", async () => {
    vi.mocked(getProjectByPackId).mockResolvedValue({
      id: "project-1",
      name: "Test Project",
      permissionCode: "payments",
      permissionName: "Payments",
      assessmentData: {
        businessPlanProfile: {
          responses: { q1: "Yes" },
        },
      },
    });
    vi.mocked(getPackDocuments).mockResolvedValue([]);

    const { POST } = await import("./route");
    const req = new Request(
      "http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/validate",
      { method: "POST" }
    );

    const res = await POST(req, {
      params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }),
    });
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ready).toBe(false);
    expect(body.score).toBe(25);
    expect(body.issues).toHaveLength(2);
    expect(body.summary).toContain("Profile completion: 50%");
    expect(body.summary).toContain("Opinion pack: missing");
  });

  it("returns 400 for invalid pack IDs", async () => {
    vi.mocked(isValidUUID).mockReturnValue(false);
    const { POST } = await import("./route");
    const req = new Request(
      "http://localhost/api/authorization-pack/packs/not-a-uuid/validate",
      { method: "POST" }
    );

    const res = await POST(req, { params: Promise.resolve({ id: "not-a-uuid" }) });
    const body = await res.json();

    expect(res.status).toBe(400);
    expect(body.error).toContain("Invalid pack ID");
  });

  it("returns 404 when pack cannot be found", async () => {
    vi.mocked(getPack).mockResolvedValue(null);
    const { POST } = await import("./route");
    const req = new Request(
      "http://localhost/api/authorization-pack/packs/00000000-0000-0000-0000-000000000001/validate",
      { method: "POST" }
    );

    const res = await POST(req, {
      params: Promise.resolve({ id: "00000000-0000-0000-0000-000000000001" }),
    });
    const body = await res.json();

    expect(res.status).toBe(404);
    expect(body.error).toContain("Pack not found");
  });
});

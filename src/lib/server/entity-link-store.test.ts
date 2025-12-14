import { describe, expect, it, beforeEach } from "vitest";

process.env.USE_IN_MEMORY_LINKS = "1";

import {
  deleteEntityLink,
  getLinkCountsForPolicies,
  listBackLinks,
  listEntityLinks,
  upsertEntityLink,
} from "./entity-link-store";

describe("entity-link-store (in-memory)", () => {
  const organizationId = "ORG-1";

  beforeEach(async () => {
    // No explicit reset API; use unique ids per test.
  });

  it("upserts and lists links", async () => {
    await upsertEntityLink({
      organizationId,
      fromType: "policy",
      fromId: "P-1",
      toType: "risk",
      toId: "R-1",
      metadata: { title: "Policy A", riskId: "RA-1" },
    });

    const links = await listEntityLinks({ organizationId, fromType: "policy", fromId: "P-1" });
    expect(links).toHaveLength(1);
    expect(links[0].toType).toBe("risk");
    expect(links[0].toId).toBe("R-1");
    expect(links[0].metadata.title).toBe("Policy A");
  });

  it("lists backlinks", async () => {
    await upsertEntityLink({
      organizationId,
      fromType: "policy",
      fromId: "P-2",
      toType: "control",
      toId: "CMP-001",
      metadata: { title: "Policy B" },
    });

    const backlinks = await listBackLinks({ organizationId, toType: "control", toId: "CMP-001" });
    expect(backlinks.map((link) => link.fromId)).toContain("P-2");
  });

  it("computes link counts for policies", async () => {
    await upsertEntityLink({
      organizationId,
      fromType: "policy",
      fromId: "P-3",
      toType: "risk",
      toId: "R-3",
    });
    await upsertEntityLink({
      organizationId,
      fromType: "policy",
      fromId: "P-3",
      toType: "control",
      toId: "CMP-003",
    });
    await upsertEntityLink({
      organizationId,
      fromType: "policy",
      fromId: "P-3",
      toType: "training",
      toId: "aml-fundamentals",
    });

    const counts = await getLinkCountsForPolicies({ organizationId, policyIds: ["P-3"] });
    expect(counts["P-3"].risk).toBe(1);
    expect(counts["P-3"].control).toBe(1);
    expect(counts["P-3"].training).toBe(1);
  });

  it("deletes links", async () => {
    await upsertEntityLink({
      organizationId,
      fromType: "policy",
      fromId: "P-4",
      toType: "evidence",
      toId: "E-1",
      metadata: { title: "Minutes" },
    });

    const deleted = await deleteEntityLink({
      organizationId,
      fromType: "policy",
      fromId: "P-4",
      toType: "evidence",
      toId: "E-1",
    });
    expect(deleted).toBe(true);

    const links = await listEntityLinks({ organizationId, fromType: "policy", fromId: "P-4" });
    expect(links).toHaveLength(0);
  });
});


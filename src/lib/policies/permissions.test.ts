import { describe, expect, it } from "vitest";
import { DEFAULT_PERMISSIONS, FirmPermissions, getRequiredPolicies } from "./permissions";

describe("getRequiredPolicies", () => {
  it("includes the seven core policies by default", () => {
    const policies = getRequiredPolicies(DEFAULT_PERMISSIONS);
    const codes = policies.map((policy) => policy.code);
    expect(codes).toContain("RISK_MGMT");
    expect(codes).toContain("AML_CTF");
    expect(policies).toHaveLength(7);
  });

  it("adds payment and e-money requirements", () => {
    const permissions: FirmPermissions = {
      ...DEFAULT_PERMISSIONS,
      paymentServices: true,
    };
    const policies = getRequiredPolicies(permissions);
    const codes = policies.map((policy) => policy.code);
    expect(codes).toContain("SAFEGUARDING");
    expect(codes).toContain("OP_SEC_RISK");
  });

  it("adds retail client policies", () => {
    const permissions: FirmPermissions = {
      ...DEFAULT_PERMISSIONS,
      retailClients: true,
    };
    const codes = getRequiredPolicies(permissions).map((policy) => policy.code);
    expect(codes).toEqual(
      expect.arrayContaining(["CONSUMER_DUTY", "VULNERABLE_CUST", "COMPLAINTS", "FIN_PROMOTIONS"]),
    );
  });

  it("only includes mandatory core policies when no flags set", () => {
    const policies = getRequiredPolicies(DEFAULT_PERMISSIONS);
    const mandatoryCount = policies.filter((policy) => policy.mandatory).length;
    expect(mandatoryCount).toBe(policies.length);
  });
});

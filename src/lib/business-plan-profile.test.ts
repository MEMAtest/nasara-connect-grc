import { describe, expect, it } from "vitest";
import { buildProfileInsights, getProfileQuestions } from "./business-plan-profile";

describe("business plan profile", () => {
  it("filters questions by permission", () => {
    const paymentsIds = getProfileQuestions("payments").map((question) => question.id);
    const creditIds = getProfileQuestions("consumer-credit").map((question) => question.id);
    const investmentIds = getProfileQuestions("investments").map((question) => question.id);

    expect(paymentsIds).toContain("pay-services");
    expect(paymentsIds).not.toContain("cc-activities");
    expect(creditIds).toContain("cc-activities");
    expect(creditIds).not.toContain("inv-activities");
    expect(investmentIds).toContain("inv-activities");
    expect(investmentIds).not.toContain("pay-services");
  });

  it("builds payments perimeter opinion with PSD2 obligations", () => {
    const responses = {
      "pay-services": ["money-remittance"],
      "pay-emoney": "no",
    };

    const insights = buildProfileInsights("payments", responses);

    expect(insights.perimeterOpinion.verdict).toBe("in-scope");
    expect(insights.perimeterOpinion.obligations).toContain(
      "Strong customer authentication and secure communications (PSD2 RTS)"
    );
  });

  it("builds consumer credit perimeter opinion with CONC references", () => {
    const responses = {
      "cc-activities": ["lending"],
    };

    const insights = buildProfileInsights("consumer-credit", responses);

    expect(insights.perimeterOpinion.verdict).toBe("in-scope");
    expect(insights.perimeterOpinion.obligations.some((item) => item.includes("CONC 5"))).toBe(true);
  });

  it("builds investment perimeter opinion with COBS references", () => {
    const responses = {
      "inv-activities": ["advice"],
    };

    const insights = buildProfileInsights("investments", responses);

    expect(insights.perimeterOpinion.verdict).toBe("in-scope");
    expect(insights.perimeterOpinion.obligations.some((item) => item.includes("COBS 11.2A"))).toBe(true);
  });
});

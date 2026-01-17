import { describe, expect, it } from "vitest";
import { PDFDocument } from "pdf-lib";
import {
  buildPerimeterOpinionPack,
  type OpinionSection,
} from "./perimeter-opinion-pdf-builder";

describe("buildPerimeterOpinionPack", () => {
  it("builds a multi-page opinion pack PDF", async () => {
    const sections: OpinionSection[] = [
      {
        key: "summary",
        title: "Perimeter Opinion Summary",
        description: "Summary section",
        inputs: [],
        synthesizedContent: "**Opinion summary**\nA concise overview.",
      },
      {
        key: "scope",
        title: "Regulated Activities and Permissions",
        description: "Scope section",
        inputs: [],
        synthesizedContent: "**Scope**\n- Payments\n- E-money",
      },
      {
        key: "model",
        title: "Business Model, Operations and Governance",
        description: "Model section",
        inputs: [],
        synthesizedContent: "**Operations**\nCustomer onboarding and controls.",
      },
      {
        key: "financials",
        title: "Financials, Wind-Down and Next Steps",
        description: "Financials section",
        inputs: [],
        synthesizedContent: "**Financials**\nRunway and wind-down planning.",
      },
    ];

    const pdfBytes = await buildPerimeterOpinionPack(
      {
        packName: "Test Pack",
        permissionLabel: "Payments",
        profileCompletion: 82,
        opinion: {
          verdict: "in-scope",
          summary: "Activities are in scope.",
          rationale: ["Payment initiation services"],
          obligations: ["Safeguarding", "Capital requirements"],
        },
        regulatorySignals: [{ label: "PERG 2", count: 3 }],
        activityHighlights: ["Payment initiation"],
        firmBasics: { legalName: "Test Firm Ltd" },
      },
      sections
    );

    const pdfDoc = await PDFDocument.load(pdfBytes);
    expect(pdfDoc.getPageCount()).toBeGreaterThanOrEqual(6);
  });
});

import { describe, expect, it } from "vitest";
import { buildNarrativeBlocks, htmlToText } from "./authorization-pack-export";

describe("authorization pack export helpers", () => {
  it("converts HTML to readable text", () => {
    const input = "<p>Hello<br/>World</p><ul><li>First</li><li>Second</li></ul>";
    const output = htmlToText(input);

    expect(output).toBe("Hello\nWorld\n- First\n- Second");
  });

  it("builds narrative blocks with fallbacks", () => {
    const rows = [
      {
        section_title: "Business Model",
        prompt_title: "Describe your target market",
        response_value: "<p>Retail clients</p><p>UK focus</p>",
      },
      {
        section_title: "Business Model",
        prompt_title: "Explain your distribution",
        response_value: null,
      },
      {
        section_title: "Governance",
        prompt_title: "Outline board structure",
        response_value: "<li>Executive chair</li><li>Independent NED</li>",
      },
    ];

    const blocks = buildNarrativeBlocks("Payments Pack", rows);

    expect(blocks).toEqual([
      { type: "title", text: "Payments Pack" },
      { type: "section", text: "Business Model" },
      { type: "prompt", text: "Describe your target market" },
      { type: "text", text: "Retail clients" },
      { type: "text", text: "UK focus" },
      { type: "prompt", text: "Explain your distribution" },
      { type: "text", text: "No response yet." },
      { type: "section", text: "Governance" },
      { type: "prompt", text: "Outline board structure" },
      { type: "text", text: "- Executive chair" },
      { type: "text", text: "- Independent NED" },
    ]);
  });
});

export type NarrativeBlockType = "title" | "section" | "prompt" | "text";

export interface NarrativeBlock {
  type: NarrativeBlockType;
  text: string;
}

const htmlReplacements: Array<[RegExp, string]> = [
  [/<br\s*\/?>/gi, "\n"],
  [/<\/p>/gi, "\n"],
  [/<\/li>/gi, "\n"],
  [/<li>/gi, "- "],
  [/<\/h[1-6]>/gi, "\n"],
];

export function htmlToText(input: string | null | undefined) {
  if (!input) return "";
  let output = input;
  for (const [pattern, value] of htmlReplacements) {
    output = output.replace(pattern, value);
  }
  output = output.replace(/<[^>]+>/g, "");
  output = output
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'");
  output = output.replace(/\n{3,}/g, "\n\n");
  return output.trim();
}

export function buildNarrativeBlocks(
  packName: string,
  rows: Array<{ section_title: string; prompt_title: string; response_value: string | null }>
) {
  const blocks: NarrativeBlock[] = [{ type: "title", text: packName }];
  let currentSection = "";

  for (const row of rows) {
    if (row.section_title && row.section_title !== currentSection) {
      currentSection = row.section_title;
      blocks.push({ type: "section", text: currentSection });
    }

    if (row.prompt_title) {
      blocks.push({ type: "prompt", text: row.prompt_title });
    }

    const responseText = htmlToText(row.response_value);
    if (!responseText) {
      blocks.push({ type: "text", text: "No response yet." });
      continue;
    }

    responseText.split("\n").forEach((line) => {
      blocks.push({ type: "text", text: line });
    });
  }

  return blocks;
}

export function extractSectionTitles(rows: Array<{ section_title: string }>) {
  const titles: string[] = [];
  const seen = new Set<string>();
  for (const row of rows) {
    if (!row.section_title) continue;
    if (seen.has(row.section_title)) continue;
    seen.add(row.section_title);
    titles.push(row.section_title);
  }
  return titles;
}

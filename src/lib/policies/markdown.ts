import { marked } from "marked";

marked.setOptions({
  gfm: true,
  breaks: true,
});

export function normalizePolicyMarkdown(value: string): string {
  if (!value) return "";
  let output = value.replace(/\r\n/g, "\n");

  // Ensure list markers start on their own block for consistent rendering.
  output = output.replace(/([^\n])\n([*-]\s+)/g, "$1\n\n$2");
  output = output.replace(/([^\n])\n(\d+\.\s+)/g, "$1\n\n$2");

  // Ensure tables are separated from paragraphs.
  output = output.replace(/([^\n])\n(\|.+\|)/g, "$1\n\n$2");
  output = output.replace(/(\|.+\|)\n([^\n|])/g, "$1\n\n$2");

  // Normalise common bullet glyphs to markdown dashes.
  output = output.replace(/^\u2022\s+/gm, "- ");

  return output.trim();
}

export function renderPolicyMarkdown(value: string, options?: { normalize?: boolean }): string {
  if (!value) return "";
  const input = options?.normalize === false ? value : normalizePolicyMarkdown(value);
  return marked.parse(input, { async: false }) as string;
}

/**
 * DOCX Document Generator
 * Converts policy clauses to branded DOCX format
 */

import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Table,
  TableRow,
  TableCell,
  WidthType,
  convertInchesToTwip,
} from 'docx';
import type { FirmBranding } from '../policies/types';

// =====================================================
// TYPES
// =====================================================

export interface DocumentGenerationOptions {
  policyTitle: string;
  policyVersion: string;
  firmName: string;
  branding: FirmBranding;
  clauses: Array<{
    title: string;
    code: string;
    rendered_body: string;
    is_mandatory: boolean;
  }>;
  metadata?: {
    generated_by?: string;
    generated_at?: string;
    approved_by?: string;
    approved_at?: string;
    effective_date?: string;
  };
  watermark?: boolean;
}

interface ParsedContent {
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'code' | 'blockquote';
  level?: number; // For headings
  text?: string;
  items?: string[]; // For lists
  ordered?: boolean; // For lists
  style?: 'bold' | 'italic' | 'code';
}

// =====================================================
// MARKDOWN PARSER
// =====================================================

/**
 * Parse Markdown to structured content for DOCX generation
 */
export function parseMarkdownToStructure(markdown: string): ParsedContent[] {
  const content: ParsedContent[] = [];
  const lines = markdown.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

    // Skip empty lines
    if (!line.trim()) {
      i++;
      continue;
    }

    // Headings
    if (line.startsWith('#')) {
      const match = line.match(/^(#{1,6})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const text = match[2];
        content.push({ type: 'heading', level, text });
        i++;
        continue;
      }
    }

    // Unordered lists
    if (line.match(/^[\*\-]\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^[\*\-]\s+/)) {
        items.push(lines[i].replace(/^[\*\-]\s+/, ''));
        i++;
      }
      content.push({ type: 'list', items, ordered: false });
      continue;
    }

    // Ordered lists
    if (line.match(/^\d+\.\s+/)) {
      const items: string[] = [];
      while (i < lines.length && lines[i].match(/^\d+\.\s+/)) {
        items.push(lines[i].replace(/^\d+\.\s+/, ''));
        i++;
      }
      content.push({ type: 'list', items, ordered: true });
      continue;
    }

    // Blockquote
    if (line.startsWith('>')) {
      const text = line.replace(/^>\s*/, '');
      content.push({ type: 'blockquote', text });
      i++;
      continue;
    }

    // Regular paragraph
    content.push({ type: 'paragraph', text: line });
    i++;
  }

  return content;
}

/**
 * Parse inline formatting (bold, italic, code)
 */
export function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let current = '';
  let i = 0;

  while (i < text.length) {
    // Bold **text**
    if (text.substring(i, i + 2) === '**') {
      if (current) {
        runs.push(new TextRun({ text: current }));
        current = '';
      }
      i += 2;
      let boldText = '';
      while (i < text.length && text.substring(i, i + 2) !== '**') {
        boldText += text[i];
        i++;
      }
      if (boldText) {
        runs.push(new TextRun({ text: boldText, bold: true }));
      }
      i += 2;
      continue;
    }

    // Italic *text*
    if (text[i] === '*' && (i === 0 || text[i - 1] !== '*')) {
      if (current) {
        runs.push(new TextRun({ text: current }));
        current = '';
      }
      i++;
      let italicText = '';
      while (i < text.length && text[i] !== '*') {
        italicText += text[i];
        i++;
      }
      if (italicText) {
        runs.push(new TextRun({ text: italicText, italics: true }));
      }
      i++;
      continue;
    }

    // Code `text`
    if (text[i] === '`') {
      if (current) {
        runs.push(new TextRun({ text: current }));
        current = '';
      }
      i++;
      let codeText = '';
      while (i < text.length && text[i] !== '`') {
        codeText += text[i];
        i++;
      }
      if (codeText) {
        runs.push(
          new TextRun({
            text: codeText,
            font: 'Courier New',
            color: '666666',
          })
        );
      }
      i++;
      continue;
    }

    // Regular character
    current += text[i];
    i++;
  }

  if (current) {
    runs.push(new TextRun({ text: current }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

// =====================================================
// DOCX GENERATION
// =====================================================

/**
 * Generate DOCX document from clauses
 */
export function generateDocx(options: DocumentGenerationOptions): Document {
  const { policyTitle, policyVersion, firmName, branding, clauses, metadata, watermark } =
    options;
  const primaryHex = branding?.primary_color ?? '#4F46E5';
  const normalizedPrimaryColor =
    primaryHex.replace('#', '').trim().toUpperCase() || '4F46E5';
  const documentFont = branding?.font ?? 'Calibri';

  const sections: Array<Paragraph | Table> = [];

  // Title Page
  sections.push(
    new Paragraph({
      text: firmName,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      text: policyTitle,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      text: `Version ${policyVersion}`,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Metadata table
  if (metadata) {
    const metadataRows: TableRow[] = [];

    if (metadata.generated_at) {
      metadataRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Generated:', bold: true })],
              width: { size: 30, type: WidthType.PERCENTAGE },
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: new Date(metadata.generated_at).toLocaleDateString(),
                }),
              ],
            }),
          ],
        })
      );
    }

    if (metadata.effective_date) {
      metadataRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Effective Date:', bold: true })],
            }),
            new TableCell({
              children: [
                new Paragraph({
                  text: new Date(metadata.effective_date).toLocaleDateString(),
                }),
              ],
            }),
          ],
        })
      );
    }

    if (metadata.approved_by) {
      metadataRows.push(
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ text: 'Approved By:', bold: true })],
            }),
            new TableCell({
              children: [new Paragraph({ text: metadata.approved_by })],
            }),
          ],
        })
      );
    }

    if (metadataRows.length > 0) {
      sections.push(
        new Table({
          rows: metadataRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
          margins: {
            top: convertInchesToTwip(0.1),
            bottom: convertInchesToTwip(0.1),
            left: convertInchesToTwip(0.1),
            right: convertInchesToTwip(0.1),
          },
        })
      );
      sections.push(
        new Paragraph({
          text: '',
          spacing: { after: 400 },
        })
      );
    }
  }

  // Watermark for drafts
  if (watermark) {
    sections.push(
      new Paragraph({
        text: '⚠️ DRAFT - NOT FOR DISTRIBUTION',
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
        border: {
          top: { color: 'FF0000', space: 1, style: BorderStyle.SINGLE, size: 6 },
          bottom: { color: 'FF0000', space: 1, style: BorderStyle.SINGLE, size: 6 },
        },
      }),
      new Paragraph({
        text: '',
        spacing: { after: 200 },
      })
    );
  }

  // Table of Contents placeholder
  sections.push(
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
    })
  );

  clauses.forEach((clause, index) => {
    sections.push(
      new Paragraph({
        text: `${index + 1}. ${clause.title}`,
        spacing: { after: 100 },
      })
    );
  });

  sections.push(
    new Paragraph({
      text: '',
      spacing: { after: 400 },
    })
  );

  // Page break before content
  sections.push(
    new Paragraph({
      text: '',
      pageBreakBefore: true,
    })
  );

  // Clauses
  clauses.forEach((clause, clauseIndex) => {
    // Clause title
    sections.push(
      new Paragraph({
        text: `${clauseIndex + 1}. ${clause.title}`,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    // Clause code (metadata)
    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: `Code: ${clause.code}`,
            color: '666666',
            size: 18,
          }),
        ],
        spacing: { after: 200 },
      })
    );

    // Mandatory badge
    if (clause.is_mandatory) {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: '⚠️ MANDATORY',
              bold: true,
              color: 'FF0000',
            }),
          ],
          spacing: { after: 200 },
        })
      );
    }

    // Parse and render clause body
    const parsedContent = parseMarkdownToStructure(clause.rendered_body);

    parsedContent.forEach((item) => {
      switch (item.type) {
        case 'heading':
          sections.push(
            new Paragraph({
              text: item.text || '',
              heading:
                item.level === 2
                  ? HeadingLevel.HEADING_2
                  : item.level === 3
                    ? HeadingLevel.HEADING_3
                    : HeadingLevel.HEADING_4,
              spacing: { before: 200, after: 100 },
            })
          );
          break;

        case 'paragraph':
          if (item.text) {
            sections.push(
              new Paragraph({
                children: parseInlineFormatting(item.text),
                spacing: { after: 100 },
              })
            );
          }
          break;

        case 'list':
          if (item.items) {
            item.items.forEach((listItem) => {
              sections.push(
                new Paragraph({
                  children: parseInlineFormatting(listItem),
                  bullet: item.ordered
                    ? { level: 0 }
                    : { level: 0 },
                  spacing: { after: 50 },
                })
              );
            });
          }
          break;

        case 'blockquote':
          if (item.text) {
            sections.push(
              new Paragraph({
                children: parseInlineFormatting(item.text),
                spacing: { after: 100 },
                indent: { left: convertInchesToTwip(0.5) },
                border: {
                  left: {
                    color: normalizedPrimaryColor,
                    space: 1,
                    style: BorderStyle.SINGLE,
                    size: 12,
                  },
                },
              })
            );
          }
          break;
      }
    });

    // Spacing after clause
    sections.push(
      new Paragraph({
        text: '',
        spacing: { after: 400 },
      })
    );
  });

  // Footer section
  sections.push(
    new Paragraph({
      text: '',
      pageBreakBefore: true,
    }),
    new Paragraph({
      text: 'End of Document',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 400, after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: `Generated by ${firmName}`,
          color: '666666',
        }),
      ],
      alignment: AlignmentType.CENTER,
    })
  );

  // Create document
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(1),
              right: convertInchesToTwip(1),
              bottom: convertInchesToTwip(1),
              left: convertInchesToTwip(1),
            },
          },
        },
        children: sections,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: documentFont,
            size: 22, // 11pt
          },
          paragraph: {
            spacing: {
              line: 276, // 1.15 line spacing
              before: 0,
              after: 160,
            },
          },
        },
      },
      paragraphStyles: [
        {
          id: 'Heading1',
          name: 'Heading 1',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            color: normalizedPrimaryColor,
            size: 32, // 16pt
            bold: true,
          },
          paragraph: {
            spacing: { before: 480, after: 240 },
          },
        },
        {
          id: 'Heading2',
          name: 'Heading 2',
          basedOn: 'Normal',
          next: 'Normal',
          run: {
            color: normalizedPrimaryColor,
            size: 28, // 14pt
            bold: true,
          },
          paragraph: {
            spacing: { before: 360, after: 180 },
          },
        },
      ],
    },
  });

  return doc;
}

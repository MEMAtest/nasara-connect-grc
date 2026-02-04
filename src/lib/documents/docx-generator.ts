/**
 * Professional DOCX Document Generator
 * Creates FCA-standard policy documents with proper structure
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
  PageBreak,
  Header,
  Footer,
  PageNumber,
} from 'docx';
import type { FirmBranding } from '../policies/types';
import { sanitizeClauseContent, DEFAULT_SANITIZE_OPTIONS } from '../policies/content-sanitizer';

// =====================================================
// TYPES
// =====================================================

export interface PolicySection {
  id: string;
  title: string;
  sectionType: 'policy' | 'procedure' | 'appendix';
  clauses: Array<{
    title: string;
    code: string;
    rendered_body: string;
    is_mandatory: boolean;
  }>;
  customNotes?: string;
}

export interface DocumentGenerationOptions {
  policyTitle: string;
  policyVersion: string;
  firmName: string;
  branding: FirmBranding;
  sections: PolicySection[];
  metadata?: {
    generated_by?: string;
    generated_at?: string;
    approved_by?: string;
    approved_at?: string;
    effective_date?: string;
    next_review_date?: string;
    owner?: string;
    classification?: string;
  };
  watermark?: boolean;
  versionHistory?: Array<{
    version: string;
    date: string;
    author: string;
    changes: string;
  }>;
}

// Legacy interface for backward compatibility
export interface LegacyDocumentGenerationOptions {
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
    classification?: string;
  };
  watermark?: boolean;
}

interface ParsedContent {
  type: 'paragraph' | 'heading' | 'list' | 'table' | 'code' | 'blockquote';
  level?: number;
  text?: string;
  items?: string[];
  ordered?: boolean;
  style?: 'bold' | 'italic' | 'code';
}

// =====================================================
// CONSTANTS
// =====================================================

const MARGINS = {
  top: convertInchesToTwip(1),
  right: convertInchesToTwip(1),
  bottom: convertInchesToTwip(1),
  left: convertInchesToTwip(1.25), // Slightly wider left margin for binding
};

const COLORS = {
  primary: '4F46E5',
  secondary: '6366F1',
  text: '1F2937',
  muted: '6B7280',
  border: 'E5E7EB',
  warning: 'F59E0B',
  error: 'EF4444',
};

const NOTE_SANITIZE_OPTIONS = {
  ...DEFAULT_SANITIZE_OPTIONS,
  convertBulletsToProseText: false,
  preserveProceduralLists: false,
};

const POLICY_SANITIZE_OPTIONS = {
  ...DEFAULT_SANITIZE_OPTIONS,
  preserveProceduralLists: false,
};

// =====================================================
// MARKDOWN PARSER
// =====================================================

export function parseMarkdownToStructure(markdown: string): ParsedContent[] {
  const content: ParsedContent[] = [];
  const lines = markdown.split('\n');

  let i = 0;
  while (i < lines.length) {
    const line = lines[i];

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

export function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  let current = '';
  let i = 0;

  while (i < text.length) {
    // Bold **text**
    if (text.substring(i, i + 2) === '**') {
      if (current) {
        // Don't set bold at all for normal text - omitting the property is cleaner
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
            color: COLORS.muted,
          })
        );
      }
      i++;
      continue;
    }

    current += text[i];
    i++;
  }

  if (current) {
    runs.push(new TextRun({ text: current }));
  }

  return runs.length > 0 ? runs : [new TextRun({ text })];
}

// =====================================================
// DOCUMENT COMPONENTS
// =====================================================

function createCoverPage(
  firmName: string,
  policyTitle: string,
  policyVersion: string,
  effectiveDate: string | undefined,
  classification: string | undefined,
  primaryColor: string
): Paragraph[] {
  return [
    // Spacer
    new Paragraph({ text: '', spacing: { after: 2400 } }),

    // Firm name
    new Paragraph({
      children: [
        new TextRun({
          text: firmName.toUpperCase(),
          bold: true,
          size: 28,
          color: COLORS.muted,
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),

    // Policy title
    new Paragraph({
      children: [
        new TextRun({
          text: policyTitle,
          bold: true,
          size: 56,
          color: primaryColor,
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    // Version
    new Paragraph({
      children: [
        new TextRun({
          text: `Version ${policyVersion}`,
          size: 24,
          color: COLORS.muted,
          font: 'Calibri',
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),

    // Effective date
    ...(effectiveDate ? [
      new Paragraph({
        children: [
          new TextRun({
            text: `Effective: ${new Date(effectiveDate).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })}`,
            size: 22,
            color: COLORS.muted,
            font: 'Calibri',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { after: 800 },
      }),
    ] : []),

    // Classification badge
    ...(classification ? [
      new Paragraph({
        children: [
          new TextRun({
            text: classification.toUpperCase(),
            bold: true,
            size: 20,
            color: COLORS.warning,
            font: 'Calibri',
          }),
        ],
        alignment: AlignmentType.CENTER,
        border: {
          top: { color: COLORS.warning, space: 8, style: BorderStyle.SINGLE, size: 8 },
          bottom: { color: COLORS.warning, space: 8, style: BorderStyle.SINGLE, size: 8 },
          left: { color: COLORS.warning, space: 8, style: BorderStyle.SINGLE, size: 8 },
          right: { color: COLORS.warning, space: 8, style: BorderStyle.SINGLE, size: 8 },
        },
        spacing: { after: 400 },
      }),
    ] : []),

    // Spacer before page break
    new Paragraph({ text: '', spacing: { after: 2400 } }),
  ];
}

function createDocumentControlSection(
  metadata: DocumentGenerationOptions['metadata'],
  versionHistory: DocumentGenerationOptions['versionHistory'],
  primaryColor: string
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];

  // Section heading
  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Document Control',
          bold: true,
          size: 32,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 },
    })
  );

  // Metadata table - using fixed column widths in DXA (twentieths of a point)
  // Total width ~9360 DXA (6.5 inches at 1440 DXA per inch)
  const LABEL_COL_WIDTH = 2800; // ~30% of page width
  const VALUE_COL_WIDTH = 6560; // ~70% of page width

  const metadataRows: TableRow[] = [];

  const addMetadataRow = (label: string, value: string) => {
    metadataRows.push(
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: label, bold: true, size: 22 })]
            })],
            width: { size: LABEL_COL_WIDTH, type: WidthType.DXA },
            shading: { fill: 'F9FAFB' },
            margins: {
              top: convertInchesToTwip(0.08),
              bottom: convertInchesToTwip(0.08),
              left: convertInchesToTwip(0.1),
              right: convertInchesToTwip(0.1),
            },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: value, size: 22 })]
            })],
            width: { size: VALUE_COL_WIDTH, type: WidthType.DXA },
            margins: {
              top: convertInchesToTwip(0.08),
              bottom: convertInchesToTwip(0.08),
              left: convertInchesToTwip(0.1),
              right: convertInchesToTwip(0.1),
            },
          }),
        ],
      })
    );
  };

  if (metadata?.owner) addMetadataRow('Document Owner', metadata.owner);
  if (metadata?.approved_by) addMetadataRow('Approved By', metadata.approved_by);
  if (metadata?.approved_at) addMetadataRow('Approval Date', new Date(metadata.approved_at).toLocaleDateString('en-GB'));
  if (metadata?.effective_date) addMetadataRow('Effective Date', new Date(metadata.effective_date).toLocaleDateString('en-GB'));
  if (metadata?.next_review_date) addMetadataRow('Next Review Date', new Date(metadata.next_review_date).toLocaleDateString('en-GB'));
  if (metadata?.classification) addMetadataRow('Classification', metadata.classification);
  if (metadata?.generated_at) addMetadataRow('Generated', new Date(metadata.generated_at).toLocaleDateString('en-GB'));

  if (metadataRows.length > 0) {
    elements.push(
      new Table({
        rows: metadataRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [LABEL_COL_WIDTH, VALUE_COL_WIDTH],
      })
    );
    elements.push(new Paragraph({ text: '', spacing: { after: 400 } }));
  }

  // Version history
  if (versionHistory && versionHistory.length > 0) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Version History',
            bold: true,
            size: 26,
            color: primaryColor,
          }),
        ],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 300, after: 200 },
      })
    );

    // Version history column widths (15%, 20%, 25%, 40%)
    const VERSION_COL = 1400;
    const DATE_COL = 1870;
    const AUTHOR_COL = 2340;
    const CHANGES_COL = 3750;

    const historyRows: TableRow[] = [
      // Header row
      new TableRow({
        children: [
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Version', bold: true, size: 20, color: 'FFFFFF' })]
            })],
            width: { size: VERSION_COL, type: WidthType.DXA },
            shading: { fill: primaryColor },
            margins: {
              top: convertInchesToTwip(0.06),
              bottom: convertInchesToTwip(0.06),
              left: convertInchesToTwip(0.08),
              right: convertInchesToTwip(0.08),
            },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Date', bold: true, size: 20, color: 'FFFFFF' })]
            })],
            width: { size: DATE_COL, type: WidthType.DXA },
            shading: { fill: primaryColor },
            margins: {
              top: convertInchesToTwip(0.06),
              bottom: convertInchesToTwip(0.06),
              left: convertInchesToTwip(0.08),
              right: convertInchesToTwip(0.08),
            },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Author', bold: true, size: 20, color: 'FFFFFF' })]
            })],
            width: { size: AUTHOR_COL, type: WidthType.DXA },
            shading: { fill: primaryColor },
            margins: {
              top: convertInchesToTwip(0.06),
              bottom: convertInchesToTwip(0.06),
              left: convertInchesToTwip(0.08),
              right: convertInchesToTwip(0.08),
            },
          }),
          new TableCell({
            children: [new Paragraph({
              children: [new TextRun({ text: 'Changes', bold: true, size: 20, color: 'FFFFFF' })]
            })],
            width: { size: CHANGES_COL, type: WidthType.DXA },
            shading: { fill: primaryColor },
            margins: {
              top: convertInchesToTwip(0.06),
              bottom: convertInchesToTwip(0.06),
              left: convertInchesToTwip(0.08),
              right: convertInchesToTwip(0.08),
            },
          }),
        ],
      }),
      // Data rows
      ...versionHistory.map(entry =>
        new TableRow({
          children: [
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: entry.version, size: 20 })] })],
              width: { size: VERSION_COL, type: WidthType.DXA },
              margins: { top: convertInchesToTwip(0.04), bottom: convertInchesToTwip(0.04), left: convertInchesToTwip(0.08), right: convertInchesToTwip(0.08) },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: entry.date, size: 20 })] })],
              width: { size: DATE_COL, type: WidthType.DXA },
              margins: { top: convertInchesToTwip(0.04), bottom: convertInchesToTwip(0.04), left: convertInchesToTwip(0.08), right: convertInchesToTwip(0.08) },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: entry.author, size: 20 })] })],
              width: { size: AUTHOR_COL, type: WidthType.DXA },
              margins: { top: convertInchesToTwip(0.04), bottom: convertInchesToTwip(0.04), left: convertInchesToTwip(0.08), right: convertInchesToTwip(0.08) },
            }),
            new TableCell({
              children: [new Paragraph({ children: [new TextRun({ text: entry.changes, size: 20 })] })],
              width: { size: CHANGES_COL, type: WidthType.DXA },
              margins: { top: convertInchesToTwip(0.04), bottom: convertInchesToTwip(0.04), left: convertInchesToTwip(0.08), right: convertInchesToTwip(0.08) },
            }),
          ],
        })
      ),
    ];

    elements.push(
      new Table({
        rows: historyRows,
        width: { size: 100, type: WidthType.PERCENTAGE },
        columnWidths: [VERSION_COL, DATE_COL, AUTHOR_COL, CHANGES_COL],
      })
    );
  }

  return elements;
}

function createTableOfContents(sections: PolicySection[], primaryColor: string): Paragraph[] {
  const elements: Paragraph[] = [];

  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: 'Contents',
          bold: true,
          size: 32,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 300 },
    })
  );

  let sectionNumber = 1;
  sections.forEach((section) => {
    if (section.sectionType !== 'appendix') {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `${sectionNumber}. ${section.title}`,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
        })
      );
      sectionNumber++;
    }
  });

  // Appendices
  const appendices = sections.filter(s => s.sectionType === 'appendix');
  if (appendices.length > 0) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Appendices',
            size: 22,
            bold: true,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );

    appendices.forEach((appendix, idx) => {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: `Appendix ${String.fromCharCode(65 + idx)}: ${appendix.title}`,
              size: 22,
            }),
          ],
          spacing: { after: 100 },
          indent: { left: convertInchesToTwip(0.25) },
        })
      );
    });
  }

  return elements;
}

function createSectionContent(
  section: PolicySection,
  sectionIndex: number,
  isAppendix: boolean,
  primaryColor: string
): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [];
  const appendParsedContent = (parsedContent: ParsedContent[]) => {
    parsedContent.forEach((item) => {
      switch (item.type) {
        case 'heading':
          elements.push(
            new Paragraph({
              text: item.text || '',
              heading: item.level === 2 ? HeadingLevel.HEADING_2
                     : item.level === 3 ? HeadingLevel.HEADING_3
                     : HeadingLevel.HEADING_4,
              spacing: { before: 200, after: 100 },
            })
          );
          break;

        case 'paragraph':
          if (item.text) {
            elements.push(
              new Paragraph({
                children: parseInlineFormatting(item.text),
                spacing: { after: 120 },
              })
            );
          }
          break;

        case 'list':
          if (item.items) {
            item.items.forEach((listItem) => {
              elements.push(
                new Paragraph({
                  children: parseInlineFormatting(listItem),
                  bullet: { level: 0 },
                  spacing: { after: 60 },
                })
              );
            });
          }
          break;

        case 'blockquote':
          if (item.text) {
            elements.push(
              new Paragraph({
                children: parseInlineFormatting(item.text),
                spacing: { after: 120 },
                indent: { left: convertInchesToTwip(0.4) },
                shading: { fill: 'F3F4F6' },
                border: {
                  left: { color: primaryColor, space: 1, style: BorderStyle.SINGLE, size: 16 },
                },
              })
            );
          }
          break;
      }
    });
  };

  // Section heading
  const sectionLabel = isAppendix
    ? `Appendix ${String.fromCharCode(65 + sectionIndex)}`
    : `${sectionIndex + 1}`;

  elements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: `${sectionLabel}. ${section.title}`,
          bold: true,
          size: 32,
          color: primaryColor,
        }),
      ],
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
      pageBreakBefore: true,
    })
  );

  // Section type badge
  if (section.sectionType === 'procedure') {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'PROCEDURE',
            bold: true,
            size: 18,
            color: 'FFFFFF',
          }),
        ],
        shading: { fill: '3B82F6' },
        spacing: { after: 200 },
      })
    );
  }

  // Custom notes at start of section
  if (section.customNotes) {
    elements.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'Firm-specific detail',
            bold: true,
            size: 20,
            color: COLORS.muted,
          }),
        ],
        spacing: { after: 100 },
      })
    );
    const sanitizedNotes = sanitizeClauseContent(section.customNotes, NOTE_SANITIZE_OPTIONS);
    const parsedNotes = parseMarkdownToStructure(sanitizedNotes);
    appendParsedContent(parsedNotes);
    elements.push(new Paragraph({ text: '', spacing: { after: 120 } }));
  }

  // Render each clause
  section.clauses.forEach((clause, clauseIdx) => {
    // Clause subheading (only if multiple clauses in section)
    if (section.clauses.length > 1) {
      elements.push(
        new Paragraph({
          children: [
            new TextRun({
              text: clause.title,
              bold: true,
              size: 26,
              color: COLORS.text,
            }),
          ],
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 300, after: 150 },
        })
      );
    }

    // Sanitize and parse clause content
    const sanitizeOptions =
      section.sectionType === 'procedure' ? DEFAULT_SANITIZE_OPTIONS : POLICY_SANITIZE_OPTIONS;
    const sanitizedContent = sanitizeClauseContent(clause.rendered_body, sanitizeOptions);
    const parsedContent = parseMarkdownToStructure(sanitizedContent);

    appendParsedContent(parsedContent);

    // Spacing between clauses
    if (clauseIdx < section.clauses.length - 1) {
      elements.push(new Paragraph({ text: '', spacing: { after: 200 } }));
    }
  });

  return elements;
}

function createDraftWatermark(): Paragraph {
  return new Paragraph({
    children: [
      new TextRun({
        text: 'DRAFT - NOT APPROVED',
        bold: true,
        size: 24,
        color: COLORS.error,
      }),
    ],
    alignment: AlignmentType.CENTER,
    spacing: { after: 200 },
    border: {
      top: { color: COLORS.error, space: 4, style: BorderStyle.SINGLE, size: 8 },
      bottom: { color: COLORS.error, space: 4, style: BorderStyle.SINGLE, size: 8 },
      left: { color: COLORS.error, space: 4, style: BorderStyle.SINGLE, size: 8 },
      right: { color: COLORS.error, space: 4, style: BorderStyle.SINGLE, size: 8 },
    },
  });
}

// =====================================================
// MAIN EXPORT FUNCTION
// =====================================================

export function generateDocx(options: DocumentGenerationOptions | LegacyDocumentGenerationOptions): Document {
  // Handle legacy format
  const isLegacy = 'clauses' in options && !('sections' in options);

  let sections: PolicySection[];
  if (isLegacy) {
    // Convert legacy format to sections
    const legacyOpts = options as LegacyDocumentGenerationOptions;
    sections = [{
      id: 'main',
      title: 'Policy Content',
      sectionType: 'policy',
      clauses: legacyOpts.clauses,
    }];
  } else {
    sections = (options as DocumentGenerationOptions).sections;
  }

  const { policyTitle, policyVersion, firmName, branding, metadata, watermark } = options;
  const versionHistory = 'versionHistory' in options ? options.versionHistory : undefined;

  const primaryHex = branding?.primary_color ?? '#4F46E5';
  const primaryColor = primaryHex.replace('#', '').trim().toUpperCase() || '4F46E5';
  const documentFont = branding?.font ?? 'Calibri';

  // Build document sections
  const docChildren: (Paragraph | Table)[] = [];

  // 1. Cover page
  docChildren.push(...createCoverPage(
    firmName,
    policyTitle,
    policyVersion,
    metadata?.effective_date,
    metadata?.classification,
    primaryColor
  ));

  // Draft watermark (on cover if draft)
  if (watermark) {
    docChildren.push(createDraftWatermark());
  }

  // Page break after cover
  docChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // 2. Document control
  docChildren.push(...createDocumentControlSection(metadata, versionHistory, primaryColor));

  // Page break
  docChildren.push(new Paragraph({ children: [new PageBreak()] }));

  // 3. Table of contents
  docChildren.push(...createTableOfContents(sections, primaryColor));

  // 4. Main sections (non-appendix)
  const mainSections = sections.filter(s => s.sectionType !== 'appendix');
  mainSections.forEach((section, idx) => {
    docChildren.push(...createSectionContent(section, idx, false, primaryColor));
  });

  // 5. Appendices
  const appendixSections = sections.filter(s => s.sectionType === 'appendix');
  if (appendixSections.length > 0) {
    // Appendices divider
    docChildren.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'APPENDICES',
            bold: true,
            size: 36,
            color: primaryColor,
          }),
        ],
        alignment: AlignmentType.CENTER,
        pageBreakBefore: true,
        spacing: { after: 400 },
      })
    );

    appendixSections.forEach((section, idx) => {
      docChildren.push(...createSectionContent(section, idx, true, primaryColor));
    });
  }

  // 6. End of document
  docChildren.push(
    new Paragraph({
      children: [
        new TextRun({
          text: '— End of Document —',
          italics: true,
          size: 20,
          color: COLORS.muted,
        }),
      ],
      alignment: AlignmentType.CENTER,
      pageBreakBefore: true,
      spacing: { before: 800 },
    })
  );

  // Create document with headers and footers
  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            margin: MARGINS,
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `${firmName} | ${policyTitle}`,
                    size: 18,
                    color: COLORS.muted,
                  }),
                ],
                alignment: AlignmentType.RIGHT,
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: `Version ${policyVersion} | `,
                    size: 18,
                    color: COLORS.muted,
                  }),
                  new TextRun({
                    text: 'Page ',
                    size: 18,
                    color: COLORS.muted,
                  }),
                  new TextRun({
                    children: [PageNumber.CURRENT],
                    size: 18,
                    color: COLORS.muted,
                  }),
                  new TextRun({
                    text: ' of ',
                    size: 18,
                    color: COLORS.muted,
                  }),
                  new TextRun({
                    children: [PageNumber.TOTAL_PAGES],
                    size: 18,
                    color: COLORS.muted,
                  }),
                ],
                alignment: AlignmentType.CENTER,
              }),
            ],
          }),
        },
        children: docChildren,
      },
    ],
    styles: {
      default: {
        document: {
          run: {
            font: documentFont,
            size: 22,
            // Don't specify bold at all - let it default to not bold
          },
          paragraph: {
            spacing: {
              line: 276,
              before: 0,
              after: 160,
            },
          },
        },
        heading1: {
          run: {
            font: documentFont,
            size: 32,
            bold: true,
            color: primaryColor,
          },
          paragraph: {
            spacing: { before: 480, after: 240 },
          },
        },
        heading2: {
          run: {
            font: documentFont,
            size: 26,
            bold: true,
            color: primaryColor,
          },
          paragraph: {
            spacing: { before: 360, after: 180 },
          },
        },
        heading3: {
          run: {
            font: documentFont,
            size: 24,
            bold: true,
            color: COLORS.text,
          },
          paragraph: {
            spacing: { before: 280, after: 140 },
          },
        },
      },
    },
  });

  return doc;
}

import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from "docx";
import type { ReportModuleStatus, ReportPackSummary } from "./types";

const STATUS_LABELS: Record<ReportModuleStatus, string> = {
  ready: "Ready",
  partial: "Needs review",
  blocked: "Blocked",
};

function formatLabel(value: string) {
  return value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

export async function buildReportPackDocx(summary: ReportPackSummary): Promise<Buffer> {
  const title = "Reporting Pack";
  const templateLabel = formatLabel(summary.template);
  const audienceLabel = formatLabel(summary.audience);
  const periodLabel = formatLabel(summary.period);
  const generatedDate = new Date(summary.generatedAt).toLocaleDateString("en-GB");

  const children: Paragraph[] = [
    new Paragraph({
      text: title,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${templateLabel} - ${audienceLabel}`, bold: true }),
      ],
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Reporting period: ${periodLabel}`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({
      text: `Generated ${generatedDate}`,
      alignment: AlignmentType.CENTER,
    }),
    new Paragraph({ text: "" }),
    new Paragraph({
      text: "Executive snapshot",
      heading: HeadingLevel.HEADING_1,
    }),
    new Paragraph({
      text: `Overall readiness: ${summary.readiness}%`,
    }),
  ];

  const tableRows = [
    new TableRow({
      children: [
        new TableCell({ width: { size: 30, type: WidthType.PERCENTAGE }, children: [new Paragraph("Module")] }),
        new TableCell({ width: { size: 20, type: WidthType.PERCENTAGE }, children: [new Paragraph("Status")] }),
        new TableCell({ width: { size: 15, type: WidthType.PERCENTAGE }, children: [new Paragraph("Coverage")] }),
        new TableCell({ width: { size: 35, type: WidthType.PERCENTAGE }, children: [new Paragraph("Highlight")] }),
      ],
    }),
    ...summary.modules.map(
      (module) =>
        new TableRow({
          children: [
            new TableCell({ children: [new Paragraph(module.label)] }),
            new TableCell({ children: [new Paragraph(STATUS_LABELS[module.status])] }),
            new TableCell({ children: [new Paragraph(`${module.coverage}%`)] }),
            new TableCell({ children: [new Paragraph(module.highlight)] }),
          ],
        })
    ),
  ];

  const moduleTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });

  children.push(moduleTable);
  children.push(new Paragraph({ text: "" }));

  summary.modules.forEach((module) => {
    children.push(
      new Paragraph({ text: module.label, heading: HeadingLevel.HEADING_2 }),
      new Paragraph({ text: module.description }),
      new Paragraph({
        text: `Coverage: ${module.coverage}%`,
      }),
      new Paragraph({
        text: `Status: ${STATUS_LABELS[module.status]} | Highlight: ${module.highlight}`,
      }),
      new Paragraph({ text: "" }),
    );
  });

  const document = new Document({
    sections: [
      {
        properties: {},
        children,
      },
    ],
  });

  return Packer.toBuffer(document);
}

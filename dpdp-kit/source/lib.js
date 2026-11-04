// Shared builder: turns a simple block list into a styled .docx
const fs = require("fs");
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType,
  ShadingType, AlignmentType, HeadingLevel, LevelFormat, Header, Footer,
  PageNumber, BorderStyle, PageBreak, TableOfContents,
} = require("docx");

const FONT = "Calibri";
const NAVY = "1F3A5F";
const ACCENT = "B8860B";
const PAGE_W = 11906, MARGIN = 1300, CONTENT_W = PAGE_W - 2 * MARGIN; // A4

// Inline markup: **bold**, [[placeholder]] (highlighted fill-in)
function runs(text, base = {}) {
  const out = [];
  for (const part of String(text).split(/(\*\*[^*]+\*\*|\[\[[^\]]+\]\])/)) {
    if (!part) continue;
    if (part.startsWith("**")) out.push(new TextRun({ ...base, text: part.slice(2, -2), bold: true }));
    else if (part.startsWith("[[")) out.push(new TextRun({ ...base, text: "[" + part.slice(2, -2) + "]", shading: { type: ShadingType.CLEAR, fill: "FFF176", color: "auto" } }));
    else out.push(new TextRun({ ...base, text: part }));
  }
  return out;
}

const border = { style: BorderStyle.SINGLE, size: 4, color: "BFC7D1" };
const borders = { top: border, bottom: border, left: border, right: border };

function table(headers, rows, widths) {
  const n = headers.length;
  widths = widths || Array(n).fill(Math.floor(CONTENT_W / n));
  const total = widths.reduce((a, b) => a + b, 0);
  const cell = (t, i, head) => new TableCell({
    borders, width: { size: widths[i], type: WidthType.DXA },
    shading: head ? { fill: NAVY, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: String(t).split("\n").map(line => new Paragraph({
      spacing: { before: 0, after: 40 },
      children: runs(line, head ? { bold: true, color: "FFFFFF", size: 19 } : { size: 19 }),
    })),
  });
  return new Table({
    width: { size: total, type: WidthType.DXA }, columnWidths: widths,
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, i, true)) }),
      ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, i, false)) })),
    ],
  });
}

function callout(text, fill = "FFF4D6", edge = ACCENT) {
  return new Paragraph({
    shading: { fill, type: ShadingType.CLEAR, color: "auto" },
    border: { left: { style: BorderStyle.SINGLE, size: 24, color: edge, space: 8 } },
    spacing: { before: 120, after: 160 }, indent: { left: 160, right: 160 },
    children: runs(text, { size: 20 }),
  });
}

function blocks(list) {
  const out = [];
  for (const b of list) {
    const [kind, a, c, d] = b;
    switch (kind) {
      case "h1": out.push(new Paragraph({ heading: HeadingLevel.HEADING_1, children: runs(a) })); break;
      case "h2": out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, children: runs(a) })); break;
      case "h3": out.push(new Paragraph({ heading: HeadingLevel.HEADING_3, children: runs(a) })); break;
      case "p": out.push(new Paragraph({ spacing: { after: 120 }, children: runs(a) })); break;
      case "b": out.push(new Paragraph({ numbering: { reference: "bul", level: 0 }, spacing: { after: 60 }, children: runs(a) })); break;
      case "b2": out.push(new Paragraph({ numbering: { reference: "bul", level: 1 }, spacing: { after: 60 }, children: runs(a) })); break;
      case "box": out.push(new Paragraph({ numbering: { reference: "box", level: 0 }, spacing: { after: 60 }, children: runs(a) })); break;
      // clause: numbered heading-ish legal clause, number given in text
      case "cl": out.push(new Paragraph({ spacing: { after: 100 }, indent: { left: 567, hanging: 567 }, children: runs(a) })); break;
      case "cl2": out.push(new Paragraph({ spacing: { after: 80 }, indent: { left: 1134, hanging: 567 }, children: runs(a) })); break;
      case "note": out.push(callout(a)); break;
      case "warn": out.push(callout(a, "FBE3E3", "B03030")); break;
      case "table": out.push(table(a, c, d)); out.push(new Paragraph({ spacing: { after: 120 }, children: [] })); break;
      case "field": out.push(new Paragraph({ spacing: { before: 120, after: 120 }, children: [...runs(a + ": "), new TextRun({ text: "_".repeat(Math.max(10, 60 - a.length)) })] })); break;
      case "sig": out.push(...signature(a || ["For the Firm", "Client / Data Principal"])); break;
      case "br": out.push(new Paragraph({ children: [new PageBreak()] })); break;
      case "toc": out.push(new TableOfContents("Contents", { hyperlink: true, headingStyleRange: "1-2" })); break;
      default: throw new Error("unknown block " + kind);
    }
  }
  return out;
}

function signature(parties) {
  const w = Math.floor(CONTENT_W / parties.length);
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  return [new Paragraph({ spacing: { before: 240 }, children: [] }), new Table({
    width: { size: w * parties.length, type: WidthType.DXA }, columnWidths: parties.map(() => w),
    rows: [new TableRow({
      children: parties.map(p => new TableCell({
        width: { size: w, type: WidthType.DXA }, borders: { top: none, bottom: none, left: none, right: none },
        children: [p, "", "Signature: ____________________", "Name: _________________________", "Date: __________  Place: _______"]
          .map((t, i) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: t, bold: i === 0 })] })),
      })),
    })],
  })];
}

function cover(title, subtitle, docNo) {
  return [
    new Paragraph({ spacing: { before: 2400, after: 120 }, children: [new TextRun({ text: "DPDP COMPLIANCE KIT FOR LAW FIRMS", color: ACCENT, bold: true, size: 22, characterSpacing: 40 })] }),
    new Paragraph({ spacing: { after: 120 }, border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: NAVY, space: 6 } }, children: [new TextRun({ text: title, font: FONT, size: 52, bold: true, color: NAVY })] }),
    new Paragraph({ spacing: { after: 480 }, children: [new TextRun({ text: subtitle, size: 26, color: "4A5568" })] }),
    ...[["Document", docNo], ["Firm", "[[Firm / Chambers name]]"], ["Version / date", "[[v1.0 — DD/MM/YYYY]]"], ["Owner", "[[Privacy Contact name]]"], ["Next review", "[[DD/MM/YYYY]]"]]
      .map(([k, v]) => new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: k + ":  ", bold: true, color: NAVY }), ...runs(v)] })),
    new Paragraph({ spacing: { before: 600 }, children: [] }),
    callout("**How to use this template.** Text in [[yellow brackets]] must be filled in or deleted. Notes in shaded boxes are drafting guidance for the advocate and should be removed before the document is issued. This template reflects the Digital Personal Data Protection Act, 2023 and the DPDP Rules, 2025 as understood at the version date; verify against the current official text before use."),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

async function build(file, { title, subtitle, docNo, body, withCover = true }) {
  const doc = new Document({
    creator: "DPDP Compliance Kit", title,
    styles: {
      default: { document: { run: { font: FONT, size: 21 } } },
      paragraphStyles: [
        { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: FONT, size: 30, bold: true, color: NAVY }, paragraph: { spacing: { before: 320, after: 140 }, keepNext: true, outlineLevel: 0 } },
        { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: FONT, size: 25, bold: true, color: NAVY }, paragraph: { spacing: { before: 240, after: 100 }, keepNext: true, outlineLevel: 1 } },
        { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
          run: { font: FONT, size: 22, bold: true, color: ACCENT }, paragraph: { spacing: { before: 180, after: 80 }, keepNext: true, outlineLevel: 2 } },
      ],
    },
    numbering: { config: [
      { reference: "bul", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 283 } } } },
        { level: 1, format: LevelFormat.BULLET, text: "–", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 1134, hanging: 283 } } } },
      ] },
      { reference: "box", levels: [
        { level: 0, format: LevelFormat.BULLET, text: "☐", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 340 } } } },
      ] },
    ] },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: 16838 }, margin: { top: 1300, bottom: 1300, left: MARGIN, right: MARGIN } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: `${docNo}  |  ${title}`, size: 16, color: "8A94A6" })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: "Confidential — template for use by advocates. Not legal advice to any reader.   Page ", size: 16, color: "8A94A6" }),
        new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "8A94A6" }),
      ] })] }) },
      children: [...(withCover ? cover(title, subtitle, docNo) : []), ...blocks(body)],
    }],
  });
  fs.writeFileSync(file, await Packer.toBuffer(doc));
  console.log("wrote", file);
}

module.exports = { build };

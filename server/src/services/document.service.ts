import mammoth from 'mammoth';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
  Header,
  Footer,
  PageNumber,
  NumberFormat,
  convertInchesToTwip,
  TabStopPosition,
  TabStopType,
} from 'docx';
import fs from 'fs';
import path from 'path';
import { TemplateType } from '../models/Document.js';

export interface ProcessedField {
  name: string;
  label: string;
  value: string;
  action: 'generated' | 'enhanced' | 'unchanged';
}

/**
 * Extract raw text from a DOCX file using mammoth
 */
export async function extractTextFromDocx(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value;
}

/**
 * Build a formatted DOCX document from processed fields
 */
export async function buildFormattedDocx(
  templateType: TemplateType,
  fields: ProcessedField[],
  outputPath: string
): Promise<void> {
  const outputDir = path.dirname(outputPath);
  fs.mkdirSync(outputDir, { recursive: true });

  let doc: Document;

  switch (templateType) {
    case 'blogpost':
      doc = buildBlogPostDocx(fields);
      break;
    case 'journal':
      doc = buildJournalDocx(fields);
      break;
    case 'cv':
      doc = buildCVDocx(fields);
      break;
    case 'biodata':
      doc = buildBioDataDocx(fields);
      break;
    case 'report':
      doc = buildReportDocx(fields);
      break;
    default:
      doc = buildGenericDocx(fields);
  }

  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
}

function getFieldValue(fields: ProcessedField[], name: string): string {
  return fields.find((f) => f.name === name)?.value || '';
}

function createHeading(text: string, level: typeof HeadingLevel[keyof typeof HeadingLevel]) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 240, after: 120 },
  });
}

function createBody(text: string): Paragraph[] {
  if (!text) return [];
  const paragraphs: Paragraph[] = [];
  const lines = text.split('\n');

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    // Markdown heading ## or ###
    const h2Match = line.match(/^#{2}\s+(.+)/);
    const h3Match = line.match(/^#{3}\s+(.+)/);
    if (h2Match) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: h2Match[1], bold: true, size: 28, font: 'Times New Roman' })],
        heading: HeadingLevel.HEADING_2,
        spacing: { before: 240, after: 120 },
      }));
      continue;
    }
    if (h3Match) {
      paragraphs.push(new Paragraph({
        children: [new TextRun({ text: h3Match[1], bold: true, size: 26, font: 'Times New Roman' })],
        heading: HeadingLevel.HEADING_3,
        spacing: { before: 200, after: 100 },
      }));
      continue;
    }

    // Bullet points (-, *, •)
    const bulletMatch = line.match(/^[-*•]\s+(.+)/);
    if (bulletMatch) {
      paragraphs.push(new Paragraph({
        children: parseInlineFormatting(bulletMatch[1], 24),
        bullet: { level: 0 },
        spacing: { after: 60 },
      }));
      continue;
    }

    // Numbered list (1. 2. 3.)
    const numMatch = line.match(/^(\d+)[.)]\s+(.+)/);
    if (numMatch) {
      paragraphs.push(new Paragraph({
        children: parseInlineFormatting(numMatch[2], 24),
        numbering: { reference: 'default-numbering', level: 0 },
        spacing: { after: 60 },
      }));
      continue;
    }

    // Regular paragraph with inline bold/italic parsing
    paragraphs.push(new Paragraph({
      children: parseInlineFormatting(line, 24),
      spacing: { after: 120, line: 360 },
      alignment: AlignmentType.JUSTIFIED,
    }));
  }

  return paragraphs;
}

/**
 * Parse inline markdown formatting: **bold**, *italic*
 */
function parseInlineFormatting(text: string, fontSize: number): TextRun[] {
  const runs: TextRun[] = [];
  // Match **bold** and *italic* patterns
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);

  for (const part of parts) {
    if (!part) continue;
    if (part.startsWith('**') && part.endsWith('**')) {
      runs.push(new TextRun({ text: part.slice(2, -2), bold: true, size: fontSize, font: 'Times New Roman' }));
    } else if (part.startsWith('*') && part.endsWith('*')) {
      runs.push(new TextRun({ text: part.slice(1, -1), italics: true, size: fontSize, font: 'Times New Roman' }));
    } else {
      runs.push(new TextRun({ text: part, size: fontSize, font: 'Times New Roman' }));
    }
  }

  return runs.length > 0 ? runs : [new TextRun({ text, size: fontSize, font: 'Times New Roman' })];
}

function buildBlogPostDocx(fields: ProcessedField[]): Document {
  const title = getFieldValue(fields, 'title');
  const content = getFieldValue(fields, 'content');
  const summary = getFieldValue(fields, 'summary');
  const signature = getFieldValue(fields, 'signature');
  const tags = getFieldValue(fields, 'tags');
  const date = getFieldValue(fields, 'date') || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const children: Paragraph[] = [
    // Title
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 48, font: 'Georgia', color: '1a1a2e' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    // Date
    new Paragraph({
      children: [new TextRun({ text: date, italics: true, size: 22, font: 'Georgia', color: '666666' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    // Summary box
    new Paragraph({
      children: [new TextRun({ text: 'TL;DR: ', bold: true, size: 22, font: 'Georgia' }), new TextRun({ text: summary, italics: true, size: 22, font: 'Georgia' })],
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'cccccc' } },
    }),
    new Paragraph({ spacing: { after: 200 } }),
    // Content
    ...createBody(content),
    // Signature
    new Paragraph({ spacing: { before: 400 } }),
    new Paragraph({
      children: [new TextRun({ text: signature, italics: true, size: 22, font: 'Georgia', color: '444444' })],
      alignment: AlignmentType.RIGHT,
    }),
  ];

  // Tags
  if (tags) {
    children.push(
      new Paragraph({ spacing: { before: 300 } }),
      new Paragraph({
        children: [new TextRun({ text: `Tags: ${tags}`, size: 20, font: 'Georgia', color: '888888' })],
      })
    );
  }

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) },
        },
      },
      children,
    }],
  });
}

function buildJournalDocx(fields: ProcessedField[]): Document {
  const title = getFieldValue(fields, 'title');
  const authors = getFieldValue(fields, 'authors');
  const abstract = getFieldValue(fields, 'abstract');
  const keywords = getFieldValue(fields, 'keywords');
  const intro = getFieldValue(fields, 'introduction');
  const methodology = getFieldValue(fields, 'methodology');
  const results = getFieldValue(fields, 'results');
  const discussion = getFieldValue(fields, 'discussion');
  const conclusion = getFieldValue(fields, 'conclusion');
  const references = getFieldValue(fields, 'references');

  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 32, font: 'Times New Roman' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [new TextRun({ text: authors, size: 24, font: 'Times New Roman' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    createHeading('Abstract', HeadingLevel.HEADING_1),
    new Paragraph({
      children: [new TextRun({ text: abstract, italics: true, size: 24, font: 'Times New Roman' })],
      spacing: { after: 120 },
      alignment: AlignmentType.JUSTIFIED,
    }),
    new Paragraph({
      children: [new TextRun({ text: 'Keywords: ', bold: true, size: 22, font: 'Times New Roman' }), new TextRun({ text: keywords, italics: true, size: 22, font: 'Times New Roman' })],
      spacing: { after: 300 },
    }),
  ];

  const sections = [
    { name: 'Introduction', content: intro },
    { name: 'Methodology', content: methodology },
    { name: 'Results', content: results },
    { name: 'Discussion', content: discussion },
    { name: 'Conclusion', content: conclusion },
  ];

  for (const section of sections) {
    if (section.content) {
      children.push(createHeading(section.name, HeadingLevel.HEADING_1));
      children.push(...createBody(section.content));
    }
  }

  if (references) {
    children.push(createHeading('References', HeadingLevel.HEADING_1));
    children.push(...createBody(references));
  }

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
        },
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            children: [new TextRun({ text: title.substring(0, 50), size: 18, font: 'Times New Roman', italics: true })],
            alignment: AlignmentType.RIGHT,
          })],
        }),
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            children: [new TextRun({ children: [PageNumber.CURRENT], size: 20, font: 'Times New Roman' })],
            alignment: AlignmentType.CENTER,
          })],
        }),
      },
      children,
    }],
  });
}

function buildCVDocx(fields: ProcessedField[]): Document {
  const name = getFieldValue(fields, 'name');
  const contact = getFieldValue(fields, 'contact');
  const summary = getFieldValue(fields, 'professional_summary');
  const education = getFieldValue(fields, 'education');
  const experience = getFieldValue(fields, 'experience');
  const skills = getFieldValue(fields, 'skills');
  const certifications = getFieldValue(fields, 'certifications');
  const projects = getFieldValue(fields, 'projects');
  const languages = getFieldValue(fields, 'languages');

  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: name, bold: true, size: 36, font: 'Calibri', color: '2c3e50' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [new TextRun({ text: contact, size: 20, font: 'Calibri', color: '7f8c8d' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 2, color: '2c3e50' } },
    }),
  ];

  const addSection = (title: string, content: string) => {
    if (!content) return;
    children.push(
      new Paragraph({
        children: [new TextRun({ text: title.toUpperCase(), bold: true, size: 24, font: 'Calibri', color: '2c3e50' })],
        spacing: { before: 300, after: 100 },
        border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: 'bdc3c7' } },
      }),
      ...content.split('\n').filter(Boolean).map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line.trim(), size: 22, font: 'Calibri' })],
            spacing: { after: 60 },
          })
      )
    );
  };

  addSection('Professional Summary', summary);
  addSection('Work Experience', experience);
  addSection('Education', education);
  addSection('Skills', skills);
  if (certifications) addSection('Certifications', certifications);
  if (projects) addSection('Projects', projects);
  if (languages) addSection('Languages', languages);

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(0.75), bottom: convertInchesToTwip(0.75), left: convertInchesToTwip(0.75), right: convertInchesToTwip(0.75) },
        },
      },
      children,
    }],
  });
}

function buildBioDataDocx(fields: ProcessedField[]): Document {
  const name = getFieldValue(fields, 'name');
  const dob = getFieldValue(fields, 'dob');
  const contact = getFieldValue(fields, 'contact');
  const education = getFieldValue(fields, 'education');
  const family = getFieldValue(fields, 'family');
  const physical = getFieldValue(fields, 'physical');
  const hobbies = getFieldValue(fields, 'hobbies');
  const declaration = getFieldValue(fields, 'declaration');

  const children: Paragraph[] = [
    new Paragraph({
      children: [new TextRun({ text: 'BIO DATA', bold: true, size: 32, font: 'Arial', color: '1a5276' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      border: { bottom: { style: BorderStyle.DOUBLE, size: 2, color: '1a5276' } },
    }),
  ];

  const addField = (label: string, value: string) => {
    if (!value) return;
    children.push(
      new Paragraph({
        children: [
          new TextRun({ text: `${label}: `, bold: true, size: 24, font: 'Arial' }),
          new TextRun({ text: value, size: 24, font: 'Arial' }),
        ],
        spacing: { after: 120 },
      })
    );
  };

  addField('Name', name);
  if (dob) addField('Date of Birth', dob);
  addField('Contact', contact);

  const addSection = (title: string, content: string) => {
    if (!content) return;
    children.push(
      new Paragraph({
        children: [new TextRun({ text: title, bold: true, size: 26, font: 'Arial', color: '1a5276' })],
        spacing: { before: 240, after: 100 },
      }),
      ...content.split('\n').filter(Boolean).map(
        (line) =>
          new Paragraph({
            children: [new TextRun({ text: line.trim(), size: 24, font: 'Arial' })],
            spacing: { after: 60 },
          })
      )
    );
  };

  addSection('Education', education);
  if (family) addSection('Family Details', family);
  if (physical) addSection('Physical Attributes', physical);
  if (hobbies) addField('Hobbies & Interests', hobbies);

  if (declaration) {
    children.push(
      new Paragraph({ spacing: { before: 400 } }),
      new Paragraph({
        children: [new TextRun({ text: 'Declaration', bold: true, size: 24, font: 'Arial', underline: {} })],
        spacing: { after: 100 },
      }),
      new Paragraph({
        children: [new TextRun({ text: declaration, size: 22, font: 'Arial' })],
        spacing: { after: 200 },
      })
    );
  }

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
        },
      },
      children,
    }],
  });
}

function buildReportDocx(fields: ProcessedField[]): Document {
  const title = getFieldValue(fields, 'title');
  const author = getFieldValue(fields, 'author');
  const date = getFieldValue(fields, 'date') || new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const execSummary = getFieldValue(fields, 'executive_summary');
  const intro = getFieldValue(fields, 'introduction');
  const body = getFieldValue(fields, 'body');
  const conclusion = getFieldValue(fields, 'conclusion');
  const recommendations = getFieldValue(fields, 'recommendations');
  const appendix = getFieldValue(fields, 'appendix');

  // Title page
  const titlePageChildren: Paragraph[] = [
    new Paragraph({ spacing: { before: 4000 } }),
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 48, font: 'Calibri', color: '2c3e50' })],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
  ];
  if (author) {
    titlePageChildren.push(
      new Paragraph({
        children: [new TextRun({ text: `Prepared by: ${author}`, size: 28, font: 'Calibri', color: '7f8c8d' })],
        alignment: AlignmentType.CENTER,
        spacing: { after: 200 },
      })
    );
  }
  titlePageChildren.push(
    new Paragraph({
      children: [new TextRun({ text: date, size: 24, font: 'Calibri', color: '95a5a6' })],
      alignment: AlignmentType.CENTER,
    })
  );

  // Content
  const contentChildren: Paragraph[] = [];

  const addSection = (heading: string, content: string) => {
    if (!content) return;
    contentChildren.push(createHeading(heading, HeadingLevel.HEADING_1));
    contentChildren.push(...createBody(content));
  };

  addSection('Executive Summary', execSummary);
  addSection('Introduction', intro);

  if (body) {
    // Split body into subsections if it has headings
    const bodyLines = body.split('\n');
    for (const line of bodyLines) {
      if (line.match(/^#{1,3}\s/) || line.match(/^\d+\.\s+[A-Z]/)) {
        contentChildren.push(
          new Paragraph({
            children: [new TextRun({ text: line.replace(/^#+\s*/, '').replace(/^\d+\.\s*/, ''), bold: true, size: 28, font: 'Times New Roman' })],
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (line.trim()) {
        contentChildren.push(
          new Paragraph({
            children: [new TextRun({ text: line.trim(), size: 24, font: 'Times New Roman' })],
            spacing: { after: 120 },
            alignment: AlignmentType.JUSTIFIED,
          })
        );
      }
    }
  }

  addSection('Conclusion', conclusion);
  if (recommendations) addSection('Recommendations', recommendations);
  if (appendix) addSection('Appendix', appendix);

  return new Document({
    sections: [
      {
        properties: {
          page: {
            margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) },
          },
        },
        children: titlePageChildren,
      },
      {
        properties: {
          page: {
            margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1.25), right: convertInchesToTwip(1.25) },
            pageNumbers: { start: 1 },
          },
        },
        headers: {
          default: new Header({
            children: [new Paragraph({
              children: [new TextRun({ text: title.substring(0, 50), size: 18, font: 'Calibri', italics: true, color: '999999' })],
              alignment: AlignmentType.RIGHT,
            })],
          }),
        },
        footers: {
          default: new Footer({
            children: [new Paragraph({
              children: [new TextRun({ children: [PageNumber.CURRENT], size: 20, font: 'Calibri' })],
              alignment: AlignmentType.CENTER,
            })],
          }),
        },
        children: contentChildren,
      },
    ],
  });
}

function buildGenericDocx(fields: ProcessedField[]): Document {
  const children: Paragraph[] = [];

  for (const field of fields) {
    if (!field.value) continue;
    children.push(
      createHeading(field.label, HeadingLevel.HEADING_1),
      ...createBody(field.value)
    );
  }

  return new Document({
    sections: [{
      properties: {
        page: {
          margin: { top: convertInchesToTwip(1), bottom: convertInchesToTwip(1), left: convertInchesToTwip(1), right: convertInchesToTwip(1) },
        },
      },
      children,
    }],
  });
}

/**
 * Convert DOCX to PDF using puppeteer
 */
export async function convertDocxToPdf(
  docxPath: string,
  pdfPath: string
): Promise<void> {
  // Read the DOCX, extract to HTML via mammoth, then print to PDF via puppeteer
  const result = await mammoth.convertToHtml({ path: docxPath });
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body {
          font-family: 'Times New Roman', serif;
          font-size: 12pt;
          line-height: 1.6;
          margin: 1in;
          color: #333;
        }
        h1 { font-size: 18pt; margin-top: 24pt; margin-bottom: 12pt; }
        h2 { font-size: 16pt; margin-top: 20pt; margin-bottom: 10pt; }
        h3 { font-size: 14pt; margin-top: 16pt; margin-bottom: 8pt; }
        p { margin-bottom: 8pt; text-align: justify; }
        table { border-collapse: collapse; width: 100%; margin: 12pt 0; }
        td, th { border: 1px solid #ddd; padding: 8px; }
      </style>
    </head>
    <body>${result.value}</body>
    </html>
  `;

  const puppeteer = await import('puppeteer');
  const browser = await puppeteer.default.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'domcontentloaded' });
  await page.pdf({
    path: pdfPath,
    format: 'A4',
    printBackground: true,
    margin: { top: '0.5in', bottom: '0.5in', left: '0.5in', right: '0.5in' },
  });
  await browser.close();
}


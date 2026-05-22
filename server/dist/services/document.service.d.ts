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
export declare function extractTextFromDocx(filePath: string): Promise<string>;
/**
 * Build a formatted DOCX document from processed fields
 */
export declare function buildFormattedDocx(templateType: TemplateType, fields: ProcessedField[], outputPath: string): Promise<void>;
/**
 * Convert DOCX to PDF using puppeteer
 */
export declare function convertDocxToPdf(docxPath: string, pdfPath: string): Promise<void>;
//# sourceMappingURL=document.service.d.ts.map
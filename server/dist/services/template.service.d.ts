import { TemplateField } from '../templates/index.js';
import { ToneType } from '../models/Document.js';
export interface FieldAnalysis {
    field: TemplateField;
    status: 'MISSING' | 'PRESENT' | 'PARTIAL';
    existingContent: string | null;
}
/**
 * Analyzes extracted text against a template's field definitions
 * to determine which fields are MISSING, PRESENT, or PARTIAL
 */
export declare function analyzeFields(extractedText: string, templateType: string): FieldAnalysis[];
/**
 * Builds the AI prompt for a specific field based on its analysis status
 */
export declare function buildPrompt(analysis: FieldAnalysis, fullContent: string, tone: ToneType): string | null;
//# sourceMappingURL=template.service.d.ts.map
import { getTemplate, Template, TemplateField } from '../templates/index.js';
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
export function analyzeFields(
  extractedText: string,
  templateType: string
): FieldAnalysis[] {
  const template = getTemplate(templateType);
  if (!template) {
    throw new Error(`Unknown template type: ${templateType}`);
  }

  const lines = extractedText.split('\n');
  const analyses: FieldAnalysis[] = [];

  for (const field of template.fields) {
    // The "content" / "body" field is special — it's whatever text is left
    if (field.name === 'content' || field.name === 'body') {
      if (extractedText.trim().length > 50) {
        analyses.push({ field, status: 'PRESENT', existingContent: extractedText });
      } else {
        analyses.push({ field, status: 'MISSING', existingContent: null });
      }
      continue;
    }

    // For name field in CV/biodata — try to detect from first non-empty line
    if (field.name === 'name' && (templateType === 'cv' || templateType === 'biodata')) {
      const firstLine = lines.find((l) => l.trim().length > 0);
      if (firstLine && firstLine.trim().length < 60) {
        analyses.push({ field, status: 'PRESENT', existingContent: firstLine.trim() });
      } else {
        analyses.push({ field, status: 'MISSING', existingContent: null });
      }
      continue;
    }

    // Try to detect field using patterns
    let found = false;
    let sectionContent = '';

    for (const pattern of field.detectPatterns) {
      for (let i = 0; i < lines.length; i++) {
        if (pattern.test(lines[i])) {
          // Found the section header — extract content until next section
          const contentLines: string[] = [];
          // Include remaining text on the header line after the pattern match
          const headerRemainder = lines[i].replace(pattern, '').trim();
          if (headerRemainder) contentLines.push(headerRemainder);

          for (let j = i + 1; j < lines.length; j++) {
            // Stop at the next section header (a line that matches any field pattern)
            const isNextSection = template.fields.some((f) =>
              f.detectPatterns.some((p) => p.test(lines[j]))
            );
            if (isNextSection) break;
            if (lines[j].trim()) contentLines.push(lines[j].trim());
          }

          sectionContent = contentLines.join('\n').trim();
          found = true;
          break;
        }
      }
      if (found) break;
    }

    if (found && sectionContent.length > 10) {
      analyses.push({ field, status: 'PRESENT', existingContent: sectionContent });
    } else if (found && sectionContent.length > 0) {
      analyses.push({ field, status: 'PARTIAL', existingContent: sectionContent });
    } else {
      analyses.push({ field, status: 'MISSING', existingContent: null });
    }
  }

  return analyses;
}

/**
 * Builds the AI prompt for a specific field based on its analysis status
 */
export function buildPrompt(
  analysis: FieldAnalysis,
  fullContent: string,
  tone: ToneType
): string | null {
  const { field, status, existingContent } = analysis;

  if (status === 'MISSING') {
    if (!field.missingPrompt) return null; // No AI needed (e.g., date auto-filled)
    return field.missingPrompt
      .replace('{content}', fullContent.substring(0, 3000))
      .replace('{tone}', tone);
  }

  if (status === 'PRESENT' || status === 'PARTIAL') {
    if (!field.enhancePrompt) return null; // Keep as-is
    return field.enhancePrompt
      .replace('{value}', existingContent || '')
      .replace('{content}', fullContent.substring(0, 3000))
      .replace('{tone}', tone);
  }

  return null;
}

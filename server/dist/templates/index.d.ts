export interface TemplateField {
    name: string;
    label: string;
    required: boolean;
    description: string;
    detectPatterns: RegExp[];
    missingPrompt: string;
    enhancePrompt: string;
}
export interface Template {
    type: string;
    label: string;
    description: string;
    fields: TemplateField[];
}
export declare const blogpostTemplate: Template;
export declare const journalTemplate: Template;
export declare const cvTemplate: Template;
export declare const biodataTemplate: Template;
export declare const reportTemplate: Template;
export declare const templates: Record<string, Template>;
export declare function getTemplate(type: string): Template | undefined;
//# sourceMappingURL=index.d.ts.map
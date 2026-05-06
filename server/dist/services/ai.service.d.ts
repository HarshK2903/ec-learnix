/**
 * Single AI call with retry logic for rate limits.
 */
export declare function callAI(prompt: string): Promise<string>;
/**
 * Batch AI call — processes ALL fields in a single request.
 */
export declare function callAIBatch(fields: Array<{
    name: string;
    label: string;
    prompt: string;
}>, templateType: string, tone: string): Promise<Record<string, string>>;
//# sourceMappingURL=ai.service.d.ts.map
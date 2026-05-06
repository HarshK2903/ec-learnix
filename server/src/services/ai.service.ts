import { getAIProvider, getGeminiClient, getOpenAIClient, getGroqClient } from '../config/ai.js';

const MAX_RETRIES = 4;
const BASE_DELAY_MS = 15000;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Single AI call with retry logic for rate limits.
 */
export async function callAI(prompt: string): Promise<string> {
  const provider = getAIProvider();

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      if (provider === 'gemini') {
        return await callGemini(prompt);
      } else if (provider === 'groq') {
        return await callGroq(prompt);
      } else {
        return await callOpenAI(prompt);
      }
    } catch (error: any) {
      const isRateLimit =
        error?.status === 429 ||
        error?.message?.includes('429') ||
        error?.message?.includes('Too Many Requests') ||
        error?.message?.includes('quota') ||
        error?.message?.includes('RESOURCE_EXHAUSTED') ||
        error?.message?.includes('rate_limit');

      if (isRateLimit && attempt < MAX_RETRIES) {
        let waitMs = BASE_DELAY_MS * Math.pow(2, attempt - 1);

        const retryMatch = error?.message?.match(/retry in ([\d.]+)s/i);
        if (retryMatch) {
          waitMs = Math.ceil(parseFloat(retryMatch[1]) * 1000) + 3000;
        }

        console.log(`⏳ Rate limited (attempt ${attempt}/${MAX_RETRIES}). Waiting ${Math.round(waitMs / 1000)}s...`);
        await sleep(waitMs);
        continue;
      }

      throw error;
    }
  }

  throw new Error('AI call failed after all retries');
}

/**
 * Batch AI call — processes ALL fields in a single request.
 */
export async function callAIBatch(
  fields: Array<{ name: string; label: string; prompt: string }>,
  templateType: string,
  tone: string
): Promise<Record<string, string>> {
  const fieldDescriptions = fields
    .map((f, i) => `${i + 1}. Field: "${f.name}" (${f.label})\n   Task: ${f.prompt}`)
    .join('\n\n');

  const batchPrompt = `You are a document formatting AI. Process ALL fields below for a "${templateType}" document in a "${tone}" tone.

RULES:
- Return ONLY a valid JSON object. No markdown fences, no explanation.
- Each key must be the exact field name given below.
- Each value must be PLAIN TEXT (no markdown, no ## headings, no ** bold **). Use natural paragraphs separated by newlines.
- For multi-paragraph content, separate paragraphs with double newlines.

Fields:

${fieldDescriptions}

Respond with JSON only:`;

  const result = await callAI(batchPrompt);

  // Parse the JSON response with multiple fallback strategies
  let cleaned = result.trim();

  // Strip markdown code fences
  const fenceMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (fenceMatch) {
    cleaned = fenceMatch[1].trim();
  } else {
    if (cleaned.startsWith('```json')) cleaned = cleaned.slice(7);
    else if (cleaned.startsWith('```')) cleaned = cleaned.slice(3);
    if (cleaned.endsWith('```')) cleaned = cleaned.slice(0, -3);
    cleaned = cleaned.trim();
  }

  // Try to extract JSON object from response
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }

  try {
    const parsed = JSON.parse(cleaned);
    if (typeof parsed === 'object' && parsed !== null) {
      return parsed;
    }
  } catch (e) {
    console.error('JSON parse failed, trying field extraction...');
  }

  // Fallback: try to extract field values using regex
  console.error('Raw AI response (first 300 chars):', result.substring(0, 300));
  const fallback: Record<string, string> = {};
  for (const field of fields) {
    // Try to find "fieldName": "value" pattern
    const regex = new RegExp(`"${field.name}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's');
    const match = result.match(regex);
    if (match) {
      fallback[field.name] = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"');
    }
  }

  if (Object.keys(fallback).length > 0) {
    console.log('Extracted fields via regex fallback:', Object.keys(fallback).join(', '));
    return fallback;
  }

  // Last resort: return empty so worker uses original content
  console.error('Could not parse AI response at all, returning empty');
  return {};
}

async function callGemini(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function callOpenAI(prompt: string): Promise<string> {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
  });
  return response.choices[0]?.message?.content || '';
}

async function callGroq(prompt: string): Promise<string> {
  const client = getGroqClient();
  const response = await client.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: 4000,
  });
  return response.choices[0]?.message?.content || '';
}


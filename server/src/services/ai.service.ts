import { getAIProvider, getGeminiClient, getOpenAIClient } from '../config/ai.js';

export async function callAI(prompt: string): Promise<string> {
  const provider = getAIProvider();

  if (provider === 'gemini') {
    return callGemini(prompt);
  } else {
    return callOpenAI(prompt);
  }
}

async function callGemini(prompt: string): Promise<string> {
  const client = getGeminiClient();
  const model = client.getGenerativeModel({ model: 'gemini-2.0-flash' });

  const result = await model.generateContent(prompt);
  const response = result.response;
  return response.text();
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

import { env } from './env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

let geminiClient: GoogleGenerativeAI | null = null;
let openaiClient: OpenAI | null = null;
let groqClient: OpenAI | null = null;

export function getGeminiClient(): GoogleGenerativeAI {
  if (!geminiClient) {
    if (!env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set');
    }
    geminiClient = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }
  return geminiClient;
}

export function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set');
    }
    openaiClient = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }
  return openaiClient;
}

/**
 * Groq uses OpenAI-compatible API with a different base URL.
 */
export function getGroqClient(): OpenAI {
  if (!groqClient) {
    if (!env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY is not set');
    }
    groqClient = new OpenAI({
      apiKey: env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }
  return groqClient;
}

export function getAIProvider(): 'gemini' | 'openai' | 'groq' {
  return env.AI_PROVIDER;
}

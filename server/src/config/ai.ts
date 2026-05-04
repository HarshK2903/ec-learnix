import { env } from './env.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

let geminiClient: GoogleGenerativeAI | null = null;
let openaiClient: OpenAI | null = null;

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

export function getAIProvider(): 'gemini' | 'openai' {
  return env.AI_PROVIDER;
}

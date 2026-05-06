import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
export declare function getGeminiClient(): GoogleGenerativeAI;
export declare function getOpenAIClient(): OpenAI;
/**
 * Groq uses OpenAI-compatible API with a different base URL.
 */
export declare function getGroqClient(): OpenAI;
export declare function getAIProvider(): 'gemini' | 'openai' | 'groq';
//# sourceMappingURL=ai.d.ts.map
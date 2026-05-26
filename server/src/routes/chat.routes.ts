import { Router, Response } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware.js';
import { env } from '../config/env.js';

const router = Router();

const SYSTEM_PROMPT = `You are DocForge AI Assistant — a concise, expert writing helper embedded in a document formatting platform. Your expertise covers:

- **Resume/CV advice**: Structure, formatting, content tips, ATS optimization
- **Blog writing**: Topic ideas, outlines, hooks, SEO tips
- **Journal/Academic papers**: Structure, abstract writing, citations, methodology
- **Document formatting**: Best practices for professional documents
- **General writing help**: Grammar, tone, clarity, conciseness

Rules:
1. Keep responses SHORT and actionable (3-5 bullet points or 2-3 short paragraphs max)
2. Use markdown formatting for clarity
3. Be direct — no filler phrases
4. If asked something outside your scope, politely redirect to writing/document topics
5. When giving examples, keep them brief`;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// POST /api/chat — Send a message to the chatbot
router.post('/', authMiddleware, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { message, history } = req.body as {
      message: string;
      history?: ChatMessage[];
    };

    if (!message || !message.trim()) {
      res.status(400).json({ message: 'Message is required' });
      return;
    }

    const apiKey = env.GROQ_CHAT_API_KEY;
    if (!apiKey) {
      res.status(503).json({ message: 'Chat service is not configured' });
      return;
    }

    // Build messages array with system prompt + history + new message
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...(history || []).slice(-10), // Keep last 10 messages for context
      { role: 'user', content: message.trim() },
    ];

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages,
        max_tokens: 500,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Groq Chat API error:', response.status, errorData);
      res.status(502).json({ message: 'Chat service temporarily unavailable' });
      return;
    }

    const data = await response.json() as any;
    const reply = data.choices?.[0]?.message?.content || 'Sorry, I could not generate a response.';

    res.json({ reply });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ message: 'Chat service error' });
  }
});

export default router;

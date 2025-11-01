import Anthropic from '@anthropic-ai/sdk';
import OpenAI from 'openai';

// AI Provider configuration
const AI_PROVIDER = (process.env.AI_PROVIDER || 'openai').toLowerCase();

// Initialize clients
let anthropicClient: Anthropic | null = null;
let openaiClient: OpenAI | null = null;

if (AI_PROVIDER === 'claude' || AI_PROVIDER === 'anthropic') {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.warn('[AI] Anthropic API key not found');
  } else {
    anthropicClient = new Anthropic({ apiKey });
  }
} else if (AI_PROVIDER === 'openai') {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.warn('[AI] OpenAI API key not found');
  } else {
    openaiClient = new OpenAI({ apiKey });
  }
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatCompletionOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

/**
 * Universal chat completion function that works with both Claude and OpenAI
 */
export async function chatCompletion(
  messages: ChatMessage[],
  options: ChatCompletionOptions = {}
): Promise<string> {
  const {
    model,
    temperature = 0.7,
    maxTokens = 1000,
  } = options;

  if (AI_PROVIDER === 'claude' || AI_PROVIDER === 'anthropic') {
    if (!anthropicClient) {
      throw new Error('Anthropic client not initialized. Check ANTHROPIC_API_KEY.');
    }

    // Convert messages format for Claude
    const systemMessages = messages.filter(m => m.role === 'system');
    const nonSystemMessages = messages.filter(m => m.role !== 'system');
    
    const response = await anthropicClient.messages.create({
      model: model || 'claude-3-5-sonnet-20241022',
      max_tokens: maxTokens,
      temperature,
      system: systemMessages.map(m => m.content).join('\n'),
      messages: nonSystemMessages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    });

    const firstContent = response.content[0];
    return firstContent.type === 'text' ? firstContent.text : '';
  } else {
    if (!openaiClient) {
      throw new Error('OpenAI client not initialized. Check OPENAI_API_KEY.');
    }

    const response = await openaiClient.chat.completions.create({
      model: model || 'gpt-4-turbo-preview',
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
      })),
      temperature,
      max_tokens: maxTokens,
    });

    return response.choices[0]?.message?.content || '';
  }
}

/**
 * Generate embeddings for text (for semantic search)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  if (AI_PROVIDER === 'claude' || AI_PROVIDER === 'anthropic') {
    // Claude doesn't have native embeddings, use OpenAI as fallback
    if (!openaiClient) {
      if (!process.env.OPENAI_API_KEY) {
        throw new Error('OpenAI API key required for embeddings. Set OPENAI_API_KEY.');
      }
      openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }
  }

  if (!openaiClient) {
    throw new Error('OpenAI client required for embeddings');
  }

  const response = await openaiClient.embeddings.create({
    model: 'text-embedding-ada-002',
    input: text,
  });

  return response.data[0].embedding;
}

/**
 * Parse JSON response from AI (handles markdown code blocks)
 */
export function parseAIJson<T>(response: string): T {
  try {
    // Remove markdown code blocks if present
    const cleaned = response
      .replace(/```json\n?/g, '')
      .replace(/```\n?/g, '')
      .trim();
    
    return JSON.parse(cleaned);
  } catch (error) {
    console.error('[AI] Failed to parse JSON:', response);
    throw new Error('Invalid JSON response from AI');
  }
}

export const aiProvider = {
  chatCompletion,
  generateEmbedding,
  parseAIJson,
  provider: AI_PROVIDER,
};

export default aiProvider;

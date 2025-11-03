import OpenAI from 'openai';

// AI Provider configuration
const AI_PROVIDER = (process.env.AI_PROVIDER || 'openai').toLowerCase();

// Initialize clients
let openaiClient: OpenAI | null = null;

if (AI_PROVIDER === 'openai') {
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

/**
 * Generate embeddings for text (for semantic search)
 */
export async function generateEmbedding(text: string): Promise<number[]> {
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

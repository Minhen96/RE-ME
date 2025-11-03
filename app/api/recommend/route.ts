import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion, generateEmbedding, parseAIJson } from '@/lib/aiProvider';

export async function POST(request: NextRequest) {
  try {
    const { userId, prompt } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    const queryEmbedding = await generateEmbedding(
      prompt || 'What should I focus on next?'
    );

    let memories = [];
    try {
      const { data } = await supabase.rpc('match_memories', {
        query_embedding: queryEmbedding,
        match_threshold: 0.7,
        match_count: 5,
        filter_user_id: userId,
      });
      memories = data || [];
    } catch (err) {
      console.warn('Memory search failed, continuing without context:', err);
    }

    const context = memories.map((m: any) => m.content).join('') || 'No previous activities found.';

    const aiResponse = await chatCompletion([
      {
        role: 'system',
        content: 'You are a supportive growth coach. Return JSON with: recommendations (array of 3-5 specific suggestions), motivational_quote (encouraging message). Return ONLY valid JSON.',
      },
      {
        role: 'user',
        content: 'Recent journey:' + context + 'Question: ' + (prompt || 'What should I focus on next?'),
      },
    ]);

    const result = parseAIJson(aiResponse);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to get recommendations' },
      { status: 500 }
    );
  }
}

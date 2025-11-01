import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion, generateEmbedding, parseAIJson } from '@/lib/aiProvider';

export async function POST(request: NextRequest) {
try {
    const { userId, text } = await request.json();

    if (!userId || !text) {
    return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
    );
    }

    const supabase = getServiceRoleClient();

    // Call AI to analyze reflection
    const aiResponse = await chatCompletion([
    {
        role: 'system',
        content: `You are a compassionate reflection analyzer. Analyze the user's reflection and return JSON with:
- ai_summary: A warm, empathetic summary (2-3 sentences)
- emotion: Primary emotion detected (e.g., "calm", "joyful", "contemplative", "grateful")
- sentiment_score: Float from -1 (negative) to 1 (positive)

Return ONLY valid JSON, no markdown.`,
    },
    {
        role: 'user',
        content: text,
    },
    ]);

    const analysis = parseAIJson<{
    ai_summary: string;
    emotion: string;
    sentiment_score: number;
    }>(aiResponse);

    // Save reflection
    const { data: reflection, error: reflectionError } = await supabase
    .from('reflections')
    .insert({
        user_id: userId,
        text,
        ai_summary: analysis.ai_summary,
        emotion: analysis.emotion,
        sentiment_score: analysis.sentiment_score,
    })
    .select()
    .single();

    if (reflectionError) throw reflectionError;

    // Create embedding and save to memories
    const embedding = await generateEmbedding(
    `Reflection (${analysis.emotion}): ${text}`
    );

    await supabase.from('user_memories').insert({
    user_id: userId,
    source_type: 'reflection',
    source_id: reflection.id,
    content: analysis.ai_summary,
    embedding,
    });

    return NextResponse.json(analysis);
} catch (error) {
    console.error('Error analyzing reflection:', error);
    return NextResponse.json(
    { error: 'Failed to analyze reflection' },
    { status: 500 }
    );
}
}
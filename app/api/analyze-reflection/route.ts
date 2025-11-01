import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion, generateEmbedding, parseAIJson } from '@/lib/aiProvider';

export async function POST(request: NextRequest) {
try {
    const { userId, text, manualEmotion } = await request.json();

    if (!userId || !text) {
    return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
    );
    }

    const supabase = getServiceRoleClient();

    let emotion = '';
    let sentiment_score = 0;
    let ai_summary = '';

    // If user provided manual emotion, use it
    if (manualEmotion !== null && manualEmotion !== undefined) {
      sentiment_score = manualEmotion;

      // Map score to emotion label
      if (manualEmotion < -0.6) emotion = 'very sad';
      else if (manualEmotion < -0.2) emotion = 'melancholic';
      else if (manualEmotion < 0.2) emotion = 'calm';
      else if (manualEmotion < 0.6) emotion = 'content';
      else emotion = 'joyful';

      // Still generate summary even with manual emotion
      const summaryResponse = await chatCompletion([
        {
          role: 'system',
          content: `You are a compassionate reflection analyzer. Provide a warm, empathetic summary (2-3 sentences) of the user's reflection. Return ONLY the summary text, no JSON.`,
        },
        {
          role: 'user',
          content: text,
        },
      ]);
      ai_summary = summaryResponse;
    } else {
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

      emotion = analysis.emotion;
      sentiment_score = analysis.sentiment_score;
      ai_summary = analysis.ai_summary;
    }

    // Save reflection
    const { data: reflection, error: reflectionError } = await supabase
    .from('reflections')
    .insert({
        user_id: userId,
        text,
        ai_summary,
        emotion,
        sentiment_score,
    })
    .select()
    .single();

    if (reflectionError) throw reflectionError;

    // Create embedding and save to memories
    const embedding = await generateEmbedding(
    `Reflection (${emotion}): ${text}`
    );

    await supabase.from('user_memories').insert({
    user_id: userId,
    source_type: 'reflection',
    source_id: reflection.id,
    content: ai_summary,
    embedding,
    });

    return NextResponse.json({
      ai_summary,
      emotion,
      sentiment_score,
    });
} catch (error) {
    console.error('Error analyzing reflection:', error);
    return NextResponse.json(
    { error: 'Failed to analyze reflection' },
    { status: 500 }
    );
}
}
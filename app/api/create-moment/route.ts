import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion, generateEmbedding, parseAIJson } from '@/lib/aiProvider';

export async function POST(request: NextRequest) {
  try {
    const { userId, text, imagePath, manualEmotion } = await request.json();

    if (!userId || !text) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    let emotion = '';
    let sentiment_score = 0;

    // If user provided manual emotion, use it
    if (manualEmotion !== null && manualEmotion !== undefined) {
      sentiment_score = manualEmotion;

      // Map score to emotion label
      if (manualEmotion < -0.6) emotion = 'very sad';
      else if (manualEmotion < -0.2) emotion = 'sad';
      else if (manualEmotion < 0.2) emotion = 'neutral';
      else if (manualEmotion < 0.6) emotion = 'happy';
      else emotion = 'very happy';
    } else {
      // AI analyzes emotion
      const aiResponse = await chatCompletion([
        {
          role: 'system',
          content: `Analyze this happy moment and return JSON with:
- emotion: Primary emotion (e.g., "joyful", "grateful", "peaceful", "excited")
- sentiment_score: Float from -1 (negative) to 1 (positive)

Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: text,
        },
      ]);

      const analysis = parseAIJson<{
        emotion: string;
        sentiment_score: number;
      }>(aiResponse);

      emotion = analysis.emotion;
      sentiment_score = analysis.sentiment_score;
    }

    // Save moment
    const { data: moment, error: momentError } = await supabase
      .from('moments')
      .insert({
        user_id: userId,
        text,
        image_path: imagePath,
        emotion,
        sentiment_score,
      })
      .select()
      .single();

    if (momentError) throw momentError;

    // Create embedding and save to memories
    const embedding = await generateEmbedding(
      `Happy moment (${emotion}): ${text}`
    );

    await supabase.from('user_memories').insert({
      user_id: userId,
      source_type: 'moment',
      source_id: moment.id,
      content: text,
      embedding,
    });

    return NextResponse.json({
      emotion,
      sentiment_score,
      moment_id: moment.id,
    });
  } catch (error) {
    console.error('Error creating moment:', error);
    return NextResponse.json(
      { error: 'Failed to create moment' },
      { status: 500 }
    );
  }
}

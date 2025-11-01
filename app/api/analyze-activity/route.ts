import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion, generateEmbedding, parseAIJson } from '@/lib/aiProvider';

export async function POST(request: NextRequest) {
try {
    const { userId, hobbyId, text, imagePath } = await request.json();

    if (!userId || !hobbyId || !text) {
    return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
    );
    }

    const supabase = getServiceRoleClient();

    // Get hobby details
    const { data: hobby, error: hobbyError } = await supabase
    .from('hobbies')
    .select('*')
    .eq('id', hobbyId)
    .single();

    if (hobbyError || !hobby) {
    return NextResponse.json(
        { error: 'Hobby not found' },
        { status: 404 }
    );
    }

    // Call AI to analyze activity
    const aiResponse = await chatCompletion([
    {
        role: 'system',
        content: `You are an expert at analyzing hobby activities and providing encouraging feedback.
Analyze the user's activity and return a JSON object with:
- summary: A brief, encouraging summary (1-2 sentences)
- skills: Array of specific skills demonstrated (e.g., ["composition", "lighting"] for photography)
- suggested_next: Array of 2-3 suggestions for next activities

Return ONLY valid JSON, no markdown.`,
    },
    {
        role: 'user',
        content: `Hobby: ${hobby.name}
Activity: ${text}

Please analyze this activity.`,
    },
    ]);

    const analysis = parseAIJson<{
    summary: string;
    skills: string[];
    suggested_next: string[];
    }>(aiResponse);

    // Calculate EXP (base 10 per skill, +5 for depth, +3 for consistency)
    const baseExp = analysis.skills.length * 10;
    const depthBonus = text.length > 100 ? 5 : 0;
    const exp_gained = baseExp + depthBonus;

    // Save activity log
    const { data: activity, error: activityError } = await supabase
    .from('activity_logs')
    .insert({
        user_id: userId,
        hobby_id: hobbyId,
        text,
        image_path: imagePath,
        ai_summary: analysis.summary,
        ai_skills: analysis.skills,
        exp_gained,
    })
    .select()
    .single();

    if (activityError) throw activityError;

    // Update hobby EXP and level
    const newExp = hobby.exp + exp_gained;
    const levelThresholds = hobby.meta.level_thresholds || [100, 250, 500, 1000];
    let newLevel = hobby.level;

    for (let i = 0; i < levelThresholds.length; i++) {
    if (newExp >= levelThresholds[i]) {
        newLevel = i + 1;
    }
    }

    await supabase
    .from('hobbies')
    .update({ exp: newExp, level: newLevel })
    .eq('id', hobbyId);

    // Create embedding and save to memories
    const embedding = await generateEmbedding(
    `${hobby.name}: ${text}. Skills: ${analysis.skills.join(', ')}`
    );

    await supabase.from('user_memories').insert({
    user_id: userId,
    source_type: 'activity',
    source_id: activity.id,
    content: `${hobby.name}: ${analysis.summary}`,
    embedding,
    });

    return NextResponse.json({
    summary: analysis.summary,
    skills: analysis.skills,
    exp_gained,
    new_level: newLevel,
    total_exp: newExp,
    suggested_next: analysis.suggested_next,
    });
} catch (error) {
    console.error('Error analyzing activity:', error);
    return NextResponse.json(
    { error: 'Failed to analyze activity' },
    { status: 500 }
    );
}
}
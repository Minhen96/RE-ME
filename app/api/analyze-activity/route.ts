import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion, generateEmbedding, parseAIJson } from '@/lib/aiProvider';
import { calculateLevelFromExp } from '@/lib/levelUtils';

export async function POST(request: NextRequest) {
try {
    const { userId, hobbyId, text, imagePath, splitActivities } = await request.json();

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

    // If splitActivities is provided, process multiple activities
    if (splitActivities && Array.isArray(splitActivities) && splitActivities.length > 0) {
        const results = [];
        let totalExpGained = 0;
        
        for (const activityText of splitActivities) {
            if (!activityText.trim()) continue;
            
            const result = await processSingleActivityWithoutHobbyUpdate(
                supabase,
                hobby,
                userId,
                hobbyId,
                activityText.trim(),
                imagePath
            );
            
            totalExpGained += result.exp_gained;
            results.push(result);
        }
        
        // Update hobby EXP and level once after all activities
        const newExp = hobby.exp + totalExpGained;
        const newLevel = calculateLevelFromExp(newExp, hobby.meta?.level_thresholds);

        await supabase
            .from('hobbies')
            .update({ exp: newExp, level: newLevel })
            .eq('id', hobbyId);
        
        return NextResponse.json({
            split: true,
            activities: results.map(r => ({
                summary: r.summary,
                skills: r.skills,
                exp_gained: r.exp_gained,
            })),
            total_exp_gained: totalExpGained,
            new_level: newLevel,
            total_exp: newExp,
        });
    }

    // First, check if text contains multiple activities
    const splitCheck = await chatCompletion([
        {
            role: 'system',
            content: `Analyze if the text describes multiple distinct activities that should be split into separate logs.
Return JSON:
- should_split: boolean (true if text contains 2+ distinct activities)
- activities: array of activity texts if should_split is true (empty array if false)
- confidence: float 0-1 indicating confidence in split decision

Look for indicators like: "then", "also", "and", "after", "next", "first... then", "both", commas separating activities, etc.

Return ONLY valid JSON, no markdown.`,
        },
        {
            role: 'user',
            content: `Activity text: ${text}

Does this contain multiple distinct activities that should be logged separately?`,
        },
    ]);

    const splitAnalysis = parseAIJson<{
        should_split: boolean;
        activities: string[];
        confidence: number;
    }>(splitCheck);

    // If should split and confidence is good, return split proposal
    if (splitAnalysis.should_split && splitAnalysis.activities.length > 1 && splitAnalysis.confidence > 0.75) {
        return NextResponse.json({
            should_split: true,
            activities: splitAnalysis.activities,
            confidence: splitAnalysis.confidence,
        });
    }

    // Process as single activity
    const result = await processSingleActivity(
        supabase,
        hobby,
        userId,
        hobbyId,
        text,
        imagePath
    );

    return NextResponse.json(result);
} catch (error) {
    console.error('Error analyzing activity:', error);
    return NextResponse.json(
        { error: 'Failed to analyze activity' },
        { status: 500 }
    );
}
}

async function processSingleActivityWithoutHobbyUpdate(
    supabase: any,
    hobby: any,
    userId: string,
    hobbyId: string,
    text: string,
    imagePath?: string
) {
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

    return {
        summary: analysis.summary,
        skills: analysis.skills,
        exp_gained,
        suggested_next: analysis.suggested_next,
    };
}

async function processSingleActivity(
    supabase: any,
    hobby: any,
    userId: string,
    hobbyId: string,
    text: string,
    imagePath?: string
) {
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
    const newLevel = calculateLevelFromExp(newExp, hobby.meta?.level_thresholds);

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

    return {
        summary: analysis.summary,
        skills: analysis.skills,
        exp_gained,
        new_level: newLevel,
        total_exp: newExp,
        suggested_next: analysis.suggested_next,
    };
}
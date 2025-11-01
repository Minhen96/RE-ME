import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion, parseAIJson, generateEmbedding } from '@/lib/aiProvider';
import { generateLevelThresholds } from '@/lib/levelUtils';

export async function POST(request: NextRequest) {
  try {
    const { userId, hobbyName, experience } = await request.json();

    if (!userId || !hobbyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    // Generate dynamic level thresholds (supports unlimited levels)
    // Formula: Small increments that gradually increase
    // Level 1: 12 EXP, Level 2: 26 EXP (+14), Level 3: 42 EXP (+16), etc.
    const STANDARD_LEVEL_THRESHOLDS = generateLevelThresholds(10);

    // Call AI to generate hobby metadata
    const aiResponse = await chatCompletion([
      {
        role: 'system',
        content: `You are an expert at categorizing hobbies and defining skill progression.
Return a JSON object with:
- formatted_name: Properly capitalized hobby name with suitable emoji prefix (e.g., "🎸 Guitar", "📸 Photography", "🍳 Cooking")
- category: The hobby category (e.g., "Creative", "Physical", "Intellectual", "Social")
- description: A brief, encouraging description (1-2 sentences)
- subskills: Array of 5-7 specific subskills to develop

Return ONLY valid JSON, no markdown.`,
      },
      {
        role: 'user',
        content: `Hobby name: ${hobbyName}`,
      },
    ]);

    const meta = parseAIJson<{
      formatted_name: string;
      category: string;
      description: string;
      subskills: string[];
    }>(aiResponse);

    // Analyze experience if provided
    let initialLevel = 0;
    let initialExp = 0;
    let initialActivityLogs: Array<{ text: string; summary: string; skills: string[] }> = [];

    if (experience && experience.trim()) {
      // Analyze experience to determine level and exp
      const experienceAnalysis = await chatCompletion([
        {
          role: 'system',
          content: `Analyze the user's experience with this hobby and return a JSON object:
- initial_level: Integer 0-4 based on experience (0=beginner, 1=novice, 2=intermediate, 3=advanced, 4=expert)
- initial_exp: Integer EXP points (0-1000+) based on experience depth
- activity_summaries: Array of 3-7 past experience summaries as separate activities (each as object with: text, summary, skills)

For activity_summaries:
- Extract key past experiences/milestones from the description
- Each activity should represent a distinct past experience or achievement
- text: A brief description of the past activity
- summary: AI-generated summary of that activity
- skills: Array of skills demonstrated in that activity

Return ONLY valid JSON, no markdown.`,
        },
        {
          role: 'user',
          content: `Hobby: ${meta.formatted_name}
User's experience: ${experience}

Analyze their experience level and extract key past activities.`,
        },
      ]);

      const experienceData = parseAIJson<{
        initial_level: number;
        initial_exp: number;
        activity_summaries: Array<{ text: string; summary: string; skills: string[] }>;
      }>(experienceAnalysis);

      initialLevel = Math.min(Math.max(experienceData.initial_level, 0), 4);
      initialExp = Math.max(experienceData.initial_exp, 0);
      initialActivityLogs = experienceData.activity_summaries || [];
    }

    // Create hobby in database
    const { data: hobby, error } = await supabase
      .from('hobbies')
      .insert({
        user_id: userId,
        name: meta.formatted_name, // Use AI-formatted name with emoji
        category: meta.category,
        description: meta.description,
        level: initialLevel,
        exp: initialExp,
        meta: {
          subskills: meta.subskills,
          level_thresholds: STANDARD_LEVEL_THRESHOLDS,
        },
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Hobby already exists' },
          { status: 409 }
        );
      }
      throw error;
    }

    // Generate initial activity logs if experience was provided
    if (initialActivityLogs.length > 0) {
      const activityPromises = initialActivityLogs.map(async (activityData) => {
        // Calculate EXP for each activity (similar to analyze-activity logic)
        const baseExp = activityData.skills.length * 10;
        const depthBonus = activityData.text.length > 100 ? 5 : 0;
        const expGained = baseExp + depthBonus;

        // Create activity log
        const { data: activity, error: activityError } = await supabase
          .from('activity_logs')
          .insert({
            user_id: userId,
            hobby_id: hobby.id,
            text: activityData.text + ' (Past experience - added when creating hobby)',
            ai_summary: activityData.summary,
            ai_skills: activityData.skills,
            exp_gained: 0, // No exp gained from past experiences
            created_at: new Date().toISOString(), // Current date
          })
          .select()
          .single();

        if (!activityError && activity) {
          // Create embedding for memory
          const embedding = await generateEmbedding(
            `${hobby.name}: ${activityData.text}. Skills: ${activityData.skills.join(', ')}`
          );

          await supabase.from('user_memories').insert({
            user_id: userId,
            source_type: 'activity',
            source_id: activity.id,
            content: `${hobby.name}: ${activityData.summary}`,
            embedding,
          });
        }
      });

      // Create all activity logs (don't await, do in background)
      Promise.all(activityPromises).catch(err => {
        console.error('Error creating initial activity logs:', err);
      });
    }

    return NextResponse.json({ hobby });
  } catch (error) {
    console.error('Error creating hobby:', error);
    return NextResponse.json(
      { error: 'Failed to create hobby' },
      { status: 500 }
    );
  }
}

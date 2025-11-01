import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion, parseAIJson } from '@/lib/aiProvider';

export async function POST(request: NextRequest) {
  try {
    const { userId, hobbyName } = await request.json();

    if (!userId || !hobbyName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

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
- level_thresholds: Array of 4 EXP thresholds for levels 1-4 (e.g., [100, 250, 500, 1000])

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
      level_thresholds: number[];
    }>(aiResponse);

    // Create hobby in database
    const { data: hobby, error } = await supabase
      .from('hobbies')
      .insert({
        user_id: userId,
        name: meta.formatted_name, // Use AI-formatted name with emoji
        category: meta.category,
        description: meta.description,
        meta: {
          subskills: meta.subskills,
          level_thresholds: meta.level_thresholds,
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

    return NextResponse.json({ hobby });
  } catch (error) {
    console.error('Error creating hobby:', error);
    return NextResponse.json(
      { error: 'Failed to create hobby' },
      { status: 500 }
    );
  }
}

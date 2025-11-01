import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion, ChatMessage } from '@/lib/aiProvider';
import { analyzeUserCharacteristics } from '@/lib/userCharacteristics';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();

    // Fetch user data
    const [
      { data: profile },
      { data: hobbies },
      { data: activities },
      { data: moments },
      { data: reflections }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('hobbies').select('*').eq('user_id', userId),
      supabase.from('activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(10),
      supabase.from('moments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('reflections').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    ]);

    // Analyze user characteristics
    const characteristics = analyzeUserCharacteristics(hobbies || [], activities || []);

    // Build context for AI
    const currentHobbies = hobbies?.map(h => `${h.name} (${h.category})`).join(', ') || 'None yet';
    const recentActivities = activities?.map(a => a.text).join('; ') || 'None yet';
    const recentMoments = moments?.map(m => m.text).join('; ') || 'None yet';

    // Generate recommendations
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: `You are an expert hobby advisor who helps people discover new hobbies that match their personality and interests.

Analyze the user's current hobbies, activities, and personality traits to recommend 5 NEW hobbies they would enjoy.

Return ONLY a valid JSON array with this structure:
[
  {
    "name": "Hobby Name",
    "category": "Creative|Physical|Intellectual|Social|Other",
    "difficulty": "Easy|Medium|Hard",
    "reason": "2-3 sentences explaining why this hobby fits the user based on their personality and current interests",
    "benefits": ["benefit 1", "benefit 2", "benefit 3"]
  }
]

Guidelines:
- Recommend hobbies they DON'T already have
- Match their personality traits and dominant characteristics
- Vary difficulty levels (mix of easy, medium, hard)
- Mix categories to provide diverse options
- Make reasons personal and specific to their profile
- Benefits should be concrete and relevant

Return ONLY the JSON array, no markdown or explanations.`,
      },
      {
        role: 'user',
        content: `User Profile:
Name: ${profile?.display_name || 'Friend'}

Current Hobbies: ${currentHobbies}

Personality Traits:
${characteristics.personalityTraits.map(t => `- ${t.trait}: ${t.value.toFixed(0)}/100`).join('\n')}

Dominant Characteristics: ${characteristics.dominantTraits.join(', ')}

Activity Focus:
${characteristics.activityPreferences.map(p => `- ${p.name}: ${p.value.toFixed(1)}%`).join('\n')}

Recent Activities: ${recentActivities}

What brings them joy: ${recentMoments}

Recommend 5 NEW hobbies that would be perfect for this person.`,
      },
    ];

    const aiResponse = await chatCompletion(messages, {
      maxTokens: 2000,
      temperature: 0.8,
    });

    // Parse AI response
    let recommendations;
    try {
      const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleaned);
    } catch (error) {
      console.error('Failed to parse AI response:', aiResponse);
      return NextResponse.json(
        { error: 'Failed to generate recommendations' },
        { status: 500 }
      );
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('Error generating hobby recommendations:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion } from '@/lib/aiProvider';

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

    // Calculate stats
    const totalHobbies = hobbies?.length || 0;
    const totalActivities = activities?.length || 0;
    const totalLevel = hobbies?.reduce((sum, h) => sum + h.level, 0) || 0;
    const avgSentiment = moments?.reduce((sum, m) => sum + (m.sentiment_score || 0), 0) / (moments?.length || 1);

    // Build context for AI
    const hobbyList = hobbies?.map(h => `${h.name} (Lv ${h.level}, ${h.category})`).join(', ') || 'None yet';
    const recentActivities = activities?.map(a => a.text).join('; ') || 'None yet';
    const recentMoments = moments?.map(m => m.text).join('; ') || 'None yet';
    const recentReflections = reflections?.map(r => r.text).join('; ') || 'None yet';

    // Generate AI summary
    const aiResponse = await chatCompletion([
      {
        role: 'system',
        content: `You are a supportive life coach analyzing a user's personal growth journey. Generate a warm, encouraging, and personalized summary (2-3 sentences) based on their data. Focus on:
- Their hobby diversity and progress
- Patterns in their activities
- Emotional growth (based on reflections and moments)
- Meaningful insights and encouragement for continued growth

Be specific, warm, and genuine. Avoid generic platitudes.`,
      },
      {
        role: 'user',
        content: `User: ${profile?.display_name}

Hobbies (${totalHobbies}): ${hobbyList}
Total Level: ${totalLevel}
Recent Activities: ${recentActivities}
Recent Happy Moments: ${recentMoments}
Recent Reflections: ${recentReflections}
Average Sentiment: ${avgSentiment.toFixed(2)}

Generate a personalized journey summary for this user.`,
      },
    ]);

    return NextResponse.json({ summary: aiResponse });
  } catch (error) {
    console.error('Error generating profile summary:', error);
    return NextResponse.json(
      { error: 'Failed to generate summary' },
      { status: 500 }
    );
  }
}

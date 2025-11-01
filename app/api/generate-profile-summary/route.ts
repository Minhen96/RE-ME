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
      { data: allActivities },
      { data: moments },
      { data: reflections }
    ] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('hobbies').select('*').eq('user_id', userId),
      supabase.from('activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('moments').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
      supabase.from('reflections').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(5),
    ]);

    const activities = allActivities || [];
    const recentActivities = activities.slice(0, 10);
    const earliestActivities = activities.length > 10 ? activities.slice(-3) : [];

    // Calculate stats
    const totalHobbies = hobbies?.length || 0;
    const totalActivities = activities?.length || 0;
    const totalLevel = hobbies?.reduce((sum, h) => sum + h.level, 0) || 0;
    const reflectionsList = reflections || [];
    const avgSentiment = reflectionsList.length > 0 
      ? reflectionsList.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / reflectionsList.length 
      : 0;

    // Build context for AI
    const hobbyList = hobbies?.map(h => `${h.name} (Lv ${h.level}, ${h.category})`).join(', ') || 'None yet';
    const recentActivitiesText = recentActivities.map(a => a.text).filter(Boolean).join('; ') || 'None yet';
    const earliestActivitiesText = earliestActivities.map(a => a.text).filter(Boolean).join('; ') || 'None yet';
    const recentMoments = moments?.map(m => m.text).filter(Boolean).join('; ') || 'None yet';
    const recentReflections = reflections?.map(r => r.text).filter(Boolean).join('; ') || 'None yet';
    
    // Calculate growth metrics
    const hobbyGrowth = hobbies?.map(h => {
      const hobbyActivities = activities.filter(a => a.hobby_id === h.id);
      // Earliest activity is the last one in descending order (oldest)
      const earliestHobbyActivity = hobbyActivities.length > 0 ? hobbyActivities[hobbyActivities.length - 1] : null;
      return {
        name: h.name,
        currentLevel: h.level,
        totalActivities: hobbyActivities.length,
      };
    }).filter(h => h.totalActivities > 0) || [];

    // Get emotion patterns from reflections
    const emotions = reflectionsList.map(r => r.emotion).filter(Boolean) || [];
    const emotionCounts = emotions.reduce((acc: Record<string, number>, emotion) => {
      acc[emotion] = (acc[emotion] || 0) + 1;
      return acc;
    }, {});
    const dominantEmotions = Object.entries(emotionCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([emotion]) => emotion);

    // Get top hobbies by level
    const topHobbies = hobbies?.sort((a, b) => b.level - a.level).slice(0, 3) || [];

    // Generate AI summary
    const aiResponse = await chatCompletion([
      {
        role: 'system',
        content: `You are a wise, friendly observer who sees deeply into a person's soul. Describe the user's inner essence, the user's growth, and who the user is becoming. 

Write as a wise friend who truly sees the user:
- Describe the user's soul - the user's inner essence, what drives the user, who the user is at their core
- Observe the user's emotional landscape - the user's inner world, what lights the user up, what moves the user
- Notice the user's growth - how the user's soul has evolved, deepened, expanded
- Be warm and friendly, but also wise and insightful
- Use natural, flowing language that feels genuine and thoughtful
- Write in third person, describing "the user's soul" or "the user" - like you're thoughtfully observing and describing who the user is

Format:
- Free flowing paragraphs - let thoughts flow naturally without rigid structure
- Keep it concise - 4-5 short paragraphs or 6-8 sentences total
- Use minimal emojis (2-5 total, to add warmth)
- Use line breaks naturally where thoughts shift
- Focus on the inner person, not activities - what the user's choices reveal about the user's soul
- Avoid AI-sounding phrases - be genuine and thoughtful`,
      },
      {
        role: 'user',
        content: `Describe the soul of ${profile?.display_name || 'this person'}${profile?.mbti ? ` (${profile.mbti})` : ''}${profile?.age ? `, ${profile.age} years old` : ''}:

Their Journey:
${earliestActivities.length > 0 ? `The user started with: ${earliestActivitiesText}` : 'Beginning the user path'}

Current Expression:
Their passions: ${topHobbies.map(h => `${h.name} (Level ${h.level})`).join(', ') || 'Exploring new interests'}
${totalActivities > 0 ? `Through ${totalActivities} activities, their soul shows: ${recentActivitiesText || 'dedication to growth'}` : 'Just starting to explore'}
What brings them joy: ${recentMoments || 'Finding moments of happiness'}
Their inner reflections reveal: ${recentReflections || 'A soul that contemplates'}
Emotional essence: ${dominantEmotions.join(', ') || 'Developing self-awareness'}

Growth Story:
${hobbyGrowth.map(h => `In ${h.name}, they've grown from beginner to Level ${h.currentLevel} through ${h.totalActivities} experiences`).join('\n') || 'Their soul is beginning to unfold'}

Write a free-flowing description of their soul - who they are inside, how they've grown, what moves them. Be friendly and wise.`,
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

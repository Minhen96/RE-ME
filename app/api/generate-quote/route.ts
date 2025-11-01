import { NextRequest, NextResponse } from 'next/server';
import { getServiceRoleClient } from '@/lib/supabaseClient';
import { chatCompletion } from '@/lib/aiProvider';

export async function POST(request: NextRequest) {
  try {
    const { userId, refresh } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      );
    }

    const supabase = getServiceRoleClient();
    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    // Check if today's quote already exists
    const { data: existingQuote } = await supabase
      .from('daily_quotes')
      .select('*')
      .eq('user_id', userId)
      .eq('date', today)
      .single();

    // If quote exists and refresh not requested, return it
    if (existingQuote && !refresh) {
      return NextResponse.json({ quote: existingQuote.text, attribution: existingQuote.attribution });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    // Get recent memories (last 10)
    const { data: memories } = await supabase
      .from('user_memories')
      .select('content, source_type')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    // Get hobbies
    const { data: hobbies } = await supabase
      .from('hobbies')
      .select('name, category, level')
      .eq('user_id', userId);

    // Get recent reflections
    const { data: reflections } = await supabase
      .from('reflections')
      .select('emotion, sentiment_score')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);

    // Build context for AI
    const hobbyList = hobbies?.map(h => `${h.name} (${h.category}, Lv ${h.level})`).join(', ') || 'exploring new interests';
    const memoryContext = memories?.map(m => m.content).join('; ') || 'beginning their journey';
    const recentEmotions = reflections?.map(r => r.emotion).join(', ') || 'calm';
    const avgSentiment = reflections?.length
      ? reflections.reduce((sum, r) => sum + (r.sentiment_score || 0), 0) / reflections.length
      : 0;

    // Generate AI personalized daily quote
    const quoteResponse = await chatCompletion([
      {
        role: 'system',
        content: `
    You are a wise and encouraging mentor.
    Create **ONE short inspirational quote (1-2 sentences)** that resonates with the user's journey, interests, and emotional state.
    - Prefer quotes from famous people, authors, or movies.
    - Only if no suitable existing quote is found, you may generate a new one. 
    - In that case, set the "attribution" field to "RE:ME".
    - Do NOT include markdown, code fences, or any extra text.
    - Return ONLY a valid JSON object in this exact format:
    {
      "text": "The quote here",
      "attribution": "Author, movie, or RE:ME"
    }
    - Make the quote fresh and encouraging, avoid repeating previous suggestions.
        `
          },
          {
            role: 'user',
            content: `User Profile:
        - Name: ${profile?.display_name || 'Friend'}
        - MBTI: ${profile?.mbti || 'Unknown'}
        - Hobbies: ${hobbyList}
        - Recent emotions: ${recentEmotions}
        - Overall sentiment: ${avgSentiment > 0.3 ? 'positive and growing' : avgSentiment < -0.3 ? 'reflective and resilient' : 'balanced and steady'}
        - Recent activities: ${memoryContext}

        Generate a unique personalized quote for this person in JSON format.`
          },
        ], {
      temperature: 0.8, // makes AI more creative
    });

    // Make sure quoteResponse is stringified JSON
    let quoteText = '';
    let attribution = '';

    try {
      const json = typeof quoteResponse === 'string' ? JSON.parse(quoteResponse) : quoteResponse;
      quoteText = json.text.trim();
      attribution = json.attribution?.trim() || '';
    } catch (err) {
      console.error('Failed to parse AI response', err);
      quoteText = 'Keep going!';
      attribution = '';
    }


    // Upsert today's quote for this user
    if (existingQuote) {
      await supabase
        .from('daily_quotes')
        .update({ text: quoteText, attribution })
        .eq('id', existingQuote.id);
    } else {
      await supabase
        .from('daily_quotes')
        .insert({ user_id: userId, date: today, text: quoteText, attribution });
    }

    return NextResponse.json({ quote: quoteText, attribution });

  } catch (error) {
    console.error('Error generating quote:', error);
    return NextResponse.json(
      { error: 'Failed to generate quote' },
      { status: 500 }
    );
  }
}

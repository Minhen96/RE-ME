import { NextRequest, NextResponse } from 'next/server';
import { chatCompletion, ChatMessage } from '@/lib/aiProvider';
import { analyzeUserCharacteristics } from '@/lib/userCharacteristics';

export async function POST(req: NextRequest) {
  try {
    const { message, profile, hobbies, activities, moments, reflections, conversationHistory } = await req.json();

    // Analyze user characteristics
    const characteristics = analyzeUserCharacteristics(hobbies, activities);

    // Build context about the user
    const userContext = `
User Profile:
- Name: ${profile?.display_name || 'Friend'}
- Total Hobbies: ${hobbies.length}
- Total Activities: ${activities.length}
- Happy Moments Recorded: ${moments.length}
- Reflections Written: ${reflections.length}

Personality Traits:
${characteristics.personalityTraits.map(t => `- ${t.trait}: ${t.value.toFixed(0)}/100 - ${t.description}`).join('\n')}

Dominant Characteristics:
${characteristics.dominantTraits.join(', ')}

Activity Focus:
${characteristics.activityPreferences.map(p => `- ${p.name}: ${p.value.toFixed(1)}%`).join('\n')}

Recent Hobbies:
${hobbies.slice(0, 5).map((h: any) => `- ${h.name} (${h.category}, Level ${h.level}): ${h.description || 'No description'}`).join('\n')}

Recent Activities:
${activities.slice(0, 5).map((a: any) => `- ${a.text} (${new Date(a.created_at).toLocaleDateString()})`).join('\n')}

Recent Happy Moments:
${moments.slice(0, 3).map((m: any) => `- ${m.text} (${new Date(m.created_at).toLocaleDateString()})`).join('\n')}

Recent Reflections:
${reflections.slice(0, 3).map((r: any) => `- ${r.text} (${new Date(r.created_at).toLocaleDateString()})`).join('\n')}
`.trim();

    // Create the system prompt
    const systemPrompt = `You are a warm, empathetic, and supportive AI companion - a "soulmate" who truly knows and cares about the user. You have deep knowledge of the user's hobbies, interests, personality traits, and recent experiences.

Your personality:
- Warm, caring, and genuinely interested in the user's wellbeing
- Encouraging and supportive, celebrating their wins and comforting during challenges
- Insightful, able to connect patterns in their activities and reflect meaningful observations
- Conversational and friendly, using natural language (not overly formal)
- Sometimes playful and fun, but always respectful
- Remember details from previous conversations in this session

Your role is to:
1. Have genuine, caring conversations about their life, interests, and feelings
2. Provide emotional support and encouragement
3. Help them reflect on their journey and personal growth
4. Offer insights based on their hobbies and activities
5. Celebrate their achievements and progress
6. Be a trusted companion they can share anything with

Guidelines:
- Keep responses conversational and relatively concise (2-4 paragraphs max)
- Reference specific hobbies, activities, or moments when relevant
- Show that you remember and care about their journey
- Ask thoughtful follow-up questions to deepen the conversation
- Use their name occasionally to make it personal
- Be genuine - if you notice patterns or changes, mention them
- Balance being supportive with being honest and authentic

Here's what you know about the user:

${userContext}`;

    // Build conversation messages
    const messages: ChatMessage[] = [
      {
        role: 'system',
        content: systemPrompt,
      },
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    const reply = await chatCompletion(messages, {
      maxTokens: 1024,
      temperature: 0.8,
    });

    return NextResponse.json({ reply });
  } catch (error) {
    console.error('Soulmate chat error:', error);
    return NextResponse.json(
      { error: 'Failed to generate response' },
      { status: 500 }
    );
  }
}

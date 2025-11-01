  # RE:ME - Your Self-Growth Journey 🌱

  A private, calm self-growth web app that helps you track hobbies, reflect on your journey, and visualize your
  personal growth through an interactive Life Tree.

  ## Features

  - 🎯 **Hobby Tracking** - Log activities with AI-driven interpretation
  - ⚡ **Dynamic EXP System** - Earn experience points and level up your hobbies
  - 🌙 **Daily Reflections** - Journal your thoughts with AI-powered emotional analysis
  - ❤️ **Happy Moments Gallery** - Capture and cherish your favorite memories
  - 🌳 **Life Tree Visualization** - Interactive D3.js tree showing your complete growth journey
  - 🤖 **AI-Powered Insights** - Get personalized recommendations based on your activities

  ## Tech Stack

  - **Frontend**: Next.js 14, React, TypeScript, TailwindCSS, Framer Motion
  - **Backend**: Supabase (Postgres, Auth, Storage, pgvector)
  - **AI**: OpenAI GPT-4 / Anthropic Claude (switchable)
  - **Visualization**: D3.js

  ## Setup Instructions

  ### 1. Clone and Install

  ```bash
  git clone <your-repo>
  cd reme
  npm install

  2. Environment Variables

  Your .env file already contains:
  SUPABASE_URL=https://uklpgchhzvqhbvebhpng.supabase.co
  SUPABASE_KEY=<your-anon-key>
  SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
  OPENAI_API_KEY=<your-openai-key>
  AI_PROVIDER=openai

  3. Database Setup

  Run the migrations in Supabase SQL Editor:

  # Copy contents of supabase/migrations.sql
  # Paste into Supabase SQL Editor and run

  Important: Also create the vector similarity search function:

  -- Add this to your Supabase SQL Editor
  create or replace function match_memories(
    query_embedding vector(1536),
    match_threshold float,
    match_count int,
    filter_user_id uuid
  )
  returns table (
    id uuid,
    content text,
    similarity float
  )
  language sql stable
  as $$
    select
      id,
      content,
      1 - (embedding <=> query_embedding) as similarity
    from user_memories
    where user_id = filter_user_id
      and 1 - (embedding <=> query_embedding) > match_threshold
    order by similarity desc
    limit match_count;
  $$;

  4. Run Development Server

  npm run dev

  Visit http://localhost:3000

  Switching AI Providers

  Using OpenAI (Default)

  AI_PROVIDER=openai
  OPENAI_API_KEY=sk-...

  Using Claude

  AI_PROVIDER=claude
  ANTHROPIC_API_KEY=sk-ant-...

  The app automatically switches between providers based on AI_PROVIDER setting.

  Project Structure

  ├── app/
  │   ├── onboarding/         # User onboarding flow
  │   ├── dashboard/          # Main dashboard
  │   ├── hobby/[id]/         # Individual hobby details
  │   ├── reflection/         # Daily reflection journal
  │   ├── moments/            # Happy moments gallery
  │   ├── tree/               # Life Tree visualization
  │   └── api/                # API routes (Edge Functions)
  ├── components/             # Reusable React components
  ├── lib/
  │   ├── supabaseClient.ts  # Supabase client setup
  │   ├── aiProvider.ts      # AI provider wrapper
  │   ├── api.ts             # API helper functions
  │   └── types.ts           # TypeScript definitions
  ├── supabase/
  │   └── migrations.sql     # Database schema
  └── styles/
      └── globals.css        # Global styles


  Deployment

  Deploy to Vercel

  1. Push to GitHub
  2. Import project in Vercel
  3. Add environment variables
  4. Deploy

  Environment Variables for Production

  Make sure to add all variables from .env to your Vercel project settings.

  Usage

  1. Onboarding - Set up your profile and add hobbies
  2. Log Activities - Click on a hobby card to log activities
  3. Daily Reflections - Visit /reflection to journal
  4. View Progress - Check your Life Tree at /tree
  5. Happy Moments - Capture memories at /moments

  Key Features Explained

  EXP System

  - Base EXP: 10 points per skill demonstrated
  - Depth Bonus: +5 for detailed activities (>100 chars)
  - AI analyzes each activity to identify skills

  Life Tree Visualization

  - Trunk: Overall growth
  - Branches: Individual hobbies
  - Leaves: Activities logged
  - Flowers: Reflections
  - Fruits: Happy moments

  AI Integration

  - Activity interpretation and skill extraction
  - Reflection emotional analysis
  - Personalized recommendations via semantic search
  - Auto-generated hobby metadata

  Troubleshooting

  Missing Environment Variables

  The app will log warnings if variables are missing. Check console output.

  Supabase Connection Issues

  Verify your SUPABASE_URL and SUPABASE_KEY are correct.

  AI API Errors

  - Check your API key is valid
  - Verify AI_PROVIDER matches your configured key
  - Monitor rate limits

  Contributing

  This is a personal project. Feel free to fork and customize for your own use!

  License

  MIT

  ---
  Built with ❤️ using Next.js and Supabase
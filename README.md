# RE:ME - Your Personal Growth Journey 🌱

**RE:ME** is an AI-powered self-growth companion that helps you track hobbies, reflect on your experiences, and visualize your personal development journey through beautiful interactive visualizations.

## 🎯 Problem Statement

In today's fast-paced world, people struggle to:
- **Track personal growth** across multiple hobbies and interests
- **Maintain motivation** without visible progress indicators
- **Reflect meaningfully** on their experiences and emotions
- **Understand themselves** through scattered activities and thoughts
- **Stay consistent** without personalized insights and encouragement

Traditional journaling apps are static, hobby trackers lack emotional depth, and productivity apps focus on tasks rather than personal fulfillment.

## ✨ Solution

RE:ME combines **AI intelligence** with **gamification** and **beautiful visualizations** to create a holistic personal growth platform:

- **🤖 AI-Powered Insights**: Analyzes your activities, extracts skills, and provides personalized recommendations
- **⚡ Dynamic EXP System**: Gamified progression that makes growth tangible and rewarding
- **🌳 Life Tree Visualization**: Your journey comes alive through an interactive D3.js tree
- **💭 Soulmate AI Chatbot**: An empathetic companion who knows you deeply and provides meaningful conversations
- **📊 Personality Analytics**: Understand your traits through scientifically-backed analysis
- **🎨 Beautiful UX**: Calm, aesthetic design with smooth animations powered by Framer Motion

## 🚀 Key Features

### 1. Hobby Tracking & Leveling System
- Track multiple hobbies with individual progression
- Earn EXP points based on activity depth and complexity
- AI analyzes each activity to identify demonstrated skills
- Visual level-up animations and achievement badges

### 2. AI-Powered Activity Analysis
- Automatically extracts skills from activity descriptions
- Calculates EXP based on depth, complexity, and learning
- Provides encouragement and insights
- Tracks progress over time

### 3. Personality Insights & Analytics
- **6 personality dimensions** analyzed from your activities:
  - Outdoor Explorer ↔ Indoor Enthusiast
  - Social Butterfly ↔ Solo Thinker
  - Creative Spirit ↔ Analytical Mind
  - Active Mover ↔ Calm Observer
  - Practical Doer ↔ Theoretical Thinker
  - Adventure Seeker ↔ Routine Lover
- **Interactive charts** showing trait distributions
- **Activity preference analysis** with dual-ring visualization
- **AI-generated insights** about your personality

### 4. Life Tree Visualization
- **Interactive D3.js tree** representing your growth journey
- Branches for hobbies, leaves for activities
- Flowers for reflections, fruits for happy moments
- Beautiful animations: clouds, sun rays, falling leaves
- Replay button to re-experience your journey

### 5. Soulmate AI Chatbot
- Empathetic AI companion who understands your personality
- Context-aware conversations based on your history
- Provides support, insights, and encouragement
- Memory-powered responses using vector embeddings

### 6. Daily Reflections & Mood Tracking
- Journal your thoughts with AI emotional analysis
- Sentiment scoring and emotion detection
- Track emotional patterns over time
- Generate AI summaries of your reflections

### 7. Happy Moments Gallery
- Capture and cherish favorite memories
- Image support with Supabase storage
- Searchable with AI-powered semantic search
- Beautifully displayed in a responsive grid

### 8. Smart Hobby Recommendations
- AI suggests new hobbies based on your personality
- Personalized reasons explaining why each fits you
- Difficulty ratings and expected benefits
- Collapsible UI for non-intrusive suggestions

## 🛠 Tech Stack

### Frontend
- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **D3.js** - Data visualizations
- **Lucide React** - Beautiful icons

### Backend & Database
- **Supabase** - Backend as a Service
  - PostgreSQL database
  - Row Level Security (RLS)
  - Authentication
  - Storage for images
  - pgvector for semantic search

### AI & ML
- **OpenAI GPT-4**
- Embeddings for semantic search (text-embedding-ada-002)
- Vector similarity search with pgvector

### Deployment
- **Vercel** - Serverless deployment
- Edge Functions for API routes
- Environment variable management

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- OpenAI API key 

### 1. Clone Repository
```bash
git clone https://github.com/yourusername/reme.git
cd reme
npm install
```

### 2. Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# AI Provider (choose one)
AI_PROVIDER=openai  # or 'claude'

# OpenAI
OPENAI_API_KEY=sk-...
```

### 3. Database Setup

Run the migrations in your Supabase SQL Editor:

1. Copy and run `supabase/migrations.sql`
2. Copy and run `supabase/2nd_migrations.sql`

### 4. Storage Buckets

Create storage buckets in Supabase dashboard:
- `activity-images`
- `moment-images`

Set them as private and configure RLS policies.

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
reme/
├── app/
│   ├── page.tsx                    # Dashboard / Landing
│   ├── onboarding/                 # User onboarding flow
│   ├── hobbies/                    # Hobby management
│   ├── hobby/[id]/                 # Individual hobby details
│   ├── profile/                    # User profile & analytics
│   ├── tree/                       # Life Tree visualization
│   ├── moments/                    # Happy moments gallery
│   ├── soulmate/                   # AI chatbot page
│   └── api/                        # API routes
│       ├── analyze-activity/       # Activity AI analysis
│       ├── analyze-reflection/     # Reflection sentiment analysis
│       ├── create-hobby/           # Hobby creation with AI
│       ├── create-moment/          # Moment creation
│       ├── generate-profile-summary/  # AI profile summary
│       ├── generate-quote/         # Daily motivational quotes
│       ├── recommend/              # Smart recommendations
│       ├── recommend-hobbies/      # Hobby suggestions
│       └── soulmate-chat/          # AI chatbot endpoint
├── components/
│   ├── charts/                     # D3.js visualization components
│   │   ├── PersonalityTraitsChart.tsx
│   │   └── ActivityPreferenceChart.tsx
│   ├── AddActivityModal.tsx
│   ├── AddHobbyModal.tsx
│   ├── HobbyCard.tsx
│   ├── HobbyRecommendationCard.tsx
│   ├── LifeTreeView.tsx
│   ├── NavHeader.tsx
│   └── TreeVisualization.tsx
├── lib/
│   ├── supabaseClient.ts          # Supabase client setup
│   ├── aiProvider.ts              # Unified AI provider wrapper
│   ├── api.ts                     # API utilities
│   ├── types.ts                   # TypeScript definitions
│   ├── userCharacteristics.ts     # Personality analysis logic
│   └── levelUtils.ts              # EXP and leveling calculations
├── supabase/
│   ├── migrations.sql             # Main database schema
│   └── 2nd_migrations.sql         # Vector search function
└── styles/
    └── globals.css                # Global styles & Tailwind
```

## 🎮 Usage Guide

### Getting Started
1. **Sign Up** - Create your account via email/password
2. **Onboarding** - Set up your profile (name, MBTI, age)
3. **Add Hobbies** - Create your first hobby to start tracking

### Daily Workflow
1. **Log Activities** - Click on a hobby card to log what you did
2. **Earn EXP** - Watch your hobby level up as you progress
3. **Daily Reflection** - Journal your thoughts and feelings
4. **Capture Moments** - Save happy moments with photos
5. **Check Tree** - Visualize your growth journey

### Advanced Features
- **Profile Analytics** - View personality insights and charts
- **Soulmate Chat** - Have meaningful conversations with AI
- **Get Recommendations** - Discover new hobbies based on your personality
- **Replay Tree** - Watch your journey unfold with animations

## 🎨 Design Philosophy

RE:ME embraces a **calm, aesthetic, and encouraging** design:
- Soft gradients and pastel colors
- Smooth transitions and micro-animations
- Clear hierarchy and generous white space
- Encouraging copy and positive reinforcement
- Dark mode support (planned)

## 🧠 AI Integration Details

### Activity Analysis
```typescript
POST /api/analyze-activity
{
  "activityText": "I spent 2 hours practicing watercolor landscapes...",
  "hobbyCategory": "Creative"
}
```
Returns: Skills identified, EXP calculation, encouragement

### Personality Analysis
Analyzes hobby categories and activity patterns to determine:
- Indoor vs Outdoor preference
- Social vs Solo tendencies
- Creative vs Analytical inclination
- Active vs Calm nature
- Practical vs Theoretical approach
- Adventure vs Routine preference

### Semantic Search
Uses OpenAI embeddings (1536 dimensions) to:
- Find similar past activities
- Power the Soulmate AI with relevant context
- Generate personalized recommendations

## 🔐 Security & Privacy

- **Row Level Security (RLS)** - Users can only access their own data
- **Secure authentication** via Supabase Auth
- **Private storage buckets** with user-scoped policies
- **No data sharing** - Your journey is completely private
- **API key security** - Keys stored in environment variables

## 🌟 Future Enhancements

- [ ] Social features & Community challenges (optional friend connections)
- [ ] Habit streaks and reminders
- [ ] Goal setting and tracking
- [ ] Advanced analytics dashboard & Export data (PDF reports)
- [ ] Voice journaling

## 🐛 Troubleshooting

### Common Issues

**Environment Variables Not Loading**
- Ensure `.env.local` exists in root directory
- Restart development server after changes

**Supabase Connection Error**
- Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Check if RLS policies are properly configured

**AI API Errors**
- Verify API key is valid and has credits
- Check `AI_PROVIDER` matches your configured key
- Monitor rate limits in provider dashboard

**Images Not Uploading**
- Ensure storage buckets are created
- Verify RLS policies allow user uploads
- Check file size limits (default 50MB)

## 📄 License

MIT License - feel free to use for personal or educational purposes.

## 🙏 Acknowledgments

Built with ❤️ using:
- Next.js and React team
- Supabase team
- OpenAI 
- D3.js community
- All open-source contributors

---

**Made for Hackathon 2025** | [Demo](https://reme.vercel.app) | [Documentation](./TECHNICAL.md)

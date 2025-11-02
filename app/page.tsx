'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { Sparkles, TrendingUp, ArrowRight, Heart, Plus } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import { getMomentImageUrl } from '@/lib/storageHelpers';
import ReflectionModal from '@/components/ReflectionModal';

export default function HomePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [quote, setQuote] = useState('');
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [attribution, setAttribution] = useState('');
  const [randomMoment, setRandomMoment] = useState<any>(null);
  const [todayReflection, setTodayReflection] = useState<any>(null);
  const [hobbySummary, setHobbySummary] = useState<any[]>([]);
  const [showReflectionModal, setShowReflectionModal] = useState(false);

  // 1️⃣ Fetch profile first
  useEffect(() => {
    async function fetchProfile() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/auth/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (!profileData) {
        router.push('/onboarding');
        return;
      }

      setProfile(profileData);
    }

    fetchProfile();
  }, [router]);

  // 2️⃣ Fetch other data asynchronously after profile is ready
  useEffect(() => {
    if (!profile) return;

    fetchDailyQuote();
    fetchRandomMoment();
    fetchTodayReflection();
    fetchHobbySummary();
  }, [profile]);

  // Fetch daily quote
  async function fetchDailyQuote(forceRefresh = false) {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      setQuoteLoading(true);
      const res = await fetch('/api/generate-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: session.user.id, refresh: forceRefresh }),
      });
      const data = await res.json();
      setQuote(data.quote);
      setAttribution(data.attribution || '');
    } catch (error) {
      console.error('Failed to fetch quote:', error);
    } finally {
      setQuoteLoading(false);
    }
  }

  // Refresh quote
  function refreshQuote() {
    fetchDailyQuote(true);
  }

  // Fetch random positive moment
  async function fetchRandomMoment() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: moments } = await supabase
        .from('moments')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (moments && moments.length > 0) {
        const positiveMoments = moments.filter(m => m.sentiment_score >= 0.3);
        setRandomMoment(positiveMoments[0] || moments[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Fetch today's reflection
  async function fetchTodayReflection() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const { data: reflections } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', session.user.id)
        .gte('created_at', todayStart.toISOString())
        .order('created_at', { ascending: false })
        .limit(1);

      if (reflections && reflections.length > 0) {
        setTodayReflection(reflections[0]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  // Fetch hobby summary
  async function fetchHobbySummary() {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data: hobbies } = await supabase
        .from('hobbies')
        .select('*')
        .eq('user_id', session.user.id)
        .order('level', { ascending: false })
        .limit(5);

      setHobbySummary(hobbies || []);
    } catch (error) {
      console.error(error);
    }
  }

  // Skeleton loader while profile is null
  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <NavHeader userName={profile?.display_name} />

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Quote Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-amber-50 via-white to-rose-50 rounded-2xl shadow-md p-6 mb-8 text-gray-900"
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-amber-400" />
              <span className="text-sm font-medium opacity-90 text-amber-600">
                Your Daily Inspiration
              </span>
            </div>
            <button
              onClick={refreshQuote}
              className="text-sm text-amber-500 hover:text-amber-600 font-medium"
              disabled={quoteLoading}
            >
              {quoteLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
          <p className="text-xl md:text-2xl font-serif italic leading-relaxed mb-2 text-rose-600">
            {quote || 'Loading your inspiration...'}
          </p>
          {attribution && (
            <p className="text-right text-sm text-gray-700">— {attribution}</p>
          )}
        </motion.div>

{/* Moment + Reflection (Minimalist Grid) */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">

    {/* Random Positive Moment: No Extra Words */}
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-shadow duration-300 flex flex-col overflow-hidden"
        style={{ minHeight: '260px' }} 
    >
        <div className="flex flex-1">
            {/* Left: Text content - Strictly Data-Driven */}
            <div className="w-1/2 flex flex-col p-7 pr-4"> 
                {/* Title in black, bold */}
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    Flashback
                </h3>
                
                <div className="flex flex-col items-start justify-end flex-grow"> 
                    {randomMoment?.text ? (
                         <p className="text-gray-700 text-sm line-clamp-4 mb-3">
                            {randomMoment.text}
                        </p>
                    ) : (
                         <p className="text-gray-500 text-sm italic line-clamp-4 mb-3">
                            {/* Empty state text is left generic */}
                            Nothing captured yet.
                        </p>
                    )}
                    
                    <p className="text-xs font-medium text-gray-500 mb-4 uppercase tracking-wider">
                        {randomMoment ? new Date(randomMoment.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                    </p>
                    <button
                        onClick={() => router.push('/moments')}
                        className="px-5 py-2 bg-gray-100 text-indigo-600 border border-gray-200 rounded-full hover:bg-indigo-50 hover:text-indigo-700 transition-colors text-sm font-semibold"
                    >
                        View All Moments
                    </button>
                </div>
            </div>

            {/* Right: Image */}
            <div className="w-1/2 relative bg-gray-50 flex items-center justify-center overflow-hidden rounded-r-2xl">
                {randomMoment?.image_path ? (
                    <img
                        src={getMomentImageUrl(randomMoment.image_path) || ''}
                        alt={randomMoment.text || 'Happy moment'}
                        className="w-full object-cover"
                        style={{ height: '160px', maxHeight: '160px' }}
                        onError={(e) => {
                             e.currentTarget.className = 'hidden';
                             const parent = e.currentTarget.parentElement;
                             if (parent) {
                               parent.className = 'w-full bg-gradient-to-br from-indigo-100 to-pink-100 flex items-center justify-center rounded-r-2xl';
                               parent.style.height = '160px';
                               parent.innerHTML = '<svg class="w-10 h-10 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-5 4h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>';
                             }
                        }}
                    />
                ) : (
                    <div className="w-full bg-gray-100 flex items-center justify-center rounded-r-2xl" style={{ height: '160px' }}>
                        <p className="text-gray-400 text-sm italic">No Image</p>
                    </div>
                )}
            </div>
        </div>
    </motion.div>


    {/* Daily Reflection: With Modal */}
    <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-shadow duration-300 flex flex-col relative justify-between border border-indigo-100"
        style={{ minHeight: '260px' }}
    >
        <div className="flex items-start justify-between mb-4">
            {/* Title in black, bold */}
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                Daily Reflection
            </h3>
            {/* Always show Add button */}
            <button
              onClick={() => setShowReflectionModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-xs font-semibold"
            >
              <Plus className="w-4 h-4" />
              {todayReflection ? 'Add More' : 'Write'}
            </button>
        </div>

        <div className="flex flex-col flex-grow justify-center pb-2">
            {todayReflection ? (
                <div>
                    <h4 className="text-2xl font-bold text-gray-800 mb-3">
                        Feeling <span className="text-indigo-600">{todayReflection.emotion}</span>
                    </h4>
                    <p className="text-sm text-gray-700 line-clamp-4 leading-relaxed">
                        {todayReflection.text}
                    </p>
                </div>
            ) : (
                <div className="text-center py-6">
                    <p className="text-gray-500 mb-6 text-base font-medium">
                        End your day with a moment of gratitude.
                    </p>
                    <p className="text-xs text-gray-400">
                        Click "Write" above to start your reflection
                    </p>
                </div>
            )}
        </div>
    </motion.div>
</div>

        

        {/* Hobby Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-8"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              Hobbies
            </h3>
            <button
              onClick={() => router.push('/hobbies')}
              className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
            >
              View All
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {hobbySummary.length > 0 ? (
            <div className="space-y-4">
              {hobbySummary.map((hobby) => {
                const threshold = hobby.meta?.level_thresholds?.[hobby.level] || 100;
                const progress = Math.min((hobby.exp / threshold) * 100, 100);

                return (
                  <div
                    key={hobby.id}
                    onClick={() => router.push(`/hobby/${hobby.id}`)}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{hobby.name}</h4>
                      <p className="text-sm text-gray-600">{hobby.category}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Level {hobby.level}</p>
                        <p className="text-xs text-gray-500">
                          {hobby.exp} / {threshold} EXP
                        </p>
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: progress }}
                          transition={{ duration: 0.8, ease: 'easeOut' }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No hobbies yet</p>
              <button
                onClick={() => router.push('/hobbies')}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Add Your First Hobby
              </button>
            </div>
          )}
        </motion.div>
      </div>

      {/* Reflection Modal */}
      {profile && (
        <ReflectionModal
          isOpen={showReflectionModal}
          onClose={() => setShowReflectionModal(false)}
          userId={profile.id}
          onSuccess={() => {
            fetchTodayReflection();
          }}
        />
      )}
    </div>
  );
}

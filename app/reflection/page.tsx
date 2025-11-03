'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Moon, Loader2, Sparkles, ArrowLeft } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { analyzeReflection } from '@/lib/api';
import NavHeader from '@/components/NavHeader';
import EmotionSlider from '@/components/EmotionSlider';

export default function ReflectionPage() {
  const router = useRouter();
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      setProfile(profileData);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/onboarding');
        return;
      }

      const response = await analyzeReflection({
        userId: user.id,
        text,
        manualEmotion: emotion,
      });
      setResult({ emotion: response.emotion, summary: response.ai_summary });
      setText('');
      setEmotion(null);
      setTimeout(() => {
        setResult(null);
      }, 5000);
    } catch (error) {
      console.error('Failed to submit reflection:', error);
      alert('Failed to submit reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <NavHeader userName={profile?.display_name} />
      <div className="max-w-2xl mx-auto py-6 px-4">

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
          <div className="flex items-center gap-3 mb-4">
            <Moon className="w-6 h-6 text-indigo-600" />
            <h2 className="text-2xl font-bold text-gray-900">Daily Reflection</h2>
          </div>

          <p className="text-gray-600 text-sm mb-4">
            Take a moment to reflect on your day. How are you feeling?
          </p>

          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            placeholder="What's on your mind tonight? Share your thoughts, feelings, and what you learned today..."
            required
          />

          <EmotionSlider
            value={emotion}
            onChange={setEmotion}
            defaultAutoAnalyze={true}
          />

          <button
            type="submit"
            disabled={isSubmitting || !text.trim()}
            className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
            {isSubmitting ? 'Reflecting...' : 'Submit Reflection'}
          </button>
        </form>

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg shadow-lg p-6"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                You felt {result.emotion} tonight — a beautiful moment of rest 🌙
              </h3>
            </div>
            <p className="text-gray-700">{result.summary}</p>
          </motion.div>
        )}
      </div>
    </div>
  );
}

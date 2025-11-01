'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { User, Trophy, Sparkles, TrendingUp, LogOut } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import PersonalityTraitsChart from '@/components/charts/PersonalityTraitsChart';
import ActivityPreferenceChart from '@/components/charts/ActivityPreferenceChart';
import { analyzeUserCharacteristics, UserCharacteristics } from '@/lib/userCharacteristics';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [moments, setMoments] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [userCharacteristics, setUserCharacteristics] = useState<UserCharacteristics | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setLoading(true);

      const [profileRes, hobbiesRes, activitiesRes, momentsRes, reflectionsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('hobbies').select('*').eq('user_id', user.id),
        supabase.from('activity_logs').select('*').eq('user_id', user.id),
        supabase.from('moments').select('*').eq('user_id', user.id),
        supabase.from('reflections').select('*').eq('user_id', user.id),
      ]);

      const profileData = profileRes.data;
      const hobbiesData = hobbiesRes.data || [];
      const activitiesData = activitiesRes.data || [];
      const momentsData = momentsRes.data || [];
      const reflectionsData = reflectionsRes.data || [];

      setProfile(profileData);
      setHobbies(hobbiesData);
      setActivities(activitiesData);
      setMoments(momentsData);
      setReflections(reflectionsData);

      // Analyze user characteristics
      const characteristics = analyzeUserCharacteristics(hobbiesData, activitiesData);
      setUserCharacteristics(characteristics);

      fetch('/api/generate-profile-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      })
        .then(res => res.json())
        .then(data => setSummary(data.summary))
        .catch(err => console.error('Failed to load AI summary', err));

      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setLoading(false);
    }
  }

  // Stats
  const totalActivities = activities.length;
  const totalMoments = moments.length;
  const totalReflections = reflections.length;
  const totalLevel = hobbies.reduce((sum, h) => sum + h.level, 0);

  // Achievements
  const achievements = [];
  if (hobbies.length >= 1) achievements.push({ icon: '🌱', title: 'First Hobby', desc: 'Started your journey' });
  if (hobbies.length >= 5) achievements.push({ icon: '🌳', title: 'Hobby Collector', desc: '5 hobbies tracked' });
  if (totalActivities >= 10) achievements.push({ icon: '🔥', title: 'Consistent', desc: '10 activities logged' });
  if (totalActivities >= 50) achievements.push({ icon: '💪', title: 'Dedicated', desc: '50 activities logged' });
  if (totalLevel >= 20) achievements.push({ icon: '⭐', title: 'Level Master', desc: 'Total level 20+' });
  if (totalMoments >= 10) achievements.push({ icon: '❤️', title: 'Grateful Heart', desc: '10 moments captured' });
  if (totalReflections >= 7) achievements.push({ icon: '🌙', title: 'Reflective Soul', desc: '7 days of reflection' });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <NavHeader userName={profile?.display_name} />

      <div className="max-w-6xl mx-auto py-8 px-4 space-y-8">
        {/* Profile Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary-500 to-blue-500 rounded-2xl shadow-xl p-8 text-white"
        >
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 bg-white/20 rounded-full flex items-center justify-center">
              <User className="w-12 h-12" />
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{profile?.display_name}</h1>
              <div className="flex gap-6 text-sm">
                <div>
                  <p className="opacity-80">Hobbies</p>
                  <p className="text-2xl font-bold">{hobbies.length}</p>
                </div>
                <div>
                  <p className="opacity-80">Activities</p>
                  <p className="text-2xl font-bold">{totalActivities}</p>
                </div>
                <div>
                  <p className="opacity-80">Moments</p>
                  <p className="text-2xl font-bold">{totalMoments}</p>
                </div>
                <div>
                  <p className="opacity-80">Total Level</p>
                  <p className="text-2xl font-bold">{totalLevel}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-6 h-6 text-primary-600" />
            <h2 className="text-2xl font-bold text-gray-900">Your Journey</h2>
          </div>
          <div className="text-gray-700 text-lg leading-relaxed whitespace-pre-line space-y-3">
            {summary || 'Loading your personalized summary...'}
          </div>
        </motion.div>

        {/* Personality Insights */}
        {userCharacteristics && userCharacteristics.insights.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-6 h-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Personality Insights</h2>
            </div>
            <div className="space-y-3">
              {userCharacteristics.dominantTraits.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold text-gray-700">You are:</span>
                  {userCharacteristics.dominantTraits.map((trait, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold"
                    >
                      {trait}
                    </span>
                  ))}
                </div>
              )}
              {userCharacteristics.insights.map((insight, idx) => (
                <p key={idx} className="text-gray-700 text-base flex items-start gap-2">
                  <span className="text-purple-500 mt-1">✨</span>
                  <span>{insight}</span>
                </p>
              ))}
            </div>
          </motion.div>
        )}

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Personality Traits</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Your personal characteristics based on your hobbies and activities
            </p>
            {userCharacteristics && userCharacteristics.personalityTraits.length > 0 ? (
              <PersonalityTraitsChart data={userCharacteristics.personalityTraits} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Start adding hobbies to discover your personality traits!</p>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Activity Focus</h2>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Outer ring: Category distribution • Inner ring: Recent activities
            </p>
            {userCharacteristics && userCharacteristics.activityPreferences.length > 0 ? (
              <ActivityPreferenceChart
                data={userCharacteristics.activityPreferences}
                recentActivities={activities.slice(0, 8)}
              />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Add hobbies to see your activity preferences!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Achievements */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <h2 className="text-2xl font-bold text-gray-900">Achievements</h2>
          </div>
          {achievements.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl p-4 text-center border-2 border-yellow-200"
                >
                  <div className="text-4xl mb-2">{achievement.icon}</div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{achievement.title}</h3>
                  <p className="text-xs text-gray-600">{achievement.desc}</p>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>Keep going to unlock achievements!</p>
            </div>
          )}
        </motion.div>

        {/* Logout Button at Bottom */}
        <div className="mt-8">
          <button
            onClick={async () => {
              const confirmed = window.confirm('Are you sure you want to logout?');
              if (!confirmed) return;

              await supabase.auth.signOut();
              router.push('/auth/login');
            }}
            className="w-full md:w-96 mx-auto block px-6 py-3 rounded-full bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
          >
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>


      </div>
    </div>
  );
}

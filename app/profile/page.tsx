'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';
import { motion } from 'framer-motion';
import { User, Trophy, Sparkles, TrendingUp } from 'lucide-react';
import NavHeader from '@/components/NavHeader';
import RadarChart from '@/components/charts/RadarChart';
import SunburstChart from '@/components/charts/SunburstChart';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(true);
  const [hobbies, setHobbies] = useState<any[]>([]);
  const [activities, setActivities] = useState<any[]>([]);
  const [moments, setMoments] = useState<any[]>([]);
  const [reflections, setReflections] = useState<any[]>([]);
  const [radarData, setRadarData] = useState<any[]>([]);
  const [sunburstData, setSunburstData] = useState<any>(null);

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

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      // Load hobbies
      const { data: hobbiesData } = await supabase
        .from('hobbies')
        .select('*')
        .eq('user_id', user.id);

      setHobbies(hobbiesData || []);

      // Load activities
      const { data: activitiesData } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('user_id', user.id);

      setActivities(activitiesData || []);

      // Load moments
      const { data: momentsData } = await supabase
        .from('moments')
        .select('*')
        .eq('user_id', user.id);

      setMoments(momentsData || []);

      // Load reflections
      const { data: reflectionsData } = await supabase
        .from('reflections')
        .select('*')
        .eq('user_id', user.id);

      setReflections(reflectionsData || []);

      // Generate AI summary
      const summaryRes = await fetch('/api/generate-profile-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id }),
      });
      const summaryData = await summaryRes.json();
      setSummary(summaryData.summary);

      // Prepare radar chart data (skills from hobbies)
      prepareRadarData(hobbiesData || []);

      // Prepare sunburst data (hobby categories)
      prepareSunburstData(hobbiesData || [], activitiesData || []);

      setLoading(false);
    } catch (error) {
      console.error('Failed to load profile:', error);
      setLoading(false);
    }
  }

  function prepareRadarData(hobbiesData: any[]) {
    const skillMap: Record<string, number> = {};

    hobbiesData.forEach(hobby => {
      if (hobby.meta?.subskills) {
        hobby.meta.subskills.forEach((skill: string) => {
          skillMap[skill] = (skillMap[skill] || 0) + hobby.level;
        });
      }
    });

    const data = Object.entries(skillMap)
      .map(([skill, value]) => ({ skill, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8); // Top 8 skills

    setRadarData(data);
  }

  function prepareSunburstData(hobbiesData: any[], activitiesData: any[]) {
    // Group hobbies by category
    const categories: Record<string, any[]> = {};

    hobbiesData.forEach(hobby => {
      const category = hobby.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(hobby);
    });

    // Build sunburst structure
    const children = Object.entries(categories).map(([category, hobbies]) => ({
      name: category,
      children: hobbies.map(hobby => {
        const hobbyActivities = activitiesData.filter(a => a.hobby_id === hobby.id);
        return {
          name: hobby.name,
          value: hobbyActivities.length || 1,
          level: hobby.level,
        };
      }),
    }));

    setSunburstData({
      name: 'Hobbies',
      children,
    });
  }

  // Calculate stats
  const totalActivities = activities.length;
  const totalMoments = moments.length;
  const totalReflections = reflections.length;
  const totalLevel = hobbies.reduce((sum, h) => sum + h.level, 0);

  // Calculate achievements/milestones
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

        {/* AI-Generated Summary */}
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
          <p className="text-gray-700 text-lg leading-relaxed">
            {summary || 'Loading your personalized summary...'}
          </p>
        </motion.div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Radar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Skills Overview</h2>
            </div>
            {radarData.length > 0 ? (
              <RadarChart data={radarData} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Start logging activities to see your skills!</p>
              </div>
            )}
          </motion.div>

          {/* Sunburst Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg p-8"
          >
            <div className="flex items-center gap-2 mb-6">
              <Sparkles className="w-6 h-6 text-primary-600" />
              <h2 className="text-2xl font-bold text-gray-900">Hobby Distribution</h2>
            </div>
            {sunburstData && sunburstData.children.length > 0 ? (
              <SunburstChart data={sunburstData} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <p>Add hobbies to see your distribution!</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Milestone Achievements */}
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
      </div>
    </div>
  );
}

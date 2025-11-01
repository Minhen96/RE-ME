'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Plus, Sparkles, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { getActivityImageUrl } from '@/lib/storageHelpers';
import AddActivityModal from '@/components/AddActivityModal';
import NavHeader from '@/components/NavHeader';

export default function HobbyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const hobbyId = params.id;
  
  const [hobby, setHobby] = useState(null);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => {
    if (hobbyId) {
      loadHobbyDetails();
    }
  }, [hobbyId]);

  async function loadHobbyDetails() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/onboarding');
        return;
      }

      setUserId(user.id);

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      const { data: hobbyData, error: hobbyError } = await supabase
        .from('hobbies')
        .select('*')
        .eq('id', hobbyId)
        .single();

      if (hobbyError) throw hobbyError;
      setHobby(hobbyData);

      const { data: activitiesData, error: activitiesError } = await supabase
        .from('activity_logs')
        .select('*')
        .eq('hobby_id', hobbyId)
        .order('created_at', { ascending: false });

      if (activitiesError) throw activitiesError;
      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Failed to load hobby details:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading hobby...</p>
      </div>
    );
  }

  if (!hobby) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Hobby not found</p>
        </div>
      </div>
    );
  }

  const progress = `${Math.min(
                            (hobby.exp / (hobby.meta?.level_thresholds?.[hobby.level] || 100)) * 100,
                            100
                          )}%`

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <NavHeader userName={profile?.display_name} />
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button
          onClick={() => router.push('/hobbies')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Hobbies
        </button>

        <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">{hobby.name}</h1>
              <p className="text-lg text-gray-600">{hobby.category}</p>
            </div>
            <div className="flex items-center gap-2 bg-primary-100 px-4 py-2 rounded-full">
              <span className="text-xl font-bold text-primary-700">Lv {hobby.level}</span>
            </div>
          </div>

          {hobby.description && (
            <p className="text-gray-700 mb-6">{hobby.description}</p>
          )}

          <div className="space-y-3 mb-6">
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-600">
                <TrendingUp className="w-5 h-5" />
                <span className="font-medium">Experience</span>
              </div>
              <span className="text-lg font-bold text-gray-900">
                {hobby.exp} / {hobby.meta?.level_thresholds?.[hobby.level] || 100}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
              <motion.div
                className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: progress }}
                transition={{ duration: 1, ease: 'easeOut' }}
              />
            </div>
          </div>

          {hobby.meta?.subskills && hobby.meta.subskills.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Subskills</h3>
              <div className="flex flex-wrap gap-2">
                {hobby.meta.subskills.map((skill, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Activity Timeline</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Log Activity
          </button>
        </div>

        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-lg shadow p-6 border-l-4 border-primary-400"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {new Date(activity.created_at).toLocaleDateString()}
                  </span>
                  {activity.emotion && (
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                      {activity.emotion}
                    </span>
                  )}
                  {activity.sentiment_score !== null && activity.sentiment_score !== undefined && (
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.sentiment_score >= 0.3 ? 'bg-green-100 text-green-700' :
                      activity.sentiment_score <= -0.3 ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {activity.sentiment_score > 0 ? '😊' : activity.sentiment_score < 0 ? '😔' : '😐'}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-primary-600 font-semibold">
                  <Sparkles className="w-4 h-4" />
                  <span>+{activity.exp_gained} XP</span>
                </div>
              </div>

              <div className="flex gap-3">
                {activity.image_path && (
                  <div className="flex-shrink-0">
                    <img
                      src={getActivityImageUrl(activity.image_path) || ''}
                      alt="Activity"
                      className="w-20 h-20 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                  </div>
                )}
                <div className="flex-1">
                  {activity.text && <p className="text-gray-800 mb-3">{activity.text}</p>}

                  {activity.ai_summary && (
                    <div className="bg-primary-50 rounded p-3 mb-3">
                      <p className="text-sm text-gray-700">
                        <span className="font-medium">Summary:</span> {activity.ai_summary}
                      </p>
                    </div>
                  )}

                  {activity.ai_skills && activity.ai_skills.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {activity.ai_skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {activities.length === 0 && (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-600">No activities logged yet. Start your journey!</p>
            </div>
          )}
        </div>

        <AddActivityModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          hobbyId={hobbyId as string}
          hobbyName={hobby?.name || ''}
          userId={userId}
          onSuccess={loadHobbyDetails}
        />
      </div>
    </div>
  );
}

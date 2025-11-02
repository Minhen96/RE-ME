'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Plus, Calendar, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { getMomentImageUrl } from '@/lib/storageHelpers';
import NavHeader from '@/components/NavHeader';
import AddMomentModal from '@/components/AddMomentModal';

export default function MomentsPage() {
  const router = useRouter();
  const [moments, setMoments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<any>(null);
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'month' | 'week'>('all');

  useEffect(() => {
    (async () => {
      await loadMoments(); // async wrapper
    })();
  }, []);

  async function loadMoments() {
    setLoading(true); // show loader
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/onboarding');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);
      setUserId(user.id);

      const { data, error } = await supabase
        .from('moments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMoments(data || []);
    } catch (error) {
      console.error('Failed to load moments:', error);
    } finally {
      setLoading(false); // hide loader
    }
  }

  // Filter moments based on period
  const filteredMoments = useMemo(() => {
    if (filterPeriod === 'all') return moments;

    const now = new Date();
    const filtered = moments.filter(moment => {
      const momentDate = new Date(moment.created_at);
      if (filterPeriod === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return momentDate >= weekAgo;
      }
      if (filterPeriod === 'month') {
        return momentDate.getMonth() === now.getMonth() &&
               momentDate.getFullYear() === now.getFullYear();
      }
      return true;
    });
    return filtered;
  }, [moments, filterPeriod]);

  // Calculate stats
  const stats = useMemo(() => {
    const total = moments.length;
    const thisMonth = moments.filter(m => {
      const date = new Date(m.created_at);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    }).length;
    const avgSentiment = moments.length > 0
      ? moments.reduce((sum, m) => sum + (m.sentiment_score || 0.5), 0) / moments.length
      : 0;

    return { total, thisMonth, avgSentiment };
  }, [moments]);

  // Get sentiment emoji based on score
  const getSentimentEmoji = (score: number) => {
    if (score >= 0.7) return '🌸'; // Very happy
    if (score >= 0.5) return '🌼'; // Happy
    if (score >= 0.3) return '🌻'; // Neutral positive
    return '🌺'; // Any moment is a flower
  };

  // Async Loading Component
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-pink-50 via-white to-red-50">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          className="w-16 h-16 text-red-400"
        >
          <Heart className="w-full h-full" />
        </motion.div>
        <p className="text-gray-600 mt-4 text-lg">Loading your happy moments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-50 via-white to-orange-50">
      <NavHeader userName={profile?.display_name} />

      <div className="max-w-7xl mx-auto py-6 px-4">
        {/* Header with Stats */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-6">
            <Heart className="w-8 h-8 text-red-400" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Happy Moments
              </h1>
              <p className="text-gray-600">Your memories, captured in time</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-rose-50 rounded-lg">
                  <Sparkles className="w-6 h-6 text-rose-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                  <p className="text-sm text-gray-600">Total Moments</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl p-5 shadow-sm border border-gray-200"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-orange-50 rounded-lg">
                  <Calendar className="w-6 h-6 text-orange-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
                  <p className="text-sm text-gray-600">This Month</p>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              onClick={() => setShowAddModal(true)}
              className="bg-gradient-to-br from-red-50 to-orange-50 hover:from-red-100 hover:to-orange-100 rounded-xl p-5 shadow-sm border border-red-200 transition-all duration-200 hover:shadow-md group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-white/80 rounded-lg group-hover:bg-white transition-colors">
                  <Plus className="w-6 h-6 text-red-500" />
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900">Add Moment</p>
                  <p className="text-sm text-red-600">Capture a memory</p>
                </div>
              </div>
            </motion.button>
          </div>

          {/* Filter Period */}
          <div className="flex items-center gap-2 bg-white rounded-lg p-1 shadow-sm border border-gray-200">
            <button
              onClick={() => setFilterPeriod('all')}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                filterPeriod === 'all'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              All Time
            </button>
            <button
              onClick={() => setFilterPeriod('month')}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                filterPeriod === 'month'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This Month
            </button>
            <button
              onClick={() => setFilterPeriod('week')}
              className={`px-4 py-2 rounded-md transition-colors text-sm font-medium ${
                filterPeriod === 'week'
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              This Week
            </button>
          </div>
        </motion.div>

        {/* Moments Grid */}
        {filteredMoments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-700 text-lg font-semibold mb-2">No moments captured yet!</p>
            <p className="text-gray-500 mb-6">
              {filterPeriod !== 'all' ? 'Try changing the time filter' : 'Start collecting your happy memories'}
            </p>
            {filterPeriod === 'all' && (
              <button
                onClick={() => setShowAddModal(true)}
                className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
              >
                Add Your First Moment
              </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMoments.map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group cursor-pointer"
                onClick={() => setSelectedMoment(moment)}
              >
                <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden border border-gray-200 hover:border-gray-300">
                  {/* Image Section */}
                  <div className="relative overflow-hidden">
                    {moment.image_path ? (
                      <div className="relative">
                        <img
                          src={getMomentImageUrl(moment.image_path) || ''}
                          alt={moment.text || 'Happy moment'}
                          className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                          style={{ height: '200px' }}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>
                    ) : (
                      <div
                        className="w-full bg-gradient-to-br from-rose-50 via-orange-50 to-red-50 flex items-center justify-center"
                        style={{ height: '200px' }}
                      >
                        <Heart className="w-16 h-16 text-red-200" />
                      </div>
                    )}

                    {/* Sentiment Flower Badge */}
                    <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 shadow-sm">
                      <span className="text-2xl">{getSentimentEmoji(moment.sentiment_score || 0.5)}</span>
                    </div>
                  </div>

                  {/* Content Section */}
                  <div className="p-5">
                    {moment.text && (
                      <p className="text-gray-800 text-sm leading-relaxed mb-3 line-clamp-3">
                        {moment.text}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(moment.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>

                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <span className="text-xs text-primary-600 font-medium">View →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Modal for viewing moment details */}
        <AnimatePresence>
          {selectedMoment && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
              onClick={() => setSelectedMoment(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto shadow-xl border border-gray-200"
                onClick={(e) => e.stopPropagation()}
              >
                {selectedMoment.image_path && (
                  <div className="relative">
                    <img
                      src={getMomentImageUrl(selectedMoment.image_path) || ''}
                      alt={selectedMoment.text || 'Happy moment'}
                      className="w-full max-h-96 object-cover rounded-t-2xl"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-sm">
                      <span className="text-3xl">{getSentimentEmoji(selectedMoment.sentiment_score || 0.5)}</span>
                    </div>
                  </div>
                )}

                <div className="p-8">
                  {selectedMoment.text && (
                    <p className="text-gray-800 text-lg leading-relaxed mb-6">
                      {selectedMoment.text}
                    </p>
                  )}

                  <div className="flex items-center gap-3 text-gray-500 mb-6">
                    <Calendar className="w-5 h-5" />
                    <span className="text-sm">
                      {new Date(selectedMoment.created_at).toLocaleDateString('en-US', {
                        weekday: 'long',
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>

                  <button
                    onClick={() => setSelectedMoment(null)}
                    className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AddMomentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          userId={userId}
          onSuccess={loadMoments}
        />
      </div>
    </div>
  );
}

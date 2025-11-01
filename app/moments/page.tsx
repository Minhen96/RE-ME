'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ArrowLeft, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '@/lib/supabaseClient';
import { getMomentImageUrl } from '@/lib/storageHelpers';
import NavHeader from '@/components/NavHeader';
import AddMomentModal from '@/components/AddMomentModal';

export default function MomentsPage() {
  const router = useRouter();
  const [moments, setMoments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [userId, setUserId] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    loadMoments();
  }, []);

  async function loadMoments() {
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
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your moments...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-red-50">
      <NavHeader userName={profile?.display_name} />
      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-red-500" />
            <h1 className="text-3xl font-bold text-gray-900">Happy Moments</h1>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Moment
          </button>
        </div>

        {moments.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <Heart className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg mb-2">No moments captured yet!</p>
            <p className="text-gray-500">Start collecting your happy memories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {moments.map((moment, index) => (
              <motion.div
                key={moment.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
              >
                {moment.image_path ? (
                  <img
                    src={getMomentImageUrl(moment.image_path) || ''}
                    alt={moment.text || 'Happy moment'}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      // Fallback if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement('div');
                        fallback.className = 'w-full h-48 bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center';
                        fallback.innerHTML = '<svg class="w-12 h-12 text-red-400" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clip-rule="evenodd"></path></svg>';
                        parent.insertBefore(fallback, e.currentTarget);
                      }
                    }}
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-pink-100 to-red-100 flex items-center justify-center">
                    <Heart className="w-12 h-12 text-red-400" />
                  </div>
                )}
                <div className="p-4">
                  {moment.text && <p className="text-gray-800 mb-2">{moment.text}</p>}
                  <p className="text-sm text-gray-500">
                    {new Date(moment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}

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

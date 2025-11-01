'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Hobby } from '@/lib/types';
import HobbyCard from '@/components/HobbyCard';
import AddLogModal from '@/components/AddLogModal';
import AddHobbyModal from '@/components/AddHobbyModal';
import NavHeader from '@/components/NavHeader';
import { motion } from 'framer-motion';

export default function HobbiesPage() {
  const router = useRouter();
  const [hobbies, setHobbies] = useState<Hobby[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [showAddHobbyModal, setShowAddHobbyModal] = useState(false);

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/onboarding');
        return;
      }

      setUserId(user.id);

      // Load profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      setProfile(profileData);

      const { data: hobbiesData, error } = await supabase
        .from('hobbies')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHobbies(hobbiesData || []);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  }

  const handleExpGain = (expGained: number) => {
    // Refresh hobbies to show updated EXP
    loadDashboard();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Loading your journey...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <NavHeader userName={profile?.display_name} />

      <div className="max-w-6xl mx-auto py-6 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-primary-600" />
            <h1 className="text-3xl font-bold text-gray-900">Hobbies</h1>
          </div>
          <button
            onClick={() => setShowAddHobbyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors"
          >
            <Plus className="w-5 h-5" />
            Add Hobby
          </button>
        </div>

        {hobbies.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg shadow">
            <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-600 text-lg mb-2">No hobbies yet!</p>
            <p className="text-gray-500">Start your growth journey by adding a hobby.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hobbies.map((hobby, index) => (
              <motion.div
                key={hobby.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                <HobbyCard
                  hobby={hobby}
                  onClick={() => router.push(`/hobby/${hobby.id}`)}
                />
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {selectedHobby && userId && (
        <AddLogModal
          isOpen={!!selectedHobby}
          onClose={() => setSelectedHobby(null)}
          hobby={selectedHobby}
          userId={userId}
          onSuccess={handleExpGain}
        />
      )}

      {userId && (
        <AddHobbyModal
          isOpen={showAddHobbyModal}
          onClose={() => setShowAddHobbyModal(false)}
          userId={userId}
          onSuccess={loadDashboard}
        />
      )}
    </div>
  );
}
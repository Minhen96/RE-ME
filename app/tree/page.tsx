'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import NavHeader from '@/components/NavHeader';
import TreeVisualization from '@/components/TreeVisualization';

export default function TreePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [hobbiesData, setHobbiesData] = useState<any[]>([]);
  const [activitiesData, setActivitiesData] = useState<any[]>([]);
  const [reflectionsData, setReflectionsData] = useState<any[]>([]);
  const [momentsData, setMomentsData] = useState<any[]>([]);

  useEffect(() => {
    loadTreeData();
  }, []);

  async function loadTreeData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/onboarding');
        return;
      }

      const [profileData, hobbies, activities, reflections, moments] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('hobbies').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('activity_logs').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('reflections').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('moments').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);

      setProfile(profileData.data);
      setHobbiesData(hobbies.data || []);
      setActivitiesData(activities.data || []);
      setReflectionsData(reflections.data || []);
      setMomentsData(moments.data || []);
    } catch (error) {
      console.error('Failed to load tree data:', error);
    } finally {
      setLoading(false);
    }
  }

  const stats = {
    hobbies: hobbiesData.length,
    activities: activitiesData.length,
    reflections: reflectionsData.length,
    moments: momentsData.length,
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-primary-600" />
          <p className="text-gray-600">Growing your tree...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50">
      <NavHeader userName={profile?.display_name} />
      <div className="max-w-6xl mx-auto py-6 px-4">

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Life Tree 🌳</h1>
            <p className="text-gray-600">
              Trunk = Total Growth | Branches = Hobbies | Leaves = Activities | Flowers = Reflections | Fruits = Happy Moments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl mb-2">🌿</div>
              <div className="text-3xl font-bold text-gray-900">{stats.hobbies}</div>
              <div className="text-sm text-gray-600 mt-1">Branches</div>
            </div>
            <div className="text-center p-6 bg-emerald-50 rounded-lg">
              <div className="text-4xl mb-2">🍃</div>
              <div className="text-3xl font-bold text-gray-900">{stats.activities}</div>
              <div className="text-sm text-gray-600 mt-1">Leaves</div>
            </div>
            <div className="text-center p-6 bg-yellow-50 rounded-lg">
              <div className="text-4xl mb-2">🌸</div>
              <div className="text-3xl font-bold text-gray-900">{stats.reflections}</div>
              <div className="text-sm text-gray-600 mt-1">Flowers</div>
            </div>
            <div className="text-center p-6 bg-red-50 rounded-lg">
              <div className="text-4xl mb-2">🍎</div>
              <div className="text-3xl font-bold text-gray-900">{stats.moments}</div>
              <div className="text-sm text-gray-600 mt-1">Fruits</div>
            </div>
          </div>

          <TreeVisualization
            hobbies={hobbiesData}
            activities={activitiesData}
            reflections={reflectionsData}
            moments={momentsData}
          />

          <div className="mt-8 text-center">
            <p className="text-xl font-semibold text-gray-800 mb-2">
              Your tree is growing beautifully!
            </p>
            <p className="text-gray-600">
              Total Growth: {stats.hobbies + stats.activities + stats.reflections + stats.moments} moments
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

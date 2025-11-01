'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Hobby } from '@/lib/types';
import HobbyCard from '@/components/HobbyCard';
import AddLogModal from '@/components/AddLogModal';
import { motion } from 'framer-motion';

export default function DashboardPage() {
const router = useRouter();
const [hobbies, setHobbies] = useState<Hobby[]>([]);
const [loading, setLoading] = useState(true);
const [selectedHobby, setSelectedHobby] = useState<Hobby | null>(null);
const [userId, setUserId] = useState<string | null>(null);

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
    <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Your Growth Dashboard</h1>
        <p className="text-gray-600">Track your hobbies and watch your Life Tree flourish</p>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <button
            onClick={() => router.push('/reflection')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
        >
            <span className="text-2xl mb-2 block">🌙</span>
            <h3 className="font-semibold text-gray-900">Daily Reflection</h3>
        </button>
        <button
            onClick={() => router.push('/moments')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
        >
            <span className="text-2xl mb-2 block">❤️</span>
            <h3 className="font-semibold text-gray-900">Happy Moments</h3>
        </button>
        <button
            onClick={() => router.push('/tree')}
            className="p-4 bg-white rounded-lg shadow hover:shadow-md transition-shadow text-left"
        >
            <span className="text-2xl mb-2 block">🌳</span>
            <h3 className="font-semibold text-gray-900">Life Tree</h3>
        </button>
        <button
            className="p-4 bg-primary-600 text-white rounded-lg shadow hover:shadow-md transition-shadow
text-left"
        >
            <Plus className="w-6 h-6 mb-2" />
            <h3 className="font-semibold">Add Hobby</h3>
        </button>
        </div>

        {/* Hobbies Grid */}
        <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-primary-600" />
            Your Hobbies
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hobbies.map((hobby, index) => (
            <motion.div
                key={hobby.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
            >
                <HobbyCard
                hobby={hobby}
                onClick={() => router.push(`/hobby/${hobby.id}`)}
                />
            </motion.div>
            ))}
        </div>

        {hobbies.length === 0 && (
            <div className="text-center py-12 text-gray-500">
            <p>No hobbies yet. Start your growth journey by adding a hobby!</p>
            </div>
        )}
        </div>
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
    </div>
);
}
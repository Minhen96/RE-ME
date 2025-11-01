'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Sprout, ArrowRight } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { createHobby } from '@/lib/api';

export default function OnboardingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    displayName: '',
    age: '',
    mbti: '',
    hobbies: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push('/auth/login');
        return;
      }

      await saveProfile(user.id);
    } catch (error) {
      console.error('Onboarding error:', error);
      alert('Failed to complete onboarding. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const saveProfile = async (userId: string) => {
    await supabase.from('profiles').upsert({
      id: userId,
      display_name: formData.displayName,
      age: formData.age ? parseInt(formData.age) : null,
      mbti: formData.mbti || null,
    });

    const hobbyNames = formData.hobbies.split(',').map(h => h.trim()).filter(Boolean);
    for (const hobbyName of hobbyNames) {
      try {
        await createHobby({ userId, hobbyName });
      } catch (error) {
        console.error(`Failed to create hobby: ${hobbyName}`, error);
      }
    }

    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-blue-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full"
      >
        <div className="text-center mb-8">
          <Sprout className="w-12 h-12 text-primary-600 mx-auto mb-3" />
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Let's plant your Life Tree 🌱
          </h1>
          <p className="text-gray-600">Step by step, grow into your best self</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-2">
              What should we call you?
            </label>
            <input
              id="displayName"
              type="text"
              value={formData.displayName}
              onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Your name"
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-2">
              Age (optional)
            </label>
            <input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => setFormData({ ...formData, age: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="25"
            />
          </div>

          <div>
            <label htmlFor="mbti" className="block text-sm font-medium text-gray-700 mb-2">
              MBTI Type (optional)
            </label>
            <input
              id="mbti"
              type="text"
              value={formData.mbti}
              onChange={(e) => setFormData({ ...formData, mbti: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="INFP"
              maxLength={4}
            />
          </div>

          <div>
            <label htmlFor="hobbies" className="block text-sm font-medium text-gray-700 mb-2">
              What are your hobbies? (comma-separated)
            </label>
            <input
              id="hobbies"
              type="text"
              value={formData.hobbies}
              onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="Photography, Reading, Cooking"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Setting up...' : 'Start Growing'}
            {!isSubmitting && <ArrowRight className="w-5 h-5" />}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

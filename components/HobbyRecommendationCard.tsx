'use client';

import { useEffect, useState } from 'react';
import { Sparkles, TrendingUp, Lightbulb, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface HobbyRecommendation {
  name: string;
  category: string;
  reason: string;
  difficulty: string;
  benefits: string[];
}

interface HobbyRecommendationCardProps {
  userId: string;
  currentHobbies: any[];
}

export default function HobbyRecommendationCard({ userId, currentHobbies }: HobbyRecommendationCardProps) {
  const [recommendations, setRecommendations] = useState<HobbyRecommendation[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (currentHobbies.length > 0) {
      loadRecommendations();
    }
  }, [userId, currentHobbies]);

  async function loadRecommendations() {
    setLoading(true);
    try {
      const response = await fetch('/api/recommend-hobbies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });

      const data = await response.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoading(false);
    }
  }

  const categoryColors: Record<string, string> = {
    Creative: 'from-pink-500 to-purple-500',
    Physical: 'from-orange-500 to-red-500',
    Intellectual: 'from-indigo-500 to-purple-500',
    Social: 'from-cyan-500 to-blue-500',
    Other: 'from-green-500 to-emerald-500',
  };

  const difficultyColors: Record<string, string> = {
    Easy: 'bg-green-100 text-green-700',
    Medium: 'bg-yellow-100 text-yellow-700',
    Hard: 'bg-red-100 text-red-700',
  };

  if (currentHobbies.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl shadow-md p-4 mb-6 border border-purple-200"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
            <Lightbulb className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-gray-900">Discover New Hobbies</h3>
            <p className="text-xs text-gray-600">AI recommendations just for you</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {recommendations.length > 0 && !isOpen && (
            <span className="px-3 py-1 bg-purple-500 text-white text-xs font-semibold rounded-full">
              {recommendations.length} ideas
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600" />
          )}
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="pt-4 mt-4 border-t border-purple-200">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">Based on your personality and interests</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    loadRecommendations();
                  }}
                  disabled={loading}
                  className="p-1.5 hover:bg-purple-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 text-gray-600 ${loading ? 'animate-spin' : ''}`} />
                </button>
              </div>

              {loading && recommendations.length === 0 ? (
                <div className="text-center py-6">
                  <div className="inline-block w-6 h-6 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-gray-600 mt-2 text-sm">Finding hobbies for you...</p>
                </div>
              ) : recommendations.length > 0 ? (
                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <h4 className="text-base font-bold text-gray-900">{rec.name}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${difficultyColors[rec.difficulty] || difficultyColors.Medium}`}>
                              {rec.difficulty}
                            </span>
                          </div>
                          <div className={`inline-block px-2 py-0.5 rounded-full bg-gradient-to-r ${categoryColors[rec.category] || categoryColors.Other} text-white text-xs font-semibold`}>
                            {rec.category}
                          </div>
                        </div>
                      </div>

                      <p className="text-gray-700 text-sm mb-2 leading-relaxed">{rec.reason}</p>

                      <div className="flex flex-wrap gap-1.5">
                        {rec.benefits.slice(0, 3).map((benefit, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"
                          >
                            <span className="text-green-500">✓</span>
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 text-gray-500 text-sm">
                  <p>Keep adding hobbies to get recommendations!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

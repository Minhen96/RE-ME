'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, Sprout } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createHobby } from '@/lib/api';

interface AddHobbyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export default function AddHobbyModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: AddHobbyModalProps) {
  const [hobbyName, setHobbyName] = useState('');
  const [isFirstTimer, setIsFirstTimer] = useState(true);
  const [experience, setExperience] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!hobbyName.trim()) return;

    setIsSubmitting(true);

    try {
      await createHobby({
        userId,
        hobbyName: hobbyName.trim(),
        experience: isFirstTimer ? undefined : experience.trim(),
      });

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setHobbyName('');
        setIsFirstTimer(true);
        setExperience('');
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to create hobby:', error);
      alert('Failed to create hobby. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setHobbyName('');
      setIsFirstTimer(true);
      setExperience('');
      setShowSuccess(false);
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl shadow-xl max-w-md w-full z-10 border border-green-200"
          >
            {!showSuccess ? (
              <>
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Sprout className="w-6 h-6 text-white" />
                      </div>
                      <h2 className="text-2xl font-bold text-white">Plant a New Hobby</h2>
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                  <p className="text-green-50 mt-2 text-sm">
                    Start your growth journey with something new
                  </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hobby Name
                    </label>
                    <input
                      type="text"
                      value={hobbyName}
                      onChange={(e) => setHobbyName(e.target.value)}
                      placeholder="e.g., Photography, Guitar, Cooking..."
                      className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="flex items-start gap-3 p-4 bg-white rounded-xl border-2 border-green-200">
                    <input
                      type="checkbox"
                      id="firstTimer"
                      checked={isFirstTimer}
                      onChange={(e) => setIsFirstTimer(e.target.checked)}
                      disabled={isSubmitting}
                      className="w-5 h-5 mt-0.5 text-green-600 border-green-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="firstTimer" className="flex-1 text-sm text-gray-700 cursor-pointer">
                      <span className="font-medium text-gray-900">First timer</span>
                      <p className="text-gray-500 text-xs mt-1">Starting from scratch? Check this box</p>
                    </label>
                  </div>

                  {!isFirstTimer && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
                        Tell us about your experience
                      </label>
                      <textarea
                        id="experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g., I've been playing guitar for 5 years, know basic chords and can play some songs..."
                        className="w-full px-4 py-3 bg-white border-2 border-green-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none transition-all"
                        rows={4}
                        disabled={isSubmitting}
                        required={!isFirstTimer}
                      />
                      <p className="text-xs text-gray-500 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" />
                        AI will analyze your experience and set your starting level
                      </p>
                    </motion.div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="flex-1 px-4 py-3 text-gray-700 bg-white hover:bg-gray-50 rounded-xl font-medium transition-colors border-2 border-gray-200 disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !hobbyName.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Planting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-5 h-5" />
                          Plant Hobby
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-12 px-6"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="text-7xl mb-6"
                >
                  🌱
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Hobby Planted!</h3>
                <p className="text-gray-600">
                  Your journey with <span className="font-semibold text-green-600">{hobbyName}</span> begins now
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

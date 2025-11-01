'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
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
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 z-10"
          >
            {!showSuccess ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Add New Hobby</h2>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">
                  What new hobby would you like to track?
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <input
                      type="text"
                      value={hobbyName}
                      onChange={(e) => setHobbyName(e.target.value)}
                      placeholder="e.g., Photography, Guitar, Cooking..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <input
                      type="checkbox"
                      id="firstTimer"
                      checked={isFirstTimer}
                      onChange={(e) => setIsFirstTimer(e.target.checked)}
                      disabled={isSubmitting}
                      className="w-5 h-5 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                    />
                    <label htmlFor="firstTimer" className="flex-1 text-sm text-gray-700 cursor-pointer">
                      First timer (starting from scratch)
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
                        Tell us about your experience:
                      </label>
                      <textarea
                        id="experience"
                        value={experience}
                        onChange={(e) => setExperience(e.target.value)}
                        placeholder="e.g., I've been playing guitar for 5 years, know basic chords and can play some songs..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                        rows={4}
                        disabled={isSubmitting}
                        required={!isFirstTimer}
                      />
                      <p className="text-xs text-gray-500">
                        AI will analyze your experience and set your starting level accordingly.
                      </p>
                    </motion.div>
                  )}

                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting || !hobbyName.trim()}
                      className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Creating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Add Hobby
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
                className="text-center py-8"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  className="text-6xl mb-4"
                >
                  🌱
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Hobby Added!</h3>
                <p className="text-md text-gray-700">
                  Your journey with {hobbyName} begins now!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

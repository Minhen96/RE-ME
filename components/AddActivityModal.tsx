'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeActivity } from '@/lib/api';

interface AddActivityModalProps {
  isOpen: boolean;
  onClose: () => void;
  hobbyId: string;
  hobbyName: string;
  userId: string;
  onSuccess: () => void;
}

export default function AddActivityModal({
  isOpen,
  onClose,
  hobbyId,
  hobbyName,
  userId,
  onSuccess,
}: AddActivityModalProps) {
  const [activityText, setActivityText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expGained, setExpGained] = useState(0);
  const [newLevel, setNewLevel] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activityText.trim()) return;

    setIsSubmitting(true);

    try {
      const result = await analyzeActivity({
        userId,
        hobbyId,
        text: activityText,
      });

      setExpGained(result.exp_gained);
      setNewLevel(result.new_level);
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setActivityText('');
        onSuccess();
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Failed to log activity:', error);
      alert('Failed to log activity. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setActivityText('');
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
            className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 z-10"
          >
            {!showSuccess ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Log Activity</h2>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">
                  What did you do with <span className="font-semibold text-primary-600">{hobbyName}</span>?
                </p>

                <form onSubmit={handleSubmit}>
                  <textarea
                    value={activityText}
                    onChange={(e) => setActivityText(e.target.value)}
                    placeholder="Describe what you did... The more detail, the more EXP you'll earn!"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    disabled={isSubmitting}
                    required
                  />

                  <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-gray-500">
                      {activityText.length > 100
                        ? '✨ Great detail! Bonus EXP!'
                        : `${100 - activityText.length} chars for bonus`}
                    </p>
                    <div className="flex gap-3">
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
                        disabled={isSubmitting || !activityText.trim()}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Analyzing...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4" />
                            Log Activity
                          </>
                        )}
                      </button>
                    </div>
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
                  ✨
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Activity Logged!</h3>
                <p className="text-lg text-primary-600 font-semibold mb-2">
                  +{expGained} EXP Gained
                </p>
                {newLevel && (
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-md text-gray-700"
                  >
                    Level {newLevel} 🎉
                  </motion.p>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

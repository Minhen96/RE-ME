'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, TrendingUp, CheckCircle } from 'lucide-react';
import { Hobby } from '@/lib/types';
import { analyzeActivity } from '@/lib/api';

interface AddLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  hobby: Hobby;
  userId: string;
  onSuccess: (expGained: number) => void;
}

export default function AddLogModal({ isOpen, onClose, hobby, userId, onSuccess }: AddLogModalProps) {
  const [text, setText] = useState('');
  const [image, setImage] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expGained, setExpGained] = useState(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
      // TODO: Upload image if present
      const imagePath = image ? '' : undefined;

      const result = await analyzeActivity({
        userId,
        hobbyId: hobby.id,
        text,
        imagePath,
      });

      setExpGained(result.exp_gained || 0);
      setShowSuccess(true);

      setTimeout(() => {
        onSuccess(result.exp_gained || 0);
        setText('');
        setImage(null);
        setShowSuccess(false);
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
      setText('');
      setImage(null);
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
            className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl shadow-xl max-w-lg w-full z-10 border border-blue-200"
          >
            {!showSuccess ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-cyan-500 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <TrendingUp className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Log Activity</h2>
                        <p className="text-blue-100 text-sm">{hobby.name}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleClose}
                      disabled={isSubmitting}
                      className="p-2 hover:bg-white/20 rounded-full transition-colors disabled:opacity-50"
                    >
                      <X className="w-5 h-5 text-white" />
                    </button>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                  <div>
                    <label htmlFor="activity-text" className="block text-sm font-medium text-gray-700 mb-2">
                      What did you practice today?
                    </label>
                    <textarea
                      id="activity-text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      rows={5}
                      className="w-full px-4 py-3 bg-white border-2 border-blue-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all"
                      placeholder="Describe your activity in detail to earn more XP..."
                      required
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      The more detailed your description, the better XP rewards you'll get!
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add Photo (Optional)
                    </label>
                    {image ? (
                      <div className="relative">
                        <div className="flex items-center gap-3 p-4 bg-white rounded-xl border-2 border-blue-200">
                          <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                          <span className="text-sm text-gray-700 flex-1 truncate">{image.name}</span>
                          <button
                            type="button"
                            onClick={() => setImage(null)}
                            disabled={isSubmitting}
                            className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-500" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full p-6 bg-white border-2 border-dashed border-blue-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all">
                        <Upload className="w-8 h-8 text-blue-400 mb-2" />
                        <span className="text-sm font-medium text-gray-700">Click to upload image</span>
                        <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => setImage(e.target.files?.[0] || null)}
                          disabled={isSubmitting}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

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
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <TrendingUp className="w-5 h-5" />
                          Log Activity
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
                  ⭐
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Activity Logged!</h3>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-cyan-100 rounded-full mt-4">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  <span className="text-lg font-bold text-blue-700">+{expGained} XP</span>
                </div>
                <p className="text-gray-600 mt-4">
                  Great progress on <span className="font-semibold text-blue-600">{hobby.name}</span>!
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

'use client';

import { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Moon, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeReflection } from '@/lib/api';
import EmotionSlider from './EmotionSlider';

interface ReflectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

const REFLECTION_QUESTIONS = [
  "What made you smile today?",
  "What challenged you today, and how did you handle it?",
  "What are you grateful for right now?",
  "What did you learn about yourself today?",
  "What would you like to improve tomorrow?",
  "Who or what inspired you today?",
  "What accomplishment, big or small, are you proud of today?",
  "How did you take care of yourself today?",
  "What moment today would you like to remember?",
  "What's one thing that went better than expected today?",
];

export default function ReflectionModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: ReflectionModalProps) {
  const [text, setText] = useState('');
  const [emotion, setEmotion] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [result, setResult] = useState<{ emotion: string; summary: string } | null>(null);
  const [showQuestion, setShowQuestion] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState('');

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestion(REFLECTION_QUESTIONS[Math.floor(Math.random() * REFLECTION_QUESTIONS.length)]);
    }
  }, [isOpen]);

  const refreshQuestion = () => {
    const newQuestion = REFLECTION_QUESTIONS[Math.floor(Math.random() * REFLECTION_QUESTIONS.length)];
    setCurrentQuestion(newQuestion);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!text.trim()) return;

    setIsSubmitting(true);

    try {
      const response = await analyzeReflection({
        userId,
        text,
        manualEmotion: emotion,
      });

      setResult({ emotion: response.emotion, summary: response.ai_summary });
      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setText('');
        setEmotion(null);
        setResult(null);
        onSuccess();
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Failed to submit reflection:', error);
      alert('Failed to submit reflection. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setText('');
      setEmotion(null);
      setShowSuccess(false);
      setResult(null);
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
            className="relative bg-gradient-to-br from-purple-50 to-indigo-50 rounded-2xl shadow-xl max-w-2xl w-full z-10 max-h-[90vh] overflow-y-auto border border-purple-200"
          >
            {!showSuccess ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 to-indigo-500 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Moon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Daily Reflection</h2>
                        <p className="text-purple-100 text-sm">Take a moment to reflect on your day</p>
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

                <div className="p-6 space-y-5">
                  {/* Question Prompt */}
                  {showQuestion && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-5 bg-white rounded-xl border-2 border-purple-200 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Sparkles className="w-4 h-4 text-purple-500" />
                            <p className="text-sm font-semibold text-purple-600">Today's Prompt</p>
                          </div>
                          <p className="text-gray-800 font-medium leading-relaxed">{currentQuestion}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={refreshQuestion}
                            className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                            title="Get a different question"
                          >
                            <RefreshCw className="w-4 h-4 text-purple-600" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setShowQuestion(false)}
                            className="p-2 hover:bg-purple-100 rounded-full transition-colors"
                            title="Hide question"
                          >
                            <X className="w-4 h-4 text-purple-600" />
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {!showQuestion && (
                    <button
                      type="button"
                      onClick={() => setShowQuestion(true)}
                      className="text-sm text-purple-600 hover:text-purple-700 font-medium flex items-center gap-2"
                    >
                      <Sparkles className="w-4 h-4" />
                      Show today's prompt
                    </button>
                  )}

                  {/* Form */}
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Reflection
                      </label>
                      <textarea
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        rows={8}
                        className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none transition-all"
                        placeholder="Share your thoughts, feelings, and what you learned today..."
                        disabled={isSubmitting}
                        required
                      />
                    </div>

                    <EmotionSlider
                      value={emotion}
                      onChange={setEmotion}
                      defaultAutoAnalyze={true}
                    />

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
                        disabled={isSubmitting || !text.trim()}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Reflecting...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-5 h-5" />
                            Save Reflection
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
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
                  🌙
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Reflection Saved!</h3>
                {result && (
                  <div className="mt-6 p-6 bg-white rounded-xl border-2 border-purple-200 shadow-sm">
                    <p className="text-lg text-gray-900 mb-3">
                      You felt <span className="font-bold text-purple-600">{result.emotion}</span> tonight
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed">{result.summary}</p>
                  </div>
                )}
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

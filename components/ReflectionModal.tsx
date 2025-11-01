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
      // Set a random question when modal opens
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
            className="absolute inset-0 bg-black/50"
            onClick={handleClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 z-10 max-h-[90vh] overflow-y-auto"
          >
            {!showSuccess ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Moon className="w-6 h-6 text-indigo-600" />
                    <h2 className="text-2xl font-bold text-gray-900">Daily Reflection</h2>
                  </div>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Question Section */}
                {showQuestion && (
                  <div className="mb-4 p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-indigo-600 font-medium mb-1">Today's Prompt</p>
                        <p className="text-gray-800 font-medium">{currentQuestion}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={refreshQuestion}
                          className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
                          title="Get a different question"
                        >
                          <RefreshCw className="w-4 h-4 text-indigo-600" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowQuestion(false)}
                          className="p-2 hover:bg-indigo-100 rounded-full transition-colors"
                          title="Hide question"
                        >
                          <X className="w-4 h-4 text-indigo-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {!showQuestion && (
                  <button
                    type="button"
                    onClick={() => setShowQuestion(true)}
                    className="mb-4 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    + Show question prompt
                  </button>
                )}

                <p className="text-gray-600 text-sm mb-4">
                  {showQuestion
                    ? "Reflect on the question above, or write freely about your day."
                    : "Take a moment to reflect on your day. How are you feeling?"}
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                    placeholder="What's on your mind tonight? Share your thoughts, feelings, and what you learned today..."
                    disabled={isSubmitting}
                    required
                  />

                  <EmotionSlider
                    value={emotion}
                    onChange={setEmotion}
                    defaultAutoAnalyze={true}
                  />

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
                      disabled={isSubmitting || !text.trim()}
                      className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Reflecting...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Submit Reflection
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
                  🌙
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Reflection Saved!</h3>
                {result && (
                  <div className="mt-4 bg-indigo-50 rounded-lg p-4">
                    <p className="text-lg text-indigo-900 mb-2">
                      You felt <span className="font-semibold">{result.emotion}</span> tonight
                    </p>
                    <p className="text-sm text-gray-700">{result.summary}</p>
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

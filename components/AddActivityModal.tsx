'use client';

import { useState } from 'react';
import { X, Sparkles, Loader2, Upload } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeActivity } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import EmotionSlider from './EmotionSlider';

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
  const [emotion, setEmotion] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [expGained, setExpGained] = useState(0);
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [splitProposal, setSplitProposal] = useState<{ activities: string[]; confidence: number } | null>(null);
  const [checkingSplit, setCheckingSplit] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!activityText.trim()) return;

    // If split proposal is shown, don't submit yet - wait for confirmation
    if (splitProposal) return;

    setIsSubmitting(true);
    setCheckingSplit(true);

    try {
      let imagePath: string | undefined = undefined;

      // Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('activity-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload image');
        }

        imagePath = fileName;
      }

      // First check if activity should be split
      const result = await analyzeActivity({
        userId,
        hobbyId,
        text: activityText,
        imagePath,
        manualEmotion: emotion,
      });

      // Check if split is proposed
      if ('should_split' in result && result.should_split && result.activities) {
        setCheckingSplit(false);
        setSplitProposal({
          activities: result.activities,
          confidence: result.confidence || 0,
        });
        setIsSubmitting(false);
        return;
      }

      // Process as single activity or split confirmed
      if ('split' in result && result.split && result.activities) {
        // Multiple activities were processed
        const totalExp = result.total_exp_gained || 0;
        setExpGained(totalExp);
        setNewLevel(result.new_level ?? null);
      } else {
        // Single activity
        setExpGained(result.exp_gained || 0);
        setNewLevel(result.new_level ?? null);
      }

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setActivityText('');
        setEmotion(null);
        setImageFile(null);
        setImagePreview(null);
        setSplitProposal(null);
        onSuccess();
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Failed to log activity:', error);
      alert('Failed to log activity. Please try again.');
    } finally {
      setIsSubmitting(false);
      setCheckingSplit(false);
    }
  };

  const handleConfirmSplit = async () => {
    if (!splitProposal) return;

    setIsSubmitting(true);
    setCheckingSplit(false);

    try {
      let imagePath: string | undefined = undefined;

      // Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('activity-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload image');
        }

        imagePath = fileName;
      }

      // Process split activities
      const result = await analyzeActivity({
        userId,
        hobbyId,
        text: activityText,
        imagePath,
        manualEmotion: emotion,
        splitActivities: splitProposal.activities,
      });

      if (result.split) {
        setExpGained(result.total_exp_gained || 0);
        setNewLevel(result.new_level || null);
      }

      setShowSuccess(true);
      setSplitProposal(null);

      setTimeout(() => {
        setShowSuccess(false);
        setActivityText('');
        setEmotion(null);
        setImageFile(null);
        setImagePreview(null);
        onSuccess();
        onClose();
      }, 2500);
    } catch (error) {
      console.error('Failed to log activities:', error);
      alert('Failed to log activities. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectSplit = () => {
    setSplitProposal(null);
    setCheckingSplit(false);
    setIsSubmitting(false);
    // Continue with single activity
    handleSubmit({ preventDefault: () => {} } as React.FormEvent);
  };

  const handleClose = () => {
    if (!isSubmitting && !checkingSplit) {
      setActivityText('');
      setEmotion(null);
      setImageFile(null);
      setImagePreview(null);
      setShowSuccess(false);
      setSplitProposal(null);
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
            {!showSuccess && !splitProposal ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Log Activity</h2>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting || checkingSplit}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">
                  What did you do with <span className="font-semibold text-primary-600">{hobbyName}</span>?
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <textarea
                    value={activityText}
                    onChange={(e) => setActivityText(e.target.value)}
                    placeholder="Describe what you did... The more detail, the more EXP you'll earn!"
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                    disabled={isSubmitting}
                    required
                  />

                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Add a photo (optional)
                    </label>
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          disabled={isSubmitting}
                          className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-400 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Click to upload image</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          disabled={isSubmitting}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>

                  <EmotionSlider
                    value={emotion}
                    onChange={setEmotion}
                    defaultAutoAnalyze={true}
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
                        disabled={isSubmitting || checkingSplit || !activityText.trim()}
                        className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {(isSubmitting || checkingSplit) ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            {checkingSplit ? 'Checking...' : 'Analyzing...'}
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
            ) : splitProposal ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">Split Activity?</h2>
                  <button
                    onClick={handleClose}
                    disabled={isSubmitting}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-gray-600 mb-4">
                  We detected multiple activities in your entry. Would you like to split them into separate logs?
                </p>

                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    Activities detected ({splitProposal.activities.length}):
                  </p>
                  {splitProposal.activities.map((activity, index) => (
                    <div
                      key={index}
                      className="bg-white p-3 rounded border border-gray-200"
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-primary-600 font-semibold text-sm">
                          {index + 1}.
                        </span>
                        <p className="text-sm text-gray-700 flex-1">{activity}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 justify-end pt-4">
                  <button
                    onClick={handleRejectSplit}
                    disabled={isSubmitting}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Keep as One
                  </button>
                  <button
                    onClick={handleConfirmSplit}
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Split & Log All
                      </>
                    )}
                  </button>
                </div>
              </motion.div>
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

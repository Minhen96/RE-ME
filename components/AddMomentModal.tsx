'use client';

import { useState } from 'react';
import { X, Heart, Loader2, Upload, Image as ImageIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createMoment } from '@/lib/api';
import { supabase } from '@/lib/supabaseClient';
import EmotionSlider from './EmotionSlider';

interface AddMomentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSuccess: () => void;
}

export default function AddMomentModal({
  isOpen,
  onClose,
  userId,
  onSuccess,
}: AddMomentModalProps) {
  const [momentText, setMomentText] = useState('');
  const [emotion, setEmotion] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(false);

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

    if (!momentText.trim()) return;

    setIsSubmitting(true);
    setUploadProgress(true);

    try {
      let imagePath: string | undefined = undefined;

      // Upload image if exists
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${userId}/${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from('moment-images')
          .upload(fileName, imageFile);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          throw new Error('Failed to upload image');
        }

        imagePath = fileName;
      }

      await createMoment({
        userId,
        text: momentText,
        imagePath,
        manualEmotion: emotion,
      });

      setShowSuccess(true);

      setTimeout(() => {
        setShowSuccess(false);
        setMomentText('');
        setEmotion(null);
        setImageFile(null);
        setImagePreview(null);
        onSuccess();
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Failed to create moment:', error);
      alert('Failed to create moment. Please try again.');
    } finally {
      setIsSubmitting(false);
      setUploadProgress(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setMomentText('');
      setEmotion(null);
      setImageFile(null);
      setImagePreview(null);
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
            className="relative bg-gradient-to-br from-rose-50 to-orange-50 rounded-2xl shadow-xl max-w-lg w-full z-10 border border-rose-200"
          >
            {!showSuccess ? (
              <>
                {/* Header */}
                <div className="bg-gradient-to-r from-red-400 to-orange-400 p-6 rounded-t-2xl">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-white/20 rounded-lg">
                        <Heart className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-white">Capture a Happy Moment</h2>
                        <p className="text-red-50 text-sm">What made you smile today?</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Describe your moment
                    </label>
                    <textarea
                      value={momentText}
                      onChange={(e) => setMomentText(e.target.value)}
                      placeholder="A wonderful moment happened today..."
                      rows={4}
                      className="w-full px-4 py-3 bg-white border-2 border-rose-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-red-400 resize-none transition-all"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

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
                          className="w-full h-48 object-cover rounded-xl border-2 border-rose-200"
                        />
                        <button
                          type="button"
                          onClick={removeImage}
                          disabled={isSubmitting}
                          className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-full hover:bg-white transition-colors shadow-lg disabled:opacity-50"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full p-8 bg-white border-2 border-dashed border-rose-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-rose-50 transition-all">
                        <Upload className="w-10 h-10 text-rose-400 mb-3" />
                        <p className="text-sm font-medium text-gray-700 mb-1">Click to upload image</p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
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
                      disabled={isSubmitting || !momentText.trim()}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-red-400 to-orange-400 hover:from-red-500 hover:to-orange-500 text-white rounded-xl font-medium transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Heart className="w-5 h-5" />
                          Save Moment
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
                  ❤️
                </motion.div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Moment Saved!</h3>
                <p className="text-gray-600">
                  Your happy memory has been captured forever
                </p>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

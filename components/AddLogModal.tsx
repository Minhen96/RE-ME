'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2 } from 'lucide-react';
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

    onSuccess(result.exp_gained);
    setText('');
    setImage(null);
    onClose();
    } catch (error) {
    console.error('Failed to log activity:', error);
    alert('Failed to log activity. Please try again.');
    } finally {
    setIsSubmitting(false);
    }
};

return (
    <AnimatePresence>
    {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6"
        >
            <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
                Log Activity: {hobby.name}
            </h2>
            <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
                <X className="w-5 h-5" />
            </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label htmlFor="activity-text" className="block text-sm font-medium text-gray-700 mb-2">
                What did you do?
                </label>
                <textarea
                id="activity-text"
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2
focus:ring-primary-500 focus:border-transparent"
                placeholder="Describe your activity..."
                required
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                Add Image (Optional)
                </label>
                <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg
cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <span className="text-sm">Choose File</span>
                    <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files?.[0] || null)}
                    className="hidden"
                    />
                </label>
                {image && (
                    <span className="text-sm text-gray-600">{image.name}</span>
                )}
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                Cancel
                </button>
                <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors
disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                {isSubmitting ? 'Logging...' : 'Log Activity'}
                </button>
            </div>
            </form>
        </motion.div>
        </div>
    )}
    </AnimatePresence>
);
}
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Loader2, Sparkles } from 'lucide-react';
import { analyzeReflection } from '@/lib/api';

interface ReflectionFormProps {
userId: string;
onSuccess: () => void;
}

export default function ReflectionForm({ userId, onSuccess }: ReflectionFormProps) {
const [text, setText] = useState('');
const [isSubmitting, setIsSubmitting] = useState(false);
const [result, setResult] = useState<{ emotion: string; summary: string } | null>(null);

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setIsSubmitting(true);
    try {
    const response = await analyzeReflection({ userId, text });
    setResult({ emotion: response.emotion, summary: response.ai_summary });
    setText('');
    setTimeout(() => {
        setResult(null);
        onSuccess();
    }, 5000);
    } catch (error) {
    console.error('Failed to submit reflection:', error);
    alert('Failed to submit reflection. Please try again.');
    } finally {
    setIsSubmitting(false);
    }
};

return (
    <div className="max-w-2xl mx-auto">
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-6 space-y-4">
        <div className="flex items-center gap-3 mb-4">
        <Moon className="w-6 h-6 text-primary-600" />
        <h2 className="text-2xl font-bold text-gray-900">Daily Reflection</h2>
        </div>

        <p className="text-gray-600 text-sm mb-4">
        Take a moment to reflect on your day. How are you feeling?
        </p>

        <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={6}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500
focus:border-transparent resize-none"
        placeholder="What's on your mind tonight? Share your thoughts, feelings, and what you learned today..."
        required
        />

        <button
        type="submit"
        disabled={isSubmitting || !text.trim()}
        className="w-full px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg
transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
        {isSubmitting && <Loader2 className="w-5 h-5 animate-spin" />}
        {isSubmitting ? 'Reflecting...' : 'Submit Reflection'}
        </button>
    </form>

    {result && (
        <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg shadow-lg p-6"
        >
        <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-900">
            You felt {result.emotion} tonight — a beautiful moment of rest 🌙
            </h3>
        </div>
        <p className="text-gray-700">{result.summary}</p>
        </motion.div>
    )}
    </div>
);
}
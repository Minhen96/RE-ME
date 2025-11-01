'use client';

import { useState } from 'react';
import { Moment } from '@/lib/types';
import { Heart, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface MomentsGalleryProps {
moments: Moment[];
onAddMoment: () => void;
}

export default function MomentsGallery({ moments, onAddMoment }: MomentsGalleryProps) {
const [selectedMoment, setSelectedMoment] = useState<Moment | null>(null);

return (
    <div>
    <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
        <Heart className="w-6 h-6 text-red-500" />
        <h2 className="text-2xl font-bold text-gray-900">Happy Moments</h2>
        </div>
        <button
        onClick={onAddMoment}
        className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg
transition-colors"
        >
        <Plus className="w-5 h-5" />
        Add Moment
        </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {moments.map((moment, index) => (
        <motion.div
            key={moment.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl
transition-shadow"
            onClick={() => setSelectedMoment(moment)}
        >
            {moment.image_path ? (
            <img
                src={moment.image_path}
                alt={moment.text || 'Happy moment'}
                className="w-full h-64 object-cover"
                loading="lazy"
            />
            ) : (
            <div className="w-full h-64 bg-gradient-to-br from-primary-100 to-primary-200 flex items-center
justify-center">
                <Heart className="w-12 h-12 text-primary-400" />
            </div>
            )}
            {moment.text && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className="text-white text-sm line-clamp-2">{moment.text}</p>
            </div>
            )}
        </motion.div>
        ))}
    </div>

    {moments.length === 0 && (
        <div className="text-center py-12 text-gray-500">
        <Heart className="w-12 h-12 mx-auto mb-3 text-gray-300" />
        <p>No moments captured yet. Start collecting your happy memories!</p>
        </div>
    )}

    {selectedMoment && (
        <div
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
        onClick={() => setSelectedMoment(null)}
        >
        <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg max-w-2xl w-full p-6"
            onClick={(e) => e.stopPropagation()}
        >
            {selectedMoment.image_path && (
            <img
                src={selectedMoment.image_path}
                alt={selectedMoment.text || 'Happy moment'}
                className="w-full rounded-lg mb-4"
            />
            )}
            {selectedMoment.text && (
            <p className="text-gray-800 mb-2">{selectedMoment.text}</p>
            )}
            <p className="text-sm text-gray-500">
            {new Date(selectedMoment.created_at).toLocaleDateString()}
            </p>
        </motion.div>
        </div>
    )}
    </div>
);
}
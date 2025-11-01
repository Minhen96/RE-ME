'use client';

import { motion } from 'framer-motion';
import { Hobby } from '@/lib/types';
import { Sprout, TrendingUp } from 'lucide-react';

interface HobbyCardProps {
  hobby: Hobby;
  onClick?: () => void;
}

export default function HobbyCard({ hobby, onClick }: HobbyCardProps) {
  const progress = hobby.meta.level_thresholds?.[hobby.level]
    ? (hobby.exp / hobby.meta.level_thresholds[hobby.level]) * 100
    : 0;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900">{hobby.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{hobby.category}</p>
        </div>
        <div className="flex items-center gap-2 bg-primary-100 px-3 py-1 rounded-full">
          <Sprout className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">
            Lv {hobby.level}
          </span>
        </div>
      </div>

      {hobby.description && (
        <p className="text-sm text-gray-700 mb-4 line-clamp-2">
          {hobby.description}
        </p>
      )}

      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1 text-gray-600">
            <TrendingUp className="w-4 h-4" />
            <span>EXP</span>
          </div>
          <span className="font-medium text-gray-900">
            {hobby.exp} / {hobby.meta.level_thresholds?.[hobby.level] || 100}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <motion.div
            className="bg-gradient-to-r from-primary-400 to-primary-600 h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(progress, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>
      </div>

      {hobby.meta.subskills && hobby.meta.subskills.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {hobby.meta.subskills.slice(0, 3).map((skill, index) => (
            <span
              key={index}
              className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded"
            >
              {skill}
            </span>
          ))}
          {hobby.meta.subskills.length > 3 && (
            <span className="text-xs text-gray-500">
              +{hobby.meta.subskills.length - 3} more
            </span>
          )}
        </div>
      )}
    </motion.div>
  );
}
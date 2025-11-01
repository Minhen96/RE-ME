'use client';

import { ActivityLog } from '@/lib/types';
import { Calendar, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface ActivityTimelineProps {
activities: ActivityLog[];
}

export default function ActivityTimeline({ activities }: ActivityTimelineProps) {
return (
    <div className="space-y-4">
    {activities.map((activity, index) => (
        <motion.div
        key={activity.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
        className="bg-white rounded-lg shadow p-4 border-l-4 border-primary-400"
        >
        <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>{new Date(activity.created_at).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-1 text-primary-600 font-medium">
            <Sparkles className="w-4 h-4" />
            <span>+{activity.exp_gained} XP</span>
            </div>
        </div>

        {activity.text && (
            <p className="text-gray-800 mb-2">{activity.text}</p>
        )}

        {activity.ai_summary && (
            <div className="bg-primary-50 rounded p-3 mb-2">
            <p className="text-sm text-gray-700">
                <span className="font-medium">AI Summary:</span> {activity.ai_summary}
            </p>
            </div>
        )}

        {activity.ai_skills && activity.ai_skills.length > 0 && (
            <div className="flex flex-wrap gap-2">
            {activity.ai_skills.map((skill, idx) => (
                <span
                key={idx}
                className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded"
                >
                {skill}
                </span>
            ))}
            </div>
        )}

        {activity.image_path && (
            <img
            src={activity.image_path}
            alt="Activity"
            className="mt-3 rounded-lg max-h-64 object-cover"
            />
        )}
        </motion.div>
    ))}

    {activities.length === 0 && (
        <div className="text-center py-12 text-gray-500">
        <p>No activities yet. Start logging your journey!</p>
        </div>
    )}
    </div>
);
}
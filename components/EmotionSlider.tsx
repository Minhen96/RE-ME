'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface EmotionSliderProps {
  value: number | null;
  onChange: (value: number | null) => void;
  defaultAutoAnalyze?: boolean;
}

export default function EmotionSlider({
  value,
  onChange,
  defaultAutoAnalyze = true,
}: EmotionSliderProps) {
  const [autoAnalyze, setAutoAnalyze] = useState(defaultAutoAnalyze);
  const [sliderValue, setSliderValue] = useState(0);

  useEffect(() => {
    if (value !== null) {
      setSliderValue(value);
      setAutoAnalyze(false);
    }
  }, [value]);

  const handleCheckboxChange = (checked: boolean) => {
    setAutoAnalyze(checked);
    if (checked) {
      onChange(null);
      setSliderValue(0);
    }
  };

  const handleSliderChange = (newValue: number) => {
    setSliderValue(newValue);
    setAutoAnalyze(false);
    onChange(newValue);
  };

  const getEmoji = (val: number) => {
    if (val < -0.6) return '😢';
    if (val < -0.2) return '😕';
    if (val < 0.2) return '😐';
    if (val < 0.6) return '🙂';
    return '😊';
  };

  const getLabel = (val: number) => {
    if (val < -0.6) return 'Very Negative';
    if (val < -0.2) return 'Negative';
    if (val < 0.2) return 'Neutral';
    if (val < 0.6) return 'Positive';
    return 'Very Positive';
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          How do you feel about this?
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoAnalyze}
            onChange={(e) => handleCheckboxChange(e.target.checked)}
            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
            disabled={!autoAnalyze && value !== null}
          />
          <span
            className={`text-sm ${
              autoAnalyze ? 'text-gray-700' : 'text-gray-400'
            }`}
          >
            Auto-analyze emotion
          </span>
        </label>
      </div>

      <div
        className={`space-y-2 transition-opacity ${
          autoAnalyze ? 'opacity-40 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>😢 Negative</span>
          <motion.span
            key={sliderValue}
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="text-2xl"
          >
            {getEmoji(sliderValue)}
          </motion.span>
          <span>😊 Positive</span>
        </div>

        <input
          type="range"
          min="-1"
          max="1"
          step="0.1"
          value={sliderValue}
          onChange={(e) => handleSliderChange(parseFloat(e.target.value))}
          disabled={autoAnalyze}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
          style={{
            background: autoAnalyze
              ? '#e5e7eb'
              : `linear-gradient(to right,
                  #ef4444 0%,
                  #f59e0b ${((sliderValue + 1) / 2) * 50}%,
                  #10b981 ${((sliderValue + 1) / 2) * 100}%,
                  #10b981 100%)`,
          }}
        />

        <p className="text-center text-sm font-medium text-gray-700">
          {getLabel(sliderValue)}
        </p>
      </div>

      {autoAnalyze && (
        <p className="text-xs text-gray-500 italic">
          ✨ AI will analyze the emotion for you
        </p>
      )}
    </div>
  );
}

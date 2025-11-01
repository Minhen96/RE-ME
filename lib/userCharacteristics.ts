// Analyzes user characteristics based on hobbies and activities

export interface UserCharacteristics {
  personalityTraits: {
    trait: string;
    value: number;
    description: string;
  }[];
  activityPreferences: {
    name: string;
    value: number;
    color: string;
  }[];
  dominantTraits: string[];
  insights: string[];
}

// Category mappings for different personality dimensions
const categoryTraitMap: Record<string, Record<string, number>> = {
  // Outdoor vs Indoor
  outdoor: {
    Physical: 0.8,
    Creative: 0.3,
    Intellectual: -0.2,
    Social: 0.4,
    Other: 0,
  },

  // Social vs Solo
  social: {
    Physical: 0.5,
    Creative: 0.3,
    Intellectual: 0.2,
    Social: 0.9,
    Other: 0.3,
  },

  // Creative vs Analytical
  creative: {
    Physical: 0.2,
    Creative: 0.9,
    Intellectual: 0.4,
    Social: 0.3,
    Other: 0.2,
  },

  // Active vs Calm
  active: {
    Physical: 0.9,
    Creative: 0.4,
    Intellectual: -0.3,
    Social: 0.5,
    Other: 0.2,
  },

  // Practical vs Theoretical
  practical: {
    Physical: 0.6,
    Creative: 0.3,
    Intellectual: -0.4,
    Social: 0.2,
    Other: 0.5,
  },

  // Adventurous vs Routine
  adventurous: {
    Physical: 0.7,
    Creative: 0.5,
    Intellectual: 0.3,
    Social: 0.4,
    Other: 0.2,
  },
};

export function analyzeUserCharacteristics(
  hobbies: any[],
  activities: any[]
): UserCharacteristics {
  if (hobbies.length === 0) {
    // Default characteristics for new users
    return {
      personalityTraits: [
        { trait: 'Outdoor Explorer', value: 50, description: 'Balance of indoor and outdoor activities' },
        { trait: 'Social Butterfly', value: 50, description: 'Mix of social and solo time' },
        { trait: 'Creative Spirit', value: 50, description: 'Blend of creative and analytical thinking' },
        { trait: 'Active Mover', value: 50, description: 'Balance of active and calm pursuits' },
        { trait: 'Practical Doer', value: 50, description: 'Mix of hands-on and theoretical interests' },
        { trait: 'Adventure Seeker', value: 50, description: 'Balance of new experiences and routines' },
      ],
      activityPreferences: [
        { name: 'Physical', value: 25, color: '#f97316' },
        { name: 'Mental', value: 25, color: '#8b5cf6' },
        { name: 'Social', value: 25, color: '#06b6d4' },
        { name: 'Creative', value: 25, color: '#ec4899' },
      ],
      dominantTraits: ['Balanced Explorer'],
      insights: ['Start adding hobbies to discover your unique personality profile!'],
    };
  }

  // Calculate personality traits
  const traitScores: Record<string, number> = {};
  let totalWeight = 0;

  hobbies.forEach((hobby) => {
    const weight = (hobby.level || 1) * (activities.filter((a) => a.hobby_id === hobby.id).length || 1);
    const category = hobby.category || 'Other';

    Object.entries(categoryTraitMap).forEach(([trait, categoryWeights]) => {
      const contribution = (categoryWeights[category] || 0) * weight;
      traitScores[trait] = (traitScores[trait] || 0) + contribution;
    });

    totalWeight += weight;
  });

  // Normalize to 0-100 scale
  const normalizedTraits = Object.entries(traitScores).map(([trait, score]) => {
    const normalized = Math.max(0, Math.min(100, 50 + (score / totalWeight) * 100));
    return { trait, value: normalized };
  });

  // Create personality trait labels
  const personalityTraits = [
    {
      trait: normalizedTraits.find((t) => t.trait === 'outdoor')!.value > 50 ? 'Outdoor Explorer' : 'Indoor Enthusiast',
      value: normalizedTraits.find((t) => t.trait === 'outdoor')!.value,
      description: normalizedTraits.find((t) => t.trait === 'outdoor')!.value > 50
        ? 'You thrive in nature and outdoor settings'
        : 'You prefer cozy indoor environments',
    },
    {
      trait: normalizedTraits.find((t) => t.trait === 'social')!.value > 50 ? 'Social Butterfly' : 'Solo Thinker',
      value: normalizedTraits.find((t) => t.trait === 'social')!.value,
      description: normalizedTraits.find((t) => t.trait === 'social')!.value > 50
        ? 'You energize through social connections'
        : 'You recharge with solitary activities',
    },
    {
      trait: normalizedTraits.find((t) => t.trait === 'creative')!.value > 50 ? 'Creative Spirit' : 'Analytical Mind',
      value: normalizedTraits.find((t) => t.trait === 'creative')!.value,
      description: normalizedTraits.find((t) => t.trait === 'creative')!.value > 50
        ? 'You express yourself through creative pursuits'
        : 'You excel at logical problem-solving',
    },
    {
      trait: normalizedTraits.find((t) => t.trait === 'active')!.value > 50 ? 'Active Mover' : 'Calm Observer',
      value: normalizedTraits.find((t) => t.trait === 'active')!.value,
      description: normalizedTraits.find((t) => t.trait === 'active')!.value > 50
        ? 'You love physical movement and energy'
        : 'You appreciate stillness and contemplation',
    },
    {
      trait: normalizedTraits.find((t) => t.trait === 'practical')!.value > 50 ? 'Practical Doer' : 'Theoretical Thinker',
      value: normalizedTraits.find((t) => t.trait === 'practical')!.value,
      description: normalizedTraits.find((t) => t.trait === 'practical')!.value > 50
        ? 'You focus on hands-on, tangible outcomes'
        : 'You enjoy abstract concepts and ideas',
    },
    {
      trait: normalizedTraits.find((t) => t.trait === 'adventurous')!.value > 50 ? 'Adventure Seeker' : 'Routine Lover',
      value: normalizedTraits.find((t) => t.trait === 'adventurous')!.value,
      description: normalizedTraits.find((t) => t.trait === 'adventurous')!.value > 50
        ? 'You crave new experiences and challenges'
        : 'You find comfort in familiar patterns',
    },
  ];

  // Calculate activity preferences
  const categoryScores: Record<string, number> = {
    Physical: 0,
    Mental: 0,
    Social: 0,
    Creative: 0,
  };

  hobbies.forEach((hobby) => {
    const weight = hobby.level || 1;
    const category = hobby.category || 'Other';

    if (category === 'Physical') categoryScores.Physical += weight;
    else if (category === 'Intellectual') categoryScores.Mental += weight;
    else if (category === 'Social') categoryScores.Social += weight;
    else if (category === 'Creative') categoryScores.Creative += weight;
    else {
      // Distribute 'Other' among all categories
      categoryScores.Physical += weight * 0.25;
      categoryScores.Mental += weight * 0.25;
      categoryScores.Social += weight * 0.25;
      categoryScores.Creative += weight * 0.25;
    }
  });

  const totalCategoryScore = Object.values(categoryScores).reduce((sum, v) => sum + v, 0);
  const activityPreferences = [
    {
      name: 'Physical',
      value: totalCategoryScore > 0 ? (categoryScores.Physical / totalCategoryScore) * 100 : 25,
      color: '#f97316',
    },
    {
      name: 'Mental',
      value: totalCategoryScore > 0 ? (categoryScores.Mental / totalCategoryScore) * 100 : 25,
      color: '#8b5cf6',
    },
    {
      name: 'Social',
      value: totalCategoryScore > 0 ? (categoryScores.Social / totalCategoryScore) * 100 : 25,
      color: '#06b6d4',
    },
    {
      name: 'Creative',
      value: totalCategoryScore > 0 ? (categoryScores.Creative / totalCategoryScore) * 100 : 25,
      color: '#ec4899',
    },
  ];

  // Find dominant traits (top 3 highest scores)
  const dominantTraits = personalityTraits
    .sort((a, b) => Math.abs(b.value - 50) - Math.abs(a.value - 50))
    .slice(0, 3)
    .map((t) => t.trait);

  // Generate insights
  const insights: string[] = [];

  const topActivity = activityPreferences.reduce((max, curr) =>
    curr.value > max.value ? curr : max
  );

  if (topActivity.value > 40) {
    insights.push(`You're strongly drawn to ${topActivity.name.toLowerCase()} pursuits`);
  }

  const extremeTraits = personalityTraits.filter(
    (t) => t.value > 70 || t.value < 30
  );

  if (extremeTraits.length > 0) {
    insights.push(
      `You have a clear preference for ${extremeTraits[0].trait.toLowerCase()} activities`
    );
  }

  if (hobbies.length >= 5) {
    insights.push('You have a diverse range of interests!');
  }

  if (activities.length >= 20) {
    insights.push('Your dedication to your hobbies is remarkable!');
  }

  if (insights.length === 0) {
    insights.push('Keep exploring to discover more about yourself!');
  }

  return {
    personalityTraits,
    activityPreferences,
    dominantTraits,
    insights,
  };
}

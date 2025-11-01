/**
 * Dynamic level threshold calculation
 * Simple, consistent formula with small increments
 * Each level requires a small, gradually increasing amount more EXP
 */

/**
 * Calculate the EXP threshold required to reach a specific level
 * Formula: Each level requires incrementally more EXP
 * Level 1: 12 EXP
 * Level 2: 26 EXP (+14)
 * Level 3: 42 EXP (+16)
 * Level 4: 60 EXP (+18)
 * Level 5: 80 EXP (+20)
 * Pattern: Starting at 12, each level adds 14 + (level-2)*2 more EXP
 */
export function calculateLevelThreshold(level: number): number {
  if (level <= 0) return 0;
  if (level === 1) return 12;
  
  // Level 1 is 12 EXP
  // Each subsequent level adds: 14 + (level-2)*2 more EXP
  // This creates: +14, +16, +18, +20, +22... pattern
  let total = 12;
  for (let i = 2; i <= level; i++) {
    const increment = 14 + (i - 2) * 2;
    total += increment;
  }
  
  return total;
}

/**
 * Calculate the current level based on total EXP
 * Supports unlimited levels by calculating on-the-fly
 */
export function calculateLevelFromExp(exp: number, storedThresholds?: number[]): number {
  let level = 0;
  
  // If we have stored thresholds, use them first
  if (storedThresholds && storedThresholds.length > 0) {
    for (let i = 0; i < storedThresholds.length; i++) {
      if (exp >= storedThresholds[i]) {
        level = i + 1;
      }
    }
    
    // If exp exceeds stored thresholds, calculate dynamically from there
    if (exp >= storedThresholds[storedThresholds.length - 1]) {
      let checkLevel = storedThresholds.length + 1;
      while (exp >= calculateLevelThreshold(checkLevel)) {
        level = checkLevel;
        checkLevel++;
        // Safety limit to prevent infinite loops
        if (checkLevel > 1000) break;
      }
    }
  } else {
    // No stored thresholds, calculate dynamically
    let checkLevel = 1;
    while (exp >= calculateLevelThreshold(checkLevel)) {
      level = checkLevel;
      checkLevel++;
      // Safety limit
      if (checkLevel > 1000) break;
    }
  }
  
  return level;
}

/**
 * Generate thresholds array for a given number of levels
 */
export function generateLevelThresholds(maxLevel: number = 10): number[] {
  const thresholds: number[] = [];
  for (let level = 1; level <= maxLevel; level++) {
    thresholds.push(calculateLevelThreshold(level));
  }
  return thresholds;
}


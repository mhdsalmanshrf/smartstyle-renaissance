
// Color harmony rules and outfit intelligence logic

type ColorHarmonyRules = {
  [key: string]: {
    complementary: string[];
    avoid: string[];
  };
};

export type SkinToneType = "fair" | "light" | "medium" | "olive" | "tan" | "dark" | "deep";
export type OccasionType = "casual" | "formal" | "business" | "workout" | "beach" | "wedding" | "funeral";
export type SeasonType = "spring" | "summer" | "fall" | "winter";

// Color harmony rules based on color theory
export const colorHarmonyRules: ColorHarmonyRules = {
  red: {
    complementary: ["navy", "blue", "white", "black", "gray", "beige"],
    avoid: ["orange", "pink", "purple"],
  },
  blue: {
    complementary: ["white", "gray", "beige", "navy", "brown", "orange"],
    avoid: ["black", "green", "purple"],
  },
  green: {
    complementary: ["white", "beige", "gray", "brown", "navy"],
    avoid: ["red", "orange", "yellow"],
  },
  yellow: {
    complementary: ["navy", "blue", "purple", "gray", "white"],
    avoid: ["orange", "red", "green"],
  },
  purple: {
    complementary: ["beige", "gray", "white", "yellow"],
    avoid: ["red", "blue", "pink"],
  },
  pink: {
    complementary: ["navy", "gray", "white", "beige"],
    avoid: ["red", "purple", "orange"],
  },
  orange: {
    complementary: ["blue", "navy", "white", "gray"],
    avoid: ["red", "yellow", "pink"],
  },
  brown: {
    complementary: ["blue", "green", "beige", "white", "gray"],
    avoid: ["black", "navy", "purple"],
  },
  black: {
    complementary: ["white", "gray", "red", "beige"],
    avoid: ["navy", "brown", "dark green"],
  },
  white: {
    complementary: ["black", "navy", "blue", "red", "green", "purple", "gray"],
    avoid: [],
  },
  gray: {
    complementary: ["black", "navy", "blue", "red", "pink", "purple", "white"],
    avoid: [],
  },
  navy: {
    complementary: ["white", "beige", "gray", "pink", "red"],
    avoid: ["black", "blue", "purple"],
  },
  beige: {
    complementary: ["navy", "black", "brown", "blue", "green", "red"],
    avoid: [],
  },
  teal: {
    complementary: ["white", "beige", "gray", "navy"],
    avoid: ["green", "blue", "purple"],
  },
  maroon: {
    complementary: ["white", "beige", "gray", "navy"],
    avoid: ["red", "purple", "pink"],
  },
};

// Skin tone color harmony suggestions
export const skinToneColorRecommendations: Record<SkinToneType, string[]> = {
  fair: ["navy", "blue", "purple", "pink", "green"],
  light: ["navy", "blue", "purple", "pink", "red", "green"],
  medium: ["blue", "green", "red", "orange", "purple"],
  olive: ["green", "brown", "orange", "teal", "maroon"],
  tan: ["brown", "orange", "green", "blue", "beige"],
  dark: ["yellow", "orange", "red", "white", "pink"],
  deep: ["yellow", "orange", "red", "white", "green"]
};

// Occasion color appropriateness
export const occasionColorRecommendations: Record<OccasionType, string[]> = {
  casual: ["blue", "green", "red", "yellow", "pink", "gray", "beige"],
  formal: ["black", "navy", "gray", "white", "beige"],
  business: ["navy", "gray", "white", "beige", "blue"],
  workout: ["black", "gray", "blue", "red", "pink", "green"],
  beach: ["white", "blue", "yellow", "orange", "pink", "beige"],
  wedding: ["beige", "white", "gray", "navy", "light blue", "pink"],
  funeral: ["black", "navy", "gray", "white"]
};

// Season color recommendations
export const seasonColorRecommendations: Record<SeasonType, string[]> = {
  spring: ["pink", "yellow", "light blue", "green", "beige"],
  summer: ["white", "blue", "light green", "yellow", "pink"],
  fall: ["brown", "orange", "maroon", "olive", "navy"],
  winter: ["black", "gray", "navy", "white", "red"]
};

export const getColorHarmonyScore = (
  color1: string, 
  color2: string, 
  skinTone?: string | null,
  occasion?: OccasionType,
  season?: SeasonType
): number => {
  let score = 50; // Base score

  // Check color harmony
  if (colorHarmonyRules[color1]?.complementary.includes(color2)) {
    score += 20;
  }

  if (colorHarmonyRules[color1]?.avoid.includes(color2)) {
    score -= 20;
  }

  // Add skin tone factor
  if (skinTone && skinToneColorRecommendations[skinTone as SkinToneType]?.includes(color1)) {
    score += 15;
  }

  // Add occasion factor
  if (occasion && occasionColorRecommendations[occasion]?.includes(color1)) {
    score += 15;
  }

  // Add season factor
  if (season && seasonColorRecommendations[season]?.includes(color1)) {
    score += 10;
  }

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
};

// Get current season based on hemisphere and month
export const getCurrentSeason = (latitude: number = 0): SeasonType => {
  const month = new Date().getMonth(); // 0-11
  
  // Northern hemisphere
  if (latitude >= 0) {
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  } 
  // Southern hemisphere
  else {
    if (month >= 2 && month <= 4) return "fall";
    if (month >= 5 && month <= 7) return "winter";
    if (month >= 8 && month <= 10) return "spring";
    return "summer";
  }
};

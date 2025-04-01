
import { ClothingItem } from "@/contexts/WardrobeContext";
import { OccasionType, SkinToneType, SeasonType, getColorHarmonyScore, getCurrentSeason } from "./colorHarmony";

// Calculate a score for an outfit based on various factors
export const calculateOutfitScore = (
  items: ClothingItem[], 
  userSkinTone: string | null,
  occasion: OccasionType = "casual",
  wearHistory: Record<string, number> = {},
  userPreferences: Record<string, number> = {}
): number => {
  if (items.length === 0) return 0;
  
  let totalScore = 0;
  let pairScores = 0;
  let pairsCount = 0;
  const season = getCurrentSeason();

  // Calculate harmony between pairs of items
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const harmonyScore = getColorHarmonyScore(
        items[i].color, 
        items[j].color, 
        userSkinTone, 
        occasion,
        season
      );
      pairScores += harmonyScore;
      pairsCount++;
    }
    
    // Add scores for wear history (favor less worn items)
    const wearCount = wearHistory[items[i].id] || 0;
    const freshnessScore = Math.max(0, 20 - wearCount * 2); // Lower score for frequently worn items
    totalScore += freshnessScore;
    
    // Add user preference boost
    items[i].tags.forEach(tag => {
      if (userPreferences[tag]) {
        totalScore += userPreferences[tag];
      }
    });
    
    // Add occasion appropriateness
    if (
      (occasion === "formal" && ["suit", "dress", "blazer"].some(t => items[i].type.includes(t))) ||
      (occasion === "casual" && ["tshirt", "jeans", "sneakers"].some(t => items[i].type.includes(t))) ||
      (occasion === "business" && ["shirt", "blouse", "pants", "skirt"].some(t => items[i].type.includes(t))) ||
      (occasion === "workout" && ["tshirt", "shorts", "leggings"].some(t => items[i].type.includes(t))) ||
      (occasion === "beach" && ["swimsuit", "shorts", "sandals"].some(t => items[i].type.includes(t))) ||
      (occasion === "wedding" && ["suit", "dress", "formal"].some(t => items[i].type.includes(t) || items[i].tags.includes(t))) ||
      (occasion === "funeral" && items[i].color === "black")
    ) {
      totalScore += 15;
    }
  }
  
  // Average the pair scores if there are any pairs
  if (pairsCount > 0) {
    totalScore += pairScores / pairsCount;
  }
  
  // Normalize to 0-100 scale
  return Math.min(100, Math.max(0, totalScore / (items.length + 1) * 10));
};

// Detect wardrobe gaps
export interface WardrobeGap {
  category: string;
  reason: string;
  importance: number; // 1-10 scale
}

export const detectWardrobeGaps = (items: ClothingItem[]): WardrobeGap[] => {
  const gaps: WardrobeGap[] = [];
  
  // Count items by type
  const typeCounts: Record<string, number> = {};
  items.forEach(item => {
    typeCounts[item.type] = (typeCounts[item.type] || 0) + 1;
  });
  
  // Essential categories and minimum counts
  const essentials: Record<string, number> = {
    "shirt": 5,
    "tshirt": 5,
    "pants": 3,
    "jeans": 2,
    "shoes": 3,
    "jacket": 2,
    "sweater": 2,
    "dress": 2,
  };
  
  // Check for missing or underrepresented essentials
  for (const [type, minCount] of Object.entries(essentials)) {
    const actualCount = typeCounts[type] || 0;
    if (actualCount < minCount) {
      gaps.push({
        category: type,
        reason: `You only have ${actualCount} ${type}(s). A complete wardrobe should have at least ${minCount}.`,
        importance: Math.min(10, Math.max(1, 10 - actualCount * 2))
      });
    }
  }
  
  // Check color balance
  const colorCounts: Record<string, number> = {};
  items.forEach(item => {
    colorCounts[item.color] = (colorCounts[item.color] || 0) + 1;
  });
  
  const totalItems = items.length;
  for (const [color, count] of Object.entries(colorCounts)) {
    // If more than 40% of wardrobe is one color, suggest diversification
    if (count > totalItems * 0.4) {
      gaps.push({
        category: "color variety",
        reason: `${count} out of ${totalItems} items are ${color}. Consider adding more variety to your wardrobe.`,
        importance: 4
      });
    }
  }
  
  return gaps;
};

// Get suitable occasion for a specific clothing item
export const getItemOccasionSuitability = (item: ClothingItem): OccasionType[] => {
  const occasions: OccasionType[] = [];
  
  // Check type
  if (["suit", "blazer", "dress shoes", "formal", "tie"].some(t => 
      item.type.includes(t) || item.tags.includes(t))) {
    occasions.push("formal");
    occasions.push("business");
    
    if (item.color === "black" || item.color === "navy") {
      occasions.push("funeral");
    }
    
    if (item.color !== "black") {
      occasions.push("wedding");
    }
  }
  
  if (["tshirt", "jeans", "shorts", "sneakers", "casual"].some(t => 
      item.type.includes(t) || item.tags.includes(t))) {
    occasions.push("casual");
  }
  
  if (["shirt", "blouse", "pants", "skirt", "smart", "business"].some(t => 
      item.type.includes(t) || item.tags.includes(t))) {
    occasions.push("business");
  }
  
  if (["shorts", "swimsuit", "sandals", "light", "summer"].some(t => 
      item.type.includes(t) || item.tags.includes(t))) {
    occasions.push("beach");
  }
  
  if (["tshirt", "shorts", "leggings", "sport", "athletic"].some(t => 
      item.type.includes(t) || item.tags.includes(t))) {
    occasions.push("workout");
  }
  
  // If nothing matched, assume casual
  if (occasions.length === 0) {
    occasions.push("casual");
  }
  
  return occasions;
};

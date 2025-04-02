import React, { createContext, useContext, useEffect, useState } from "react";
import { OccasionType } from "@/utils/colorHarmony";
import { calculateOutfitScore } from "@/utils/outfitIntelligence";

type UserProfile = {
  selfieUrl: string | null;
  skinTone: string | null;
  hairColor: string | null;
  eyeColor: string | null;
  displayName?: string;
  region?: string;
  preferredStyle?: string;
};

export type ClothingStatus = "available" | "in-laundry" | "dirty" | "fresh";

export type ClothingItem = {
  id: string;
  imageUrl: string;
  type: string;
  tags: string[];
  color: string;
  dateAdded: string;
  wearCount?: number; // Track how often an item is worn
  lastWornDate?: string | null; // Last time this item was worn
  status?: ClothingStatus; // Track status of clothing item
  lastStatusChange?: string | null; // When the status was last changed
};

type Outfit = {
  id: string;
  items: ClothingItem[];
  date: string;
  worn: boolean;
  occasion?: OccasionType; // What occasion this outfit is for
  score?: number; // AI generated score for this outfit
  feedbackRating?: number; // User feedback rating (1-5)
  feedbackMood?: string; // How the user felt in this outfit
};

type ShoppingItem = {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  color: string;
  matchesDescription: string;
  url: string;
  fillsGap?: string; // Description of what wardrobe gap this fills
  matchesWithItems?: string[]; // IDs of wardrobe items this matches with
};

type UserPreferences = {
  favoriteColors: string[];
  favoriteStyles: string[];
  avoidedColors: string[];
  avoidedStyles: string[];
  occasionPreferences: Record<OccasionType, number>; // Scores for each occasion (0-100)
};

type WardrobeGap = {
  category: string;
  reason: string;
  importance: number; // 1-10 scale
};

type WardrobeContextType = {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  wardrobe: ClothingItem[];
  addClothingItem: (item: Omit<ClothingItem, "id" | "dateAdded">) => void;
  removeClothingItem: (id: string) => void;
  outfits: Outfit[];
  currentOutfit: Outfit | null;
  generateOutfit: (occasion?: OccasionType) => void;
  saveOutfitAsWorn: () => void;
  shoppingItems: ShoppingItem[];
  initialized: boolean;
  // New functionality
  currentOccasion: OccasionType;
  setCurrentOccasion: React.Dispatch<React.SetStateAction<OccasionType>>;
  wardrobeGaps: WardrobeGap[];
  userPreferences: UserPreferences;
  updateItemWearCount: (itemId: string) => void;
  provideFeedback: (outfitId: string, rating: number, mood: string) => void;
  getOutfitRecommendations: (count?: number) => Outfit[];
  // Laundry tracker functionality
  updateItemStatus: (itemId: string, status: ClothingStatus) => void;
  getLaundryItems: () => ClothingItem[];
  restoreItemFromLaundry: (itemId: string) => void;
  restoreAllLaundry: () => void;
};

const defaultUserProfile: UserProfile = {
  selfieUrl: null,
  skinTone: null,
  hairColor: null,
  eyeColor: null,
  displayName: "",
  region: "",
  preferredStyle: "",
};

// Default user preferences
const defaultUserPreferences: UserPreferences = {
  favoriteColors: [],
  favoriteStyles: [],
  avoidedColors: [],
  avoidedStyles: [],
  occasionPreferences: {
    casual: 70,
    formal: 50,
    business: 50,
    workout: 50,
    beach: 50,
    wedding: 50,
    funeral: 50
  }
};

// Mock data for shopping items
const mockShoppingItems: ShoppingItem[] = [
  {
    id: "s1",
    imageUrl: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=800&q=80",
    name: "Casual White Tee",
    price: 29.99,
    color: "White",
    matchesDescription: "Matches your blue jeans",
    url: "#",
  },
  {
    id: "s2",
    imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=800&q=80",
    name: "Denim Jacket",
    price: 89.99,
    color: "Blue",
    matchesDescription: "Complements your warm tone",
    url: "#",
  },
  {
    id: "s3",
    imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?auto=format&fit=crop&w=800&q=80",
    name: "Classic Chinos",
    price: 59.99,
    color: "Beige",
    matchesDescription: "Perfect for your business casual style",
    url: "#",
  },
  {
    id: "s4",
    imageUrl: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=800&q=80",
    name: "Minimalist Watch",
    price: 119.99,
    color: "Silver",
    matchesDescription: "Adds sophistication to any outfit",
    url: "#",
  },
];

const WardrobeContext = createContext<WardrobeContextType | undefined>(undefined);

export const WardrobeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialized, setInitialized] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>(defaultUserProfile);
  const [wardrobe, setWardrobe] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);
  const [shoppingItems] = useState<ShoppingItem[]>(mockShoppingItems);
  
  // New state variables
  const [currentOccasion, setCurrentOccasion] = useState<OccasionType>("casual");
  const [wardrobeGaps, setWardrobeGaps] = useState<WardrobeGap[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>(defaultUserPreferences);
  const [wearHistory, setWearHistory] = useState<Record<string, number>>({});

  // Initialize from localStorage
  useEffect(() => {
    const loadedUserProfile = localStorage.getItem("userProfile");
    const loadedWardrobe = localStorage.getItem("wardrobe");
    const loadedOutfits = localStorage.getItem("outfits");
    const loadedPreferences = localStorage.getItem("userPreferences");
    const loadedWearHistory = localStorage.getItem("wearHistory");

    if (loadedUserProfile) {
      setUserProfile(JSON.parse(loadedUserProfile));
    }
    
    if (loadedWardrobe) {
      setWardrobe(JSON.parse(loadedWardrobe));
    }

    if (loadedOutfits) {
      setOutfits(JSON.parse(loadedOutfits));
    }
    
    if (loadedPreferences) {
      setUserPreferences(JSON.parse(loadedPreferences));
    }
    
    if (loadedWearHistory) {
      setWearHistory(JSON.parse(loadedWearHistory));
    }

    setInitialized(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      localStorage.setItem("wardrobe", JSON.stringify(wardrobe));
      localStorage.setItem("outfits", JSON.stringify(outfits));
      localStorage.setItem("userPreferences", JSON.stringify(userPreferences));
      localStorage.setItem("wearHistory", JSON.stringify(wearHistory));
    }
  }, [userProfile, wardrobe, outfits, userPreferences, wearHistory, initialized]);
  
  // Automatically analyze wardrobe for gaps weekly
  useEffect(() => {
    if (wardrobe.length > 0) {
      // Detect gaps based on wardrobe items
      import("@/utils/outfitIntelligence").then(({ detectWardrobeGaps }) => {
        const gaps = detectWardrobeGaps(wardrobe);
        setWardrobeGaps(gaps);
      });
    }
  }, [wardrobe]);

  const addClothingItem = (item: Omit<ClothingItem, "id" | "dateAdded">) => {
    const newItem: ClothingItem = {
      ...item,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
      wearCount: 0,
      lastWornDate: null,
      status: "available", // Default status
      lastStatusChange: new Date().toISOString(),
    };
    setWardrobe((prev) => [...prev, newItem]);
  };

  const removeClothingItem = (id: string) => {
    setWardrobe((prev) => prev.filter((item) => item.id !== id));
  };
  
  const updateItemWearCount = (itemId: string) => {
    setWardrobe(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          wearCount: (item.wearCount || 0) + 1,
          lastWornDate: new Date().toISOString()
        };
      }
      return item;
    }));
    
    setWearHistory(prev => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1
    }));
  };
  
  // Add new functions for laundry tracking
  const updateItemStatus = (itemId: string, status: ClothingStatus) => {
    setWardrobe(prev => prev.map(item => {
      if (item.id === itemId) {
        return {
          ...item,
          status,
          lastStatusChange: new Date().toISOString()
        };
      }
      return item;
    }));
  };
  
  const getLaundryItems = () => {
    return wardrobe.filter(item => item.status === "in-laundry" || item.status === "dirty");
  };
  
  const restoreItemFromLaundry = (itemId: string) => {
    updateItemStatus(itemId, "available");
  };
  
  const restoreAllLaundry = () => {
    setWardrobe(prev => prev.map(item => {
      if (item.status === "in-laundry" || item.status === "dirty") {
        return {
          ...item,
          status: "available",
          lastStatusChange: new Date().toISOString()
        };
      }
      return item;
    }));
  };
  
  const provideFeedback = (outfitId: string, rating: number, mood: string) => {
    // Update the outfit with feedback
    setOutfits(prev => prev.map(outfit => {
      if (outfit.id === outfitId) {
        return {
          ...outfit,
          feedbackRating: rating,
          feedbackMood: mood
        };
      }
      return outfit;
    }));
    
    // Update user preferences based on feedback
    if (rating >= 4) {
      // User liked the outfit, so boost preference for these types/colors
      const outfit = outfits.find(o => o.id === outfitId);
      if (outfit) {
        const colors = outfit.items.map(item => item.color);
        const styles = outfit.items.flatMap(item => item.tags);
        
        setUserPreferences(prev => {
          // Add unique colors and styles to favorites
          const updatedFavoriteColors = Array.from(new Set([...prev.favoriteColors, ...colors]));
          const updatedFavoriteStyles = Array.from(new Set([...prev.favoriteStyles, ...styles]));
          
          return {
            ...prev,
            favoriteColors: updatedFavoriteColors,
            favoriteStyles: updatedFavoriteStyles,
            // Boost preference for this occasion
            occasionPreferences: {
              ...prev.occasionPreferences,
              [outfit.occasion || "casual"]: Math.min(100, (prev.occasionPreferences[outfit.occasion || "casual"] || 50) + 5)
            }
          };
        });
      }
    } else if (rating <= 2) {
      // User disliked the outfit
      const outfit = outfits.find(o => o.id === outfitId);
      if (outfit) {
        const colors = outfit.items.map(item => item.color);
        const styles = outfit.items.flatMap(item => item.tags);
        
        setUserPreferences(prev => {
          // Add unique colors and styles to avoided lists
          const updatedAvoidedColors = Array.from(new Set([...prev.avoidedColors, ...colors]));
          const updatedAvoidedStyles = Array.from(new Set([...prev.avoidedStyles, ...styles]));
          
          return {
            ...prev,
            avoidedColors: updatedAvoidedColors,
            avoidedStyles: updatedAvoidedStyles,
            // Reduce preference for this occasion
            occasionPreferences: {
              ...prev.occasionPreferences,
              [outfit.occasion || "casual"]: Math.max(0, (prev.occasionPreferences[outfit.occasion || "casual"] || 50) - 5)
            }
          };
        });
      }
    }
  };

  const generateOutfit = (occasion: OccasionType = currentOccasion) => {
    if (wardrobe.length === 0) return;

    // Enhanced outfit generation logic using color harmony and user preferences
    const tops = wardrobe.filter((item) => ["shirt", "tshirt", "blouse", "sweater"].includes(item.type.toLowerCase()));
    const bottoms = wardrobe.filter((item) => ["pants", "jeans", "skirt", "shorts"].includes(item.type.toLowerCase()));
    const shoes = wardrobe.filter((item) => ["shoes", "sneakers", "boots"].includes(item.type.toLowerCase()));
    const accessories = wardrobe.filter((item) => ["hat", "scarf", "jewelry", "watch"].includes(item.type.toLowerCase()));
    
    // Filter items appropriate for the occasion
    const filterByOccasion = (items: ClothingItem[]) => {
      return items.filter(item => {
        // More formal occasions need formal items
        if (occasion === "formal" || occasion === "wedding" || occasion === "funeral") {
          return !item.tags.includes("casual") && !item.tags.includes("sporty");
        }
        
        // Business needs business-appropriate items
        if (occasion === "business") {
          return !item.tags.includes("casual") && !item.tags.includes("sporty") && !item.tags.includes("beach");
        }
        
        // Workout needs athletic items
        if (occasion === "workout") {
          return item.tags.includes("sporty") || item.tags.includes("athletic") || item.tags.includes("casual");
        }
        
        // Beach needs light, casual items
        if (occasion === "beach") {
          return item.tags.includes("light") || item.tags.includes("casual") || item.tags.includes("summer");
        }
        
        // For casual, most items work
        return true;
      });
    };
    
    const occasionTops = filterByOccasion(tops);
    const occasionBottoms = filterByOccasion(bottoms);
    const occasionShoes = filterByOccasion(shoes);
    const occasionAccessories = filterByOccasion(accessories);
    
    // If we don't have items for this occasion, use all items
    const finalTops = occasionTops.length > 0 ? occasionTops : tops;
    const finalBottoms = occasionBottoms.length > 0 ? occasionBottoms : bottoms;
    const finalShoes = occasionShoes.length > 0 ? occasionShoes : shoes;
    const finalAccessories = occasionAccessories.length > 0 ? occasionAccessories : accessories;
    
    // Prefer less worn items (with some randomness)
    const sortByWearCount = (items: ClothingItem[]) => {
      return [...items].sort((a, b) => {
        const aCount = wearHistory[a.id] || 0;
        const bCount = wearHistory[b.id] || 0;
        // Add some randomness to avoid always picking the least worn
        return aCount - bCount + Math.random() * 2 - 1;
      });
    };
    
    const sortedTops = sortByWearCount(finalTops);
    const sortedBottoms = sortByWearCount(finalBottoms);
    const sortedShoes = sortByWearCount(finalShoes);
    const sortedAccessories = sortByWearCount(finalAccessories);
    
    // Create the outfit with selected items
    const outfit: Outfit = {
      id: Date.now().toString(),
      items: [],
      date: new Date().toISOString(),
      worn: false,
      occasion: occasion,
    };

    // Add a top (if available)
    if (sortedTops.length > 0) outfit.items.push(sortedTops[0]);
    
    // Add a bottom that coordinates with the top (if available)
    if (sortedBottoms.length > 0) {
      let bestBottom = sortedBottoms[0];
      let bestScore = 0;
      
      // If we have a top, find a coordinating bottom
      if (outfit.items.length > 0) {
        const top = outfit.items[0];
        for (const bottom of sortedBottoms.slice(0, Math.min(5, sortedBottoms.length))) {
          const score = calculateOutfitScore(
            [top, bottom], 
            userProfile.skinTone,
            occasion,
            wearHistory,
            // Convert preferences to a record of tag scores
            userPreferences.favoriteStyles.reduce((acc, style) => ({...acc, [style]: 10}), {})
          );
          
          if (score > bestScore) {
            bestScore = score;
            bestBottom = bottom;
          }
        }
      }
      
      outfit.items.push(bestBottom);
    }
    
    // Add shoes that coordinate with the outfit (if available)
    if (sortedShoes.length > 0) {
      let bestShoes = sortedShoes[0];
      let bestScore = 0;
      
      if (outfit.items.length > 0) {
        for (const shoes of sortedShoes.slice(0, Math.min(3, sortedShoes.length))) {
          const score = calculateOutfitScore(
            [...outfit.items, shoes], 
            userProfile.skinTone,
            occasion,
            wearHistory,
            userPreferences.favoriteStyles.reduce((acc, style) => ({...acc, [style]: 10}), {})
          );
          
          if (score > bestScore) {
            bestScore = score;
            bestShoes = shoes;
          }
        }
      }
      
      outfit.items.push(bestShoes);
    }
    
    // Add an accessory if appropriate for the occasion (formal, business, wedding)
    if (["formal", "business", "wedding"].includes(occasion) && sortedAccessories.length > 0) {
      outfit.items.push(sortedAccessories[0]);
    }
    
    // Calculate the final outfit score
    outfit.score = calculateOutfitScore(
      outfit.items, 
      userProfile.skinTone,
      occasion,
      wearHistory,
      userPreferences.favoriteStyles.reduce((acc, style) => ({...acc, [style]: 10}), {})
    );

    setCurrentOutfit(outfit);
  };
  
  const getOutfitRecommendations = (count: number = 3): Outfit[] => {
    if (wardrobe.length === 0) return [];
    
    const recommendations: Outfit[] = [];
    
    // Generate multiple outfit options and score them
    for (let i = 0; i < Math.max(3, count * 2); i++) {
      generateOutfit(currentOccasion);
      if (currentOutfit) {
        recommendations.push(currentOutfit);
      }
    }
    
    // Sort by score and return the top 'count' outfits
    return recommendations
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, count);
  };

  const saveOutfitAsWorn = () => {
    if (!currentOutfit) return;
    
    const wornOutfit = { ...currentOutfit, worn: true };
    setOutfits((prev) => [...prev, wornOutfit]);
    
    // Update wear counts for all items in the outfit
    currentOutfit.items.forEach(item => {
      updateItemWearCount(item.id);
      // Mark item as dirty after wearing
      updateItemStatus(item.id, "dirty");
    });
    
    setCurrentOutfit(null);
  };

  return (
    <WardrobeContext.Provider
      value={{
        userProfile,
        setUserProfile,
        wardrobe,
        addClothingItem,
        removeClothingItem,
        outfits,
        currentOutfit,
        generateOutfit,
        saveOutfitAsWorn,
        shoppingItems,
        initialized,
        // New functionality
        currentOccasion,
        setCurrentOccasion,
        wardrobeGaps,
        userPreferences,
        updateItemWearCount,
        provideFeedback,
        getOutfitRecommendations,
        // Laundry tracking functionality
        updateItemStatus,
        getLaundryItems,
        restoreItemFromLaundry,
        restoreAllLaundry
      }}
    >
      {children}
    </WardrobeContext.Provider>
  );
};

export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (context === undefined) {
    throw new Error("useWardrobe must be used within a WardrobeProvider");
  }
  return context;
};

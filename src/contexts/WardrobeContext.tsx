
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";
import { OccasionType } from "@/utils/colorHarmony";

// Define the types
export interface ClothingItem {
  id: string;
  imageUrl: string;
  type: string;
  tags: string[];
  color: string;
  lastWorn?: number;
  washCount?: number;
  status?: ClothingStatus;
  lastStatusChange?: string | null;
  dateAdded: number; // timestamp when item was added
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  occasion?: string;
  season?: string;
  createdAt: number;
  date: number; // timestamp when outfit was worn/created
  score?: number;
}

export type ClothingStatus = "available" | "dirty" | "in-laundry" | "fresh";

export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  color: string;
  matchesWithItems?: string[];
  matchesDescription: string;
  fillsGap?: string;
}

export interface UserProfile {
  selfieUrl: string | null;
  skinTone: string | null;
  hairColor: string | null;
  eyeColor: string | null;
  displayName?: string;
  region?: string;
  preferredStyle?: string;
}

interface WardrobeContextProps {
  clothingItems: ClothingItem[];
  addClothingItem: (item: Omit<ClothingItem, "id">) => void;
  removeClothingItem: (id: string) => void;
  updateClothingItem: (id: string, updates: Partial<ClothingItem>) => void;
  markAsWorn: (id: string) => void;
  increaseWashCount: (id: string) => void;
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  outfits: Outfit[];
  addOutfit: (outfit: Omit<Outfit, "id" | "createdAt">) => void;
  removeOutfit: (id: string) => void;
  updateOutfit: (id: string, updates: Partial<Outfit>) => void;
  // Additional properties needed by other components
  wardrobe: ClothingItem[];
  shoppingItems: ShoppingItem[];
  updateItemStatus: (itemId: string, status: ClothingStatus) => void;
  restoreItemFromLaundry: (itemId: string) => void;
  restoreAllLaundry: () => void;
  currentOutfit: Outfit | null;
  generateOutfit: (occasion: OccasionType) => void;
  saveOutfitAsWorn: () => void;
  currentOccasion: OccasionType;
  setCurrentOccasion: React.Dispatch<React.SetStateAction<OccasionType>>;
  provideFeedback: (outfitId: string, rating: number, mood: string) => void;
}

interface WardrobeProviderProps {
  children: ReactNode;
}

// Create the context
const WardrobeContext = createContext<WardrobeContextProps | undefined>(
  undefined
);

// Provider component
export const WardrobeProvider: React.FC<WardrobeProviderProps> = ({
  children,
}) => {
  const [clothingItems, setClothingItems] = useState<ClothingItem[]>(() => {
    try {
      const storedItems = localStorage.getItem("clothingItems");
      return storedItems ? JSON.parse(storedItems) : [];
    } catch (error) {
      console.error("Error parsing clothingItems from localStorage:", error);
      return [];
    }
  });
  
  const [userProfile, setUserProfile] = useState<UserProfile>({
    selfieUrl: null,
    skinTone: null,
    hairColor: null,
    eyeColor: null,
  });
  
  const [outfits, setOutfits] = useState<Outfit[]>(() => {
    try {
      const storedOutfits = localStorage.getItem("outfits");
      return storedOutfits ? JSON.parse(storedOutfits) : [];
    } catch (error) {
      console.error("Error parsing outfits from localStorage:", error);
      return [];
    }
  });

  const [currentOutfit, setCurrentOutfit] = useState<Outfit | null>(null);
  const [currentOccasion, setCurrentOccasion] = useState<OccasionType>("casual");
  
  // Mock shopping items data
  const [shoppingItems] = useState<ShoppingItem[]>([
    {
      id: "s1",
      name: "Blue Cotton T-Shirt",
      price: 25.99,
      imageUrl: "https://picsum.photos/id/237/200/300",
      color: "Blue",
      matchesWithItems: ["p1", "a2"],
      matchesDescription: "Pairs well with jeans and casual accessories"
    },
    {
      id: "s2",
      name: "Black Designer Jeans",
      price: 59.99,
      imageUrl: "https://picsum.photos/id/239/200/300",
      color: "Black",
      matchesDescription: "Versatile for both casual and semi-formal outfits",
      fillsGap: "Formal bottoms"
    }
  ]);

  useEffect(() => {
    localStorage.setItem("clothingItems", JSON.stringify(clothingItems));
  }, [clothingItems]);

  useEffect(() => {
    localStorage.setItem("outfits", JSON.stringify(outfits));
  }, [outfits]);

  const addClothingItem = (item: Omit<ClothingItem, "id">) => {
    const now = Date.now();
    const newItem: ClothingItem = { 
      ...item, 
      id: uuidv4(),
      dateAdded: now,
      status: "available",
      lastStatusChange: new Date().toISOString()
    };
    setClothingItems([...clothingItems, newItem]);
  };

  const removeClothingItem = (id: string) => {
    setClothingItems(clothingItems.filter((item) => item.id !== id));
  };

  const updateClothingItem = (
    id: string,
    updates: Partial<ClothingItem>
  ) => {
    setClothingItems(
      clothingItems.map((item) => (item.id === id ? { ...item, ...updates } : item))
    );
  };

  const markAsWorn = (id: string) => {
    const now = Date.now();
    setClothingItems(
      clothingItems.map((item) =>
        item.id === id ? { ...item, lastWorn: now } : item
      )
    );
  };

  const increaseWashCount = (id: string) => {
    setClothingItems(
      clothingItems.map((item) =>
        item.id === id
          ? { ...item, washCount: (item.washCount || 0) + 1 }
          : item
      )
    );
  };

  const addOutfit = (outfit: Omit<Outfit, "id" | "createdAt">) => {
    const now = Date.now();
    const newOutfit: Outfit = { 
      ...outfit, 
      id: uuidv4(), 
      createdAt: now,
      date: now // Add date for LaundryTracker compatibility
    };
    setOutfits([...outfits, newOutfit]);
  };

  const removeOutfit = (id: string) => {
    setOutfits(outfits.filter((outfit) => outfit.id !== id));
  };

  const updateOutfit = (id: string, updates: Partial<Outfit>) => {
    setOutfits(
      outfits.map((outfit) => (outfit.id === id ? { ...outfit, ...updates } : outfit))
    );
  };
  
  const updateItemStatus = (itemId: string, status: ClothingStatus) => {
    setClothingItems(
      clothingItems.map((item) =>
        item.id === itemId
          ? { 
              ...item, 
              status: status,
              lastStatusChange: new Date().toISOString()
            }
          : item
      )
    );
  };
  
  const restoreItemFromLaundry = (itemId: string) => {
    setClothingItems(
      clothingItems.map((item) =>
        item.id === itemId
          ? { 
              ...item, 
              status: "available",
              lastStatusChange: new Date().toISOString() 
            }
          : item
      )
    );
  };
  
  const restoreAllLaundry = () => {
    setClothingItems(
      clothingItems.map((item) =>
        item.status === "in-laundry" || item.status === "dirty"
          ? { 
              ...item, 
              status: "available",
              lastStatusChange: new Date().toISOString() 
            }
          : item
      )
    );
  };
  
  const generateOutfit = (occasion: OccasionType) => {
    // In a real app, this would use a sophisticated algorithm
    // For now, we'll just select random items
    const topItems = clothingItems.filter(item => 
      ["shirt", "tshirt", "blouse", "sweater"].includes(item.type.toLowerCase())
    );
    
    const bottomItems = clothingItems.filter(item => 
      ["pants", "jeans", "skirt", "shorts"].includes(item.type.toLowerCase())
    );
    
    if (topItems.length === 0 || bottomItems.length === 0) {
      setCurrentOutfit(null);
      return;
    }
    
    const randomTop = topItems[Math.floor(Math.random() * topItems.length)];
    const randomBottom = bottomItems[Math.floor(Math.random() * bottomItems.length)];
    
    const newOutfit: Outfit = {
      id: uuidv4(),
      name: `${occasion} outfit`,
      items: [randomTop, randomBottom],
      occasion,
      season: "all",
      createdAt: Date.now(),
      date: Date.now(),
      score: Math.floor(Math.random() * 30) + 70 // Random score between 70-100
    };
    
    setCurrentOutfit(newOutfit);
  };
  
  const saveOutfitAsWorn = () => {
    if (!currentOutfit) return;
    
    // Add the outfit to history
    setOutfits([...outfits, currentOutfit]);
    
    // Mark all items as worn
    currentOutfit.items.forEach(item => {
      markAsWorn(item.id);
    });
  };
  
  const provideFeedback = (outfitId: string, rating: number, mood: string) => {
    // In a real app, this would update a feedback database and ML model
    console.log(`Feedback for outfit ${outfitId}: ${rating}/5, mood: ${mood}`);
  };

  const value: WardrobeContextProps = {
    clothingItems,
    addClothingItem,
    removeClothingItem,
    updateClothingItem,
    markAsWorn,
    increaseWashCount,
    userProfile,
    setUserProfile,
    outfits,
    addOutfit,
    removeOutfit,
    updateOutfit,
    // Add the missing properties
    wardrobe: clothingItems, // Alias for clothingItems
    shoppingItems,
    updateItemStatus,
    restoreItemFromLaundry,
    restoreAllLaundry,
    currentOutfit,
    generateOutfit,
    saveOutfitAsWorn,
    currentOccasion,
    setCurrentOccasion,
    provideFeedback
  };

  return (
    <WardrobeContext.Provider value={value}>{children}</WardrobeContext.Provider>
  );
};

// Hook for using the context
export const useWardrobe = () => {
  const context = useContext(WardrobeContext);
  if (!context) {
    throw new Error("useWardrobe must be used within a WardrobeProvider");
  }
  return context;
};

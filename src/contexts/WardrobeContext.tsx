import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  ReactNode,
} from "react";
import { v4 as uuidv4 } from "uuid";

// Define the types
export interface ClothingItem {
  id: string;
  imageUrl: string;
  type: string;
  tags: string[];
  color: string;
  lastWorn?: number;
  washCount?: number;
}

export interface Outfit {
  id: string;
  name: string;
  items: ClothingItem[];
  occasion?: string;
  season?: string;
  createdAt: number;
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
  addOutfit: (outfit: Omit<Outfit, "id">) => void;
  removeOutfit: (id: string) => void;
  updateOutfit: (id: string, updates: Partial<Outfit>) => void;
}

interface WardrobeProviderProps {
  children: ReactNode;
}

interface UserProfile {
  selfieUrl: string | null;
  skinTone: string | null;
  hairColor: string | null;
  eyeColor: string | null;
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

  useEffect(() => {
    localStorage.setItem("clothingItems", JSON.stringify(clothingItems));
  }, [clothingItems]);

  useEffect(() => {
    localStorage.setItem("outfits", JSON.stringify(outfits));
  }, [outfits]);

  const addClothingItem = (item: Omit<ClothingItem, "id">) => {
    const newItem: ClothingItem = { ...item, id: uuidv4() };
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

  const addOutfit = (outfit: Omit<Outfit, "id">) => {
    const newOutfit: Outfit = { ...outfit, id: uuidv4(), createdAt: Date.now() };
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


import React, { createContext, useContext, useEffect, useState } from "react";

type UserProfile = {
  selfieUrl: string | null;
  skinTone: string | null;
  hairColor: string | null;
  eyeColor: string | null;
};

export type ClothingItem = {
  id: string;
  imageUrl: string;
  type: string;
  tags: string[];
  color: string;
  dateAdded: string;
};

type Outfit = {
  id: string;
  items: ClothingItem[];
  date: string;
  worn: boolean;
};

type ShoppingItem = {
  id: string;
  imageUrl: string;
  name: string;
  price: number;
  color: string;
  matchesDescription: string;
  url: string;
};

type WardrobeContextType = {
  userProfile: UserProfile;
  setUserProfile: React.Dispatch<React.SetStateAction<UserProfile>>;
  wardrobe: ClothingItem[];
  addClothingItem: (item: Omit<ClothingItem, "id" | "dateAdded">) => void;
  removeClothingItem: (id: string) => void;
  outfits: Outfit[];
  currentOutfit: Outfit | null;
  generateOutfit: () => void;
  saveOutfitAsWorn: () => void;
  shoppingItems: ShoppingItem[];
  initialized: boolean;
};

const defaultUserProfile: UserProfile = {
  selfieUrl: null,
  skinTone: null,
  hairColor: null,
  eyeColor: null,
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

  // Initialize from localStorage
  useEffect(() => {
    const loadedUserProfile = localStorage.getItem("userProfile");
    const loadedWardrobe = localStorage.getItem("wardrobe");
    const loadedOutfits = localStorage.getItem("outfits");

    if (loadedUserProfile) {
      setUserProfile(JSON.parse(loadedUserProfile));
    }
    
    if (loadedWardrobe) {
      setWardrobe(JSON.parse(loadedWardrobe));
    }

    if (loadedOutfits) {
      setOutfits(JSON.parse(loadedOutfits));
    }

    setInitialized(true);
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (initialized) {
      localStorage.setItem("userProfile", JSON.stringify(userProfile));
      localStorage.setItem("wardrobe", JSON.stringify(wardrobe));
      localStorage.setItem("outfits", JSON.stringify(outfits));
    }
  }, [userProfile, wardrobe, outfits, initialized]);

  const addClothingItem = (item: Omit<ClothingItem, "id" | "dateAdded">) => {
    const newItem: ClothingItem = {
      ...item,
      id: Date.now().toString(),
      dateAdded: new Date().toISOString(),
    };
    setWardrobe((prev) => [...prev, newItem]);
  };

  const removeClothingItem = (id: string) => {
    setWardrobe((prev) => prev.filter((item) => item.id !== id));
  };

  const generateOutfit = () => {
    if (wardrobe.length === 0) return;

    // Simplified outfit generation logic - in a real app this would be more sophisticated
    const tops = wardrobe.filter((item) => ["shirt", "tshirt", "blouse", "sweater"].includes(item.type.toLowerCase()));
    const bottoms = wardrobe.filter((item) => ["pants", "jeans", "skirt", "shorts"].includes(item.type.toLowerCase()));
    const shoes = wardrobe.filter((item) => ["shoes", "sneakers", "boots"].includes(item.type.toLowerCase()));
    
    const outfit: Outfit = {
      id: Date.now().toString(),
      items: [],
      date: new Date().toISOString(),
      worn: false,
    };

    if (tops.length > 0) outfit.items.push(tops[Math.floor(Math.random() * tops.length)]);
    if (bottoms.length > 0) outfit.items.push(bottoms[Math.floor(Math.random() * bottoms.length)]);
    if (shoes.length > 0) outfit.items.push(shoes[Math.floor(Math.random() * shoes.length)]);

    setCurrentOutfit(outfit);
  };

  const saveOutfitAsWorn = () => {
    if (!currentOutfit) return;
    
    const wornOutfit = { ...currentOutfit, worn: true };
    setOutfits((prev) => [...prev, wornOutfit]);
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

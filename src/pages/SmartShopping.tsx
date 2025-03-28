
import { useState } from "react";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { Search, Heart, ShoppingBag, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { toast } from "sonner";

const categories = ["All", "Tops", "Bottoms", "Shoes", "Accessories"];

const SmartShopping = () => {
  const { shoppingItems } = useWardrobe();
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [wishlist, setWishlist] = useState<string[]>([]);

  const filteredItems = shoppingItems.filter(item => {
    if (activeCategory !== "All") {
      const categoryMap: Record<string, string[]> = {
        "Tops": ["tshirt", "shirt", "blouse", "sweater"],
        "Bottoms": ["pants", "jeans", "shorts", "skirt"],
        "Shoes": ["shoes", "sneakers", "boots"],
        "Accessories": ["hat", "watch", "necklace", "earrings"]
      };
      
      const lowercaseName = item.name.toLowerCase();
      const matchesCategory = categoryMap[activeCategory]?.some(cat => 
        lowercaseName.includes(cat)
      );
      
      if (!matchesCategory) return false;
    }
    
    if (searchQuery) {
      const lowercaseQuery = searchQuery.toLowerCase();
      const matchesQuery = 
        item.name.toLowerCase().includes(lowercaseQuery) || 
        item.color.toLowerCase().includes(lowercaseQuery) ||
        item.matchesDescription.toLowerCase().includes(lowercaseQuery);
        
      if (!matchesQuery) return false;
    }
    
    return true;
  });

  const toggleWishlist = (id: string) => {
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter(itemId => itemId !== id));
      toast.info("Removed from wishlist");
    } else {
      setWishlist([...wishlist, id]);
      toast("Added to wishlist", {
        icon: <Heart size={18} className="text-red-500" />,
      });
    }
  };

  const handleBuy = (item: typeof shoppingItems[0]) => {
    toast.success(`Opening store for ${item.name}`);
  };

  return (
    <div className="pb-20 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-fashion-dark">Shop Matching Styles</h1>
      <p className="text-gray-600 mb-6">
        AI-recommended products based on your style
      </p>
      
      <div className="mb-6">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3 top-3 text-gray-400" />
          <Input
            placeholder="Search products..."
            className="pl-10 fashion-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
          {categories.map(category => (
            <Toggle
              key={category}
              pressed={activeCategory === category}
              onPressedChange={() => setActiveCategory(category)}
              className="rounded-full px-4 py-1 text-sm border border-gray-200 data-[state=on]:bg-fashion-primary data-[state=on]:text-white"
            >
              {category}
            </Toggle>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {filteredItems.map(item => (
          <div key={item.id} className="fashion-card">
            <div className="mb-3 relative">
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-40 object-cover rounded-lg"
              />
              <button 
                onClick={() => toggleWishlist(item.id)}
                className="absolute top-2 right-2 p-1.5 bg-white rounded-full shadow-md"
              >
                <Heart 
                  size={18} 
                  className={wishlist.includes(item.id) ? "text-red-500 fill-red-500" : "text-gray-500"} 
                />
              </button>
            </div>
            
            <h3 className="font-medium mb-1 leading-tight">{item.name}</h3>
            <p className="text-fashion-primary font-bold mb-1">${item.price.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mb-3">Color: {item.color}</p>
            
            <div className="bg-gray-50 px-2 py-1 rounded-md mb-3">
              <p className="text-xs">{item.matchesDescription}</p>
            </div>
            
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="flex-1 text-xs border-gray-300"
                onClick={() => toggleWishlist(item.id)}
              >
                <Heart size={14} className="mr-1" />
                Save
              </Button>
              
              <Button 
                size="sm" 
                className="flex-1 bg-fashion-primary text-white hover:bg-opacity-90 text-xs"
                onClick={() => handleBuy(item)}
              >
                <ExternalLink size={14} className="mr-1" />
                Buy Now
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartShopping;

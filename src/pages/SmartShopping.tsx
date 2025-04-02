
import { useState } from "react";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { Search, Heart, ShoppingBag, ExternalLink, Sparkles, Zap, Link2, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import WardrobeGapAnalysis from "@/components/WardrobeGapAnalysis";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const categories = ["All", "Tops", "Bottoms", "Shoes", "Accessories"];
const smartFilters = ["Smart Matches", "Closet Complete", "Upgrade Suggestions", "Gap Fillers"];
const colorOptions = [
  "All", "Black", "White", "Red", "Blue", "Green", "Yellow", 
  "Purple", "Pink", "Orange", "Brown", "Gray", "Navy", "Beige"
];

const SmartShopping = () => {
  const { shoppingItems, wardrobe } = useWardrobe();
  const [activeCategory, setActiveCategory] = useState("All");
  const [activeSmartFilter, setActiveSmartFilter] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedColor, setSelectedColor] = useState("All");
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("discover");

  const filteredItems = shoppingItems.filter(item => {
    // Apply category filter
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
    
    // Apply color filter
    if (selectedColor !== "All") {
      const itemColor = item.color.toLowerCase();
      if (!itemColor.includes(selectedColor.toLowerCase())) {
        return false;
      }
    }
    
    // Apply smart filter
    if (activeSmartFilter) {
      if (activeSmartFilter === "Smart Matches" && (!item.matchesWithItems || item.matchesWithItems.length === 0)) {
        return false;
      }
      
      if (activeSmartFilter === "Gap Fillers" && !item.fillsGap) {
        return false;
      }
      
      // For demo purposes, we'll just show all items for other smart filters
    }
    
    // Apply search query
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

  // Simulate finding matching items from the wardrobe
  const getMatchingWardrobeItems = (item: typeof shoppingItems[0]) => {
    // In a real app, this would use the color harmony and outfit intelligence algorithms
    if (!item.matchesWithItems || wardrobe.length === 0) return [];
    
    // For demo, return 1-2 random wardrobe items
    const count = Math.floor(Math.random() * 2) + 1;
    return wardrobe
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.min(count, wardrobe.length));
  };

  return (
    <div className="pb-20 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-fashion-dark">Shop Matching Styles</h1>
      <p className="text-gray-600 mb-6">
        AI-recommended products based on your style
      </p>
      
      <Tabs defaultValue="discover" className="mb-6" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="discover">Discover</TabsTrigger>
          <TabsTrigger value="smart">Smart Shopping</TabsTrigger>
        </TabsList>
        
        <TabsContent value="discover">
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
            
            {/* Add Color Filter Dropdown */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette size={16} className="text-gray-500" />
                <span className="text-sm font-medium">Color Filter</span>
              </div>
              <Select
                value={selectedColor}
                onValueChange={setSelectedColor}
              >
                <SelectTrigger className="w-full fashion-input h-9">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(color => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        {color !== "All" && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                        )}
                        {color}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="smart">
          <WardrobeGapAnalysis />
          
          <div className="mb-6">
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1.5">
              <Sparkles size={14} />
              Smart Filters
            </h3>
            <div className="flex gap-2 overflow-x-auto py-2 no-scrollbar">
              {smartFilters.map(filter => (
                <Toggle
                  key={filter}
                  pressed={activeSmartFilter === filter}
                  onPressedChange={() => setActiveSmartFilter(filter === activeSmartFilter ? "" : filter)}
                  className="rounded-full px-4 py-1 text-sm border border-gray-200 data-[state=on]:bg-fashion-primary data-[state=on]:text-white"
                >
                  {filter}
                </Toggle>
              ))}
            </div>
            
            {/* Add Color Filter for Smart Tab too */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2">
                <Palette size={16} className="text-gray-500" />
                <span className="text-sm font-medium">Color Filter</span>
              </div>
              <Select
                value={selectedColor}
                onValueChange={setSelectedColor}
              >
                <SelectTrigger className="w-full fashion-input h-9">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  {colorOptions.map(color => (
                    <SelectItem key={color} value={color}>
                      <div className="flex items-center gap-2">
                        {color !== "All" && (
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: color.toLowerCase() }}
                          />
                        )}
                        {color}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
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
              
              {activeTab === "smart" && (
                <div className="absolute top-2 left-2">
                  <Badge variant="secondary" className="flex items-center gap-1 bg-white/90 text-fashion-primary text-xs">
                    <Zap size={10} className="text-yellow-500" />
                    Smart Match
                  </Badge>
                </div>
              )}
              
              {/* Add color badge */}
              <div className="absolute bottom-2 left-2">
                <Badge variant="outline" className="bg-white/90 text-xs">
                  {item.color}
                </Badge>
              </div>
            </div>
            
            <h3 className="font-medium mb-1 leading-tight">{item.name}</h3>
            <p className="text-fashion-primary font-bold mb-1">${item.price.toFixed(2)}</p>
            <p className="text-xs text-gray-500 mb-2">Color: {item.color}</p>
            
            {/* Show matching items if in Smart tab */}
            {activeTab === "smart" && (
              <div className="bg-gray-50 px-3 py-2 rounded-md mb-3">
                <p className="text-xs font-medium mb-1.5 flex items-center gap-1">
                  <Link2 size={10} />
                  Matches with your:
                </p>
                <div className="flex gap-1 overflow-x-auto no-scrollbar">
                  {getMatchingWardrobeItems(item).map(wardrobeItem => (
                    <div key={wardrobeItem.id} className="relative min-w-9 w-9 h-9 rounded-full border">
                      <img 
                        src={wardrobeItem.imageUrl} 
                        alt={wardrobeItem.type} 
                        className="w-full h-full object-cover rounded-full" 
                      />
                      <span className="absolute -bottom-1 -right-1 bg-white text-[8px] px-1 rounded-full border border-gray-200 capitalize">
                        {wardrobeItem.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Regular match description */}
            {activeTab === "discover" && (
              <div className="bg-gray-50 px-2 py-1 rounded-md mb-3">
                <p className="text-xs">{item.matchesDescription}</p>
              </div>
            )}
            
            {/* For Gap Fillers, show what gap it fills */}
            {activeSmartFilter === "Gap Fillers" && item.fillsGap && (
              <div className="bg-fashion-secondary/20 px-2 py-1 rounded-md mb-3">
                <p className="text-xs font-medium">Fills gap: {item.fillsGap}</p>
              </div>
            )}
            
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


import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { RefreshCw, Check, Info, Cloud, Sun } from "lucide-react";
import { toast } from "sonner";

const OutfitSuggestion = () => {
  const { wardrobe, currentOutfit, generateOutfit, saveOutfitAsWorn } = useWardrobe();

  useEffect(() => {
    if (wardrobe.length > 0 && !currentOutfit) {
      generateOutfit();
    }
  }, [wardrobe, currentOutfit, generateOutfit]);

  const handleRefresh = () => {
    generateOutfit();
    toast.success("Generated a new outfit for you");
  };

  const handleWear = () => {
    saveOutfitAsWorn();
    toast.success("Outfit saved to your history");
  };

  if (wardrobe.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] animate-fade-in">
        <h1 className="text-3xl font-bold mb-4 text-fashion-dark">Today's Outfit</h1>
        <div className="fashion-card p-8 text-center">
          <Info size={48} className="mx-auto mb-4 text-fashion-primary" />
          <h2 className="text-xl font-semibold mb-2">Your wardrobe is empty</h2>
          <p className="text-gray-600 mb-4">
            Add some clothing items to get personalized outfit suggestions.
          </p>
          <Button 
            onClick={() => window.location.href = "/wardrobe/add"}
            className="fashion-btn-primary"
          >
            Add Items
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-20 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-fashion-dark">Today's Outfit</h1>
      
      <div className="flex items-center gap-2 mb-6 text-gray-600">
        <div className="bg-blue-100 text-blue-600 rounded-full p-1.5">
          <Sun size={16} />
        </div>
        <span className="text-sm">72°F - Sunny - Perfect for this look</span>
      </div>
      
      {currentOutfit && (
        <div className="fashion-card mb-6 animate-slide-up">
          <h2 className="text-xl font-semibold mb-4 text-center">
            AI Recommended Outfit
          </h2>
          
          <div className="grid grid-cols-2 gap-4 mb-6">
            {currentOutfit.items.map((item) => (
              <div key={item.id} className="border border-gray-100 rounded-lg overflow-hidden shadow-sm">
                <div className="h-40 overflow-hidden">
                  <img 
                    src={item.imageUrl} 
                    alt={item.type} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-2 bg-gray-50">
                  <p className="font-medium capitalize">{item.type}</p>
                  {item.tags.length > 0 && (
                    <p className="text-xs text-gray-500 truncate">
                      {item.tags.join(", ")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <div className="flex items-start gap-2">
              <Info size={20} className="text-fashion-primary flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-medium mb-1">Why This Outfit</h3>
                <p className="text-sm text-gray-600">
                  This combination matches your {wardrobe[0]?.color} tones and creates a balanced silhouette. 
                  The colors complement your skin tone, and the style aligns with today's weather.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="flex-1 gap-2 border-gray-300"
              onClick={handleRefresh}
            >
              <RefreshCw size={18} />
              Try Something Else
            </Button>
            
            <Button 
              className="flex-1 fashion-btn-primary gap-2"
              onClick={handleWear}
            >
              <Check size={18} />
              Wear This Today
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OutfitSuggestion;

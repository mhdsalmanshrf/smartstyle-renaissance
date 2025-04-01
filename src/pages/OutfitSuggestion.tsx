
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { RefreshCw, Check, Info, Cloud, Sun, User } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const OutfitSuggestion = () => {
  const { wardrobe, currentOutfit, generateOutfit, saveOutfitAsWorn, userProfile } = useWardrobe();
  const [outfitReason, setOutfitReason] = useState<string>("");

  useEffect(() => {
    if (wardrobe.length > 0 && !currentOutfit) {
      generateOutfit();
    }
  }, [wardrobe, currentOutfit, generateOutfit]);

  useEffect(() => {
    if (currentOutfit && userProfile) {
      // Generate personalized reason based on user features
      generateOutfitReason();
    }
  }, [currentOutfit, userProfile]);

  const generateOutfitReason = () => {
    if (!currentOutfit || !userProfile.skinTone) return;

    // Create personalized explanation based on user features
    const reasons = [
      `This outfit complements your ${userProfile.skinTone} skin tone`,
      `The colors work well with your ${userProfile.hairColor} hair`,
      `The color palette enhances your ${userProfile.eyeColor} eyes`
    ];

    // Add weather-appropriate reason
    reasons.push("The style is perfect for today's weather");

    // Join reasons with commas and "and" for the last one
    const reasonsText = reasons.length > 1 
      ? `${reasons.slice(0, -1).join(", ")} and ${reasons[reasons.length - 1]}`
      : reasons[0];

    setOutfitReason(reasonsText + ".");
  };

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
      
      <div className="flex items-center gap-2 mb-4 text-gray-600">
        <div className="bg-blue-100 text-blue-600 rounded-full p-1.5">
          <Sun size={16} />
        </div>
        <span className="text-sm">72°F - Sunny - Perfect for this look</span>
      </div>
      
      {userProfile.selfieUrl && (
        <div className="flex items-center gap-3 mb-6 p-3 bg-background/50 rounded-lg border">
          <div className="w-10 h-10 rounded-full overflow-hidden">
            <img 
              src={userProfile.selfieUrl} 
              alt="Your profile" 
              className="w-full h-full object-cover" 
            />
          </div>
          <div className="flex-1">
            <div className="text-sm font-medium">Your features</div>
            <div className="flex flex-wrap gap-1 mt-1">
              {userProfile.skinTone && (
                <Badge variant="outline" className="text-xs">
                  {userProfile.skinTone} skin
                </Badge>
              )}
              {userProfile.hairColor && (
                <Badge variant="outline" className="text-xs">
                  {userProfile.hairColor} hair
                </Badge>
              )}
              {userProfile.eyeColor && (
                <Badge variant="outline" className="text-xs">
                  {userProfile.eyeColor} eyes
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}
      
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
                  {outfitReason || "This outfit has been selected based on your personal style and today's weather."}
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

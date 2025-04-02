
import { RefreshCw, Check, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ClothingItem } from "@/contexts/WardrobeContext";

interface OutfitDisplayProps {
  outfit: {
    id: string;
    items: ClothingItem[];
    date: string;
    worn: boolean;
    occasion?: string;
    score?: number;
  } | null;
  outfitReason: string;
  onRefresh: () => void;
  onWear: () => void;
}

const OutfitDisplay = ({ outfit, outfitReason, onRefresh, onWear }: OutfitDisplayProps) => {
  if (!outfit) return null;

  return (
    <div className="fashion-card mb-6 animate-slide-up">
      <h2 className="text-xl font-semibold mb-1 text-center">
        AI Recommended Outfit
      </h2>
      
      {outfit.score && (
        <div className="text-center mb-4">
          <span className="inline-flex items-center gap-1 text-sm bg-fashion-secondary/30 px-2 py-0.5 rounded-full">
            <span className="font-semibold">{Math.round(outfit.score)}/100</span> 
            <span className="text-xs opacity-70">Match Score</span>
          </span>
        </div>
      )}
      
      <div className="grid grid-cols-2 gap-4 mb-6">
        {outfit.items.map((item) => (
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
              {item.wearCount !== undefined && (
                <p className="text-xs text-gray-500">
                  Worn {item.wearCount} {item.wearCount === 1 ? 'time' : 'times'}
                </p>
              )}
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
              {outfitReason || `This outfit has been selected based on your personal style and today's weather.`}
            </p>
          </div>
        </div>
      </div>
      
      <div className="flex gap-4">
        <Button 
          variant="outline" 
          className="flex-1 gap-2 border-gray-300"
          onClick={onRefresh}
        >
          <RefreshCw size={18} />
          Try Something Else
        </Button>
        
        <Button 
          className="flex-1 fashion-btn-primary gap-2"
          onClick={onWear}
        >
          <Check size={18} />
          Wear This Today
        </Button>
      </div>
    </div>
  );
};

export default OutfitDisplay;

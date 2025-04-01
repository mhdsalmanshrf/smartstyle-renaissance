
import React from "react";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Sparkles, TrendingUp, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { detectWardrobeGaps } from "@/utils/outfitIntelligence";
import { useState, useEffect } from "react";

type WardrobeGap = {
  category: string;
  reason: string;
  importance: number;
};

const WardrobeGapAnalysis = () => {
  const { wardrobe, shoppingItems } = useWardrobe();
  const [gaps, setGaps] = useState<WardrobeGap[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Analyze the wardrobe when component mounts
    analyzeWardrobe();
  }, [wardrobe]);

  const analyzeWardrobe = async () => {
    setIsAnalyzing(true);
    try {
      // Get gap analysis
      const wardrobeGaps = await detectWardrobeGaps(wardrobe);
      
      // Sort by importance
      const sortedGaps = wardrobeGaps.sort((a, b) => b.importance - a.importance);
      
      setGaps(sortedGaps);
    } catch (error) {
      console.error("Error analyzing wardrobe:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (wardrobe.length < 5) {
    return (
      <Alert className="bg-fashion-secondary/20 border-fashion-secondary text-fashion-dark mb-6">
        <TrendingUp className="h-4 w-4" />
        <AlertTitle className="text-sm font-medium">Add more items</AlertTitle>
        <AlertDescription className="text-xs">
          Add at least 5 items to your wardrobe to get personalized gap analysis and shopping recommendations.
        </AlertDescription>
      </Alert>
    );
  }

  if (isAnalyzing) {
    return (
      <div className="bg-fashion-secondary/20 border border-fashion-secondary/30 rounded-lg p-4 mb-6 animate-pulse">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={16} className="text-fashion-primary" />
          <div className="text-sm font-medium">Analyzing your wardrobe...</div>
        </div>
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (gaps.length === 0) {
    return (
      <Alert className="bg-green-50 border-green-200 mb-6">
        <Sparkles className="h-4 w-4 text-green-500" />
        <AlertTitle className="text-sm font-medium">Well balanced wardrobe!</AlertTitle>
        <AlertDescription className="text-xs">
          Your wardrobe appears well-balanced. We'll notify you if we detect any gaps in the future.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="bg-fashion-secondary/10 border border-fashion-secondary/30 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-fashion-primary" />
          <div className="text-sm font-medium">Wardrobe Analysis</div>
        </div>
        <Badge variant="outline" className="text-xs font-normal">
          {gaps.length} suggestion{gaps.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      <div className="space-y-3">
        {gaps.slice(0, 3).map((gap, index) => (
          <div key={index} className="bg-white rounded-md p-3 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-1">
              <div className="font-medium capitalize text-sm">{gap.category}</div>
              <Badge 
                variant={gap.importance > 7 ? "destructive" : "outline"} 
                className="text-xs px-2 py-0"
              >
                Priority {gap.importance}/10
              </Badge>
            </div>
            <p className="text-xs text-gray-600 mb-2">{gap.reason}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full text-xs h-8 gap-1"
              asChild
            >
              <a href="#" onClick={(e) => e.preventDefault()}>
                <ShoppingBag size={12} />
                Find matching items
              </a>
            </Button>
          </div>
        ))}
      </div>
      
      {gaps.length > 3 && (
        <Button 
          variant="link" 
          className="w-full mt-2 text-xs text-fashion-primary"
        >
          View all {gaps.length} recommendations
        </Button>
      )}
    </div>
  );
};

export default WardrobeGapAnalysis;

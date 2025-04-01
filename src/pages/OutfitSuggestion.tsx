
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { RefreshCw, Check, Info, Cloud, Sun, User, Calendar, ThumbsUp, ThumbsDown, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { OccasionType } from "@/utils/colorHarmony";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Toggle } from "@/components/ui/toggle";

const OutfitSuggestion = () => {
  const { 
    wardrobe, 
    currentOutfit, 
    generateOutfit, 
    saveOutfitAsWorn, 
    userProfile,
    currentOccasion,
    setCurrentOccasion,
    provideFeedback
  } = useWardrobe();
  
  const [outfitReason, setOutfitReason] = useState<string>("");
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null);
  const [feedbackMood, setFeedbackMood] = useState<string>("");
  const [multipleOutfits, setMultipleOutfits] = useState<Array<any>>([]);
  const [selectedOutfitIndex, setSelectedOutfitIndex] = useState<number>(0);

  // Occasions available in the app
  const occasions: OccasionType[] = [
    "casual",
    "formal",
    "business",
    "workout",
    "beach",
    "wedding",
    "funeral"
  ];

  // Mood options for feedback
  const moodOptions = [
    "Confident",
    "Comfortable",
    "Professional",
    "Stylish",
    "Casual",
    "Uncomfortable",
    "Overdressed",
    "Underdressed"
  ];

  useEffect(() => {
    if (wardrobe.length > 0 && !currentOutfit) {
      generateOutfit(currentOccasion);
    }
  }, [wardrobe, currentOutfit, generateOutfit, currentOccasion]);

  useEffect(() => {
    if (currentOutfit && userProfile) {
      generateOutfitReason();
    }
  }, [currentOutfit, userProfile]);

  const generateOutfitReason = () => {
    if (!currentOutfit || !userProfile.skinTone) return;

    // Create personalized explanation based on user features and occasion
    const reasons = [
      `This outfit complements your ${userProfile.skinTone} skin tone`,
      `The colors work well with your ${userProfile.hairColor} hair`,
      `The color palette enhances your ${userProfile.eyeColor} eyes`
    ];

    // Add occasion-specific reason
    reasons.push(`This outfit is perfect for ${currentOccasion} occasions`);

    // Add weather-appropriate reason
    reasons.push("The style is appropriate for today's weather");

    // If outfit has a score, mention it
    if (currentOutfit.score) {
      const scoreText = currentOutfit.score >= 85 
        ? "an exceptional match" 
        : currentOutfit.score >= 70 
          ? "a great match" 
          : "a good match";
      reasons.push(`Our AI thinks this is ${scoreText} for you`);
    }

    // Join reasons with commas and "and" for the last one
    const reasonsText = reasons.length > 1 
      ? `${reasons.slice(0, -1).join(", ")} and ${reasons[reasons.length - 1]}`
      : reasons[0];

    setOutfitReason(reasonsText + ".");
  };

  const handleRefresh = () => {
    generateOutfit(currentOccasion);
    toast.success("Generated a new outfit for you");
  };

  const handleWear = () => {
    saveOutfitAsWorn();
    toast.success("Outfit saved to your history");
    // Open feedback dialog
    setFeedbackOpen(true);
  };

  const handleOccasionChange = (occasion: OccasionType) => {
    setCurrentOccasion(occasion);
    generateOutfit(occasion);
    toast.success(`Switched to ${occasion} outfit suggestions`);
  };

  const submitFeedback = () => {
    if (!currentOutfit || !feedbackRating || !feedbackMood) return;
    
    provideFeedback(currentOutfit.id, feedbackRating, feedbackMood);
    toast.success("Thank you for your feedback! Your preferences have been updated.");
    setFeedbackOpen(false);
    // Reset feedback form
    setFeedbackRating(null);
    setFeedbackMood("");
  };

  // Function to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
      
      {/* Occasion filters */}
      <div className="mb-6">
        <h2 className="text-sm font-medium mb-2 flex items-center gap-1.5">
          <Calendar size={16} />
          Occasion
        </h2>
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {occasions.map((occasion) => (
            <Toggle
              key={occasion}
              pressed={currentOccasion === occasion}
              onPressedChange={() => handleOccasionChange(occasion)}
              className="rounded-full px-3 py-1 text-xs border border-gray-200 capitalize 
                         data-[state=on]:bg-fashion-primary data-[state=on]:text-white"
            >
              {occasion}
            </Toggle>
          ))}
        </div>
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
          <h2 className="text-xl font-semibold mb-1 text-center">
            AI Recommended Outfit
          </h2>
          
          {currentOutfit.score && (
            <div className="text-center mb-4">
              <span className="inline-flex items-center gap-1 text-sm bg-fashion-secondary/30 px-2 py-0.5 rounded-full">
                <span className="font-semibold">{Math.round(currentOutfit.score)}/100</span> 
                <span className="text-xs opacity-70">Match Score</span>
              </span>
            </div>
          )}
          
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
                  {outfitReason || `This outfit has been selected for ${capitalizeWords(currentOccasion)} occasions based on your personal style and today's weather.`}
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
      
      {/* Feedback dialog */}
      <Dialog open={feedbackOpen} onOpenChange={setFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>How did you like this outfit?</DialogTitle>
            <DialogDescription>
              Your feedback helps us improve future outfit suggestions.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Rating</h4>
              <div className="flex justify-center gap-4">
                <Button 
                  variant={feedbackRating === 1 ? "default" : "outline"} 
                  className={`${feedbackRating === 1 ? "bg-red-500 hover:bg-red-600" : ""} h-auto p-3`}
                  onClick={() => setFeedbackRating(1)}
                >
                  <ThumbsDown size={24} />
                </Button>
                <Button 
                  variant={feedbackRating === 3 ? "default" : "outline"} 
                  className={`${feedbackRating === 3 ? "bg-yellow-500 hover:bg-yellow-600" : ""} h-auto p-3`}
                  onClick={() => setFeedbackRating(3)}
                >
                  <span className="text-2xl">😐</span>
                </Button>
                <Button 
                  variant={feedbackRating === 5 ? "default" : "outline"} 
                  className={`${feedbackRating === 5 ? "bg-green-500 hover:bg-green-600" : ""} h-auto p-3`}
                  onClick={() => setFeedbackRating(5)}
                >
                  <ThumbsUp size={24} />
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium">How did this outfit make you feel?</h4>
              <div className="flex flex-wrap gap-2">
                {moodOptions.map((mood) => (
                  <Button 
                    key={mood}
                    variant={feedbackMood === mood ? "default" : "outline"} 
                    className={`text-xs ${feedbackMood === mood ? "bg-fashion-primary hover:bg-fashion-primary/90" : ""}`}
                    onClick={() => setFeedbackMood(mood)}
                  >
                    {mood}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <MessageSquare size={14} />
                Additional comments (optional)
              </h4>
              <Textarea 
                placeholder="What did you like or dislike about this outfit?"
                className="resize-none"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setFeedbackOpen(false)}
            >
              Skip
            </Button>
            <Button 
              onClick={submitFeedback}
              disabled={!feedbackRating || !feedbackMood}
            >
              Submit Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OutfitSuggestion;

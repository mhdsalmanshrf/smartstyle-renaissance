
import { useEffect, useState } from "react";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { toast } from "sonner";
import { OccasionType } from "@/utils/colorHarmony";

// Import refactored components
import OccasionFilters from "@/components/outfit/OccasionFilters";
import UserProfileCard from "@/components/outfit/UserProfileCard";
import OutfitDisplay from "@/components/outfit/OutfitDisplay";
import WeatherBadge from "@/components/outfit/WeatherBadge";
import FeedbackDialog from "@/components/outfit/FeedbackDialog";
import EmptyWardrobeMessage from "@/components/outfit/EmptyWardrobeMessage";

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

  const handleFeedbackSubmit = (rating: number, mood: string) => {
    if (!currentOutfit) return;
    
    provideFeedback(currentOutfit.id, rating, mood);
    toast.success("Thank you for your feedback! Your preferences have been updated.");
    setFeedbackOpen(false);
  };

  // Function to capitalize first letter of each word
  const capitalizeWords = (str: string) => {
    return str.split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (wardrobe.length === 0) {
    return <EmptyWardrobeMessage />;
  }

  return (
    <div className="pb-20 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-fashion-dark">Today's Outfit</h1>
      
      <WeatherBadge />
      
      <OccasionFilters 
        currentOccasion={currentOccasion}
        onOccasionChange={handleOccasionChange}
      />
      
      <UserProfileCard 
        selfieUrl={userProfile.selfieUrl}
        skinTone={userProfile.skinTone}
        hairColor={userProfile.hairColor}
        eyeColor={userProfile.eyeColor}
      />
      
      <OutfitDisplay 
        outfit={currentOutfit}
        outfitReason={outfitReason || `This outfit has been selected for ${capitalizeWords(currentOccasion)} occasions based on your personal style and today's weather.`}
        onRefresh={handleRefresh}
        onWear={handleWear}
      />
      
      <FeedbackDialog 
        open={feedbackOpen}
        onOpenChange={setFeedbackOpen}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default OutfitSuggestion;

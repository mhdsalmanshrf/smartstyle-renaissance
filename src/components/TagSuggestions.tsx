
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/contexts/WardrobeContext";

type TagSuggestionsProps = {
  clothingType: string;
  onSelectTag: (tag: string) => void;
  detectedTags?: string[];
  color?: string;
};

const TagSuggestions = ({ 
  clothingType, 
  onSelectTag, 
  detectedTags = [],
  color
}: TagSuggestionsProps) => {
  const { userProfile } = useWardrobe();
  
  const getSuggestedTags = () => {
    const commonTags = ["casual", "formal", "favorite", "new"];
    
    const tagsByType: Record<string, string[]> = {
      "shirt": ["cotton", "button-down", "graphic", "long-sleeve", "short-sleeve"],
      "t-shirt": ["graphic", "plain", "v-neck", "crew-neck", "cotton"],
      "blouse": ["silk", "button-up", "patterned", "work"],
      "sweater": ["wool", "cashmere", "cardigan", "turtleneck", "warm"],
      "pants": ["khaki", "cotton", "slim-fit", "regular", "pleated"],
      "jeans": ["denim", "slim", "skinny", "bootcut", "ripped", "dark-wash", "light-wash"],
      "skirt": ["midi", "mini", "maxi", "pleated", "a-line"],
      "shorts": ["denim", "chino", "cargo", "athletic"],
      "dress": ["cocktail", "maxi", "mini", "a-line", "summer", "evening"],
      "jacket": ["denim", "leather", "bomber", "blazer", "waterproof"],
      "coat": ["winter", "wool", "trench", "parka", "raincoat"],
      "shoes": ["leather", "sneakers", "dress", "casual", "athletic"],
      "sneakers": ["running", "casual", "athletic", "canvas", "leather"],
      "boots": ["ankle", "combat", "winter", "leather", "chelsea"],
      "accessory": ["silver", "gold", "statement", "everyday", "gift"],
      "hat": ["baseball", "beanie", "sun", "fedora", "snapback"],
    };

    // Feature-based tags
    const featureTags: string[] = [];
    
    if (userProfile.skinTone) {
      // Add complementary color tags based on skin tone
      if (userProfile.skinTone === "warm") {
        featureTags.push("earth-tones", "warm-colors");
      } else if (userProfile.skinTone === "cool") {
        featureTags.push("cool-colors", "jewel-tones");
      } else if (userProfile.skinTone === "deep") {
        featureTags.push("bright-colors", "high-contrast");
      } else if (userProfile.skinTone === "olive") {
        featureTags.push("muted-colors", "olive-friendly");
      } else {
        featureTags.push("neutral-colors");
      }
    }
    
    if (color) {
      featureTags.push(color);
    }

    const type = clothingType.toLowerCase();
    const suggestedTags = [
      ...commonTags,
      ...(tagsByType[type] || []),
      ...featureTags
    ];
    
    // Add AI detected tags if they're not already in the suggested tags
    if (detectedTags.length > 0) {
      detectedTags.forEach(tag => {
        if (!suggestedTags.includes(tag)) {
          suggestedTags.push(tag);
        }
      });
    }
    
    return suggestedTags;
  };

  const getTagClassName = (tag: string) => {
    let className = "text-xs bg-background/50 hover:bg-primary/10";
    
    // Highlight AI detected tags
    if (detectedTags.includes(tag)) {
      className += " border-primary text-primary";
    }
    
    // Highlight feature-based tags
    if (userProfile.skinTone && 
        (tag.includes("tone") || tag.includes("color") || 
         tag === userProfile.skinTone || tag === userProfile.hairColor)) {
      className += " border-amber-500 text-amber-600 dark:text-amber-400";
    }
    
    return className;
  };

  return (
    <div className="mb-4">
      <p className="text-sm text-muted-foreground mb-2">
        {detectedTags && detectedTags.length > 0 
          ? "AI suggested tags:"
          : "Suggested tags:"}
      </p>
      <div className="flex flex-wrap gap-2">
        {getSuggestedTags().map((tag) => (
          <Button
            key={tag}
            variant="outline"
            size="sm"
            className={getTagClassName(tag)}
            onClick={() => onSelectTag(tag)}
          >
            {detectedTags.includes(tag) && "🤖 "}
            {(tag === userProfile.skinTone || tag === userProfile.hairColor || 
              tag.includes("tone") || tag.includes("color")) && "✨ "}
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TagSuggestions;

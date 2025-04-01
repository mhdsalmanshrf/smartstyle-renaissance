
import { Button } from "@/components/ui/button";

type TagSuggestionsProps = {
  clothingType: string;
  onSelectTag: (tag: string) => void;
  detectedTags?: string[];
};

const TagSuggestions = ({ clothingType, onSelectTag, detectedTags = [] }: TagSuggestionsProps) => {
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

    const type = clothingType.toLowerCase();
    const suggestedTags = [
      ...commonTags,
      ...(tagsByType[type] || [])
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
            className={`text-xs bg-background/50 hover:bg-primary/10 ${
              detectedTags.includes(tag) ? "border-primary text-primary" : ""
            }`}
            onClick={() => onSelectTag(tag)}
          >
            {detectedTags.includes(tag) && "🤖 "}
            {tag}
          </Button>
        ))}
      </div>
    </div>
  );
};

export default TagSuggestions;

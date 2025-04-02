
import { Calendar } from "lucide-react";
import { Toggle } from "@/components/ui/toggle";
import { OccasionType } from "@/utils/colorHarmony";

interface OccasionFiltersProps {
  currentOccasion: OccasionType;
  onOccasionChange: (occasion: OccasionType) => void;
}

const OccasionFilters = ({ currentOccasion, onOccasionChange }: OccasionFiltersProps) => {
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

  return (
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
            onPressedChange={() => onOccasionChange(occasion)}
            className="rounded-full px-3 py-1 text-xs border border-gray-200 capitalize 
                       data-[state=on]:bg-fashion-primary data-[state=on]:text-white"
          >
            {occasion}
          </Toggle>
        ))}
      </div>
    </div>
  );
};

export default OccasionFilters;

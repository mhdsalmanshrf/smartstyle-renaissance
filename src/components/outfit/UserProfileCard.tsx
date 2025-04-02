
import { User } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface UserProfileCardProps {
  selfieUrl: string | null;
  skinTone: string | null;
  hairColor: string | null;
  eyeColor: string | null;
}

const UserProfileCard = ({ selfieUrl, skinTone, hairColor, eyeColor }: UserProfileCardProps) => {
  if (!selfieUrl) return null;

  return (
    <div className="flex items-center gap-3 mb-6 p-3 bg-background/50 rounded-lg border">
      <div className="w-10 h-10 rounded-full overflow-hidden">
        <img 
          src={selfieUrl} 
          alt="Your profile" 
          className="w-full h-full object-cover" 
        />
      </div>
      <div className="flex-1">
        <div className="text-sm font-medium">Your features</div>
        <div className="flex flex-wrap gap-1 mt-1">
          {skinTone && (
            <Badge variant="outline" className="text-xs">
              {skinTone} skin
            </Badge>
          )}
          {hairColor && (
            <Badge variant="outline" className="text-xs">
              {hairColor} hair
            </Badge>
          )}
          {eyeColor && (
            <Badge variant="outline" className="text-xs">
              {eyeColor} eyes
            </Badge>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfileCard;

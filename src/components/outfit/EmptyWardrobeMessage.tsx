
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyWardrobeMessage = () => {
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
};

export default EmptyWardrobeMessage;

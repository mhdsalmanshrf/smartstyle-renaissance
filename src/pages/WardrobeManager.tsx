
import { useState } from "react";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, Clock, Trash2, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";

const WardrobeManager = () => {
  const { wardrobe, removeClothingItem, outfits } = useWardrobe();
  const [activeTab, setActiveTab] = useState("wardrobe");
  
  const handleDelete = (id: string) => {
    removeClothingItem(id);
    toast.success("Item removed from wardrobe");
  };

  return (
    <div className="pb-20 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-fashion-dark">Your Looks</h1>
      <p className="text-gray-600 mb-6">
        Manage your wardrobe and past outfits
      </p>
      
      <Tabs defaultValue="wardrobe" className="mb-8" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="wardrobe">My Wardrobe</TabsTrigger>
          <TabsTrigger value="history">Outfit History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="wardrobe" className="animate-fade-in">
          {wardrobe.length === 0 ? (
            <div className="fashion-card p-6 text-center">
              <h3 className="font-medium mb-2">Your wardrobe is empty</h3>
              <p className="text-gray-600 mb-4">
                Add some clothing items to get started
              </p>
              <Button 
                onClick={() => window.location.href = "/wardrobe/add"}
                className="fashion-btn-primary"
              >
                Add Items
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {wardrobe.map(item => (
                <div key={item.id} className="fashion-card">
                  <div className="mb-3 relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.type}
                      className="w-full h-40 object-cover rounded-lg"
                    />
                  </div>
                  
                  <h3 className="font-medium capitalize mb-1">{item.type}</h3>
                  
                  {item.tags.length > 0 && (
                    <div className="flex items-start gap-1 mb-2">
                      <Tags size={14} className="text-gray-500 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-gray-600">
                        {item.tags.join(", ")}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar size={12} className="mr-1" />
                      <span>
                        {format(new Date(item.dateAdded), "MMM d, yyyy")}
                      </span>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="text-red-500 hover:bg-red-50 hover:text-red-600 p-1 h-auto"
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="history" className="animate-fade-in">
          {outfits.length === 0 ? (
            <div className="fashion-card p-6 text-center">
              <h3 className="font-medium mb-2">No outfit history yet</h3>
              <p className="text-gray-600 mb-4">
                Your saved outfits will appear here
              </p>
              <Button 
                onClick={() => window.location.href = "/outfit"}
                className="fashion-btn-primary"
              >
                Get Outfit Suggestions
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {outfits.map(outfit => (
                <div key={outfit.id} className="fashion-card">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium">Outfit from {format(new Date(outfit.date), "MMMM d")}</h3>
                    <div className="flex items-center text-xs text-gray-500">
                      <Clock size={14} className="mr-1" />
                      <span>{format(new Date(outfit.date), "h:mm a")}</span>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {outfit.items.map(item => (
                      <div key={item.id} className="border border-gray-100 rounded-lg overflow-hidden">
                        <img 
                          src={item.imageUrl} 
                          alt={item.type}
                          className="w-full h-24 object-cover"
                        />
                        <p className="text-xs p-1 bg-gray-50 truncate capitalize">
                          {item.type}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs"
                      onClick={() => {
                        // In a real app, this would re-select this outfit
                        toast.success("Outfit selected for today");
                      }}
                    >
                      Wear Again
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WardrobeManager;

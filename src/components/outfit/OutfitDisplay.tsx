
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClothingItem } from "@/contexts/WardrobeContext";
import { Outfit } from "@/contexts/WardrobeContext";
import { RefreshCw } from "lucide-react";
import AuthModal from "@/components/auth/AuthModal";

interface OutfitDisplayProps {
  outfit: Outfit | null;
  outfitReason: string;
  onRefresh: () => void;
  onWear: () => void;
  isAuthenticated?: boolean;
}

const OutfitDisplay = ({ outfit, outfitReason, onRefresh, onWear, isAuthenticated = false }: OutfitDisplayProps) => {
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState<ClothingItem | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    if (outfit && outfit.items.length > 0) {
      setSelectedItem(outfit.items[0]);
    }
  }, [outfit]);

  if (!outfit) {
    return (
      <div className="p-8 text-center">
        <p>Generating your outfit...</p>
      </div>
    );
  }

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      onRefresh();
      setLoading(false);
    }, 600);
  };

  const handleWear = () => {
    if (!isAuthenticated) {
      setAuthModalOpen(true);
      return;
    }
    onWear();
  };

  return (
    <>
      <div className="mt-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold">Your Outfit</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex gap-2 items-center"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-5">
          <div className="md:col-span-2">
            <div className="mb-4">
              <Tabs defaultValue={outfit.items[0]?.id}>
                <TabsList className="w-full">
                  {outfit.items.map((item) => (
                    <TabsTrigger
                      key={item.id}
                      value={item.id}
                      onClick={() => setSelectedItem(item)}
                      className="flex-1"
                    >
                      {item.type}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {outfit.items.map((item) => (
                  <TabsContent key={item.id} value={item.id} className="mt-0">
                    <Card className="overflow-hidden border-0 shadow-none">
                      <CardContent className="p-0">
                        <div className="aspect-square w-full overflow-hidden rounded-md">
                          <img
                            src={item.imageUrl}
                            alt={item.type}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {selectedItem && (
              <div className="mb-6">
                <h3 className="font-medium">{selectedItem.type}</h3>
                <div className="mt-1 flex flex-wrap gap-1">
                  {selectedItem.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block rounded-full bg-gray-100 px-2 py-1 text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-3">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-lg mb-2">Why this outfit?</h3>
                <p className="text-gray-600 text-sm mb-6">{outfitReason}</p>

                <div className="mt-4 flex flex-col gap-3">
                  <Button
                    onClick={handleWear}
                    className="w-full fashion-btn-primary"
                  >
                    {isAuthenticated ? "Wear Today" : "Login to Save Outfit"}
                  </Button>
                  {!isAuthenticated && (
                    <p className="text-xs text-center text-gray-500">
                      Create an account to save your outfits and preferences
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </>
  );
};

export default OutfitDisplay;

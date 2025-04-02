import React, { useState } from "react";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { Shirt, RefreshCw, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format, parseISO, differenceInDays } from "date-fns";
import { ClothingStatus } from "@/contexts/WardrobeContext";
import { useToast } from "@/hooks/use-toast";

const LaundryTracker = () => {
  const { wardrobe, updateItemStatus, restoreItemFromLaundry, restoreAllLaundry } = useWardrobe();
  const [filter, setFilter] = useState<ClothingStatus | "all">("all");
  const { toast } = useToast();

  const laundryItems = wardrobe.filter(
    item => filter === "all" ? 
      (item.status === "in-laundry" || item.status === "dirty") : 
      item.status === filter
  );

  const handleStatusChange = (itemId: string, status: ClothingStatus) => {
    updateItemStatus(itemId, status);
    toast({
      title: "Status Updated",
      description: `Item status changed to ${status.replace("-", " ")}`,
    });
  };

  const handleRestoreAll = () => {
    restoreAllLaundry();
    toast({
      title: "All Items Restored",
      description: "All laundry items have been restored to available status",
    });
  };

  const getStatusBadgeColor = (status?: ClothingStatus) => {
    switch (status) {
      case "available": return "bg-green-500 hover:bg-green-600";
      case "in-laundry": return "bg-blue-500 hover:bg-blue-600";
      case "dirty": return "bg-red-500 hover:bg-red-600";
      case "fresh": return "bg-purple-500 hover:bg-purple-600";
      default: return "bg-gray-500 hover:bg-gray-600";
    }
  };

  const getDaysInStatus = (lastStatusChange?: string | null) => {
    if (!lastStatusChange) return 0;
    return differenceInDays(new Date(), parseISO(lastStatusChange));
  };

  return (
    <div className="space-y-6 pb-16">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Laundry Tracker</h1>
        <p className="text-muted-foreground">
          Manage your laundry and track the status of your clothes
        </p>
      </div>

      <div className="flex items-center justify-between">
        <Select
          value={filter}
          onValueChange={(value) => setFilter(value as ClothingStatus | "all")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Laundry</SelectItem>
            <SelectItem value="dirty">Dirty</SelectItem>
            <SelectItem value="in-laundry">In Laundry</SelectItem>
          </SelectContent>
        </Select>

        <Button 
          variant="outline" 
          onClick={handleRestoreAll}
          disabled={laundryItems.length === 0}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Restore All
        </Button>
      </div>

      {laundryItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 text-center">
          <Shirt className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium">No items in laundry</h3>
          <p className="text-muted-foreground mt-2">
            Items will appear here when they are marked as dirty or in laundry.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {laundryItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="flex items-start p-4">
                <div className="h-24 w-24 rounded-md overflow-hidden bg-muted mr-4 flex-shrink-0">
                  <img
                    src={item.imageUrl}
                    alt={item.type}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium capitalize">{item.type}</h3>
                      <p className="text-sm text-muted-foreground">
                        Color: {item.color}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {item.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <Badge 
                        className={`mt-2 ${getStatusBadgeColor(item.status)}`}
                      >
                        {item.status || "available"}
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs text-muted-foreground">
                    {item.lastStatusChange && (
                      <p>
                        {getDaysInStatus(item.lastStatusChange)} days in{" "}
                        {item.status || "available"} status
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-muted/50 p-2 flex justify-around">
                {item.status === "dirty" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatusChange(item.id, "in-laundry")}
                  >
                    <RefreshCw className="mr-1 h-3 w-3" />
                    Mark as Washing
                  </Button>
                )}
                {item.status === "in-laundry" && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleStatusChange(item.id, "available")}
                  >
                    <Check className="mr-1 h-3 w-3" />
                    Mark as Clean
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => restoreItemFromLaundry(item.id)}
                >
                  <Check className="mr-1 h-3 w-3" />
                  Restore
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LaundryTracker;

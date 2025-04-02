
import { useLocation } from "react-router-dom";
import { ChevronRight } from "lucide-react";

const pathNames: Record<string, string> = {
  "": "Home",
  "outfit": "Outfit Suggestions",
  "wardrobe": "My Wardrobe",
  "wardrobe/add": "Add Item",
  "laundry": "Laundry Tracker",
  "shop": "Smart Shopping",
  "settings": "Settings"
};

const Breadcrumbs = () => {
  const location = useLocation();
  const pathname = location.pathname.replace(/^\/|\/$/g, "");
  
  // Don't show breadcrumbs on the root path
  if (pathname === "") return null;
  
  const displayName = pathNames[pathname] || pathname;

  return (
    <div className="text-sm font-medium">
      <h1 className="text-lg font-semibold text-foreground">{displayName}</h1>
    </div>
  );
};

export default Breadcrumbs;

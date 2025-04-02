
import { useLocation, Link } from "react-router-dom";
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
  
  // Split the path into segments
  const pathSegments = pathname.split('/');
  const displayName = pathNames[pathname] || pathSegments[pathSegments.length - 1];
  
  // If it's a single-level path, just show the title
  if (pathSegments.length <= 1) {
    return (
      <div className="text-sm font-medium">
        <h1 className="text-lg font-semibold text-foreground">{displayName}</h1>
      </div>
    );
  }
  
  // For multi-level paths, show breadcrumb navigation
  return (
    <div className="text-sm font-medium">
      <div className="flex items-center gap-1 mb-1">
        {pathSegments.map((segment, index) => {
          // Skip empty segments
          if (!segment) return null;
          
          // Build the path up to this segment
          const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
          const isLast = index === pathSegments.length - 1;
          const segmentName = pathNames[pathSegments.slice(0, index + 1).join('/')] || segment;
          
          return (
            <div key={path} className="flex items-center">
              {index > 0 && <ChevronRight className="h-3 w-3 mx-1 text-muted-foreground" />}
              {isLast ? (
                <span className="text-foreground">{segmentName}</span>
              ) : (
                <Link 
                  to={path} 
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {segmentName}
                </Link>
              )}
            </div>
          );
        })}
      </div>
      <h1 className="text-lg font-semibold text-foreground">{displayName}</h1>
    </div>
  );
};

export default Breadcrumbs;

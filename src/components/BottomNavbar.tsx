
import { Shirt, ShoppingBag, Layers, ImagePlus, RefreshCw } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useWardrobe } from "@/contexts/WardrobeContext";

const BottomNavbar = () => {
  const location = useLocation();
  const { userProfile } = useWardrobe();
  
  // Hide navbar on the onboarding page if user hasn't uploaded a selfie
  if (location.pathname === "/" && !userProfile.selfieUrl) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border py-2 px-4 z-10">
      <div className="flex justify-around items-center max-w-md mx-auto">
        <NavItem 
          to="/outfit" 
          icon={<Shirt size={24} />} 
          label="Outfit" 
          isActive={location.pathname === "/outfit"} 
        />
        <NavItem 
          to="/wardrobe/add" 
          icon={<ImagePlus size={24} />} 
          label="Add" 
          isActive={location.pathname === "/wardrobe/add"} 
        />
        <NavItem 
          to="/wardrobe" 
          icon={<Layers size={24} />} 
          label="Wardrobe" 
          isActive={location.pathname === "/wardrobe"} 
        />
        <NavItem 
          to="/laundry" 
          icon={<RefreshCw size={24} />} 
          label="Laundry" 
          isActive={location.pathname === "/laundry"} 
        />
        <NavItem 
          to="/shop" 
          icon={<ShoppingBag size={24} />} 
          label="Shop" 
          isActive={location.pathname === "/shop"} 
        />
      </div>
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}

const NavItem = ({ to, icon, label, isActive }: NavItemProps) => {
  return (
    <Link 
      to={to} 
      className={`flex flex-col items-center justify-center p-2 ${
        isActive ? "text-primary" : "text-muted-foreground"
      }`}
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </Link>
  );
};

export default BottomNavbar;

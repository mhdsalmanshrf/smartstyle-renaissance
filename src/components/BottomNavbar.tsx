import { Shirt, ShoppingBag, Layers, ImagePlus, RefreshCw, Settings as SettingsIcon } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { cn } from "@/lib/utils";
const BottomNavbar = () => {
  const location = useLocation();
  const {
    userProfile
  } = useWardrobe();

  // Hide navbar on the onboarding page if user hasn't uploaded a selfie
  if (location.pathname === "/" && !userProfile.selfieUrl) {
    return null;
  }
  return <div className="fixed bottom-0 left-0 right-0 z-40">
      <div className="container max-w-md mx-auto">
        <div className="glass-morphism rounded-t-xl border-t border-x border-border py-2 px-4 mx-2 mb-2">
          <div className="flex justify-around items-center">
            <NavItem to="/outfit" icon={<Shirt className="w-5 h-5" />} label="Outfit" isActive={location.pathname === "/outfit"} />
            <NavItem to="/wardrobe/add" icon={<ImagePlus className="w-5 h-5" />} label="Add" isActive={location.pathname === "/wardrobe/add"} />
            <NavItem to="/wardrobe" icon={<Layers className="w-5 h-5" />} label="Wardrobe" isActive={location.pathname === "/wardrobe"} />
            <NavItem to="/laundry" icon={<RefreshCw className="w-5 h-5" />} label="Laundry" isActive={location.pathname === "/laundry"} />
            <NavItem to="/shop" icon={<ShoppingBag className="w-5 h-5" />} label="Shop" isActive={location.pathname === "/shop"} />
            <NavItem to="/settings" icon={<SettingsIcon className="w-5 h-5" />} label="Settings" isActive={location.pathname === "/settings"} />
          </div>
        </div>
      </div>
    </div>;
};
interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
}
const NavItem = ({
  to,
  icon,
  label,
  isActive
}: NavItemProps) => {
  return <Link to={to} className={cn("flex flex-col items-center justify-center p-2 transition-all", isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-foreground/80")}>
      {icon}
      <span className="text-xs mt-1 font-medium">{label}</span>
      {isActive && <span className="block h-1 w-1 rounded-full bg-primary mt-1"></span>}
    </Link>;
};
export default BottomNavbar;
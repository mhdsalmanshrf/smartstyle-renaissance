
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactNode } from "react";
import BottomNavbar from "./BottomNavbar";
import ThemeToggle from "./ThemeToggle";
import Breadcrumbs from "./Breadcrumbs";
import { useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";

interface AppLayoutProps {
  children: ReactNode;
  showBackButton?: boolean;
}

const AppLayout = ({ children, showBackButton = false }: AppLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Don't show back button on main pages
  const isMainPage = ["/outfit", "/wardrobe/add", "/wardrobe", "/laundry", "/shop", "/settings"].includes(location.pathname);
  const shouldShowBackButton = showBackButton && !isMainPage;

  return (
    <>
      <Toaster />
      <Sonner />
      <div className="flex flex-col min-h-screen bg-background">
        <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-sm border-b">
          <div className="container max-w-md mx-auto flex items-center justify-between py-3 px-4">
            {shouldShowBackButton ? (
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-5 w-5" />
              </Button>
            ) : (
              <div className="w-10" />
            )}
            <Breadcrumbs />
            <ThemeToggle />
          </div>
        </header>
        <main className="flex-1 container max-w-md mx-auto p-4 pt-6 animate-fade-in">
          {children}
        </main>
        <BottomNavbar />
      </div>
    </>
  );
};

export default AppLayout;


import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";
import UserProfileMenu from "./UserProfileMenu";
import { LogIn } from "lucide-react";
import { useLocation } from "react-router-dom";

const WelcomeAuth = () => {
  const { isAuthenticated, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  // Enhanced greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div className={`flex items-center justify-between w-full ${isHomePage ? 'mb-10' : 'mb-6'}`}>
      <div>
        <h2 className="text-2xl font-bold">
          {isAuthenticated 
            ? `${getGreeting()}, ${user?.displayName || 'there'}`
            : "Welcome to SmartStyle"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isAuthenticated 
            ? "Your personal fashion assistant is ready to help" 
            : "Sign in to save your preferences and outfits"}
        </p>
        
        {isAuthenticated && isHomePage && (
          <p className="mt-2 text-sm text-emerald-600 dark:text-emerald-400">
            Your outfits and preferences will be saved automatically
          </p>
        )}
      </div>
      
      {isAuthenticated ? (
        <UserProfileMenu />
      ) : (
        <Button 
          variant="outline" 
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center gap-2"
        >
          <LogIn className="h-4 w-4" />
          Sign In
        </Button>
      )}
      
      <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
    </div>
  );
};

export default WelcomeAuth;

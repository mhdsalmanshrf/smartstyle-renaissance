
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import AuthModal from "./AuthModal";
import UserProfileMenu from "./UserProfileMenu";
import { LogIn } from "lucide-react";

const WelcomeAuth = () => {
  const { isAuthenticated, user } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="flex items-center justify-between w-full mb-6">
      <div>
        <h2 className="text-2xl font-bold">
          {isAuthenticated 
            ? `Welcome back, ${user?.displayName || 'there'}`
            : "Welcome to SmartStyle"}
        </h2>
        <p className="text-sm text-muted-foreground">
          {isAuthenticated 
            ? "Your personal fashion assistant" 
            : "Sign in to save your preferences and outfits"}
        </p>
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

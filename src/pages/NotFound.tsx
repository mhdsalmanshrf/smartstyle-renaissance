
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { LogIn } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center bg-white p-8 rounded-lg shadow-md max-w-md w-full">
        <h1 className="text-6xl font-bold mb-4 text-gray-800">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Page not found</p>
        
        <div className="flex flex-col gap-4">
          <Button onClick={handleGoHome} className="fashion-btn-primary w-full">
            Return to Home
          </Button>
          
          {!isAuthenticated && (
            <div className="mt-4">
              <p className="text-sm text-gray-500 mb-3">
                Login to access your saved outfits and preferences
              </p>
              <Button 
                variant="outline" 
                onClick={() => setAuthModalOpen(true)}
                className="w-full"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login / Signup
              </Button>
            </div>
          )}
        </div>
        
        <AuthModal open={authModalOpen} onOpenChange={setAuthModalOpen} />
      </div>
    </div>
  );
};

export default NotFound;


import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "./pages/NotFound";
import BottomNavbar from "./components/BottomNavbar";
import OnboardingSelfie from "./pages/OnboardingSelfie";
import WardrobeAdd from "./pages/WardrobeAdd";
import OutfitSuggestion from "./pages/OutfitSuggestion";
import SmartShopping from "./pages/SmartShopping";
import WardrobeManager from "./pages/WardrobeManager";
import { WardrobeProvider } from "./contexts/WardrobeContext";
import ThemeToggle from "./components/ThemeToggle";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="smartstyle-theme">
        <WardrobeProvider>
          <Toaster />
          <Sonner />
          <div className="flex flex-col min-h-screen bg-background">
            <div className="fixed top-4 right-4 z-50">
              <ThemeToggle />
            </div>
            <main className="flex-1 container max-w-md mx-auto p-4">
              <Routes>
                <Route path="/" element={<OnboardingSelfie />} />
                <Route path="/wardrobe/add" element={<WardrobeAdd />} />
                <Route path="/outfit" element={<OutfitSuggestion />} />
                <Route path="/shop" element={<SmartShopping />} />
                <Route path="/wardrobe" element={<WardrobeManager />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            <BottomNavbar />
          </div>
        </WardrobeProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

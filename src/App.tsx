
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/components/theme-provider";
import NotFound from "./pages/NotFound";
import OnboardingSelfie from "./pages/OnboardingSelfie";
import WardrobeAdd from "./pages/WardrobeAdd";
import OutfitSuggestion from "./pages/OutfitSuggestion";
import SmartShopping from "./pages/SmartShopping";
import WardrobeManager from "./pages/WardrobeManager";
import LaundryTracker from "./pages/LaundryTracker";
import { WardrobeProvider } from "./contexts/WardrobeContext";
import Settings from "./pages/Settings";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "./components/AppLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="dark" storageKey="smartstyle-theme">
        <WardrobeProvider>
          <Routes>
            <Route path="/" element={<OnboardingSelfie />} />
            <Route 
              path="/wardrobe/add" 
              element={
                <AppLayout showBackButton>
                  <WardrobeAdd />
                </AppLayout>
              } 
            />
            <Route 
              path="/outfit" 
              element={
                <AppLayout>
                  <OutfitSuggestion />
                </AppLayout>
              } 
            />
            <Route 
              path="/shop" 
              element={
                <AppLayout>
                  <SmartShopping />
                </AppLayout>
              } 
            />
            <Route 
              path="/wardrobe" 
              element={
                <AppLayout>
                  <WardrobeManager />
                </AppLayout>
              } 
            />
            <Route 
              path="/laundry" 
              element={
                <AppLayout>
                  <LaundryTracker />
                </AppLayout>
              } 
            />
            <Route 
              path="/settings" 
              element={
                <AppLayout>
                  <Settings />
                </AppLayout>
              } 
            />
            <Route 
              path="*" 
              element={
                <AppLayout>
                  <NotFound />
                </AppLayout>
              } 
            />
          </Routes>
        </WardrobeProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

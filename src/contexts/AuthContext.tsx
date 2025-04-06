
import React, { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";

type User = {
  id: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
};

type AuthContextType = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<void>;
  signupWithEmail: (email: string, password: string, displayName?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  rememberDevice: boolean;
  setRememberDevice: (value: boolean) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(() => {
    const saved = localStorage.getItem("rememberDevice");
    return saved ? JSON.parse(saved) : false;
  });

  // Check for stored user on startup
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error("Failed to parse stored user", error);
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  // Update localStorage when rememberDevice changes
  useEffect(() => {
    localStorage.setItem("rememberDevice", JSON.stringify(rememberDevice));
  }, [rememberDevice]);

  // Update localStorage when user changes
  useEffect(() => {
    if (user && rememberDevice) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user, rememberDevice]);

  const login = async (email: string, password: string, remember = false) => {
    setIsLoading(true);
    try {
      // Mock login - In a real app, this would call an authentication API
      const mockUser = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName: email.split('@')[0],
        photoURL: null,
      };
      
      setUser(mockUser);
      if (remember) {
        setRememberDevice(true);
      }
      toast.success("Successfully logged in!");
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Login failed. Please check your credentials.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, password: string, displayName?: string) => {
    setIsLoading(true);
    try {
      // Mock signup - In a real app, this would call an authentication API
      const mockUser = {
        id: `user_${Math.random().toString(36).substr(2, 9)}`,
        email,
        displayName: displayName || email.split('@')[0],
        photoURL: null,
      };
      
      setUser(mockUser);
      toast.success("Account created successfully!");
    } catch (error) {
      console.error("Signup failed", error);
      toast.error("Signup failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      // Mock Google login - In a real app, this would call Google OAuth
      const mockUser = {
        id: `google_${Math.random().toString(36).substr(2, 9)}`,
        email: `user${Math.floor(Math.random() * 1000)}@gmail.com`,
        displayName: `User ${Math.floor(Math.random() * 1000)}`,
        photoURL: "https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=256&q=80",
      };
      
      setUser(mockUser);
      toast.success("Successfully signed in with Google!");
    } catch (error) {
      console.error("Google login failed", error);
      toast.error("Google sign-in failed. Please try again.");
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setUser(null);
    if (rememberDevice) {
      localStorage.removeItem("user");
    }
    toast.success("Successfully logged out");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        signupWithEmail,
        loginWithGoogle,
        logout,
        rememberDevice,
        setRememberDevice
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

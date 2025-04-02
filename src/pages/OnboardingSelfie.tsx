
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const OnboardingSelfie = () => {
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useWardrobe();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userProfile.selfieUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [displayName, setDisplayName] = useState(userProfile.displayName || "");
  const [region, setRegion] = useState(userProfile.region || "");
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const url = fileReader.result as string;
        setPreviewUrl(url);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const analyzeSelfie = () => {
    // Simulate AI analysis with loading state
    setIsAnalyzing(true);
    
    // In a real app, this would call a computer vision API
    // For demo, we'll simulate a delay and return mock values
    return new Promise<{
      skinTone: string;
      hairColor: string;
      eyeColor: string;
    }>(resolve => {
      setTimeout(() => {
        // These would be detected by AI in a real app
        const analysis = {
          skinTone: ["warm", "cool", "neutral", "olive", "deep"][Math.floor(Math.random() * 5)],
          hairColor: ["black", "brown", "blonde", "red", "gray"][Math.floor(Math.random() * 5)],
          eyeColor: ["brown", "blue", "green", "hazel", "gray"][Math.floor(Math.random() * 5)]
        };
        setIsAnalyzing(false);
        resolve(analysis);
      }, 1500);
    });
  };

  const handleContinue = async () => {
    if (previewUrl) {
      // Analyze the selfie with AI
      const analysis = await analyzeSelfie();
      
      // Update user profile
      setUserProfile({
        selfieUrl: previewUrl,
        skinTone: analysis.skinTone,
        hairColor: analysis.hairColor,
        eyeColor: analysis.eyeColor,
        displayName,
        region
      });
      
      toast.success(`Profile created with ${analysis.skinTone} skin tone, ${analysis.hairColor} hair, and ${analysis.eyeColor} eyes!`);
      navigate("/wardrobe/add");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-fashion-dark">Create Your Profile</h1>
      <p className="text-gray-600 mb-8 text-center">
        We'll analyze your features and personalize style recommendations
      </p>
      
      <div className="mb-6 relative">
        {previewUrl ? (
          <div className="w-48 h-48 rounded-full overflow-hidden bg-gray-100 border-4 border-fashion-primary">
            <img 
              src={previewUrl} 
              alt="Your selfie" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="w-48 h-48 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-300">
            <User size={64} className="text-gray-400" />
          </div>
        )}
      </div>
      
      <div className="w-full max-w-xs mb-6">
        <div className="text-sm font-medium mb-2">AI will analyze:</div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-background border rounded-lg p-2">
            <div className="text-xs text-muted-foreground">Skin tone</div>
          </div>
          <div className="bg-background border rounded-lg p-2">
            <div className="text-xs text-muted-foreground">Hair color</div>
          </div>
          <div className="bg-background border rounded-lg p-2">
            <div className="text-xs text-muted-foreground">Eye color</div>
          </div>
        </div>
      </div>
      
      <div className="w-full max-w-xs mb-4">
        <div className="space-y-4">
          <div>
            <Label htmlFor="displayName">Your Name (Optional)</Label>
            <Input 
              id="displayName" 
              value={displayName} 
              onChange={(e) => setDisplayName(e.target.value)} 
              placeholder="How should we call you?"
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="region">Your Region (Optional)</Label>
            <Input 
              id="region" 
              value={region} 
              onChange={(e) => setRegion(e.target.value)} 
              placeholder="E.g., US, Europe, Asia"
              className="mt-1"
            />
          </div>
        </div>
      </div>
      
      <div className="flex gap-4 mb-8">
        <label className="fashion-btn-secondary cursor-pointer flex items-center gap-2">
          <Camera size={18} />
          <span>Take Photo</span>
          <input
            type="file"
            accept="image/*"
            capture="user"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
        
        <label className="fashion-btn-secondary cursor-pointer flex items-center gap-2">
          <Upload size={18} />
          <span>Upload</span>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </label>
      </div>
      
      <Button 
        className="fashion-btn-primary w-full max-w-xs"
        onClick={handleContinue}
        disabled={!previewUrl || isAnalyzing}
      >
        {isAnalyzing ? 'Analyzing...' : 'Continue'}
      </Button>
    </div>
  );
};

export default OnboardingSelfie;

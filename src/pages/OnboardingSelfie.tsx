
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Camera, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { toast } from "sonner";

const OnboardingSelfie = () => {
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useWardrobe();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userProfile.selfieUrl);
  
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
    // In a real app, this would call an AI API to analyze skin tone, eye color, etc.
    // For now, we'll just set mock values
    return {
      skinTone: "warm",
      hairColor: "brown",
      eyeColor: "brown"
    };
  };

  const handleContinue = () => {
    if (previewUrl) {
      // Analyze the selfie with AI (mocked for now)
      const analysis = analyzeSelfie();
      
      // Update user profile
      setUserProfile({
        selfieUrl: previewUrl,
        skinTone: analysis.skinTone,
        hairColor: analysis.hairColor,
        eyeColor: analysis.eyeColor
      });
      
      toast.success("Profile created successfully!");
      navigate("/wardrobe/add");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-fashion-dark">Upload Your Selfie</h1>
      <p className="text-gray-600 mb-8 text-center">
        We'll personalize your style based on your look
      </p>
      
      <div className="mb-8 relative">
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
        disabled={!previewUrl}
      >
        Continue
      </Button>
    </div>
  );
};

export default OnboardingSelfie;

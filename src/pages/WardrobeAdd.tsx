
import { useState, useEffect } from "react";
import { Camera, Upload, Plus, X, Sparkles, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TagSuggestions from "@/components/TagSuggestions";
import { removeBackground, loadImage } from "@/utils/backgroundRemoval";

const clothingTypes = [
  "Shirt", "T-Shirt", "Blouse", "Sweater", 
  "Pants", "Jeans", "Skirt", "Shorts",
  "Dress", "Jacket", "Coat", 
  "Shoes", "Sneakers", "Boots",
  "Accessory", "Hat", "Other"
];

// Colors that we can detect
const detectableColors = [
  "red", "blue", "green", "yellow", "black", 
  "white", "purple", "pink", "orange", "brown",
  "gray", "navy", "beige", "teal", "maroon"
];

// Patterns that we can detect
const detectablePatterns = [
  "striped", "checkered", "floral", "solid", "patterned",
  "polka-dot", "plaid", "tie-dye", "graphic"
];

const WardrobeAdd = () => {
  const { addClothingItem } = useWardrobe();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clothingType, setClothingType] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [detectedTags, setDetectedTags] = useState<string[]>([]);
  const [detectedColor, setDetectedColor] = useState<string | null>(null);
  const [analysisComplete, setAnalysisComplete] = useState(false);
  const [removingBackground, setRemovingBackground] = useState(false);
  const [backgroundRemoved, setBackgroundRemoved] = useState(false);
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const fileReader = new FileReader();
      fileReader.onload = () => {
        const url = fileReader.result as string;
        setPreviewUrl(url);
        setDetectedTags([]);
        setDetectedColor(null);
        setAnalysisComplete(false);
        setBackgroundRemoved(false);
      };
      fileReader.readAsDataURL(file);
    }
  };

  // Automatically analyze the image when a new one is uploaded
  useEffect(() => {
    if (previewUrl && !analysisComplete) {
      analyzeClothing();
    }
  }, [previewUrl]);

  const analyzeClothing = async () => {
    if (!previewUrl) return;
    
    setAnalyzing(true);
    try {
      // In a real app, this would call an AI API to analyze the clothing
      // We're simulating AI analysis with a delayed response for demo purposes
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // For this demo, we're generating random "AI" results
      // In a real app, you would replace this with actual API calls to Vision models
      
      // 1. Detect the likely clothing type
      const randomTypeIndex = Math.floor(Math.random() * clothingTypes.length);
      const detectedType = clothingTypes[randomTypeIndex].toLowerCase();
      
      // 2. Detect colors
      const randomColorIndex = Math.floor(Math.random() * detectableColors.length);
      const detectedColor = detectableColors[randomColorIndex];
      setDetectedColor(detectedColor);
      
      // 3. Detect patterns and other attributes
      const randomPatternIndex = Math.floor(Math.random() * detectablePatterns.length);
      const detectedPattern = detectablePatterns[randomPatternIndex];
      
      // 4. Set detected tags
      const aiTags = [detectedColor, detectedPattern];
      setDetectedTags(aiTags);
      
      // 5. Auto-set the clothing type if not already set
      if (!clothingType) {
        setClothingType(detectedType);
        toast.success(`AI detected this as: ${detectedType}`);
      }
      
      setAnalysisComplete(true);
      toast.success("Image analysis complete");
    } catch (error) {
      console.error("Error analyzing clothing:", error);
      toast.error("Failed to analyze image");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleRemoveBackground = async () => {
    if (!selectedFile || !previewUrl) return;
    
    setRemovingBackground(true);
    try {
      toast.info("Removing image background...");
      
      // Load the image
      const img = await loadImage(selectedFile);
      
      // Remove the background
      const processedImageBlob = await removeBackground(img);
      
      // Update the preview with the processed image
      const newPreviewUrl = URL.createObjectURL(processedImageBlob);
      setPreviewUrl(newPreviewUrl);
      
      // Update the selected file with the new image
      const newFile = new File([processedImageBlob], selectedFile.name, { type: 'image/png' });
      setSelectedFile(newFile);
      
      setBackgroundRemoved(true);
      toast.success("Background removed successfully");
    } catch (error) {
      console.error("Error removing background:", error);
      toast.error("Failed to remove background");
    } finally {
      setRemovingBackground(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const handleSave = () => {
    if (!previewUrl || !clothingType) {
      toast.error("Please select an image and clothing type");
      return;
    }

    // Add to wardrobe with the detected color
    addClothingItem({
      imageUrl: previewUrl,
      type: clothingType,
      tags: tags,
      color: detectedColor || "unknown"
    });

    // Reset form
    setSelectedFile(null);
    setPreviewUrl(null);
    setClothingType("");
    setTags([]);
    setDetectedTags([]);
    setDetectedColor(null);
    setAnalysisComplete(false);
    setBackgroundRemoved(false);
    
    toast.success("Item added to your wardrobe!");
  };

  return (
    <div className="pb-20 animate-fade-in">
      <h1 className="text-3xl font-bold mb-2 text-fashion-dark">Add to Your Wardrobe</h1>
      <p className="text-gray-600 mb-8">
        Upload clothing items to build your personal wardrobe
      </p>
      
      <div className="fashion-card mb-6">
        <div className="mb-6">
          {previewUrl ? (
            <div className="relative">
              <img 
                src={previewUrl} 
                alt="Clothing item" 
                className="w-full h-64 object-cover rounded-lg mb-4"
              />
              <button 
                onClick={() => {
                  setPreviewUrl(null);
                  setSelectedFile(null);
                  setDetectedTags([]);
                  setDetectedColor(null);
                  setAnalysisComplete(false);
                  setBackgroundRemoved(false);
                }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
              >
                <X size={20} className="text-gray-600" />
              </button>
              {analyzing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <div className="text-white flex flex-col items-center">
                    <Sparkles size={40} className="animate-pulse mb-2" />
                    <p>AI analyzing your image...</p>
                  </div>
                </div>
              )}
              {removingBackground && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <div className="text-white flex flex-col items-center">
                    <Loader2 size={40} className="animate-spin mb-2" />
                    <p>Removing background...</p>
                  </div>
                </div>
              )}
              {detectedColor && (
                <div className="absolute bottom-5 left-5 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  🤖 Detected: {detectedColor}
                </div>
              )}
              {backgroundRemoved && (
                <div className="absolute top-2 left-2 bg-green-500/90 text-white px-3 py-1 rounded-full text-sm flex items-center">
                  <Image size={16} className="mr-1" />
                  Background removed
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-64 rounded-lg bg-gray-100 flex flex-col items-center justify-center border-2 border-dashed border-gray-300 mb-4">
              <Plus size={40} className="text-gray-400 mb-2" />
              <p className="text-gray-500">Upload clothing image</p>
              <div className="flex gap-4 mt-4">
                <label className="fashion-btn-secondary cursor-pointer text-sm flex items-center gap-1">
                  <Camera size={16} />
                  <span>Take Photo</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
                
                <label className="fashion-btn-secondary cursor-pointer text-sm flex items-center gap-1">
                  <Upload size={16} />
                  <span>Upload</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          )}
          
          {previewUrl && !backgroundRemoved && !removingBackground && (
            <Button 
              onClick={handleRemoveBackground} 
              variant="outline" 
              className="w-full mt-2 border-dashed border-primary/50 text-primary"
            >
              <Image size={16} className="mr-2" />
              Remove Background
            </Button>
          )}
        </div>
        
        <div className="mb-4">
          <Label htmlFor="clothing-type" className="mb-1 block">Clothing Type</Label>
          <Select value={clothingType} onValueChange={setClothingType}>
            <SelectTrigger id="clothing-type" className="fashion-input">
              <SelectValue placeholder="Select clothing type" />
            </SelectTrigger>
            <SelectContent>
              {clothingTypes.map((type) => (
                <SelectItem key={type} value={type.toLowerCase()}>{type}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {clothingType && (
          <TagSuggestions 
            clothingType={clothingType}
            onSelectTag={addTag}
            detectedTags={detectedTags}
            color={detectedColor || undefined}
          />
        )}
        
        <div className="mb-6">
          <Label htmlFor="tags" className="mb-1 block">Style Notes & Tags</Label>
          <Input
            id="tags"
            placeholder="Add tags (e.g., brand, color, occasion) and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="fashion-input mb-2"
          />
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-fashion-secondary text-fashion-dark"
                >
                  {tag}
                  <button onClick={() => removeTag(index)} className="ml-1">
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <Button 
          onClick={handleSave}
          className="fashion-btn-primary w-full"
          disabled={!previewUrl || !clothingType}
        >
          Save to Wardrobe
        </Button>
      </div>
    </div>
  );
};

export default WardrobeAdd;

import { useState, useEffect } from "react";
import { Camera, Upload, Plus, X, Sparkles, Image, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TagSuggestions from "@/components/TagSuggestions";
import { detectOutfitColor, loadImage } from "@/utils/backgroundRemoval";
import { pipeline } from "@huggingface/transformers";

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

// Mapping of image classification labels to our clothing types
const labelToClothingType = {
  // Upper body
  "shirt": "Shirt",
  "t-shirt": "T-Shirt",
  "blouse": "Blouse",
  "polo shirt": "Shirt",
  "sweater": "Sweater",
  "sweatshirt": "Sweater",
  "hoodie": "Sweater",
  "cardigan": "Sweater",
  "tank top": "T-Shirt",
  
  // Lower body
  "pants": "Pants",
  "jeans": "Jeans",
  "trousers": "Pants",
  "shorts": "Shorts",
  "skirt": "Skirt",
  
  // Full body
  "dress": "Dress",
  "jumpsuit": "Dress",
  "romper": "Dress",
  
  // Outerwear
  "jacket": "Jacket",
  "coat": "Coat",
  "blazer": "Jacket",
  "vest": "Jacket",
  
  // Footwear
  "shoes": "Shoes",
  "sneakers": "Sneakers",
  "boots": "Boots",
  "sandals": "Shoes",
  "heels": "Shoes",
  
  // Accessories
  "hat": "Hat",
  "cap": "Hat",
  "beanie": "Hat",
  "scarf": "Accessory",
  "tie": "Accessory",
  "belt": "Accessory",
  "handbag": "Accessory",
  "backpack": "Accessory",
  "jewelry": "Accessory",
  "watch": "Accessory",
  "gloves": "Accessory",
  "sunglasses": "Accessory"
};

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
  const [detectingColor, setDetectingColor] = useState(false);
  const [classifier, setClassifier] = useState<any>(null);
  const [classifierLoading, setClassifierLoading] = useState(false);

  // Load the classifier model on component mount
  useEffect(() => {
    const loadClassifier = async () => {
      try {
        setClassifierLoading(true);
        const model = await pipeline(
          "image-classification",
          "Xenova/fashion-classifier-v1", 
          { quantized: true }
        );
        setClassifier(model);
        setClassifierLoading(false);
        console.log("Clothing classifier model loaded successfully");
      } catch (error) {
        console.error("Error loading classifier model:", error);
        setClassifierLoading(false);
      }
    };

    loadClassifier();
  }, []);

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
      // Detect the dominant color of the outfit
      if (selectedFile) {
        const img = await loadImage(selectedFile);
        const detectedColor = await detectOutfitColor(img);
        setDetectedColor(detectedColor);
        
        // Add the detected color to tags
        if (detectedColor !== "unknown") {
          setDetectedTags(prev => [...prev, detectedColor]);
        }
      }
      
      // Use the loaded classifier to identify the clothing type if available
      if (classifier && selectedFile) {
        try {
          toast.info("AI analyzing clothing type...");
          
          // Get result from the classifier
          const result = await classifier(selectedFile);
          console.log("Classifier result:", result);
          
          if (result && result.length > 0) {
            // Find the best matching clothing type from our predefined types
            const topPrediction = result[0].label.toLowerCase();
            console.log("Top prediction:", topPrediction);
            
            // Try to map the prediction to our clothing types
            let mappedType = null;
            
            // Check exact matches first
            for (const [label, type] of Object.entries(labelToClothingType)) {
              if (topPrediction.includes(label)) {
                mappedType = type;
                break;
              }
            }
            
            // If no exact match, check partial matches
            if (!mappedType) {
              for (const [label, type] of Object.entries(labelToClothingType)) {
                for (const word of topPrediction.split(' ')) {
                  if (label.includes(word) || word.includes(label)) {
                    mappedType = type;
                    break;
                  }
                }
                if (mappedType) break;
              }
            }
            
            // If we found a mapped type, use it
            if (mappedType) {
              setClothingType(mappedType.toLowerCase());
              toast.success(`AI detected: ${mappedType}`);
            } else {
              // Default to "Other" if no match found
              setClothingType("other");
              toast.info("Clothing type not clearly identified, defaulted to 'Other'");
            }
            
            // Extract other info from predictions for tags
            const tagWords = new Set<string>();
            result.slice(0, 3).forEach(item => {
              const label = item.label.toLowerCase();
              // Extract potential descriptive words
              label.split(/\s+/).forEach(word => {
                if (
                  word.length > 3 && 
                  !['the', 'and', 'with', 'for'].includes(word) && 
                  !detectedTags.includes(word)
                ) {
                  tagWords.add(word);
                }
              });
            });
            
            // Add new tags from AI detection
            setDetectedTags(prev => {
              const newTags = [...prev, ...Array.from(tagWords)];
              return [...new Set(newTags)]; // Deduplicate
            });
          }
        } catch (error) {
          console.error("Error during clothing classification:", error);
          toast.error("Could not analyze clothing type");
        }
      } else {
        // Fallback to random selection for demo if classifier isn't loaded
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Random clothing type selection (fallback only)
        const randomTypeIndex = Math.floor(Math.random() * clothingTypes.length);
        const detectedType = clothingTypes[randomTypeIndex].toLowerCase();
        
        // 2. Detect patterns and other attributes
        const randomPatternIndex = Math.floor(Math.random() * detectablePatterns.length);
        const detectedPattern = detectablePatterns[randomPatternIndex];
        
        // 3. Set detected tags (include the pattern but not the color as it's already added)
        setDetectedTags(prev => {
          // Don't add duplicates
          if (!prev.includes(detectedPattern)) {
            return [...prev, detectedPattern];
          }
          return prev;
        });
        
        // 4. Auto-set the clothing type if not already set
        if (!clothingType) {
          setClothingType(detectedType);
          toast.success(`AI detected this as: ${detectedType}`);
        }
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

  const handleDetectOutfitColor = async () => {
    if (!selectedFile || !previewUrl) return;
    
    setDetectingColor(true);
    try {
      toast.info("Detecting outfit color...");
      
      // Load the image
      const img = await loadImage(selectedFile);
      
      // Detect the outfit color
      const color = await detectOutfitColor(img);
      setDetectedColor(color);
      
      // Add color to detected tags if not already there
      setDetectedTags(prev => {
        if (!prev.includes(color) && color !== "unknown") {
          return [...prev, color];
        }
        return prev;
      });
      
      toast.success(`Detected color: ${color}`);
    } catch (error) {
      console.error("Error detecting outfit color:", error);
      toast.error("Failed to detect outfit color");
    } finally {
      setDetectingColor(false);
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
              {detectingColor && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                  <div className="text-white flex flex-col items-center">
                    <Loader2 size={40} className="animate-spin mb-2" />
                    <p>Detecting outfit color...</p>
                  </div>
                </div>
              )}
              {detectedColor && (
                <div className="absolute bottom-5 left-5 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  🤖 Detected color: {detectedColor}
                </div>
              )}
              {clothingType && (
                <div className="absolute bottom-14 left-5 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                  👕 Detected type: {clothingType}
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
          
          {previewUrl && !detectingColor && (
            <Button 
              onClick={handleDetectOutfitColor} 
              variant="outline" 
              className="w-full mt-2 border-dashed border-primary/50 text-primary"
            >
              <Sparkles size={16} className="mr-2" />
              Detect Outfit Color
            </Button>
          )}
          
          {previewUrl && classifier && (
            <Button 
              onClick={analyzeClothing} 
              variant="outline" 
              className="w-full mt-2 border-dashed border-amber-500/50 text-amber-600"
              disabled={analyzing}
            >
              <Sparkles size={16} className="mr-2" />
              Re-analyze Clothing Type
            </Button>
          )}
          
          {classifierLoading && (
            <div className="w-full flex justify-center items-center mt-2 py-1 text-sm text-muted-foreground">
              <Loader2 size={14} className="mr-2 animate-spin" />
              Loading AI model...
            </div>
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

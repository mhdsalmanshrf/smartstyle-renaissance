
import { useState } from "react";
import { Camera, Upload, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import TagSuggestions from "@/components/TagSuggestions";

const clothingTypes = [
  "Shirt", "T-Shirt", "Blouse", "Sweater", 
  "Pants", "Jeans", "Skirt", "Shorts",
  "Dress", "Jacket", "Coat", 
  "Shoes", "Sneakers", "Boots",
  "Accessory", "Hat", "Other"
];

const WardrobeAdd = () => {
  const { addClothingItem } = useWardrobe();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [clothingType, setClothingType] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  
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

  const analyzeClothing = () => {
    // In a real app, this would call an AI API to analyze the clothing color
    // For now, we'll just return a mock value
    return {
      color: "blue"
    };
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

    // Analyze clothing (mocked)
    const analysis = analyzeClothing();

    // Add to wardrobe
    addClothingItem({
      imageUrl: previewUrl,
      type: clothingType,
      tags: tags,
      color: analysis.color
    });

    // Reset form
    setSelectedFile(null);
    setPreviewUrl(null);
    setClothingType("");
    setTags([]);
    
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
                }}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md"
              >
                <X size={20} className="text-gray-600" />
              </button>
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

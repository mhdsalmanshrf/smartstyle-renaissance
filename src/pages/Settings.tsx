
import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { Camera, Upload, User, Save, ChevronLeft, Sliders, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const settingsFormSchema = z.object({
  displayName: z.string().optional(),
  region: z.string().optional(),
  preferredStyle: z.string().optional(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

const Settings = () => {
  const navigate = useNavigate();
  const { userProfile, setUserProfile } = useWardrobe();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(userProfile.selfieUrl);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultValues: Partial<SettingsFormValues> = {
    displayName: userProfile.displayName || "",
    region: userProfile.region || "",
    preferredStyle: userProfile.preferredStyle || "",
  };

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues,
  });

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

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
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

  const onSubmit = async (values: SettingsFormValues) => {
    let updatedProfile = { ...userProfile, ...values };
    
    // If a new image was selected, analyze it and update the profile
    if (previewUrl !== userProfile.selfieUrl) {
      setIsAnalyzing(true);
      try {
        const analysis = await analyzeSelfie();
        updatedProfile = {
          ...updatedProfile,
          selfieUrl: previewUrl,
          skinTone: analysis.skinTone,
          hairColor: analysis.hairColor,
          eyeColor: analysis.eyeColor
        };
      } catch (error) {
        toast.error("Error analyzing selfie. Please try again.");
        setIsAnalyzing(false);
        return;
      }
    }
    
    // Update the user profile
    setUserProfile(updatedProfile);
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="container max-w-xl mx-auto p-4 pb-16">
      <div className="flex items-center mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          className="mr-2" 
          onClick={() => navigate(-1)}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>Update your profile photo</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center">
          <div 
            className="relative cursor-pointer group"
            onClick={handleAvatarClick}
          >
            <Avatar className="h-24 w-24 border-2 border-primary">
              {previewUrl ? (
                <AvatarImage src={previewUrl} alt="Profile picture" />
              ) : (
                <AvatarFallback>
                  <User className="h-12 w-12 text-gray-400" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <Edit3 className="text-white h-8 w-8" />
            </div>
          </div>
          
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            ref={fileInputRef}
          />
          
          <div className="flex gap-4 mt-4">
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              <span>Upload</span>
            </Button>
            
            <Button 
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => {
                if (fileInputRef.current) {
                  fileInputRef.current.accept = "image/*";
                  fileInputRef.current.capture = "user";
                  fileInputRef.current.click();
                }
              }}
            >
              <Camera size={16} />
              <span>Camera</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Personal Details</CardTitle>
          <CardDescription>Update your profile information</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormDescription>
                      This is how you'll be addressed in the app
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Region</FormLabel>
                    <FormControl>
                      <Input placeholder="Your location/region" {...field} />
                    </FormControl>
                    <FormDescription>
                      Used for weather and regional style recommendations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="preferredStyle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preferred Style</FormLabel>
                    <FormControl>
                      <Input placeholder="E.g., Casual, Formal, Bohemian" {...field} />
                    </FormControl>
                    <FormDescription>
                      We'll prioritize this style in outfit recommendations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex gap-4 pt-2">
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => navigate(-1)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 gap-2"
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? (
                    "Updating..."
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;

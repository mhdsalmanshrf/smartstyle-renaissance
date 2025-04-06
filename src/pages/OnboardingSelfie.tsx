
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useWardrobe } from "@/contexts/WardrobeContext";
import { toast } from "sonner";
import { extractDominantColors } from "@/utils/backgroundRemoval";
import { Camera, Upload } from "lucide-react";
import WelcomeAuth from "@/components/auth/WelcomeAuth";

const OnboardingSelfie = () => {
  const { userProfile, setUserProfile } = useWardrobe();
  const [file, setFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    userProfile?.selfieUrl || null
  );
  const [isUploading, setIsUploading] = useState(false);
  const [showButtons, setShowButtons] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const navigate = useNavigate();
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    setIsMobile(window.innerWidth <= 768);
    return () => {
      // Clean up any camera stream when component unmounts
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, []);

  const handleCapture = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;

    if (video && canvas && streamRef.current) {
      const context = canvas.getContext("2d");
      if (!context) return;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw the video frame to the canvas
      context.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert canvas to file
      canvas.toBlob(async (blob) => {
        if (blob) {
          const selfieFile = new File([blob], "selfie.png", {
            type: "image/png",
          });
          setFile(selfieFile);
          const imageUrl = URL.createObjectURL(blob);
          setImagePreview(imageUrl);
          setShowButtons(false);
          setIsCameraActive(false);

          // Stop all video tracks
          streamRef.current?.getTracks().forEach((track) => {
            track.stop();
          });
          streamRef.current = null;

          // Process the selfie
          processImage(imageUrl);
        }
      }, "image/png");
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const selectedFile = files[0];
      setFile(selectedFile);
      const imageUrl = URL.createObjectURL(selectedFile);
      setImagePreview(imageUrl);
      setShowButtons(false);

      // Process the selfie
      processImage(imageUrl);
    }
    // Clear the input for future uploads
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
      });
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast.error("Could not access camera. Please check permissions.");
    }
  };

  const processImage = async (imageUrl: string) => {
    setIsUploading(true);
    try {
      const { skinTone, hairColor, eyeColor } = await extractDominantColors(
        imageUrl
      );

      setUserProfile((prev) => ({
        ...prev,
        selfieUrl: imageUrl,
        skinTone,
        hairColor,
        eyeColor,
      }));

      toast.success(
        "Selfie uploaded! We've analyzed your features and will suggest outfits that complement your look."
      );
      
      setTimeout(() => {
        navigate("/outfit");
      }, 1500);
    } catch (error) {
      console.error("Error processing selfie:", error);
      toast.error("Error analyzing selfie. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRetake = () => {
    setImagePreview(null);
    setFile(null);
    setShowButtons(true);
  };

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <WelcomeAuth />
      
      <Card className="p-6 mb-8">
        <div className="flex flex-col items-center text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">Outfit Intelligence</h1>
          <p className="text-gray-600 mb-2">
            Upload a selfie so we can analyze your features and suggest outfits
            that complement your complexion.
          </p>
          <p className="text-gray-500 text-sm">
            Your selfie is only used for color analysis and is never shared.
          </p>
        </div>

        <div className="mb-6">
          {isCameraActive && (
            <div className="relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-auto rounded-lg"
              />
              <Button
                onClick={handleCapture}
                className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-8 py-6"
              >
                <Camera className="mr-2 h-5 w-5" />
                Take Photo
              </Button>
            </div>
          )}

          {imagePreview && !isCameraActive && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Selfie preview"
                className="w-full h-auto mx-auto rounded-lg"
              />
              {isUploading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-lg">
                  <div className="text-white text-center">
                    <div className="loader mb-2"></div>
                    <p>Analyzing features...</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <canvas
            ref={canvasRef}
            style={{ display: "none" }}
            width={640}
            height={480}
          />
        </div>

        {showButtons && !isCameraActive && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => fileInputRef.current?.click()}
              variant="outline"
              className="flex-1 flex items-center"
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Selfie
            </Button>
            
            {!isMobile && (
              <Button onClick={startCamera} className="flex-1 flex items-center">
                <Camera className="mr-2 h-4 w-4" />
                Take a Photo
              </Button>
            )}
          </div>
        )}

        {imagePreview && !isCameraActive && !isUploading && (
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <Button
              onClick={handleRetake}
              variant="outline"
              className="flex-1"
              disabled={isUploading}
            >
              Retake Photo
            </Button>
            <Button
              onClick={() => navigate("/outfit")}
              className="flex-1 fashion-btn-primary"
              disabled={isUploading}
            >
              Continue to Outfits
            </Button>
          </div>
        )}

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </Card>

      <div className="text-center text-sm text-gray-500">
        <p>
          By using this service, you agree to our{" "}
          <a href="#" className="underline">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};

export default OnboardingSelfie;

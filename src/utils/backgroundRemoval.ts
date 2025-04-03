
import { pipeline, env } from '@huggingface/transformers';

// Configure transformers.js to always download models
env.allowLocalModels = false;
env.useBrowserCache = false;

const MAX_IMAGE_DIMENSION = 1024;

function resizeImageIfNeeded(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, image: HTMLImageElement) {
  let width = image.naturalWidth;
  let height = image.naturalHeight;

  if (width > MAX_IMAGE_DIMENSION || height > MAX_IMAGE_DIMENSION) {
    if (width > height) {
      height = Math.round((height * MAX_IMAGE_DIMENSION) / width);
      width = MAX_IMAGE_DIMENSION;
    } else {
      width = Math.round((width * MAX_IMAGE_DIMENSION) / height);
      height = MAX_IMAGE_DIMENSION;
    }

    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(image, 0, 0, width, height);
    return true;
  }

  canvas.width = width;
  canvas.height = height;
  ctx.drawImage(image, 0, 0);
  return false;
}

// Enhanced color detection algorithm with better handling of whites and grays
export const detectOutfitColor = async (imageElement: HTMLImageElement): Promise<string> => {
  try {
    console.log('Starting outfit color detection...');
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data from canvas
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    
    // Improved color detection using more precise thresholds and weighted counting
    const colorCounts: Record<string, number> = {
      red: 0,
      green: 0,
      blue: 0,
      yellow: 0,
      purple: 0,
      pink: 0,
      orange: 0,
      brown: 0,
      black: 0,
      white: 0,
      gray: 0,
      navy: 0,
      teal: 0,
      maroon: 0,
      beige: 0
    };
    
    let totalPixels = 0;
    let backgroundPixels = 0;
    
    // First pass: Count potential background pixels (edges of the image) 
    // to better identify what to exclude
    const edgePixels: Array<{r: number, g: number, b: number}> = [];
    const sampleSize = 100; // Number of edge pixels to sample
    
    // Sample top edge
    for (let x = 0; x < canvas.width; x += Math.max(1, Math.floor(canvas.width / sampleSize))) {
      const i = (x * 4);
      if (i < data.length) {
        edgePixels.push({r: data[i], g: data[i+1], b: data[i+2]});
      }
    }
    
    // Sample bottom edge
    const bottomRow = (canvas.height - 1) * canvas.width * 4;
    for (let x = 0; x < canvas.width; x += Math.max(1, Math.floor(canvas.width / sampleSize))) {
      const i = bottomRow + (x * 4);
      if (i < data.length) {
        edgePixels.push({r: data[i], g: data[i+1], b: data[i+2]});
      }
    }
    
    // Sample left and right edges
    for (let y = 0; y < canvas.height; y += Math.max(1, Math.floor(canvas.height / sampleSize))) {
      // Left edge
      const leftI = (y * canvas.width * 4);
      if (leftI < data.length) {
        edgePixels.push({r: data[leftI], g: data[leftI+1], b: data[leftI+2]});
      }
      
      // Right edge
      const rightI = (y * canvas.width + canvas.width - 1) * 4;
      if (rightI < data.length) {
        edgePixels.push({r: data[rightI], g: data[rightI+1], b: data[rightI+2]});
      }
    }
    
    // Identify likely background color
    const isBackgroundPixel = (r: number, g: number, b: number): boolean => {
      // Check if this pixel is similar to edge pixels (likely background)
      for (const edgePixel of edgePixels) {
        const colorDistance = Math.sqrt(
          (r - edgePixel.r) ** 2 + 
          (g - edgePixel.g) ** 2 + 
          (b - edgePixel.b) ** 2
        );
        if (colorDistance < 30) return true; // Threshold for similarity
      }
      return false;
    };
    
    // Main color detection - sample pixels with improved strategy
    // Analyze more pixels in the central area of the image (where the outfit is likely to be)
    const centerXStart = Math.floor(canvas.width * 0.2);
    const centerXEnd = Math.floor(canvas.width * 0.8);
    const centerYStart = Math.floor(canvas.height * 0.2);
    const centerYEnd = Math.floor(canvas.height * 0.8);
    
    // Sample more densely in center, less on edges
    const stride = 8; // Sample every 8th pixel
    const centerStride = 4; // Sample more densely in the center
    
    for (let y = 0; y < canvas.height; y += (y >= centerYStart && y <= centerYEnd ? centerStride : stride)) {
      for (let x = 0; x < canvas.width; x += (x >= centerXStart && x <= centerXEnd ? centerStride : stride)) {
        const i = (y * canvas.width + x) * 4;
        
        if (i >= data.length) continue;
        
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const a = data[i + 3];
        
        // Skip fully transparent or nearly transparent pixels
        if (a < 128) continue;
        
        // Skip pixels that match the background pattern
        if (isBackgroundPixel(r, g, b)) {
          backgroundPixels++;
          continue;
        }
        
        totalPixels++;
        
        // Improved white and gray detection - more precise
        // For very light colors (potential whites)
        if (r > 220 && g > 220 && b > 220) {
          // Pure white has r,g,b all very close to 255
          const maxColorDiff = Math.max(
            Math.abs(r - g),
            Math.abs(r - b),
            Math.abs(g - b)
          );
          
          // If all channels are very close, it's white
          if (maxColorDiff < 10) {
            colorCounts.white += 1;
            continue;
          }
          
          // If there's a slight color tint, categorize accordingly
          if (r > g + 10 && r > b + 10) {
            colorCounts.pink += 0.5;
          } else if (g > r + 10 && g > b + 10) {
            colorCounts.green += 0.5;
          } else if (b > r + 10 && b > g + 10) {
            colorCounts.blue += 0.5;
          } else {
            // Still mostly white but with a very slight tint
            colorCounts.white += 0.75;
          }
          continue;
        }
        
        // Improved gray detection
        if (r > 60 && r < 220 && g > 60 && g < 220 && b > 60 && b < 220) {
          const maxDiff = Math.max(
            Math.abs(r - g),
            Math.abs(r - b),
            Math.abs(g - b)
          );
          
          if (maxDiff < 20) {
            // True gray
            colorCounts.gray += 1;
            continue;
          }
        }
        
        // Enhanced color classification for more accurate detection
        
        // Red detection - improved
        if (r > 180 && r > g * 1.5 && r > b * 1.5) {
          colorCounts.red += 2;
        }
        // Green detection - improved
        else if (g > 120 && g > r * 1.2 && g > b * 1.2) {
          colorCounts.green += 2;
        }
        // Blue detection - improved
        else if (b > 150 && b > r * 1.2 && b > g * 1.2) {
          colorCounts.blue += 2;
        }
        // Yellow detection - improved
        else if (r > 180 && g > 180 && r + g > b * 3) {
          colorCounts.yellow += 2;
        }
        // Purple detection - improved
        else if (r > 100 && b > 150 && r + b > g * 2.5) {
          colorCounts.purple += 2;
        }
        // Pink detection - improved
        else if (r > 180 && b > 140 && r + b > g * 2) {
          colorCounts.pink += 2;
        }
        // Orange detection - improved
        else if (r > 180 && g > 100 && g < 180 && r > b * 2) {
          colorCounts.orange += 2;
        }
        // Brown detection - improved
        else if (r > 100 && r < 200 && g > 50 && g < 150 && b < 100) {
          colorCounts.brown += 1.5;
        }
        // Black detection (very dark colors)
        else if (r < 60 && g < 60 && b < 60) {
          colorCounts.black += 1.5;
        }
        // Navy detection - improved
        else if (r < 80 && g < 100 && b > 80 && b < 200) {
          colorCounts.navy += 1.5;
        }
        // Teal detection
        else if (r < 100 && g > 100 && g < 200 && b > 100 && b < 200) {
          colorCounts.teal += 1.5;
        }
        // Maroon detection
        else if (r > 120 && r < 180 && g < 80 && b < 80) {
          colorCounts.maroon += 1.5;
        }
        // Beige detection - improved
        else if (r > 180 && g > 160 && b > 120 && b < r && b < g) {
          colorCounts.beige += 1.5;
        }
        else {
          // For non-matched colors, find the closest match
          const distances = {
            red: Math.sqrt((r - 255) ** 2 + g ** 2 + b ** 2),
            green: Math.sqrt(r ** 2 + (g - 255) ** 2 + b ** 2),
            blue: Math.sqrt(r ** 2 + g ** 2 + (b - 255) ** 2),
            yellow: Math.sqrt((r - 255) ** 2 + (g - 255) ** 2 + b ** 2),
            purple: Math.sqrt((r - 128) ** 2 + g ** 2 + (b - 255) ** 2),
            pink: Math.sqrt((r - 255) ** 2 + (g - 192) ** 2 + (b - 203) ** 2),
            orange: Math.sqrt((r - 255) ** 2 + (g - 165) ** 2 + b ** 2),
            brown: Math.sqrt((r - 165) ** 2 + (g - 42) ** 2 + (b - 42) ** 2),
            black: Math.sqrt(r ** 2 + g ** 2 + b ** 2),
            white: Math.sqrt((r - 255) ** 2 + (g - 255) ** 2 + (b - 255) ** 2),
            gray: Math.sqrt((r - 128) ** 2 + (g - 128) ** 2 + (b - 128) ** 2),
            navy: Math.sqrt((r - 0) ** 2 + (g - 0) ** 2 + (b - 128) ** 2),
            teal: Math.sqrt((r - 0) ** 2 + (g - 128) ** 2 + (b - 128) ** 2),
            maroon: Math.sqrt((r - 128) ** 2 + (g - 0) ** 2 + (b - 0) ** 2),
            beige: Math.sqrt((r - 245) ** 2 + (g - 245) ** 2 + (b - 220) ** 2)
          };
          
          // Find the color with minimum distance
          let minDistance = Infinity;
          let closestColor = "unknown";
          
          for (const [color, distance] of Object.entries(distances)) {
            if (distance < minDistance) {
              minDistance = distance;
              closestColor = color;
            }
          }
          
          colorCounts[closestColor] += 0.5; // Add with lower weight
        }
      }
    }
    
    console.log(`Background pixels identified: ${backgroundPixels}`);
    
    // Don't return a result if we didn't analyze enough pixels
    if (totalPixels < 50) {
      console.log('Not enough pixels analyzed');
      return "unknown";
    }
    
    // Log color percentages for debugging
    for (const [color, count] of Object.entries(colorCounts)) {
      console.log(`Color ${color}: ${count} (${Math.round(count / totalPixels * 100)}%)`);
    }
    
    // Apply a correction factor to reduce false white/gray detections
    // If the image has a lot of white pixels, adjust the threshold to require more white pixels to be classified as white
    const whiteCorrectionFactor = colorCounts.white > totalPixels * 0.3 ? 1.5 : 1;
    const grayCorrectionFactor = colorCounts.gray > totalPixels * 0.3 ? 1.5 : 1;
    
    colorCounts.white = colorCounts.white / whiteCorrectionFactor;
    colorCounts.gray = colorCounts.gray / grayCorrectionFactor;
    
    // Find the dominant color with higher confidence
    let dominantColor = "unknown";
    let maxCount = 0;
    
    for (const [color, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
    }
    
    // Special handling for white vs other colors
    // White needs higher threshold to be considered dominant
    if (dominantColor === "white") {
      // Check if there's another color that's close in count
      for (const [color, count] of Object.entries(colorCounts)) {
        if (color !== "white" && color !== "gray" && count > maxCount * 0.7) {
          // If another color is at least 70% as common as white, prefer the other color
          dominantColor = color;
          break;
        }
      }
    }
    
    // Require a minimum threshold to avoid misclassification
    // At least 10% of pixels should match the color
    if (maxCount / totalPixels < 0.1) {
      console.log('No dominant color found above threshold');
      // Try to find a color with at least 5% presence
      for (const [color, count] of Object.entries(colorCounts)) {
        if (count / totalPixels > 0.05 && color !== "white" && color !== "gray") {
          console.log(`Using secondary color: ${color}`);
          return color;
        }
      }
      
      // Fallback to black/white/gray if no other color is dominant
      if (colorCounts.black > totalPixels * 0.05) return "black";
      if (colorCounts.white > totalPixels * 0.05) return "white";
      if (colorCounts.gray > totalPixels * 0.05) return "gray";
      return "unknown";
    }
    
    console.log('Detected dominant color:', dominantColor);
    return dominantColor;
  } catch (error) {
    console.error('Error detecting outfit color:', error);
    return "unknown";
  }
};

export const removeBackground = async (imageElement: HTMLImageElement): Promise<Blob> => {
  try {
    console.log('Starting background removal process...');
    const segmenter = await pipeline('image-segmentation', 'Xenova/segformer-b0-finetuned-ade-512-512', {
      device: 'webgpu',
    });
    
    // Convert HTMLImageElement to canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    if (!ctx) throw new Error('Could not get canvas context');
    
    // Resize image if needed and draw it to canvas
    const wasResized = resizeImageIfNeeded(canvas, ctx, imageElement);
    console.log(`Image ${wasResized ? 'was' : 'was not'} resized. Final dimensions: ${canvas.width}x${canvas.height}`);
    
    // Get image data as base64
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    console.log('Image converted to base64');
    
    // Process the image with the segmentation model
    console.log('Processing with segmentation model...');
    const result = await segmenter(imageData);
    
    console.log('Segmentation result:', result);
    
    if (!result || !Array.isArray(result) || result.length === 0 || !result[0].mask) {
      throw new Error('Invalid segmentation result');
    }
    
    // Create a new canvas for the masked image
    const outputCanvas = document.createElement('canvas');
    outputCanvas.width = canvas.width;
    outputCanvas.height = canvas.height;
    const outputCtx = outputCanvas.getContext('2d');
    
    if (!outputCtx) throw new Error('Could not get output canvas context');
    
    // Draw original image
    outputCtx.drawImage(canvas, 0, 0);
    
    // Apply the mask
    const outputImageData = outputCtx.getImageData(
      0, 0,
      outputCanvas.width,
      outputCanvas.height
    );
    const data = outputImageData.data;
    
    // Apply inverted mask to alpha channel
    for (let i = 0; i < result[0].mask.data.length; i++) {
      // Invert the mask value (1 - value) to keep the subject instead of the background
      const alpha = Math.round((1 - result[0].mask.data[i]) * 255);
      data[i * 4 + 3] = alpha;
    }
    
    outputCtx.putImageData(outputImageData, 0, 0);
    console.log('Mask applied successfully');
    
    // Convert canvas to blob
    return new Promise((resolve, reject) => {
      outputCanvas.toBlob(
        (blob) => {
          if (blob) {
            console.log('Successfully created final blob');
            resolve(blob);
          } else {
            reject(new Error('Failed to create blob'));
          }
        },
        'image/png',
        1.0
      );
    });
  } catch (error) {
    console.error('Error removing background:', error);
    throw error;
  }
};

export const loadImage = (file: Blob): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
};

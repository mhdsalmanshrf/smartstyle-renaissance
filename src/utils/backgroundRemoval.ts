
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

// Improved color detection algorithm
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
    
    // Sample every 4th pixel to improve performance while maintaining accuracy
    for (let i = 0; i < data.length; i += 16) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      
      // Skip fully transparent or nearly transparent pixels
      if (a < 128) continue;
      
      // Skip pixels that are likely background (very light or very dark)
      if ((r > 240 && g > 240 && b > 240) || (r < 15 && g < 15 && b < 15)) continue;
      
      totalPixels++;
      
      // Improved color classification with more precise thresholds
      // Red detection
      if (r > 180 && g < 100 && b < 100) {
        colorCounts.red += 2; // Give more weight to vivid colors
      }
      // Green detection
      else if (r < 100 && g > 150 && b < 100) {
        colorCounts.green += 2;
      }
      // Blue detection
      else if (r < 100 && g < 120 && b > 150) {
        colorCounts.blue += 2;
      }
      // Yellow detection
      else if (r > 180 && g > 180 && b < 100) {
        colorCounts.yellow += 2;
      }
      // Purple detection
      else if (r > 100 && r < 180 && g < 100 && b > 150) {
        colorCounts.purple += 2;
      }
      // Pink detection
      else if (r > 180 && g < 150 && b > 150) {
        colorCounts.pink += 2;
      }
      // Orange detection
      else if (r > 180 && g > 100 && g < 180 && b < 100) {
        colorCounts.orange += 2;
      }
      // Brown detection
      else if (r > 100 && r < 180 && g > 50 && g < 140 && b < 100) {
        colorCounts.brown += 1.5;
      }
      // Black detection (very dark colors)
      else if (r < 50 && g < 50 && b < 50) {
        colorCounts.black += 1;
      }
      // White detection (very light colors, but not pure white)
      else if (r > 200 && g > 200 && b > 200) {
        colorCounts.white += 1;
      }
      // Gray detection
      else if (r > 80 && r < 200 && g > 80 && g < 200 && b > 80 && b < 200 && 
              Math.abs(r - g) < 30 && Math.abs(r - b) < 30 && Math.abs(g - b) < 30) {
        colorCounts.gray += 1;
      }
      // Navy detection
      else if (r < 80 && g < 100 && b > 100 && b < 180) {
        colorCounts.navy += 1.5;
      }
      // Teal detection
      else if (r < 80 && g > 100 && g < 180 && b > 100 && b < 180) {
        colorCounts.teal += 1.5;
      }
      // Maroon detection
      else if (r > 120 && r < 180 && g < 80 && b < 80) {
        colorCounts.maroon += 1.5;
      }
      // Beige detection
      else if (r > 180 && g > 160 && b > 120 && b < 180) {
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
    
    // Don't return a result if we didn't analyze enough pixels
    if (totalPixels < 50) {
      console.log('Not enough pixels analyzed');
      return "unknown";
    }
    
    // Find the dominant color with higher confidence
    let dominantColor = "unknown";
    let maxCount = 0;
    
    for (const [color, count] of Object.entries(colorCounts)) {
      console.log(`Color ${color}: ${count} (${Math.round(count / totalPixels * 100)}%)`);
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
    }
    
    // Require a minimum threshold to avoid misclassification
    // At least 10% of pixels should match the color
    if (maxCount / totalPixels < 0.1) {
      console.log('No dominant color found above threshold');
      // Try to find white/black/gray as fallback
      if (colorCounts.white > totalPixels * 0.05) return "white";
      if (colorCounts.black > totalPixels * 0.05) return "black";
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

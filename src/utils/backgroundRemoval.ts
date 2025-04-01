
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

// New function to detect the dominant color in an image
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
    
    // Simple color detection algorithm
    // Count occurrences of basic colors
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
    
    // Analyze pixels to detect dominant colors (simplified approach)
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Skip transparent pixels
      if (data[i + 3] < 128) continue;
      
      // Simple color classification
      if (r > 200 && g < 50 && b < 50) colorCounts.red++;
      else if (r < 50 && g > 150 && b < 50) colorCounts.green++;
      else if (r < 50 && g < 50 && b > 150) colorCounts.blue++;
      else if (r > 200 && g > 200 && b < 50) colorCounts.yellow++;
      else if (r > 150 && g < 100 && b > 150) colorCounts.purple++;
      else if (r > 200 && g < 150 && b > 150) colorCounts.pink++;
      else if (r > 200 && g > 100 && b < 50) colorCounts.orange++;
      else if (r > 100 && r < 150 && g > 50 && g < 100 && b < 50) colorCounts.brown++;
      else if (r < 30 && g < 30 && b < 30) colorCounts.black++;
      else if (r > 200 && g > 200 && b > 200) colorCounts.white++;
      else if (r > 100 && r < 200 && g > 100 && g < 200 && b > 100 && b < 200 && 
              Math.abs(r - g) < 30 && Math.abs(r - b) < 30) colorCounts.gray++;
      else if (r < 50 && g < 50 && b > 80 && b < 150) colorCounts.navy++;
      else if (r < 50 && g > 100 && g < 200 && b > 100 && b < 200) colorCounts.teal++;
      else if (r > 100 && r < 150 && g < 50 && b < 50) colorCounts.maroon++;
      else if (r > 200 && g > 180 && b > 150 && b < 200) colorCounts.beige++;
    }
    
    // Find the dominant color
    let dominantColor = "unknown";
    let maxCount = 0;
    
    for (const [color, count] of Object.entries(colorCounts)) {
      if (count > maxCount) {
        maxCount = count;
        dominantColor = color;
      }
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

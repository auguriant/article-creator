
/**
 * Service for AI image generation
 */
import { toast } from "sonner";
import { OpenAIService } from "./OpenAIService";

export interface ImageGenerationParams {
  prompt: string;
  style?: 'realistic' | 'artistic' | 'abstract' | 'minimalist';
  aspectRatio?: '1:1' | '16:9' | '4:3';
}

export class ImageService {
  /**
   * Generates an image using a prompt
   * Uses OpenAI if configured, otherwise falls back to mock implementation
   */
  static async generateImage(params: ImageGenerationParams): Promise<string> {
    try {
      console.log(`Generating image with prompt: ${params.prompt}`);
      console.log(`Using style: ${params.style || 'default'}, aspect ratio: ${params.aspectRatio || '16:9'}`);
      
      const openAIService = OpenAIService.getInstance();
      
      // If OpenAI is configured, use it for image generation
      if (openAIService.isConfigured()) {
        try {
          // Enhance the prompt with style information
          let enhancedPrompt = params.prompt;
          if (params.style) {
            enhancedPrompt += `, ${params.style} style`;
          }
          
          // Determine size based on aspect ratio
          let size = "1024x1024"; // Default square
          if (params.aspectRatio === "16:9") {
            size = "1792x1024";
          } else if (params.aspectRatio === "4:3") {
            size = "1024x768";
          }
          
          return await openAIService.generateImage(enhancedPrompt, size);
        } catch (error) {
          console.error("OpenAI image generation failed, falling back to mock:", error);
          // Fall back to mock if OpenAI fails
        }
      }
      
      // Mock implementation (fallback)
      console.log("Using fallback mock image generation");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const placeholderImages = [
        'https://images.unsplash.com/photo-1677442136019-21780ecad991',
        'https://images.unsplash.com/photo-1684163016566-51d6494656bf',
        'https://images.unsplash.com/photo-1693839511447-25cf59e7a6f1',
        'https://images.unsplash.com/photo-1686201099020-2d1dd71f944b'
      ];
      
      const randomIndex = Math.floor(Math.random() * placeholderImages.length);
      const imageUrl = `${placeholderImages[randomIndex]}?w=1200&h=630&fit=crop&q=80&auto=format`;
      
      console.log(`Generated mock image URL: ${imageUrl}`);
      
      return imageUrl;
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return a default placeholder in case of error
      return 'https://placehold.co/1200x630/gray/white?text=Image+Generation+Failed';
    }
  }
}

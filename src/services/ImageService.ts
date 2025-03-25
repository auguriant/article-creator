
/**
 * Service for image generation and optimization
 */
import { toast } from "sonner";
import { OpenAIService } from "./OpenAIService";
import { FreeAIService } from "./FreeAIService";

export interface ImageGenerationParams {
  prompt: string;
  style?: 'realistic' | 'cartoon' | 'artistic';
  aspectRatio?: '1:1' | '16:9' | '4:3';
  useOpenAI?: boolean; // Flag to determine whether to use OpenAI
}

export class ImageService {
  private static placeholderImages = [
    "https://images.unsplash.com/photo-1517694712202-14dd9538aa97",
    "https://images.unsplash.com/photo-1485988412941-77a35537dae4",
    "https://images.unsplash.com/photo-1664652629303-bbd99cf28e50",
    "https://images.unsplash.com/photo-1685470616914-665859949ae9",
    "https://images.unsplash.com/photo-1587620962725-abab7fe55159",
    "https://images.unsplash.com/photo-1544731612-de7f96afe55f",
    "https://images.unsplash.com/photo-1522252234503-e356532cafd5"
  ];
  
  /**
   * Gets a free stock image based on a prompt
   */
  private static async getFreeImage(prompt: string): Promise<string> {
    try {
      console.log(`Getting free image for prompt: ${prompt}`);
      
      // For demo purposes, we'll use random Unsplash images with query params based on prompt
      const encodedPrompt = encodeURIComponent(prompt);
      const randomIndex = Math.floor(Math.random() * this.placeholderImages.length);
      const baseUrl = this.placeholderImages[randomIndex];
      
      // Add query param to make it look like we're using the prompt
      return `${baseUrl}?q=${encodedPrompt}&w=1200&fit=crop`;
    } catch (error) {
      console.error("Error getting free image:", error);
      
      // Return a fallback image
      return "/placeholder.svg";
    }
  }
  
  /**
   * Generates an image using the specified service
   * Uses OpenAI if configured and specified, otherwise uses free image service
   */
  static async generateImage(params: ImageGenerationParams): Promise<string> {
    try {
      console.log(`Generating image with prompt: ${params.prompt}`);
      
      const openAIService = OpenAIService.getInstance();
      
      // Determine size based on aspect ratio
      let size = "1024x1024";
      if (params.aspectRatio === "16:9") {
        size = "1792x1024";
      } else if (params.aspectRatio === "4:3") {
        size = "1024x768";
      }
      
      // Use OpenAI if it's configured AND explicitly requested
      if (openAIService.isConfigured() && params.useOpenAI) {
        console.log("Using OpenAI for image generation");
        try {
          return await openAIService.generateImage(params.prompt, size);
        } catch (error) {
          console.error("OpenAI image generation failed, falling back to free service:", error);
          toast.error("OpenAI service failed, falling back to free service");
          // Fall back to free service if OpenAI fails
        }
      }
      
      // Use free image service in all other cases (default)
      console.log("Using free image service");
      return await this.getFreeImage(params.prompt);
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return a placeholder image in case of error
      return "/placeholder.svg";
    }
  }
}


/**
 * Service for OpenAI API integration
 */
import { toast } from "sonner";

export interface OpenAIConfig {
  apiKey: string;
  imageModel: string;
  textModel: string;
  temperature: number;
}

export class OpenAIService {
  private static instance: OpenAIService;
  private apiKey: string | null = null;
  private imageModel: string = "dall-e-3";
  private textModel: string = "gpt-4o";
  private temperature: number = 0.7;
  
  private constructor() {
    // Try to load API key from localStorage
    this.apiKey = localStorage.getItem('openai_api_key');
    
    // Load other settings
    const imageModel = localStorage.getItem('openai_image_model');
    if (imageModel) this.imageModel = imageModel;
    
    const textModel = localStorage.getItem('openai_text_model');
    if (textModel) this.textModel = textModel;
    
    const temperature = localStorage.getItem('openai_temperature');
    if (temperature) this.temperature = parseFloat(temperature);
  }
  
  public static getInstance(): OpenAIService {
    if (!OpenAIService.instance) {
      OpenAIService.instance = new OpenAIService();
    }
    return OpenAIService.instance;
  }
  
  /**
   * Updates the OpenAI API configuration
   */
  public updateConfig(config: Partial<OpenAIConfig>): void {
    if (config.apiKey) {
      this.apiKey = config.apiKey;
      localStorage.setItem('openai_api_key', config.apiKey);
    }
    
    if (config.imageModel) {
      this.imageModel = config.imageModel;
      localStorage.setItem('openai_image_model', config.imageModel);
    }
    
    if (config.textModel) {
      this.textModel = config.textModel;
      localStorage.setItem('openai_text_model', config.textModel);
    }
    
    if (config.temperature !== undefined) {
      this.temperature = config.temperature;
      localStorage.setItem('openai_temperature', config.temperature.toString());
    }
    
    console.log("OpenAI configuration updated:", {
      apiKey: this.apiKey ? "Set" : "Not set",
      imageModel: this.imageModel,
      textModel: this.textModel,
      temperature: this.temperature
    });
  }
  
  /**
   * Checks if the OpenAI API key is configured
   */
  public isConfigured(): boolean {
    return !!this.apiKey;
  }
  
  /**
   * Gets the current OpenAI configuration
   */
  public getConfig(): Omit<OpenAIConfig, 'apiKey'> & { apiKeySet: boolean } {
    return {
      apiKeySet: !!this.apiKey,
      imageModel: this.imageModel,
      textModel: this.textModel,
      temperature: this.temperature
    };
  }
  
  /**
   * Generates an image using OpenAI
   */
  public async generateImage(prompt: string, size: string = "1024x1024"): Promise<string> {
    if (!this.apiKey) {
      toast.error("OpenAI API key not configured");
      throw new Error("OpenAI API key not configured");
    }
    
    try {
      console.log(`Generating image with prompt: "${prompt}"`);
      console.log(`Using model: ${this.imageModel}, size: ${size}`);
      
      const response = await fetch("https://api.openai.com/v1/images/generations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.imageModel,
          prompt,
          size,
          n: 1,
          response_format: "url"
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error.message}`);
      }
      
      const data = await response.json();
      const imageUrl = data.data[0].url;
      
      return imageUrl;
    } catch (error) {
      console.error("Error generating image with OpenAI:", error);
      toast.error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
  
  /**
   * Rewrites content using OpenAI
   */
  public async rewriteContent(
    title: string,
    content: string,
    source: string,
    tone: string = "professional"
  ): Promise<{ title: string; content: string }> {
    if (!this.apiKey) {
      toast.error("OpenAI API key not configured");
      throw new Error("OpenAI API key not configured");
    }
    
    try {
      console.log(`Rewriting article: "${title}"`);
      console.log(`Using model: ${this.textModel}, temperature: ${this.temperature}`);
      
      const prompt = `
You are an expert content rewriter specializing in technology news, particularly AI.
Please rewrite the following article with a ${tone} tone. 
Maintain the factual accuracy but improve the clarity and readability.
Use HTML formatting for the rewritten content.

Original Title: ${title}
Original Source: ${source}
Original Content: ${content}

Response Format:
{
  "title": "The rewritten title",
  "content": "The rewritten content in HTML format"
}
`;
      
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.textModel,
          messages: [{ role: "user", content: prompt }],
          temperature: this.temperature,
          response_format: { type: "json_object" }
        })
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(`OpenAI API error: ${error.error.message}`);
      }
      
      const data = await response.json();
      const result = JSON.parse(data.choices[0].message.content);
      
      return {
        title: result.title,
        content: result.content
      };
    } catch (error) {
      console.error("Error rewriting content with OpenAI:", error);
      toast.error(`Failed to rewrite content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      throw error;
    }
  }
}

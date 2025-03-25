
/**
 * Service for analyzing and creating content tones
 */
import { toast } from "sonner";

export interface ContentTone {
  id: string;
  name: string;
  description: string;
  keywords: string[];
  sentenceStructure: string;
  examples: string[];
}

export class ContentToneService {
  private static tones: ContentTone[] = [
    {
      id: "professional",
      name: "Professional",
      description: "Formal and business-oriented tone suitable for corporate content",
      keywords: ["effective", "solution", "implement", "strategy", "objective"],
      sentenceStructure: "Moderate length, clear structure, minimal contractions",
      examples: ["Our comprehensive solution enhances productivity by 25%."]
    },
    {
      id: "casual",
      name: "Casual",
      description: "Relaxed and conversational tone for general audiences",
      keywords: ["amazing", "great", "cool", "awesome", "pretty"],
      sentenceStructure: "Short to medium sentences, contractions, simple words",
      examples: ["This new feature is super cool and really easy to use!"]
    },
    {
      id: "academic",
      name: "Academic",
      description: "Scholarly tone for educational or research content",
      keywords: ["analysis", "research", "evidence", "methodology", "conclude"],
      sentenceStructure: "Complex sentences, specialized vocabulary, third-person perspective",
      examples: ["The research methodology yielded statistically significant results."]
    }
  ];
  
  /**
   * Gets all available content tones
   */
  static getAllTones(): ContentTone[] {
    return this.tones;
  }
  
  /**
   * Gets a specific tone by ID
   */
  static getToneById(id: string): ContentTone | undefined {
    return this.tones.find(tone => tone.id === id);
  }
  
  /**
   * Creates a new tone by analyzing multiple articles
   */
  static async createToneFromArticles(
    toneName: string, 
    articles: string[], 
    description?: string
  ): Promise<ContentTone> {
    try {
      console.log(`Creating new tone "${toneName}" from ${articles.length} articles`);
      
      // In a real implementation, you would analyze the articles to extract:
      // - Common words/phrases
      // - Sentence structures
      // - Stylistic elements
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a new tone with mock analysis data
      const newTone: ContentTone = {
        id: toneName.toLowerCase().replace(/\s+/g, '-'),
        name: toneName,
        description: description || `Custom tone created from ${articles.length} articles`,
        keywords: ["unique", "custom", "specialized", "tailored", "distinctive"],
        sentenceStructure: "Custom sentence structure based on analyzed articles",
        examples: ["This is an example sentence in the custom tone style."]
      };
      
      // Add to available tones
      this.tones.push(newTone);
      
      console.log(`Successfully created new tone: ${toneName}`);
      toast.success(`Successfully created "${toneName}" tone`);
      
      return newTone;
    } catch (error) {
      console.error("Error creating content tone:", error);
      toast.error(`Failed to create content tone: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return default professional tone as fallback
      return this.getToneById("professional") as ContentTone;
    }
  }
}

/**
 * Service for AI content generation and rewriting
 */
import { toast } from "sonner";
import { RssFeedItem } from "./RssService";
import { OpenAIService } from "./OpenAIService";
import { FreeAIService } from "./FreeAIService";

export interface ContentGenerationParams {
  tone?: 'professional' | 'casual' | 'academic';
  style?: 'formal' | 'conversational' | 'technical';
  length?: 'short' | 'medium' | 'long';
  perspective?: 'neutral' | 'optimistic' | 'critical';
  topic?: string;
  useOpenAI?: boolean; // Flag to determine whether to use OpenAI
}

export class ContentService {
  /**
   * Rewrites content using AI
   * Uses OpenAI if configured and specified, otherwise uses free AI service
   */
  static async rewriteContent(
    originalArticle: RssFeedItem,
    params: ContentGenerationParams = {}
  ): Promise<{ title: string; content: string }> {
    try {
      console.log(`Rewriting article: ${originalArticle.title}`);
      console.log(`Using parameters:`, params);
      
      const openAIService = OpenAIService.getInstance();
      const freeAIService = FreeAIService.getInstance();
      
      let tone = params.tone || "professional";
      let topic = params.topic || "general";
      
      // Use OpenAI if it's configured AND explicitly requested
      if (openAIService.isConfigured() && params.useOpenAI) {
        console.log("Using OpenAI for content rewriting");
        try {
          return await openAIService.rewriteContent(
            originalArticle.title,
            originalArticle.content,
            originalArticle.source,
            tone,
            topic
          );
        } catch (error) {
          console.error("OpenAI content generation failed, falling back to free service:", error);
          toast.error("OpenAI service failed, falling back to free service");
          // Fall back to free service if OpenAI fails
        }
      }
      
      // Use free AI service in all other cases (default)
      console.log("Using free AI service for content rewriting");
      return await freeAIService.rewriteContent(
        originalArticle.title,
        originalArticle.content,
        originalArticle.source,
        tone,
        topic
      );
    } catch (error) {
      console.error("Error rewriting content:", error);
      toast.error(`Failed to rewrite content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return original content in case of error
      return {
        title: originalArticle.title,
        content: originalArticle.content
      };
    }
  }
  
  /**
   * Generates a summary of an article
   */
  static async generateSummary(content: string, maxLength: number = 150): Promise<string> {
    try {
      // Remove HTML tags for the summary
      const plainText = content.replace(/<[^>]*>/g, "");
      
      if (plainText.length <= maxLength) {
        return plainText;
      }
      
      // For a better summary, look for the first few sentences
      const sentences = plainText.split(/[.!?]+/).filter(s => s.trim().length > 0);
      let summary = "";
      
      for (const sentence of sentences) {
        if ((summary + sentence).length <= maxLength - 3) {
          summary += sentence + ". ";
        } else {
          break;
        }
      }
      
      // If we couldn't make a good summary from sentences, just truncate
      if (summary.length === 0) {
        summary = plainText.substring(0, maxLength) + "...";
      }
      
      return summary;
    } catch (error) {
      console.error("Error generating summary:", error);
      return content.substring(0, maxLength) + "...";
    }
  }

  /**
   * Generates article content from a title
   */
  static async generateFromTitle(title: string, topic: string, tone: string): Promise<{ content: string; summary: string }> {
    try {
      console.log(`Generating article from title: ${title}`);
      console.log(`Using parameters: topic=${topic}, tone=${tone}`);
      
      // In a real implementation, this would call an AI service
      const freeAIService = await import('@/services/FreeAIService').then(m => m.FreeAIService.getInstance());
      
      // Generate article content from title
      const generatedContent = await freeAIService.generateArticleFromTitle(
        title,
        topic,
        tone
      );
      
      return {
        content: generatedContent.content || `<p>Generated article about "${title}" would appear here.</p>`,
        summary: generatedContent.summary || await this.generateSummary(generatedContent.content, 200)
      };
    } catch (error) {
      console.error("Error generating article from title:", error);
      toast.error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return fallback content in case of error
      return {
        content: `<p>Unable to generate article about "${title}" at this time.</p>`,
        summary: `Brief summary about ${title}`
      };
    }
  }

  /**
   * Optimizes content length to target character count
   */
  static async optimizeContentLength(content: string, targetLength: number, tone: string): Promise<string> {
    try {
      console.log(`Optimizing content length to ${targetLength} characters`);
      
      // In a real implementation, this would call an AI service
      const freeAIService = await import('@/services/FreeAIService').then(m => m.FreeAIService.getInstance());
      
      // Simple simulation for demo purposes
      const currentLength = content.length;
      
      if (currentLength > targetLength) {
        // Truncate content - in a real implementation, this would be more sophisticated
        const words = content.split(/\s+/);
        const estimatedWordsNeeded = Math.floor(targetLength / (currentLength / words.length));
        return words.slice(0, estimatedWordsNeeded).join(' ');
      } else if (currentLength < targetLength) {
        // Expand content using AI
        const mockArticle = {
          id: crypto.randomUUID(),
          title: "Optimization",
          content: content,
          description: content.substring(0, 150),
          link: "",
          pubDate: new Date().toISOString(),
          source: "Manual Entry"
        };
        
        // Rewrite content but with more details to expand it
        const enhancedContent = await freeAIService.rewriteContent(
          mockArticle, 
          { 
            tone: tone as any,
            length: 'long'
          }
        );
        
        return enhancedContent.content;
      }
      
      // If the content is already close to the target length, return as is
      return content;
    } catch (error) {
      console.error("Error optimizing content length:", error);
      toast.error(`Failed to optimize content length: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return content; // Return the original content in case of error
    }
  }
}

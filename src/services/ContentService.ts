
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
}

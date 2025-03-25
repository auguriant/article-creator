
/**
 * Service for AI content generation and rewriting
 */
import { toast } from "sonner";
import { RssFeedItem } from "./RssService";
import { OpenAIService } from "./OpenAIService";

export interface ContentGenerationParams {
  tone?: 'professional' | 'casual' | 'academic';
  style?: 'formal' | 'conversational' | 'technical';
  length?: 'short' | 'medium' | 'long';
  perspective?: 'neutral' | 'optimistic' | 'critical';
  topic?: string;
}

export class ContentService {
  /**
   * Rewrites content using AI
   * Uses OpenAI if configured, otherwise uses a mock implementation
   */
  static async rewriteContent(
    originalArticle: RssFeedItem,
    params: ContentGenerationParams = {}
  ): Promise<{ title: string; content: string }> {
    try {
      console.log(`Rewriting article: ${originalArticle.title}`);
      console.log(`Using parameters:`, params);
      
      const openAIService = OpenAIService.getInstance();
      
      // If OpenAI is configured, use it for content rewriting
      if (openAIService.isConfigured()) {
        try {
          let tone = params.tone || "professional";
          let topic = params.topic;
          
          // Include topic in the rewriting if specified
          return await openAIService.rewriteContent(
            originalArticle.title,
            originalArticle.content,
            originalArticle.source,
            tone,
            topic
          );
        } catch (error) {
          console.error("OpenAI content generation failed, falling back to mock:", error);
          // Fall back to mock if OpenAI fails
        }
      }
      
      // Mock implementation (fallback)
      console.log("Using fallback mock content generation");
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get a shortened version of the content for the mock rewrite
      const contentPreview = originalArticle.content.substring(0, 200);
      console.log(`Original content preview: ${contentPreview}...`);
      
      // Simulate different tones based on params
      let tone = "informative";
      if (params.tone === "casual") tone = "conversational";
      if (params.tone === "academic") tone = "scholarly";
      
      // Get topic if specified
      const topic = params.topic || "artificial intelligence";
      
      // Mock rewritten content
      const rewrittenTitle = `${topic.charAt(0).toUpperCase() + topic.slice(1)} Insights: ${originalArticle.title}`;
      const rewrittenContent = `
        <h2>A Fresh Perspective on ${originalArticle.title}</h2>
        <p>In the rapidly evolving landscape of ${topic}, new developments emerge daily. This article explores recent findings in a ${tone} manner.</p>
        <p>The original article from ${originalArticle.source} discussed key points about ${topic} technologies and their implications. Let's delve deeper into what this means for the industry.</p>
        <h3>Key Insights</h3>
        <p>${topic.charAt(0).toUpperCase() + topic.slice(1)} continues to transform industries from healthcare to finance. The original insights have been expanded to provide a more comprehensive understanding.</p>
        <p>As researchers push the boundaries of what's possible, we're seeing unprecedented capabilities in this field.</p>
        <h3>Future Implications</h3>
        <p>The trajectory of ${topic} development suggests we're only at the beginning of this technological revolution. In the coming years, we can expect more sophisticated systems that will change how we live and work.</p>
        <p>This article was automatically generated based on content from ${originalArticle.source}, published on ${new Date(originalArticle.pubDate).toLocaleDateString()}.</p>
      `;
      
      console.log("Content rewriting completed successfully");
      
      return {
        title: rewrittenTitle,
        content: rewrittenContent
      };
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
      // In a real implementation, this would use an AI API
      // For now, we'll just truncate the content
      
      // Remove HTML tags for the summary
      const plainText = content.replace(/<[^>]*>/g, "");
      
      if (plainText.length <= maxLength) {
        return plainText;
      }
      
      return plainText.substring(0, maxLength) + "...";
    } catch (error) {
      console.error("Error generating summary:", error);
      return content.substring(0, maxLength) + "...";
    }
  }
}

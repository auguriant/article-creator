
/**
 * Service for AI content generation and rewriting
 */
import { toast } from "sonner";
import { RssFeedItem } from "./RssService";

export interface ContentGenerationParams {
  tone?: 'professional' | 'casual' | 'academic';
  style?: 'formal' | 'conversational' | 'technical';
  length?: 'short' | 'medium' | 'long';
  perspective?: 'neutral' | 'optimistic' | 'critical';
}

export class ContentService {
  /**
   * Rewrites content using simulated AI
   * In a real implementation, this would call an external AI API
   */
  static async rewriteContent(
    originalArticle: RssFeedItem,
    params: ContentGenerationParams = {}
  ): Promise<{ title: string; content: string }> {
    try {
      console.log(`Rewriting article: ${originalArticle.title}`);
      console.log(`Using parameters:`, params);
      
      // This is a mock implementation
      // In a real app, you would call an API like OpenAI, Claude, etc.
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Get a shortened version of the content for the mock rewrite
      const contentPreview = originalArticle.content.substring(0, 200);
      console.log(`Original content preview: ${contentPreview}...`);
      
      // Simulate different tones based on params
      let tone = "informative";
      if (params.tone === "casual") tone = "conversational";
      if (params.tone === "academic") tone = "scholarly";
      
      // Mock rewritten content
      const rewrittenTitle = `AI Perspective: ${originalArticle.title}`;
      const rewrittenContent = `
        <h2>A Fresh Perspective on ${originalArticle.title}</h2>
        <p>In the rapidly evolving landscape of artificial intelligence, new developments emerge daily. This article explores recent findings in a ${tone} manner.</p>
        <p>The original article from ${originalArticle.source} discussed key points about advanced AI technologies and their implications. Let's delve deeper into what this means for the industry.</p>
        <h3>Key Insights</h3>
        <p>Artificial intelligence continues to transform industries from healthcare to finance. The original insights have been expanded to provide a more comprehensive understanding.</p>
        <p>As researchers push the boundaries of what's possible, we're seeing unprecedented capabilities in language processing, computer vision, and predictive analytics.</p>
        <h3>Future Implications</h3>
        <p>The trajectory of AI development suggests we're only at the beginning of this technological revolution. In the coming years, we can expect more sophisticated systems that blur the line between human and machine intelligence.</p>
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

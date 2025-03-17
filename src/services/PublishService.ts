
/**
 * Service for handling article publishing
 */
import { toast } from "sonner";

export interface Article {
  id: string;
  title: string;
  content: string;
  summary: string;
  imageUrl: string;
  sourceUrl: string;
  sourceName: string;
  publishDate: string;
  tags: string[];
}

export class PublishService {
  // Mock database of published articles
  private static articles: Article[] = [];
  
  /**
   * Publishes an article to the blog
   */
  static async publishArticle(article: Article): Promise<boolean> {
    try {
      console.log(`Publishing article: ${article.title}`);
      
      // In a real implementation, this would save to a database or CMS
      // For this demo, we'll save to our in-memory store
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Add to our articles array
      this.articles.push({
        ...article,
        id: article.id || crypto.randomUUID(),
        publishDate: article.publishDate || new Date().toISOString()
      });
      
      console.log(`Article published successfully. Total articles: ${this.articles.length}`);
      toast.success("Article published successfully");
      
      return true;
    } catch (error) {
      console.error("Error publishing article:", error);
      toast.error(`Failed to publish article: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
  
  /**
   * Gets all published articles
   */
  static async getArticles(): Promise<Article[]> {
    // In a real implementation, this would fetch from a database or CMS
    // For this demo, we'll return our in-memory store
    return [...this.articles].sort(
      (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
    );
  }
  
  /**
   * Gets a specific article by ID
   */
  static async getArticleById(id: string): Promise<Article | null> {
    // In a real implementation, this would fetch from a database or CMS
    const article = this.articles.find(a => a.id === id);
    return article || null;
  }
}

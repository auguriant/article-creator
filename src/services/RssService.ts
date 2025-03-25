
/**
 * Service for fetching and parsing RSS feeds
 */
import { toast } from "sonner";

export interface RssFeedItem {
  id: string;
  title: string;
  description: string;
  content: string;
  link: string;
  pubDate: string;
  source: string;
}

export class RssService {
  /**
   * Fetches articles from an RSS feed URL
   */
  static async fetchFeed(feedUrl: string, feedName: string): Promise<RssFeedItem[]> {
    try {
      // In a real implementation, you would use a proxy or backend to fetch the RSS feed
      // For this demo, we're simulating successful fetches with mock data
      console.log(`Fetching feed from ${feedUrl}`);
      
      // Generate 3-5 mock articles for testing purposes
      const mockArticlesCount = Math.floor(Math.random() * 3) + 3;
      const mockArticles: RssFeedItem[] = [];
      
      for (let i = 0; i < mockArticlesCount; i++) {
        const mockArticle: RssFeedItem = {
          id: crypto.randomUUID(),
          title: `${feedName} Article ${i + 1} - ${new Date().toLocaleDateString()}`,
          description: `This is a sample description for article ${i + 1} from ${feedName}.`,
          content: `<p>This is sample content for article ${i + 1} from ${feedName}. This is a mock article created for testing purposes.</p>
                   <p>It contains multiple paragraphs and mentions artificial intelligence, AI, and machine learning to pass the keyword filter.</p>`,
          link: `https://example.com/article-${i + 1}`,
          pubDate: new Date(Date.now() - i * 3600000).toISOString(), // Each article is 1 hour older
          source: feedName
        };
        
        mockArticles.push(mockArticle);
      }
      
      console.log(`Successfully fetched ${mockArticles.length} articles from ${feedName}`);
      return mockArticles;
    } catch (error) {
      console.error("Error fetching RSS feed:", error);
      toast.error(`Failed to fetch feed from ${feedName}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }
  
  /**
   * Filters articles based on age and keywords
   */
  static filterArticles(
    articles: RssFeedItem[], 
    maxAgeInDays: number = 3, 
    keywords: string[] = ["artificial intelligence", "AI", "machine learning"]
  ): RssFeedItem[] {
    const now = new Date();
    const maxAge = maxAgeInDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds
    
    return articles.filter(article => {
      // Check article age
      const pubDate = new Date(article.pubDate);
      const age = now.getTime() - pubDate.getTime();
      
      if (age > maxAge) {
        return false;
      }
      
      // Check for keywords
      const contentText = (article.title + " " + article.description).toLowerCase();
      return keywords.some(keyword => contentText.includes(keyword.toLowerCase()));
    });
  }
}

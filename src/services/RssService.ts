
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
      // For this demo, we're using a CORS proxy
      const corsProxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(feedUrl)}`;
      
      const response = await fetch(corsProxyUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch feed: ${response.statusText}`);
      }
      
      const data = await response.json();
      const feedContent = data.contents;
      
      // Parse the XML content
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(feedContent, "text/xml");
      
      // Extract the items from the feed
      const items = xmlDoc.querySelectorAll("item");
      
      return Array.from(items).map((item) => {
        const title = item.querySelector("title")?.textContent || "";
        const description = item.querySelector("description")?.textContent || "";
        
        // Try to extract content from various possible tags
        let content = "";
        const contentEncoded = item.querySelector("content\\:encoded, encoded")?.textContent;
        const contentElement = item.querySelector("content")?.textContent;
        if (contentEncoded) {
          content = contentEncoded;
        } else if (contentElement) {
          content = contentElement;
        } else {
          content = description; // Fallback to description
        }
        
        const link = item.querySelector("link")?.textContent || "";
        const pubDate = item.querySelector("pubDate")?.textContent || "";
        
        return {
          id: crypto.randomUUID(),
          title,
          description,
          content,
          link,
          pubDate: new Date(pubDate).toISOString(),
          source: feedName
        };
      });
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

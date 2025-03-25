/**
 * Service for handling automation workflows
 */
import { toast } from "sonner";
import { RssService, RssFeedItem } from "./RssService";
import { ContentService } from "./ContentService";
import { ImageService } from "./ImageService";
import { Article } from "./PublishService";

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

export interface AutomationStatus {
  isRunning: boolean;
  lastRun: string | null;
}

export class AutomationService {
  private static instance: AutomationService;
  private status: AutomationStatus = {
    isRunning: false,
    lastRun: null
  };
  
  // Mock database of pending articles awaiting review
  private pendingArticles: Article[] = [];
  
  // Mock activity logs
  private activityLogs: {timestamp: string; action: string; details: string}[] = [];
  
  private constructor() {
    // Initialize with some fake pending articles
    this.pendingArticles = [
      {
        id: crypto.randomUUID(),
        title: "AI is Revolutionizing Content Creation",
        content: "<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam in dui mauris.</p><p>Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor neque eu tellus rhoncus ut eleifend nibh porttitor.</p>",
        summary: "Artificial intelligence tools are changing how content is created and distributed online.",
        imageUrl: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485",
        sourceUrl: "https://example.com/article-1",
        sourceName: "Tech Daily",
        publishDate: new Date().toISOString(),
        tags: ["AI", "Content", "Technology"]
      },
      {
        id: crypto.randomUUID(),
        title: "Machine Learning Models for Text Generation",
        content: "<p>Etiam porta sem malesuada magna mollis euismod. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor.</p><p>Maecenas sed diam eget risus varius blandit sit amet non magna.</p>",
        summary: "New machine learning models are capable of generating human-like text with minimal input.",
        imageUrl: "https://images.unsplash.com/photo-1677442135148-1456be40dd28",
        sourceUrl: "https://example.com/article-2",
        sourceName: "AI Research Today",
        publishDate: new Date().toISOString(),
        tags: ["Machine Learning", "NLP", "AI"]
      }
    ];
    
    // Initialize with some fake activity logs
    this.activityLogs = [
      {
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        action: "FETCH",
        details: "Fetched 12 articles from 3 RSS feeds"
      },
      {
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        action: "REWRITE",
        details: "Generated AI content for 5 articles"
      },
      {
        timestamp: new Date(Date.now() - 10800000).toISOString(),
        action: "PUBLISH",
        details: "Published 3 approved articles"
      }
    ];
  }
  
  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }
  
  public getStatus(): AutomationStatus {
    return this.status;
  }
  
  public getPendingArticles(): Article[] {
    return [...this.pendingArticles];
  }
  
  public getPendingArticleCount(): number {
    return this.pendingArticles.length;
  }
  
  public getActivityLogs(): {timestamp: string; action: string; details: string}[] {
    return [...this.activityLogs].sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }
  
  public async start(feeds: FeedSource[]): Promise<boolean> {
    try {
      console.log("Starting news automation");
      this.status.isRunning = true;
      this.status.lastRun = new Date().toISOString();
      
      this.logActivity("START", "News automation started");
      
      // Fetch articles
      const activeFeeds = feeds.filter(feed => feed.active);
      console.log(`Processing ${activeFeeds.length} active feeds`);
      
      let totalArticles = 0;
      
      // Simulate fetching and processing in the background
      setTimeout(async () => {
        for (const feed of activeFeeds) {
          console.log(`Fetching from: ${feed.name} (${feed.url})`);
          
          try {
            // Fetch articles from the feed
            const fetchedArticles = await RssService.fetchFeed(feed.url, feed.name);
            
            // Filter articles based on keywords and age
            const filteredArticles = RssService.filterArticles(fetchedArticles);
            console.log(`Fetched ${fetchedArticles.length} articles, filtered to ${filteredArticles.length}`);
            
            // Process each article
            for (const article of filteredArticles) {
              await this.processArticle(article, feed);
              totalArticles++;
            }
          } catch (error) {
            console.error(`Error processing feed ${feed.name}:`, error);
          }
        }
        
        this.logActivity("FETCH", `Fetched and processed ${totalArticles} articles from ${activeFeeds.length} feeds`);
        
        console.log("Automation run completed");
        this.status.isRunning = false;
      }, 1000);
      
      return true;
    } catch (error) {
      console.error("Error starting automation:", error);
      this.status.isRunning = false;
      this.logActivity("ERROR", `Failed to start automation: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }
  
  public stop(): boolean {
    try {
      console.log("Stopping news automation");
      this.status.isRunning = false;
      this.logActivity("STOP", "News automation stopped");
      return true;
    } catch (error) {
      console.error("Error stopping automation:", error);
      return false;
    }
  }
  
  private async processArticle(article: RssFeedItem, feed: FeedSource): Promise<void> {
    try {
      console.log(`Processing article: ${article.title}`);
      
      // 1. Rewrite content with AI
      const rewrittenContent = await ContentService.rewriteContent(article);
      
      // 2. Generate a summary
      const summary = await ContentService.generateSummary(rewrittenContent.content);
      
      // 3. Generate an image
      const imagePrompt = `${article.title} - ${article.source}`;
      const imageUrl = await ImageService.generateImage({ prompt: imagePrompt });
      
      // 4. Create a pending article
      const pendingArticle: Article = {
        id: crypto.randomUUID(),
        title: rewrittenContent.title,
        content: rewrittenContent.content,
        summary,
        imageUrl,
        sourceUrl: article.link,
        sourceName: article.source,
        publishDate: new Date().toISOString(),
        tags: ["AI", "Technology", feed.name]
      };
      
      // 5. Add to pending queue
      this.pendingArticles.push(pendingArticle);
      console.log(`Added article to approval queue: ${pendingArticle.title}`);
      
      this.logActivity("PROCESS", `Processed article: ${pendingArticle.title}`);
    } catch (error) {
      console.error("Error processing article:", error);
      this.logActivity("ERROR", `Failed to process article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  public async markArticleReviewed(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
    try {
      console.log(`Marking article ${id} as ${status}`);
      
      // Find the article
      const articleIndex = this.pendingArticles.findIndex(a => a.id === id);
      if (articleIndex === -1) {
        console.error(`Article with ID ${id} not found`);
        return false;
      }
      
      // Remove from pending queue
      const article = this.pendingArticles[articleIndex];
      this.pendingArticles.splice(articleIndex, 1);
      
      this.logActivity(
        status === 'approved' ? "APPROVE" : "REJECT", 
        `${status === 'approved' ? 'Approved' : 'Rejected'} article: ${article.title}`
      );
      
      return true;
    } catch (error) {
      console.error(`Error marking article as ${status}:`, error);
      return false;
    }
  }
  
  private logActivity(action: string, details: string): void {
    this.activityLogs.push({
      timestamp: new Date().toISOString(),
      action,
      details
    });
    
    // Keep only the 100 most recent logs
    if (this.activityLogs.length > 100) {
      this.activityLogs = this.activityLogs.slice(-100);
    }
  }
}

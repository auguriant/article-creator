
/**
 * Main service for orchestrating the news automation process
 */
import { toast } from "sonner";
import { RssService, RssFeedItem } from "./RssService";
import { ContentService, ContentGenerationParams } from "./ContentService";
import { ImageService, ImageGenerationParams } from "./ImageService";
import { PublishService, Article } from "./PublishService";

export interface FeedSource {
  id: string;
  name: string;
  url: string;
  active: boolean;
}

export interface AutomationSettings {
  interval: number; // in minutes
  maxAge: number; // in days
  maxArticles: number;
  contentParams: ContentGenerationParams;
  imageParams: Partial<ImageGenerationParams>;
  requireApproval: boolean; // New setting for approval workflow
}

export interface AutomationLog {
  id: string;
  timestamp: Date;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  source: 'feed' | 'content' | 'image' | 'publish';
}

export class AutomationService {
  private static instance: AutomationService;
  private isRunning: boolean = false;
  private intervalId: number | null = null;
  private logs: AutomationLog[] = [];
  private pendingArticles: (Article & { status: 'pending' | 'approved' | 'rejected' })[] = [];
  private settings: AutomationSettings = {
    interval: 60, // 60 minutes
    maxAge: 1, // 1 day
    maxArticles: 3, // 3 articles per run
    contentParams: {
      tone: 'professional',
      style: 'conversational',
      length: 'medium',
      perspective: 'neutral'
    },
    imageParams: {
      style: 'realistic',
      aspectRatio: '16:9'
    },
    requireApproval: true // Default to requiring approval
  };
  
  private constructor() {
    // Initialize with some logs
    this.logs = [
      {
        id: crypto.randomUUID(),
        timestamp: new Date(Date.now() - 5 * 60000),
        message: 'Automation service initialized',
        type: 'info',
        source: 'feed'
      }
    ];
    
    // Load pending articles from localStorage
    this.loadPendingArticles();
  }
  
  public static getInstance(): AutomationService {
    if (!AutomationService.instance) {
      AutomationService.instance = new AutomationService();
    }
    return AutomationService.instance;
  }
  
  private addLog(message: string, type: 'info' | 'success' | 'warning' | 'error', source: 'feed' | 'content' | 'image' | 'publish'): void {
    const log: AutomationLog = {
      id: crypto.randomUUID(),
      timestamp: new Date(),
      message,
      type,
      source
    };
    
    this.logs.unshift(log); // Add to beginning of array
    
    // Keep only the last 100 logs
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }
    
    // Log to console as well
    console.log(`[${source.toUpperCase()}] [${type.toUpperCase()}] ${message}`);
  }
  
  /**
   * Starts the automation process
   */
  public async start(feeds: FeedSource[], settings?: Partial<AutomationSettings>): Promise<boolean> {
    if (this.isRunning) {
      this.addLog('Automation is already running', 'warning', 'feed');
      return false;
    }
    
    // Update settings if provided
    if (settings) {
      this.settings = { ...this.settings, ...settings };
    }
    
    this.isRunning = true;
    this.addLog('Automation started', 'info', 'feed');
    toast.success("News automation started");
    
    // Run once immediately
    await this.runAutomation(feeds);
    
    // Set up interval for future runs
    this.intervalId = window.setInterval(() => {
      this.runAutomation(feeds);
    }, this.settings.interval * 60 * 1000);
    
    return true;
  }
  
  /**
   * Stops the automation process
   */
  public stop(): boolean {
    if (!this.isRunning) {
      this.addLog('Automation is not running', 'warning', 'feed');
      return false;
    }
    
    if (this.intervalId !== null) {
      window.clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    this.isRunning = false;
    this.addLog('Automation stopped', 'info', 'feed');
    toast.success("News automation stopped");
    
    return true;
  }
  
  /**
   * Runs a single automation cycle
   */
  private async runAutomation(feeds: FeedSource[]): Promise<void> {
    this.addLog('Starting automation cycle', 'info', 'feed');
    
    try {
      // 1. Fetch articles from active feeds
      const activeFeeds = feeds.filter(feed => feed.active);
      
      if (activeFeeds.length === 0) {
        this.addLog('No active feeds found', 'warning', 'feed');
        return;
      }
      
      this.addLog(`Fetching articles from ${activeFeeds.length} feeds`, 'info', 'feed');
      
      let allArticles: RssFeedItem[] = [];
      
      for (const feed of activeFeeds) {
        try {
          const articles = await RssService.fetchFeed(feed.url, feed.name);
          this.addLog(`Fetched ${articles.length} articles from ${feed.name}`, 'success', 'feed');
          allArticles = allArticles.concat(articles);
        } catch (error) {
          this.addLog(`Failed to fetch from ${feed.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', 'feed');
        }
      }
      
      // 2. Filter articles by age and relevance
      const filteredArticles = RssService.filterArticles(allArticles, this.settings.maxAge);
      this.addLog(`Filtered down to ${filteredArticles.length} relevant articles`, 'info', 'feed');
      
      // 3. Limit to max articles per run and randomize selection
      const shuffledArticles = filteredArticles.sort(() => 0.5 - Math.random());
      const selectedArticles = shuffledArticles.slice(0, this.settings.maxArticles);
      
      if (selectedArticles.length === 0) {
        this.addLog('No suitable articles found for processing', 'warning', 'feed');
        return;
      }
      
      // 4. Process each selected article
      this.addLog(`Processing ${selectedArticles.length} articles`, 'info', 'content');
      
      for (const article of selectedArticles) {
        try {
          // Rewrite content
          this.addLog(`Rewriting article: ${article.title}`, 'info', 'content');
          const rewrittenContent = await ContentService.rewriteContent(article, this.settings.contentParams);
          this.addLog('Content rewritten successfully', 'success', 'content');
          
          // Generate summary
          const summary = await ContentService.generateSummary(rewrittenContent.content);
          this.addLog('Summary generated successfully', 'success', 'content');
          
          // Generate image
          const imagePrompt = `${article.title}, ${this.settings.imageParams.style || 'realistic'} style`;
          this.addLog(`Generating image with prompt: ${imagePrompt}`, 'info', 'image');
          
          const imageUrl = await ImageService.generateImage({
            prompt: imagePrompt,
            ...this.settings.imageParams
          });
          
          this.addLog('Image generated successfully', 'success', 'image');
          
          // Create the new article
          const newArticle: Article = {
            id: crypto.randomUUID(),
            title: rewrittenContent.title,
            content: rewrittenContent.content,
            summary,
            imageUrl,
            sourceUrl: article.link,
            sourceName: article.source,
            publishDate: new Date().toISOString(),
            tags: ['AI', 'News', 'Technology']
          };
          
          // Either publish directly or add to pending queue
          if (this.settings.requireApproval) {
            // Add to pending articles
            this.addPendingArticle(newArticle);
            this.addLog(`Article queued for approval: ${newArticle.title}`, 'success', 'publish');
          } else {
            // Publish directly
            const published = await PublishService.publishArticle(newArticle);
            
            if (published) {
              this.addLog(`Published article: ${newArticle.title}`, 'success', 'publish');
            } else {
              this.addLog(`Failed to publish article: ${newArticle.title}`, 'error', 'publish');
            }
          }
        } catch (error) {
          this.addLog(`Error processing article: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', 'content');
        }
      }
      
      this.addLog('Automation cycle completed', 'success', 'publish');
    } catch (error) {
      this.addLog(`Automation cycle failed: ${error instanceof Error ? error.message : 'Unknown error'}`, 'error', 'feed');
    }
  }
  
  /**
   * Returns the current automation status
   */
  public getStatus(): { isRunning: boolean; lastRun: string | null } {
    const lastRun = this.logs.find(log => 
      log.message === 'Automation cycle completed' || log.message === 'Automation started'
    );
    
    return {
      isRunning: this.isRunning,
      lastRun: lastRun ? lastRun.timestamp.toISOString() : null
    };
  }
  
  /**
   * Returns the automation logs
   */
  public getLogs(): AutomationLog[] {
    return [...this.logs];
  }
  
  /**
   * Updates the automation settings
   */
  public updateSettings(settings: Partial<AutomationSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.addLog('Automation settings updated', 'info', 'feed');
  }
  
  /**
   * Gets the current automation settings
   */
  public getSettings(): AutomationSettings {
    return { ...this.settings };
  }
  
  /**
   * Adds an article to the pending queue
   */
  private addPendingArticle(article: Article): void {
    // Add the article with pending status
    this.pendingArticles.push({
      ...article,
      status: 'pending'
    });
    
    // Save to localStorage
    this.savePendingArticles();
    
    // Notify about the new pending article
    toast.info("New article awaiting approval", {
      description: article.title
    });
  }
  
  /**
   * Saves pending articles to localStorage
   */
  private savePendingArticles(): void {
    try {
      localStorage.setItem('pending_articles', JSON.stringify(this.pendingArticles));
    } catch (error) {
      console.error("Error saving pending articles:", error);
    }
  }
  
  /**
   * Loads pending articles from localStorage
   */
  private loadPendingArticles(): void {
    try {
      const saved = localStorage.getItem('pending_articles');
      if (saved) {
        this.pendingArticles = JSON.parse(saved);
      }
    } catch (error) {
      console.error("Error loading pending articles:", error);
      this.pendingArticles = [];
    }
  }
  
  /**
   * Gets all pending articles
   */
  public getPendingArticles(): Promise<(Article & { status: 'pending' | 'approved' | 'rejected' })[]> {
    // Return a copy of the pending articles array
    return Promise.resolve([...this.pendingArticles].filter(article => article.status === 'pending'));
  }
  
  /**
   * Gets the count of pending articles
   */
  public getPendingArticleCount(): number {
    return this.pendingArticles.filter(article => article.status === 'pending').length;
  }
  
  /**
   * Marks an article as reviewed (approved or rejected)
   */
  public async markArticleReviewed(id: string, status: 'approved' | 'rejected'): Promise<boolean> {
    // Find the article
    const articleIndex = this.pendingArticles.findIndex(a => a.id === id);
    if (articleIndex === -1) {
      return false;
    }
    
    // Update its status
    this.pendingArticles[articleIndex].status = status;
    
    // Save the updated list
    this.savePendingArticles();
    
    // Log the action
    this.addLog(`Article ${id} marked as ${status}`, 'info', 'publish');
    
    return true;
  }
}

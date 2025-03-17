
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FeedSource } from '@/services/AutomationService';
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RssService } from '@/services/RssService';

export function FeedManagement() {
  const [feeds, setFeeds] = useState<FeedSource[]>([]);
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTestingFeed, setIsTestingFeed] = useState<string | null>(null);

  // Load feeds from localStorage on component mount
  useEffect(() => {
    const savedFeeds = localStorage.getItem('rss_feeds');
    if (savedFeeds) {
      try {
        setFeeds(JSON.parse(savedFeeds));
      } catch (e) {
        console.error("Error parsing saved feeds:", e);
      }
    } else {
      // Default feeds if none saved
      const defaultFeeds: FeedSource[] = [
        { id: '1', name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', active: true },
        { id: '2', name: 'MIT Technology Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', active: true },
        { id: '3', name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', active: true }
      ];
      setFeeds(defaultFeeds);
      localStorage.setItem('rss_feeds', JSON.stringify(defaultFeeds));
    }
  }, []);

  // Save feeds to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('rss_feeds', JSON.stringify(feeds));
  }, [feeds]);

  const handleAddFeed = async () => {
    if (!newFeedName.trim() || !newFeedUrl.trim()) {
      toast.error("Please provide both name and URL for the new feed");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Test the feed before adding
      const isValid = await testFeed(newFeedUrl);
      
      if (!isValid) {
        toast.error("Could not fetch articles from this feed. Please check the URL and try again.");
        setIsLoading(false);
        return;
      }
      
      const newFeed: FeedSource = {
        id: crypto.randomUUID(),
        name: newFeedName.trim(),
        url: newFeedUrl.trim(),
        active: true
      };
      
      setFeeds([...feeds, newFeed]);
      setNewFeedName('');
      setNewFeedUrl('');
      toast.success(`Added new feed source: ${newFeedName}`);
    } catch (error) {
      toast.error(`Error adding feed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFeed = (id: string) => {
    setFeeds(feeds.filter(feed => feed.id !== id));
    toast.success("Feed source removed");
  };

  const handleToggleFeedActive = (id: string) => {
    setFeeds(feeds.map(feed => 
      feed.id === id ? { ...feed, active: !feed.active } : feed
    ));
    
    const feed = feeds.find(f => f.id === id);
    if (feed) {
      toast.success(`Feed ${feed.name} is now ${!feed.active ? 'active' : 'inactive'}`);
    }
  };

  const testFeed = async (url: string): Promise<boolean> => {
    try {
      const articles = await RssService.fetchFeed(url, "Test Feed");
      return articles.length > 0;
    } catch (error) {
      console.error("Feed test failed:", error);
      return false;
    }
  };

  const handleTestFeed = async (id: string, url: string) => {
    setIsTestingFeed(id);
    
    try {
      const isValid = await testFeed(url);
      
      if (isValid) {
        toast.success("Feed test successful! Articles were fetched successfully.");
      } else {
        toast.error("Feed test failed. No articles could be fetched.");
      }
    } catch (error) {
      toast.error(`Feed test failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsTestingFeed(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>URL</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {feeds.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                  No feeds added yet. Add your first RSS feed source below.
                </TableCell>
              </TableRow>
            ) : (
              feeds.map((feed) => (
                <TableRow key={feed.id}>
                  <TableCell className="font-medium">{feed.name}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    <a 
                      href={feed.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-blue-600 hover:underline"
                    >
                      {feed.url}
                    </a>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      className={feed.active 
                        ? "bg-green-100 text-green-800 hover:bg-green-200" 
                        : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }
                    >
                      {feed.active ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleTestFeed(feed.id, feed.url)}
                        disabled={isTestingFeed === feed.id}
                      >
                        {isTestingFeed === feed.id ? (
                          <RefreshCw className="h-4 w-4 animate-spin mr-1" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-1" />
                        )}
                        Test
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleToggleFeedActive(feed.id)}
                      >
                        {feed.active ? (
                          <>
                            <X className="h-4 w-4 mr-1" /> Disable
                          </>
                        ) : (
                          <>
                            <Check className="h-4 w-4 mr-1" /> Enable
                          </>
                        )}
                      </Button>
                      <Button 
                        variant="destructive" 
                        size="sm" 
                        onClick={() => handleRemoveFeed(feed.id)}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Delete
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-lg font-medium">Add New Feed Source</h3>
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label htmlFor="feed-name" className="text-sm font-medium mb-2 block">Feed Name</label>
            <Input
              id="feed-name"
              placeholder="e.g., Google AI Blog"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="feed-url" className="text-sm font-medium mb-2 block">RSS Feed URL</label>
            <Input
              id="feed-url"
              placeholder="https://example.com/feed.xml"
              value={newFeedUrl}
              onChange={(e) => setNewFeedUrl(e.target.value)}
            />
          </div>
        </div>
        
        <Button 
          className="w-full" 
          onClick={handleAddFeed}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testing Feed...
            </>
          ) : (
            <>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Feed Source
            </>
          )}
        </Button>
      </div>
      
      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-3">Tips</h3>
        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
          <li>Add AI-focused RSS feeds for best results</li>
          <li>Test feeds before adding them to ensure they're working</li>
          <li>Disable feeds temporarily instead of deleting them if you want to keep them for later</li>
        </ul>
      </div>
    </div>
  );
}

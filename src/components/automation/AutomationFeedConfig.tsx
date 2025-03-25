import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Trash2, Check, X, Save } from "lucide-react";
import { toast } from "sonner";
import { FeedSource } from '@/services/AutomationService';
import { AutomationService } from '@/services/AutomationService';

const defaultFeeds: FeedSource[] = [
  { id: '1', name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', active: true },
  { id: '2', name: 'MIT Technology Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', active: true },
  { id: '3', name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', active: true },
  { id: '4', name: 'Wired AI', url: 'https://www.wired.com/tag/artificial-intelligence/feed', active: false },
];

const AutomationFeedConfig = () => {
  const [feeds, setFeeds] = useState<FeedSource[]>(defaultFeeds);
  const [newFeedName, setNewFeedName] = useState('');
  const [newFeedUrl, setNewFeedUrl] = useState('');
  const [fetchInterval, setFetchInterval] = useState('60');
  const [maxAge, setMaxAge] = useState('1');
  const [maxArticles, setMaxArticles] = useState('3');
  const automationService = AutomationService.getInstance();

  // Load settings from service on mount
  useEffect(() => {
    const settings = automationService.getSettings();
    setFetchInterval(settings.interval.toString());
    setMaxAge(settings.maxAge.toString());
    setMaxArticles(settings.maxArticles.toString());
  }, []);

  const handleAddFeed = () => {
    if (!newFeedName.trim() || !newFeedUrl.trim()) {
      toast.error("Please provide both name and URL for the new feed");
      return;
    }
    
    const newFeed: FeedSource = {
      id: Date.now().toString(),
      name: newFeedName.trim(),
      url: newFeedUrl.trim(),
      active: true
    };
    
    setFeeds([...feeds, newFeed]);
    setNewFeedName('');
    setNewFeedUrl('');
    toast.success(`Added new feed source: ${newFeedName}`);
  };

  const handleRemoveFeed = (id: string) => {
    setFeeds(feeds.filter(feed => feed.id !== id));
    toast.success("Feed source removed");
  };

  const handleToggleFeedActive = (id: string) => {
    setFeeds(feeds.map(feed => 
      feed.id === id ? { ...feed, active: !feed.active } : feed
    ));
  };

  const handleValidateUrl = (url: string) => {
    if (!url.trim()) return;
    
    try {
      new URL(url);
      toast.success("URL format is valid");
    } catch (e) {
      toast.error("Invalid URL format. Please enter a valid URL");
    }
  };

  const handleSaveSettings = () => {
    automationService.updateSettings({
      interval: parseInt(fetchInterval, 10),
      maxAge: parseInt(maxAge, 10),
      maxArticles: parseInt(maxArticles, 10),
    });
    toast.success("Global feed settings saved successfully");
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {feeds.map((feed) => (
          <div 
            key={feed.id} 
            className={`flex items-center justify-between p-3 rounded-md border ${
              feed.active ? 'border-border' : 'border-muted bg-muted/50'
            }`}
          >
            <div className="flex-1 mr-4">
              <div className="flex items-center">
                <h4 className={`font-medium ${!feed.active && 'text-muted-foreground'}`}>{feed.name}</h4>
                {!feed.active && <span className="ml-2 text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">Inactive</span>}
              </div>
              <a 
                href={feed.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-xs text-muted-foreground hover:text-foreground truncate block mt-1"
              >
                {feed.url}
              </a>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleToggleFeedActive(feed.id)}
                title={feed.active ? "Deactivate feed" : "Activate feed"}
              >
                {feed.active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleRemoveFeed(feed.id)}
                title="Remove feed"
              >
                <Trash2 className="h-4 w-4 text-destructive" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-sm font-medium mb-3">Add New Feed Source</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 gap-2">
            <label htmlFor="feed-name" className="text-sm">Feed Name</label>
            <Input
              id="feed-name"
              placeholder="e.g., Google AI Blog"
              value={newFeedName}
              onChange={(e) => setNewFeedName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            <label htmlFor="feed-url" className="text-sm">RSS Feed URL</label>
            <div className="flex">
              <Input
                id="feed-url"
                placeholder="https://example.com/feed.xml"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
              />
              <Button 
                variant="outline" 
                className="ml-2" 
                onClick={() => handleValidateUrl(newFeedUrl)}
              >
                Validate
              </Button>
            </div>
          </div>
          
          <Button className="w-full" onClick={handleAddFeed}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Feed Source
          </Button>
        </div>
      </div>
      
      <div className="pt-4 border-t">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-sm font-medium">Global Feed Settings</h3>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSaveSettings}
            className="flex items-center gap-1"
          >
            <Save className="h-4 w-4" />
            Save Settings
          </Button>
        </div>
        <div className="space-y-4">
          <div className="grid gap-2">
            <label htmlFor="fetch-interval" className="text-sm font-medium">Fetch Interval</label>
            <select 
              id="fetch-interval" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={fetchInterval}
              onChange={(e) => setFetchInterval(e.target.value)}
            >
              <option value="30">Every 30 minutes</option>
              <option value="60">Every hour</option>
              <option value="180">Every 3 hours</option>
              <option value="360">Every 6 hours</option>
              <option value="720">Every 12 hours</option>
              <option value="1440">Once per day</option>
            </select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="max-age" className="text-sm font-medium">Maximum Article Age</label>
            <select 
              id="max-age" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={maxAge}
              onChange={(e) => setMaxAge(e.target.value)}
            >
              <option value="1">Up to 1 day old</option>
              <option value="2">Up to 2 days old</option>
              <option value="3">Up to 3 days old</option>
              <option value="7">Up to 1 week old</option>
            </select>
          </div>
          
          <div className="grid gap-2">
            <label htmlFor="max-articles" className="text-sm font-medium">Maximum Articles Per Run</label>
            <select 
              id="max-articles" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
              value={maxArticles}
              onChange={(e) => setMaxArticles(e.target.value)}
            >
              <option value="1">1 article</option>
              <option value="3">3 articles</option>
              <option value="5">5 articles</option>
              <option value="10">10 articles</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomationFeedConfig;

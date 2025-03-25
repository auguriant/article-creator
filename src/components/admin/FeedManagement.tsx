
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Trash, Plus, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { FeedFinder } from './FeedManagementExtension';

export function FeedManagement() {
  const [feeds, setFeeds] = useState<{ id: string; url: string; name: string; active: boolean }[]>([]);
  const [newFeedUrl, setNewFeedUrl] = useState("");
  const [newFeedName, setNewFeedName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Load feeds from localStorage on component mount
  useEffect(() => {
    const savedFeeds = localStorage.getItem('rss_feeds');
    if (savedFeeds) {
      try {
        setFeeds(JSON.parse(savedFeeds));
      } catch (e) {
        console.error("Error parsing saved feeds:", e);
      }
    }
    setIsLoading(false);
  }, []);

  // Save feeds to localStorage when they change
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('rss_feeds', JSON.stringify(feeds));
    }
  }, [feeds, isLoading]);

  const handleAddFeed = () => {
    if (!newFeedUrl.trim()) {
      toast.error("Please enter a feed URL");
      return;
    }

    if (!newFeedName.trim()) {
      toast.error("Please enter a feed name");
      return;
    }

    setIsAdding(true);
    
    // Simulate API call delay
    setTimeout(() => {
      const newFeed = {
        id: crypto.randomUUID(),
        url: newFeedUrl,
        name: newFeedName,
        active: true
      };
      
      setFeeds([...feeds, newFeed]);
      setNewFeedUrl("");
      setNewFeedName("");
      setIsAdding(false);
      toast.success(`Added feed: ${newFeedName}`);
    }, 500);
  };

  const handleRemoveFeed = (id: string) => {
    const feedToRemove = feeds.find(feed => feed.id === id);
    if (feedToRemove && confirm(`Are you sure you want to remove "${feedToRemove.name}"?`)) {
      setFeeds(feeds.filter(feed => feed.id !== id));
      toast.success(`Removed feed: ${feedToRemove.name}`);
    }
  };

  const handleToggleFeed = (id: string) => {
    setFeeds(feeds.map(feed => 
      feed.id === id ? { ...feed, active: !feed.active } : feed
    ));
    const feed = feeds.find(f => f.id === id);
    if (feed) {
      toast.success(`${feed.active ? "Disabled" : "Enabled"} feed: ${feed.name}`);
    }
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    
    // Simulate API call delay
    setTimeout(() => {
      localStorage.setItem('rss_feeds', JSON.stringify(feeds));
      setIsSaving(false);
      toast.success("Feeds configuration saved");
    }, 800);
  };
  
  const handleAddFoundFeed = (url: string, name: string) => {
    const newFeed = {
      id: crypto.randomUUID(),
      url: url,
      name: name,
      active: true
    };
    
    setFeeds([...feeds, newFeed]);
    toast.success(`Added feed: ${name}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-4">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading feeds...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6">
        <div className="text-lg font-medium">RSS Feeds</div>
        
        <div className="border rounded-md divide-y">
          {feeds.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              No RSS feeds added yet. Add your first feed below.
            </div>
          ) : (
            feeds.map(feed => (
              <div key={feed.id} className="p-4 flex items-center justify-between">
                <div className="flex-1 grid grid-cols-2 gap-4">
                  <div>
                    <div className="font-medium">{feed.name}</div>
                    <div className="text-sm text-muted-foreground truncate">{feed.url}</div>
                  </div>
                  <div className="flex items-center justify-end space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        checked={feed.active}
                        onCheckedChange={() => handleToggleFeed(feed.id)}
                        id={`feed-${feed.id}`}
                      />
                      <Label htmlFor={`feed-${feed.id}`}>
                        {feed.active ? (
                          <span className="text-sm text-green-600 dark:text-green-500">Active</span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Inactive</span>
                        )}
                      </Label>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => handleRemoveFeed(feed.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-4 items-end">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="feed-name">Feed Name</Label>
              <Input
                id="feed-name"
                placeholder="My Tech Feed"
                value={newFeedName}
                onChange={(e) => setNewFeedName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="feed-url">Feed URL</Label>
              <Input
                id="feed-url"
                placeholder="https://example.com/feed"
                value={newFeedUrl}
                onChange={(e) => setNewFeedUrl(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={handleAddFeed} 
              disabled={isAdding || !newFeedUrl || !newFeedName}
            >
              {isAdding ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Feed
                </>
              )}
            </Button>
            <FeedFinder onAddFeed={handleAddFoundFeed} />
          </div>
        </div>
        
        <div className="border-t pt-4 flex justify-end gap-2">
          <Button onClick={handleSaveAll} disabled={isSaving} className="w-full sm:w-auto">
            {isSaving ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PlusCircle, Trash2, Check, X, Save, Search } from "lucide-react";
import { toast } from "sonner";
import { FeedSource } from '@/services/AutomationService';
import { AutomationService } from '@/services/AutomationService';
import { RssFindService } from '@/services/RssFindService';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundFeeds, setFoundFeeds] = useState<any[]>([]);
  const [tonality, setTonality] = useState('professional');
  const [articleLength, setArticleLength] = useState('medium');
  const [hashtags, setHashtags] = useState('');
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
    toast.success("Automation settings saved successfully");
  };

  const handleFindFeeds = async () => {
    if (!websiteUrl) {
      toast.error("Please enter a website URL");
      return;
    }
    
    setIsSearching(true);
    try {
      const feeds = await RssFindService.findRssFeeds(websiteUrl);
      setFoundFeeds(feeds);
      
      if (feeds.length === 0) {
        toast.info("No RSS feeds found on this website");
      } else {
        toast.success(`Found ${feeds.length} RSS feeds`);
      }
    } catch (error) {
      toast.error("Error finding RSS feeds");
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddFoundFeed = (feed: any) => {
    const newFeed: FeedSource = {
      id: Date.now().toString(),
      name: feed.title,
      url: feed.url,
      active: true
    };
    
    setFeeds([...feeds, newFeed]);
    toast.success(`Added feed source: ${feed.title}`);
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="topics">
        <TabsList>
          <TabsTrigger value="topics">What to Write About</TabsTrigger>
          <TabsTrigger value="sources">Inspiration Sources</TabsTrigger>
          <TabsTrigger value="settings">Automation Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="topics" className="space-y-4 py-4">
          <div className="text-sm text-muted-foreground mb-2">
            Select topics you want to generate content about. These will be used to filter and focus your automated content.
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-6 text-muted-foreground">
                Topics are configured in the Topics tab of the Admin panel.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="sources" className="space-y-4 py-4">
          <div className="border rounded-md p-4 bg-muted/30">
            <h3 className="text-lg font-medium mb-2">Add/Find Sources</h3>
            <div className="grid grid-cols-1 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="website-url">Enter website URL to find sources</Label>
                <div className="flex">
                  <Input
                    id="website-url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                  />
                  <Button 
                    className="ml-2" 
                    disabled={isSearching}
                    onClick={handleFindFeeds}
                  >
                    {isSearching ? "Searching..." : 
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find Sources
                      </>
                    }
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter a website URL to find RSS feeds that can be used as sources for automation.
                </p>
              </div>

              {foundFeeds.length > 0 && (
                <div className="border rounded-md divide-y mt-4">
                  <div className="p-3 bg-muted/50 font-medium">
                    Found Sources
                  </div>
                  {foundFeeds.map((feed, index) => (
                    <div key={index} className="p-3 flex items-center justify-between">
                      <div>
                        <div className="font-medium">{feed.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-md">{feed.url}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {feed.itemCount} articles • {feed.language || 'unknown'} language
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAddFoundFeed(feed)}
                      >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="border rounded-md p-4">
            <h3 className="text-lg font-medium mb-2">Add Source Manually</h3>
            <div className="grid gap-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="feed-name">Feed Name</Label>
                  <Input
                    id="feed-name"
                    placeholder="e.g., Google AI Blog"
                    value={newFeedName}
                    onChange={(e) => setNewFeedName(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="feed-url">RSS Feed URL</Label>
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
              </div>
              
              <Button className="w-full md:w-auto" onClick={handleAddFeed}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Feed Source
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Current Sources</h3>
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
            
            {feeds.length === 0 && (
              <div className="text-center py-6 text-muted-foreground border rounded-md">
                No sources added yet. Add your first source above.
              </div>
            )}
          </div>
        </TabsContent>
        
        <TabsContent value="settings" className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="fetch-interval">Fetch Interval</Label>
                <select 
                  id="fetch-interval" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={fetchInterval}
                  onChange={(e) => setFetchInterval(e.target.value)}
                >
                  <option value="1440">Once per day</option>
                  <option value="10080">Once per week</option>
                  <option value="20160">Once every 2 weeks</option>
                  <option value="43200">Once per month</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max-age">Maximum Article Age</Label>
                <select 
                  id="max-age" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={maxAge}
                  onChange={(e) => setMaxAge(e.target.value)}
                >
                  <option value="1">Up to 1 day old</option>
                  <option value="7">Up to 1 week old</option>
                  <option value="14">Up to 2 weeks old</option>
                  <option value="30">Up to 1 month old</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="max-articles">Maximum Articles Per Run</Label>
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
            
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="tonality">Default Tonality</Label>
                <select 
                  id="tonality" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={tonality}
                  onChange={(e) => setTonality(e.target.value)}
                >
                  <option value="professional">Professional</option>
                  <option value="casual">Casual</option>
                  <option value="academic">Academic</option>
                  <option value="conversational">Conversational</option>
                  <option value="technical">Technical</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="article-length">Default Article Length</Label>
                <select 
                  id="article-length" 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                  value={articleLength}
                  onChange={(e) => setArticleLength(e.target.value)}
                >
                  <option value="short">Short (~300 words)</option>
                  <option value="medium">Medium (~600 words)</option>
                  <option value="long">Long (~1000 words)</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="hashtags">Default Hashtags</Label>
                <Input
                  id="hashtags"
                  placeholder="#technology #ai"
                  value={hashtags}
                  onChange={(e) => setHashtags(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Separate hashtags with spaces (e.g. #marketing #technology)
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t pt-4 flex justify-end">
            <Button 
              onClick={handleSaveSettings}
              className="flex items-center"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AutomationFeedConfig;

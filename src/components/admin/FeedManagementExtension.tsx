
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Search, RefreshCw, Plus } from "lucide-react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { RssFindService, FoundRssFeed } from "@/services/RssFindService";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Label } from "@/components/ui/label";

interface FeedFinderProps {
  onAddFeed: (url: string, name: string) => void;
}

export function FeedFinder({ onAddFeed }: FeedFinderProps) {
  const [url, setUrl] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [foundFeeds, setFoundFeeds] = useState<FoundRssFeed[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleSearch = async () => {
    if (!url) {
      toast.error("Please enter a URL to search for RSS feeds");
      return;
    }
    
    setIsSearching(true);
    
    try {
      const feeds = await RssFindService.findRssFeeds(url);
      setFoundFeeds(feeds);
      
      if (feeds.length === 0) {
        toast.error("No RSS feeds found on this URL");
      } else {
        toast.success(`Found ${feeds.length} RSS feeds`);
      }
    } catch (error) {
      console.error("Error finding RSS feeds:", error);
      toast.error(`Failed to find RSS feeds: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearching(false);
    }
  };
  
  const handleAddFeed = (feed: FoundRssFeed) => {
    onAddFeed(feed.url, feed.title);
    setIsDialogOpen(false);
    toast.success(`Added feed: ${feed.title}`);
  };
  
  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Search className="mr-2 h-4 w-4" />
          Find RSS Feeds
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Find RSS Feeds</DialogTitle>
          <DialogDescription>
            Enter a website URL to search for available RSS feeds.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="website-url" className="text-right">
              Website URL
            </Label>
            <div className="col-span-3 flex gap-2">
              <Input
                id="website-url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="flex-1"
              />
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Search
                  </>
                )}
              </Button>
            </div>
          </div>
          
          {foundFeeds.length > 0 && (
            <Table>
              <TableCaption>Found RSS feeds for the given URL</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {foundFeeds.map((feed, index) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{feed.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate">{feed.description}</TableCell>
                    <TableCell>{feed.itemCount}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" onClick={() => handleAddFeed(feed)}>
                        <Plus className="mr-2 h-3 w-3" />
                        Add
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

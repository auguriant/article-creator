
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2, RefreshCw, Settings, Newspaper, Image, PenLine, RssIcon } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import AutomationFeedConfig from "@/components/automation/AutomationFeedConfig";
import AutomationLogs from "@/components/automation/AutomationLogs";
import AutomationStatus from "@/components/automation/AutomationStatus";

const NewsAutomation = () => {
  const [isRunning, setIsRunning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleRunAutomation = () => {
    setIsProcessing(true);
    
    // Simulating processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsRunning(true);
      toast.success("Automation started successfully");
    }, 1500);
  };
  
  const handleStopAutomation = () => {
    setIsProcessing(true);
    
    // Simulating processing
    setTimeout(() => {
      setIsProcessing(false);
      setIsRunning(false);
      toast.info("Automation stopped");
    }, 1500);
  };

  return (
    <div className="container py-10 space-y-8">
      <div className="flex flex-col space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">News Automation</h1>
        <p className="text-muted-foreground">
          Automatically fetch, rewrite, and publish AI news articles with generated images.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Automation Control</CardTitle>
              <CardDescription>Start, stop, and monitor the news automation process</CardDescription>
            </div>
            <AutomationStatus isRunning={isRunning} />
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Button
              onClick={isRunning ? handleStopAutomation : handleRunAutomation}
              disabled={isProcessing}
              variant={isRunning ? "destructive" : "default"}
              className="w-40"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : isRunning ? (
                <>
                  Stop Automation
                </>
              ) : (
                <>
                  Start Automation
                </>
              )}
            </Button>
            
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <Switch id="auto-start" />
                <label htmlFor="auto-start" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  Start automatically on page load
                </label>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="feeds">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="feeds">
            <RssIcon className="h-4 w-4 mr-2" />
            RSS Feeds
          </TabsTrigger>
          <TabsTrigger value="content">
            <PenLine className="h-4 w-4 mr-2" />
            Content Generation
          </TabsTrigger>
          <TabsTrigger value="images">
            <Image className="h-4 w-4 mr-2" />
            Image Generation
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Newspaper className="h-4 w-4 mr-2" />
            Activity Logs
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="feeds" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>RSS Feed Sources</CardTitle>
              <CardDescription>
                Configure the AI news sources to pull content from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AutomationFeedConfig />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Content Rewriting</CardTitle>
              <CardDescription>
                Configure how content should be rewritten by AI
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="tone" className="text-sm font-medium">Writing Tone</label>
                  <select id="tone" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="formal">Formal & Professional</option>
                    <option value="conversational">Conversational</option>
                    <option value="educational">Educational</option>
                    <option value="technical">Technical</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="length" className="text-sm font-medium">Article Length</label>
                  <select id="length" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="short">Short (300-500 words)</option>
                    <option value="medium">Medium (600-1000 words)</option>
                    <option value="long">Long (1000-1500 words)</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="include-sources" />
                  <label htmlFor="include-sources" className="text-sm font-medium">
                    Include original sources citation
                  </label>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="add-summary" defaultChecked />
                  <label htmlFor="add-summary" className="text-sm font-medium">
                    Add executive summary section
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="images" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>AI Image Generation</CardTitle>
              <CardDescription>
                Configure how images are generated for articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-2">
                  <label htmlFor="style" className="text-sm font-medium">Image Style</label>
                  <select id="style" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="photorealistic">Photorealistic</option>
                    <option value="digital-art">Digital Art</option>
                    <option value="illustration">Illustration</option>
                    <option value="3d-render">3D Render</option>
                  </select>
                </div>
                
                <div className="grid gap-2">
                  <label htmlFor="count" className="text-sm font-medium">Number of Images</label>
                  <select id="count" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                    <option value="1">1 (Header only)</option>
                    <option value="2">2 (Header + 1 body image)</option>
                    <option value="3">3 (Header + 2 body images)</option>
                  </select>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch id="image-captions" defaultChecked />
                  <label htmlFor="image-captions" className="text-sm font-medium">
                    Generate image captions
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="logs" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>
                Recent activity from the automation system
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[500px]">
                <AutomationLogs />
              </ScrollArea>
            </CardContent>
            <CardFooter className="flex justify-between border-t p-4">
              <Button variant="outline" size="sm">Clear Logs</Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="mr-2 h-4 w-4" />
                Refresh
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsAutomation;

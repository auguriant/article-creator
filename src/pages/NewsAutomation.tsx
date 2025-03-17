
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Play, Pause, Settings, BarChart2, FileText } from "lucide-react";
import AutomationStatus from "@/components/automation/AutomationStatus";
import AutomationLogs from "@/components/automation/AutomationLogs";
import AutomationFeedConfig from "@/components/automation/AutomationFeedConfig";
import { AutomationService, FeedSource } from "@/services/AutomationService";
import { toast } from "sonner";

const NewsAutomation = () => {
  const [activeTab, setActiveTab] = useState("settings");
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [feeds, setFeeds] = useState<FeedSource[]>([
    { id: '1', name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', active: true },
    { id: '2', name: 'MIT Technology Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', active: true },
    { id: '3', name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', active: true },
    { id: '4', name: 'Wired AI', url: 'https://www.wired.com/tag/artificial-intelligence/feed', active: false },
  ]);
  
  const automationService = AutomationService.getInstance();

  useEffect(() => {
    // Get the current automation status
    const status = automationService.getStatus();
    setIsRunning(status.isRunning);
    setLastRun(status.lastRun);
    
    // Set up a timer to periodically check the status
    const intervalId = setInterval(() => {
      const updatedStatus = automationService.getStatus();
      setIsRunning(updatedStatus.isRunning);
      setLastRun(updatedStatus.lastRun);
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleToggleAutomation = async () => {
    if (isRunning) {
      const stopped = automationService.stop();
      if (stopped) {
        setIsRunning(false);
        toast.success("News automation stopped");
      } else {
        toast.error("Failed to stop automation");
      }
    } else {
      const started = await automationService.start(feeds);
      if (started) {
        setIsRunning(true);
        setLastRun(new Date().toISOString());
        toast.success("News automation started");
      } else {
        toast.error("Failed to start automation");
      }
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">News Automation</CardTitle>
              <CardDescription className="mt-1.5">
                Automatically fetch, rewrite, and publish AI news articles
              </CardDescription>
            </div>
            <div className="flex items-center gap-3">
              <AutomationStatus isRunning={isRunning} lastRun={lastRun || undefined} />
              <Button 
                onClick={handleToggleAutomation} 
                className={isRunning ? "bg-red-500 hover:bg-red-600" : "bg-green-600 hover:bg-green-700"}
              >
                {isRunning ? (
                  <>
                    <Pause className="mr-2 h-4 w-4" /> Stop Automation
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" /> Start Automation
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="settings" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 w-full sm:w-auto">
          <TabsTrigger value="settings" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" /> Configuration
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Activity Logs
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center">
            <BarChart2 className="mr-2 h-4 w-4" /> Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Automation Configuration</CardTitle>
              <CardDescription>Manage RSS feeds, content settings, and publishing rules</CardDescription>
            </CardHeader>
            <CardContent>
              <AutomationFeedConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Activity Logs</CardTitle>
              <CardDescription>View recent activity and automation events</CardDescription>
            </CardHeader>
            <CardContent>
              <AutomationLogs />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Automation Statistics</CardTitle>
              <CardDescription>View performance metrics and analytics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 text-muted-foreground">
                Statistics will be available after automation has been running
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default NewsAutomation;

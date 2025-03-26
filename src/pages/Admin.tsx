import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Database, FilePen, Key, RefreshCw, Rss, Settings, Play, Pause, BarChart2, FileText, LogOut, ExternalLink, Download, CheckSquare } from "lucide-react";
import { FeedManagement } from "@/components/admin/FeedManagement";
import { ApiKeyConfig } from "@/components/admin/ApiKeyConfig";
import { AiModelConfig } from "@/components/admin/AiModelConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { OpenAIService } from "@/services/OpenAIService";
import { TopicConfig } from "@/components/admin/TopicConfig";
import { ManualArticle } from "@/components/admin/ManualArticle";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import AuthService from "@/services/AuthService";
import AutomationFeedConfig from "@/components/automation/AutomationFeedConfig";
import AutomationLogs from "@/components/automation/AutomationLogs";
import AutomationStatus from "@/components/automation/AutomationStatus";
import { AutomationService, FeedSource } from "@/services/AutomationService";
import { ApprovalQueue } from "@/components/admin/ApprovalQueue";
import { Badge } from "@/components/ui/badge";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("feeds");
  const openAIService = OpenAIService.getInstance();
  const [isConfigured, setIsConfigured] = useState(openAIService.isConfigured());
  const navigate = useNavigate();
  const authService = AuthService.getInstance();
  const automationService = AutomationService.getInstance();
  
  const [isRunning, setIsRunning] = useState(false);
  const [lastRun, setLastRun] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [feeds, setFeeds] = useState<FeedSource[]>([
    { id: '1', name: 'TechCrunch AI', url: 'https://techcrunch.com/category/artificial-intelligence/feed/', active: true },
    { id: '2', name: 'MIT Technology Review', url: 'https://www.technologyreview.com/topic/artificial-intelligence/feed', active: true },
    { id: '3', name: 'VentureBeat AI', url: 'https://venturebeat.com/category/ai/feed/', active: true },
    { id: '4', name: 'Wired AI', url: 'https://www.wired.com/tag/artificial-intelligence/feed', active: false },
  ]);

  useEffect(() => {
    const status = automationService.getStatus();
    setIsRunning(status.isRunning);
    setLastRun(status.lastRun);
    
    setPendingCount(automationService.getPendingArticleCount());
    
    const intervalId = setInterval(() => {
      const updatedStatus = automationService.getStatus();
      setIsRunning(updatedStatus.isRunning);
      setLastRun(updatedStatus.lastRun);
      setPendingCount(automationService.getPendingArticleCount());
    }, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const handleConfigUpdate = () => {
    setIsConfigured(openAIService.isConfigured());
    toast.success("Configuration updated successfully");
  };

  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };

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
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription className="mt-1.5">
                Manage RSS feeds, AI configuration, and content
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
              <Button 
                variant="outline" 
                onClick={() => navigate("/export")}
                title="Export Standalone HTML"
                className="hidden sm:flex"
              >
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
              <Button 
                variant="outline" 
                onClick={handleLogout}
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!isConfigured && (
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Free AI service is active</AlertTitle>
          <AlertDescription>
            You're using the free AI service for content generation. For more advanced features, add your OpenAI API key in the API Configuration tab.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="feeds" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 w-full sm:w-auto flex flex-wrap">
          <TabsTrigger value="feeds" className="flex items-center">
            <Rss className="mr-2 h-4 w-4" /> RSS Feeds
          </TabsTrigger>
          <TabsTrigger value="topics" className="flex items-center">
            <Settings className="mr-2 h-4 w-4" /> Topics
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center">
            <FilePen className="mr-2 h-4 w-4" /> Manual Article
          </TabsTrigger>
          <TabsTrigger value="approval" className="flex items-center">
            <CheckSquare className="mr-2 h-4 w-4" /> 
            Approval Queue
            {pendingCount > 0 && (
              <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="automation" className="flex items-center">
            <Play className="mr-2 h-4 w-4" /> Automation
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center">
            <FileText className="mr-2 h-4 w-4" /> Activity Logs
          </TabsTrigger>
          <TabsTrigger value="api" className="flex items-center">
            <Key className="mr-2 h-4 w-4" /> API Configuration
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center">
            <RefreshCw className="mr-2 h-4 w-4" /> AI Models
          </TabsTrigger>
          <TabsTrigger value="db" className="flex items-center">
            <Database className="mr-2 h-4 w-4" /> Database
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feeds">
          <Card>
            <CardHeader>
              <CardTitle>RSS Feed Management</CardTitle>
              <CardDescription>Add, edit, or remove RSS feed sources</CardDescription>
            </CardHeader>
            <CardContent>
              <FeedManagement />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="topics">
          <Card>
            <CardHeader>
              <CardTitle>Topic Configuration</CardTitle>
              <CardDescription>Manage topics for automated content generation</CardDescription>
            </CardHeader>
            <CardContent>
              <TopicConfig />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approval">
          <Card>
            <CardHeader>
              <CardTitle>Article Approval Queue</CardTitle>
              <CardDescription>Review, edit and approve articles before publishing</CardDescription>
            </CardHeader>
            <CardContent>
              <ApprovalQueue />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Create Manual Article</CardTitle>
              <CardDescription>Write and publish articles manually or generate from titles</CardDescription>
            </CardHeader>
            <CardContent>
              <ManualArticle />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation">
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

        <TabsContent value="api">
          <Card>
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>Configure API keys for external services</CardDescription>
            </CardHeader>
            <CardContent>
              <ApiKeyConfig onUpdate={handleConfigUpdate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai">
          <Card>
            <CardHeader>
              <CardTitle>AI Model Configuration</CardTitle>
              <CardDescription>Configure AI models and parameters</CardDescription>
            </CardHeader>
            <CardContent>
              <AiModelConfig onUpdate={handleConfigUpdate} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="db">
          <Card>
            <CardHeader>
              <CardTitle>Database Management</CardTitle>
              <CardDescription>View and manage stored articles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <div className="p-4 text-center text-muted-foreground">
                  Database management features coming soon
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-8 sm:hidden">
        <Button 
          onClick={() => navigate("/export")}
          className="w-full" 
          variant="outline"
        >
          <Download className="mr-2 h-4 w-4" />
          Export Standalone HTML
        </Button>
      </div>
    </div>
  );
};

export default Admin;

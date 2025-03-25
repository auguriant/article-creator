
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Database, FilePen, Key, RefreshCw, Rss, Settings } from "lucide-react";
import { FeedManagement } from "@/components/admin/FeedManagement";
import { ApiKeyConfig } from "@/components/admin/ApiKeyConfig";
import { AiModelConfig } from "@/components/admin/AiModelConfig";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { OpenAIService } from "@/services/OpenAIService";
import { TopicConfig } from "@/components/admin/TopicConfig";
import { ManualArticle } from "@/components/admin/ManualArticle";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("feeds");
  const openAIService = OpenAIService.getInstance();
  const [isConfigured, setIsConfigured] = useState(openAIService.isConfigured());

  const handleConfigUpdate = () => {
    setIsConfigured(openAIService.isConfigured());
    toast.success("Configuration updated successfully");
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Card className="mb-8">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-2xl">Admin Dashboard</CardTitle>
              <CardDescription className="mt-1.5">
                Manage RSS feeds, API keys, AI configuration, and content
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {!isConfigured && (
        <Alert variant="warning" className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>OpenAI API key not configured</AlertTitle>
          <AlertDescription>
            Please add your OpenAI API key in the API Configuration tab to enable AI-powered features.
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

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>Create Manual Article</CardTitle>
              <CardDescription>Write and publish articles manually</CardDescription>
            </CardHeader>
            <CardContent>
              <ManualArticle />
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
    </div>
  );
};

export default Admin;

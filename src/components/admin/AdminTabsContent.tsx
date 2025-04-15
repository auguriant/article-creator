
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { FeedManagement } from "@/components/admin/FeedManagement";
import { ApiKeyConfig } from "@/components/admin/ApiKeyConfig";
import { AiModelConfig } from "@/components/admin/AiModelConfig";
import { TopicConfig } from "@/components/admin/TopicConfig";
import { ManualArticle } from "@/components/admin/ManualArticle";
import AutomationFeedConfig from "@/components/automation/AutomationFeedConfig";
import AutomationLogs from "@/components/automation/AutomationLogs";
import { ApprovalQueue } from "@/components/admin/ApprovalQueue";
import { DashboardPanel } from "@/components/admin/DashboardPanel";
import { Database, FileText, Key, RefreshCw } from "lucide-react";
import { ReactNode } from "react";

interface AdminTabsContentProps {
  pendingCount: number;
  handleConfigUpdate: () => void;
  isTabDisabled: (tab: string) => boolean;
}

export const AdminTabsContent = ({ pendingCount, handleConfigUpdate, isTabDisabled }: AdminTabsContentProps) => {
  return (
    <>
      <TabsContent value="dashboard">
        <Card>
          <CardHeader>
            <CardTitle>Dashboard Overview</CardTitle>
            <CardDescription>Key metrics and quick actions</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardPanel />
          </CardContent>
        </Card>
      </TabsContent>

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
            <DisabledFeature
              icon={<Key className="h-12 w-12 text-muted-foreground mb-4" />}
              title="API Configuration Coming Soon"
            />
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
            <DisabledFeature
              icon={<RefreshCw className="h-12 w-12 text-muted-foreground mb-4" />}
              title="AI Model Configuration Coming Soon"
            />
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
            <DisabledFeature
              icon={<Database className="h-12 w-12 text-muted-foreground mb-4" />}
              title="Database Management Coming Soon"
            />
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

interface DisabledFeatureProps {
  icon: ReactNode;
  title: string;
}

const DisabledFeature = ({ icon, title }: DisabledFeatureProps) => (
  <div className="rounded-md border p-6 flex flex-col items-center justify-center text-center">
    {icon}
    <h3 className="text-lg font-medium mb-2">{title}</h3>
    <p className="text-muted-foreground">
      This feature is currently under development and will be available in a future update.
    </p>
  </div>
);

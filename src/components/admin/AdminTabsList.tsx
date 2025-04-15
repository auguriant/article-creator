
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart2, CheckSquare, Database, FileText, FilePen, Key, 
  LayoutDashboard, Play, RefreshCw, Rss, Settings 
} from "lucide-react";

interface AdminTabsListProps {
  activeTab: string;
  pendingCount: number;
  isTabDisabled: (tab: string) => boolean;
}

export const AdminTabsList = ({ activeTab, pendingCount, isTabDisabled }: AdminTabsListProps) => {
  return (
    <TabsList className="mb-8 w-full sm:w-auto flex flex-wrap">
      <TabsTrigger value="dashboard" className="flex items-center">
        <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
      </TabsTrigger>
      <TabsTrigger value="feeds" className="flex items-center">
        <Rss className="mr-2 h-4 w-4" /> RSS Feeds
      </TabsTrigger>
      <TabsTrigger value="topics" className="flex items-center">
        <Settings className="mr-2 h-4 w-4" /> Topics
      </TabsTrigger>
      <TabsTrigger value="approval" className="flex items-center">
        <CheckSquare className="mr-2 h-4 w-4" /> 
        Approval Queue
        {pendingCount > 0 && (
          <Badge variant="destructive" className="ml-2">{pendingCount}</Badge>
        )}
      </TabsTrigger>
      <TabsTrigger value="manual" className="flex items-center">
        <FilePen className="mr-2 h-4 w-4" /> Manual Article
      </TabsTrigger>
      <TabsTrigger value="automation" className="flex items-center">
        <Play className="mr-2 h-4 w-4" /> Automation
      </TabsTrigger>
      <TabsTrigger value="logs" className="flex items-center">
        <FileText className="mr-2 h-4 w-4" /> Activity Logs
      </TabsTrigger>
      <TabsTrigger value="api" className="flex items-center" disabled={isTabDisabled('api')}>
        <Key className="mr-2 h-4 w-4" /> API Configuration
      </TabsTrigger>
      <TabsTrigger value="ai" className="flex items-center" disabled={isTabDisabled('ai')}>
        <RefreshCw className="mr-2 h-4 w-4" /> AI Models
      </TabsTrigger>
      <TabsTrigger value="db" className="flex items-center" disabled={isTabDisabled('db')}>
        <Database className="mr-2 h-4 w-4" /> Database
      </TabsTrigger>
    </TabsList>
  );
};


import { useState, useEffect } from "react";
import { Tabs } from "@/components/ui/tabs";
import { toast } from "sonner";
import { OpenAIService } from "@/services/OpenAIService";
import { useNavigate } from "react-router-dom";
import AuthService from "@/services/AuthService";
import { AutomationService, FeedSource } from "@/services/AutomationService";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AdminTabsList } from "@/components/admin/AdminTabsList";
import { AdminTabsContent } from "@/components/admin/AdminTabsContent";
import { ConfigAlert } from "@/components/admin/ConfigAlert";
import { MobileExportButton } from "@/components/admin/MobileExportButton";

const Admin = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
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

  const isTabDisabled = (tab: string) => {
    return ["api", "ai", "db"].includes(tab);
  };

  const handleTabChange = (value: string) => {
    if (!isTabDisabled(value)) {
      setActiveTab(value);
    } else {
      toast.error("This feature is coming soon");
    }
  };

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <AdminHeader 
        isRunning={isRunning}
        lastRun={lastRun}
        handleToggleAutomation={handleToggleAutomation}
      />

      <ConfigAlert isConfigured={isConfigured} />

      <Tabs defaultValue="dashboard" value={activeTab} onValueChange={handleTabChange}>
        <AdminTabsList 
          activeTab={activeTab}
          pendingCount={pendingCount}
          isTabDisabled={isTabDisabled}
        />

        <AdminTabsContent 
          pendingCount={pendingCount}
          handleConfigUpdate={handleConfigUpdate}
          isTabDisabled={isTabDisabled}
        />
      </Tabs>

      <MobileExportButton />
    </div>
  );
};

export default Admin;

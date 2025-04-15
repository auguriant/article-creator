
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, LogOut, Pause, Play } from "lucide-react";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { FeedSource } from "@/services/AutomationService";
import AutomationStatus from "@/components/automation/AutomationStatus";
import AuthService from "@/services/AuthService";

interface AdminHeaderProps {
  isRunning: boolean;
  lastRun: string | null;
  handleToggleAutomation: () => void;
}

export const AdminHeader = ({ isRunning, lastRun, handleToggleAutomation }: AdminHeaderProps) => {
  const navigate = useNavigate();
  const authService = AuthService.getInstance();
  
  const handleLogout = () => {
    authService.logout();
    toast.success("Logged out successfully");
    navigate("/login");
  };
  
  return (
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
  );
};

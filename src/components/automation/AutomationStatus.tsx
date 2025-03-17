
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertTriangle, CheckCircle, Clock } from "lucide-react";

interface AutomationStatusProps {
  isRunning: boolean;
  lastRun?: string;
}

const AutomationStatus = ({ isRunning, lastRun }: AutomationStatusProps) => {
  // Default to current time if no last run time provided
  const formattedLastRun = lastRun || new Date().toLocaleString();
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center">
            {isRunning ? (
              <Badge className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400">
                <div className="flex items-center space-x-1">
                  <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
                  <span>Active</span>
                </div>
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300">
                <div className="flex items-center space-x-1">
                  <AlertTriangle className="h-3 w-3 text-gray-500" />
                  <span>Inactive</span>
                </div>
              </Badge>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs">
            <div className="font-medium">Automation Status</div>
            <div className="flex items-center mt-1 text-muted-foreground">
              <Clock className="mr-1 h-3 w-3" />
              Last updated: {formattedLastRun}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default AutomationStatus;

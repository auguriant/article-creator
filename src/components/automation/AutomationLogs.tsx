
import { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { AutomationService, AutomationLog } from '@/services/AutomationService';

const AutomationLogs = () => {
  const [logs, setLogs] = useState<AutomationLog[]>([]);
  const automationService = AutomationService.getInstance();

  // Set up a timer to update the logs every few seconds
  useEffect(() => {
    const updateLogs = () => {
      const currentLogs = automationService.getLogs();
      setLogs(currentLogs);
    };
    
    // Update once immediately
    updateLogs();
    
    // Then set up interval
    const intervalId = setInterval(updateLogs, 5000);
    
    return () => clearInterval(intervalId);
  }, []);

  const getSourceLabel = (source: string) => {
    const labels = {
      feed: 'RSS Feed',
      content: 'Content Gen',
      image: 'Image Gen',
      publish: 'Publish'
    } as Record<string, string>;
    
    return labels[source] || source;
  };

  const getLogTypeStyles = (type: string) => {
    const styles = {
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    } as Record<string, string>;
    
    return styles[type] || '';
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + 
           ' · ' + 
           date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-3">
      {logs.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground">
          No activity logs available yet
        </div>
      ) : (
        logs.map((log) => (
          <div key={log.id} className="border-b border-border last:border-0 pb-3">
            <div className="flex justify-between items-start mb-1">
              <Badge variant="outline" className={getLogTypeStyles(log.type)}>
                {log.type.charAt(0).toUpperCase() + log.type.slice(1)}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {formatTimestamp(log.timestamp)}
              </span>
            </div>
            <p className="text-sm">{log.message}</p>
            <div className="mt-1">
              <Badge variant="secondary" className="text-xs">
                {getSourceLabel(log.source)}
              </Badge>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default AutomationLogs;


import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle as AlertCircleIcon } from "lucide-react";

interface ConfigAlertProps {
  isConfigured: boolean;
}

export const ConfigAlert = ({ isConfigured }: ConfigAlertProps) => {
  if (isConfigured) return null;
  
  return (
    <Alert className="mb-8">
      <AlertCircleIcon className="h-4 w-4" />
      <AlertTitle>Free AI service is active</AlertTitle>
      <AlertDescription>
        You're using the free AI service for content generation.
      </AlertDescription>
    </Alert>
  );
};

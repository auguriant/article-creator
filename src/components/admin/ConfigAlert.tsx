
import { Alert, AlertCircle, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ConfigAlertProps {
  isConfigured: boolean;
}

export const ConfigAlert = ({ isConfigured }: ConfigAlertProps) => {
  if (isConfigured) return null;
  
  return (
    <Alert className="mb-8">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Free AI service is active</AlertTitle>
      <AlertDescription>
        You're using the free AI service for content generation.
      </AlertDescription>
    </Alert>
  );
};

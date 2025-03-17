
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { OpenAIService } from "@/services/OpenAIService";
import { Eye, EyeOff, Save } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ApiKeyConfigProps {
  onUpdate: () => void;
}

export function ApiKeyConfig({ onUpdate }: ApiKeyConfigProps) {
  const [openAIKey, setOpenAIKey] = useState("");
  const [isKeySet, setIsKeySet] = useState(false);
  const [showKey, setShowKey] = useState(false);
  const openAIService = OpenAIService.getInstance();

  useEffect(() => {
    // Check if API key is already set
    const config = openAIService.getConfig();
    setIsKeySet(config.apiKeySet);
  }, []);

  const handleSaveOpenAIKey = () => {
    if (!openAIKey.trim()) {
      toast.error("Please enter an API key");
      return;
    }

    try {
      // Validate API key format (basic check)
      if (!openAIKey.startsWith("sk-") || openAIKey.length < 20) {
        toast.warning("OpenAI API key format looks incorrect. It should start with 'sk-'");
      }

      openAIService.updateConfig({ apiKey: openAIKey });
      setIsKeySet(true);
      setOpenAIKey("");
      setShowKey(false);
      toast.success("OpenAI API key saved successfully");
      onUpdate();
    } catch (error) {
      toast.error(`Failed to save API key: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleResetOpenAIKey = () => {
    setOpenAIKey("");
    setIsKeySet(false);
    openAIService.updateConfig({ apiKey: "" });
    toast.success("OpenAI API key removed");
    onUpdate();
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">OpenAI API Configuration</h3>
        
        <Alert className="bg-blue-50 text-blue-800 border-blue-200">
          <AlertDescription>
            Your API key is stored securely in your browser's local storage and is only used for requests to OpenAI. 
            It is never sent to our servers.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <div className="flex">
              <div className="relative flex-1">
                <Input
                  id="openai-key"
                  placeholder={isKeySet ? "API key is set (hidden)" : "sk-..."}
                  value={openAIKey}
                  onChange={(e) => setOpenAIKey(e.target.value)}
                  type={showKey ? "text" : "password"}
                  disabled={isKeySet && !showKey}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <Button
                className="ml-2"
                onClick={isKeySet ? handleResetOpenAIKey : handleSaveOpenAIKey}
                variant={isKeySet ? "destructive" : "default"}
              >
                {isKeySet ? "Reset Key" : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Key
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="text-sm text-muted-foreground">
            <p>
              Get your OpenAI API key from{" "}
              <a
                href="https://platform.openai.com/api-keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                platform.openai.com/api-keys
              </a>
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4">
        <h3 className="text-lg font-medium mb-4">API Usage</h3>
        
        <div className="rounded-md border p-4 text-center text-muted-foreground">
          {isKeySet ? (
            <p>OpenAI API is configured and ready for use</p>
          ) : (
            <p>Add your OpenAI API key to enable AI features</p>
          )}
        </div>
      </div>
    </div>
  );
}


import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";
import { OpenAIService } from "@/services/OpenAIService";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Save } from "lucide-react";

interface AiModelConfigProps {
  onUpdate: () => void;
}

export function AiModelConfig({ onUpdate }: AiModelConfigProps) {
  const [textModel, setTextModel] = useState("gpt-4o");
  const [imageModel, setImageModel] = useState("dall-e-3");
  const [temperature, setTemperature] = useState(0.7);
  
  const openAIService = OpenAIService.getInstance();

  useEffect(() => {
    // Load current configuration
    const config = openAIService.getConfig();
    setTextModel(config.textModel);
    setImageModel(config.imageModel);
    setTemperature(config.temperature);
  }, []);

  const handleSaveConfig = () => {
    try {
      openAIService.updateConfig({
        textModel,
        imageModel,
        temperature
      });
      
      toast.success("AI model configuration saved");
      onUpdate();
    } catch (error) {
      toast.error(`Failed to save configuration: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Text Model Configuration</h3>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="text-model">Text Generation Model</Label>
            <Select value={textModel} onValueChange={setTextModel}>
              <SelectTrigger id="text-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gpt-4o">GPT-4o (Most Powerful)</SelectItem>
                <SelectItem value="gpt-4o-mini">GPT-4o Mini (Faster)</SelectItem>
                <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo (Fastest)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Select the model used for rewriting articles. More powerful models produce better content but cost more.
            </p>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between">
              <Label htmlFor="temperature">Temperature: {temperature.toFixed(1)}</Label>
            </div>
            <Slider
              id="temperature"
              min={0}
              max={2}
              step={0.1}
              value={[temperature]}
              onValueChange={(value) => setTemperature(value[0])}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Precise/Factual</span>
              <span>Creative/Varied</span>
            </div>
            <p className="text-sm text-muted-foreground mt-1">
              Controls randomness. Lower values are more deterministic, higher values are more creative.
            </p>
          </div>
        </div>
      </div>
      
      <div className="border-t pt-4 space-y-4">
        <h3 className="text-lg font-medium">Image Generation Model</h3>
        
        <div className="space-y-3">
          <div className="space-y-2">
            <Label htmlFor="image-model">Image Generation Model</Label>
            <Select value={imageModel} onValueChange={setImageModel}>
              <SelectTrigger id="image-model">
                <SelectValue placeholder="Select a model" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="dall-e-3">DALL-E 3 (High Quality)</SelectItem>
                <SelectItem value="dall-e-2">DALL-E 2 (Faster)</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground mt-1">
              Select the model used for generating images. DALL-E 3 produces higher quality images but costs more.
            </p>
          </div>
        </div>
      </div>
      
      <Button className="w-full" onClick={handleSaveConfig}>
        <Save className="mr-2 h-4 w-4" />
        Save AI Configuration
      </Button>
    </div>
  );
}

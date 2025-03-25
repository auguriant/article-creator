
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RefreshCw, Image, Send } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PublishService, Article } from "@/services/PublishService";
import { ImageService } from "@/services/ImageService";
import { ContentService } from "@/services/ContentService";
import { OpenAIService } from "@/services/OpenAIService";

export function ManualArticle() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topics, setTopics] = useState<{ id: string; name: string; isDefault: boolean }[]>([]);
  const [selectedTone, setSelectedTone] = useState("professional");
  
  const openAIService = OpenAIService.getInstance();
  const isAiConfigured = openAIService.isConfigured();

  // Load topics from localStorage
  useEffect(() => {
    const savedTopics = localStorage.getItem('content_topics');
    if (savedTopics) {
      try {
        const parsedTopics = JSON.parse(savedTopics);
        setTopics(parsedTopics);
        
        // Set the default topic if available
        const defaultTopic = parsedTopics.find((t: any) => t.isDefault);
        if (defaultTopic) {
          setSelectedTopic(defaultTopic.id);
        } else if (parsedTopics.length > 0) {
          setSelectedTopic(parsedTopics[0].id);
        }
      } catch (e) {
        console.error("Error parsing saved topics:", e);
      }
    }
  }, []);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please provide an image prompt");
      return;
    }

    if (!isAiConfigured) {
      toast.error("OpenAI API is not configured. Please add your API key in the API Configuration tab.");
      return;
    }
    
    setIsGeneratingImage(true);
    
    try {
      const generatedImageUrl = await ImageService.generateImage({
        prompt: imagePrompt,
        style: 'realistic',
        aspectRatio: '16:9'
      });
      
      setImageUrl(generatedImageUrl);
      toast.success("Image generated successfully");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!content.trim()) {
      toast.error("Please write content before generating a summary");
      return;
    }
    
    try {
      const generatedSummary = await ContentService.generateSummary(content, 200);
      setSummary(generatedSummary);
      toast.success("Summary generated successfully");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast.error(`Failed to generate summary: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      toast.error("Please provide a title");
      return;
    }
    
    if (!content.trim()) {
      toast.error("Please provide content");
      return;
    }
    
    if (!summary.trim()) {
      toast.error("Please provide a summary");
      return;
    }
    
    if (!imageUrl) {
      toast.error("Please generate an image");
      return;
    }
    
    setIsPublishing(true);
    
    try {
      const selectedTopicName = topics.find(t => t.id === selectedTopic)?.name || "General";
      
      const article: Article = {
        id: crypto.randomUUID(),
        title,
        content,
        summary,
        imageUrl,
        sourceUrl: "",
        sourceName: "Manual Entry",
        publishDate: new Date().toISOString(),
        tags: [selectedTopicName]
      };
      
      const published = await PublishService.publishArticle(article);
      
      if (published) {
        toast.success("Article published successfully");
        
        // Reset form
        setTitle("");
        setContent("");
        setSummary("");
        setImagePrompt("");
        setImageUrl("");
      } else {
        toast.error("Failed to publish article");
      }
    } catch (error) {
      console.error("Error publishing article:", error);
      toast.error(`Failed to publish article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleEnhanceContent = async () => {
    if (!content.trim()) {
      toast.error("Please write some content to enhance");
      return;
    }

    if (!isAiConfigured) {
      toast.error("OpenAI API is not configured. Please add your API key in the API Configuration tab.");
      return;
    }
    
    toast.info("Enhancing content with AI...");
    
    try {
      const selectedTopicName = topics.find(t => t.id === selectedTopic)?.name || "General";
      
      const mockArticle = {
        id: crypto.randomUUID(),
        title: title || "Draft Article",
        content: content,
        description: content.substring(0, 150),
        source: "Manual Entry",
        link: "",
        pubDate: new Date().toISOString()
      };
      
      const enhancedContent = await ContentService.rewriteContent(
        mockArticle, 
        { 
          tone: selectedTone as any,
          topic: selectedTopicName
        }
      );
      
      setTitle(enhancedContent.title);
      setContent(enhancedContent.content);
      toast.success("Content enhanced successfully");
    } catch (error) {
      console.error("Error enhancing content:", error);
      toast.error(`Failed to enhance content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Article Title</Label>
            <Input
              id="title"
              placeholder="Enter article title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="content">Article Content</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleEnhanceContent}
                disabled={!isAiConfigured || !content.trim()}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Enhance with AI
              </Button>
            </div>
            <Textarea
              id="content"
              placeholder="Write your article content here..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[300px]"
            />
          </div>
          
          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="summary">Article Summary</Label>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateSummary}
                disabled={!content.trim()}
              >
                Generate Summary
              </Button>
            </div>
            <Textarea
              id="summary"
              placeholder="A brief summary of your article"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="h-24"
            />
          </div>
        </div>
        
        <div className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="topic">Topic</Label>
                  <Select value={selectedTopic} onValueChange={setSelectedTopic}>
                    <SelectTrigger id="topic">
                      <SelectValue placeholder="Select a topic" />
                    </SelectTrigger>
                    <SelectContent>
                      {topics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>
                          {topic.name} {topic.isDefault ? "(Default)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="tone">Content Tone</Label>
                  <Select value={selectedTone} onValueChange={setSelectedTone}>
                    <SelectTrigger id="tone">
                      <SelectValue placeholder="Select a tone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                      <SelectItem value="academic">Academic</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="image-prompt">Image Generation Prompt</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="image-prompt"
                      placeholder="Describe the image you want"
                      value={imagePrompt}
                      onChange={(e) => setImagePrompt(e.target.value)}
                      disabled={isGeneratingImage}
                    />
                    <Button 
                      variant="outline"
                      size="icon"
                      onClick={handleGenerateImage}
                      disabled={isGeneratingImage || !imagePrompt.trim() || !isAiConfigured}
                    >
                      {isGeneratingImage ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Image className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                
                {imageUrl && (
                  <div className="mt-4">
                    <Label className="mb-2 block">Generated Image</Label>
                    <img 
                      src={imageUrl} 
                      alt="Generated" 
                      className="w-full h-auto rounded-md border" 
                    />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit} 
          disabled={isPublishing || !title.trim() || !content.trim() || !summary.trim() || !imageUrl}
          className="w-full sm:w-auto"
        >
          {isPublishing ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Publishing...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Publish Article
            </>
          )}
        </Button>
      </div>
      
      {!isAiConfigured && (
        <div className="p-4 border border-amber-200 bg-amber-50 rounded-md text-amber-800 text-sm">
          <strong>Note:</strong> OpenAI API is not configured. Some AI features will be limited or unavailable.
          Please add your API key in the API Configuration tab to enable all features.
        </div>
      )}
    </div>
  );
}

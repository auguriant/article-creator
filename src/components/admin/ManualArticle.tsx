import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RefreshCw, Image, Send, Wand, Save, FileText } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PublishService, Article } from "@/services/PublishService";
import { ImageService } from "@/services/ImageService";
import { ContentService } from "@/services/ContentService";
import { OpenAIService } from "@/services/OpenAIService";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ManualArticle() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topics, setTopics] = useState<{ id: string; name: string; isDefault: boolean }[]>([]);
  const [selectedTone, setSelectedTone] = useState("professional");
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [articleTab, setArticleTab] = useState("write");
  
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
    
    // Load draft from localStorage if available
    const savedDraft = localStorage.getItem('article_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || "");
        setContent(draft.content || "");
        setSummary(draft.summary || "");
        setImagePrompt(draft.imagePrompt || "");
        setImageUrl(draft.imageUrl || "");
        if (draft.selectedTopic) setSelectedTopic(draft.selectedTopic);
        if (draft.selectedTone) setSelectedTone(draft.selectedTone);
        setIsDraftSaved(true);
      } catch (e) {
        console.error("Error loading draft:", e);
      }
    }
  }, []);
  
  // Save draft to localStorage when content changes
  useEffect(() => {
    const saveDraft = () => {
      const draft = {
        title,
        content,
        summary,
        imagePrompt,
        imageUrl,
        selectedTopic,
        selectedTone
      };
      localStorage.setItem('article_draft', JSON.stringify(draft));
      setIsDraftSaved(true);
    };
    
    // Use a debounce to not save too frequently
    const timeoutId = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timeoutId);
  }, [title, content, summary, imagePrompt, imageUrl, selectedTopic, selectedTone]);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please provide an image prompt");
      return;
    }

    if (useOpenAI && !isAiConfigured) {
      toast.error("OpenAI API is not configured. Using free image service instead.");
      setUseOpenAI(false);
    }
    
    setIsGeneratingImage(true);
    
    try {
      const generatedImageUrl = await ImageService.generateImage({
        prompt: imagePrompt,
        style: 'realistic',
        aspectRatio: '16:9',
        useOpenAI
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
        
        // Reset form and clear draft
        setTitle("");
        setContent("");
        setSummary("");
        setImagePrompt("");
        setImageUrl("");
        localStorage.removeItem('article_draft');
        setIsDraftSaved(false);
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

    if (useOpenAI && !isAiConfigured) {
      toast.error("OpenAI API is not configured. Using free AI service instead.");
      setUseOpenAI(false);
    }
    
    toast.info("Enhancing content with AI...");
    
    try {
      const selectedTopicName = topics.find(t => t.id === selectedTopic)?.name || "General";
      
      const mockArticle = {
        id: crypto.randomUUID(),
        title: title || "Draft Article",
        content: content,
        description: content.substring(0, 150),
        link: "",
        pubDate: new Date().toISOString(),
        source: "Manual Entry"
      };
      
      const enhancedContent = await ContentService.rewriteContent(
        mockArticle, 
        { 
          tone: selectedTone as any,
          topic: selectedTopicName,
          useOpenAI
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
  
  const handleGenerateImagePrompt = async () => {
    if (!content.trim() && !title.trim()) {
      toast.error("Please add a title or content first");
      return;
    }
    
    try {
      const selectedTopicName = topics.find(t => t.id === selectedTopic)?.name || "General";
      const freeAIService = await import('@/services/FreeAIService').then(m => m.FreeAIService.getInstance());
      
      const generatedPrompt = await freeAIService.generateImagePrompt(
        title,
        content,
        selectedTopicName
      );
      
      setImagePrompt(generatedPrompt);
      toast.success("Image prompt generated");
    } catch (error) {
      console.error("Error generating image prompt:", error);
      toast.error(`Failed to generate image prompt: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  const handleClearDraft = () => {
    if (confirm("Are you sure you want to clear the current draft?")) {
      setTitle("");
      setContent("");
      setSummary("");
      setImagePrompt("");
      setImageUrl("");
      localStorage.removeItem('article_draft');
      setIsDraftSaved(false);
      toast.success("Draft cleared");
    }
  };

  const handleGenerateFullArticle = async () => {
    if (!title.trim()) {
      toast.error("Please provide a title to generate an article");
      return;
    }

    if (useOpenAI && !isAiConfigured) {
      toast.error("OpenAI API is not configured. Using free AI service instead.");
      setUseOpenAI(false);
    }
    
    setIsGeneratingContent(true);
    toast.info("Generating article content from title. This may take a moment...");
    
    try {
      const selectedTopicName = topics.find(t => t.id === selectedTopic)?.name || "General";
      const freeAIService = await import('@/services/FreeAIService').then(m => m.FreeAIService.getInstance());
      
      // Generate article content from title
      const generatedContent = await freeAIService.generateArticleFromTitle(
        title,
        selectedTopicName,
        selectedTone
      );
      
      setContent(generatedContent.content);
      setSummary(generatedContent.summary || await ContentService.generateSummary(generatedContent.content, 200));
      
      // Also generate an image prompt
      const imagePromptText = await freeAIService.generateImagePrompt(
        title,
        generatedContent.content,
        selectedTopicName
      );
      
      setImagePrompt(imagePromptText);
      
      toast.success("Article generated successfully");
    } catch (error) {
      console.error("Error generating article:", error);
      toast.error(`Failed to generate article: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingContent(false);
    }
  };

  return (
    <div className="space-y-6">
      <Tabs value={articleTab} onValueChange={setArticleTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="write">Write Article</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="write">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="md:col-span-2 space-y-4">
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Article Title</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateFullArticle}
                    disabled={!title.trim() || isGeneratingContent}
                  >
                    {isGeneratingContent ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <FileText className="mr-2 h-4 w-4" />
                        Generate Full Article
                      </>
                    )}
                  </Button>
                </div>
                <Input
                  id="title"
                  placeholder="Enter article title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setIsDraftSaved(false);
                  }}
                />
              </div>
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="content">Article Content</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleEnhanceContent}
                    disabled={!content.trim() || isGeneratingContent}
                  >
                    <Wand className="mr-2 h-4 w-4" />
                    Enhance with AI
                  </Button>
                </div>
                <Textarea
                  id="content"
                  placeholder="Write your article content here or generate it from the title..."
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    setIsDraftSaved(false);
                  }}
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
                  onChange={(e) => {
                    setSummary(e.target.value);
                    setIsDraftSaved(false);
                  }}
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
                      <Select value={selectedTopic} onValueChange={(val) => {
                        setSelectedTopic(val);
                        setIsDraftSaved(false);
                      }}>
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
                      <Select value={selectedTone} onValueChange={(val) => {
                        setSelectedTone(val);
                        setIsDraftSaved(false);
                      }}>
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
                    
                    {isAiConfigured && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="use-openai"
                          checked={useOpenAI}
                          onCheckedChange={setUseOpenAI}
                        />
                        <Label htmlFor="use-openai">Use OpenAI (Premium)</Label>
                      </div>
                    )}
                    
                    <div className="grid gap-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="image-prompt">Image Generation Prompt</Label>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateImagePrompt}
                          disabled={(!content.trim() && !title.trim())}
                        >
                          Generate Prompt
                        </Button>
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          id="image-prompt"
                          placeholder="Describe the image you want"
                          value={imagePrompt}
                          onChange={(e) => {
                            setImagePrompt(e.target.value);
                            setIsDraftSaved(false);
                          }}
                          disabled={isGeneratingImage}
                        />
                        <Button 
                          variant="outline"
                          size="icon"
                          onClick={handleGenerateImage}
                          disabled={isGeneratingImage || !imagePrompt.trim()}
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
                    
                    <div className="flex items-center justify-between pt-4">
                      <div className="text-sm text-muted-foreground">
                        {isDraftSaved ? "Draft saved" : "Draft not saved"}
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={handleClearDraft}
                      >
                        Clear Draft
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview">
          <div className="border rounded-md p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold mb-4">{title || "Article Title"}</h1>
              {imageUrl && (
                <div className="mb-6">
                  <img 
                    src={imageUrl} 
                    alt={title} 
                    className="w-full h-auto rounded-md border" 
                  />
                </div>
              )}
              <div className="text-sm text-muted-foreground mb-6">
                {summary || "Article summary will appear here..."}
              </div>
              <div 
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: content || "<p>Article content will appear here...</p>" }}
              ></div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          onClick={() => {
            localStorage.setItem('article_draft', JSON.stringify({
              title, content, summary, imagePrompt, imageUrl, selectedTopic, selectedTone
            }));
            setIsDraftSaved(true);
            toast.success("Draft saved");
          }}
        >
          <Save className="mr-2 h-4 w-4" />
          Save Draft
        </Button>
        
        <Button 
          onClick={handleSubmit} 
          disabled={isPublishing || !title.trim() || !content.trim() || !summary.trim() || !imageUrl}
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
    </div>
  );
}

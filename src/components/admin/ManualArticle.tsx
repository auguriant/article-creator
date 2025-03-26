import { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { RefreshCw, Image, Send, Wand, Save, FileText, Hash, Upload, Clock, Scissors, PenTool, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { PublishService, Article } from "@/services/PublishService";
import { ImageService } from "./ImageServiceExtension";
import { ContentService } from "@/services/ContentService";
import { OpenAIService } from "@/services/OpenAIService";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PdfService } from "@/services/PdfService";
import { HashtagService } from "@/services/HashtagService";
import { ContentTone, ContentToneService } from "@/services/ContentToneService";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";

export function ManualArticle() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [summary, setSummary] = useState("");
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [manualImageUrl, setManualImageUrl] = useState("");
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState("");
  const [topics, setTopics] = useState<{ id: string; name: string; isDefault: boolean }[]>([]);
  const [selectedTone, setSelectedTone] = useState("professional");
  const [useOpenAI, setUseOpenAI] = useState(false);
  const [isDraftSaved, setIsDraftSaved] = useState(false);
  const [articleTab, setArticleTab] = useState("write");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfContentLength, setPdfContentLength] = useState(500);
  const [hashtagsResult, setHashtagsResult] = useState<string[]>([]);
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);
  const [availableTones, setAvailableTones] = useState<ContentTone[]>([]);
  const [isCreatingTone, setIsCreatingTone] = useState(false);
  const [newToneName, setNewToneName] = useState("");
  const [newToneDescription, setNewToneDescription] = useState("");
  const [toneExampleArticles, setToneExampleArticles] = useState<string[]>([]);
  const [currentToneExample, setCurrentToneExample] = useState("");
  const [isOpeningToneCreator, setIsOpeningToneCreator] = useState(false);
  const [contentLengthTarget, setContentLengthTarget] = useState(500);
  const [isOptimizingLength, setIsOptimizingLength] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  
  const openAIService = OpenAIService.getInstance();
  const isAiConfigured = openAIService.isConfigured();

  useEffect(() => {
    const savedTopics = localStorage.getItem('content_topics');
    if (savedTopics) {
      try {
        const parsedTopics = JSON.parse(savedTopics);
        setTopics(parsedTopics);
        
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
    
    setAvailableTones(ContentToneService.getAllTones());
    
    const savedDraft = localStorage.getItem('article_draft');
    if (savedDraft) {
      try {
        const draft = JSON.parse(savedDraft);
        setTitle(draft.title || "");
        setContent(draft.content || "");
        setSummary(draft.summary || "");
        setImagePrompt(draft.imagePrompt || "");
        setImageUrl(draft.imageUrl || "");
        setManualImageUrl(draft.manualImageUrl || "");
        if (draft.selectedTopic) setSelectedTopic(draft.selectedTopic);
        if (draft.selectedTone) setSelectedTone(draft.selectedTone);
        setIsDraftSaved(true);
      } catch (e) {
        console.error("Error loading draft:", e);
      }
    }
  }, []);
  
  useEffect(() => {
    const saveDraft = () => {
      const draft = {
        title,
        content,
        summary,
        imagePrompt,
        imageUrl,
        manualImageUrl,
        selectedTopic,
        selectedTone
      };
      localStorage.setItem('article_draft', JSON.stringify(draft));
      setIsDraftSaved(true);
    };
    
    const timeoutId = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timeoutId);
  }, [title, content, summary, imagePrompt, imageUrl, manualImageUrl, selectedTopic, selectedTone]);

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
      setManualImageUrl(""); // Clear manual image when generating
      toast.success("Image generated successfully");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error(`Failed to generate image: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const handleManualImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size exceeds 5MB limit");
      return;
    }
    
    if (!file.type.startsWith('image/')) {
      toast.error("Selected file is not an image");
      return;
    }
    
    const imageUrl = URL.createObjectURL(file);
    setManualImageUrl(imageUrl);
    setImageUrl(""); // Clear generated image when manually uploading
    toast.success("Image uploaded successfully");
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
    
    if (!imageUrl && !manualImageUrl) {
      toast.error("Please upload or generate an image");
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
        imageUrl: imageUrl || manualImageUrl,
        sourceUrl: "",
        sourceName: "Manual Entry",
        publishDate: new Date().toISOString(),
        tags: [...hashtagsResult, selectedTopicName].filter((t, i, a) => a.indexOf(t) === i)
      };
      
      const published = await PublishService.publishArticle(article);
      
      if (published) {
        toast.success("Article published successfully");
        
        setTitle("");
        setContent("");
        setSummary("");
        setImagePrompt("");
        setImageUrl("");
        setManualImageUrl("");
        setHashtagsResult([]);
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
      setManualImageUrl("");
      setHashtagsResult([]);
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
      
      const generatedContent = await ContentService.generateFromTitle(
        title,
        selectedTopicName,
        selectedTone
      );
      
      setContent(generatedContent.content);
      setSummary(generatedContent.summary || await ContentService.generateSummary(generatedContent.content, 200));
      
      const freeAIService = await import('@/services/FreeAIService').then(m => m.FreeAIService.getInstance());
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
  
  const handlePdfUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setIsUploadingPdf(true);
    toast.info("Processing PDF file...");
    
    try {
      const extractedText = await PdfService.extractTextFromPdf(file);
      
      if (extractedText) {
        setContent(extractedText.substring(0, pdfContentLength * 4));
        
        const possibleTitle = extractedText.split('\n')[0].replace('#', '').trim();
        if (possibleTitle && !title) {
          setTitle(possibleTitle);
        }
        
        setSummary(await ContentService.generateSummary(extractedText, 200));
        
        toast.success("PDF content extracted successfully");
      } else {
        toast.error("Failed to extract content from PDF");
      }
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsUploadingPdf(false);
      
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };
  
  const handleGenerateHashtags = async () => {
    if (!content.trim() && !title.trim()) {
      toast.error("Please add a title or content first");
      return;
    }
    
    setIsGeneratingHashtags(true);
    
    try {
      const hashtags = await HashtagService.generateHashtags(
        title,
        content
      );
      
      setHashtagsResult(hashtags);
      toast.success(`Generated ${hashtags.length} hashtags`);
    } catch (error) {
      console.error("Error generating hashtags:", error);
      toast.error(`Failed to generate hashtags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };
  
  const handleCreateNewTone = async () => {
    if (!newToneName.trim()) {
      toast.error("Please provide a name for the new tone");
      return;
    }
    
    if (toneExampleArticles.length < 3) {
      toast.error("Please provide at least 3 example articles for the new tone");
      return;
    }
    
    setIsCreatingTone(true);
    
    try {
      const newTone = await ContentToneService.createToneFromArticles(
        newToneName,
        toneExampleArticles,
        newToneDescription
      );
      
      setAvailableTones([...availableTones, newTone]);
      setSelectedTone(newTone.id);
      
      setNewToneName("");
      setNewToneDescription("");
      setToneExampleArticles([]);
      setCurrentToneExample("");
      setIsOpeningToneCreator(false);
      
      toast.success(`Created new "${newTone.name}" tone successfully`);
    } catch (error) {
      console.error("Error creating tone:", error);
      toast.error(`Failed to create tone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingTone(false);
    }
  };
  
  const handleAddToneExample = () => {
    if (!currentToneExample.trim()) {
      toast.error("Please enter example content");
      return;
    }
    
    setToneExampleArticles([...toneExampleArticles, currentToneExample]);
    setCurrentToneExample("");
    toast.success("Example added");
  };
  
  const handleOptimizeLength = async () => {
    if (!content.trim()) {
      toast.error("Please write some content first");
      return;
    }
    
    setIsOptimizingLength(true);
    
    try {
      const currentWordCount = content.split(/\s+/).length;
      const targetWordCount = Math.round(contentLengthTarget / 5);
      
      toast.info(`Optimizing content from ${currentWordCount} words to approximately ${targetWordCount} words...`);
      
      const optimizedContent = await ContentService.optimizeContentLength(
        content,
        contentLengthTarget,
        selectedTone
      );
      
      setContent(optimizedContent);
      toast.success("Content length optimized successfully");
    } catch (error) {
      console.error("Error optimizing length:", error);
      toast.error(`Failed to optimize length: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsOptimizingLength(false);
    }
  };

  const handleSearchImages = async () => {
    if (!imagePrompt.trim()) {
      toast.error("Please provide an image prompt");
      return;
    }
    
    setIsGeneratingImage(true);
    
    try {
      const images = await ImageService.searchImages(imagePrompt, 4);
      
      if (images && images.length > 0) {
        setImageUrl(images[0]);
        toast.success(`Found ${images.length} images`);
      } else {
        toast.error("No images found for your prompt");
      }
    } catch (error) {
      console.error("Error searching for images:", error);
      toast.error(`Failed to search images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingImage(false);
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
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingPdf}
                    >
                      {isUploadingPdf ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Upload className="mr-2 h-4 w-4" />
                          Import from PDF
                        </>
                      )}
                    </Button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handlePdfUpload}
                      accept=".pdf"
                      className="hidden"
                    />
                    
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
                <div className="flex justify-between items-center text-xs text-muted-foreground">
                  <span>{content.length} characters, ~{Math.round(content.split(/\s+/).length)} words</span>
                  <div className="flex items-center gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm"
                          disabled={!content.trim() || isOptimizingLength}
                        >
                          <Scissors className="mr-2 h-4 w-4" />
                          Optimize Length
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Optimize Content Length</DialogTitle>
                          <DialogDescription>
                            Adjust the target length for your article content
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4 space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Target Length (characters)</Label>
                              <span className="text-sm">{contentLengthTarget}</span>
                            </div>
                            <Slider
                              min={200}
                              max={5000}
                              step={100}
                              value={[contentLengthTarget]}
                              onValueChange={(value) => setContentLengthTarget(value[0])}
                            />
                          </div>
                          
                          <div className="bg-secondary/50 rounded p-4 text-sm">
                            <p className="mb-2 font-medium">Current Content:</p>
                            <p className="text-muted-foreground">{content.length} characters, ~{Math.round(content.split(/\s+/).length)} words</p>
                            
                            <div className="mt-3 mb-1">
                              <span className="text-xs text-muted-foreground">Length comparison:</span>
                            </div>
                            <Progress 
                              value={(Math.min(content.length, 5000) / 5000) * 100} 
                              className="h-2 mb-1" 
                            />
                            <Progress 
                              value={(contentLengthTarget / 5000) * 100}
                              className="h-2 bg-primary/10" 
                            />
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button variant="outline" onClick={() => {}}>
                            Cancel
                          </Button>
                          <Button 
                            onClick={handleOptimizeLength}
                            disabled={isOptimizingLength}
                          >
                            {isOptimizingLength ? (
                              <>
                                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                Optimizing...
                              </>
                            ) : (
                              "Optimize Content"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
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
              
              <div className="grid gap-2">
                <div className="flex items-center justify-between">
                  <Label>Hashtags</Label>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleGenerateHashtags}
                    disabled={isGeneratingHashtags || (!content.trim() && !title.trim())}
                  >
                    {isGeneratingHashtags ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Hash className="mr-2 h-4 w-4" />
                        Generate Hashtags
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md min-h-10">
                  {hashtagsResult.length > 0 ? (
                    hashtagsResult.map((tag, i) => (
                      <div key={i} className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded-full flex items-center">
                        #{tag}
                        <button 
                          className="ml-2 text-muted-foreground hover:text-destructive"
                          onClick={() => setHashtagsResult(hashtagsResult.filter((_, index) => index !== i))}
                        >
                          ×
                        </button>
                      </div>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No hashtags generated yet</span>
                  )}
                </div>
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
                      <div className="flex items-center justify-between">
                        <Label htmlFor="tone">Content Tone</Label>
                        <Dialog open={isOpeningToneCreator} onOpenChange={setIsOpeningToneCreator}>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <PenTool className="mr-2 h-3 w-3" />
                              Create Tone
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Create Custom Content Tone</DialogTitle>
                              <DialogDescription>
                                Provide at least 3 example articles to create a custom tone
                              </DialogDescription>
                            </DialogHeader>
                            
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label htmlFor="tone-name">Tone Name</Label>
                                <Input
                                  id="tone-name"
                                  placeholder="e.g., Technical, Conversational, Educational"
                                  value={newToneName}
                                  onChange={(e) => setNewToneName(e.target.value)}
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="tone-description">Description (Optional)</Label>
                                <Textarea
                                  id="tone-description"
                                  placeholder="Describe your custom tone..."
                                  value={newToneDescription}
                                  onChange={(e) => setNewToneDescription(e.target.value)}
                                  className="h-20"
                                />
                              </div>
                              
                              <div className="space-y-2">
                                <Label>Example Articles ({toneExampleArticles.length}/3)</Label>
                                <div className="border rounded-md p-3 space-y-2 max-h-48 overflow-y-auto">
                                  {toneExampleArticles.map((example, i) => (
                                    <div key={i} className="text-xs border-b pb-2 last:border-0 last:pb-0">
                                      {example.substring(0, 100)}...
                                    </div>
                                  ))}
                                  
                                  {toneExampleArticles.length === 0 && (
                                    <div className="text-sm text-muted-foreground">
                                      No examples added yet
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <Label htmlFor="example-content">Add Example</Label>
                                <Textarea
                                  id="example-content"
                                  placeholder="Paste an article or content with the desired tone..."
                                  value={currentToneExample}
                                  onChange={(e) => setCurrentToneExample(e.target.value)}
                                  className="h-24"
                                />
                                <Button 
                                  size="sm" 
                                  onClick={handleAddToneExample}
                                  disabled={!currentToneExample.trim()}
                                  className="w-full"
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add Example
                                </Button>
                              </div>
                            </div>
                            
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setIsOpeningToneCreator(false)}>
                                Cancel
                              </Button>
                              <Button 
                                onClick={handleCreateNewTone}
                                disabled={isCreatingTone || !newToneName.trim() || toneExampleArticles.length < 3}
                              >
                                {isCreatingTone ? (
                                  <>
                                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                                    Creating...
                                  </>
                                ) : (
                                  "Create Tone"
                                )}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                      <Select value={selectedTone} onValueChange={(val) => {
                        setSelectedTone(val);
                        setIsDraftSaved(false);
                      }}>
                        <SelectTrigger id="tone">
                          <SelectValue placeholder="Select a tone" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableTones.map((tone) => (
                            <SelectItem key={tone.id} value={tone.id}>
                              {tone.name}
                            </SelectItem>
                          ))}
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
                        <Label htmlFor="image">Article Image</Label>
                        <div className="flex gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => imageFileInputRef.current?.click()}
                          >
                            <Upload className="mr-2 h-3 w-3" />
                            Upload
                          </Button>
                          <input
                            type="file"
                            ref={imageFileInputRef}
                            onChange={handleManualImageUpload}
                            accept="image/*"
                            className="hidden"
                          />
                        </div>
                      </div>
                      
                      {manualImageUrl ? (
                        <div className="mt-2">
                          <img 
                            src={manualImageUrl} 
                            alt="Uploaded" 
                            className="w-full h-auto rounded-md border" 
                          />
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="mt-2 w-full"
                            onClick={() => setManualImageUrl("")}
                          >
                            Remove Image
                          </Button>
                        </div>
                      ) : (
                        <div>
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleGenerateImagePrompt}
                            disabled={(!content.trim() && !title.trim())}
                            className="mt-1 text-xs h-7 px-2"
                          >
                            Generate prompt from content
                          </Button>
                          
                          {imageUrl && (
                            <div className="mt-2">
                              <img 
                                src={imageUrl} 
                                alt="Generated" 
                                className="w-full h-auto rounded-md border" 
                              />
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
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
              {(imageUrl || manualImageUrl) && (
                <div className="mb-6">
                  <img 
                    src={imageUrl || manualImageUrl} 
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
              
              {hashtagsResult.length > 0 && (
                <div className="mt-6 pt-6 border-t">
                  <div className="flex flex-wrap gap-2">
                    {hashtagsResult.map((tag, i) => (
                      <span key={i} className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded-full">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
      
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline"
          onClick={() => {
            localStorage.setItem('article_draft', JSON.stringify({
              title, content, summary, imagePrompt, imageUrl, manualImageUrl, selectedTopic, selectedTone
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
          disabled={isPublishing || !title.trim() || !content.trim() || !summary.trim() || (!imageUrl && !manualImageUrl)}
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

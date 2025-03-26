import React, { useState, useRef } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { RefreshCw, Wand, Sparkles, Tag, Book, FileText, Upload, Image, ArrowUpDown, FilePlus } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { ContentService } from '@/services/ContentService';
import { PublishService } from '@/services/PublishService';
import { OpenAIService } from '@/services/OpenAIService';
import { HashtagService } from '@/services/HashtagService';
import { PdfService } from '@/services/PdfService';
import { ContentToneService, ContentTone } from '@/services/ContentToneService';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ImageService } from '@/services/ImageService';

export function ManualArticle() {
  // Load existing component code...
  // We're keeping most of the existing logic but adding new features

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [useAI, setUseAI] = useState(true);

  // New state for PDF extraction
  const [isPdfLoading, setIsPdfLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // New state for hashtag generation
  const [isGeneratingHashtags, setIsGeneratingHashtags] = useState(false);

  // New state for content tone
  const [availableTones, setAvailableTones] = useState<ContentTone[]>(ContentToneService.getAllTones());
  const [selectedToneId, setSelectedToneId] = useState("professional");
  const [isCreatingTone, setIsCreatingTone] = useState(false);
  const [newToneName, setNewToneName] = useState('');
  const [newToneDescription, setNewToneDescription] = useState('');
  const [sampleArticles, setSampleArticles] = useState<string[]>(['', '', '']);
  const [toneDialogOpen, setToneDialogOpen] = useState(false);

  // New state for length optimizer
  const [targetWordCount, setTargetWordCount] = useState(500);
  const [isOptimizingLength, setIsOptimizingLength] = useState(false);

  // New state for image selection
  const [imageSearchQuery, setImageSearchQuery] = useState('');
  const [isSearchingImages, setIsSearchingImages] = useState(false);
  const [searchedImages, setSearchedImages] = useState<string[]>([]);
  const [imageDialogOpen, setImageDialogOpen] = useState(false);

  const generateFromTitle = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title first");
      return;
    }

    setIsGenerating(true);
    try {
      // Get selected tone
      const tone = ContentToneService.getToneById(selectedToneId);
      const toneName = tone ? tone.name : "professional";

      const result = await ContentService.generateFromTitle(
        title, 
        targetWordCount, 
        toneName
      );

      setContent(result.content);
      setSummary(result.summary);
      if (!imageUrl && result.suggestedImageUrl) {
        setImageUrl(result.suggestedImageUrl);
      }
      setTags(result.tags || []);

      toast.success("Content generated successfully");
    } catch (error) {
      console.error("Error generating content:", error);
      toast.error(`Failed to generate content: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handlePublish = async () => {
    if (!title.trim() || !content.trim() || !summary.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsPublishing(true);
    try {
      const success = await PublishService.publishArticle({
        id: crypto.randomUUID(),
        title,
        content,
        summary,
        imageUrl: imageUrl || '/placeholder.svg',
        sourceUrl: '',
        sourceName: 'Manual Entry',
        publishDate: new Date().toISOString(),
        tags: tags,
      });

      if (success) {
        toast.success("Article published successfully");
        resetForm();
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

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSummary('');
    setImageUrl('');
    setTags([]);
  };

  // New function for PDF extraction
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsPdfLoading(true);
    try {
      const text = await PdfService.extractTextFromPdf(file);
      
      // Set the title to the file name without extension
      const fileName = file.name.replace('.pdf', '');
      setTitle(fileName);
      
      // Set the content to the extracted text
      setContent(text);
      
      // Generate a summary using AI
      if (useAI) {
        const summaryText = await ContentService.generateSummary(text);
        setSummary(summaryText);
      }
      
      toast.success("PDF content extracted successfully");
    } catch (error) {
      console.error("Error processing PDF:", error);
      toast.error(`Failed to process PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPdfLoading(false);
      // Reset the file input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // New function for hashtag generation
  const generateHashtags = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter title and content first");
      return;
    }

    setIsGeneratingHashtags(true);
    try {
      const hashtags = await HashtagService.generateHashtags(title, content);
      setTags(hashtags);
      toast.success("Hashtags generated successfully");
    } catch (error) {
      console.error("Error generating hashtags:", error);
      toast.error(`Failed to generate hashtags: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsGeneratingHashtags(false);
    }
  };

  // New function for creating a content tone
  const handleCreateTone = async () => {
    if (!newToneName.trim()) {
      toast.error("Please enter a name for the new tone");
      return;
    }

    // Filter out empty sample articles
    const validSamples = sampleArticles.filter(article => article.trim().length > 0);
    
    if (validSamples.length < 2) {
      toast.error("Please provide at least 2 sample articles");
      return;
    }

    setIsCreatingTone(true);
    try {
      const newTone = await ContentToneService.createToneFromArticles(
        newToneName,
        validSamples,
        newToneDescription
      );
      
      setAvailableTones(ContentToneService.getAllTones());
      setSelectedToneId(newTone.id);
      setToneDialogOpen(false);
      resetToneForm();
      
      toast.success(`Created new tone: ${newTone.name}`);
    } catch (error) {
      console.error("Error creating tone:", error);
      toast.error(`Failed to create tone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreatingTone(false);
    }
  };

  const resetToneForm = () => {
    setNewToneName('');
    setNewToneDescription('');
    setSampleArticles(['', '', '']);
  };

  // New function for optimizing content length
  const optimizeContentLength = async () => {
    if (!content.trim() || targetWordCount <= 0) {
      toast.error("Please enter content and a valid target word count");
      return;
    }

    setIsOptimizingLength(true);
    try {
      const currentWordCount = content.split(/\s+/).filter(Boolean).length;
      
      if (Math.abs(currentWordCount - targetWordCount) < 50) {
        toast.info("Content already close to target length");
        setIsOptimizingLength(false);
        return;
      }
      
      const optimizedContent = await ContentService.optimizeContentLength(
        content, 
        targetWordCount
      );
      
      setContent(optimizedContent);
      toast.success(`Content optimized to target length of ${targetWordCount} words`);
    } catch (error) {
      console.error("Error optimizing content length:", error);
      toast.error(`Failed to optimize content length: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsOptimizingLength(false);
    }
  };

  // New function for image search
  const searchImages = async () => {
    if (!imageSearchQuery.trim()) {
      toast.error("Please enter a search query");
      return;
    }

    setIsSearchingImages(true);
    try {
      const images = await ImageService.searchImages(imageSearchQuery);
      setSearchedImages(images);
      
      if (images.length === 0) {
        toast.warning("No images found for this query");
      }
    } catch (error) {
      console.error("Error searching images:", error);
      toast.error(`Failed to search images: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsSearchingImages(false);
    }
  };

  const selectImage = (url: string) => {
    setImageUrl(url);
    setImageDialogOpen(false);
    toast.success("Image selected");
  };

  const handleSampleArticleChange = (index: number, value: string) => {
    const newSampleArticles = [...sampleArticles];
    newSampleArticles[index] = value;
    setSampleArticles(newSampleArticles);
  };

  const addSampleArticleField = () => {
    setSampleArticles([...sampleArticles, '']);
  };

  const removeSampleArticleField = (index: number) => {
    const newSampleArticles = [...sampleArticles];
    newSampleArticles.splice(index, 1);
    setSampleArticles(newSampleArticles);
  };

  // Calculate word count for length optimization display
  const currentWordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <Tabs defaultValue="create">
        <TabsList className="mb-4">
          <TabsTrigger value="create">Create Article</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="create" className="space-y-4">
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Article Title</Label>
                <Input
                  id="title"
                  placeholder="Enter article title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="flex items-end gap-2">
                <Button 
                  onClick={generateFromTitle} 
                  disabled={isGenerating || !title}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Wand className="mr-2 h-4 w-4" />
                      Generate
                    </>
                  )}
                </Button>
                
                {/* PDF Upload Button */}
                <input
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  ref={fileInputRef}
                  onChange={handlePdfUpload}
                />
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isPdfLoading}
                >
                  {isPdfLoading ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <FilePlus className="mr-2 h-4 w-4" />
                      From PDF
                    </>
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="content">Article Content</Label>
                
                <div className="flex items-center gap-2">
                  {/* Length Optimizer */}
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <ArrowUpDown className="mr-2 h-3 w-3" />
                        Optimize Length
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="grid gap-4">
                        <div className="space-y-2">
                          <h4 className="font-medium leading-none">Length Optimizer</h4>
                          <p className="text-sm text-muted-foreground">
                            Current: {currentWordCount} words
                          </p>
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="target-length">Target Word Count</Label>
                          <div className="flex gap-2">
                            <Input
                              id="target-length"
                              type="number"
                              min="100"
                              step="100"
                              value={targetWordCount}
                              onChange={(e) => setTargetWordCount(parseInt(e.target.value) || 500)}
                            />
                            <Button 
                              onClick={optimizeContentLength}
                              disabled={isOptimizingLength || !content}
                            >
                              {isOptimizingLength ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                              ) : (
                                "Apply"
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  
                  {/* Content Tone Selector */}
                  <Select
                    value={selectedToneId}
                    onValueChange={setSelectedToneId}
                  >
                    <SelectTrigger className="w-[160px]">
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
                  
                  {/* Create Tone Button */}
                  <Dialog open={toneDialogOpen} onOpenChange={setToneDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Sparkles className="mr-2 h-3 w-3" />
                        Create Tone
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>Create Custom Content Tone</DialogTitle>
                        <DialogDescription>
                          Provide sample articles to create a custom tone for your content.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                          <Label htmlFor="tone-name">Tone Name</Label>
                          <Input
                            id="tone-name"
                            placeholder="e.g., Technical, Storytelling, Marketing"
                            value={newToneName}
                            onChange={(e) => setNewToneName(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="tone-description">Description (Optional)</Label>
                          <Input
                            id="tone-description"
                            placeholder="Describe this tone style"
                            value={newToneDescription}
                            onChange={(e) => setNewToneDescription(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-2">
                          <Label>Sample Articles (min. 2 required)</Label>
                          {sampleArticles.map((article, index) => (
                            <div key={index} className="grid gap-2">
                              <div className="flex items-center justify-between">
                                <Label htmlFor={`article-${index}`}>Article {index + 1}</Label>
                                {index > 1 && (
                                  <Button 
                                    variant="ghost" 
                                    size="sm"
                                    onClick={() => removeSampleArticleField(index)}
                                  >
                                    Remove
                                  </Button>
                                )}
                              </div>
                              <Textarea
                                id={`article-${index}`}
                                placeholder="Paste an article with the writing style you want to analyze"
                                value={article}
                                onChange={(e) => handleSampleArticleChange(index, e.target.value)}
                                className="min-h-[100px]"
                              />
                            </div>
                          ))}
                          <Button 
                            variant="outline" 
                            onClick={addSampleArticleField}
                            className="mt-2"
                          >
                            Add Sample Article
                          </Button>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setToneDialogOpen(false);
                            resetToneForm();
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={handleCreateTone}
                          disabled={isCreatingTone}
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
              </div>
              <Textarea
                id="content"
                placeholder="Write your article content here"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[300px]"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="summary">Article Summary</Label>
              <Textarea
                id="summary"
                placeholder="Write a brief summary of the article"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="min-h-[100px]"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-[1fr,auto] gap-4 items-end">
              <div className="grid gap-2">
                <Label htmlFor="image-url">Featured Image URL</Label>
                <div className="flex gap-2">
                  <Input
                    id="image-url"
                    placeholder="Enter image URL"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                  
                  {/* Image Search Dialog */}
                  <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <Image className="mr-2 h-4 w-4" />
                        Find Image
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[550px]">
                      <DialogHeader>
                        <DialogTitle>Select an Image</DialogTitle>
                        <DialogDescription>
                          Search for an image or enter a URL directly.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="grid gap-4 py-4">
                        <div className="flex gap-2">
                          <Input
                            placeholder="Search for images..."
                            value={imageSearchQuery}
                            onChange={(e) => setImageSearchQuery(e.target.value)}
                          />
                          <Button 
                            onClick={searchImages}
                            disabled={isSearchingImages || !imageSearchQuery}
                          >
                            {isSearchingImages ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              "Search"
                            )}
                          </Button>
                        </div>
                        
                        {isSearchingImages ? (
                          <div className="flex justify-center py-8">
                            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        ) : searchedImages.length > 0 ? (
                          <div className="grid grid-cols-2 gap-4 max-h-[300px] overflow-y-auto">
                            {searchedImages.map((img, i) => (
                              <div 
                                key={i} 
                                className="relative aspect-video bg-muted rounded-md overflow-hidden cursor-pointer border hover:border-primary"
                                onClick={() => selectImage(img)}
                              >
                                <img 
                                  src={img} 
                                  alt={`Search result ${i+1}`} 
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-6 text-muted-foreground border rounded-md">
                            <p>Search for images or enter a URL directly.</p>
                          </div>
                        )}
                        
                        <div className="grid gap-2">
                          <Label htmlFor="direct-url">Or enter URL directly</Label>
                          <div className="flex gap-2">
                            <Input 
                              id="direct-url" 
                              value={imageUrl}
                              onChange={(e) => setImageUrl(e.target.value)}
                              placeholder="https://example.com/image.jpg"
                            />
                            <Button onClick={() => setImageDialogOpen(false)}>
                              Use URL
                            </Button>
                          </div>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
              
              {imageUrl && (
                <div className="aspect-video w-32 bg-muted rounded-md overflow-hidden">
                  <img 
                    src={imageUrl} 
                    alt="Preview" 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder.svg';
                    }} 
                  />
                </div>
              )}
            </div>
            
            <div className="grid gap-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="tags">Tags</Label>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={generateHashtags}
                  disabled={isGeneratingHashtags || !title || !content}
                >
                  {isGeneratingHashtags ? (
                    <>
                      <RefreshCw className="mr-2 h-3 w-3 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Tag className="mr-2 h-3 w-3" />
                      Find Hashtags
                    </>
                  )}
                </Button>
              </div>
              <Input
                id="tags"
                placeholder="Enter tags, separated by commas"
                value={tags.join(', ')}
                onChange={(e) => setTags(e.target.value.split(',').map(tag => tag.trim()).filter(Boolean))}
              />
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <div className="flex justify-between items-center pt-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="use-ai"
                  checked={useAI}
                  onCheckedChange={setUseAI}
                />
                <Label htmlFor="use-ai">Use AI for content generation</Label>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" onClick={resetForm}>Reset</Button>
                <Button 
                  onClick={handlePublish}
                  disabled={isPublishing || !title || !content || !summary}
                >
                  {isPublishing ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    "Publish Article"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          {(title || content || summary) ? (
            <Card>
              <CardContent className="pt-6">
                {imageUrl && (
                  <div className="aspect-video mb-4 bg-muted rounded-md overflow-hidden">
                    <img 
                      src={imageUrl} 
                      alt={title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder.svg';
                      }} 
                    />
                  </div>
                )}
                
                <h1 className="text-2xl font-bold mb-2">{title || "Untitled Article"}</h1>
                
                {summary && (
                  <div className="text-muted-foreground italic mb-4 border-l-4 border-muted-foreground/20 pl-4">
                    {summary}
                  </div>
                )}
                
                {content && (
                  <div className="prose max-w-none dark:prose-invert">
                    {content.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph}</p>
                    ))}
                  </div>
                )}
                
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-6">
                    {tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="bg-secondary text-secondary-foreground px-2 py-1 text-xs rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="text-center py-12 text-muted-foreground border rounded-md">
              <Book className="mx-auto h-12 w-12 mb-4 opacity-20" />
              <p className="text-lg mb-2">No content to preview</p>
              <p className="text-sm">Start writing in the Create Article tab</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

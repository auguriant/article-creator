
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { RefreshCw, Check, Trash, Edit, FileText } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PublishService, Article } from "@/services/PublishService";
import { AutomationService } from "@/services/AutomationService";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PendingArticle extends Article {
  status: 'pending' | 'approved' | 'rejected';
}

export function ApprovalQueue() {
  const [pendingArticles, setPendingArticles] = useState<PendingArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<PendingArticle | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedContent, setEditedContent] = useState("");
  const [editedSummary, setEditedSummary] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  
  const automationService = AutomationService.getInstance();

  useEffect(() => {
    loadPendingArticles();
  }, []);

  const loadPendingArticles = async () => {
    setIsLoading(true);
    try {
      const articles = await automationService.getPendingArticles();
      setPendingArticles(articles);
    } catch (error) {
      console.error("Error loading pending articles:", error);
      toast.error("Failed to load pending articles");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (article: PendingArticle) => {
    setIsPublishing(true);
    try {
      const success = await PublishService.publishArticle(article);
      if (success) {
        await automationService.markArticleReviewed(article.id, 'approved');
        setPendingArticles(pendingArticles.filter(a => a.id !== article.id));
        toast.success("Article approved and published");
      } else {
        toast.error("Failed to publish article");
      }
    } catch (error) {
      console.error("Error approving article:", error);
      toast.error("Failed to approve article");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleReject = async (article: PendingArticle) => {
    try {
      await automationService.markArticleReviewed(article.id, 'rejected');
      setPendingArticles(pendingArticles.filter(a => a.id !== article.id));
      toast.success("Article rejected");
    } catch (error) {
      console.error("Error rejecting article:", error);
      toast.error("Failed to reject article");
    }
  };

  const handleEdit = (article: PendingArticle) => {
    setSelectedArticle(article);
    setEditedTitle(article.title);
    setEditedContent(article.content);
    setEditedSummary(article.summary);
    setIsEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedArticle) return;
    
    setIsPublishing(true);
    try {
      const updatedArticle: Article = {
        ...selectedArticle,
        title: editedTitle,
        content: editedContent,
        summary: editedSummary
      };
      
      const success = await PublishService.publishArticle(updatedArticle);
      if (success) {
        await automationService.markArticleReviewed(selectedArticle.id, 'approved');
        setPendingArticles(pendingArticles.filter(a => a.id !== selectedArticle.id));
        setIsEditing(false);
        setSelectedArticle(null);
        toast.success("Article edited and published");
      } else {
        toast.error("Failed to publish edited article");
      }
    } catch (error) {
      console.error("Error publishing edited article:", error);
      toast.error("Failed to publish edited article");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleRefresh = () => {
    loadPendingArticles();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Loading pending articles...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Pending Articles for Review</h2>
        <Button variant="outline" onClick={handleRefresh}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      {pendingArticles.length === 0 ? (
        <div className="text-center py-10 text-muted-foreground border rounded-md">
          <FileText className="mx-auto h-8 w-8 mb-2" />
          <p>No pending articles to review</p>
          <p className="text-sm mt-1">Articles fetched by automation will appear here for approval</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-4">
          {pendingArticles.map((article) => (
            <Card key={article.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{article.title}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="aspect-video mb-2 bg-muted rounded-md overflow-hidden">
                  <img 
                    src={article.imageUrl} 
                    alt={article.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
                <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                  {article.summary}
                </p>
                <div className="text-xs text-muted-foreground flex flex-wrap gap-1 mb-2">
                  <span>Source: {article.sourceName}</span>
                  <span>•</span>
                  <span>Date: {new Date(article.publishDate).toLocaleDateString()}</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {article.tags.map((tag, i) => (
                    <span key={i} className="bg-secondary text-secondary-foreground px-2 py-0.5 text-xs rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
              <CardFooter className="pt-0 flex justify-between">
                <Button variant="outline" size="sm" onClick={() => handleEdit(article)}>
                  <Edit className="mr-2 h-3 w-3" />
                  Edit
                </Button>
                
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleReject(article)}>
                    <Trash className="mr-2 h-3 w-3" />
                    Reject
                  </Button>
                  <Button variant="default" size="sm" onClick={() => handleApprove(article)}>
                    <Check className="mr-2 h-3 w-3" />
                    Approve
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isEditing} onOpenChange={(open) => !open && setIsEditing(false)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
            <DialogDescription>
              Make changes to the article before approving
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-title">Title</Label>
              <Input
                id="edit-title"
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-summary">Summary</Label>
              <Textarea
                id="edit-summary"
                value={editedSummary}
                onChange={(e) => setEditedSummary(e.target.value)}
                className="h-20"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
                className="min-h-[300px]"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={isPublishing}>
              {isPublishing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save & Approve
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

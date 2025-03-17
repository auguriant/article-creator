
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PublishService, Article } from '@/services/PublishService';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Calendar, Globe } from 'lucide-react';

const BlogPost = () => {
  const { id } = useParams<{ id: string }>();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      setLoading(true);
      try {
        if (!id) {
          setError('Article ID is missing');
          return;
        }
        
        const fetchedArticle = await PublishService.getArticleById(id);
        
        if (!fetchedArticle) {
          setError('Article not found');
          return;
        }
        
        setArticle(fetchedArticle);
        setError(null);
      } catch (err) {
        console.error('Error fetching article:', err);
        setError('Failed to load article');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
        <Button variant="ghost" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
        </Button>
        <Skeleton className="h-8 w-3/4 mb-4" />
        <Skeleton className="h-4 w-1/3 mb-8" />
        <Skeleton className="h-64 w-full mb-8" />
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-4">Article Not Found</h1>
        <p className="text-muted-foreground mb-8">{error || 'The requested article could not be found.'}</p>
        <Button asChild>
          <Link to="/blog">Return to Blog</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link to="/blog">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Blog
        </Link>
      </Button>
      
      <article>
        <header className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">{article.title}</h1>
          <div className="flex flex-wrap gap-4 items-center text-muted-foreground">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              <span>{new Date(article.publishDate).toLocaleDateString()}</span>
            </div>
            {article.sourceUrl && (
              <div className="flex items-center">
                <Globe className="h-4 w-4 mr-2" />
                <a 
                  href={article.sourceUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:underline"
                >
                  Original Source: {article.sourceName}
                </a>
              </div>
            )}
          </div>
        </header>
        
        <div className="mb-8">
          <img 
            src={article.imageUrl} 
            alt={article.title} 
            className="w-full h-auto rounded-lg" 
          />
        </div>
        
        <div 
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
        
        <div className="mt-8 pt-6 border-t">
          <div className="flex flex-wrap gap-2">
            {article.tags.map(tag => (
              <span 
                key={tag} 
                className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
};

export default BlogPost;

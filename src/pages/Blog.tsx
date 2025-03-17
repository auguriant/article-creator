
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { PublishService, Article } from '@/services/PublishService';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight } from 'lucide-react';

const Blog = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      try {
        const fetchedArticles = await PublishService.getArticles();
        setArticles(fetchedArticles);
      } catch (error) {
        console.error('Error fetching articles:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl mb-4">
          AI News & Insights
        </h1>
        <p className="text-xl text-muted-foreground max-w-[700px] mx-auto">
          The latest news and perspectives on artificial intelligence, curated and enhanced by AI.
        </p>
      </div>

      <Separator className="my-8" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden flex flex-col h-full">
              <Skeleton className="h-48 w-full" />
              <CardContent className="pt-6 flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="text-center py-16">
          <h3 className="text-2xl font-semibold mb-4">No Articles Yet</h3>
          <p className="text-muted-foreground mb-8">
            Start the automation to generate AI-enhanced news articles.
          </p>
          <Button asChild>
            <Link to="/automation">Go to Automation</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {articles.map((article) => (
            <Card key={article.id} className="overflow-hidden flex flex-col h-full border border-gray-200 dark:border-gray-800 hover:shadow-md transition-shadow duration-200">
              <div 
                className="h-48 w-full bg-cover bg-center" 
                style={{ backgroundImage: `url(${article.imageUrl})` }}
              />
              <CardContent className="pt-6 flex-grow">
                <h3 className="text-xl font-bold mb-2 line-clamp-2">{article.title}</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {new Date(article.publishDate).toLocaleDateString()} • Source: {article.sourceName}
                </p>
                <p className="line-clamp-3">{article.summary}</p>
              </CardContent>
              <CardFooter className="pt-2 pb-6">
                <Button variant="link" asChild className="pl-0 flex items-center">
                  <Link to={`/blog/${article.id}`}>
                    Read More <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Blog;

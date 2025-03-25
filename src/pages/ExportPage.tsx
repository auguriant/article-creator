
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Copy, Download } from "lucide-react";

const ExportPage = () => {
  const [downloading, setDownloading] = useState(false);

  // Predefined HTML template
  const baseHtmlTemplate = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Content Automation System</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <style>
    /* Additional custom styles */
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    }
    .prose img {
      max-width: 100%;
      height: auto;
    }
    .prose h1, .prose h2, .prose h3, .prose h4 {
      margin-top: 1.5em;
      margin-bottom: 0.75em;
    }
    .prose p {
      margin-bottom: 1.25em;
      line-height: 1.7;
    }
    .prose ul, .prose ol {
      padding-left: 1.5rem;
      margin-bottom: 1.25em;
    }
    .article-card {
      transition: transform 0.2s ease-in-out;
    }
    .article-card:hover {
      transform: translateY(-3px);
    }
  </style>
</head>
<body class="bg-gray-100 min-h-screen">
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <h1 class="text-3xl font-bold text-gray-900">Content Automation System</h1>
    </div>
  </header>

  <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div class="grid gap-6 md:grid-cols-3">
      <!-- Articles will be dynamically inserted here -->
      <div id="articles-container" class="md:col-span-2 grid gap-6"></div>
      
      <div class="space-y-6">
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Topics</h2>
          <div id="topics-container" class="space-y-2">
            <!-- Topics will be dynamically inserted here -->
          </div>
        </div>
        
        <div class="bg-white shadow rounded-lg p-6">
          <h2 class="text-xl font-semibold mb-4">Newsletter</h2>
          <p class="text-gray-600 mb-4">Subscribe to receive the latest articles directly in your inbox.</p>
          <form class="space-y-4" id="newsletter-form">
            <div>
              <input type="email" placeholder="Your email address" class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500">
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
              Subscribe
            </button>
          </form>
        </div>
      </div>
    </div>
  </main>

  <footer class="bg-white shadow mt-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <p class="text-gray-600 text-center">Content Automation System &copy; ${new Date().getFullYear()}</p>
    </div>
  </footer>

  <script>
    // JavaScript for the standalone HTML page
    document.addEventListener('DOMContentLoaded', function() {
      // Load articles from localStorage
      const articles = JSON.parse(localStorage.getItem('published_articles') || '[]');
      const articlesContainer = document.getElementById('articles-container');
      
      // Load topics from localStorage
      const topics = JSON.parse(localStorage.getItem('content_topics') || '[]');
      const topicsContainer = document.getElementById('topics-container');
      
      // Display topics
      topics.forEach(topic => {
        const topicEl = document.createElement('div');
        topicEl.className = 'flex items-center';
        topicEl.innerHTML = \`
          <a href="#" class="text-blue-600 hover:underline" data-topic="\${topic.id}">\${topic.name}</a>
          \${topic.isDefault ? '<span class="ml-2 text-xs text-gray-500">(Default)</span>' : ''}
        \`;
        topicsContainer.appendChild(topicEl);
        
        // Add click event to filter by topic
        topicEl.querySelector('a').addEventListener('click', function(e) {
          e.preventDefault();
          const topicId = this.getAttribute('data-topic');
          const topicName = topic.name;
          
          // Filter articles by topic
          displayArticles(articles.filter(article => 
            article.tags && article.tags.includes(topicName)
          ));
        });
      });
      
      // Add "All Topics" option
      const allTopicsEl = document.createElement('div');
      allTopicsEl.className = 'flex items-center mt-3 pt-3 border-t';
      allTopicsEl.innerHTML = '<a href="#" class="text-blue-600 hover:underline font-medium">Show All Topics</a>';
      topicsContainer.appendChild(allTopicsEl);
      
      // Add click event to show all articles
      allTopicsEl.querySelector('a').addEventListener('click', function(e) {
        e.preventDefault();
        displayArticles(articles);
      });
      
      // Handle newsletter form submission
      const newsletterForm = document.getElementById('newsletter-form');
      newsletterForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = this.querySelector('input[type="email"]').value;
        if (email) {
          alert(\`Thank you for subscribing with \${email}! This is a demo, so no emails will actually be sent.\`);
          this.reset();
        }
      });
      
      // Function to display articles
      function displayArticles(articlesToShow) {
        articlesContainer.innerHTML = '';
        
        if (articlesToShow.length === 0) {
          articlesContainer.innerHTML = '<div class="bg-white shadow rounded-lg p-6 text-center text-gray-600">No articles found</div>';
          return;
        }
        
        // Sort articles by date (newest first)
        articlesToShow.sort((a, b) => new Date(b.publishDate) - new Date(a.publishDate));
        
        // Display articles
        articlesToShow.forEach(article => {
          const date = new Date(article.publishDate).toLocaleDateString();
          const card = document.createElement('div');
          card.className = 'bg-white shadow rounded-lg overflow-hidden article-card';
          card.innerHTML = \`
            <div class="relative">
              <img src="\${article.imageUrl}" alt="\${article.title}" class="w-full h-48 object-cover">
              <div class="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <h2 class="text-white text-xl font-bold">\${article.title}</h2>
              </div>
            </div>
            <div class="p-6">
              <div class="text-gray-600 text-sm mb-4">
                <span>\${date}</span>
                <span class="mx-2">•</span>
                <span>\${article.sourceName}</span>
              </div>
              <p class="text-gray-700 mb-4">\${article.summary}</p>
              <button class="view-article text-blue-600 hover:text-blue-800" data-id="\${article.id}">
                Read more
              </button>
            </div>
          \`;
          articlesContainer.appendChild(card);
          
          // Add click event to show full article
          card.querySelector('.view-article').addEventListener('click', function() {
            const articleId = this.getAttribute('data-id');
            showArticleDetails(articles.find(a => a.id === articleId));
          });
        });
      }
      
      // Function to show article details
      function showArticleDetails(article) {
        const date = new Date(article.publishDate).toLocaleDateString();
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50';
        modal.innerHTML = \`
          <div class="bg-white rounded-lg max-w-4xl w-full max-h-screen overflow-y-auto">
            <div class="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
              <h2 class="text-2xl font-bold">\${article.title}</h2>
              <button class="close-modal text-gray-500 hover:text-gray-700">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div class="p-6">
              <div class="mb-6">
                <img src="\${article.imageUrl}" alt="\${article.title}" class="w-full h-auto rounded">
              </div>
              <div class="text-gray-600 text-sm mb-6">
                <span>\${date}</span>
                <span class="mx-2">•</span>
                <span>\${article.sourceName}</span>
                \${article.tags ? \`<span class="mx-2">•</span><span>\${article.tags.join(', ')}</span>\` : ''}
              </div>
              <div class="prose max-w-none">
                \${article.content}
              </div>
            </div>
          </div>
        \`;
        
        document.body.appendChild(modal);
        document.body.style.overflow = 'hidden';
        
        // Close modal when clicking close button or outside
        modal.querySelector('.close-modal').addEventListener('click', function() {
          document.body.removeChild(modal);
          document.body.style.overflow = '';
        });
        
        modal.addEventListener('click', function(e) {
          if (e.target === modal) {
            document.body.removeChild(modal);
            document.body.style.overflow = '';
          }
        });
      }
      
      // Display all articles by default
      displayArticles(articles);
    });
  </script>
</body>
</html>`;

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(baseHtmlTemplate);
    toast.success("HTML copied to clipboard");
  };

  const handleDownloadHtml = () => {
    setDownloading(true);
    
    try {
      const blob = new Blob([baseHtmlTemplate], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'content-automation-system.html';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        setDownloading(false);
      }, 100);
      
      toast.success("HTML file downloaded successfully");
    } catch (error) {
      console.error("Error downloading HTML:", error);
      toast.error("Failed to download HTML file");
      setDownloading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle>Export Standalone HTML Page</CardTitle>
          <CardDescription>
            Download or copy the HTML code to deploy on your own server
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>HTML Preview</Label>
            <div className="border rounded-md p-4 bg-gray-50">
              <pre className="text-xs overflow-auto max-h-96 whitespace-pre-wrap">
                {baseHtmlTemplate}
              </pre>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Instructions</Label>
            <div className="text-sm space-y-4">
              <p>
                This HTML file includes everything needed to run the content automation system on your own server.
                It will load articles and topics from your browser's localStorage, so you'll need to export your content first.
              </p>
              <p>
                To use this file:
              </p>
              <ol className="list-decimal list-inside space-y-2">
                <li>Download or copy the HTML code</li>
                <li>Save it as "index.html" on your web server</li>
                <li>Open the file in your browser</li>
                <li>Use the admin dashboard to manage your content</li>
              </ol>
              <p>
                Note: This is a client-side only solution. For a more robust implementation with a backend database,
                consider using a content management system or building a custom solution.
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <Button
              onClick={handleCopyHtml}
              className="flex-1"
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy HTML
            </Button>
            <Button
              onClick={handleDownloadHtml}
              className="flex-1"
              disabled={downloading}
            >
              {downloading ? (
                "Downloading..."
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Download HTML
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ExportPage;

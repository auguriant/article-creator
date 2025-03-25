
/**
 * Service for free AI content generation as an alternative to OpenAI
 */
import { toast } from "sonner";
import { RssFeedItem } from "./RssService";

export class FreeAIService {
  private static instance: FreeAIService;
  
  private constructor() {
    console.log("FreeAIService initialized");
  }
  
  public static getInstance(): FreeAIService {
    if (!FreeAIService.instance) {
      FreeAIService.instance = new FreeAIService();
    }
    return FreeAIService.instance;
  }
  
  /**
   * Rewrites content using a deterministic algorithm (free alternative)
   */
  public async rewriteContent(
    title: string,
    content: string,
    source: string,
    tone: string = "professional",
    topic: string = "general"
  ): Promise<{ title: string; content: string }> {
    try {
      console.log(`Rewriting content with free service: "${title}"`);
      console.log(`Tone: ${tone}, Topic: ${topic}`);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Process the title: add topic and make it more engaging based on tone
      let newTitle = title;
      if (!newTitle.toLowerCase().includes(topic.toLowerCase()) && topic !== "general") {
        newTitle = `${topic.charAt(0).toUpperCase() + topic.slice(1)}: ${title}`;
      }
      
      // Add tone modifiers to title
      if (tone === "professional") {
        if (!newTitle.includes(":")) newTitle = `The Professional Guide to ${newTitle}`;
      } else if (tone === "casual") {
        if (!newTitle.includes("!")) newTitle = `${newTitle} - You Won't Believe This!`;
      } else if (tone === "academic") {
        if (!newTitle.includes("Analysis")) newTitle = `${newTitle}: A Comprehensive Analysis`;
      }
      
      // Process the content based on tone and topic
      let paragraphs = content.split(/(?:<\/p>\s*<p>|<br\s*\/?>|\n\n)/);
      if (paragraphs.length < 3) {
        // If content is short or not properly split, create more paragraphs
        paragraphs = content.split(". ").filter(p => p.trim().length > 0);
        if (paragraphs.length > 10) {
          // Combine shorter paragraphs
          const newParagraphs = [];
          for (let i = 0; i < paragraphs.length; i += 3) {
            newParagraphs.push(paragraphs.slice(i, i + 3).join(". ") + ".");
          }
          paragraphs = newParagraphs;
        }
      }
      
      // Add introduction
      let newContent = `<h2>Exploring ${topic.charAt(0).toUpperCase() + topic.slice(1)}: ${title}</h2>`;
      
      // Add tone-specific introduction
      if (tone === "professional") {
        newContent += `<p>In today's rapidly evolving landscape of ${topic}, professionals need to stay informed about the latest developments. This article examines key insights from ${source} and provides a practical perspective on their implications.</p>`;
      } else if (tone === "casual") {
        newContent += `<p>Hey there! Today we're diving into some really cool stuff about ${topic}. I came across this interesting piece from ${source} and just had to share my thoughts with you all!</p>`;
      } else if (tone === "academic") {
        newContent += `<p>The following analysis examines recent developments in the field of ${topic}, as reported by ${source}. This paper aims to contextualize these findings within the broader academic discourse and evaluate their significance.</p>`;
      }
      
      // Add main content with modifications
      newContent += `<h3>Key Points</h3>`;
      
      // Reformat paragraphs with tone-specific language
      paragraphs.forEach((paragraph, index) => {
        paragraph = paragraph.trim().replace(/<\/?[^>]+(>|$)/g, ""); // Remove any HTML tags
        
        if (paragraph.length < 10) return; // Skip very short paragraphs
        
        if (tone === "professional") {
          if (index === 0) {
            newContent += `<p>Industry experts emphasize that ${paragraph}</p>`;
          } else if (index === paragraphs.length - 1) {
            newContent += `<p>In conclusion, ${paragraph}</p>`;
          } else {
            newContent += `<p>Furthermore, research indicates that ${paragraph}</p>`;
          }
        } else if (tone === "casual") {
          if (index === 0) {
            newContent += `<p>So check this out - ${paragraph}</p>`;
          } else if (index === paragraphs.length - 1) {
            newContent += `<p>And that's the scoop! ${paragraph}</p>`;
          } else {
            newContent += `<p>What's really cool is that ${paragraph}</p>`;
          }
        } else if (tone === "academic") {
          if (index === 0) {
            newContent += `<p>The primary findings suggest that ${paragraph}</p>`;
          } else if (index === paragraphs.length - 1) {
            newContent += `<p>Therefore, we can conclude that ${paragraph}</p>`;
          } else {
            newContent += `<p>Analysis of the data reveals that ${paragraph}</p>`;
          }
        }
      });
      
      // Add concluding section
      newContent += `<h3>Implications for ${topic.charAt(0).toUpperCase() + topic.slice(1)}</h3>`;
      
      if (tone === "professional") {
        newContent += `<p>For professionals working in ${topic}, these developments represent both challenges and opportunities. Organizations should consider updating their strategies to align with these emerging trends.</p>`;
      } else if (tone === "casual") {
        newContent += `<p>So what does all this mean for ${topic} enthusiasts like us? Well, it's definitely shaking things up! Keep an eye on these trends as they unfold.</p>`;
      } else if (tone === "academic") {
        newContent += `<p>These findings contribute to the existing body of knowledge on ${topic} and suggest several avenues for future research. Further studies may explore the causal relationships between these phenomena.</p>`;
      }
      
      // Add attribution
      newContent += `<p><em>This article was based on content from ${source}, published on ${new Date().toLocaleDateString()}.</em></p>`;
      
      return {
        title: newTitle,
        content: newContent
      };
    } catch (error) {
      console.error("Error in free content rewriting:", error);
      toast.error(`Failed to rewrite content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      
      // Return original content as fallback
      return {
        title,
        content
      };
    }
  }
  
  /**
   * Generates an image description that can be used with free image services
   */
  public async generateImagePrompt(
    title: string,
    content: string,
    topic: string = "general"
  ): Promise<string> {
    try {
      // Extract keywords from title and content
      const combinedText = title + " " + content.substring(0, 200);
      const words = combinedText.toLowerCase()
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/[^\w\s]/g, '') // Remove punctuation
        .split(/\s+/) // Split by whitespace
        .filter(word => word.length > 3 && !["this", "that", "with", "from", "about", "their", "there"].includes(word));
      
      // Get most frequent relevant words
      const wordCounts: Record<string, number> = {};
      words.forEach(word => {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      });
      
      // Sort words by frequency
      const sortedWords = Object.entries(wordCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(entry => entry[0]);
      
      // Create image prompt
      let imagePrompt = `${topic} concept with `;
      
      if (sortedWords.length > 0) {
        imagePrompt += sortedWords.join(", ");
      } else {
        imagePrompt += `visualization of ${topic}`;
      }
      
      imagePrompt += ", professional photography, high quality, detailed";
      
      return imagePrompt;
    } catch (error) {
      console.error("Error generating image prompt:", error);
      return `${topic} concept, professional photography`;
    }
  }
}

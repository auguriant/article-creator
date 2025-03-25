
/**
 * Service for free AI content generation (no API key required)
 */
import { toast } from "sonner";

interface RewrittenContent {
  title: string;
  content: string;
}

interface GeneratedArticle {
  content: string;
  summary?: string;
}

export class FreeAIService {
  private static instance: FreeAIService | null = null;
  
  private constructor() {}
  
  public static getInstance(): FreeAIService {
    if (!FreeAIService.instance) {
      FreeAIService.instance = new FreeAIService();
    }
    return FreeAIService.instance;
  }
  
  private simulateDelay(): Promise<void> {
    // Simulate AI processing delay (1-3 seconds)
    const delay = 1000 + Math.random() * 2000;
    return new Promise(resolve => setTimeout(resolve, delay));
  }
  
  /**
   * Rewrites content using a free AI alternative
   */
  public async rewriteContent(
    title: string,
    content: string,
    source: string,
    tone: string = "professional",
    topic: string = "general"
  ): Promise<RewrittenContent> {
    console.log(`Rewriting content with free AI service`);
    console.log(`Title: ${title}`);
    console.log(`Source: ${source}`);
    console.log(`Tone: ${tone}`);
    console.log(`Topic: ${topic}`);
    
    await this.simulateDelay();
    
    // This is a mock implementation that just transforms the content slightly
    // In a real implementation, this would call a free AI service
    
    // Make basic transformations to simulate rewriting
    const rewrittenTitle = this.rewriteTitle(title, tone);
    const rewrittenContent = this.rewriteText(content, tone, topic);
    
    return {
      title: rewrittenTitle,
      content: rewrittenContent
    };
  }
  
  /**
   * Generates an image prompt based on content
   */
  public async generateImagePrompt(
    title: string,
    content: string,
    topic: string
  ): Promise<string> {
    console.log(`Generating image prompt with free AI service`);
    await this.simulateDelay();
    
    // Extract important words and phrases
    const keywords = [...new Set([
      ...title.split(/\s+/).filter(word => word.length > 4),
      ...content.substring(0, 200).split(/\s+/).filter(word => word.length > 6)
    ])].slice(0, 5);
    
    // Create a prompt combining the title, topic, and some style guidance
    return `${title}, ${topic}, ${keywords.join(", ")}, high quality, detailed, professional photo`;
  }
  
  /**
   * Generates a full article from just a title
   */
  public async generateArticleFromTitle(
    title: string,
    topic: string = "general",
    tone: string = "professional"
  ): Promise<GeneratedArticle> {
    console.log(`Generating article from title with free AI service`);
    console.log(`Title: ${title}`);
    console.log(`Topic: ${topic}`);
    console.log(`Tone: ${tone}`);
    
    await this.simulateDelay();
    
    // In a real implementation, this would call a free AI service
    // For now, we'll generate a templated article
    
    const paragraphs = this.generateParagraphsFromTitle(title, topic, tone);
    const content = paragraphs.join("\n\n");
    const summary = this.generateSummaryFromTitle(title, topic);
    
    return {
      content,
      summary
    };
  }
  
  /**
   * Utility method to rewrite a title
   */
  private rewriteTitle(title: string, tone: string): string {
    // Simple rewrite logic - in a real implementation this would use an AI model
    const prefix = tone === "professional" ? "The Complete Guide to" :
                  tone === "casual" ? "Everything You Need to Know About" :
                  "A Comprehensive Analysis of";
                  
    // If the title already has a common prefix, don't add another one
    const commonPrefixes = ["How to", "Why", "The", "A Guide to", "Understanding"];
    const hasPrefix = commonPrefixes.some(p => title.startsWith(p));
    
    if (hasPrefix) {
      return title;
    }
    
    // Extract the main subject from the title
    const mainSubject = title.length > 30 ? title : `${prefix} ${title}`;
    return mainSubject;
  }
  
  /**
   * Utility method to rewrite text content
   */
  private rewriteText(text: string, tone: string, topic: string): string {
    // Basic rewrite - in a real implementation this would use an AI model
    const paragraphs = text.split(/\n\n+/);
    const rewrittenParagraphs = paragraphs.map(p => {
      if (p.trim().length < 10) return p;
      
      // Add topic-specific terminology
      const topicTerms = this.getTopicTerminology(topic);
      const hasTerm = topicTerms.some(term => p.includes(term));
      
      if (!hasTerm && topicTerms.length > 0) {
        // Add a relevant term
        const term = topicTerms[Math.floor(Math.random() * topicTerms.length)];
        return `${p} This relates to ${term} in important ways.`;
      }
      
      return p;
    });
    
    // Add an introduction and conclusion if the text is long enough
    if (text.length > 200) {
      const introduction = this.generateIntroduction(tone, topic);
      const conclusion = this.generateConclusion(tone);
      
      return `${introduction}\n\n${rewrittenParagraphs.join("\n\n")}\n\n${conclusion}`;
    }
    
    return rewrittenParagraphs.join("\n\n");
  }
  
  /**
   * Generates paragraphs based on a title
   */
  private generateParagraphsFromTitle(title: string, topic: string, tone: string): string[] {
    const paragraphs: string[] = [];
    
    // Introduction
    paragraphs.push(this.generateIntroduction(tone, topic));
    
    // Main content - generate 4-6 paragraphs
    const numParagraphs = 4 + Math.floor(Math.random() * 3);
    
    // Generate subtopics based on the title
    const subtopics = this.generateSubtopics(title, topic, numParagraphs);
    
    for (const subtopic of subtopics) {
      paragraphs.push(this.generateParagraphForSubtopic(subtopic, tone, topic));
    }
    
    // Conclusion
    paragraphs.push(this.generateConclusion(tone));
    
    return paragraphs;
  }
  
  /**
   * Generates a summary from a title
   */
  private generateSummaryFromTitle(title: string, topic: string): string {
    const summaries = [
      `A comprehensive exploration of ${title} and its implications for ${topic}.`,
      `This article examines the key aspects of ${title} and how they relate to ${topic}.`,
      `Discover the fascinating world of ${title} and why it matters in the context of ${topic}.`,
      `An in-depth analysis of ${title} that reveals important insights about ${topic}.`
    ];
    
    return summaries[Math.floor(Math.random() * summaries.length)];
  }
  
  /**
   * Generates an introduction paragraph
   */
  private generateIntroduction(tone: string, topic: string): string {
    const introductions = {
      professional: [
        `In today's rapidly evolving ${topic} landscape, professionals are constantly seeking innovative solutions to address emerging challenges. This article examines key developments and provides actionable insights for practitioners in the field.`,
        `The ${topic} sector has undergone significant transformation in recent years, with new technologies and methodologies reshaping traditional approaches. This analysis explores current trends and their implications for industry stakeholders.`
      ],
      casual: [
        `Hey there! Ever wondered what's really going on in the world of ${topic}? You're not alone! In this article, we'll break down the latest trends and give you some cool insights that you can actually use.`,
        `Let's face it - ${topic} can be confusing sometimes. But don't worry! We're going to walk through everything you need to know in simple, straightforward terms that anyone can understand.`
      ],
      academic: [
        `This paper examines the theoretical frameworks underpinning contemporary ${topic} discourse, with particular attention to the epistemological foundations and methodological approaches employed by researchers in the field.`,
        `Recent scholarly literature has highlighted significant paradigm shifts within ${topic} studies. This research contributes to the ongoing academic dialogue by synthesizing disparate theoretical perspectives and proposing a more integrated analytical framework.`
      ]
    };
    
    const options = introductions[tone as keyof typeof introductions] || introductions.professional;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  /**
   * Generates a conclusion paragraph
   */
  private generateConclusion(tone: string): string {
    const conclusions = {
      professional: [
        `In conclusion, organizations that adopt these evidence-based approaches will be better positioned to navigate the complexities of today's business environment. By implementing the strategies outlined above, professionals can enhance operational efficiency while driving sustainable growth.`,
        `Moving forward, industry leaders should consider how these insights can inform their strategic planning processes. Those who successfully integrate these principles will likely gain competitive advantage in an increasingly challenging marketplace.`
      ],
      casual: [
        `So there you have it! Now you're up to speed on everything you need to know. Remember, the most important thing is to keep learning and stay curious. Don't be afraid to try out some of these ideas yourself!`,
        `Bottom line? This stuff matters, and now you know why! Take these tips and run with them - you'll be surprised at how quickly you'll see results. And don't forget to share what you've learned with friends who might find it helpful too!`
      ],
      academic: [
        `This analysis contributes to the scholarly discourse by identifying critical intersections between theoretical constructs and empirical observations. Future research directions might include longitudinal studies examining the temporal dynamics of these relationships and cross-cultural comparisons to assess generalizability across diverse contexts.`,
        `The findings presented herein have significant implications for both theory development and empirical research methodologies. While acknowledging the limitations inherent in the current analytical framework, this paper establishes a foundation for more nuanced investigations of these complex phenomena.`
      ]
    };
    
    const options = conclusions[tone as keyof typeof conclusions] || conclusions.professional;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  /**
   * Generates subtopics based on a title
   */
  private generateSubtopics(title: string, topic: string, count: number): string[] {
    const genericSubtopics = [
      "Historical Background",
      "Current Trends",
      "Benefits and Advantages",
      "Challenges and Limitations",
      "Best Practices",
      "Case Studies",
      "Future Directions",
      "Practical Applications",
      "Theoretical Framework",
      "Comparative Analysis",
      "Implementation Strategies",
      "Key Considerations"
    ];
    
    // Shuffle and take the requested number
    return [...genericSubtopics]
      .sort(() => 0.5 - Math.random())
      .slice(0, count);
  }
  
  /**
   * Generates a paragraph for a specific subtopic
   */
  private generateParagraphForSubtopic(subtopic: string, tone: string, topic: string): string {
    const topicTerms = this.getTopicTerminology(topic);
    const randomTerm = topicTerms[Math.floor(Math.random() * topicTerms.length)] || topic;
    
    const paragraphs = {
      professional: [
        `When considering ${subtopic}, professionals in the ${topic} field must account for multiple factors. Research indicates that organizations implementing structured approaches achieve significantly better outcomes. Recent data suggests that ${randomTerm} plays a crucial role in optimizing performance and ensuring sustainable results over time.`,
        `${subtopic} represents a critical dimension of ${topic} strategy. Industry leaders have demonstrated that systematic analysis of key metrics can reveal valuable insights for decision-makers. The integration of ${randomTerm} has emerged as a best practice for organizations seeking to maintain competitive advantage in evolving market conditions.`
      ],
      casual: [
        `Let's talk about ${subtopic} for a minute. It's actually pretty fascinating when you dig into it! Most people don't realize how important this is in ${topic}. The cool thing about ${randomTerm} is how it connects everything together in ways you might not expect.`,
        `So what's the deal with ${subtopic}? Well, it turns out it's super important in ${topic}. Think about it - whenever you're dealing with ${randomTerm}, you're actually touching on some pretty complex stuff, but it doesn't have to be complicated!`
      ],
      academic: [
        `An examination of ${subtopic} reveals complex interdependencies within the broader ${topic} domain. Theoretical models suggest a correlation between structural variables and functional outcomes, particularly when mediated by ${randomTerm}. The literature indicates statistically significant relationships between these constructs (p < .05), though causality remains a subject of scholarly debate.`,
        `The ${subtopic} paradigm offers a useful heuristic for analyzing ${topic} phenomena. Meta-analyses of recent studies demonstrate consistent patterns across diverse contexts, with ${randomTerm} emerging as a significant predictor of observed variations. These findings challenge traditional assumptions and suggest the need for more nuanced theoretical frameworks.`
      ]
    };
    
    const options = paragraphs[tone as keyof typeof paragraphs] || paragraphs.professional;
    return options[Math.floor(Math.random() * options.length)];
  }
  
  /**
   * Returns terminology related to a specific topic
   */
  private getTopicTerminology(topic: string): string[] {
    const topicMap: Record<string, string[]> = {
      "technology": ["artificial intelligence", "machine learning", "blockchain", "cloud computing", "edge computing", "IoT", "big data", "neural networks"],
      "finance": ["cryptocurrency", "blockchain", "financial technology", "risk management", "portfolio diversification", "market volatility", "asset allocation"],
      "health": ["telemedicine", "preventive care", "healthcare informatics", "patient-centered care", "evidence-based medicine", "holistic approaches"],
      "education": ["e-learning", "adaptive learning systems", "educational technology", "student-centered pedagogy", "continuous assessment", "lifelong learning"],
      "marketing": ["customer segmentation", "digital marketing", "content strategy", "conversion optimization", "engagement metrics", "brand positioning"],
      "general": ["strategic implementation", "optimization", "innovative approaches", "systematic methodology", "best practices", "efficiency measures"]
    };
    
    // Normalize the topic to match our keys
    const normalizedTopic = topic.toLowerCase();
    let bestMatch = "general";
    
    // Find the best matching topic
    for (const key of Object.keys(topicMap)) {
      if (normalizedTopic.includes(key) || key.includes(normalizedTopic)) {
        bestMatch = key;
        break;
      }
    }
    
    return topicMap[bestMatch] || topicMap.general;
  }
}

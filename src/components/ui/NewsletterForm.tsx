
import { useState } from 'react';
import { Send } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const NewsletterForm = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setEmail('');
      toast({
        title: "Subscribed!",
        description: "Thank you for subscribing to our newsletter.",
      });
    }, 1000);
  };

  return (
    <div className="rounded-xl bg-secondary p-8 md:p-10">
      <div className="mx-auto max-w-3xl text-center">
        <h3 className="font-display text-2xl md:text-3xl font-bold mb-4">
          Subscribe to our newsletter
        </h3>
        <p className="text-muted-foreground md:text-lg max-w-xl mx-auto mb-8">
          Get the latest articles, resources, and insights delivered directly to your inbox.
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            required
            className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-foreground file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          />
          <button 
            type="submit" 
            className="btn-primary flex items-center h-12"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <div className="h-4 w-4 rounded-full border-2 border-background border-t-transparent animate-spin mr-2"></div>
            ) : (
              <Send size={16} className="mr-2" />
            )}
            Subscribe
          </button>
        </form>
        
        <p className="text-xs text-muted-foreground mt-4">
          By subscribing, you agree to our Privacy Policy and consent to receive updates.
        </p>
      </div>
    </div>
  );
};

export default NewsletterForm;

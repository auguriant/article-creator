
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import FeaturedPost from '@/components/blog/FeaturedPost';
import PostCard from '@/components/blog/PostCard';
import NewsletterForm from '@/components/ui/NewsletterForm';

// Mock data - in a real application, this would come from an API
const featuredPost = {
  id: "1",
  title: "The Art of Minimalism in Modern Design",
  excerpt: "Explore how minimalist design principles are transforming our digital and physical spaces, creating elegant and functional experiences.",
  category: "Design",
  date: "June 12, 2023",
  readTime: "8 min read",
  author: "Alex Morgan",
  coverImage: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
};

const recentPosts = [
  {
    id: "2",
    title: "Embracing Digital Simplicity",
    excerpt: "How the shift towards minimalist digital experiences is changing the way we interact with technology.",
    category: "Technology",
    date: "May 28, 2023",
    readTime: "6 min read",
    author: "Jamie Chen",
    coverImage: "https://images.unsplash.com/photo-1550439062-609e1531270e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: "3",
    title: "The Psychology of White Space",
    excerpt: "Understanding how intentional emptiness in design impacts user perception and behavior.",
    category: "Design",
    date: "May 15, 2023",
    readTime: "7 min read",
    author: "Taylor Wilson",
    coverImage: "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    id: "4",
    title: "Sustainable Minimalism in Everyday Life",
    excerpt: "How adopting minimalist principles can lead to more sustainable and meaningful living.",
    category: "Lifestyle",
    date: "April 30, 2023",
    readTime: "5 min read",
    author: "Jordan Lee",
    coverImage: "https://images.unsplash.com/photo-1493552152471-f333bbe57084?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1074&q=80"
  }
];

const popularCategories = [
  {
    name: "Design",
    count: 24,
    image: "https://images.unsplash.com/photo-1561070791-36c11767b26a?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80"
  },
  {
    name: "Technology",
    count: 18,
    image: "https://images.unsplash.com/photo-1531297484001-80022131f5a1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1420&q=80"
  },
  {
    name: "Lifestyle",
    count: 15,
    image: "https://images.unsplash.com/photo-1511018556340-d16986a1c194?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80"
  },
  {
    name: "Productivity",
    count: 12,
    image: "https://images.unsplash.com/photo-1517430816045-df4b7de11d1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80"
  }
];

const Index = () => {
  useEffect(() => {
    // Scroll to top on component mount
    window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Navbar />
      
      <main className="pt-24">
        {/* Hero Section */}
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-5xl mx-auto text-center space-y-6 animate-fade-in">
            <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium mb-2">
              Modern Minimalist Blog
            </div>
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight leading-tight">
              Explore the beauty of <span className="text-accent">simplicity</span>
            </h1>
            <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto">
              Thoughtful perspectives on design, technology, and mindful living. 
              Discover ideas that inspire a more intentional approach to modern life.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link to="/blog" className="btn-primary">
                Browse Articles
              </Link>
              <Link to="/about" className="btn-outline">
                About Us
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Post Section */}
        <section className="container mx-auto px-6 py-16 md:py-24 bg-secondary/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                Featured Article
              </h2>
              <Link 
                to="/blog" 
                className="group hidden md:inline-flex items-center text-accent font-medium"
              >
                View all articles 
                <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            
            <FeaturedPost {...featuredPost} />
          </div>
        </section>

        {/* Recent Posts Section */}
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-display text-2xl md:text-3xl font-bold">
                Recent Articles
              </h2>
              <Link 
                to="/blog" 
                className="group hidden md:inline-flex items-center text-accent font-medium"
              >
                View all articles 
                <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {recentPosts.map((post) => (
                <PostCard key={post.id} {...post} />
              ))}
            </div>
            
            <div className="text-center mt-12 md:hidden">
              <Link to="/blog" className="btn-outline">
                View all articles
              </Link>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="container mx-auto px-6 py-16 md:py-24 bg-secondary/50">
          <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Explore by Category
              </h2>
              <p className="text-muted-foreground">
                Discover articles across a range of topics, curated to inspire and inform.
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
              {popularCategories.map((category) => (
                <Link 
                  to={`/category/${category.name.toLowerCase()}`}
                  key={category.name}
                  className="group relative overflow-hidden rounded-lg aspect-[3/4] shadow-sm card-hover"
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/30 z-10"></div>
                  <img 
                    src={category.image} 
                    alt={category.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="font-display text-white text-xl font-bold mb-1">
                      {category.name}
                    </h3>
                    <span className="text-white/80 text-sm">
                      {category.count} articles
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-10 items-center">
            <div className="space-y-6">
              <div className="inline-block px-3 py-1 bg-accent/10 text-accent rounded-full text-sm font-medium">
                About Us
              </div>
              <h2 className="font-display text-3xl md:text-4xl font-bold">
                A space dedicated to thoughtful ideas
              </h2>
              <p className="text-muted-foreground text-lg">
                We created Minimal as a sanctuary for those who appreciate the elegance of simplicity. 
                Our blog is a collection of carefully crafted articles that explore the intersection of 
                design, technology, and mindful living.
              </p>
              <p className="text-muted-foreground">
                Our writers are passionate about sharing insights that help readers create more 
                intentional, meaningful experiences in both their digital and physical worlds.
              </p>
              <div className="pt-4">
                <Link to="/about" className="btn-outline">
                  Learn more about us
                </Link>
              </div>
            </div>
            
            <div className="relative">
              <div className="absolute -bottom-6 -right-6 w-2/3 h-2/3 bg-accent/10 rounded-lg"></div>
              <img 
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" 
                alt="Our team" 
                className="relative z-10 rounded-lg shadow-lg w-full aspect-video object-cover"
              />
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-7xl mx-auto">
            <NewsletterForm />
          </div>
        </section>
      </main>
      
      <Footer />
    </>
  );
};

export default Index;

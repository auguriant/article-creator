
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  const year = new Date().getFullYear();
  
  return (
    <footer className="bg-secondary py-16">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Logo and information */}
          <div className="md:col-span-4 space-y-4">
            <Link to="/" className="text-3xl font-display font-bold tracking-tighter">
              Minimal<span className="text-accent">.</span>
            </Link>
            <p className="text-muted-foreground max-w-sm">
              A modern, minimalist blog that celebrates simplicity, design, and thoughtful content.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <a 
                href="https://github.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background text-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
                aria-label="GitHub"
              >
                <Github size={18} />
              </a>
              <a 
                href="https://twitter.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background text-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
                aria-label="Twitter"
              >
                <Twitter size={18} />
              </a>
              <a 
                href="https://instagram.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="p-2 rounded-full bg-background text-foreground transition-all duration-300 hover:bg-accent hover:text-accent-foreground"
                aria-label="Instagram"
              >
                <Instagram size={18} />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-display font-medium text-lg">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/blog" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Blog
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  About
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div className="md:col-span-2 space-y-4">
            <h3 className="font-display font-medium text-lg">Categories</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/category/design" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Design
                </Link>
              </li>
              <li>
                <Link to="/category/technology" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Technology
                </Link>
              </li>
              <li>
                <Link to="/category/lifestyle" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Lifestyle
                </Link>
              </li>
              <li>
                <Link to="/category/productivity" className="text-muted-foreground hover:text-foreground transition-colors duration-200">
                  Productivity
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact information */}
          <div className="md:col-span-4 space-y-4">
            <h3 className="font-display font-medium text-lg">Contact</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Mail size={16} />
                <span>hello@minimal.blog</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Phone size={16} />
                <span>+1 (555) 123-4567</span>
              </div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <MapPin size={16} className="mt-1 flex-shrink-0" />
                <span>123 Design Street, San Francisco, CA 94107</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {year} Minimal Blog. All rights reserved.
          </p>
          <div className="flex items-center space-x-6">
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Terms
            </Link>
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Privacy
            </Link>
            <Link to="/cookies" className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200">
              Cookies
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

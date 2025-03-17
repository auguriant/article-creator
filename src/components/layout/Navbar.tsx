
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X, Moon, Sun } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass py-2 shadow-sm' : 'py-6'
      }`}
    >
      <div className="container mx-auto px-6 flex items-center justify-between">
        <Link 
          to="/" 
          className="text-2xl font-display font-bold tracking-tight transition-all duration-300 hover:opacity-80"
          aria-label="Home"
        >
          Minimal<span className="text-accent">.</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <Link 
            to="/" 
            className="text-sm font-medium transition-all duration-300 hover:text-accent"
          >
            Home
          </Link>
          <Link 
            to="/blog" 
            className="text-sm font-medium transition-all duration-300 hover:text-accent"
          >
            Blog
          </Link>
          <Link 
            to="/about" 
            className="text-sm font-medium transition-all duration-300 hover:text-accent"
          >
            About
          </Link>
          <Link 
            to="/contact" 
            className="text-sm font-medium transition-all duration-300 hover:text-accent"
          >
            Contact
          </Link>
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-secondary transition-all duration-300 hover:bg-secondary/80"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </nav>

        {/* Mobile menu button */}
        <div className="flex md:hidden items-center space-x-4">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-secondary transition-all duration-300 hover:bg-secondary/80"
            aria-label="Toggle dark mode"
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 rounded-full bg-secondary transition-all duration-300 hover:bg-secondary/80"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass dark:glass-dark animate-slide-down">
          <div className="container mx-auto px-6 py-6 flex flex-col space-y-6">
            <Link 
              to="/" 
              className="text-lg font-medium transition-all duration-300 hover:text-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link 
              to="/blog" 
              className="text-lg font-medium transition-all duration-300 hover:text-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Blog
            </Link>
            <Link 
              to="/about" 
              className="text-lg font-medium transition-all duration-300 hover:text-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              About
            </Link>
            <Link 
              to="/contact" 
              className="text-lg font-medium transition-all duration-300 hover:text-accent"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Contact
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;

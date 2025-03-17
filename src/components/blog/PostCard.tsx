
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, User } from 'lucide-react';

interface PostCardProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  coverImage: string;
  className?: string;
}

const PostCard = ({
  id,
  title,
  excerpt,
  category,
  date,
  readTime,
  author,
  coverImage,
  className = '',
}: PostCardProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = coverImage;
    img.onload = () => setImageLoaded(true);
  }, [coverImage]);

  return (
    <article 
      className={`group overflow-hidden rounded-lg bg-card shadow-sm card-hover ${className}`}
    >
      <Link to={`/blog/${id}`} className="block aspect-[16/9] w-full overflow-hidden">
        <div
          className={`blur-load w-full h-full ${imageLoaded ? 'loaded' : ''}`}
          style={{ backgroundImage: `url(${coverImage})` }}
        >
          <img
            src={coverImage}
            alt={title}
            className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-105 ${
              imageLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            loading="lazy"
          />
        </div>
      </Link>
      
      <div className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Link 
            to={`/category/${category.toLowerCase()}`}
            className="text-xs font-medium uppercase tracking-wide text-accent"
          >
            {category}
          </Link>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock size={14} />
            <span>{readTime}</span>
          </div>
        </div>
        
        <Link to={`/blog/${id}`}>
          <h3 className="font-display text-xl font-bold leading-tight mb-2 transition-colors duration-200 group-hover:text-accent">
            {title}
          </h3>
        </Link>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {excerpt}
        </p>
        
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-2">
            <User size={16} className="text-muted-foreground" />
            <span className="text-sm">{author}</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <CalendarDays size={14} />
            <span>{date}</span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default PostCard;

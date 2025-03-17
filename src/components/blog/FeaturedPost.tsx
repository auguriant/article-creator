
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock, ArrowRight, User } from 'lucide-react';

interface FeaturedPostProps {
  id: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  author: string;
  coverImage: string;
}

const FeaturedPost = ({
  id,
  title,
  excerpt,
  category,
  date,
  readTime,
  author,
  coverImage,
}: FeaturedPostProps) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = coverImage;
    img.onload = () => setImageLoaded(true);
  }, [coverImage]);

  return (
    <article className="group grid md:grid-cols-5 gap-8 items-center overflow-hidden rounded-lg bg-card p-6 lg:p-8 shadow-sm card-hover">
      <div className="md:col-span-3 flex flex-col space-y-4">
        <div className="flex items-center space-x-4">
          <Link 
            to={`/category/${category.toLowerCase()}`}
            className="text-xs font-medium uppercase tracking-wide bg-accent/10 text-accent px-3 py-1 rounded-full"
          >
            {category}
          </Link>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <CalendarDays size={16} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock size={16} />
            <span>{readTime}</span>
          </div>
        </div>

        <Link to={`/blog/${id}`}>
          <h2 className="font-display text-3xl md:text-4xl font-bold leading-tight transition-colors duration-200 group-hover:text-accent">
            {title}
          </h2>
        </Link>

        <p className="text-muted-foreground md:text-lg">
          {excerpt}
        </p>

        <div className="flex items-center justify-between pt-4">
          <div className="flex items-center gap-2">
            <User size={18} className="text-muted-foreground" />
            <span className="text-sm md:text-base">{author}</span>
          </div>
          <Link 
            to={`/blog/${id}`}
            className="group inline-flex items-center text-accent font-medium"
          >
            Read more 
            <ArrowRight size={16} className="ml-1 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>

      <Link 
        to={`/blog/${id}`}
        className="md:col-span-2 block aspect-[4/3] w-full overflow-hidden rounded-lg"
      >
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
    </article>
  );
};

export default FeaturedPost;

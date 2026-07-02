import React, { useState, useEffect, useRef, memo } from 'react';
import './OptimizedImage.css';

const OptimizedImage = memo(({ 
  src, 
  placeholder, 
  alt, 
  ratio = '16 / 9', 
  className = '',
  sizes = '(max-width: 768px) 100vw, 50vw' 
}) => {
  const [isInView, setIsInView] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef(null);
  const imgRef = useRef(null);

  // Check if image is from API or external source
  const isDynamicImage = (source) => {
    if (!source || typeof source !== 'string') return false;
    return source.includes('/api/') || source.startsWith('http://') || source.startsWith('https://');
  };

  // Generate srcset automatically based on our pipeline's naming convention
  const generateSrcset = (baseSrc) => {
    if (!baseSrc || typeof baseSrc !== 'string') return '';
    if (isDynamicImage(baseSrc)) return ''; // Skip for API images
    
    const dotIndex = baseSrc.lastIndexOf('.');
    if (dotIndex === -1) return '';
    
    const base = baseSrc.substring(0, dotIndex);
    const widths = [320, 640, 1024, 1600];
    
    return widths
      .map(w => `${base}-${w}w.webp ${w}w`)
      .join(', ');
  };

  const getTinyPlaceholder = (baseSrc) => {
    if (!baseSrc || typeof baseSrc !== 'string') return placeholder;
    if (isDynamicImage(baseSrc)) return null; // Skip blur placeholder for API images

    const dotIndex = baseSrc.lastIndexOf('.');
    if (dotIndex === -1) return placeholder;
    return `${baseSrc.substring(0, dotIndex)}-320w.webp`;
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '200px' } // Start loading 200px before it enters
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, []);

  const handleImageMount = (element) => {
    imgRef.current = element;
    if (element && element.complete) {
      if (element.naturalWidth > 0) {
        setIsLoaded(true);
      }
    }
  };

  const webpSrcset = generateSrcset(src);
  const tinyPlaceholder = placeholder === src ? getTinyPlaceholder(src) : placeholder;

  return (
    <div 
      ref={containerRef}
      className={`optimized-image-container ${isLoaded ? 'loaded' : ''} ${hasError ? 'error' : ''} ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {/* Blur-up Placeholder */}
      {tinyPlaceholder && !isLoaded && !hasError && (
        <img
          src={tinyPlaceholder}
          alt=""
          className="image-placeholder"
          aria-hidden="true"
        />
      )}
      
      {/* High-Res Responsive Image */}
      {isInView && (
        <picture className="image-full">
          {webpSrcset && <source srcSet={webpSrcset} type="image/webp" sizes={sizes} />}
          <img
            ref={handleImageMount}
            src={src}
            alt={alt}
            className="image-full-img"
            onLoad={() => setIsLoaded(true)}
            onError={() => { setHasError(true); setIsLoaded(true); }}
            decoding="async"
          />
        </picture>
      )}
      
      {/* Skeleton Overlay */}
      {!isLoaded && !hasError && <div className="skeleton-overlay"></div>}
      
      {/* Error Fallback */}
      {hasError && (
        <div className="image-error-placeholder">
          <span></span>
        </div>
      )}
    </div>
  );
});

export default OptimizedImage;

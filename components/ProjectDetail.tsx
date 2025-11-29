import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Project, ProjectImage } from '../types';

interface ProjectDetailProps {
  project: Project;
}

type Slide = {
  url: string;
  alt?: string;
  type: 'image' | 'youtube';
};

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const isYouTubeUrl = (url: string) => {
    return /youtube\.com\/watch\?v=|youtu\.be\//i.test(url);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
    if (!match) return null;
    return `https://www.youtube.com/embed/${match[1]}`;
  };

  const toSlide = (img: ProjectImage): Slide => {
    if (typeof img === 'string') {
      const inferredType: Slide['type'] = isYouTubeUrl(img) ? 'youtube' : 'image';
      return { url: img, type: inferredType };
    }

    const inferredType: Slide['type'] = img.type ? img.type : isYouTubeUrl(img.url) ? 'youtube' : 'image';
    return { url: img.url, alt: img.alt, type: inferredType };
  };

  // Combine gallery images. If no gallery images, use thumbnail as single slide.
  const slides: Slide[] = (project.images.length > 0 ? project.images : [project.thumbnail]).map(toSlide);

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef(false);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleTouchStart = (event: React.TouchEvent) => {
    const touch = event.touches[0];
    touchStartX.current = touch.clientX;
    touchStartY.current = touch.clientY;
    isSwiping.current = false;
  };

  const handleTouchMove = (event: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null) return;
    const touch = event.touches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    // Only treat as swipe if horizontal intent is clear to avoid hijacking vertical scroll.
    if (!isSwiping.current && Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 10) {
      isSwiping.current = true;
    }
  };

  const handleTouchEnd = (event: React.TouchEvent) => {
    if (touchStartX.current === null || touchStartY.current === null || !isSwiping.current) return;
    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchStartX.current;
    const deltaY = touch.clientY - touchStartY.current;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 40) {
      if (deltaX < 0) {
        nextSlide();
      } else {
        prevSlide();
      }
    }

    touchStartX.current = null;
    touchStartY.current = null;
    isSwiping.current = false;
  };

  return (
    <div className="flex flex-col lg:flex-row h-full bg-white">
      {/* Left Column: Text & Info - Scrollable */}
      <div className="w-full lg:w-5/12 h-auto lg:h-full overflow-y-auto custom-scrollbar p-8 md:p-12 lg:p-16 border-r border-gray-100">
        <div className="max-w-xl mx-auto lg:max-w-none">
          
          {/* Header */}
          <h1 className="text-3xl md:text-4xl font-bold mb-8 leading-tight">{project.title}</h1>
          
          {/* Rich Text Description */}
          <div 
            className="prose prose-sm md:prose-base max-w-none text-gray-600 mb-8
                       prose-headings:font-bold prose-headings:text-black
                       prose-a:text-[#ec2227] prose-a:no-underline hover:prose-a:underline
                       prose-ul:list-disc prose-ul:pl-4"
            dangerouslySetInnerHTML={{ __html: project.description }}
          />

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm mb-12 font-mono text-gray-500 border-t border-gray-100 pt-8">
            <div>
               <span className="block text-xs uppercase tracking-widest mb-1 text-gray-400">Category</span>
               <span className="text-black">{project.category}</span>
            </div>
            <div>
               <span className="block text-xs uppercase tracking-widest mb-1 text-gray-400">Year</span>
               <span className="text-black">{project.year}</span>
            </div>
            {project.client && (
              <div className="col-span-2">
                 <span className="block text-xs uppercase tracking-widest mb-1 text-gray-400">Client</span>
                 <span className="text-black">{project.client}</span>
              </div>
            )}
          </div>

          {/* Thumbnail Image (Placed at bottom left as per request) */}
          <div className="mt-auto">
             <img 
               src={project.thumbnail} 
               alt="Project Thumbnail" 
               className="w-full h-auto rounded-sm shadow-sm grayscale hover:grayscale-0 transition-all duration-500"
             />
          </div>
        </div>
      </div>

      {/* Right Column: Gallery Slideshow - Fixed Height on Mobile, Full Height on Desktop */}
      <div 
        className="w-full lg:w-7/12 h-[50vh] lg:h-full bg-[#e5e5e5] relative group flex items-center justify-center overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        
        {/* Slides */}
        <div className="w-full h-full p-8 md:p-12 lg:p-16 flex items-center justify-center">
            {slides[currentSlide].type === 'youtube' ? (
              <div 
                key={`video-${currentSlide}`}
                className="w-full h-full flex items-center justify-center animate-in fade-in duration-300"
              >
                <div className="relative w-full h-full rounded shadow-xl overflow-hidden bg-black">
                  <iframe
                    src={getYouTubeEmbedUrl(slides[currentSlide].url) || slides[currentSlide].url}
                    title={slides[currentSlide].alt || `YouTube video ${currentSlide + 1}`}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            ) : (
              <img 
                key={`image-${currentSlide}`}
                src={slides[currentSlide].url}
                alt={slides[currentSlide].alt || `Slide ${currentSlide + 1}`}
                className="max-w-full max-h-full object-contain shadow-xl animate-in fade-in duration-300"
              />
            )}
        </div>

        {/* Navigation Overlays */}
        {slides.length > 1 && (
          <>
            <button 
              onClick={(e) => { e.stopPropagation(); prevSlide(); }}
              className="absolute left-0 top-0 bottom-0 w-16 md:w-24 flex items-center justify-center hover:bg-black/5 transition-colors group/nav"
              aria-label="Previous Image"
            >
              <div className="bg-black/50 text-white p-3 md:p-4 opacity-0 group-hover/nav:opacity-100 transition-opacity">
                 <ChevronLeft size={24} />
              </div>
            </button>
            
            <button 
              onClick={(e) => { e.stopPropagation(); nextSlide(); }}
              className="absolute right-0 top-0 bottom-0 w-16 md:w-24 flex items-center justify-center hover:bg-black/5 transition-colors group/nav"
              aria-label="Next Image"
            >
              <div className="bg-black/50 text-white p-3 md:p-4 opacity-0 group-hover/nav:opacity-100 transition-opacity">
                 <ChevronRight size={24} />
              </div>
            </button>

            {/* Counter */}
            <div className="absolute bottom-6 right-6 bg-black/50 text-white px-3 py-1 text-xs font-mono rounded-full">
               {currentSlide + 1} / {slides.length}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

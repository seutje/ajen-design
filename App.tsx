import React, { useState, useEffect, useMemo } from 'react';
import { SiteContent, Project, Exhibition } from './types';
import { Header } from './components/Header';
import { Button } from './components/Button';
import { AdminControl } from './components/AdminControl';
import { ProjectDetail } from './components/ProjectDetail';
import { ArrowUpRight, ChevronUp } from 'lucide-react';

export default function App() {
  const [content, setContent] = useState<SiteContent | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadContent = async () => {
      try {
        const response = await fetch('./content.json');
        if (!response.ok) {
          throw new Error(`Failed to load content: ${response.statusText}`);
        }
        const data = await response.json();
        setContent(data);

        // Check for admin param
        const params = new URLSearchParams(window.location.search);
        if (params.has('admin')) {
          setIsAdmin(true);
        }
      } catch (err) {
        console.error("Error loading content:", err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (selectedProjectId) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProjectId]);

  // Filter Projects
  const filteredProjects = useMemo(() => {
    if (!content) return [];
    if (activeCategory === 'all') return content.projects;
    return content.projects.filter(p => p.category === activeCategory);
  }, [content, activeCategory]);

  const categories = useMemo(() => {
    if (!content) return ['all'];
    const cats = new Set(content.projects.map(p => p.category));
    return ['all', ...Array.from(cats)];
  }, [content]);

  // Modal Logic
  const selectedProjectIndex = useMemo(() => {
    return filteredProjects.findIndex(p => p.id === selectedProjectId);
  }, [filteredProjects, selectedProjectId]);

  const selectedProject = filteredProjects[selectedProjectIndex];

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (selectedProjectIndex === -1) return;
    
    let newIndex = direction === 'next' ? selectedProjectIndex + 1 : selectedProjectIndex - 1;
    
    // Cycle through
    if (newIndex >= filteredProjects.length) newIndex = 0;
    if (newIndex < 0) newIndex = filteredProjects.length - 1;
    
    setSelectedProjectId(filteredProjects[newIndex].id);
  };

  const handleCloseModal = () => {
    setSelectedProjectId(null);
  };
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  // Sort Exhibitions (Newest First)
  const sortedExhibitions = useMemo(() => {
    if (!content) return [];
    return [...content.exhibitions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [content]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <div className="text-xs uppercase tracking-widest animate-pulse">Loading content...</div>
      </div>
    );
  }

  if (error || !content) {
    return (
      <div className="h-screen w-full flex flex-col items-center justify-center bg-white text-red-500 p-6 text-center">
        <div className="text-xs uppercase tracking-widest font-bold mb-2">Error</div>
        <div className="text-sm">{error || "Content configuration missing"}</div>
        <p className="text-xs text-gray-400 mt-4">Please ensure content.json is present in the root directory.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header 
        isModalOpen={!!selectedProjectId} 
        onNavigateProject={handleNavigate}
        onCloseModal={handleCloseModal}
        currentProjectIndex={selectedProjectIndex}
        totalProjects={filteredProjects.length}
        logoUrl={content.logoUrl}
      />

      {/* Main Content Layer - Hidden when modal is open on small screens, or blurred/pushed back */}
      <main className={`transition-opacity duration-500 ${selectedProjectId ? 'opacity-0 lg:opacity-100' : 'opacity-100'}`}>
        
        {/* Hero Section */}
        <section id="hero" className="relative h-screen w-full flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 z-0">
             <img 
               src="https://picsum.photos/1920/1080?grayscale" 
               alt="Hero Background" 
               className="w-full h-full object-cover opacity-80"
             />
             <div className="absolute inset-0 bg-white/30" />
          </div>
          
          <div className="relative z-10 text-center p-8 bg-white/80 backdrop-blur-sm mx-4 max-w-2xl flex flex-col items-center">
            {content.heroLogoUrl && (
              <img 
                src={content.heroLogoUrl} 
                alt="Logo" 
                className="w-24 md:w-32 mb-6"
              />
            )}
            <h1 className="text-4xl md:text-6xl font-light tracking-tighter mb-4 text-black lowercase">
              ajen design
            </h1>
            <div className="h-px w-24 bg-black mx-auto mb-4"></div>
            <p className="text-sm md:text-base uppercase tracking-[0.3em] text-gray-700">
              Visual Communication
            </p>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfolio" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0">
            <h2 className="text-xl uppercase tracking-widest font-bold">Selected Works</h2>
            
            {/* Filter */}
            <div className="flex flex-wrap gap-4">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`text-xs uppercase tracking-wider pb-1 border-b transition-colors ${
                    activeCategory === cat ? 'border-black text-black' : 'border-transparent text-gray-400 hover:text-black'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-4">
            {filteredProjects.map((project) => (
              <div 
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="group relative aspect-square cursor-pointer overflow-hidden bg-gray-100"
              >
                <img 
                  src={project.thumbnail} 
                  alt={project.title} 
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0 text-center">
                    <h3 className="text-white text-xl font-light lowercase mb-1">{project.title}</h3>
                    <span className="text-gray-300 text-xs uppercase tracking-widest">{project.category}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Exhibitions Section */}
        <section id="exhibitions" className="py-24 px-6 md:px-12 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl uppercase tracking-widest font-bold mb-12">Exhibitions</h2>
            
            <div className="space-y-0 divide-y divide-gray-200 border-t border-b border-gray-200">
              {sortedExhibitions.map((ex) => (
                <div key={ex.id} className="grid grid-cols-1 md:grid-cols-4 py-6 gap-4 group hover:bg-white transition-colors px-4 -mx-4">
                   <div className="md:col-span-1 text-sm text-gray-400 font-mono">
                     {ex.date}
                   </div>
                   <div className="md:col-span-2">
                     <h3 className="text-lg font-medium lowercase text-[#ec2227]">{ex.title}</h3>
                     <p className="text-sm text-gray-500 mt-1">{ex.location}</p>
                   </div>
                   <div className="md:col-span-1 flex justify-start md:justify-end items-center">
                      {ex.link && (
                        <a 
                          href={ex.link} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center text-xs uppercase tracking-wider hover:underline"
                        >
                          Details <ArrowUpRight size={14} className="ml-1" />
                        </a>
                      )}
                   </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact" className="pt-24 pb-32 px-6 md:px-12 bg-white text-center">
           <div className="flex items-center justify-center w-full max-w-lg mx-auto mb-8 opacity-20">
               <div className="h-px bg-black flex-grow border-t border-dotted border-black"></div>
               <h2 className="px-4 text-xl uppercase tracking-widest font-bold text-black">Get In Touch</h2>
               <div className="h-px bg-black flex-grow border-t border-dotted border-black"></div>
           </div>

           <a 
             href={`mailto:${content.contactEmail}`}
             className="text-2xl md:text-4xl font-bold text-gray-400 hover:text-[#ec2227] transition-colors"
           >
             {content.contactEmail}
           </a>
        </section>
        
        {/* Footer */}
        <footer className="relative bg-[#222222] py-24 flex flex-col items-center justify-center">
           <button 
             onClick={scrollToTop}
             className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-[#333333] p-3 hover:bg-[#ec2227] transition-colors text-white shadow-lg"
             title="Scroll to Top"
           >
             <ChevronUp size={24} />
           </button>

           <div className="mb-6">
              {content.logoUrl ? (
                <img 
                  src={content.logoUrl} 
                  alt="ajen design" 
                  className="h-8 w-auto object-contain brightness-0 invert opacity-50 hover:opacity-100 transition-opacity"
                />
              ) : (
                <div className="w-8 h-8 bg-white flex items-center justify-center">
                    <span className="text-black font-bold text-xs">a</span>
                </div>
              )}
           </div>

           <div className="text-[#666666] text-[10px] uppercase tracking-[0.2em] flex items-center gap-1">
             <button 
               onClick={() => setIsAdmin(prev => !prev)} 
               className="cursor-default focus:outline-none hover:text-white transition-colors" 
               title="Toggle Admin"
             >
               &copy;
             </button>
             <span>{new Date().getFullYear()} ajen design. All rights reserved.</span>
           </div>
        </footer>

      </main>

      {/* Project Detail Overlay */}
      {selectedProject && (
        <div className="fixed inset-0 z-40 bg-white pt-20 animate-in fade-in duration-300">
          <ProjectDetail project={selectedProject} />
        </div>
      )}

      {/* Admin Interface */}
      {isAdmin && (
        <AdminControl content={content} onUpdate={setContent} />
      )}
    </div>
  );
}
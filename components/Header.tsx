import React from 'react';
import { Menu, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Project } from '../types';

interface HeaderProps {
  isModalOpen: boolean;
  onNavigateProject: (direction: 'prev' | 'next') => void;
  onCloseModal: () => void;
  currentProjectIndex?: number;
  totalProjects?: number;
  logoUrl?: string;
}

export const Header: React.FC<HeaderProps> = ({ 
  isModalOpen, 
  onNavigateProject, 
  onCloseModal,
  currentProjectIndex,
  totalProjects,
  logoUrl
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  if (isModalOpen) {
    return (
      <header className="fixed top-0 left-0 right-0 h-20 bg-[#222222] z-50 flex items-center justify-between px-6 md:px-12 border-b border-gray-800 transition-all duration-300">
        <div className="flex items-center space-x-6">
          <button 
            onClick={() => onNavigateProject('prev')}
            className="group flex items-center space-x-2 text-[#bfbfbf] hover:text-[#ec2227] transition-colors"
            title="Previous Project"
          >
            <ChevronLeft size={20} />
            <span className="hidden md:inline text-xs uppercase tracking-widest group-hover:underline">prev</span>
          </button>
          
          <span className="text-xs text-gray-500 font-mono">
             {currentProjectIndex !== undefined && totalProjects 
               ? `${currentProjectIndex + 1} / ${totalProjects}` 
               : ''}
          </span>

          <button 
            onClick={() => onNavigateProject('next')}
            className="group flex items-center space-x-2 text-[#bfbfbf] hover:text-[#ec2227] transition-colors"
            title="Next Project"
          >
            <span className="hidden md:inline text-xs uppercase tracking-widest group-hover:underline">next</span>
            <ChevronRight size={20} />
          </button>
        </div>

        <button 
          onClick={onCloseModal}
          className="group flex items-center space-x-2 text-[#bfbfbf] hover:text-[#ec2227] transition-colors"
        >
          <span className="hidden md:inline text-xs uppercase tracking-widest group-hover:underline">close</span>
          <X size={24} />
        </button>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-20 bg-[#222222]/90 backdrop-blur-sm z-40 flex items-center justify-between px-6 md:px-12 border-b border-transparent transition-all duration-300">
      <div className="flex items-center cursor-pointer" onClick={() => scrollToSection('hero')}>
        {/* Logo Mark */}
        {logoUrl ? (
           <img 
             src={logoUrl} 
             alt="ajen design" 
             className="h-8 w-auto mr-3 object-contain"
             onError={(e) => {
               // Fallback to text if image fails to load
               e.currentTarget.style.display = 'none';
               // You could also toggle a state to show the default logo
             }}
           />
        ) : (
          <div className="w-8 h-8 bg-white flex items-center justify-center mr-3">
              <span className="text-black font-bold text-xs">a</span>
          </div>
        )}
        <span className="text-lg font-medium tracking-tight text-white">ajen design</span>
      </div>

      {/* Desktop Menu */}
      <nav className="hidden md:flex items-center space-x-8">
        {['portfolio', 'exhibitions', 'contact'].map((item) => (
          <button
            key={item}
            onClick={() => scrollToSection(item)}
            className="text-sm text-[#bfbfbf] hover:text-[#ec2227] transition-colors uppercase tracking-widest hover:underline decoration-1 underline-offset-4 decoration-[#ec2227]"
          >
            {item}
          </button>
        ))}
      </nav>

      {/* Mobile Menu Toggle */}
      <button 
        className="md:hidden text-[#bfbfbf] hover:text-[#ec2227] p-2"
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="absolute top-20 left-0 right-0 bg-[#222222] border-b border-gray-800 p-6 md:hidden shadow-lg animate-in fade-in slide-in-from-top-5">
          <div className="flex flex-col space-y-6">
             {['portfolio', 'exhibitions', 'contact'].map((item) => (
              <button
                key={item}
                onClick={() => scrollToSection(item)}
                className="text-lg text-left text-[#bfbfbf] hover:text-[#ec2227] uppercase tracking-widest"
              >
                {item}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};
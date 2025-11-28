import React, { useState } from 'react';
import { Settings, Download, Upload, Plus, Trash2, X, ArrowUp, ArrowDown } from 'lucide-react';
import { SiteContent, Project, Exhibition } from '../types';
import { Button } from './Button';
import { RichTextEditor } from './RichTextEditor';

interface AdminControlProps {
  content: SiteContent;
  onUpdate: (content: SiteContent) => void;
}

export const AdminControl: React.FC<AdminControlProps> = ({ content, onUpdate }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'projects' | 'exhibitions' | 'settings'>('projects');
  
  // Local buffer for changes
  const [draftContent, setDraftContent] = useState<SiteContent>(content);

  const handleOpen = () => {
    // Deep copy content to draft when opening to ensure fresh start
    setDraftContent(JSON.parse(JSON.stringify(content)));
    setIsOpen(true);
  };

  const handleClose = () => {
    // Apply changes to the main app state when closing
    onUpdate(draftContent);
    setIsOpen(false);
  };

  const handleExport = () => {
    // Export the current draft content
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(draftContent, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "content.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
      fileReader.readAsText(event.target.files[0], "UTF-8");
      fileReader.onload = (e) => {
        if (e.target?.result) {
          try {
            const parsed = JSON.parse(e.target.result as string);
            setDraftContent(parsed); // Update draft
          } catch (error) {
            alert("Invalid JSON file");
          }
        }
      };
    }
  };

  // Helper to update specific project field in draft
  const updateProject = (id: string, field: keyof Project, value: any) => {
    const updatedProjects = draftContent.projects.map(p => 
      p.id === id ? { ...p, [field]: value } : p
    );
    setDraftContent({ ...draftContent, projects: updatedProjects });
  };

  const addProject = () => {
    const newProject: Project = {
      id: Date.now().toString(),
      title: "New Project",
      category: "print",
      thumbnail: "https://picsum.photos/800/800",
      description: "Project description goes here.",
      year: new Date().getFullYear().toString(),
      images: []
    };
    setDraftContent({ ...draftContent, projects: [newProject, ...draftContent.projects] });
  };

  const deleteProject = (id: string) => {
    if(confirm("Delete this project?")) {
        setDraftContent({ ...draftContent, projects: draftContent.projects.filter(p => p.id !== id) });
    }
  };

  const moveProject = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || 
        (direction === 'down' && index === draftContent.projects.length - 1)) {
      return;
    }

    const newProjects = [...draftContent.projects];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap elements
    [newProjects[index], newProjects[targetIndex]] = [newProjects[targetIndex], newProjects[index]];
    
    setDraftContent({ ...draftContent, projects: newProjects });
  };

  // Helper for exhibition updates in draft
  const updateExhibition = (id: string, field: keyof Exhibition, value: any) => {
    const updatedExhibitions = draftContent.exhibitions.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    );
    setDraftContent({ ...draftContent, exhibitions: updatedExhibitions });
  };
  
  const addExhibition = () => {
     const newEx: Exhibition = {
      id: Date.now().toString(),
      title: "New Exhibition",
      date: new Date().toISOString().split('T')[0],
      location: "Location",
    };
    setDraftContent({ ...draftContent, exhibitions: [newEx, ...draftContent.exhibitions] });
  };
  
  const deleteExhibition = (id: string) => {
     if(confirm("Delete this exhibition?")) {
        setDraftContent({ ...draftContent, exhibitions: draftContent.exhibitions.filter(e => e.id !== id) });
     }
  };

  if (!isOpen) {
    return (
      <button 
        onClick={handleOpen}
        className="fixed bottom-6 right-6 bg-black text-white p-3 rounded-full shadow-2xl z-50 hover:scale-110 transition-transform"
        title="Open Admin"
      >
        <Settings size={24} />
      </button>
    );
  }

  return (
    <div className="fixed inset-0 w-full bg-white z-50 overflow-y-auto animate-in fade-in slide-in-from-bottom-5">
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-between items-center mb-8 border-b pb-4 sticky top-0 bg-white z-10 pt-4">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-bold">Admin Panel</h2>
                <div className="flex space-x-2">
                    <button onClick={() => setActiveTab('projects')} className={`px-4 py-2 text-sm uppercase tracking-wide rounded ${activeTab === 'projects' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Projects</button>
                    <button onClick={() => setActiveTab('exhibitions')} className={`px-4 py-2 text-sm uppercase tracking-wide rounded ${activeTab === 'exhibitions' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>Exhibitions</button>
                    <button onClick={() => setActiveTab('settings')} className={`px-4 py-2 text-sm uppercase tracking-wide rounded ${activeTab === 'settings' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'}`}>System</button>
                </div>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full" title="Save & Close">
                <X size={24} />
            </button>
        </div>

        {activeTab === 'settings' && (
            <div className="space-y-8 max-w-3xl mx-auto">
                <div className="p-6 bg-gray-50 rounded text-sm text-gray-600 border border-gray-200">
                    <p className="mb-2 font-bold text-black">How to update your live site:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                        <li>Make changes in the 'Projects' and 'Exhibitions' tabs.</li>
                        <li>Click the Close (X) button to preview changes on the site locally.</li>
                        <li>When satisfied, open Admin again and click "Export Config".</li>
                        <li>Replace the contents of <code className="bg-gray-200 px-1 rounded text-red-500">content.json</code> in your repository with the downloaded file.</li>
                    </ol>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="flex flex-col space-y-3">
                        <label className="text-xs uppercase font-bold text-gray-400">Export Configuration</label>
                        <Button onClick={handleExport} className="w-full flex justify-center items-center gap-2 py-3">
                            <Download size={16} /> Download content.json
                        </Button>
                    </div>

                    <div className="flex flex-col space-y-3">
                        <label className="text-xs uppercase font-bold text-gray-400">Import Configuration</label>
                        <div className="relative">
                            <input type="file" accept=".json" onChange={handleImport} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                            <Button variant="secondary" className="w-full flex justify-center items-center gap-2 py-3">
                                <Upload size={16} /> Load from File
                            </Button>
                        </div>
                    </div>
                </div>
                
                <div className="pt-8 border-t space-y-6">
                    <h3 className="text-lg font-bold">Site Settings</h3>
                    <div className="grid grid-cols-1 gap-6">
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-400 block mb-2">Header Logo URL</label>
                            <input 
                                type="text" 
                                value={draftContent.logoUrl || ''} 
                                onChange={(e) => setDraftContent({...draftContent, logoUrl: e.target.value})}
                                placeholder="./logo.png or https://..."
                                className="w-full p-3 border border-gray-300 rounded bg-white"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Displayed in the navigation bar. Leave empty for default text logo.</p>
                        </div>

                        <div>
                            <label className="text-xs uppercase font-bold text-gray-400 block mb-2">Hero Logo URL</label>
                            <input 
                                type="text" 
                                value={draftContent.heroLogoUrl || ''} 
                                onChange={(e) => setDraftContent({...draftContent, heroLogoUrl: e.target.value})}
                                placeholder="./logo.png or https://..."
                                className="w-full p-3 border border-gray-300 rounded bg-white"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">Displayed prominently in the hero section.</p>
                        </div>
                        
                        <div>
                            <label className="text-xs uppercase font-bold text-gray-400 block mb-2">Contact Email</label>
                            <input 
                                type="email" 
                                value={draftContent.contactEmail} 
                                onChange={(e) => setDraftContent({...draftContent, contactEmail: e.target.value})}
                                className="w-full p-3 border border-gray-300 rounded bg-white"
                            />
                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'projects' && (
            <div className="space-y-8 pb-12">
            <Button onClick={addProject} className="w-full flex justify-center items-center gap-2 py-4 text-base">
                <Plus size={20} /> Add New Project
            </Button>

            {draftContent.projects.map((project, index) => (
                <div key={project.id} className="border border-gray-200 p-6 rounded-md space-y-6 bg-gray-50 shadow-sm">
                <div className="flex justify-between items-start border-b border-gray-200 pb-4">
                    <div className="w-2/3">
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Project Title</label>
                        <input 
                            value={project.title} 
                            onChange={(e) => updateProject(project.id, 'title', e.target.value)}
                            className="text-xl font-bold bg-white px-2 py-1 border border-gray-300 rounded w-full focus:border-black outline-none"
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                             <button 
                                onClick={() => moveProject(index, 'up')} 
                                disabled={index === 0}
                                className={`p-2 border border-gray-200 rounded transition-colors ${
                                    index === 0 
                                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-black'
                                }`}
                                title="Move Up"
                            >
                                <ArrowUp size={16} />
                            </button>
                             <button 
                                onClick={() => moveProject(index, 'down')} 
                                disabled={index === draftContent.projects.length - 1}
                                className={`p-2 border border-gray-200 rounded transition-colors ${
                                    index === draftContent.projects.length - 1 
                                    ? 'bg-gray-50 text-gray-300 cursor-not-allowed' 
                                    : 'bg-white text-gray-600 hover:bg-gray-100 hover:text-black'
                                }`}
                                title="Move Down"
                            >
                                <ArrowDown size={16} />
                            </button>
                        </div>
                        
                        <div className="w-px h-6 bg-gray-300 mx-1"></div>

                        <button onClick={() => deleteProject(project.id)} className="text-red-500 hover:text-red-700 p-2 bg-white border border-gray-200 rounded hover:bg-red-50 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Category</label>
                        <input 
                            value={project.category} 
                            onChange={(e) => updateProject(project.id, 'category', e.target.value)}
                            placeholder="e.g. print, digital"
                            className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Year</label>
                        <input 
                            value={project.year} 
                            onChange={(e) => updateProject(project.id, 'year', e.target.value)}
                            placeholder="YYYY"
                            className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Client (Optional)</label>
                        <input 
                            value={project.client || ''} 
                            onChange={(e) => updateProject(project.id, 'client', e.target.value)}
                            placeholder="Client Name"
                            className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        />
                    </div>
                </div>

                <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Description</label>
                    <RichTextEditor 
                        value={project.description}
                        onChange={(value) => updateProject(project.id, 'description', value)}
                        className="bg-white min-h-[200px]"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Thumbnail URL</label>
                        <input 
                            value={project.thumbnail}
                            onChange={(e) => updateProject(project.id, 'thumbnail', e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        />
                        {project.thumbnail && (
                            <img src={project.thumbnail} alt="Preview" className="mt-2 h-24 object-cover rounded bg-gray-200" />
                        )}
                    </div>
                    
                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Gallery Images</label>
                        <div className="space-y-3 bg-gray-100 p-4 rounded-md">
                            {project.images.length === 0 && (
                                <p className="text-xs text-gray-400 italic text-center py-2">No images added yet.</p>
                            )}
                            {project.images.map((img, idx) => {
                                const url = typeof img === 'string' ? img : img.url;
                                const alt = typeof img === 'string' ? '' : img.alt;
                                
                                return (
                                    <div key={idx} className="flex flex-col md:flex-row gap-2 items-start bg-white p-3 border border-gray-200 rounded shadow-sm">
                                        <div className="flex-grow grid grid-cols-1 gap-2 w-full">
                                            <input
                                                value={url}
                                                onChange={(e) => {
                                                    const newImages = [...project.images];
                                                    const currentAlt = typeof newImages[idx] === 'string' ? '' : (newImages[idx] as any).alt;
                                                    newImages[idx] = { url: e.target.value, alt: currentAlt };
                                                    updateProject(project.id, 'images', newImages);
                                                }}
                                                placeholder="Image URL"
                                                className="w-full p-2 border border-gray-300 rounded text-sm bg-gray-50 focus:bg-white transition-colors"
                                            />
                                            <input
                                                value={alt || ''}
                                                onChange={(e) => {
                                                     const newImages = [...project.images];
                                                     const currentUrl = typeof newImages[idx] === 'string' ? newImages[idx] as string : (newImages[idx] as any).url;
                                                     newImages[idx] = { url: currentUrl, alt: e.target.value };
                                                     updateProject(project.id, 'images', newImages);
                                                }}
                                                placeholder="Alt Text (Optional)"
                                                className="w-full p-2 border border-gray-300 rounded text-xs text-gray-600 bg-gray-50 focus:bg-white transition-colors"
                                            />
                                        </div>
                                        <div className="flex flex-col items-center gap-2">
                                            {url && <img src={url} alt="preview" className="w-10 h-10 object-cover rounded border border-gray-200" />}
                                            <button 
                                                onClick={() => {
                                                    const newImages = project.images.filter((_, i) => i !== idx);
                                                    updateProject(project.id, 'images', newImages);
                                                }} 
                                                className="text-gray-400 hover:text-red-500 p-2 rounded hover:bg-red-50 transition-colors"
                                                title="Remove Image"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                            
                            <Button 
                                variant="secondary" 
                                onClick={() => {
                                    const newImages = [...project.images, { url: '', alt: '' }];
                                    updateProject(project.id, 'images', newImages);
                                }} 
                                className="w-full flex justify-center items-center gap-2 py-2 text-xs border border-gray-300 bg-white hover:bg-gray-50"
                            >
                                <Plus size={14} /> Add Image
                            </Button>
                        </div>
                    </div>
                </div>
                </div>
            ))}
            </div>
        )}

        {activeTab === 'exhibitions' && (
            <div className="space-y-8 max-w-4xl mx-auto pb-12">
            <Button onClick={addExhibition} className="w-full flex justify-center items-center gap-2 py-4 text-base">
                <Plus size={20} /> Add New Exhibition
            </Button>
            
            {draftContent.exhibitions.map((ex) => (
                <div key={ex.id} className="border border-gray-200 p-6 rounded-md space-y-4 bg-gray-50 shadow-sm">
                    <div className="flex justify-between items-start">
                        <div className="flex-grow mr-4">
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Title</label>
                            <input 
                                value={ex.title} 
                                onChange={(e) => updateExhibition(ex.id, 'title', e.target.value)}
                                className="font-bold bg-white px-2 py-1 border border-gray-300 rounded w-full focus:border-black outline-none"
                            />
                        </div>
                        <button onClick={() => deleteExhibition(ex.id)} className="text-red-500 hover:text-red-700 p-2 bg-white border border-gray-200 rounded hover:bg-red-50 transition-colors">
                            <Trash2 size={18} />
                        </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Date</label>
                            <input 
                                type="date"
                                value={ex.date} 
                                onChange={(e) => updateExhibition(ex.id, 'date', e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Location</label>
                            <input 
                                value={ex.location} 
                                onChange={(e) => updateExhibition(ex.id, 'location', e.target.value)}
                                placeholder="Location"
                                className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Link URL</label>
                        <input 
                            value={ex.link || ''} 
                            onChange={(e) => updateExhibition(ex.id, 'link', e.target.value)}
                            placeholder="https://..."
                            className="w-full p-2 border border-gray-300 rounded bg-white text-sm"
                        />
                    </div>
                </div>
            ))}
            </div>
        )}
      </div>
    </div>
  );
};
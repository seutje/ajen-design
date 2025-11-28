import React, { useEffect, useRef } from 'react';
import { Bold, Italic, List, Link as LinkIcon, Heading1, Heading2, AlignLeft } from 'lucide-react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const isInternalUpdate = useRef(false);

  // Sync external value changes to the editor content
  useEffect(() => {
    if (editorRef.current && !isInternalUpdate.current) {
        if (editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }
    isInternalUpdate.current = false;
  }, [value]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    isInternalUpdate.current = true;
    onChange(e.currentTarget.innerHTML);
  };

  const exec = (command: string, val?: string) => {
    document.execCommand(command, false, val);
    if (editorRef.current) {
        isInternalUpdate.current = true;
        onChange(editorRef.current.innerHTML);
        editorRef.current.focus();
    }
  };

  return (
    <div className={`border border-gray-300 rounded-sm overflow-hidden flex flex-col ${className}`}>
      <div className="flex items-center gap-1 bg-gray-50 border-b border-gray-200 p-2 flex-wrap">
         <ToolbarBtn icon={<Bold size={14}/>} onClick={() => exec('bold')} title="Bold" />
         <ToolbarBtn icon={<Italic size={14}/>} onClick={() => exec('italic')} title="Italic" />
         <div className="w-px h-4 bg-gray-300 mx-1" />
         <ToolbarBtn icon={<Heading1 size={14}/>} onClick={() => exec('formatBlock', '<h3>')} title="Heading 3" />
         <ToolbarBtn icon={<Heading2 size={14}/>} onClick={() => exec('formatBlock', '<h4>')} title="Heading 4" />
         <ToolbarBtn icon={<AlignLeft size={14}/>} onClick={() => exec('formatBlock', '<p>')} title="Paragraph" />
         <div className="w-px h-4 bg-gray-300 mx-1" />
         <ToolbarBtn icon={<List size={14}/>} onClick={() => exec('insertUnorderedList')} title="Bullet List" />
         <ToolbarBtn icon={<LinkIcon size={14}/>} onClick={() => {
             const url = prompt('Enter link URL:');
             if(url) exec('createLink', url);
         }} title="Link" />
      </div>
      <div 
        ref={editorRef}
        className="flex-1 p-4 outline-none bg-white text-black text-sm overflow-y-auto [&>ul]:list-disc [&>ul]:pl-5 [&>h3]:text-lg [&>h3]:font-bold [&>h4]:font-bold"
        contentEditable
        onInput={handleInput}
        style={{ minHeight: '200px' }}
      />
    </div>
  );
};

const ToolbarBtn = ({ icon, onClick, title }: { icon: React.ReactNode, onClick: () => void, title?: string }) => (
    <button 
        type="button" 
        title={title}
        onClick={(e) => { e.preventDefault(); onClick(); }}
        className="p-1.5 hover:bg-gray-200 rounded text-gray-700 transition-colors"
    >
        {icon}
    </button>
);

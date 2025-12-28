
import React, { useState } from 'react';
import { FileText, Copy, Trash2, Eye } from 'lucide-react';
import { ToolProps } from '../../types';

const MarkdownStudio: React.FC<ToolProps> = ({ onNotify }) => {
  const [text, setText] = useState('# Precision Markdown\n\nEdit your documents in real-time.\n\n- **Bold** formatting\n- *Italic* styles\n- `Code blocks`');

  return (
    <div className="max-w-6xl mx-auto py-4 flex flex-col gap-1 h-auto lg:h-[calc(100vh-140px)]">
      <div className="bg-[#050505] border border-white/5 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between rounded-sm gap-4">
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="p-3 bg-white text-black rounded-sm shrink-0"><FileText size={20} /></div>
          <div><h2 className="text-[10px] font-black uppercase tracking-[0.5em]">Markdown Studio</h2><p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Live Document Forge</p></div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => { setText(''); onNotify?.("PURGED", "info"); }} className="flex-1 sm:flex-none p-3 text-gray-700 hover:text-white"><Trash2 size={18} /></button>
          <button onClick={() => { navigator.clipboard.writeText(text); onNotify?.("COPIED", "success"); }} className="flex-1 sm:flex-none px-8 py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.4em] rounded-sm hover:bg-gray-200">Copy Buffer</button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-1 overflow-hidden lg:min-h-0 h-[800px] lg:h-auto">
        <div className="flex flex-col bg-[#050505] border border-white/5 overflow-hidden">
          <div className="p-3 bg-white/[0.02] border-b border-white/5 text-[8px] font-black uppercase tracking-widest text-gray-600">Editor Engine</div>
          <textarea value={text} onChange={(e) => setText(e.target.value)} className="flex-1 bg-transparent p-6 sm:p-10 font-mono text-sm text-gray-400 focus:outline-none resize-none leading-relaxed custom-scrollbar" placeholder="Markdown source..." />
        </div>
        <div className="flex flex-col bg-[#050505] border border-white/5 overflow-hidden">
          <div className="p-3 bg-white/[0.02] border-b border-white/5 flex items-center justify-between"><span className="text-[8px] font-black uppercase tracking-widest text-gray-600">Live Preview</span><Eye size={12} className="text-gray-800" /></div>
          <div className="flex-1 p-8 sm:p-12 overflow-auto prose prose-invert max-w-none text-gray-300 custom-scrollbar bg-black/20">
            <div className="markdown-render space-y-4">
              {text.split('\n').map((line, i) => {
                if (line.startsWith('# ')) return <h1 key={i} className="text-3xl font-black text-white mb-4">{line.substring(2)}</h1>;
                if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-black text-white mt-6 mb-2">{line.substring(3)}</h2>;
                if (line.startsWith('- ')) return <li key={i} className="ml-4 list-disc text-gray-400 text-sm">{line.substring(2)}</li>;
                return <p key={i} className="text-sm opacity-70 leading-relaxed">{line}</p>;
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarkdownStudio;

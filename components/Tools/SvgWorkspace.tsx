
import React, { useState } from 'react';
import { SquareCode, Copy, RefreshCw } from 'lucide-react';
import { ToolProps } from '../../types';

const SvgWorkspace: React.FC<ToolProps> = ({ onNotify }) => {
  const [code, setCode] = useState('<svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="40" stroke="white" stroke-width="2"/>\n  <rect x="30" y="30" width="40" height="40" fill="white" opacity="0.2"/>\n</svg>');

  const resetCode = () => {
    setCode('<svg width="200" height="200" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">\n  <circle cx="50" cy="50" r="40" stroke="white" stroke-width="2"/>\n</svg>');
    onNotify?.("RESET COMPLETE", "info");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    onNotify?.('SOURCE COPIED', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto py-4 flex flex-col gap-1 h-auto lg:h-[calc(100vh-140px)]">
      <div className="bg-[#050505] border border-white/5 p-6 flex flex-col sm:flex-row items-center justify-between rounded-sm gap-4">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="p-3 bg-white text-black rounded-sm shrink-0"><SquareCode size={20} /></div>
          <div><h2 className="text-[10px] font-black uppercase tracking-[0.4em]">SVG Workspace</h2><p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Live Source Processing</p></div>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={resetCode} className="flex-1 sm:flex-none p-3 text-gray-700 hover:text-white border border-white/5"><RefreshCw size={18} /></button>
          <button onClick={copyCode} className="flex-1 sm:flex-none px-8 py-3 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-gray-200 transition-all">Copy XML</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-1 overflow-hidden lg:min-h-0 h-[800px] lg:h-auto">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          className="flex-1 bg-[#050505] border border-white/5 p-8 sm:p-12 font-mono text-[11px] sm:text-sm text-gray-400 focus:outline-none focus:border-white/20 transition-all rounded-sm resize-none custom-scrollbar"
          spellCheck={false}
        />
        <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-sm flex items-center justify-center relative group min-h-[300px]">
          <div className="absolute top-6 left-6 text-[8px] font-black uppercase tracking-widest text-gray-800">Viewport</div>
          <div className="transition-transform duration-700 scale-125 sm:scale-150" dangerouslySetInnerHTML={{ __html: code }} />
        </div>
      </div>
    </div>
  );
};

export default SvgWorkspace;

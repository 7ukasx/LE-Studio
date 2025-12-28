
import React, { useState } from 'react';
import { Hash, Copy, Trash2 } from 'lucide-react';
import { ToolProps } from '../../types';

// Updated TextMetrics to accept ToolProps
const TextMetrics: React.FC<ToolProps> = ({ onNotify }) => {
  const [text, setText] = useState('');

  const stats = {
    chars: text.length,
    words: text.trim() ? text.trim().split(/\s+/).length : 0,
    sentences: text.trim() ? text.split(/[.!?]+/).filter(s => s.trim().length > 0).length : 0,
    readTime: Math.ceil((text.trim() ? text.split(/\s+/).length : 0) / 200)
  };

  const copyBuffer = () => {
    navigator.clipboard.writeText(text);
    onNotify?.('METRICS BUFFER COPIED', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 mb-2">
        {Object.entries(stats).map(([k, v]) => (
          <div key={k} className="bg-[#050505] border border-white/5 p-10 rounded-sm text-center">
            <span className="block text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 mb-3">{k}</span>
            <span className="text-4xl font-black tracking-tighter text-white">{v}</span>
            {k === 'readTime' && <span className="ml-2 text-[10px] text-gray-800">Min</span>}
          </div>
        ))}
      </div>
      
      <div className="relative group">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="w-full h-[500px] bg-white/[0.02] border border-white/5 p-12 text-2xl font-medium focus:outline-none focus:border-white/10 resize-none rounded-sm transition-all"
          placeholder="Paste content for telemetry analysis..."
        />
        <div className="absolute top-8 right-8 flex gap-3">
          <button 
            onClick={() => {
              setText('');
              onNotify?.("BUFFER PURGED", "info");
            }} 
            className="p-4 bg-white/5 text-gray-700 hover:text-white rounded-full transition-all"
          >
            <Trash2 size={20} />
          </button>
          <button onClick={copyBuffer} className="p-6 bg-white text-black font-black uppercase tracking-widest text-[10px] rounded-sm hover:scale-105 transition-all">
            Copy Buffer
          </button>
        </div>
      </div>
    </div>
  );
};

export default TextMetrics;

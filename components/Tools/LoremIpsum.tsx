
import React, { useState, useEffect } from 'react';
import { Type, Copy, RefreshCw } from 'lucide-react';
import { ToolProps } from '../../types';

// Updated LoremIpsum to accept ToolProps
const LoremIpsum: React.FC<ToolProps> = ({ onNotify }) => {
  const [count, setCount] = useState(3);
  const [type, setType] = useState<'paragraphs' | 'sentences' | 'words'>('paragraphs');
  const [text, setText] = useState('');

  const generate = () => {
    const base = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.";
    
    let res = '';
    if (type === 'paragraphs') {
      res = Array(count).fill(base).join('\n\n');
    } else if (type === 'sentences') {
      const s = base.split('. ');
      res = Array(count).fill(0).map(() => s[Math.floor(Math.random() * s.length)]).join('. ') + '.';
    } else {
      const w = base.split(' ');
      res = Array(count).fill(0).map(() => w[Math.floor(Math.random() * w.length)]).join(' ');
    }
    setText(res);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
    onNotify?.('IPSUM STREAM COPIED', 'success');
  };

  useEffect(() => generate(), [count, type]);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-[#050505] border border-white/10 rounded-sm shadow-2xl">
        <div className="flex items-center justify-between p-12 border-b border-white/5 bg-white/[0.01]">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white text-black rounded-sm">
              <Type size={28} />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.5em]">Ipsum Studio</h2>
              <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Placeholder Engine</p>
            </div>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={copyToClipboard}
              className="p-4 bg-white text-black rounded-sm hover:scale-105 transition-all flex items-center gap-3 text-[9px] font-black uppercase tracking-widest shadow-xl"
            >
              <Copy size={16} />
              Copy Stream
            </button>
            <button onClick={generate} className="p-4 bg-white/5 border border-white/10 rounded-full text-gray-700 hover:text-white transition-all">
              <RefreshCw size={20} />
            </button>
          </div>
        </div>

        <div className="p-12 space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
            <div className="space-y-6">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-700 px-2">Density: {count}</label>
              <input 
                type="range" min="1" max="50" value={count} 
                onChange={(e) => setCount(parseInt(e.target.value))}
                className="w-full h-[1px] bg-white/10 appearance-none cursor-pointer accent-white" 
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['paragraphs', 'sentences', 'words'] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setType(t)}
                  className={`py-5 rounded-sm border text-[8px] font-black uppercase tracking-[0.2em] transition-all ${
                    type === t ? 'bg-white text-black border-white' : 'border-white/5 text-gray-700 hover:border-white/20'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full min-h-[400px] bg-white/[0.02] border border-white/5 p-12 text-xl text-gray-400 leading-relaxed font-serif whitespace-pre-wrap">
            {text}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoremIpsum;

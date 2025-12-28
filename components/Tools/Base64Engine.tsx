
import React, { useState } from 'react';
import { ArrowRightLeft, Copy, RefreshCw } from 'lucide-react';
import { ToolProps } from '../../types';

// Updated Base64Engine to accept ToolProps
const Base64Engine: React.FC<ToolProps> = ({ onNotify }) => {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');

  const process = () => {
    try {
      if (mode === 'encode') setOutput(btoa(input));
      else setOutput(atob(input));
      onNotify?.(`LOGIC ${mode.toUpperCase()} SUCCESSFUL`, "success");
    } catch (e) {
      setOutput('[Error] Invalid Input Stream');
      onNotify?.("INVALID INPUT STREAM DETECTED", "error");
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
    onNotify?.('BASE64 OUTPUT COPIED', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-[#050505] border border-white/5 p-16 rounded-sm shadow-2xl space-y-12">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white text-black rounded-sm">
              <ArrowRightLeft size={28} />
            </div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em]">Base64 Engine</h2>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-sm">
            {(['encode', 'decode'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-8 py-3 rounded-sm text-[10px] font-black uppercase tracking-widest transition-all ${mode === m ? 'bg-white text-black' : 'text-gray-700 hover:text-white'}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-80 bg-white/[0.02] border border-white/5 p-10 font-mono text-sm focus:outline-none focus:border-white/10 resize-none rounded-sm"
            placeholder="Source Stream..."
          />
          <div className="relative">
            <div className="w-full h-80 bg-white/[0.04] border border-white/5 p-10 font-mono text-sm overflow-auto text-gray-500 rounded-sm break-all">
              {output || '// Result will appear here'}
            </div>
            {output && (
              <button onClick={copyResult} className="absolute bottom-6 right-6 p-3 bg-white/10 text-white rounded-sm hover:bg-white/20 transition-all">
                <Copy size={16} />
              </button>
            )}
          </div>
        </div>

        <button 
          onClick={process}
          className="w-full py-8 bg-white text-black font-black uppercase tracking-[0.4em] text-xs hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.05)]"
        >
          Execute Logic
        </button>
      </div>
    </div>
  );
};

export default Base64Engine;

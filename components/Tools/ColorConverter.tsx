
import React, { useState } from 'react';
import { Palette, Copy, Hash } from 'lucide-react';
import { ToolProps } from '../../types';

const ColorConverter: React.FC<ToolProps> = ({ onNotify }) => {
  const [hex, setHex] = useState('#6366F1');

  const hexToRgb = (h: string) => {
    const r = parseInt(h.slice(1, 3), 16) || 0;
    const g = parseInt(h.slice(3, 5), 16) || 0;
    const b = parseInt(h.slice(5, 7), 16) || 0;
    return `${r}, ${g}, ${b}`;
  };

  const copyColor = (val: string) => {
    navigator.clipboard.writeText(val);
    onNotify?.('COLOR BUFFER COPIED', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-12">
      <div className="bg-[#050505] border border-white/5 p-6 sm:p-16 flex flex-col items-center">
        <div 
          className="w-32 h-32 sm:w-48 sm:h-48 border border-white/10 shadow-[0_0_80px_rgba(255,255,255,0.05)] mb-10 sm:mb-20 transition-all duration-700"
          style={{ backgroundColor: hex }}
        ></div>
        
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-1">
          <div className="bg-white/[0.01] border border-white/5 p-8 sm:p-12 space-y-8">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Manual Override</h4>
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[9px] font-black uppercase tracking-widest text-gray-700">Hexadecimal Spectrum</label>
                <div className="flex gap-2">
                  <input type="text" value={hex} onChange={(e) => setHex(e.target.value)} className="flex-1 bg-white/[0.03] border border-white/5 p-4 font-mono text-center text-white focus:outline-none focus:border-white/10 text-xs sm:text-sm" />
                  <input type="color" value={hex} onChange={(e) => setHex(e.target.value)} className="w-12 h-12 sm:w-14 sm:h-14 bg-transparent border border-white/5 p-1 cursor-pointer" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white/[0.01] border border-white/5 p-8 sm:p-12 space-y-10">
            <h4 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Processed Values</h4>
            <div className="space-y-6">
              {[
                { label: 'RGB Component', val: hexToRgb(hex) },
                { label: 'Hex Code', val: hex.toUpperCase() }
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-4 group">
                  <div className="overflow-hidden">
                    <span className="block text-[8px] font-black uppercase tracking-[0.3em] text-gray-700">{item.label}</span>
                    <span className="text-lg sm:text-xl font-black tracking-tighter text-white truncate block">{item.val}</span>
                  </div>
                  <button onClick={() => copyColor(item.val)} className="p-3 opacity-0 group-hover:opacity-100 transition-opacity text-gray-700 hover:text-white shrink-0">
                    <Copy size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-1 flex h-16 sm:h-24 w-full bg-white/5 p-1 gap-1">
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((op, i) => (
            <div 
              key={i} 
              className="flex-1 transition-all hover:flex-[1.5] cursor-pointer"
              style={{ backgroundColor: hex, opacity: 1 - op }}
              onClick={() => copyColor(hex)}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ColorConverter;


import React, { useState } from 'react';
import { GlassWater, Copy, RefreshCw } from 'lucide-react';
import { ToolProps } from '../../types';

// Updated GlassmorphismGen to accept ToolProps
const GlassmorphismGen: React.FC<ToolProps> = ({ onNotify }) => {
  const [blur, setBlur] = useState(10);
  const [opacity, setOpacity] = useState(0.1);
  const [color, setColor] = useState('#ffffff');
  const [border, setBorder] = useState(0.1);

  const css = `background: rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, ${opacity});\nbackdrop-filter: blur(${blur}px);\nborder: 1px solid rgba(255, 255, 255, ${border});\nborder-radius: 16px;`;

  const copyCss = () => {
    navigator.clipboard.writeText(css);
    onNotify?.('GLASS CSS BUFFER COPIED', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        <div className="space-y-12">
          <div className="flex items-center gap-6">
            <div className="p-5 bg-white text-black rounded-sm">
              <GlassWater size={28} />
            </div>
            <div>
              <h2 className="text-[11px] font-black uppercase tracking-[0.5em]">Glass Lab</h2>
              <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Translucency Workbench</p>
            </div>
          </div>

          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                <span>Blur Intensity</span>
                <span className="text-white">{blur}px</span>
              </div>
              <input type="range" min="0" max="40" value={blur} onChange={(e) => setBlur(parseInt(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                <span>Surface Opacity</span>
                <span className="text-white">{Math.round(opacity * 100)}%</span>
              </div>
              <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={(e) => setOpacity(parseFloat(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                <span>Border Visibility</span>
                <span className="text-white">{Math.round(border * 100)}%</span>
              </div>
              <input type="range" min="0" max="0.5" step="0.01" value={border} onChange={(e) => setBorder(parseFloat(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white" />
            </div>
          </div>

          <div className="relative group">
            <pre className="bg-[#050505] border border-white/5 p-10 font-mono text-[11px] text-gray-500 leading-relaxed rounded-sm overflow-auto">
              {css}
            </pre>
            <button onClick={copyCss} className="absolute top-6 right-6 p-4 bg-white text-black rounded-sm hover:scale-105 transition-all">
              <Copy size={18} />
            </button>
          </div>
        </div>

        <div className="relative flex flex-col items-center justify-center bg-white/[0.02] border border-white/5 rounded-3xl min-h-[500px] overflow-hidden">
          <div className="absolute top-20 left-20 w-48 h-48 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full blur-3xl opacity-20"></div>
          <div className="absolute bottom-20 right-20 w-64 h-64 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-full blur-3xl opacity-20"></div>
          
          <div 
            style={{ 
              backgroundColor: `rgba(${parseInt(color.slice(1,3), 16)}, ${parseInt(color.slice(3,5), 16)}, ${parseInt(color.slice(5,7), 16)}, ${opacity})`,
              backdropFilter: `blur(${blur}px)`,
              border: `1px solid rgba(255, 255, 255, ${border})`
            }}
            className="w-80 h-96 rounded-[32px] shadow-2xl z-10 p-10 flex flex-col justify-between"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl"></div>
            <div className="space-y-4">
              <div className="h-4 w-3/4 bg-white/20 rounded-full"></div>
              <div className="h-4 w-1/2 bg-white/10 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GlassmorphismGen;

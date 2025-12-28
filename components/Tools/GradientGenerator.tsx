
import React, { useState } from 'react';
import { RefreshCw, Copy, Layers } from 'lucide-react';
import { ToolProps } from '../../types';

// Updated GradientGenerator to accept ToolProps
const GradientGenerator: React.FC<ToolProps> = ({ onNotify }) => {
  const [color1, setColor1] = useState('#6366F1');
  const [color2, setColor2] = useState('#A855F7');
  const [angle, setAngle] = useState(135);

  const grad = `linear-gradient(${angle}deg, ${color1}, ${color2})`;

  const randomize = () => {
    const rh = () => '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
    setColor1(rh()); setColor2(rh()); setAngle(Math.floor(Math.random() * 360));
  };

  const copyGradientStyle = () => {
    navigator.clipboard.writeText(`background: ${grad};`);
    onNotify?.('GRADIENT CSS BUFFER COPIED', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto py-12 flex flex-col lg:flex-row gap-1">
      <div className="flex-1 bg-[#050505] border border-white/5 p-16 space-y-16">
        <div className="flex items-center justify-between border-b border-white/5 pb-8">
          <div className="flex items-center gap-6">
            <div className="p-3 bg-white text-black rounded-sm"><Layers size={20} /></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em]">Lighting Forge</h3>
          </div>
          <button onClick={randomize} className="p-3 text-gray-700 hover:text-white transition-colors"><RefreshCw size={18} /></button>
        </div>

        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-700">Source A</label>
            <div className="flex gap-4 p-4 border border-white/5 bg-white/[0.01]">
              <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-12 h-12 bg-transparent cursor-pointer" />
              <span className="font-mono text-[10px] flex items-center text-gray-500 uppercase">{color1}</span>
            </div>
          </div>
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-700">Source B</label>
            <div className="flex gap-4 p-4 border border-white/5 bg-white/[0.01]">
              <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-12 h-12 bg-transparent cursor-pointer" />
              <span className="font-mono text-[10px] flex items-center text-gray-500 uppercase">{color2}</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-700">
            <span>Projection Angle</span>
            <span className="text-white">{angle}°</span>
          </div>
          <input type="range" min="0" max="360" value={angle} onChange={(e) => setAngle(parseInt(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white" />
        </div>

        <button 
          onClick={copyGradientStyle}
          className="w-full py-8 bg-white text-black font-black uppercase tracking-[0.5em] text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-4"
        >
          <Copy size={18} />
          Copy Style Buffer
        </button>
      </div>

      <div className="w-full lg:w-[480px] bg-[#050505] border border-white/5 p-16 flex flex-col h-full">
        <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-12 text-white/40">Visualizer Output</h3>
        <div className="flex-1 aspect-[4/5] border border-white/10 shadow-2xl relative overflow-hidden group" style={{ background: grad }}>
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <span className="px-6 py-3 border border-white/20 bg-black/50 backdrop-blur-xl text-[9px] font-black uppercase tracking-widest">Active Render</span>
          </div>
        </div>
        <div className="mt-8 p-6 bg-white/[0.01] border border-white/5 font-mono text-[10px] text-gray-700 break-all leading-relaxed rounded-sm">
          background: {grad};
        </div>
      </div>
    </div>
  );
};

export default GradientGenerator;

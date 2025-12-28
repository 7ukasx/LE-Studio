
import React, { useState, useEffect, useRef } from 'react';
import { QrCode, Download, Share2, Palette, RefreshCw, Zap, ShieldCheck } from 'lucide-react';
import { ToolProps } from '../../types';

// Updated QRCodeGenerator to use standard ToolProps
const QRCodeGenerator: React.FC<ToolProps> = ({ onNotify }) => {
  const [text, setText] = useState('https://studio.lukaseifertinger.com');
  const [qrColor, setQrColor] = useState('#ffffff');
  const [bgColor, setBgColor] = useState('#0a0a0a');
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/qrious/4.0.2/qrious.min.js';
    script.async = true;
    script.onload = () => generateQR();
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, [text, qrColor, bgColor, errorLevel]);

  const generateQR = () => {
    if (!(window as any).QRious) return;
    new (window as any).QRious({
      element: canvasRef.current,
      value: text,
      size: 800, // Higher resolution for export
      foreground: qrColor,
      background: bgColor,
      level: errorLevel
    });
  };

  const downloadQR = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `le-pattern-${Date.now()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    onNotify?.("PATTERN COMMIT SUCCESSFUL", "success");
  };

  return (
    <div className="max-w-6xl mx-auto py-12 flex flex-col lg:flex-row gap-1">
      <div className="flex-1 bg-[#050505] border border-white/5 p-16 space-y-16">
        <div className="flex items-center gap-6 border-b border-white/5 pb-10">
           <div className="p-4 bg-white text-black rounded-sm shadow-xl">
             <QrCode size={24} />
           </div>
           <div>
             <h2 className="text-[11px] font-black uppercase tracking-[0.5em]">QR Engine M-22</h2>
             <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">High-Entropy Pattern Forge</p>
           </div>
        </div>

        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-8 text-white/40">Signal Content</h3>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-white/[0.02] border border-white/5 p-8 text-sm text-gray-400 focus:outline-none focus:border-white/10 min-h-[180px] rounded-sm font-mono leading-relaxed"
            placeholder="Payload Source..."
          />
        </div>
        
        <div className="grid grid-cols-2 gap-12">
          <div className="space-y-6">
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-700">Fore Spectrum</label>
            <div className="flex items-center gap-6 p-6 bg-white/[0.01] border border-white/5 rounded-sm group hover:border-white/20 transition-all">
              <input type="color" value={qrColor} onChange={(e) => setQrColor(e.target.value)} className="w-12 h-12 bg-transparent cursor-pointer rounded-sm" />
              <div className="flex flex-col">
                <span className="font-mono text-[11px] text-white/80">{qrColor.toUpperCase()}</span>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <label className="block text-[9px] font-black uppercase tracking-widest text-gray-700">Back Buffer</label>
            <div className="flex items-center gap-6 p-6 bg-white/[0.01] border border-white/5 rounded-sm group hover:border-white/20 transition-all">
              <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-12 h-12 bg-transparent cursor-pointer rounded-sm" />
              <div className="flex flex-col">
                <span className="font-mono text-[11px] text-white/80">{bgColor.toUpperCase()}</span>
              </div>
            </div>
          </div>
        </div>

        <button 
          onClick={downloadQR}
          className="w-full py-10 bg-white text-black font-black uppercase tracking-[0.5em] text-xs hover:bg-gray-200 transition-all flex items-center justify-center gap-6 shadow-[0_20px_50px_rgba(255,255,255,0.05)]"
        >
          <Download size={20} />
          Commit Pattern to Disk
        </button>
      </div>

      <div className="w-full lg:w-[480px] bg-[#050505] border border-white/5 p-16 flex flex-col items-center justify-center relative overflow-hidden group">
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none group-hover:opacity-[0.06] transition-opacity" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
        
        <div className="relative p-12 bg-black shadow-[0_40px_100px_rgba(0,0,0,0.8)] border border-white/5 group-hover:scale-105 transition-transform duration-1000">
          <canvas ref={canvasRef} className="max-w-full opacity-90 rounded-sm" style={{ width: '320px', height: '320px' }} />
          <div className="absolute top-0 right-0 p-5 text-white/10"><Zap size={14} /></div>
          <div className="absolute bottom-0 left-0 p-5 text-white/10"><ShieldCheck size={14} /></div>
        </div>
        
        <div className="mt-16 text-center space-y-4">
          <p className="text-[10px] font-black uppercase tracking-[0.8em] text-white/30">Binary Log</p>
          <div className="flex items-center gap-4 justify-center text-[8px] font-mono text-gray-800 uppercase tracking-widest">
            <span>{text.length} bits encoded</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeGenerator;

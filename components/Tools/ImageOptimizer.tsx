
import React, { useState } from 'react';
import { Minimize2, Upload, Download, RefreshCw } from 'lucide-react';
import { ToolProps } from '../../types';

// Updated ImageOptimizer to accept ToolProps
const ImageOptimizer: React.FC<ToolProps> = ({ onNotify }) => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState(0.8);
  const [compressed, setCompressed] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const optimizeImage = () => {
    if (!file) return;
    setIsProcessing(true);
    onNotify?.("STARTING OPTIMIZATION SEQUENCE", "info");
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0);
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        setCompressed(dataUrl);
        setIsProcessing(false);
        onNotify?.("OPTIMIZATION COMPLETE", "success");
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    setFile(selectedFile);
    if (selectedFile) {
      onNotify?.("SOURCE STREAM SECURED", "info");
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-[#050505] border border-white/5 p-16 rounded-sm shadow-2xl">
        <div className="flex items-center gap-6 mb-16">
          <div className="p-5 bg-white text-black rounded-sm">
            <Minimize2 size={28} />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em]">Optimizer</h2>
            <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Local Compression Core</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-10">
            <label className="block w-full cursor-pointer group">
              <div className="border border-dashed border-white/10 group-hover:border-white/20 p-20 rounded-sm flex flex-col items-center justify-center gap-6 transition-all bg-white/[0.01]">
                <Upload size={32} className="text-gray-700 group-hover:text-white" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-500">
                  {file ? file.name : 'Select JPG / PNG'}
                </span>
                <input type="file" className="hidden" onChange={handleFileSelect} accept="image/*" />
              </div>
            </label>

            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-600">
                <span>Optimization Level</span>
                <span className="text-white">{Math.round(quality * 100)}%</span>
              </div>
              <input type="range" min="0.1" max="1" step="0.05" value={quality} onChange={(e) => setQuality(parseFloat(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white" />
            </div>

            <button 
              disabled={!file || isProcessing}
              onClick={optimizeImage}
              className="w-full py-8 bg-white text-black font-black uppercase tracking-[0.4em] text-xs hover:bg-gray-200 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
            >
              {isProcessing ? <RefreshCw className="animate-spin" /> : 'Process Stream'}
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-4 rounded-sm flex items-center justify-center min-h-[300px]">
            {compressed ? (
              <div className="flex flex-col items-center gap-8 w-full">
                <img src={compressed} className="max-w-full rounded-sm shadow-2xl" />
                <a 
                  href={compressed} 
                  download="optimized_studio.jpg"
                  onClick={() => onNotify?.("RESULT COMMITTED TO DISK", "success")}
                  className="w-full py-4 border border-white text-white text-[10px] font-black uppercase tracking-[0.3em] text-center hover:bg-white hover:text-black transition-all"
                >
                  <Download size={14} className="inline mr-3" />
                  Save Result
                </a>
              </div>
            ) : (
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-800">Telemetry Ready</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageOptimizer;


import React, { useState } from 'react';
import { Upload, Download, FileType, CheckCircle, RefreshCw } from 'lucide-react';
import { ToolProps } from '../../types';

const ImageConverter: React.FC<ToolProps> = ({ onNotify }) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [targetFormat, setTargetFormat] = useState<'png' | 'jpeg' | 'webp' | 'ico'>('png');
  const [isConverting, setIsConverting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
      onNotify?.("SOURCE BUFFER LOADED", "info");
    }
  };

  const convertAndDownload = async () => {
    if (!selectedImage) return;
    setIsConverting(true);

    const img = new Image();
    img.src = URL.createObjectURL(selectedImage);
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.drawImage(img, 0, 0);
      let mimeType = `image/${targetFormat}`;
      if (targetFormat === 'ico') mimeType = 'image/x-icon';
      const dataUrl = canvas.toDataURL(mimeType);
      const link = document.createElement('a');
      link.download = `studio-export.${targetFormat}`;
      link.href = dataUrl;
      link.click();
      setIsConverting(false);
      onNotify?.(`CONVERSION TO ${targetFormat.toUpperCase()} SUCCESSFUL`, "success");
    };
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-12">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 overflow-hidden bg-white/5 border border-white/5 p-1">
        <div className="bg-[#050505] p-8 sm:p-12 flex flex-col border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-8 sm:mb-12 text-white/40">1. Input Stream</h3>
          <label className="block w-full cursor-pointer group mb-8 sm:mb-12">
            <div className="border border-dashed border-white/5 group-hover:border-white/10 p-12 sm:p-20 flex flex-col items-center justify-center gap-6 transition-all bg-white/[0.01]">
              <Upload size={32} className="text-gray-800 group-hover:text-white" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 text-center">
                {selectedImage ? selectedImage.name : 'Select Format Source'}
              </span>
              <input type="file" className="hidden" onChange={handleFileChange} accept="image/*" />
            </div>
          </label>

          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-6 text-white/40">2. Target Module</h3>
          <div className="grid grid-cols-2 gap-1">
            {(['png', 'jpeg', 'webp', 'ico'] as const).map(format => (
              <button
                key={format}
                onClick={() => setTargetFormat(format)}
                className={`py-4 sm:py-6 border text-[9px] font-black uppercase tracking-[0.4em] transition-all ${
                  targetFormat === format ? 'bg-white text-black border-white' : 'bg-transparent border-white/5 text-gray-700 hover:border-white/10'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-[#050505] p-8 sm:p-12 flex flex-col border border-white/5">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-8 sm:mb-12 text-white/40">Telemetric Preview</h3>
          <div className="flex-1 bg-black border border-white/5 overflow-hidden flex items-center justify-center min-h-[300px] sm:min-h-[400px] mb-8 sm:mb-12">
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[500px] object-contain opacity-80" />
            ) : (
              <div className="text-gray-900 flex flex-col items-center gap-4">
                <FileType size={64} strokeWidth={1} />
                <span className="text-[8px] font-black uppercase tracking-widest italic">Signal Offline</span>
              </div>
            )}
          </div>

          <button
            disabled={!selectedImage || isConverting}
            onClick={convertAndDownload}
            className="w-full py-6 sm:py-8 bg-white text-black font-black uppercase tracking-[0.5em] text-xs hover:bg-gray-200 transition-all disabled:opacity-20 flex items-center justify-center gap-4"
          >
            {isConverting ? <RefreshCw className="animate-spin" /> : <Download size={18} />}
            Process Export
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageConverter;

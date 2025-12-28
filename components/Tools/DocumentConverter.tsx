
import React, { useState, useCallback } from 'react';
import { 
  FileUp, Download, RefreshCw, FileText, ChevronRight, 
  Activity, ShieldCheck, Target, Trash2, Image as ImageIcon,
  Layers, FilePlus, ArrowDownToLine, MoveUp, MoveDown
} from 'lucide-react';
import { ToolProps } from '../../types';
import { jsPDF } from 'jspdf';

interface Asset {
  id: string;
  file: File;
  type: 'image' | 'text';
  preview?: string;
}

const DocumentConverter: React.FC<ToolProps> = ({ onNotify }) => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isCompiling, setIsCompiling] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 15)]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const newAssets: Asset[] = files.map(file => {
      const isImage = file.type.startsWith('image/');
      const isText = file.type === 'text/plain' || file.name.endsWith('.txt') || file.name.endsWith('.md');
      
      return {
        id: Math.random().toString(36).substr(2, 9),
        file: file,
        type: isImage ? 'image' : 'text',
        preview: isImage ? URL.createObjectURL(file) : undefined
      };
    });

    setAssets(prev => [...prev, ...newAssets]);
    addLog(`INJECTED ${newAssets.length} ASSETS INTO BUFFER`);
    onNotify?.(`${newAssets.length} ASSETS BUFFERED`, "info");
  };

  const removeAsset = (id: string) => {
    setAssets(prev => {
      const filtered = prev.filter(a => a.id !== id);
      const target = prev.find(a => a.id === id);
      if (target?.preview) URL.revokeObjectURL(target.preview);
      return filtered;
    });
    addLog("ASSET PURGED FROM SEQUENCE");
  };

  const moveAsset = (index: number, direction: 'up' | 'down') => {
    const newAssets = [...assets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newAssets.length) return;
    
    [newAssets[index], newAssets[targetIndex]] = [newAssets[targetIndex], newAssets[index]];
    setAssets(newAssets);
    addLog("SEQUENCE RE-ORDERED");
  };

  const compilePDF = async () => {
    if (assets.length === 0) return;

    setIsCompiling(true);
    setProgress(0);
    addLog("IGNITING ARCHITECT ENGINE...");
    onNotify?.("INITIATING COMPILATION SEQUENCE", "info");

    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      for (let i = 0; i < assets.length; i++) {
        const asset = assets[i];
        if (i > 0) doc.addPage();
        
        addLog(`PROCESSING NODE: ${asset.file.name.toUpperCase()}`);

        if (asset.type === 'image') {
          const imgData = await new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target?.result as string);
            reader.readAsDataURL(asset.file);
          });

          // Aspect ratio scaling
          const img = new Image();
          img.src = imgData;
          await img.decode();
          
          let width = pageWidth - (margin * 2);
          let height = (img.height * width) / img.width;

          if (height > pageHeight - (margin * 2)) {
            height = pageHeight - (margin * 2);
            width = (img.width * height) / img.height;
          }

          doc.addImage(imgData, 'JPEG', margin, margin, width, height);
        } else {
          const text = await asset.file.text();
          doc.setFont('courier', 'normal');
          doc.setFontSize(10);
          const splitText = doc.splitTextToSize(text, pageWidth - (margin * 2));
          doc.text(splitText, margin, margin + 10);
        }

        const currentProgress = Math.round(((i + 1) / assets.length) * 100);
        setProgress(currentProgress);
      }

      doc.save(`LE_ARCHITECT_EXPORT_${Date.now()}.pdf`);
      addLog("ARCHITECT SEQUENCE COMPLETE. MASTER PDF COMMITTED.");
      onNotify?.("COMPILATION SUCCESSFUL", "success");
    } catch (error) {
      addLog("CRITICAL FAILURE IN COMPILATION BUFFER.");
      onNotify?.("ARCHITECT ERROR: SEQUENCE FAILED", "error");
    } finally {
      setIsCompiling(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 flex flex-col gap-1 h-auto lg:h-[calc(100vh-140px)]">
      {/* Top Header */}
      <div className="bg-[#050505] border border-white/5 p-10 flex items-center justify-between rounded-sm gap-4">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white text-black rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <FileUp size={24} />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em]">Document Architect M-45</h2>
            <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Universal Asset to PDF Synthesis</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={() => { 
              assets.forEach(a => a.preview && URL.revokeObjectURL(a.preview));
              setAssets([]); 
              setProgress(0); 
              addLog("SYSTEM BUFFER PURGED."); 
              onNotify?.("WORKSPACE CLEARED", "info");
            }}
            className="px-8 py-3 bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 rounded-sm"
          >
            <RefreshCw size={14} />
            Purge Buffer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-1">
        {/* Left Control Quadrant */}
        <div className="bg-[#050505] border border-white/5 p-12 space-y-12">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Inbound Pipeline</h3>
          
          <label className="block w-full group cursor-pointer">
            <div className={`border border-dashed p-12 flex flex-col items-center justify-center gap-4 transition-all bg-white/[0.01] ${assets.length > 0 ? 'border-white/20' : 'border-white/5 group-hover:border-white/10'}`}>
              <FilePlus size={32} className={assets.length > 0 ? 'text-white' : 'text-gray-800 group-hover:text-white'} />
              <div className="text-center">
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-gray-500 block">Inject Assets</span>
                <span className="text-[7px] font-bold uppercase tracking-widest text-gray-800 mt-2">JPG, PNG, WEBP, TXT</span>
              </div>
              <input type="file" className="hidden" multiple onChange={handleFileChange} />
            </div>
          </label>

          <div className="space-y-6 pt-6 border-t border-white/5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Sequence Depth</span>
              <span className="text-white text-xs font-mono">{assets.length} NODES</span>
            </div>
            <button
              disabled={assets.length === 0 || isCompiling}
              onClick={compilePDF}
              className="w-full py-7 bg-white text-black font-black uppercase tracking-[0.5em] text-[10px] hover:bg-gray-200 transition-all disabled:opacity-20 flex flex-col items-center justify-center gap-2 shadow-2xl"
            >
              <div className="flex items-center gap-3">
                {isCompiling ? <RefreshCw className="animate-spin" size={14} /> : <Target size={14} />}
                Synthesize PDF
              </div>
            </button>
          </div>
        </div>

        {/* Center Sequence Stack */}
        <div className="lg:col-span-2 bg-[#050505] border border-white/5 flex flex-col relative overflow-hidden group min-h-[500px]">
          <div className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <Layers size={14} className="text-gray-700" />
              <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white">Active Asset Sequence</h4>
            </div>
            <span className="text-[8px] font-black uppercase tracking-widest text-gray-800">Compiling Buffer</span>
          </div>

          <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-black/40 space-y-1">
            {assets.length > 0 ? (
              assets.map((asset, index) => (
                <div key={asset.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-sm flex items-center justify-between group/item hover:bg-white/[0.04] transition-all">
                  <div className="flex items-center gap-6">
                    <div className="w-12 h-12 bg-black border border-white/5 flex items-center justify-center overflow-hidden">
                      {asset.type === 'image' ? (
                        <img src={asset.preview} className="w-full h-full object-cover opacity-60" />
                      ) : (
                        <FileText size={18} className="text-gray-700" />
                      )}
                    </div>
                    <div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-white/80 block truncate max-w-[180px]">{asset.file.name}</span>
                      <span className="text-[7px] font-bold uppercase tracking-widest text-gray-700 mt-1">
                        {asset.type.toUpperCase()} — {(asset.file.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 opacity-0 group-hover/item:opacity-100 transition-opacity">
                    <button onClick={() => moveAsset(index, 'up')} className="p-2 text-gray-600 hover:text-white"><MoveUp size={12} /></button>
                    <button onClick={() => moveAsset(index, 'down')} className="p-2 text-gray-600 hover:text-white"><MoveDown size={12} /></button>
                    <button onClick={() => removeAsset(asset.id)} className="p-2 text-red-900 hover:text-red-500"><Trash2 size={12} /></button>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-4">
                <Layers size={64} strokeWidth={1} />
                <span className="text-[9px] font-black uppercase tracking-[0.4em]">Stack Empty — Inject Signal</span>
              </div>
            )}
          </div>

          {isCompiling && (
             <div className="absolute inset-x-0 bottom-0 h-1 bg-white/5 z-20">
               <div className="h-full bg-blue-500 transition-all duration-300" style={{ width: `${progress}%` }}></div>
             </div>
          )}
        </div>

        {/* Right Telemetry Log */}
        <div className="bg-[#050505] border border-white/5 p-12 flex flex-col gap-10">
          <div className="space-y-12">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Architect Log</h3>
            
            <div className="space-y-4 font-mono text-[9px] text-gray-600 uppercase">
              {logs.map((log, i) => (
                <div key={i} className={`flex gap-3 items-start border-l border-white/5 pl-3 ${i === 0 ? 'text-blue-500' : ''}`}>
                  <ChevronRight size={10} className="mt-0.5 shrink-0" />
                  <span>{log}</span>
                </div>
              ))}
              {logs.length === 0 && <span className="opacity-20 italic">Awaiting events...</span>}
            </div>
          </div>

          <div className="mt-auto pt-12 border-t border-white/5 space-y-6">
            <div className="flex items-center gap-3">
              <ShieldCheck size={14} className="text-green-500/30" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Integrity Check</span>
            </div>
            <div className="p-5 bg-green-500/5 border border-green-500/10 rounded-sm">
              <p className="text-[8px] font-bold text-green-500/60 uppercase leading-relaxed tracking-widest">
                Local compilation active. All asset buffers are isolated within the sandbox environment.
              </p>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[9px] font-black uppercase tracking-[0.6em] text-gray-800 mt-6">
        LE Precision Document Architecture v2.0 — Multi-Modal Synthesis Layer.
      </p>
    </div>
  );
};

export default DocumentConverter;

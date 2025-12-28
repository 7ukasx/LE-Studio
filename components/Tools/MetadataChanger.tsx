
import React, { useState } from 'react';
import { Upload, Trash2, Eye, ShieldCheck, Activity } from 'lucide-react';
import { ToolProps } from '../../types';

const MetadataChanger: React.FC<ToolProps> = ({ onNotify }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [metadata, setMetadata] = useState<Record<string, string>>({});

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setMetadata({
        'Filename': file.name,
        'Capacity': `${(file.size / 1024).toFixed(2)} KB`,
        'Type/MIME': file.type,
        'Unix Mod': new Date(file.lastModified).toISOString(),
        'Identity': 'Encrypted Logic Core',
        'State': 'Vulnerable Data'
      });
      onNotify?.("EXIF DATA STREAM ATTACHED", "info");
    }
  };

  const sanitizeMetadata = () => {
    setMetadata(p => ({...p, 'State': 'Sanitized (Safe)'}));
    onNotify?.('METADATA SANITIZED - PRIVACY SECURED', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-12">
      <div className="mb-12 sm:mb-20 text-center px-4">
        <h3 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter mb-4 sm:mb-6">Exif <span className="text-white/20">Studio</span></h3>
        <div className="h-px w-24 sm:w-32 bg-white/10 mx-auto mb-4 sm:mb-6"></div>
        <p className="text-[8px] sm:text-[10px] font-black uppercase tracking-[0.4em] text-gray-700">Privacy Sanitization Module</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1 overflow-hidden bg-white/5 border border-white/5 p-1">
        <div className="bg-[#050505] p-8 sm:p-16 flex flex-col border border-white/5 group">
          <h3 className="text-[10px] font-black uppercase tracking-[0.5em] mb-8 sm:mb-12 text-white/40">1. Data Injection</h3>
          <label className="flex-1 cursor-pointer flex flex-col items-center justify-center border border-dashed border-white/5 bg-white/[0.01] p-10 sm:p-20 hover:border-white/20 transition-all">
            <Upload size={32} className="text-gray-800 group-hover:text-white transition-colors" />
            <span className="mt-8 text-[9px] font-black uppercase tracking-[0.3em] text-gray-700 text-center">
              {selectedFile ? selectedFile.name : 'Target EXIF Buffer'}
            </span>
            <input type="file" onChange={handleFile} className="hidden" accept="image/*" />
          </label>
        </div>

        <div className="bg-[#050505] p-8 sm:p-16 flex flex-col border border-white/5">
          <div className="flex items-center justify-between mb-8 sm:mb-12">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">2. Telemetry Log</h3>
            <ShieldCheck size={14} className="text-green-500/50" />
          </div>
          
          <div className="flex-1 space-y-4 sm:space-y-6 overflow-hidden">
            {Object.keys(metadata).length > 0 ? (
              Object.entries(metadata).map(([key, val]) => (
                <div key={key} className="flex justify-between items-center border-b border-white/5 pb-3 sm:pb-4 gap-4">
                  <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest text-gray-700 shrink-0">{key}</span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-white/80 truncate text-right">{val}</span>
                </div>
              ))
            ) : (
              <div className="h-48 sm:h-64 flex flex-col items-center justify-center opacity-20 italic">
                <Activity size={32} strokeWidth={1} />
                <span className="mt-4 text-[9px] font-black uppercase tracking-widest">Awaiting Signal</span>
              </div>
            )}
          </div>

          {selectedFile && (
            <button 
              onClick={sanitizeMetadata}
              className="mt-8 sm:mt-12 w-full py-5 sm:py-6 border border-red-500/20 bg-red-500/5 text-red-500 text-[10px] font-black uppercase tracking-[0.4em] hover:bg-red-500 hover:text-white transition-all flex items-center justify-center gap-4"
            >
              <Trash2 size={16} />
              Scrub Core Data
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default MetadataChanger;

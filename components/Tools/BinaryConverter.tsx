
import React, { useState } from 'react';
import { Binary, Copy, ArrowRightLeft } from 'lucide-react';
import { ToolProps } from '../../types';

const BinaryConverter: React.FC<ToolProps> = ({ onNotify }) => {
  const [inputText, setInputText] = useState('LE Studio Precision Engine');
  const [outputType, setOutputType] = useState<'binary' | 'hex' | 'base64'>('binary');

  const convert = (text: string) => {
    if (!text) return '';
    switch (outputType) {
      case 'binary': return text.split('').map(char => char.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
      case 'hex': return text.split('').map(char => char.charCodeAt(0).toString(16).toUpperCase()).join(' ');
      case 'base64': try { return btoa(text); } catch { return 'ERR: Bitstream Invalid'; }
      default: return '';
    }
  };

  const copySignal = () => {
    navigator.clipboard.writeText(convert(inputText));
    onNotify?.('BITSTREAM SIGNAL COPIED', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto py-6 sm:py-12 space-y-1">
      <div className="bg-[#050505] border border-white/5 p-6 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto">
          <div className="p-3 bg-white text-black rounded-sm shrink-0"><Binary size={20} /></div>
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em]">Bitstream Flux</h3>
            <p className="text-[8px] font-bold text-gray-800 uppercase tracking-widest mt-1">Universal Logic Translator</p>
          </div>
        </div>
        <div className="flex gap-1 bg-white/[0.02] p-1 border border-white/5 w-full md:w-auto overflow-x-auto">
          {(['binary', 'hex', 'base64'] as const).map(type => (
            <button
              key={type}
              onClick={() => setOutputType(type)}
              className={`flex-1 md:flex-none px-4 sm:px-8 py-3 text-[9px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap ${
                outputType === type ? 'bg-white text-black' : 'text-gray-600 hover:text-white hover:bg-white/5'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        <div className="bg-[#050505] border border-white/5 p-8 sm:p-12 space-y-6">
          <label className="text-[9px] font-black uppercase tracking-widest text-gray-700">Source Stream</label>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="w-full h-48 sm:h-80 bg-white/[0.01] border border-white/5 p-6 sm:p-8 font-mono text-sm text-gray-400 focus:outline-none focus:border-white/10 resize-none rounded-sm"
            placeholder="Input telemetry data..."
          />
        </div>
        
        <div className="bg-[#050505] border border-white/5 p-8 sm:p-12 space-y-6 relative">
          <label className="text-[9px] font-black uppercase tracking-widest text-gray-700">Process Output ({outputType})</label>
          <div className="w-full h-48 sm:h-80 bg-white/[0.03] border border-white/5 p-6 sm:p-8 font-mono text-[10px] sm:text-xs overflow-auto text-blue-500/60 break-all rounded-sm leading-relaxed">
            {convert(inputText) || <span className="opacity-20 italic">Awaiting Signal...</span>}
          </div>
          {inputText && (
            <button 
              onClick={copySignal}
              className="absolute bottom-10 right-10 sm:bottom-16 sm:right-16 p-3 sm:p-4 bg-white text-black rounded-sm hover:scale-110 transition-all shadow-2xl"
            >
              <Copy size={16} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BinaryConverter;


import React, { useState, useEffect } from 'react';
import { ShieldCheck, Copy, RefreshCw } from 'lucide-react';

const PasswordGenerator: React.FC = () => {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(24);
  const [options, setOptions] = useState({
    upper: true,
    lower: true,
    numbers: true,
    symbols: true,
  });

  const generate = () => {
    const sets = {
      upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
      lower: 'abcdefghijklmnopqrstuvwxyz',
      numbers: '0123456789',
      symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?',
    };

    let pool = '';
    if (options.upper) pool += sets.upper;
    if (options.lower) pool += sets.lower;
    if (options.numbers) pool += sets.numbers;
    if (options.symbols) pool += sets.symbols;

    if (!pool) return;

    const array = new Uint32Array(length);
    window.crypto.getRandomValues(array);
    
    let res = '';
    for (let i = 0; i < length; i++) {
      res += pool[array[i] % pool.length];
    }
    setPassword(res);
  };

  useEffect(() => generate(), [length, options]);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-[#050505] border border-white/10 p-16 rounded-sm shadow-2xl">
        <div className="flex flex-col items-center mb-16 space-y-4">
          <div className="p-6 bg-white text-black rounded-full shadow-[0_0_30px_rgba(255,255,255,0.1)]">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-white">Entropy Engine</h2>
        </div>

        <div className="relative group mb-12">
          <input 
            readOnly 
            value={password}
            className="w-full bg-white/[0.03] border border-white/5 p-12 text-3xl md:text-5xl font-mono text-center focus:outline-none transition-all rounded-sm tracking-tighter"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-8 gap-4">
            <button onClick={generate} className="p-3 text-gray-700 hover:text-white transition-colors">
              <RefreshCw size={24} />
            </button>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(password);
                alert('COPIED');
              }}
              className="p-5 bg-white text-black rounded-sm hover:scale-105 transition-all"
            >
              <Copy size={24} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-10">
            <div className="space-y-4">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">
                <span>Bit Depth / Length</span>
                <span className="text-white">{length} Chars</span>
              </div>
              <input 
                type="range" min="8" max="64" value={length} 
                onChange={(e) => setLength(parseInt(e.target.value))}
                className="w-full h-[1px] bg-white/10 appearance-none cursor-pointer accent-white" 
              />
            </div>
            
            <div className="flex h-[2px] gap-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`flex-1 transition-all duration-700 ${length / 16 > i ? 'bg-white' : 'bg-white/5'}`}></div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {Object.entries(options).map(([key, val]) => (
              <button
                key={key}
                onClick={() => setOptions(prev => ({ ...prev, [key]: !val }))}
                className={`py-5 rounded-sm border text-[9px] font-black uppercase tracking-widest transition-all ${
                  val ? 'bg-white text-black border-white' : 'border-white/5 text-gray-700 hover:border-white/20'
                }`}
              >
                {key}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordGenerator;

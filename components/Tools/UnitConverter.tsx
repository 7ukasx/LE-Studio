
import React, { useState } from 'react';
import { Zap, Ruler, Weight, Thermometer } from 'lucide-react';
import { ToolProps } from '../../types';

// Updated UnitConverter to accept ToolProps
const UnitConverter: React.FC<ToolProps> = ({ onNotify }) => {
  const [val, setVal] = useState('1');
  const [category, setCategory] = useState<'distance' | 'mass' | 'temp'>('distance');

  const convert = (v: string) => {
    const n = parseFloat(v) || 0;
    if (category === 'distance') {
      return {
        Meters: n.toFixed(2),
        Feet: (n * 3.28084).toFixed(2),
        Inches: (n * 39.3701).toFixed(2),
        Miles: (n / 1609.34).toFixed(4),
      };
    }
    if (category === 'mass') {
      return {
        Kilograms: n.toFixed(2),
        Pounds: (n * 2.20462).toFixed(2),
        Ounces: (n * 35.274).toFixed(2),
        Grams: (n * 1000).toFixed(0),
      };
    }
    return {
      Celsius: n.toFixed(2),
      Fahrenheit: ((n * 9/5) + 32).toFixed(2),
      Kelvin: (n + 273.15).toFixed(2),
    };
  };

  const res = convert(val);

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="bg-[#050505] border border-white/5 p-16 rounded-sm shadow-2xl">
        <div className="flex items-center gap-6 mb-16">
          <div className="p-5 bg-white text-black rounded-sm">
            <Zap size={28} />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.5em]">Unit Flux</h2>
            <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Universal Physics Conversion</p>
          </div>
        </div>

        <div className="flex gap-2 mb-16 bg-white/5 p-1 rounded-sm">
          {[
            { id: 'distance', icon: Ruler },
            { id: 'mass', icon: Weight },
            { id: 'temp', icon: Thermometer }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id as any);
                onNotify?.(`SWITCHED TO ${cat.id.toUpperCase()} MODULE`, "info");
              }}
              className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-sm border transition-all ${
                category === cat.id ? 'bg-white text-black border-white' : 'border-transparent text-gray-700 hover:text-white'
              }`}
            >
              <cat.icon size={16} />
              <span className="text-[9px] font-black uppercase tracking-widest">{cat.id}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-700 px-2">Input Source</label>
            <input 
              type="number" 
              value={val}
              onChange={(e) => setVal(e.target.value)}
              className="w-full bg-white/[0.03] border border-white/5 p-12 text-5xl font-mono focus:outline-none focus:border-white/10 transition-all rounded-sm tracking-tighter"
              placeholder="0.00"
            />
          </div>

          <div className="bg-white/[0.02] border border-white/5 p-10 space-y-8 rounded-sm">
            {Object.entries(res).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-700">{k}</span>
                <span className="text-3xl font-black tracking-tighter text-white">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitConverter;

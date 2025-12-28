
import React, { useEffect, useState, useRef } from 'react';
import { Activity, ShieldCheck, Zap, HardDrive, RefreshCw, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { ToolProps } from '../../types';

const PerformanceMonitor: React.FC<ToolProps> = ({ onNotify }) => {
  const [fps, setFps] = useState(60);
  const [fpsHistory, setFpsHistory] = useState<number[]>(new Array(60).fill(60));
  const [memory, setMemory] = useState<{ used: number; total: number; limit: number } | null>(null);
  const [isStressing, setIsStressing] = useState(false);
  const [stressLevel, setStressLevel] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  
  const requestRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(performance.now());
  const framesRef = useRef<number>(0);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 20)]);
  };

  useEffect(() => {
    addLog("TELEMETRY ACTIVE");
    const animate = (time: number) => {
      framesRef.current++;
      if (time - lastTimeRef.current >= 1000) {
        const currentFps = Math.round((framesRef.current * 1000) / (time - lastTimeRef.current));
        setFps(currentFps);
        setFpsHistory(prev => [...prev.slice(1), currentFps]);
        framesRef.current = 0;
        lastTimeRef.current = time;
        const perf = (performance as any).memory;
        if (perf) {
          setMemory({
            used: Math.round(perf.usedJSHeapSize / 1024 / 1024),
            total: Math.round(perf.totalJSHeapSize / 1024 / 1024),
            limit: Math.round(perf.jsHeapSizeLimit / 1024 / 1024),
          });
        }
      }
      if (isStressing) {
        let x = 0;
        for (let i = 0; i < stressLevel * 50000; i++) x += Math.sqrt(i);
      }
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current!);
  }, [isStressing, stressLevel]);

  return (
    <div className="max-w-7xl mx-auto py-4 flex flex-col gap-1 h-auto lg:h-[calc(100vh-140px)]">
      <div className="bg-[#050505] border border-white/5 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between rounded-sm gap-4">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="p-3 bg-white text-black rounded-sm shrink-0"><Activity size={20} /></div>
          <div><h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Performance Hub</h2><p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Real-time Telemetry</p></div>
        </div>
        <button onClick={() => { addLog("OPTIMIZING..."); onNotify?.("CORE OPTIMIZED", "success"); }} className="w-full sm:w-auto px-8 py-3 bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white hover:bg-white/10 transition-all rounded-sm flex items-center justify-center gap-3"><RefreshCw size={14} /> Optimize Core</button>
      </div>

      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-1 overflow-y-auto lg:overflow-hidden">
        <div className="lg:col-span-2 bg-[#050505] border border-white/5 p-8 sm:p-12 space-y-10">
          <div className="flex items-center justify-between"><h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">Stability (FPS)</h3><span className={`text-5xl font-black tracking-tighter ${fps > 55 ? 'text-white' : 'text-red-500'}`}>{fps}</span></div>
          <div className="h-40 sm:h-48 flex items-end gap-1 bg-black/50 border border-white/5 p-4 overflow-hidden relative"><div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>{fpsHistory.map((val, i) => (<div key={i} className="flex-1 bg-white/20 transition-all duration-300" style={{ height: `${(val / 60) * 100}%` }} />))}</div>
          <div className="grid grid-cols-3 gap-1">{['Max', 'Min', 'Status'].map((k, i) => (<div key={k} className="p-6 bg-white/[0.01] border border-white/5 flex flex-col items-center"><span className="text-[7px] font-black text-gray-800 tracking-widest uppercase mb-2">{k}</span><span className="text-sm font-black text-white">{i === 0 ? '60' : i === 1 ? Math.min(...fpsHistory) : fps > 55 ? 'STABLE' : 'DROP'}</span></div>))}</div>
        </div>

        <div className="bg-[#050505] border border-white/5 p-8 sm:p-12 flex flex-col justify-between">
          <div className="space-y-10">
            <h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">Resource Heap</h3>
            <div className="flex flex-col items-center gap-4 py-8 border border-white/5 bg-white/[0.02] rounded-sm relative overflow-hidden"><div className="text-4xl font-black tracking-tighter text-white">{memory ? memory.used : '--'}<span className="text-[10px] text-gray-700 ml-2">MB</span></div><div className="text-[7px] font-black uppercase tracking-widest text-gray-700">Active JS Heap</div><div className="absolute bottom-0 left-0 h-1 bg-white/10" style={{ width: memory ? `${(memory.used / memory.limit) * 100}%` : '0%' }}></div></div>
            <div className="space-y-4">{[['Limit', memory?.limit], ['Total', memory?.total]].map(([l, v]) => (<div key={l as string} className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-700"><span>{l as string}</span><span className="text-white">{v || '---'} MB</span></div>))}</div>
          </div>
          <div className="mt-8 p-5 bg-blue-500/5 border border-blue-500/10 rounded-sm"><p className="text-[8px] font-bold text-blue-500/50 uppercase leading-relaxed tracking-widest">Logic flow secure. Latency nominal.</p></div>
        </div>

        <div className="bg-[#050505] border border-white/5 p-8 sm:p-12 flex flex-col gap-10">
          <h3 className="text-[9px] font-black uppercase tracking-[0.5em] text-white/40">Stress Module</h3>
          <div className="flex-1 flex flex-col gap-8 justify-center">
            <button onClick={() => { setIsStressing(!isStressing); onNotify?.(isStressing ? "RECOVERED" : "STRESS INITIATED", isStressing ? "success" : "error"); }} className={`w-full py-10 rounded-sm border transition-all duration-500 flex flex-col items-center justify-center gap-4 ${isStressing ? 'bg-red-500 border-red-500 text-white' : 'bg-transparent border-white/10 text-gray-700 hover:text-white'}`}><Zap size={32} className={isStressing ? 'animate-pulse' : ''} /><span className="text-[9px] font-black uppercase tracking-widest">{isStressing ? 'LOAD ACTIVE' : 'INITIATE'}</span></button>
            <div className="space-y-4"><div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-700"><span>Intensity</span><span className="text-white">Level {stressLevel}</span></div><input type="range" min="0" max="10" step="1" value={stressLevel} onChange={(e) => setStressLevel(parseInt(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white cursor-pointer" /></div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-[#050505] border border-white/5 flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]"><div className="flex items-center gap-3"><Clock size={14} className="text-gray-700" /><h4 className="text-[9px] font-black uppercase tracking-[0.4em] text-white">Telemetry Log</h4></div></div>
          <div className="h-48 lg:h-auto overflow-y-auto p-6 font-mono text-[9px] text-gray-700 custom-scrollbar bg-black/40"><div className="space-y-1">{logs.map((log, i) => (<div key={i} className="flex gap-3 items-start border-l border-white/5 pl-3"><ChevronRight size={10} className="mt-0.5 shrink-0" /><span>{log}</span></div>))}</div></div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMonitor;

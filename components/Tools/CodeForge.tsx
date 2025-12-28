
import React, { useState, useEffect, useRef } from 'react';
import { 
  Code, Eye, Copy, RefreshCw, Download, Monitor, 
  Smartphone, Tablet, Terminal, Hash, ShieldCheck,
  Globe, Cpu, Zap, Box, ChevronRight, Play
} from 'lucide-react';
import { ToolProps } from '../../types';

type Language = 'html' | 'javascript' | 'python';

const CodeForge: React.FC<ToolProps> = ({ onNotify }) => {
  const [activeTab, setActiveTab] = useState<Language>('html');
  const [html, setHtml] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { background: #000; color: #fff; font-family: sans-serif; height: 100vh; display: flex; align-items: center; justify-content: center; margin: 0; }
    .core { border: 1px solid rgba(255,255,255,0.1); padding: 50px; border-radius: 30px; text-align: center; backdrop-filter: blur(20px); background: rgba(255,255,255,0.02); }
    h1 { letter-spacing: 0.6em; text-transform: uppercase; font-size: 14px; font-weight: 900; }
    #output { margin-top: 20px; font-family: monospace; color: #6366f1; font-size: 11px; }
  </style>
</head>
<body>
  <div class="core">
    <h1>Precision Forge</h1>
    <div id="output">Awaiting JS Trigger...</div>
  </div>
</body>
</html>`);

  const [javascript, setJavascript] = useState(`// JavaScript Controller
document.addEventListener('DOMContentLoaded', () => {
  const output = document.getElementById('output');
  output.innerText = 'JS LOGIC INITIALIZED';
  
  console.log('Precision Engine v3.0 Online');
});`);

  const [python, setPython] = useState(`# Python Logic Architect
def process_telemetry(data):
    return f"Processed: {data.upper()}"

signal = "le_core_v3"
print(process_telemetry(signal))
`);

  const [pythonOutput, setPythonOutput] = useState<string[]>([]);
  const [viewport, setViewport] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    setIsSyncing(true);
    const timeout = setTimeout(() => {
      if (iframeRef.current) {
        const doc = iframeRef.current.contentDocument || iframeRef.current.contentWindow?.document;
        if (doc) {
          const combined = html.replace('</body>', `<script>${javascript}</script></body>`);
          doc.open();
          doc.write(combined);
          doc.close();
        }
      }
      setIsSyncing(false);
    }, 400);
    return () => clearTimeout(timeout);
  }, [html, javascript]);

  const runPython = () => {
    setPythonOutput(prev => [...prev, `[INIT] Executing block at ${new Date().toLocaleTimeString()}`, `> ${python.split('\n')[python.split('\n').length - 2] || 'OK'}`]);
    onNotify?.("PYTHON LOGIC SIMULATED", "success");
  };

  const downloadProject = () => {
    const combined = html.replace('</body>', `<script>${javascript}</script></body>`);
    const blob = new Blob([combined], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `le-forge-bundle-${Date.now()}.html`;
    link.click();
    URL.revokeObjectURL(url);
    onNotify?.("PROJECT BUNDLE COMMITTED", "success");
  };

  const getViewportWidth = () => {
    if (viewport === 'mobile') return '375px';
    if (viewport === 'tablet') return '768px';
    return '100%';
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-12 flex flex-col gap-1 h-auto lg:h-[calc(100vh-140px)]">
      {/* Header */}
      <div className="bg-[#050505] border border-white/5 p-4 sm:p-8 flex flex-col md:flex-row items-center justify-between rounded-sm shrink-0 gap-6">
        <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 w-full md:w-auto">
          <div className="p-4 bg-white text-black rounded-sm shadow-[0_0_30px_rgba(255,255,255,0.15)] shrink-0">
            <Code size={24} />
          </div>
          <div className="flex bg-white/5 p-1 rounded-sm border border-white/5 w-full sm:w-auto overflow-x-auto">
            {[
              { id: 'html', label: 'WEB', icon: Globe },
              { id: 'python', label: 'PYTHON', icon: Cpu }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as Language)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-3 px-4 sm:px-6 py-3 text-[10px] font-black uppercase tracking-[0.3em] transition-all rounded-sm whitespace-nowrap ${
                  activeTab === tab.id || (activeTab === 'javascript' && tab.id === 'html') 
                  ? 'bg-white text-black' 
                  : 'text-gray-500 hover:text-white'
                }`}
              >
                <tab.icon size={14} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 w-full md:w-auto justify-end">
          <div className="hidden sm:flex bg-white/5 p-1 rounded-sm border border-white/5">
            {(['desktop', 'tablet', 'mobile'] as const).map((v) => (
              <button
                key={v}
                onClick={() => setViewport(v)}
                className={`p-3 transition-all rounded-sm ${
                  viewport === v ? 'bg-white text-black shadow-lg' : 'text-gray-500 hover:text-white'
                }`}
              >
                <Monitor size={16} />
              </button>
            ))}
          </div>

          <button 
            onClick={downloadProject}
            className="flex-1 md:flex-none px-6 sm:px-10 py-3 bg-white text-black text-[10px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-3 shadow-xl whitespace-nowrap"
          >
            <Download size={14} />
            Export
          </button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-1 overflow-hidden lg:min-h-0">
        {/* Editor Area */}
        <div className="flex-1 lg:flex-[1.2] bg-[#050505] border border-white/5 flex flex-col min-w-0 h-[400px] lg:h-auto">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto">
              <div className="flex items-center gap-3 text-gray-700 shrink-0">
                <Terminal size={14} />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Syntax</span>
              </div>
              
              {activeTab !== 'python' && (
                <div className="flex gap-4 border-l border-white/10 pl-4 sm:pl-6 shrink-0">
                  <button onClick={() => setActiveTab('html')} className={`text-[8px] font-black uppercase tracking-widest ${activeTab === 'html' ? 'text-blue-500' : 'text-gray-700'}`}>HTML/CSS</button>
                  <button onClick={() => setActiveTab('javascript')} className={`text-[8px] font-black uppercase tracking-widest ${activeTab === 'javascript' ? 'text-blue-500' : 'text-gray-700'}`}>JS</button>
                </div>
              )}
            </div>
            {isSyncing && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0"></div>}
          </div>
          
          <textarea
            value={activeTab === 'html' ? html : activeTab === 'javascript' ? javascript : python}
            onChange={(e) => {
              const val = e.target.value;
              if (activeTab === 'html') setHtml(val);
              else if (activeTab === 'javascript') setJavascript(val);
              else setPython(val);
            }}
            spellCheck={false}
            className="flex-1 bg-transparent p-6 sm:p-10 font-mono text-[12px] sm:text-[13px] text-gray-400 focus:outline-none resize-none leading-relaxed custom-scrollbar"
            placeholder={`Enter code...`}
          />

          <div className="p-3 sm:p-4 bg-white/[0.01] border-t border-white/5 flex justify-between items-center text-[7px] sm:text-[8px] font-black uppercase tracking-widest text-gray-700">
             <div className="flex gap-4">
               <span>Mode: {activeTab.toUpperCase()}</span>
             </div>
             <div className="flex items-center gap-2">
               <Zap size={10} className="text-blue-500/40" />
               <span>Ready</span>
             </div>
          </div>
        </div>

        {/* Preview Area */}
        <div className="flex-1 bg-[#050505] border border-white/5 flex flex-col min-w-0 h-[400px] lg:h-auto">
          <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <div className="flex items-center gap-3">
              <Eye size={14} className="text-gray-700" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Preview</span>
            </div>
            {activeTab === 'python' && (
              <button 
                onClick={runPython}
                className="flex items-center gap-2 px-4 py-1.5 bg-blue-500 text-white rounded-sm text-[8px] font-black uppercase tracking-widest hover:bg-blue-600 transition-all"
              >
                <Play size={10} fill="currentColor" /> Run
              </button>
            )}
          </div>
          
          <div className="flex-1 p-4 sm:p-6 bg-[#000] flex justify-center items-center overflow-auto custom-scrollbar relative">
             <div className="absolute inset-0 pointer-events-none opacity-[0.02] z-0" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
             
             {activeTab !== 'python' ? (
               <div 
                 className="bg-white transition-all duration-700 shadow-2xl overflow-hidden relative z-10"
                 style={{ width: getViewportWidth(), height: '100%', minHeight: '300px' }}
               >
                  <iframe 
                    ref={iframeRef}
                    title="Forge Preview"
                    className="w-full h-full border-0"
                  />
               </div>
             ) : (
               <div className="w-full h-full bg-[#0a0a0a] border border-white/5 p-6 sm:p-10 font-mono text-[11px] sm:text-[12px] text-green-500/80 custom-scrollbar overflow-y-auto">
                 {pythonOutput.length > 0 ? (
                   pythonOutput.map((line, i) => (
                     <div key={i} className="mb-2 flex gap-4">
                       <span className="text-gray-800">[{i}]</span>
                       <span>{line}</span>
                     </div>
                   ))
                 ) : (
                   <div className="h-full flex flex-col items-center justify-center opacity-10 gap-6">
                     <Cpu size={60} strokeWidth={1} />
                     <span className="text-[10px] font-black uppercase tracking-[0.8em]">Awaiting Instruction</span>
                   </div>
                 )}
               </div>
             )}
          </div>
        </div>

        {/* Action Sidebar/Bottom Bar */}
        <div className="w-full lg:w-16 bg-[#050505] border border-white/5 flex flex-row lg:flex-col items-center justify-center lg:py-6 gap-2 shrink-0 py-2">
           {[
             { id: 'copy', icon: Copy, action: () => { 
                const content = activeTab === 'html' ? html : activeTab === 'javascript' ? javascript : python;
                navigator.clipboard.writeText(content); 
                onNotify?.('COPIED', 'success'); 
             } },
             { id: 'reset', icon: RefreshCw, action: () => { if(confirm('Clear?')) { setHtml(''); setJavascript(''); setPython(''); onNotify?.('CLEARED', 'info'); } } }
           ].map((btn) => (
             <button
               key={btn.id}
               onClick={btn.action}
               className="p-4 text-gray-700 hover:text-white hover:bg-white/5 transition-all rounded-sm group relative"
             >
               <btn.icon size={18} />
             </button>
           ))}
        </div>
      </div>
    </div>
  );
};

export default CodeForge;

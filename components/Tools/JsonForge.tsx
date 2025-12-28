
import React, { useState } from 'react';
import { FileJson, Copy, RefreshCw } from 'lucide-react';
import { ToolProps } from '../../types';

// Updated JsonForge to accept ToolProps
const JsonForge: React.FC<ToolProps> = ({ onNotify }) => {
  const [input, setInput] = useState('{"status":"active","tools":12,"developer":"LE Studio"}');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, 2));
      setError('');
      onNotify?.("JSON BUFFER PRETTIFIED", "success");
    } catch (e: any) {
      setError(e.message);
      setOutput('');
      onNotify?.("FORGE ERROR: INVALID SYNTAX", "error");
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError('');
      onNotify?.("JSON BUFFER MINIFIED", "success");
    } catch (e: any) {
      setError(e.message);
      onNotify?.("FORGE ERROR: INVALID SYNTAX", "error");
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    onNotify?.('FORGED OUTPUT COPIED', 'success');
  };

  return (
    <div className="max-w-6xl mx-auto py-12 h-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 h-[calc(100vh-250px)]">
        <div className="flex flex-col gap-2">
          <div className="bg-[#050505] border border-white/5 p-6 rounded-sm flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Source Raw</span>
            <FileJson size={16} className="text-gray-800" />
          </div>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 bg-white/[0.02] border border-white/5 p-10 font-mono text-sm text-gray-400 focus:outline-none focus:border-white/10 resize-none rounded-sm"
            placeholder='{"key": "value"}'
          />
          <div className="grid grid-cols-2 gap-2">
            <button onClick={format} className="py-6 bg-white text-black font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">Prettify JSON</button>
            <button onClick={minify} className="py-6 bg-white/5 border border-white/5 text-white font-black uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all">Minify Output</button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <div className="bg-[#050505] border border-white/5 p-6 rounded-sm flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Output Standard</span>
            {output && (
              <button onClick={copyToClipboard} className="text-gray-500 hover:text-white">
                <Copy size={16} />
              </button>
            )}
          </div>
          <div className="flex-1 bg-white/[0.01] border border-white/5 p-10 font-mono text-sm text-green-500/80 overflow-auto rounded-sm">
            {error ? (
              <div className="text-red-500 font-bold uppercase tracking-widest text-[10px] bg-red-500/5 p-6 border border-red-500/20">
                [Syntax Error] {error}
              </div>
            ) : (
              <pre className="whitespace-pre-wrap">{output || '// Forged output will appear here'}</pre>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JsonForge;

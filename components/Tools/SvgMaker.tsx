
import React, { useEffect, useRef, useState } from 'react';
import { 
  PenTool, Download, Copy, Square, Circle, Triangle, Minus, 
  MousePointer, Trash2, Eye, Sliders, Focus, Layers, Code, RefreshCw
} from 'lucide-react';
import { ToolProps } from '../../types';

const SvgMaker: React.FC<ToolProps> = ({ onNotify }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [svgCode, setSvgCode] = useState<string>('');
  
  const [fillColor, setFillColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(1);
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [strokeColor, setStrokeColor] = useState('#6366F1');

  useEffect(() => {
    if (canvasRef.current && !fabricCanvas) {
      const containerWidth = canvasRef.current.parentElement?.clientWidth || 600;
      const canvasSize = Math.min(containerWidth - 48, 600);

      const canvas = new (window as any).fabric.Canvas(canvasRef.current, {
        width: canvasSize,
        height: canvasSize,
        backgroundColor: '#050505',
        preserveObjectStacking: true
      });
      
      const updateCode = () => { setSvgCode(canvas.toSVG()); };

      canvas.on('selection:created', (e: any) => handleSelection(e));
      canvas.on('selection:updated', (e: any) => handleSelection(e));
      canvas.on('selection:cleared', () => setSelectedObject(null));
      canvas.on('object:modified', updateCode);
      canvas.on('object:added', updateCode);
      canvas.on('object:removed', updateCode);
      
      setFabricCanvas(canvas);
      updateCode();
    }
  }, [canvasRef, fabricCanvas]);

  const handleSelection = (e: any) => {
    const obj = e.selected[0];
    setSelectedObject(obj);
    if (obj) {
      setFillColor(obj.fill || '#ffffff');
      setOpacity(obj.opacity || 1);
      setStrokeWidth(obj.strokeWidth || 2);
      setStrokeColor(obj.stroke || '#6366F1');
    }
  };

  const addObject = (type: string) => {
    let obj;
    const center = fabricCanvas.getCenter();
    const common = { left: center.left, top: center.top, fill: fillColor, opacity, strokeWidth, stroke: strokeColor, strokeUniform: true, originX: 'center', originY: 'center' };
    switch(type) {
      case 'rect': obj = new (window as any).fabric.Rect({...common, width: 100, height: 100}); break;
      case 'circle': obj = new (window as any).fabric.Circle({...common, radius: 50}); break;
      case 'triangle': obj = new (window as any).fabric.Triangle({...common, width: 100, height: 100}); break;
      case 'line': obj = new (window as any).fabric.Rect({...common, width: 200, height: strokeWidth}); break;
    }
    if (obj) { 
      fabricCanvas.add(obj); 
      fabricCanvas.setActiveObject(obj); 
      fabricCanvas.renderAll(); 
      onNotify?.(`${type.toUpperCase()} ADDED`, "info");
    }
  };

  const updateProp = (key: string, val: any) => {
    if (!selectedObject) return;
    selectedObject.set(key, val);
    fabricCanvas.renderAll();
    setSvgCode(fabricCanvas.toSVG());
    if (key === 'fill') setFillColor(val);
    if (key === 'opacity') setOpacity(val);
    if (key === 'strokeWidth') setStrokeWidth(val);
    if (key === 'stroke') setStrokeColor(val);
  };

  const downloadSVG = () => {
    const blob = new Blob([svgCode], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `le-vector-${Date.now()}.svg`;
    link.click();
    onNotify?.("SVG EXPORTED", "success");
  };

  return (
    <div className="flex flex-col h-auto lg:h-[calc(100vh-140px)] bg-black overflow-hidden gap-1">
      <div className="h-auto lg:h-14 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between p-4 sm:px-6 bg-[#050505] gap-4">
        <div className="flex items-center gap-4">
          <div className="p-2 bg-white text-black rounded-sm shrink-0"><PenTool size={14} /></div>
          <span className="text-[10px] font-black uppercase tracking-[0.4em] whitespace-nowrap">SVG Architect</span>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => { navigator.clipboard.writeText(svgCode); onNotify?.("XML COPIED", "success"); }} className="flex-1 sm:flex-none px-4 py-2 border border-white/10 text-[8px] font-black uppercase tracking-widest hover:bg-white/5 transition-all flex items-center justify-center gap-2"><Copy size={12} /> XML</button>
          <button onClick={downloadSVG} className="flex-1 sm:flex-none px-6 py-2 bg-white text-black text-[8px] font-black uppercase tracking-widest rounded-sm hover:bg-gray-200 transition-all flex items-center justify-center gap-2"><Download size={12} /> EXPORT</button>
        </div>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-y-auto lg:overflow-hidden gap-1">
        <div className="w-full lg:w-16 border-white/5 flex flex-row lg:flex-col items-center justify-center lg:py-6 gap-2 bg-[#050505] py-2 overflow-x-auto shrink-0 border-b lg:border-r">
          {[
            { id: 'select', icon: MousePointer },
            { id: 'rect', icon: Square, action: () => addObject('rect') },
            { id: 'circle', icon: Circle, action: () => addObject('circle') },
            { id: 'triangle', icon: Triangle, action: () => addObject('triangle') },
            { id: 'line', icon: Minus, action: () => addObject('line') },
          ].map((t) => (
            <button key={t.id} onClick={() => { setActiveTool(t.id); t.action?.(); }} className={`p-3 rounded-sm transition-all ${activeTool === t.id ? 'bg-white text-black' : 'text-gray-600 hover:text-white hover:bg-white/5'}`}><t.icon size={16} /></button>
          ))}
          <button onClick={() => { fabricCanvas.remove(...fabricCanvas.getActiveObjects()); fabricCanvas.discardActiveObject().renderAll(); }} className="p-3 text-red-900 hover:text-red-500 lg:mt-auto"><Trash2 size={16} /></button>
        </div>

        <div className="flex-1 flex flex-col lg:flex-row lg:min-h-0 min-h-[500px]">
          <div className="flex-1 flex items-center justify-center p-8 bg-[#030303] relative overflow-auto">
            <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
            <div className="border border-white/5 shadow-2xl relative z-10"><canvas ref={canvasRef} /></div>
          </div>
          <div className="w-full lg:w-80 border-t lg:border-l border-white/5 bg-[#050505] flex flex-col h-[300px] lg:h-full shrink-0">
            <div className="p-4 border-b border-white/5 flex items-center justify-between"><span className="text-[9px] font-black uppercase tracking-widest text-gray-500">Live Source</span><Code size={12} className="text-gray-800" /></div>
            <div className="flex-1 p-6 font-mono text-[9px] text-blue-500/50 overflow-auto break-all select-all leading-relaxed custom-scrollbar bg-black/20">{svgCode}</div>
          </div>
        </div>

        <div className="w-full lg:w-72 border-t lg:border-l border-white/5 bg-[#050505] flex flex-col shrink-0">
          {selectedObject ? (
            <div className="p-6 space-y-8">
              <div className="border-b border-white/5 pb-4"><span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Properties</span></div>
              <div className="space-y-6">
                <div className="space-y-2"><div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-700"><span>Fill</span><span>{fillColor}</span></div><input type="color" value={fillColor} onChange={(e) => updateProp('fill', e.target.value)} className="w-full h-10 bg-transparent border border-white/10 cursor-pointer" /></div>
                <div className="space-y-2"><div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-700"><span>Stroke</span><span>{strokeColor}</span></div><input type="color" value={strokeColor} onChange={(e) => updateProp('stroke', e.target.value)} className="w-full h-10 bg-transparent border border-white/10 cursor-pointer" /></div>
                <div className="space-y-2"><div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-700"><span>Opacity</span><span>{Math.round(opacity * 100)}%</span></div><input type="range" min="0" max="1" step="0.1" value={opacity} onChange={(e) => updateProp('opacity', parseFloat(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white" /></div>
                <div className="space-y-2"><div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-gray-700"><span>Weight</span><span>{strokeWidth}px</span></div><input type="range" min="0" max="20" step="1" value={strokeWidth} onChange={(e) => updateProp('strokeWidth', parseInt(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white" /></div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-10 gap-4"><Focus size={32} /><p className="text-[8px] font-black uppercase tracking-widest">Select Node</p></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SvgMaker;


import React, { useEffect, useRef, useState, useCallback } from 'react';
import { 
  Download, Upload, Square, Circle, Type as TypeIcon, MousePointer, 
  Trash2, Layers, Triangle, Minus, Settings2, Eye, EyeOff, Lock, Focus,
  Maximize, Activity, Palette, Sliders, Brush, Undo2, Redo2,
  ChevronUp, ChevronDown, Sun, Contrast, Droplets, Menu
} from 'lucide-react';
import { ToolProps } from '../../types';

const ImageEditor: React.FC<ToolProps> = ({ onNotify }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [fabricCanvas, setFabricCanvas] = useState<any>(null);
  const [activeTool, setActiveTool] = useState<string>('select');
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);
  
  const [fillColor, setFillColor] = useState('#ffffff');
  const [opacity, setOpacity] = useState(1);
  const [strokeWidth, setStrokeWidth] = useState(0);
  const [brushWidth, setBrushWidth] = useState(10);

  const [adjustments, setAdjustments] = useState({
    brightness: 0,
    contrast: 0,
    saturation: 0
  });

  const saveHistory = useCallback(() => {
    if (!fabricCanvas) return;
    const json = JSON.stringify(fabricCanvas.toJSON());
    setHistory(prev => {
      const newHist = prev.slice(0, historyIdx + 1);
      return [...newHist, json];
    });
    setHistoryIdx(prev => prev + 1);
  }, [fabricCanvas, historyIdx]);

  const undo = () => {
    if (historyIdx > 0 && fabricCanvas) {
      const prevIdx = historyIdx - 1;
      setHistoryIdx(prevIdx);
      fabricCanvas.loadFromJSON(history[prevIdx], () => {
        fabricCanvas.renderAll();
      });
    }
  };

  const redo = () => {
    if (historyIdx < history.length - 1 && fabricCanvas) {
      const nextIdx = historyIdx + 1;
      setHistoryIdx(nextIdx);
      fabricCanvas.loadFromJSON(history[nextIdx], () => {
        fabricCanvas.renderAll();
      });
    }
  };

  useEffect(() => {
    if (canvasRef.current && !fabricCanvas) {
      const canvasWidth = Math.min(window.innerWidth - 48, 900);
      const canvasHeight = Math.min(window.innerHeight - 300, 600);
      
      const canvas = new (window as any).fabric.Canvas(canvasRef.current, {
        width: canvasWidth,
        height: canvasHeight,
        backgroundColor: '#030303',
        preserveObjectStacking: true
      });
      
      canvas.on('selection:created', (e: any) => handleSelection(e));
      canvas.on('selection:updated', (e: any) => handleSelection(e));
      canvas.on('selection:cleared', () => setSelectedObject(null));
      canvas.on('object:modified', () => saveHistory());
      
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Delete' || e.key === 'Backspace') {
          const activeObjects = canvas.getActiveObjects();
          if (activeObjects.length > 0) {
            canvas.remove(...activeObjects);
            canvas.discardActiveObject().renderAll();
            saveHistory();
          }
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      setFabricCanvas(canvas);
      setHistory([JSON.stringify(canvas.toJSON())]);
      setHistoryIdx(0);

      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, [canvasRef, fabricCanvas]);

  const handleSelection = (e: any) => {
    const obj = e.selected[0];
    setSelectedObject(obj);
    if (obj) {
      setFillColor(obj.fill || '#ffffff');
      setOpacity(obj.opacity || 1);
      setStrokeWidth(obj.strokeWidth || 0);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && fabricCanvas) {
      const reader = new FileReader();
      reader.onload = (f) => {
        const data = f.target?.result;
        (window as any).fabric.Image.fromURL(data, (img: any) => {
          img.scaleToWidth(fabricCanvas.width * 0.8);
          fabricCanvas.add(img);
          fabricCanvas.centerObject(img);
          fabricCanvas.setActiveObject(img);
          fabricCanvas.renderAll();
          saveHistory();
          onNotify?.("IMAGE LOADED", "success");
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const setTool = (tool: string) => {
    setActiveTool(tool);
    if (!fabricCanvas) return;
    fabricCanvas.isDrawingMode = tool === 'brush';
    if (tool === 'brush') {
      fabricCanvas.freeDrawingBrush.width = brushWidth;
      fabricCanvas.freeDrawingBrush.color = fillColor;
    }
  };

  const addObject = (type: string) => {
    setTool('select');
    let obj;
    const common = { left: fabricCanvas.width/4, top: fabricCanvas.height/4, fill: fillColor, opacity, strokeWidth, stroke: '#ffffff' };
    switch(type) {
      case 'rect': obj = new (window as any).fabric.Rect({...common, width: 100, height: 100}); break;
      case 'circle': obj = new (window as any).fabric.Circle({...common, radius: 50}); break;
      case 'triangle': obj = new (window as any).fabric.Triangle({...common, width: 100, height: 100}); break;
      case 'text': obj = new (window as any).fabric.IText('Text Node', {...common, fontSize: 32, fontFamily: 'Inter'}); break;
    }
    if (obj) { 
        fabricCanvas.add(obj); 
        fabricCanvas.setActiveObject(obj); 
        fabricCanvas.renderAll(); 
        saveHistory();
    }
  };

  const updateProp = (key: string, val: any) => {
    if (!selectedObject) return;
    selectedObject.set(key, val);
    fabricCanvas.renderAll();
    if (key === 'fill') setFillColor(val);
    if (key === 'opacity') setOpacity(val);
    saveHistory();
  };

  const download = () => {
    const link = document.createElement('a');
    link.download = `LE_EXPORT_${Date.now()}.png`;
    link.href = fabricCanvas.toDataURL({ format: 'png', quality: 1, multiplier: 2 });
    link.click();
    onNotify?.("SAVED", "success");
  };

  return (
    <div className="flex flex-col h-auto lg:h-full bg-black select-none">
      {/* Header */}
      <div className="h-14 border-b border-white/5 flex items-center justify-between px-4 sm:px-6 bg-[#050505] shrink-0">
        <div className="flex items-center gap-4 sm:gap-6">
          <label className="flex items-center gap-2 px-3 py-1.5 bg-white/5 border border-white/5 rounded-sm cursor-pointer hover:bg-white/10 text-[9px] font-black uppercase tracking-widest text-gray-400">
            <Upload size={12} /> <span className="hidden sm:inline">Import</span>
            <input type="file" className="hidden" onChange={handleImageUpload} />
          </label>
          <div className="flex items-center gap-1">
            <button onClick={undo} disabled={historyIdx <= 0} className="p-2 text-gray-600 hover:text-white disabled:opacity-20"><Undo2 size={14} /></button>
            <button onClick={redo} disabled={historyIdx >= history.length - 1} className="p-2 text-gray-600 hover:text-white disabled:opacity-20"><Redo2 size={14} /></button>
          </div>
        </div>
        <button onClick={download} className="px-5 py-2 bg-white text-black text-[9px] font-black uppercase tracking-widest rounded-sm hover:bg-gray-200">
          Export
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden lg:min-h-0">
        {/* Toolbar */}
        <div className="w-full lg:w-16 border-b lg:border-r border-white/5 flex flex-row lg:flex-col items-center justify-center lg:py-6 gap-2 bg-[#050505] py-2 overflow-x-auto">
          {[
            { id: 'select', icon: MousePointer, action: () => setTool('select') },
            { id: 'brush', icon: Brush, action: () => setTool('brush') },
            { id: 'rect', icon: Square, action: () => addObject('rect') },
            { id: 'circle', icon: Circle, action: () => addObject('circle') },
            { id: 'text', icon: TypeIcon, action: () => addObject('text') },
          ].map((t) => (
            <button
              key={t.id}
              onClick={t.action}
              className={`p-3 rounded-sm transition-all ${activeTool === t.id ? 'bg-white text-black' : 'text-gray-600 hover:text-white'}`}
            >
              <t.icon size={16} />
            </button>
          ))}
          <button 
            onClick={() => { fabricCanvas.remove(...fabricCanvas.getActiveObjects()); fabricCanvas.discardActiveObject().renderAll(); saveHistory(); }} 
            className="p-3 text-red-900 hover:text-red-500 ml-auto lg:ml-0"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Viewport */}
        <div ref={containerRef} className="flex-1 bg-black flex items-center justify-center p-4 sm:p-10 overflow-auto custom-scrollbar relative h-[400px] sm:h-[600px] lg:h-auto">
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }}></div>
          <div className="border border-white/5 shadow-2xl bg-[#050505] relative z-10">
            <canvas ref={canvasRef} />
          </div>
        </div>

        {/* Inspector */}
        <div className="w-full lg:w-80 border-t lg:border-l border-white/5 bg-[#050505] flex flex-col h-auto lg:h-full overflow-y-auto">
          {selectedObject ? (
            <div className="p-6 space-y-8">
              <div className="flex items-center justify-between border-b border-white/5 pb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Properties</span>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[8px] font-black uppercase tracking-widest text-gray-700">Tone</label>
                  <input type="color" value={fillColor} onChange={(e) => updateProp('fill', e.target.value)} className="w-full h-10 bg-transparent border border-white/10 rounded-sm cursor-pointer" />
                </div>
                <div className="space-y-3">
                  <label className="text-[8px] font-black uppercase tracking-widest text-gray-700">Opacity</label>
                  <input type="range" min="0" max="1" step="0.01" value={opacity} onChange={(e) => updateProp('opacity', parseFloat(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white" />
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center opacity-10 flex flex-col items-center gap-4">
              <Focus size={32} />
              <span className="text-[8px] font-black uppercase tracking-widest">Select Node</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;

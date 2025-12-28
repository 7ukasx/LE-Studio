
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  FileDigit, Upload, Download, RefreshCw, PenTool, 
  Type as TypeIcon, MousePointer, ShieldCheck, ChevronLeft, 
  ChevronRight, ZoomIn, ZoomOut, Trash2, Layers, 
  Square, Circle, Highlighter, Save, Focus, Settings2,
  AlignCenter, AlignLeft, AlignRight, Bold
} from 'lucide-react';
import { ToolProps } from '../../types';
import { jsPDF } from 'jspdf';

interface PageData {
  objects: any;
}

const PDFEditor: React.FC<ToolProps> = ({ onNotify }) => {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [numPages, setNumPages] = useState(0);
  const [zoom, setZoom] = useState(1.2);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTool, setActiveTool] = useState<'select' | 'pen' | 'text' | 'rect' | 'circle' | 'highlighter'>('select');
  const [pageStates, setPageStates] = useState<Record<number, any>>({});
  const [selectedObject, setSelectedObject] = useState<any>(null);

  const [fillColor, setFillColor] = useState('#000000');
  const [fontSize, setFontSize] = useState(16);
  const [strokeWidth, setStrokeWidth] = useState(2);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricRef = useRef<any>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    script.async = true;
    script.onload = () => {
      (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    };
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = new (window as any).fabric.Canvas(canvasRef.current, {
      selection: true,
      preserveObjectStacking: true
    });

    canvas.on('selection:created', (e: any) => setSelectedObject(e.selected[0]));
    canvas.on('selection:updated', (e: any) => setSelectedObject(e.selected[0]));
    canvas.on('selection:cleared', () => setSelectedObject(null));
    
    fabricRef.current = canvas;

    return () => {
      canvas.dispose();
      fabricRef.current = null;
    };
  }, [pdfDoc]);

  const saveCurrentPageToState = useCallback(() => {
    if (!fabricRef.current) return;
    const json = fabricRef.current.toJSON();
    setPageStates(prev => ({ ...prev, [currentPage]: json }));
  }, [currentPage]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type === 'application/pdf') {
      setIsProcessing(true);
      onNotify?.("DECODING PDF BUFFER", "info");
      
      const arrayBuffer = await file.arrayBuffer();
      const loadingTask = (window as any).pdfjsLib.getDocument({ data: arrayBuffer });
      const doc = await loadingTask.promise;
      
      setPdfDoc(doc);
      setNumPages(doc.numPages);
      setPdfFile(file);
      setPageStates({});
      setCurrentPage(1);
      
      await loadPage(1, doc, zoom);
      setIsProcessing(false);
      onNotify?.("PDF DECODED", "success");
    }
  };

  const loadPage = async (pageNo: number, doc = pdfDoc, scale = zoom) => {
    if (!doc || !fabricRef.current) return;
    if (pdfDoc) saveCurrentPageToState();

    const page = await doc.getPage(pageNo);
    const viewport = page.getViewport({ scale });
    
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.height = viewport.height;
    tempCanvas.width = viewport.width;

    await page.render({ canvasContext: tempCtx, viewport }).promise;
    const bgImageUrl = tempCanvas.toDataURL();

    fabricRef.current.setDimensions({ width: viewport.width, height: viewport.height });

    (window as any).fabric.Image.fromURL(bgImageUrl, (img: any) => {
      fabricRef.current.setBackgroundImage(img, fabricRef.current.renderAll.bind(fabricRef.current));
      
      const saved = pageStates[pageNo];
      if (saved) {
        const filteredObjects = saved.objects.filter((o: any) => o.type !== 'image' || !o.isBackground);
        fabricRef.current.loadFromJSON({ ...saved, objects: filteredObjects }, () => {
          fabricRef.current.loadFromJSON({ ...saved, objects: filteredObjects }, () => {
             fabricRef.current.renderAll();
          });
        });
      } else {
        fabricRef.current.clear();
        fabricRef.current.setBackgroundImage(img, fabricRef.current.renderAll.bind(fabricRef.current));
      }
    });
  };

  const changePage = async (offset: number) => {
    const next = currentPage + offset;
    if (next >= 1 && next <= numPages) {
      setCurrentPage(next);
      await loadPage(next);
    }
  };

  const setTool = (tool: typeof activeTool) => {
    setActiveTool(tool);
    if (!fabricRef.current) return;

    fabricRef.current.isDrawingMode = false;
    fabricRef.current.defaultCursor = 'default';

    if (tool === 'pen') {
      fabricRef.current.isDrawingMode = true;
      fabricRef.current.freeDrawingBrush.width = strokeWidth;
      fabricRef.current.freeDrawingBrush.color = fillColor;
    } else if (tool === 'text') {
      fabricRef.current.defaultCursor = 'text';
    }
  };

  const addObject = (type: string) => {
    if (!fabricRef.current) return;
    let obj;
    const center = fabricRef.current.getCenter();
    const common = { 
      left: center.left, 
      top: center.top, 
      fill: fillColor, 
      stroke: fillColor, 
      strokeWidth: 0,
      opacity: activeTool === 'highlighter' ? 0.3 : 1
    };

    switch(type) {
      case 'rect': obj = new (window as any).fabric.Rect({...common, width: 100, height: 60}); break;
      case 'circle': obj = new (window as any).fabric.Circle({...common, radius: 40}); break;
      case 'text': obj = new (window as any).fabric.IText('Edit Text', {
        ...common,
        fontSize: fontSize,
        fontFamily: 'Inter',
        fill: fillColor
      }); break;
    }

    if (obj) {
      fabricRef.current.add(obj);
      fabricRef.current.setActiveObject(obj);
      fabricRef.current.renderAll();
      saveCurrentPageToState();
    }
  };

  const updateSelected = (prop: string, val: any) => {
    if (!selectedObject) return;
    selectedObject.set(prop, val);
    fabricRef.current.renderAll();
    saveCurrentPageToState();
    if (prop === 'fill') setFillColor(val);
    if (prop === 'fontSize') setFontSize(val);
    if (prop === 'strokeWidth') setStrokeWidth(val);
  };

  const exportPDF = async () => {
    if (!pdfDoc) return;
    setIsProcessing(true);
    saveCurrentPageToState();
    onNotify?.("COMPILING PDF", "info");

    const exportDoc = new jsPDF({
      orientation: 'p',
      unit: 'px',
      format: [fabricRef.current.width, fabricRef.current.height]
    });

    for (let i = 1; i <= numPages; i++) {
      if (i > 1) exportDoc.addPage([fabricRef.current.width, fabricRef.current.height]);
      await loadPage(i);
      await new Promise(r => setTimeout(r, 100));
      const dataUrl = fabricRef.current.toDataURL({ format: 'png', multiplier: 1 });
      exportDoc.addImage(dataUrl, 'PNG', 0, 0, fabricRef.current.width, fabricRef.current.height);
    }

    exportDoc.save(`LE_PDF_${Date.now()}.pdf`);
    setIsProcessing(false);
    onNotify?.("PDF SAVED", "success");
    loadPage(currentPage);
  };

  return (
    <div className="max-w-[1600px] mx-auto py-4 flex flex-col gap-1 h-auto lg:h-[calc(100vh-120px)]">
      {/* Header Bar */}
      <div className="bg-[#050505] border border-white/5 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between rounded-sm shrink-0 gap-4">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="p-3 bg-white text-black rounded-sm shadow-2xl shrink-0">
            <FileDigit size={20} />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">PDF ARCHITECT</h2>
            <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Multi-Layer Suite</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-4 w-full sm:w-auto justify-end">
          <div className="flex bg-white/5 p-1 rounded-sm border border-white/5 overflow-x-auto">
            <button onClick={() => setTool('select')} className={`p-2 transition-all rounded-sm ${activeTool === 'select' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}><MousePointer size={14} /></button>
            <button onClick={() => { setTool('text'); addObject('text'); }} className={`p-2 transition-all rounded-sm ${activeTool === 'text' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}><TypeIcon size={14} /></button>
            <button onClick={() => setTool('pen')} className={`p-2 transition-all rounded-sm ${activeTool === 'pen' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}><PenTool size={14} /></button>
            <button onClick={() => { setTool('rect'); addObject('rect'); }} className={`p-2 transition-all rounded-sm ${activeTool === 'rect' ? 'bg-white text-black' : 'text-gray-500 hover:text-white'}`}><Square size={14} /></button>
          </div>

          <div className="flex items-center gap-1 bg-white/5 p-1 rounded-sm">
            <button onClick={() => changePage(-1)} className="p-2 text-gray-500 hover:text-white"><ChevronLeft size={14} /></button>
            <span className="text-[9px] font-black text-white px-2 text-center whitespace-nowrap">{currentPage} / {numPages || '--'}</span>
            <button onClick={() => changePage(1)} className="p-2 text-gray-500 hover:text-white"><ChevronRight size={14} /></button>
          </div>

          <button 
            disabled={!pdfDoc || isProcessing}
            onClick={exportPDF}
            className="px-6 py-2 bg-white text-black text-[9px] font-black uppercase tracking-[0.3em] rounded-sm hover:bg-gray-200 transition-all flex items-center gap-2 disabled:opacity-20 shadow-xl whitespace-nowrap"
          >
            <Save size={14} /> Export
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-1 overflow-hidden lg:min-h-0">
        {/* Left Navigator */}
        <div className="lg:col-span-1 bg-[#050505] border border-white/5 flex flex-col order-2 lg:order-1 h-[250px] lg:h-auto">
          <div className="p-4 border-b border-white/5 flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Navigator</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2 bg-black/20">
            {pdfDoc ? (
              Array.from({ length: numPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  onClick={() => { setCurrentPage(p); loadPage(p); }}
                  className={`relative w-full aspect-[3/4] border rounded-sm overflow-hidden transition-all ${currentPage === p ? 'border-white' : 'border-white/5'}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center bg-white/5">
                    <span className="text-2xl font-black text-white/20">{p}</span>
                  </div>
                </button>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-2">
                <Upload size={32} />
              </div>
            )}
          </div>
          <div className="p-4 border-t border-white/5">
             <label className="w-full py-3 bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.3em] text-center block cursor-pointer hover:bg-white/10 text-gray-400">
                Import PDF
                <input type="file" className="hidden" accept=".pdf" onChange={handleFileUpload} />
             </label>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="lg:col-span-3 bg-[#020202] border border-white/5 relative overflow-auto flex items-start justify-center p-8 sm:p-12 custom-scrollbar order-1 lg:order-2 h-[400px] sm:h-[600px] lg:h-auto">
           {isProcessing && (
              <div className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center gap-6">
                <RefreshCw size={32} className="text-white animate-spin" />
              </div>
           )}

           <div className={`relative shadow-2xl ${!pdfDoc ? 'hidden' : 'block'}`}>
              <canvas ref={canvasRef} />
           </div>

           {!pdfDoc && !isProcessing && (
              <div className="flex flex-col items-center gap-6 opacity-10">
                <Focus size={80} strokeWidth={0.5} />
                <span className="text-[10px] font-black uppercase tracking-[0.4em]">Awaiting PDF</span>
              </div>
           )}
        </div>

        {/* Right Inspector */}
        <div className="lg:col-span-1 bg-[#050505] border border-white/5 flex flex-col order-3 h-auto lg:h-auto overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-8">
            {selectedObject ? (
              <>
                <div className="flex items-center justify-between border-b border-white/5 pb-4">
                   <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-500">Properties</h3>
                </div>
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="text-[8px] font-black uppercase tracking-widest text-gray-700">Tone</label>
                    <input type="color" value={fillColor} onChange={(e) => updateSelected('fill', e.target.value)} className="w-full h-10 bg-transparent cursor-pointer rounded-sm" />
                  </div>
                  {selectedObject.type === 'i-text' && (
                    <div className="space-y-2">
                      <label className="text-[8px] font-black uppercase tracking-widest text-gray-700">Size</label>
                      <input type="range" min="8" max="100" value={fontSize} onChange={(e) => updateSelected('fontSize', parseInt(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white" />
                    </div>
                  )}
                  <button onClick={() => { fabricRef.current.remove(selectedObject); fabricRef.current.renderAll(); saveCurrentPageToState(); }} className="w-full py-3 bg-red-500/10 text-red-500 text-[8px] font-black uppercase tracking-[0.3em] hover:bg-red-500 hover:text-white rounded-sm">Delete Node</button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center py-12 opacity-10 text-center gap-4">
                <Settings2 size={32} />
                <span className="text-[8px] font-black uppercase tracking-widest">Select Node</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PDFEditor;

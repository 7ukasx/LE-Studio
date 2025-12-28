
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  Image, 
  QrCode, 
  Binary, 
  Info, 
  Palette, 
  Layers, 
  LayoutDashboard,
  Menu,
  X,
  RefreshCw,
  Type as TypeIcon,
  Zap,
  FileJson,
  Hash,
  ArrowRightLeft,
  FileText,
  GlassWater,
  Minimize2,
  SquareCode,
  PenTool,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  Volume2,
  Activity,
  Keyboard,
  FileUp,
  Video,
  FileDigit,
  Code,
  Bell
} from 'lucide-react';
import { ToolType } from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import ImageEditor from './components/Tools/ImageEditor.tsx';
import ImageConverter from './components/Tools/ImageConverter.tsx';
import QRCodeGenerator from './components/Tools/QRCodeGenerator.tsx';
import BinaryConverter from './components/Tools/BinaryConverter.tsx';
import MetadataChanger from './components/Tools/MetadataChanger.tsx';
import ColorConverter from './components/Tools/ColorConverter.tsx';
import GradientGenerator from './components/Tools/GradientGenerator.tsx';
import LoremIpsum from './components/Tools/LoremIpsum.tsx';
import UnitConverter from './components/Tools/UnitConverter.tsx';
import JsonForge from './components/Tools/JsonForge.tsx';
import TextMetrics from './components/Tools/TextMetrics.tsx';
import Base64Engine from './components/Tools/Base64Engine.tsx';
import MarkdownStudio from './components/Tools/MarkdownStudio.tsx';
import GlassmorphismGen from './components/Tools/GlassmorphismGen.tsx';
import ImageOptimizer from './components/Tools/ImageOptimizer.tsx';
import SvgWorkspace from './components/Tools/SvgWorkspace.tsx';
import SvgMaker from './components/Tools/SvgMaker.tsx';
import SoundMixer from './components/Tools/SoundMixer.tsx';
import PerformanceMonitor from './components/Tools/PerformanceMonitor.tsx';
import TypingTest from './components/Tools/TypingTest.tsx';
import DocumentConverter from './components/Tools/DocumentConverter.tsx';
import VideoEditor from './components/Tools/VideoEditor.tsx';
import PDFEditor from './components/Tools/PDFEditor.tsx';
import CodeForge from './components/Tools/CodeForge.tsx';

const Logo = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => {
  const dimensions = size === "sm" ? "w-8 h-8" : size === "md" ? "w-12 h-12" : "w-32 h-32";
  const fontSize = size === "sm" ? "text-[10px]" : size === "md" ? "text-xl" : "text-5xl";
  
  return (
    <div className={`${dimensions} bg-white rounded-full flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]`}>
      <span className={`${fontSize} font-serif font-black text-black select-none tracking-tighter`}>LE</span>
    </div>
  );
};

const Toast = ({ message, type, onClose }: { message: string, type: 'success' | 'info' | 'error', onClose: () => void }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-10 sm:right-10 z-[100] flex items-center gap-4 bg-white text-black px-4 py-3 sm:px-6 sm:py-4 rounded-sm shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/20 animate-in slide-in-from-right-10 duration-500">
      <Bell size={16} className={type === 'error' ? 'text-red-600' : 'text-blue-600'} />
      <span className="text-[10px] font-black uppercase tracking-[0.2em]">{message}</span>
    </div>
  );
};

const App: React.FC = () => {
  const [activeTool, setActiveTool] = useState<ToolType>(ToolType.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toasts, setToasts] = useState<{ id: number, message: string, type: 'success' | 'info' | 'error' }[]>([]);

  const addToast = useCallback((message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToasts(prev => [...prev, { id: Date.now(), message, type }]);
  }, []);

  const tools = [
    { id: ToolType.DASHBOARD, name: 'Studio Home', icon: LayoutDashboard },
    { id: ToolType.IMAGE_EDITOR, name: 'Creative Editor', icon: Layers },
    { id: ToolType.VIDEO_EDITOR, name: 'Video Flux', icon: Video },
    { id: ToolType.CODE_FORGE, name: 'Code Forge', icon: Code },
    { id: ToolType.PDF_EDITOR, name: 'PDF Flux', icon: FileDigit },
    { id: ToolType.DOCUMENT_CONVERTER, name: 'Document Architect', icon: FileUp },
    { id: ToolType.TYPING_TEST, name: 'Typing Flux', icon: Keyboard },
    { id: ToolType.PERFORMANCE_MONITOR, name: 'Performance Hub', icon: Activity },
    { id: ToolType.IMAGE_OPTIMIZER, name: 'Image Optimizer', icon: Minimize2 },
    { id: ToolType.SOUND_MIXER, name: 'Sound Mixer', icon: Volume2 },
    { id: ToolType.IMAGE_CONVERTER, name: 'Format Converter', icon: Image },
    { id: ToolType.SVG_MAKER, name: 'SVG Maker', icon: PenTool },
    { id: ToolType.QR_GENERATOR, name: 'QR Engine', icon: QrCode },
    { id: ToolType.MARKDOWN_STUDIO, name: 'Markdown Studio', icon: FileText },
    { id: ToolType.GLASSMorphism, name: 'Glass Lab', icon: GlassWater },
    { id: ToolType.SVG_WORKSPACE, name: 'SVG Workspace', icon: SquareCode },
    { id: ToolType.LOREM_IPSUM, name: 'Ipsum Studio', icon: TypeIcon },
    { id: ToolType.UNIT_CONVERTER, name: 'Unit Flux', icon: Zap },
    { id: ToolType.JSON_FORGE, name: 'JSON Forge', icon: FileJson },
    { id: ToolType.TEXT_METRICS, name: 'Text Metrics', icon: Hash },
    { id: ToolType.BASE64_ENGINE, name: 'Base64 Engine', icon: ArrowRightLeft },
    { id: ToolType.BINARY_CONVERTER, name: 'Data Tool', icon: Binary },
    { id: ToolType.METADATA_CHANGER, name: 'EXIF Studio', icon: Info },
    { id: ToolType.COLOR_CONVERTER, name: 'Color Lab', icon: Palette },
    { id: ToolType.GRADIENT_GENERATOR, name: 'Gradients', icon: RefreshCw },
  ];

  const filteredTools = useMemo(() => {
    if (!searchQuery.trim()) return tools;
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, tools]);

  const renderActiveTool = () => {
    const props = { onNotify: addToast };
    switch (activeTool) {
      case ToolType.IMAGE_EDITOR: return <ImageEditor {...props} />;
      case ToolType.VIDEO_EDITOR: return <VideoEditor {...props} />;
      case ToolType.CODE_FORGE: return <CodeForge {...props} />;
      case ToolType.PDF_EDITOR: return <PDFEditor {...props} />;
      case ToolType.IMAGE_CONVERTER: return <ImageConverter {...props} />;
      case ToolType.IMAGE_OPTIMIZER: return <ImageOptimizer {...props} />;
      case ToolType.SOUND_MIXER: return <SoundMixer {...props} />;
      case ToolType.PERFORMANCE_MONITOR: return <PerformanceMonitor {...props} />;
      case ToolType.TYPING_TEST: return <TypingTest {...props} />;
      case ToolType.DOCUMENT_CONVERTER: return <DocumentConverter {...props} />;
      case ToolType.QR_GENERATOR: return <QRCodeGenerator {...props} />;
      case ToolType.LOREM_IPSUM: return <LoremIpsum {...props} />;
      case ToolType.UNIT_CONVERTER: return <UnitConverter {...props} />;
      case ToolType.JSON_FORGE: return <JsonForge {...props} />;
      case ToolType.TEXT_METRICS: return <TextMetrics {...props} />;
      case ToolType.BASE64_ENGINE: return <Base64Engine {...props} />;
      case ToolType.BINARY_CONVERTER: return <BinaryConverter {...props} />;
      case ToolType.METADATA_CHANGER: return <MetadataChanger {...props} />;
      case ToolType.COLOR_CONVERTER: return <ColorConverter {...props} />;
      case ToolType.GRADIENT_GENERATOR: return <GradientGenerator {...props} />;
      case ToolType.MARKDOWN_STUDIO: return <MarkdownStudio {...props} />;
      case ToolType.GLASSMorphism: return <GlassmorphismGen {...props} />;
      case ToolType.SVG_WORKSPACE: return <SvgWorkspace {...props} />;
      case ToolType.SVG_MAKER: return <SvgMaker {...props} />;
      default: return <Dashboard onSelectTool={setActiveTool} />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#000000] text-white overflow-hidden selection:bg-white selection:text-black">
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 bg-[#050505] border-r border-white/5 transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] lg:translate-x-0 ${
          isSidebarCollapsed ? 'lg:w-[72px]' : 'lg:w-64'
        } ${
          isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64'
        }`}
      >
        <div className="flex flex-col h-full transition-all duration-700 overflow-hidden">
          <div 
            className={`flex items-center mt-8 mb-10 px-6 group cursor-pointer transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${isSidebarCollapsed ? 'justify-center px-0' : 'gap-3'}`} 
            onClick={() => {
              setActiveTool(ToolType.DASHBOARD);
              setIsSidebarOpen(false);
            }}
          >
            <Logo size="sm" />
            {!isSidebarCollapsed && (
              <h1 className="text-[11px] font-black tracking-[0.3em] uppercase opacity-80 group-hover:opacity-100 transition-opacity whitespace-nowrap overflow-hidden">
                LE Studio
              </h1>
            )}
          </div>

          <div className="mb-6 px-4 relative transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <div 
              className={`absolute inset-y-0 flex items-center pointer-events-none text-gray-700 transition-all duration-500 ${isSidebarCollapsed ? 'left-1/2 -translate-x-1/2' : 'left-8'}`}
            >
              <Search size={14} />
            </div>
            <input
              type="text"
              placeholder={isSidebarCollapsed ? "" : "SEARCH..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={() => isSidebarCollapsed && setIsSidebarCollapsed(false)}
              className={`w-full bg-white/[0.02] border border-white/5 py-3 rounded-sm text-[9px] font-black uppercase tracking-[0.2em] focus:outline-none focus:border-white/20 focus:bg-white/[0.04] transition-all placeholder:text-gray-800 ${
                isSidebarCollapsed ? 'pl-0 pr-0 text-center cursor-pointer hover:bg-white/[0.06]' : 'pl-11 pr-4'
              }`}
            />
          </div>
          
          <nav className="flex-1 space-y-1 overflow-y-auto px-2 scrollbar-hide scroll-smooth pb-12">
            <style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }`}</style>
            {filteredTools.length > 0 ? (
              filteredTools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => {
                    setActiveTool(tool.id);
                    setIsSidebarOpen(false);
                  }}
                  title={isSidebarCollapsed ? tool.name : ""}
                  className={`w-full flex items-center rounded-sm transition-all duration-300 group ${
                    activeTool === tool.id 
                    ? 'bg-white text-black shadow-[0_0_25px_rgba(255,255,255,0.1)]' 
                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                  } ${
                    isSidebarCollapsed ? 'px-0 py-5 justify-center' : 'px-5 py-3.5 gap-4'
                  }`}
                >
                  <tool.icon 
                    size={16} 
                    strokeWidth={activeTool === tool.id ? 2.5 : 2} 
                    className={`shrink-0 transition-transform duration-500 ${isSidebarCollapsed ? 'group-hover:scale-125' : 'group-hover:translate-x-0.5'}`} 
                  />
                  {!isSidebarCollapsed && (
                    <span className="font-bold text-[9px] uppercase tracking-[0.2em] block pt-0.5 transition-all duration-500">
                      {tool.name}
                    </span>
                  )}
                </button>
              ))
            ) : (
              <div className="py-10 text-center">
                <p className={`text-[8px] font-black uppercase tracking-[0.3em] text-gray-800 italic transition-all duration-500 ${isSidebarCollapsed ? 'opacity-0' : 'opacity-100'}`}>Empty Signal</p>
              </div>
            )}
          </nav>

          <div className="mt-auto border-t border-white/5 bg-[#080808]/50 backdrop-blur-md hidden lg:block">
            <button 
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className={`flex w-full items-center justify-center py-6 transition-all duration-300 group relative ${
                isSidebarCollapsed ? 'bg-white/5 hover:bg-white text-gray-500 hover:text-black' : 'bg-transparent text-gray-600 hover:text-white hover:bg-white/[0.02]'
              }`}
              title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              <div className={`flex items-center gap-3 transition-transform duration-500 ${isSidebarCollapsed ? '' : 'group-hover:-translate-x-1'}`}>
                {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
                {!isSidebarCollapsed && (
                  <span className="text-[9px] font-black uppercase tracking-[0.4em]">Minimize Panel</span>
                )}
              </div>
            </button>
          </div>
        </div>
      </aside>

      <main 
        className={`flex-1 relative flex flex-col h-screen overflow-hidden transition-all duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] ${
          isSidebarCollapsed ? 'lg:ml-[72px]' : 'lg:ml-64'
        } ml-0`}
      >
        <header className="h-16 flex items-center justify-between px-6 lg:px-10 border-b border-white/5 bg-[#000000]/50 backdrop-blur-2xl sticky top-0 z-40">
          <div className="flex items-center gap-4 lg:gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white transition-colors"
            >
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <div className="flex items-center gap-3 lg:gap-4">
              <span className="text-[8px] lg:text-[9px] font-black text-gray-700 uppercase tracking-[0.4em] select-none">Studio</span>
              <div className="h-3 w-px bg-white/10"></div>
              <span className="text-[8px] lg:text-[9px] font-black uppercase tracking-[0.4em] text-white/90 truncate max-w-[120px] sm:max-w-none">
                {tools.find(t => t.id === activeTool)?.name}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 lg:gap-8">
            <div className="hidden sm:flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02]">
              <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.4)]"></div>
              <span className="text-[7px] font-black uppercase tracking-[0.4em] text-gray-500">Telemetry Active</span>
            </div>
            <button 
              onClick={() => window.location.reload()}
              className="text-gray-500 hover:text-white transition-colors p-2"
              title="Reload Session"
            >
              <RefreshCw size={14} />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 sm:p-8 lg:p-14 custom-scrollbar bg-[#000]">
          <div className="max-w-[1400px] mx-auto h-full">
            {renderActiveTool()}
          </div>
        </div>
      </main>

      <div className="pointer-events-none">
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </div>
    </div>
  );
};

export default App;

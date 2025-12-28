
import React from 'react';
import { 
  Image, 
  QrCode, 
  Binary, 
  Info, 
  Palette, 
  Layers, 
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
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
  Volume2,
  Activity,
  Keyboard,
  FileUp,
  Video,
  FileDigit,
  Code
} from 'lucide-react';
import { ToolType } from '../types';

interface DashboardProps {
  onSelectTool: (tool: ToolType) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onSelectTool }) => {
  const tools = [
    { id: ToolType.IMAGE_EDITOR, name: 'Creative Editor', desc: 'Pro canvas studio.', icon: Layers },
    { id: ToolType.VIDEO_EDITOR, name: 'Video Flux', desc: 'Native linear timeline.', icon: Video },
    { id: ToolType.CODE_FORGE, name: 'Code Forge', desc: 'Real-time HTML engine.', icon: Code },
    { id: ToolType.PDF_EDITOR, name: 'PDF Flux', desc: 'Annotate & edit docs.', icon: FileDigit },
    { id: ToolType.DOCUMENT_CONVERTER, name: 'Document Architect', desc: 'PDF synthesis engine.', icon: FileUp },
    { id: ToolType.TYPING_TEST, name: 'Typing Flux', desc: 'Keystroke velocity lab.', icon: Keyboard },
    { id: ToolType.PERFORMANCE_MONITOR, name: 'Performance Hub', desc: 'Real-time telemetry.', icon: Activity },
    { id: ToolType.SOUND_MIXER, name: 'Sound Mixer', desc: '4-track precision console.', icon: Volume2 },
    { id: ToolType.IMAGE_OPTIMIZER, name: 'Image Optimizer', desc: 'Smart local compression.', icon: Minimize2 },
    { id: ToolType.IMAGE_CONVERTER, name: 'Format Converter', desc: 'High-speed batching.', icon: Image },
    { id: ToolType.SVG_MAKER, name: 'SVG Maker', desc: 'Visual vector architect.', icon: PenTool },
    { id: ToolType.MARKDOWN_STUDIO, name: 'Markdown Studio', desc: 'Live side-by-side docs.', icon: FileText },
    { id: ToolType.GLASSMorphism, name: 'Glass Lab', desc: 'Craft glassmorphism CSS.', icon: GlassWater },
    { id: ToolType.SVG_WORKSPACE, name: 'SVG Workspace', desc: 'Live vector code editor.', icon: SquareCode },
    { id: ToolType.QR_GENERATOR, name: 'QR Engine', desc: 'Dynamic code forge.', icon: QrCode },
    { id: ToolType.LOREM_IPSUM, name: 'Ipsum Studio', desc: 'Designer text engine.', icon: TypeIcon },
    { id: ToolType.UNIT_CONVERTER, name: 'Unit Flux', desc: 'Universal unit physics.', icon: Zap },
    { id: ToolType.JSON_FORGE, name: 'JSON Forge', desc: 'Format and validate.', icon: FileJson },
    { id: ToolType.TEXT_METRICS, name: 'Text Metrics', desc: 'Advanced analysis.', icon: Hash },
    { id: ToolType.BASE64_ENGINE, name: 'Base64 Engine', desc: 'Encode/Decode logic.', icon: ArrowRightLeft },
    { id: ToolType.BINARY_CONVERTER, name: 'Data Tool', desc: 'Binary/Hex translation.', icon: Binary },
    { id: ToolType.METADATA_CHANGER, name: 'EXIF Studio', desc: 'Privacy metadata scrub.', icon: Info },
    { id: ToolType.COLOR_CONVERTER, name: 'Color Lab', desc: 'Advanced color spaces.', icon: Palette },
    { id: ToolType.GRADIENT_GENERATOR, name: 'Gradients', desc: 'CSS lighting forge.', icon: RefreshCw },
  ];

  return (
    <div className="pb-20 sm:pb-32">
      <div className="mb-16 sm:mb-28 flex flex-col items-center text-center">
        <h1 className="text-4xl sm:text-7xl lg:text-[160px] font-black tracking-tighter leading-none mb-6 sm:mb-10 text-white select-none">
          PRECISION <span className="text-white/10">CORE</span>
        </h1>
        <div className="h-[2px] w-32 sm:w-64 bg-white/5 mb-6 sm:mb-10 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent translate-x-[-100%] animate-[shimmer_3s_infinite]"></div>
        </div>
        <p className="text-[9px] sm:text-[11px] lg:text-xs text-gray-600 max-w-lg font-black uppercase tracking-[0.4em] sm:tracking-[0.6em] leading-relaxed px-4">
          High Performance Local Studio Suite
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => onSelectTool(tool.id)}
            className="group relative flex flex-col p-8 sm:p-14 bg-[#050505] border border-white/5 transition-all duration-700 text-left hover:bg-[#ffffff] hover:border-transparent hover:shadow-[0_0_50px_rgba(255,255,255,0.1)] overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 sm:p-8 opacity-0 group-hover:opacity-100 group-hover:translate-x-2 group-hover:-translate-y-2 transition-all duration-700">
              <ArrowUpRight size={18} className="text-black" />
            </div>
            
            <div className="mb-8 sm:mb-14 text-white group-hover:text-black transition-colors duration-700">
              <tool.icon size={32} strokeWidth={1} />
            </div>
            
            <h3 className="text-[11px] sm:text-[12px] font-black uppercase tracking-[0.4em] mb-3 sm:mb-4 group-hover:text-black transition-colors">
              {tool.name}
            </h3>
            <p className="text-[9px] sm:text-[10px] text-gray-700 font-bold uppercase tracking-widest leading-relaxed group-hover:text-black/60 transition-colors">
              {tool.desc}
            </p>

            <div className="mt-10 sm:mt-16 flex items-center justify-between">
              <span className="text-[8px] sm:text-[9px] font-black uppercase tracking-[0.4em] opacity-30 group-hover:opacity-100 group-hover:text-black transition-all">
                M-{tools.indexOf(tool) + 10}
              </span>
              <div className="w-1.5 h-1.5 rounded-full bg-white/10 group-hover:bg-black/20 transition-colors"></div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

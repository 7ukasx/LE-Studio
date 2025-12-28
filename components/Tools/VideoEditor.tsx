
import React, { useState, useRef, useEffect } from 'react';
import { 
  Video, Play, Pause, Scissors, Download, 
  Upload, Sliders, RefreshCw, 
  Film, Plus, Trash2, Gauge, Zap, Layers,
  ChevronRight, ArrowRight, Save, CheckCircle,
  Volume2, VolumeX, Activity
} from 'lucide-react';
import { ToolProps } from '../../types';

type VideoFilter = 'none' | 'grayscale(1)' | 'sepia(1)' | 'invert(1)' | 'contrast(2)' | 'hue-rotate(90deg)' | 'blur(4px)';

interface VideoSegment {
  id: string;
  start: number;
  end: number;
  name: string;
}

const VideoEditor: React.FC<ToolProps> = ({ onNotify }) => {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [activeFilter, setActiveFilter] = useState<VideoFilter>('none');
  const [resolution, setResolution] = useState<'720p' | '1080p' | '4K'>('1080p');
  
  const [segments, setSegments] = useState<VideoSegment[]>([]);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(0);

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [feedback, setFeedback] = useState<{ type: 'play' | 'pause'; id: number } | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoUrl) {
      return () => URL.revokeObjectURL(videoUrl);
    }
  }, [videoUrl]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      const url = URL.createObjectURL(file);
      setVideoFile(file);
      setVideoUrl(url);
      setCurrentTime(0);
      setSegments([]);
      setIsPlaying(false);
      onNotify?.("SOURCE STREAM SECURED", "success");
    } else if (file) {
      onNotify?.("INVALID FORMAT - VIDEO REQUIRED", "error");
    }
  };

  const onLoadedMetadata = () => {
    if (videoRef.current) {
      const d = videoRef.current.duration;
      setDuration(d);
      setRangeEnd(d);
      setRangeStart(0);
    }
  };

  const triggerFeedback = (type: 'play' | 'pause') => {
    setFeedback({ type, id: Date.now() });
    setTimeout(() => setFeedback(null), 800);
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => onNotify?.("PLAYBACK BLOCKED", "error"));
        triggerFeedback('play');
      } else {
        videoRef.current.pause();
        triggerFeedback('pause');
      }
    }
  };

  const handlePlayEvent = () => setIsPlaying(true);
  const handlePauseEvent = () => setIsPlaying(false);

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (videoRef.current) {
      videoRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  const changeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    onNotify?.(`VELOCITY: ${speed}x`, "info");
  };

  const addSegment = () => {
    if (!videoUrl) return;
    const newSeg: VideoSegment = {
      id: Math.random().toString(36).substr(2, 9),
      start: rangeStart,
      end: rangeEnd,
      name: `CUT ${segments.length + 1}`
    };
    setSegments([...segments, newSeg]);
    onNotify?.("SEGMENT CAPTURED", "success");
  };

  const removeSegment = (id: string) => {
    setSegments(segments.filter(s => s.id !== id));
    onNotify?.("SEGMENT PURGED", "info");
  };

  const exportVideo = async () => {
    if (!videoRef.current || !videoUrl) {
      onNotify?.("NO SOURCE DETECTED", "error");
      return;
    }

    const video = videoRef.current;
    const exportSegments = segments.length > 0 
      ? segments 
      : [{ id: 'full', start: 0, end: duration, name: 'Full Video' }];

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const resMap = { '720p': [1280, 720], '1080p': [1920, 1080], '4K': [3840, 2160] };
    const [w, h] = resMap[resolution];
    canvas.width = w;
    canvas.height = h;

    setIsExporting(true);
    setExportProgress(0);
    onNotify?.("IGNITING RENDER ENGINE", "info");

    const canvasStream = canvas.captureStream(30);
    let audioTracks: MediaStreamTrack[] = [];
    
    try {
      const videoStream = (video as any).captureStream ? (video as any).captureStream() : (video as any).mozCaptureStream();
      audioTracks = videoStream.getAudioTracks();
    } catch (e) {
      console.warn("Audio capture failed, exporting visual only.");
    }

    const combinedStream = new MediaStream([
      ...canvasStream.getVideoTracks(),
      ...audioTracks
    ]);

    const mimeTypes = [
      'video/mp4;codecs=avc1',
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm'
    ];
    
    const mimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || 'video/webm';
    const ext = mimeType.includes('mp4') ? 'mp4' : 'webm';

    const recorder = new MediaRecorder(combinedStream, { 
      mimeType,
      videoBitsPerSecond: resolution === '4K' ? 12000000 : 8000000 
    });
    
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `LE_FLUX_RENDER_${Date.now()}.${ext}`;
      a.click();
      
      setIsExporting(false);
      video.pause();
      video.playbackRate = playbackSpeed;
      onNotify?.("EXPORT COMMITTED", "success");
    };

    recorder.start();

    const totalPhysicalDuration = exportSegments.reduce((acc, s) => acc + (s.end - s.start), 0);
    let physicalTimeProcessed = 0;

    for (const segment of exportSegments) {
      video.currentTime = segment.start;
      video.playbackRate = playbackSpeed;
      
      await new Promise(r => {
        const h = () => { video.removeEventListener('seeked', h); r(null); };
        video.addEventListener('seeked', h);
      });

      video.play();

      while (video.currentTime < segment.end && !video.paused) {
        ctx.filter = activeFilter;
        ctx.drawImage(video, 0, 0, w, h);
        
        const elapsedInSegment = video.currentTime - segment.start;
        const totalPhysicalElapsed = physicalTimeProcessed + elapsedInSegment;
        const progress = Math.min(100, Math.round((totalPhysicalElapsed / totalPhysicalDuration) * 100));
        setExportProgress(progress);
        
        await new Promise(r => requestAnimationFrame(r));
        if (video.currentTime >= segment.end) break;
      }
      
      video.pause();
      physicalTimeProcessed += (segment.end - segment.start);
    }

    recorder.stop();
  };

  const formatTime = (time: number) => {
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-[1600px] mx-auto py-4 flex flex-col gap-1 h-auto lg:h-[calc(100vh-120px)]">
      {/* Top Controls */}
      <div className="bg-[#050505] border border-white/5 p-4 sm:p-6 flex flex-col sm:flex-row items-center justify-between rounded-sm shrink-0 gap-4">
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
          <div className="p-3 bg-white text-black rounded-sm shadow-xl shrink-0">
            <Video size={20} />
          </div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Flux Architect M-65</h2>
            <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Universal Render Studio</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto justify-end">
          <div className="flex bg-white/5 p-1 rounded-sm border border-white/5 overflow-x-auto">
            {(['720p', '1080p', '4K'] as const).map((res) => (
              <button
                key={res}
                onClick={() => setResolution(res)}
                className={`px-4 sm:px-5 py-2 text-[8px] font-black uppercase tracking-widest transition-all rounded-sm whitespace-nowrap ${
                  resolution === res ? 'bg-white text-black' : 'text-gray-500 hover:text-white'
                }`}
              >
                {res}
              </button>
            ))}
          </div>
          <button 
            onClick={() => { setVideoFile(null); setVideoUrl(null); setSegments([]); }}
            className="px-6 py-2.5 bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-[0.3em] text-gray-400 hover:text-white transition-all rounded-sm whitespace-nowrap"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-5 gap-1 overflow-hidden lg:min-h-0">
        {/* Left: Sequence List */}
        <div className="lg:col-span-1 bg-[#050505] border border-white/5 flex flex-col order-2 lg:order-1 h-[300px] lg:h-auto">
          <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.01]">
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">Sequence Stack</span>
            <Layers size={12} className="text-gray-800" />
          </div>
          
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {segments.length > 0 ? (
              segments.map((seg) => (
                <div key={seg.id} className="p-4 bg-white/[0.02] border border-white/5 rounded-sm group hover:border-white/20 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[8px] font-black text-blue-500 tracking-widest">{seg.name}</span>
                    <button onClick={() => removeSegment(seg.id)} className="text-gray-700 hover:text-red-500 transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] font-mono text-gray-500">
                    <span>{formatTime(seg.start)}</span>
                    <ArrowRight size={10} />
                    <span>{formatTime(seg.end)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center opacity-10 gap-3 text-center p-8">
                <Scissors size={32} strokeWidth={1} />
                <span className="text-[8px] font-black uppercase tracking-[0.4em]">Empty Timeline</span>
              </div>
            )}
          </div>

          <div className="p-5 border-t border-white/5 bg-white/[0.01]">
            <button 
              disabled={!videoUrl || isExporting}
              onClick={exportVideo}
              className="w-full py-5 bg-white text-black text-[9px] font-black uppercase tracking-[0.4em] hover:bg-gray-200 transition-all flex items-center justify-center gap-3 disabled:opacity-20 shadow-2xl"
            >
              <Save size={14} /> Finalize
            </button>
          </div>
        </div>

        {/* Center: Preview */}
        <div className="lg:col-span-3 bg-black flex flex-col border border-white/5 relative overflow-hidden group order-1 lg:order-2 h-[400px] sm:h-[500px] lg:h-auto">
          <div className="flex-1 flex items-center justify-center relative overflow-hidden bg-[#020202]">
             {feedback && (
               <div key={feedback.id} className="absolute z-50 pointer-events-none flex items-center justify-center bg-white/10 w-24 h-24 rounded-full animate-[ping_0.5s_ease-out]">
                 {feedback.type === 'play' ? <Play size={40} fill="white" className="text-white ml-2" /> : <Pause size={40} fill="white" className="text-white" />}
               </div>
             )}

             <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-10" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px)', backgroundSize: '100% 4px' }}></div>
             
             {videoUrl ? (
               <video 
                 ref={videoRef}
                 src={videoUrl}
                 onLoadedMetadata={onLoadedMetadata}
                 onTimeUpdate={handleTimeUpdate}
                 onPlay={handlePlayEvent}
                 onPause={handlePauseEvent}
                 style={{ filter: activeFilter }}
                 className="max-w-full max-h-full shadow-2xl cursor-pointer"
                 onClick={togglePlay}
               />
             ) : (
               <label className="flex flex-col items-center gap-8 cursor-pointer opacity-10 hover:opacity-20 transition-opacity p-8 sm:p-16 border border-dashed border-white/10 rounded-full">
                 <Film size={80} strokeWidth={1} />
                 <span className="text-[12px] font-black uppercase tracking-[1em] text-center ml-4">Source Offline</span>
                 <input type="file" className="hidden" accept="video/*" onChange={handleFileUpload} />
               </label>
             )}

             {isExporting && (
               <div className="absolute inset-0 bg-black/98 backdrop-blur-2xl z-50 flex flex-col items-center justify-center gap-10 text-center px-10">
                  <div className="flex flex-col items-center gap-4">
                    <div className="text-6xl sm:text-8xl font-black text-white tracking-tighter tabular-nums">{exportProgress}%</div>
                    <div className="w-48 sm:w-64 h-1.5 bg-white/5 rounded-full overflow-hidden">
                       <div className="h-full bg-white transition-all duration-300" style={{ width: `${exportProgress}%` }}></div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.8em] text-white">Rendering Matrix</h3>
                  </div>
               </div>
             )}
          </div>

          {/* Timeline UI */}
          <div className="bg-[#080808] border-t border-white/5 p-4 sm:p-6 flex flex-col gap-4 sm:gap-5 shrink-0">
            <div className="flex items-center gap-4 sm:gap-6">
              <button 
                onClick={togglePlay}
                disabled={!videoUrl}
                className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center bg-white text-black hover:bg-gray-200 transition-all rounded-sm disabled:opacity-20 shadow-xl shrink-0"
              >
                {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
              </button>
              
              <div className="flex-1 space-y-2">
                <div className="flex justify-between text-[8px] sm:text-[9px] font-black uppercase tracking-[0.3em] text-gray-600">
                  <div className="flex gap-2 sm:gap-4">
                    <span className="text-white font-mono">{formatTime(currentTime)}</span>
                    <span className="text-gray-800">/</span>
                    <span className="font-mono">{formatTime(duration)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`w-1 h-1 rounded-full ${isPlaying ? 'bg-green-500 animate-pulse' : 'bg-gray-800'}`}></div>
                  </div>
                </div>
                <div className="relative h-1 bg-white/5 rounded-full overflow-hidden">
                  <div 
                    className="absolute inset-y-0 bg-blue-500 z-10 pointer-events-none" 
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                  <input 
                    type="range" min="0" max={duration || 0} step="0.01" 
                    value={currentTime} 
                    onChange={handleSeek}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-30" 
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-8 pt-4 border-t border-white/5">
              <div className="flex-1 w-full space-y-3">
                <div className="flex justify-between text-[8px] font-black uppercase tracking-[0.4em] text-white/20">
                   <span>Mark Region</span>
                   <span className="font-mono text-gray-500">{formatTime(rangeStart)} — {formatTime(rangeEnd)}</span>
                </div>
                <div className="relative h-8 bg-white/[0.01] border border-white/5 rounded-sm overflow-hidden">
                   <div 
                    className="absolute inset-y-0 bg-blue-500/10 border-x border-blue-500/20" 
                    style={{ left: `${(rangeStart / duration) * 100}%`, right: `${100 - (rangeEnd / duration) * 100}%` }}
                  ></div>
                  <input 
                    type="range" min="0" max={duration || 0} step="0.1" 
                    value={rangeStart} 
                    onChange={(e) => setRangeStart(Math.min(parseFloat(e.target.value), rangeEnd - 0.1))}
                    className="absolute inset-0 w-full h-full opacity-0 z-20 cursor-pointer" 
                  />
                  <input 
                    type="range" min="0" max={duration || 0} step="0.1" 
                    value={rangeEnd} 
                    onChange={(e) => setRangeEnd(Math.max(parseFloat(e.target.value), rangeStart + 0.1))}
                    className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer" 
                  />
                </div>
              </div>

              <button 
                onClick={addSegment}
                disabled={!videoUrl}
                className="w-full sm:w-auto px-8 py-3 bg-blue-600 text-white hover:bg-blue-500 text-[8px] font-black uppercase tracking-[0.3em] transition-all rounded-sm flex items-center justify-center gap-3 disabled:opacity-10 shadow-lg"
              >
                <Plus size={14} /> Cut
              </button>
            </div>
          </div>
        </div>

        {/* Right: Tools */}
        <div className="lg:col-span-1 bg-[#050505] border border-white/5 flex flex-col order-3 h-auto lg:h-auto overflow-y-auto custom-scrollbar">
          <div className="p-6 space-y-10">
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/40">
                <Gauge size={14} />
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em]">Velocity</h4>
              </div>
              <div className="grid grid-cols-4 lg:grid-cols-2 gap-1">
                {[0.5, 1, 1.5, 2].map(s => (
                  <button 
                    key={s}
                    onClick={() => changeSpeed(s)}
                    className={`py-3 border text-[9px] font-black tracking-widest transition-all ${
                      playbackSpeed === s ? 'bg-white text-black' : 'bg-transparent border-white/5 text-gray-700 hover:text-white'
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 text-white/40">
                <Sliders size={14} />
                <h4 className="text-[9px] font-black uppercase tracking-[0.3em]">Matrix Filter</h4>
              </div>
              <div className="grid grid-cols-2 lg:grid-cols-1 gap-1">
                {(['none', 'grayscale(1)', 'sepia(1)', 'invert(1)', 'contrast(2)', 'hue-rotate(90deg)'] as const).map(f => (
                  <button 
                    key={f}
                    onClick={() => setActiveFilter(f as VideoFilter)}
                    className={`p-3 border text-left text-[8px] font-black uppercase tracking-widest transition-all flex items-center justify-between ${
                      activeFilter === f ? 'bg-white text-black' : 'bg-transparent border-white/5 text-gray-700 hover:border-white/10'
                    }`}
                  >
                    <span className="truncate mr-2">{f.split('(')[0].toUpperCase()}</span>
                    {activeFilter === f && <CheckCircle size={10} className="shrink-0" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEditor;


import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Play, Square, Upload, Music, Settings2, SlidersHorizontal, Activity } from 'lucide-react';
import { ToolProps } from '../../types';

interface TrackState {
  id: number;
  name: string;
  volume: number;
  pan: number;
  muted: boolean;
  soloed: boolean;
  fileName: string | null;
}

const SoundMixer: React.FC<ToolProps> = ({ onNotify }) => {
  const [tracks, setTracks] = useState<TrackState[]>([
    { id: 1, name: 'TRACK 01', volume: 0.8, pan: 0, muted: false, soloed: false, fileName: null },
    { id: 2, name: 'TRACK 02', volume: 0.8, pan: 0, muted: false, soloed: false, fileName: null },
    { id: 3, name: 'TRACK 03', volume: 0.8, pan: 0, muted: false, soloed: false, fileName: null },
    { id: 4, name: 'TRACK 04', volume: 0.8, pan: 0, muted: false, soloed: false, fileName: null },
  ]);
  const [masterVolume, setMasterVolume] = useState(0.8);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const trackNodesRef = useRef<Map<number, { 
    source: AudioBufferSourceNode | null, 
    gain: GainNode, 
    panner: StereoPannerNode,
    analyser: AnalyserNode,
    buffer: AudioBuffer | null
  }>>(new Map());

  const meterCanvasRefs = useRef<Map<number, HTMLCanvasElement>>(new Map());

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      masterGainRef.current = audioContextRef.current.createGain();
      masterGainRef.current.connect(audioContextRef.current.destination);

      tracks.forEach(t => {
        const gain = audioContextRef.current!.createGain();
        const panner = audioContextRef.current!.createStereoPanner();
        const analyser = audioContextRef.current!.createAnalyser();
        analyser.fftSize = 256;

        gain.connect(panner);
        panner.connect(analyser);
        analyser.connect(masterGainRef.current!);

        trackNodesRef.current.set(t.id, { source: null, gain, panner, analyser, buffer: null });
      });
    }

    return () => stopAll();
  }, []);

  useEffect(() => {
    let animationId: number;
    const drawMeters = () => {
      tracks.forEach(t => {
        const nodes = trackNodesRef.current.get(t.id);
        const canvas = meterCanvasRefs.current.get(t.id);
        if (nodes && canvas) {
          const ctx = canvas.getContext('2d');
          if (ctx) {
            const dataArray = new Uint8Array(nodes.analyser.frequencyBinCount);
            nodes.analyser.getByteFrequencyData(dataArray);
            const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
            
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.fillStyle = '#0a0a0a';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            
            const height = (average / 180) * canvas.height;
            const gradient = ctx.createLinearGradient(0, canvas.height, 0, 0);
            gradient.addColorStop(0, '#111');
            gradient.addColorStop(0.7, '#fff');
            gradient.addColorStop(1, '#6366F1');
            
            ctx.fillStyle = gradient;
            ctx.fillRect(0, canvas.height - height, canvas.width, height);
          }
        }
      });
      animationId = requestAnimationFrame(drawMeters);
    };
    drawMeters();
    return () => cancelAnimationFrame(animationId);
  }, [tracks]);

  useEffect(() => {
    if (masterGainRef.current) {
      masterGainRef.current.gain.value = masterVolume;
    }
    tracks.forEach(t => {
      const nodes = trackNodesRef.current.get(t.id);
      if (nodes) {
        nodes.gain.gain.value = t.muted ? 0 : t.volume;
        nodes.panner.pan.value = t.pan;
      }
    });
  }, [tracks, masterVolume]);

  const handleFileUpload = async (trackId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !audioContextRef.current) return;
    const arrayBuffer = await file.arrayBuffer();
    const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
    const nodes = trackNodesRef.current.get(trackId);
    if (nodes) {
      nodes.buffer = audioBuffer;
      setTracks(prev => prev.map(t => t.id === trackId ? { ...t, fileName: file.name } : t));
      onNotify?.(`TRACK ${trackId} LOADED`, "info");
    }
  };

  const playAll = () => {
    if (audioContextRef.current?.state === 'suspended') audioContextRef.current.resume();
    tracks.forEach(t => {
      const nodes = trackNodesRef.current.get(t.id);
      if (nodes && nodes.buffer) {
        if (nodes.source) nodes.source.stop();
        const source = audioContextRef.current!.createBufferSource();
        source.buffer = nodes.buffer;
        source.loop = true;
        source.connect(nodes.gain);
        source.start(0);
        nodes.source = source;
      }
    });
    setIsPlaying(true);
    onNotify?.("AUDIO ENGINE ACTIVE", "success");
  };

  const stopAll = () => {
    tracks.forEach(t => {
      const nodes = trackNodesRef.current.get(t.id);
      if (nodes && nodes.source) {
        nodes.source.stop();
        nodes.source = null;
      }
    });
    setIsPlaying(false);
    onNotify?.("ENGINE TERMINATED", "info");
  };

  const updateTrack = (id: number, field: keyof TrackState, value: any) => {
    setTracks(prev => prev.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-8 flex flex-col gap-1 h-auto lg:h-[calc(100vh-140px)]">
      <div className="bg-[#050505] border border-white/5 p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between rounded-sm gap-4">
        <div className="flex items-center gap-6 w-full sm:w-auto">
          <div className="p-3 bg-white text-black rounded-sm shrink-0"><Volume2 size={20} /></div>
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em]">Precision Mixer M-11</h2>
            <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Quad-Track Signal Console</p>
          </div>
        </div>
        <button 
          onClick={isPlaying ? stopAll : playAll}
          className={`w-full sm:w-auto px-10 py-4 text-[10px] font-black uppercase tracking-[0.4em] flex items-center justify-center gap-3 rounded-sm transition-all ${
            isPlaying ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white text-black hover:bg-gray-200'
          }`}
        >
          {isPlaying ? <Square size={16} fill="currentColor" /> : <Play size={16} fill="currentColor" />}
          {isPlaying ? 'STOP' : 'START ENGINE'}
        </button>
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-1 overflow-hidden lg:min-h-0">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1 overflow-y-auto lg:overflow-visible">
          {tracks.map((track) => (
            <div key={track.id} className="bg-[#050505] border border-white/5 p-6 flex flex-col gap-8 lg:min-h-0">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="text-[9px] font-black uppercase tracking-[0.3em] text-white/40">{track.name}</h4>
                  <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1 truncate max-w-[100px]">{track.fileName || 'Empty'}</p>
                </div>
                <label className="cursor-pointer text-gray-700 hover:text-white"><Upload size={14} /><input type="file" className="hidden" accept="audio/*" onChange={(e) => handleFileUpload(track.id, e)} /></label>
              </div>

              <div className="h-32 lg:h-40 w-full bg-black/50 border border-white/5 rounded-sm overflow-hidden">
                <canvas ref={(el) => { if (el) meterCanvasRefs.current.set(track.id, el); }} className="w-full h-full opacity-60" />
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between text-[7px] font-black uppercase tracking-widest text-gray-800"><span>Pan</span><span>{track.pan.toFixed(2)}</span></div>
                  <input type="range" min="-1" max="1" step="0.01" value={track.pan} onChange={(e) => updateTrack(track.id, 'pan', parseFloat(e.target.value))} className="w-full h-px bg-white/10 appearance-none accent-white cursor-pointer" />
                </div>
                
                <div className="flex flex-col items-center gap-4 py-4 bg-white/[0.01] border border-white/5 rounded-sm">
                   <div className="h-40 lg:h-56 relative flex items-center justify-center">
                     <div className="absolute inset-y-0 w-px bg-white/5"></div>
                     <input type="range" min="0" max="1.5" step="0.01" value={track.volume} onChange={(e) => updateTrack(track.id, 'volume', parseFloat(e.target.value))} className="h-40 lg:h-56 appearance-none bg-transparent cursor-pointer accent-white [writing-mode:bt-lr] [-webkit-appearance:slider-vertical]" />
                   </div>
                   <span className="text-[8px] font-mono text-gray-700">{(track.volume * 100).toFixed(0)}%</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-1 mt-auto">
                <button onClick={() => updateTrack(track.id, 'muted', !track.muted)} className={`py-2 text-[8px] font-black uppercase tracking-widest border ${track.muted ? 'bg-red-500 text-white border-red-500' : 'bg-transparent border-white/5 text-gray-700 hover:text-white'}`}>Mute</button>
                <button onClick={() => updateTrack(track.id, 'soloed', !track.soloed)} className={`py-2 text-[8px] font-black uppercase tracking-widest border ${track.soloed ? 'bg-blue-500 text-white border-blue-500' : 'bg-transparent border-white/5 text-gray-700 hover:text-white'}`}>Solo</button>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full lg:w-64 bg-[#050505] border border-white/5 p-8 flex flex-col gap-10 lg:min-h-0">
          <div className="flex items-center gap-3"><Settings2 size={14} className="text-gray-700" /><h4 className="text-[10px] font-black uppercase tracking-[0.4em]">Master</h4></div>
          <div className="flex-1 flex flex-col items-center justify-center gap-8 bg-white/[0.02] border border-white/5 rounded-sm py-8 lg:py-0">
            <input type="range" min="0" max="1.5" step="0.01" value={masterVolume} onChange={(e) => setMasterVolume(parseFloat(e.target.value))} className="h-48 lg:h-80 appearance-none bg-transparent cursor-pointer accent-white [writing-mode:bt-lr] [-webkit-appearance:slider-vertical] scale-x-125" />
            <div className="text-center"><span className="text-3xl font-black text-white">{(masterVolume * 100).toFixed(0)}</span><p className="text-[7px] font-black uppercase tracking-widest text-gray-700 mt-1">Output Level</p></div>
          </div>
          <div className="h-16 bg-black border border-white/5 p-3 flex flex-col justify-between"><div className="flex justify-between text-[7px] font-mono text-gray-700 uppercase"><span>Matrix Core</span><span>Active</span></div><div className="h-1 bg-white/5 w-full rounded-full overflow-hidden"><div className="h-full bg-blue-500/30 w-1/3 animate-pulse"></div></div></div>
        </div>
      </div>
    </div>
  );
};

export default SoundMixer;

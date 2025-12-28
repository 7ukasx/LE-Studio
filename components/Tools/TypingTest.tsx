
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Keyboard, RefreshCw, Timer, Target, Zap, ChevronRight, Activity, Infinity as InfinityIcon } from 'lucide-react';
import { ToolProps } from '../../types';

const SAMPLES = [
  "Precision engineering requires absolute focus and high-performance throughput. The ability to translate thought into digital signal with minimal latency is the hallmark of a true craftsman. Keystone modules operate at the edge of physical limitations.",
  "Keystroke dynamics offer a window into the user's cognitive state. Real-time telemetry processing allows for immediate feedback loops, enhancing the overall system stability and user interaction efficiency within the Studio environment.",
  "Digital architecture is built upon layers of abstraction. From the low-level binary streams to high-level reactive interfaces, every bit of data must be handled with surgical precision to ensure the integrity of the creative core.",
  "Minimalist design is not just an aesthetic choice; it is a philosophy of reduction. By removing the unnecessary, we expose the essence of the tool, allowing for a pure connection between the user and their digital workspace.",
  "Throughput is defined by the volume of successful operations over a specific time interval. In high-stakes environments, every millisecond counts, and the performance of the human-machine interface is often the ultimate bottleneck."
];

type DurationOption = 15 | 60 | 600 | 'infinite';

const TypingTest: React.FC<ToolProps> = ({ onNotify }) => {
  const [targetText, setTargetText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<DurationOption>(60);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [isFinished, setIsFinished] = useState(false);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<number | null>(null);

  const initTest = useCallback(() => {
    const randomIdx = Math.floor(Math.random() * SAMPLES.length);
    setTargetText(SAMPLES[randomIdx]);
    setUserInput("");
    setStartTime(null);
    setTimeLeft(selectedDuration === 'infinite' ? 0 : selectedDuration);
    setIsFinished(false);
    setWpm(0);
    setAccuracy(100);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, [selectedDuration]);

  // Only run initTest on mount or when duration options change
  useEffect(() => {
    initTest();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [selectedDuration, initTest]);

  const finishTest = useCallback(() => {
    setIsFinished(true);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    onNotify?.("TYPING SEQUENCE COMPLETE", "success");
  }, [onNotify]);

  const startTimer = useCallback(() => {
    setStartTime(Date.now());
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft(prev => {
        if (selectedDuration === 'infinite') {
          return prev + 1;
        }
        if (prev <= 1) {
          finishTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [finishTest, selectedDuration]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isFinished) return;
    
    if (startTime === null && value.length > 0) {
      startTimer();
    }

    // Prevent typing more than target
    if (value.length > targetText.length) return;

    setUserInput(value);

    // WPM Calculation (5 characters = 1 word)
    const timeElapsed = (Date.now() - (startTime || Date.now())) / 60000; // in minutes
    const charCount = value.length;
    const wordsTyped = charCount / 5;
    const currentWpm = timeElapsed > 0.01 ? Math.round(wordsTyped / timeElapsed) : 0;
    setWpm(currentWpm);

    // Accuracy Calculation
    let correctChars = 0;
    const compareLen = value.length;
    for (let i = 0; i < compareLen; i++) {
      if (value[i] === targetText[i]) {
        correctChars++;
      }
    }
    const currentAccuracy = compareLen > 0 ? Math.round((correctChars / compareLen) * 100) : 100;
    setAccuracy(currentAccuracy);

    // Check if finished by text completion
    if (value.length >= targetText.length && targetText.length > 0) {
      finishTest();
    }
  };

  const focusInput = () => {
    if (inputRef.current) inputRef.current.focus();
  };

  return (
    <div className="max-w-6xl mx-auto py-12 flex flex-col gap-1">
      {/* Top Header */}
      <div className="bg-[#050505] border border-white/5 p-10 flex items-center justify-between rounded-sm">
        <div className="flex items-center gap-6">
          <div className="p-4 bg-white text-black rounded-sm shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            <Keyboard size={24} />
          </div>
          <div>
            <h2 className="text-[11px] font-black uppercase tracking-[0.5em]">Typing Flux M-44</h2>
            <p className="text-[8px] font-bold text-gray-700 uppercase tracking-widest mt-1">Industrial Velocity Module</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          {/* Duration Selector */}
          <div className="flex bg-white/5 p-1 rounded-sm border border-white/5">
            {[
              { label: '15S', value: 15 },
              { label: '1M', value: 60 },
              { label: '10M', value: 600 },
              { label: 'INF', value: 'infinite' }
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => {
                  setSelectedDuration(opt.value as DurationOption);
                  onNotify?.(`INTERVAL SET: ${opt.label}`, "info");
                }}
                className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest transition-all rounded-sm ${
                  selectedDuration === opt.value 
                  ? 'bg-white text-black' 
                  : 'text-gray-500 hover:text-white'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => {
              initTest();
              onNotify?.("BUFFER RE-INITIALIZED", "info");
            }}
            className="px-8 py-3 bg-white/5 border border-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-gray-400 hover:text-white hover:bg-white/10 transition-all flex items-center gap-3 rounded-sm"
          >
            <RefreshCw size={14} />
            Hot Restart
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-1">
        {/* Main Typing Quadrant */}
        <div className="lg:col-span-3 bg-[#050505] border border-white/5 p-16 space-y-12 relative overflow-hidden group min-h-[500px]">
          {/* Progress Bar */}
          {selectedDuration !== 'infinite' && (
            <div className="absolute top-0 left-0 h-[2px] bg-white/10 w-full">
              <div 
                className="h-full bg-white transition-all duration-1000 ease-linear" 
                style={{ width: `${(timeLeft / (selectedDuration as number)) * 100}%` }}
              ></div>
            </div>
          )}

          <div 
            className="text-3xl font-mono leading-relaxed tracking-tight relative z-10 select-none cursor-text"
            onClick={focusInput}
          >
            <div className="relative whitespace-pre-wrap break-words">
              {targetText.split("").map((char, i) => {
                let color = "text-white/20"; 
                let decoration = "";
                
                if (i < userInput.length) {
                  color = userInput[i] === char ? "text-white" : "text-red-500 bg-red-500/10";
                } else if (i === userInput.length) {
                  color = "text-white animate-pulse";
                  decoration = "underline decoration-2 underline-offset-8";
                }

                return (
                  <span key={i} className={`${color} ${decoration} transition-colors duration-150`}>
                    {char}
                  </span>
                );
              })}
            </div>
          </div>

          <input
            ref={inputRef}
            type="text"
            value={userInput}
            onChange={handleInputChange}
            disabled={isFinished}
            className="absolute inset-0 w-full h-full opacity-0 cursor-default"
            autoFocus
          />

          {/* Minimal Instruction (Non-blocking) */}
          {!startTime && !isFinished && (
            <div className="absolute bottom-12 left-0 w-full flex justify-center pointer-events-none">
              <div className="flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/5 rounded-full animate-pulse">
                <Zap size={12} className="text-white" />
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white/40">Input Telemetry to Begin Sequence</span>
              </div>
            </div>
          )}

          {isFinished && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#050505]/95 backdrop-blur-lg z-30 border border-white/5">
              <div className="flex flex-col items-center text-center gap-10 p-12 max-w-md">
                <div className="h-20 w-px bg-white/20"></div>
                <div>
                  <h3 className="text-[12px] font-black uppercase tracking-[0.8em] text-white mb-4">Telemetric Shutdown</h3>
                  <p className="text-[9px] font-bold text-gray-600 uppercase tracking-widest">Operation complete. Core stable.</p>
                </div>
                
                <div className="grid grid-cols-2 gap-px bg-white/5 border border-white/5 w-full">
                  <div className="bg-[#050505] p-8">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-gray-700 mb-2">Final WPM</span>
                    <span className="text-4xl font-black text-white">{wpm}</span>
                  </div>
                  <div className="bg-[#050505] p-8">
                    <span className="block text-[8px] font-black uppercase tracking-widest text-gray-700 mb-2">Accuracy</span>
                    <span className="text-4xl font-black text-white">{accuracy}%</span>
                  </div>
                </div>

                <button 
                  onClick={() => {
                    initTest();
                    onNotify?.("SEQUENCE RE-INITIATED", "info");
                  }}
                  className="w-full py-6 bg-white text-black text-[10px] font-black uppercase tracking-[0.4em] hover:bg-gray-200 transition-all flex items-center justify-center gap-3"
                >
                  <RefreshCw size={14} />
                  Re-Initiate Loop
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Telemetry Sidebar */}
        <div className="bg-[#050505] border border-white/5 p-12 flex flex-col gap-1 overflow-hidden">
          <div className="space-y-12">
            <h3 className="text-[10px] font-black uppercase tracking-[0.5em] text-white/40">Live Feed</h3>
            
            <div className="space-y-8">
              {/* WPM Gauge */}
              <div className="p-8 bg-white/[0.02] border border-white/5 flex flex-col items-center gap-4 group transition-all hover:bg-white/[0.04]">
                <span className="text-5xl font-black tracking-tighter text-white">{wpm}</span>
                <div className="flex items-center gap-2">
                  <Activity size={10} className="text-gray-700" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-700">WPM Velocity</span>
                </div>
              </div>

              {/* Accuracy Gauge */}
              <div className="p-8 bg-white/[0.02] border border-white/5 flex flex-col items-center gap-4 group transition-all hover:bg-white/[0.04]">
                <span className={`text-5xl font-black tracking-tighter transition-colors ${accuracy < 90 ? 'text-red-500' : 'text-white'}`}>
                  {accuracy}<span className="text-xs ml-1">%</span>
                </span>
                <div className="flex items-center gap-2">
                  <Target size={10} className="text-gray-700" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-700">Bit Precision</span>
                </div>
              </div>

              {/* Timer Gauge */}
              <div className="p-8 bg-white/[0.02] border border-white/5 flex flex-col items-center gap-4 group transition-all hover:bg-white/[0.04]">
                <span className="text-5xl font-black tracking-tighter text-white">
                  {selectedDuration === 'infinite' ? (
                    <InfinityIcon size={32} strokeWidth={3} className="text-white" />
                  ) : (
                    <>
                      {timeLeft}<span className="text-xs ml-1 font-mono tracking-normal">S</span>
                    </>
                  )}
                </span>
                <div className="flex items-center gap-2">
                  <Timer size={10} className="text-gray-700" />
                  <span className="text-[8px] font-black uppercase tracking-[0.4em] text-gray-700">
                    {selectedDuration === 'infinite' ? 'Runtime' : 'Buffer TTL'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-auto pt-12 space-y-6">
            <div className="flex items-center gap-3">
              <ChevronRight size={14} className="text-white/20" />
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-700">Keystroke Log</span>
            </div>
            <div className="h-24 overflow-hidden relative">
              <div className="absolute inset-0 flex flex-col gap-2 font-mono text-[8px] text-gray-800 uppercase leading-none">
                <div>[SIGNAL] CAPTURING RAW_INPUT_STREAM...</div>
                <div>[MODE] {selectedDuration.toString().toUpperCase()} SEQUENCE</div>
                <div className="text-blue-500/40">[BUFFER] STATUS: {isFinished ? 'STABLE' : 'FLOWING'}</div>
                <div>[ENGINE] {userInput.length}/{targetText.length} CH_PROC</div>
                <div className="animate-pulse">_</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <p className="text-center text-[9px] font-black uppercase tracking-[0.6em] text-gray-800 mt-6">
        LE Precision Keystroke Architecture v2.2 — Adaptive Duration Sync.
      </p>
    </div>
  );
};

export default TypingTest;

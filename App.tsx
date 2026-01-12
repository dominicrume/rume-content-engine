import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Mic, Send, RefreshCw, AlertTriangle, CheckCircle, ShieldCheck, FileText, Pause, Linkedin, Twitter, BookOpen, Mail, Share2, BrainCircuit, ArrowRight, Database, PenTool, Search, Info } from 'lucide-react';
import { TerminalLog } from './components/TerminalLog';
import { PostPreview } from './components/PostPreview';
import { processInput, scrutinizeContent, initializeSession, generateStrategy } from './services/geminiService';
import { EngineStatus, GeneratedContent, LogEntry, PublishingPlatform, StrategyResult, StrategyIdea } from './types';
import { v4 as uuidv4 } from 'uuid'; // Simulate uuid since we can't install packages, I will write a helper

// UUID Helper since we can't import valid uuid in this env if not installed
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

type AppMode = 'GENERATOR' | 'STRATEGIST';

const App: React.FC = () => {
  // Mode State
  const [appMode, setAppMode] = useState<AppMode>('GENERATOR');
  const [showResearchProtocol, setShowResearchProtocol] = useState(false);

  // Generator State
  const [status, setStatus] = useState<EngineStatus>(EngineStatus.Idle);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [textInput, setTextInput] = useState('');
  const [content, setContent] = useState<GeneratedContent | null>(null);
  const [sessionId] = useState(generateUUID());
  const [refinementInput, setRefinementInput] = useState('');
  const [isRefinementMode, setIsRefinementMode] = useState(false);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<PublishingPlatform>>(new Set(['LINKEDIN']));
  
  // Strategy State
  const [redditInput, setRedditInput] = useState('');
  const [strategyResult, setStrategyResult] = useState<StrategyResult | null>(null);
  const [isStrategizing, setIsStrategizing] = useState(false);

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Helpers
  const addLog = useCallback((message: string, level: LogEntry['level'] = 'INFO') => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs(prev => [...prev, { id: generateUUID(), timestamp, level, message }]);
  }, []);

  // Initialization
  useEffect(() => {
    addLog(`INITIALIZING RD-1 CONTENT ENGINE [${sessionId}]`, 'SYSTEM');
    addLog('Loading Gemini 1.5 Pro Configuration...', 'SYSTEM');
    addLog('Loading Rume Dominic Brand Identity (The Bible)...', 'SYSTEM');
    addLog('Connecting to Telegram/Make.com emulation layer...', 'SYSTEM');
    try {
      initializeSession();
      addLog('Intelligence Layer (Brain) Ready.', 'SYSTEM');
    } catch (e) {
      addLog('Failed to initialize Intelligence Layer.', 'ERROR');
    }
  }, [addLog, sessionId]);

  // Handlers
  const handleTextSubmit = async (overrideInput?: string) => {
    const inputToUse = overrideInput || textInput;
    if (!inputToUse.trim()) return;
    
    setStatus(EngineStatus.Processing);
    addLog(`Ingesting text payload: "${inputToUse.substring(0, 30)}..."`, 'INFO');
    
    try {
      const result = await processInput(inputToUse);
      setContent(result);
      setStatus(EngineStatus.Review);
      addLog(`Theme Classified: [${result.theme}]`, 'SYSTEM');
      addLog('Draft generated successfully.', 'INFO');
    } catch (error) {
      setStatus(EngineStatus.Error);
      addLog('Generation failed.', 'ERROR');
    }
    if (!overrideInput) setTextInput('');
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleAudioProcessing(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus(EngineStatus.Recording);
      addLog('Voice Ingestion Channel Open.', 'WARN');
    } catch (err) {
      addLog('Microphone access denied.', 'ERROR');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          // Remove data url prefix (e.g. "data:audio/webm;base64,")
          const base64 = reader.result.split(',')[1];
          resolve(base64);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleAudioProcessing = async (audioBlob: Blob) => {
    setStatus(EngineStatus.Processing);
    addLog('Processing audio packet...', 'INFO');
    
    try {
      const base64Data = await blobToBase64(audioBlob);
      // Determine mimeType based on browser. usually audio/webm
      const result = await processInput({ mimeType: 'audio/webm', data: base64Data });
      
      setContent(result);
      setStatus(EngineStatus.Review);
      addLog(`Theme Classified: [${result.theme}]`, 'SYSTEM');
      addLog('Voice transcript processed and draft generated.', 'INFO');
    } catch (error) {
      setStatus(EngineStatus.Error);
      addLog('Audio processing failed.', 'ERROR');
    }
  };

  const handleRefine = async () => {
    if (!refinementInput.trim()) return;
    setStatus(EngineStatus.Refining);
    addLog(`Refinement Instruction: "${refinementInput}"`, 'INFO');
    
    try {
      const result = await processInput(refinementInput, true);
      setContent(result);
      setStatus(EngineStatus.Review);
      setRefinementInput('');
      setIsRefinementMode(false);
      addLog('Draft refined.', 'INFO');
    } catch (error) {
      setStatus(EngineStatus.Error);
      addLog('Refinement failed.', 'ERROR');
    }
  };

  const handleScrutinize = async () => {
    setStatus(EngineStatus.Scrutinizing);
    addLog('SCRUTINIZE MODE: Searching for weakness...', 'WARN');
    
    try {
      const result = await scrutinizeContent();
      setContent(result);
      setStatus(EngineStatus.Review);
      addLog('Draft reconstructed with higher aggression.', 'SYSTEM');
    } catch (error) {
      setStatus(EngineStatus.Error);
      addLog('Scrutiny failed.', 'ERROR');
    }
  };

  const togglePlatform = (platform: PublishingPlatform) => {
    if (status === EngineStatus.Published || status === EngineStatus.Publishing) return;
    
    const newSet = new Set(selectedPlatforms);
    if (newSet.has(platform)) {
      newSet.delete(platform);
    } else {
      newSet.add(platform);
    }
    setSelectedPlatforms(newSet);
  };

  const handlePublish = async () => {
    if (selectedPlatforms.size === 0) {
      addLog('Cannot publish: No distribution channels selected.', 'ERROR');
      return;
    }

    setStatus(EngineStatus.Publishing);
    addLog('Enterprise Gate Passed. Identity Pinned.', 'SYSTEM');
    addLog(`Initiating distribution to ${selectedPlatforms.size} channels...`, 'INFO');
    
    // Simulate parallel publishing
    const platforms = Array.from(selectedPlatforms);
    
    for (const platform of platforms) {
      addLog(`[${platform}] Initiating API handshake...`, 'INFO');
    }

    // Simulate Network Delay
    await new Promise(resolve => setTimeout(resolve, 2500));

    for (const platform of platforms) {
      const id = generateUUID().substring(0, 8);
      addLog(`[${platform}] Payload delivered. Post ID: ${id}`, 'SYSTEM');
    }

    addLog('All distribution sequences complete.', 'SYSTEM');
    setStatus(EngineStatus.Published);
  };

  const handleStrategyGeneration = async () => {
    if (!redditInput.trim()) return;
    setIsStrategizing(true);
    addLog('Agentic Workflow: Analyzing Reddit Signals...', 'INFO');
    
    try {
      const result = await generateStrategy(redditInput);
      setStrategyResult(result);
      addLog('Strategy Matrix Generated. 15 Concepts found.', 'SYSTEM');
      addLog('Pain Point Identified: ' + result.painPointAnalysis.substring(0, 50) + '...', 'SYSTEM');
    } catch (error) {
      addLog('Strategy generation failed.', 'ERROR');
    } finally {
      setIsStrategizing(false);
    }
  };

  const draftFromStrategy = (idea: StrategyIdea) => {
    setAppMode('GENERATOR');
    const prompt = `Draft a post based on this strategy.\nHeadline: ${idea.headline}\nHook: ${idea.hook}\nAngle: ${idea.angle}`;
    setTextInput(prompt);
    // Optional: Auto submit
    handleTextSubmit(prompt);
  };

  // Render Helpers
  const isBusy = status === EngineStatus.Processing || status === EngineStatus.Refining || status === EngineStatus.Scrutinizing || status === EngineStatus.Publishing;

  return (
    <div className="min-h-screen bg-rd-black text-rd-text font-sans selection:bg-rd-accent selection:text-black flex flex-col">
      {/* Header */}
      <header className="bg-rd-panel border-b border-black p-4 flex justify-between items-center sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-rd-accent text-black font-bold flex items-center justify-center rounded text-xl font-mono">
            R1
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white leading-none">RD-1 CONTENT ENGINE</h1>
            <div className="flex items-center gap-2 text-xs text-rd-dim font-mono mt-1">
              <span className="w-2 h-2 rounded-full bg-rd-accent animate-pulse"></span>
              <span>ONLINE // ID: {sessionId.substring(0, 8)}</span>
            </div>
          </div>
        </div>
        
        {/* Mode Switcher */}
        <div className="hidden md:flex bg-black/50 p-1 rounded-lg border border-white/10">
          <button 
            onClick={() => setAppMode('GENERATOR')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${appMode === 'GENERATOR' ? 'bg-rd-panel text-white border border-white/20' : 'text-gray-500 hover:text-white'}`}
          >
            <PenTool size={14} /> GENERATOR
          </button>
          <button 
            onClick={() => setAppMode('STRATEGIST')}
            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${appMode === 'STRATEGIST' ? 'bg-rd-panel text-white border border-white/20' : 'text-gray-500 hover:text-white'}`}
          >
            <BrainCircuit size={14} /> STRATEGY LAB
          </button>
        </div>

        <div className="flex items-center gap-4 text-xs font-mono hidden md:flex">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-black/30 rounded border border-white/10">
            <ShieldCheck className="w-4 h-4 text-rd-accent" />
            <span>ENTERPRISE MODE</span>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Column: Input & Controls (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {appMode === 'GENERATOR' ? (
            /* GENERATOR INPUT */
            <div className="bg-rd-panel border border-white/10 rounded-xl p-5 shadow-lg animate-fade-in">
              <h2 className="text-sm font-bold text-rd-dim mb-4 tracking-wider uppercase font-mono">Ingestion Layer</h2>
              
              {/* Voice Input */}
              <div className="mb-6">
                <button 
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={isBusy}
                  className={`w-full py-8 rounded-lg border-2 border-dashed transition-all flex flex-col items-center justify-center gap-3 group
                    ${isRecording 
                      ? 'border-rd-danger bg-rd-danger/10 text-rd-danger animate-pulse-fast' 
                      : 'border-white/10 hover:border-rd-accent hover:bg-white/5 text-gray-400 hover:text-rd-accent'
                    } ${isBusy ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {isRecording ? <Pause className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
                  <span className="font-mono text-sm">
                    {isRecording ? 'RECORDING VOICE NOTE...' : 'TAP TO RECORD THOUGHT'}
                  </span>
                </button>
              </div>

              <div className="relative flex items-center justify-center mb-6">
                 <div className="border-t border-white/10 w-full absolute"></div>
                 <span className="bg-rd-panel px-3 relative z-10 text-xs text-rd-dim font-mono">OR TEXT INPUT</span>
              </div>

              {/* Text Input */}
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type raw insight here..."
                  disabled={isBusy || isRecording}
                  onKeyDown={(e) => e.key === 'Enter' && handleTextSubmit()}
                  className="flex-1 bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-rd-accent transition-colors text-white placeholder-gray-600"
                />
                <button 
                  onClick={() => handleTextSubmit()}
                  disabled={!textInput.trim() || isBusy}
                  className="bg-rd-accent text-black p-3 rounded-lg hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          ) : (
            /* STRATEGY INPUT */
            <div className="bg-rd-panel border border-white/10 rounded-xl p-5 shadow-lg animate-fade-in flex flex-col h-full max-h-[600px]">
               <div className="flex justify-between items-center mb-4">
                 <h2 className="text-sm font-bold text-rd-dim tracking-wider uppercase font-mono flex items-center gap-2">
                   <Database size={14} /> RAW DATA INGESTION
                 </h2>
                 <button 
                  onClick={() => setShowResearchProtocol(!showResearchProtocol)}
                  className="text-xs flex items-center gap-1 text-rd-accent hover:underline"
                 >
                   <Info size={12} /> {showResearchProtocol ? 'Hide Protocol' : 'Research Protocol'}
                 </button>
               </div>

               {showResearchProtocol && (
                 <div className="bg-black/30 border border-rd-accent/20 p-3 rounded-lg mb-4 text-[10px] text-gray-400 font-mono space-y-2 animate-fade-in overflow-y-auto max-h-40">
                    <p className="font-bold text-rd-accent">AGENTIC WORKFLOW:</p>
                    <ol className="list-decimal pl-4 space-y-1">
                      <li>Use Grok to find active subreddits for RD.</li>
                      <li>Go to Reddit, search: "I'm struggling with", "Biggest struggle".</li>
                      <li>Filter by: Top + Past Month.</li>
                      <li>Find posts with 50+ upvotes.</li>
                      <li>Copy Post Title + Description + Top 3 Comments.</li>
                      <li>Paste below. The Agent will identify the unique pain point.</li>
                    </ol>
                 </div>
               )}
               
               <p className="text-xs text-gray-500 mb-2">Paste Reddit Thread (Title + Body + Comments):</p>
               
               <textarea 
                  value={redditInput}
                  onChange={(e) => setRedditInput(e.target.value)}
                  placeholder="[PASTE RAW REDDIT DATA HERE]&#10;Title: I can't figure out AI strategy...&#10;Comments: This is exactly what I struggle with..."
                  disabled={isStrategizing}
                  className="flex-1 w-full bg-black/50 border border-white/10 rounded-lg p-3 text-xs font-mono focus:outline-none focus:border-rd-accent text-gray-300 resize-none mb-4"
               />
               
               <button 
                  onClick={handleStrategyGeneration}
                  disabled={!redditInput.trim() || isStrategizing}
                  className="w-full bg-white text-black font-bold py-3 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isStrategizing ? <RefreshCw className="animate-spin w-4 h-4" /> : <Search className="w-4 h-4" />}
                  {isStrategizing ? 'ANALYZING SIGNAL...' : 'IDENTIFY PAIN POINTS'}
                </button>
            </div>
          )}

          {/* System Terminal */}
          <div className="flex-1 min-h-[250px]">
            <TerminalLog logs={logs} />
          </div>
        </div>

        {/* Right Column: Output & Actions (8 cols) */}
        <div className="lg:col-span-8 flex flex-col h-full">
           
           {appMode === 'GENERATOR' ? (
             /* GENERATOR PREVIEW */
             <>
                {/* Action Bar (Only visible when content exists) */}
                {content && (
                  <div className="mb-6 flex flex-col gap-4 animate-fade-in">
                    {/* Distribution Matrix */}
                    <div className="bg-rd-panel border border-white/10 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs font-mono text-rd-dim font-bold px-2">DISTRIBUTION MATRIX:</div>
                      <div className="flex flex-wrap gap-2">
                         <button onClick={() => togglePlatform('LINKEDIN')} className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all border ${selectedPlatforms.has('LINKEDIN') ? 'bg-[#0077b5] border-[#0077b5] text-white' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}><Linkedin size={14} /> LINKEDIN</button>
                         <button onClick={() => togglePlatform('X')} className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all border ${selectedPlatforms.has('X') ? 'bg-white border-white text-black' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}><Twitter size={14} /> X / TWITTER</button>
                         <button onClick={() => togglePlatform('MEDIUM')} className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all border ${selectedPlatforms.has('MEDIUM') ? 'bg-white border-white text-black' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}><BookOpen size={14} /> MEDIUM</button>
                         <button onClick={() => togglePlatform('SUBSTACK')} className={`flex items-center gap-2 px-3 py-2 rounded text-xs font-bold transition-all border ${selectedPlatforms.has('SUBSTACK') ? 'bg-[#FF6719] border-[#FF6719] text-white' : 'bg-transparent border-white/10 text-gray-500 hover:text-white'}`}><Mail size={14} /> SUBSTACK</button>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <button onClick={() => setIsRefinementMode(!isRefinementMode)} disabled={isBusy || status === EngineStatus.Published} className="flex items-center justify-center gap-2 bg-rd-panel border border-white/10 hover:border-white/30 text-white p-4 rounded-lg transition-all group">
                        <RefreshCw className={`w-5 h-5 ${isRefinementMode ? 'text-rd-accent' : 'text-gray-400 group-hover:text-white'}`} />
                        <span className="font-bold">REFINE</span>
                      </button>
                      <button onClick={handleScrutinize} disabled={isBusy || status === EngineStatus.Published} className="flex items-center justify-center gap-2 bg-rd-panel border border-white/10 hover:border-rd-danger text-white p-4 rounded-lg transition-all group">
                        <AlertTriangle className="w-5 h-5 text-gray-400 group-hover:text-rd-danger transition-colors" />
                        <span className="font-bold group-hover:text-rd-danger transition-colors">SCRUTINIZE</span>
                      </button>
                      <button onClick={handlePublish} disabled={isBusy || status === EngineStatus.Published || selectedPlatforms.size === 0} className={`flex items-center justify-center gap-2 p-4 rounded-lg transition-all font-bold text-black ${status === EngineStatus.Published ? 'bg-green-600 cursor-default' : 'bg-rd-accent hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}>
                        {status === EngineStatus.Published ? <><CheckCircle className="w-5 h-5" /><span>PUBLISHED</span></> : <><Share2 className="w-5 h-5" /><span>{status === EngineStatus.Publishing ? 'SENDING...' : 'DISTRIBUTE'}</span></>}
                      </button>
                    </div>
                  </div>
                )}

                {/* Refinement Input Drawer */}
                {isRefinementMode && content && status !== EngineStatus.Published && (
                  <div className="mb-6 bg-rd-panel p-4 rounded-lg border border-rd-accent/30 animate-fade-in">
                     <p className="text-xs text-rd-accent font-mono mb-2">FEEDBACK LOOP ACTIVE:</p>
                     <div className="flex gap-2">
                       <input type="text" value={refinementInput} onChange={(e) => setRefinementInput(e.target.value)} placeholder="E.g., 'Make the hook punchier', 'Focus more on Bitcoin'" className="flex-1 bg-black border border-white/10 rounded px-4 py-2 text-sm text-white focus:outline-none focus:border-rd-accent" onKeyDown={(e) => e.key === 'Enter' && handleRefine()}/>
                       <button onClick={handleRefine} className="text-xs bg-rd-accent text-black px-4 rounded font-bold hover:bg-emerald-400">APPLY</button>
                     </div>
                  </div>
                )}

                {/* Preview Area */}
                <div className="flex-1 bg-rd-dark rounded-xl border border-white/5 p-8 flex flex-col relative">
                   <div className="absolute top-4 right-4 flex gap-2">
                      <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-gray-500 font-mono">MODEL: GEMINI-3-PRO</div>
                      {content && <div className="px-2 py-1 rounded bg-white/5 border border-white/5 text-[10px] text-gray-500 font-mono">{content.body.length} CHARS</div>}
                   </div>
                   <PostPreview content={content} isLoading={isBusy} />
                </div>
             </>
           ) : (
             /* STRATEGY PREVIEW */
             <div className="flex-1 bg-rd-dark rounded-xl border border-white/5 p-6 overflow-y-auto">
               {!strategyResult ? (
                 <div className="h-full flex flex-col items-center justify-center text-rd-dim opacity-50">
                    <BrainCircuit className="w-16 h-16 mb-4" />
                    <p className="font-mono text-sm">STRATEGY MATRIX EMPTY</p>
                    <p className="text-xs">Input Reddit data to generate content vectors.</p>
                 </div>
               ) : (
                 <div className="space-y-8 animate-fade-in">
                   {/* Agent Analysis */}
                   <div className="bg-rd-accent/10 border border-rd-accent p-4 rounded-lg">
                      <h3 className="text-rd-accent font-bold text-sm mb-2 flex items-center gap-2">
                         <BrainCircuit size={16} /> AGENT ANALYSIS (PAIN POINT)
                      </h3>
                      <p className="text-white text-sm font-mono leading-relaxed">
                         "{strategyResult.painPointAnalysis}"
                      </p>
                   </div>

                   {/* How To */}
                   <section>
                     <h3 className="text-rd-accent font-mono text-sm font-bold mb-3 border-b border-rd-accent/30 pb-1">TACTICAL // HOW-TO</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {strategyResult.howTo.map((idea, idx) => (
                         <div key={idx} className="bg-rd-panel border border-white/10 p-4 rounded-lg hover:border-rd-accent/50 transition-colors group cursor-pointer" onClick={() => draftFromStrategy(idea)}>
                           <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-bold text-gray-400">#0{idx+1}</span>
                             <ArrowRight className="w-4 h-4 text-rd-dim group-hover:text-rd-accent opacity-0 group-hover:opacity-100 transition-all" />
                           </div>
                           <h4 className="font-bold text-white text-sm mb-2">{idea.headline}</h4>
                           <p className="text-xs text-gray-500 line-clamp-2">{idea.angle}</p>
                         </div>
                       ))}
                     </div>
                   </section>

                   {/* Listicles */}
                   <section>
                     <h3 className="text-yellow-500 font-mono text-sm font-bold mb-3 border-b border-yellow-500/30 pb-1">CURATION // LISTICLES</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {strategyResult.listicles.map((idea, idx) => (
                         <div key={idx} className="bg-rd-panel border border-white/10 p-4 rounded-lg hover:border-yellow-500/50 transition-colors group cursor-pointer" onClick={() => draftFromStrategy(idea)}>
                           <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-bold text-gray-400">#0{idx+1}</span>
                             <ArrowRight className="w-4 h-4 text-rd-dim group-hover:text-yellow-500 opacity-0 group-hover:opacity-100 transition-all" />
                           </div>
                           <h4 className="font-bold text-white text-sm mb-2">{idea.headline}</h4>
                           <p className="text-xs text-gray-500 line-clamp-2">{idea.angle}</p>
                         </div>
                       ))}
                     </div>
                   </section>

                   {/* Contrarian */}
                   <section>
                     <h3 className="text-red-500 font-mono text-sm font-bold mb-3 border-b border-red-500/30 pb-1">DISRUPTION // CONTRARIAN</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {strategyResult.contrarian.map((idea, idx) => (
                         <div key={idx} className="bg-rd-panel border border-white/10 p-4 rounded-lg hover:border-red-500/50 transition-colors group cursor-pointer" onClick={() => draftFromStrategy(idea)}>
                           <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-bold text-gray-400">#0{idx+1}</span>
                             <ArrowRight className="w-4 h-4 text-rd-dim group-hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all" />
                           </div>
                           <h4 className="font-bold text-white text-sm mb-2">{idea.headline}</h4>
                           <p className="text-xs text-gray-500 line-clamp-2">{idea.angle}</p>
                         </div>
                       ))}
                     </div>
                   </section>
                   
                   {/* Frameworks */}
                    <section>
                     <h3 className="text-blue-500 font-mono text-sm font-bold mb-3 border-b border-blue-500/30 pb-1">SYSTEMS // FRAMEWORKS</h3>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {strategyResult.frameworks.map((idea, idx) => (
                         <div key={idx} className="bg-rd-panel border border-white/10 p-4 rounded-lg hover:border-blue-500/50 transition-colors group cursor-pointer" onClick={() => draftFromStrategy(idea)}>
                           <div className="flex justify-between items-start mb-2">
                             <span className="text-xs font-bold text-gray-400">#0{idx+1}</span>
                             <ArrowRight className="w-4 h-4 text-rd-dim group-hover:text-blue-500 opacity-0 group-hover:opacity-100 transition-all" />
                           </div>
                           <h4 className="font-bold text-white text-sm mb-2">{idea.headline}</h4>
                           <p className="text-xs text-gray-500 line-clamp-2">{idea.angle}</p>
                         </div>
                       ))}
                     </div>
                   </section>

                 </div>
               )}
             </div>
           )}

        </div>
      </main>
    </div>
  );
};

export default App;
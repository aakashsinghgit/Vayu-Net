

import React, { useState, useMemo, useRef } from 'react';
import { Zone, AnalysisReport, UserRole, User } from '../types';
import { generateZoneAnalysis } from '../services/geminiService';
import { formatAnalysisTitle } from '../utils';
import { BrainCircuit, Loader2, AlertCircle, FileText, CheckCircle2, Lock, ChevronDown, ChevronUp, Download, Play, Filter, User as UserIcon, Upload, Image as ImageIcon, X, Camera, Zap, Mic, Square, Volume2, Globe, Radio } from 'lucide-react';

interface AnalysisViewProps {
  zone: Zone;
  analyses: AnalysisReport[];
  onNewAnalysis: (analysis: AnalysisReport) => void;
  userRole: UserRole;
  currentUser: User | null;
  onNavigateToIntervention: (analysisId: string) => void;
  onRequestLogin: () => void;
}

const AnalysisView: React.FC<AnalysisViewProps> = ({ 
  zone, 
  analyses, 
  onNewAnalysis, 
  userRole, 
  currentUser,
  onNavigateToIntervention,
  onRequestLogin
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // New Analysis Creator State
  const [showCreator, setShowCreator] = useState(false);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Audio State
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioPreviewUrl, setAudioPreviewUrl] = useState<string | null>(null);
  const [audioSourceType, setAudioSourceType] = useState<string>('');

  // Filters State
  const [filterYear, setFilterYear] = useState<string>('all');
  const [filterMonth, setFilterMonth] = useState<string>('all');

  const canRunAnalysis = userRole === 'SCIENTIST';
  const canViewDetails = userRole === 'CITIZEN' || userRole === 'SCIENTIST';

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // --- AUDIO LOGIC (SYNTHETIC DRONE FEED) ---
  const generateSyntheticAudio = async (type: 'construction' | 'traffic') => {
    try {
        setIsGeneratingAudio(true);
        setAudioSourceType(type);

        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const dest = ctx.createMediaStreamDestination();
        const duration = 3000; // 3 seconds of audio data

        if (type === 'construction') {
            // Simulating Jackhammer: Pulse Oscillator + Noise
            const osc = ctx.createOscillator();
            osc.type = 'square';
            osc.frequency.setValueAtTime(15, ctx.currentTime); // Low freq thud
            
            const gain = ctx.createGain();
            // Envelope for rhythmic bursting
            const lfo = ctx.createOscillator();
            lfo.type = 'square';
            lfo.frequency.setValueAtTime(4, ctx.currentTime); // 4 hits per second
            
            const lfoGain = ctx.createGain();
            lfoGain.gain.value = 1000;

            lfo.connect(lfoGain);
            osc.connect(gain);
            gain.connect(dest);
            
            osc.start();
            lfo.start();
            
            // Stop after duration
            setTimeout(() => { osc.stop(); lfo.stop(); }, duration);
        } else {
            // Simulating Traffic: Filtered Brown Noise (Low Rumble)
            const bufferSize = ctx.sampleRate * 3; // 3 sec
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);
            let lastOut = 0;
            for (let i = 0; i < bufferSize; i++) {
                const white = Math.random() * 2 - 1;
                // Simple Low Pass Filter for "Rumble"
                lastOut = (lastOut + (0.02 * white)) / 1.02;
                data[i] = lastOut * 3.5; 
            }
            const noiseSrc = ctx.createBufferSource();
            noiseSrc.buffer = buffer;
            noiseSrc.connect(dest);
            noiseSrc.start();
        }

        // Record the synthesized stream
        const mediaRecorder = new MediaRecorder(dest.stream);
        const chunks: BlobPart[] = [];
        
        mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
        mediaRecorder.onstop = () => {
            const blob = new Blob(chunks, { type: 'audio/webm' });
            setAudioBlob(blob);
            setAudioPreviewUrl(URL.createObjectURL(blob));
            setIsGeneratingAudio(false);
            ctx.close();
        };

        mediaRecorder.start();
        setTimeout(() => mediaRecorder.stop(), duration);

    } catch (err) {
        console.error("Audio Gen Error:", err);
        setError("Could not generate simulation. Browser audio context restricted.");
        setIsGeneratingAudio(false);
    }
  };

  const handleRemoveAudio = () => {
    setAudioBlob(null);
    if (audioPreviewUrl) URL.revokeObjectURL(audioPreviewUrl);
    setAudioPreviewUrl(null);
    setAudioSourceType('');
  };

  // Helper to generate sample images on the fly
  const generateSampleImage = async (type: 'construction' | 'traffic') => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw Background
    const gradient = ctx.createLinearGradient(0, 0, 0, 300);
    if (type === 'construction') {
        gradient.addColorStop(0, '#e0e7ff'); // Sky
        gradient.addColorStop(1, '#92400e'); // Brown Earth
    } else {
        gradient.addColorStop(0, '#94a3b8'); // Gray Sky
        gradient.addColorStop(1, '#334155'); // Dark Road
    }
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 300);

    // Draw Elements
    if (type === 'construction') {
        // Dust Cloud
        ctx.fillStyle = 'rgba(180, 83, 9, 0.4)';
        ctx.beginPath();
        ctx.arc(200, 200, 80, 0, Math.PI * 2);
        ctx.fill();
        // Structure
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(50, 150, 40, 150);
        ctx.fillRect(300, 180, 60, 120);
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '20px sans-serif';
        ctx.fillText('Construction Site Feed', 20, 40);
    } else {
        // Smog
        ctx.fillStyle = 'rgba(100, 116, 139, 0.5)';
        ctx.beginPath();
        ctx.arc(200, 150, 120, 0, Math.PI * 2);
        ctx.fill();
        // Cars (Lights)
        ctx.fillStyle = '#ef4444'; // Brake lights
        ctx.beginPath();
        ctx.arc(100, 250, 5, 0, Math.PI * 2);
        ctx.arc(120, 250, 5, 0, Math.PI * 2);
        ctx.fill();
        // Label
        ctx.fillStyle = '#fff';
        ctx.font = '20px sans-serif';
        ctx.fillText('Traffic Camera Feed', 20, 40);
    }

    // Convert to File
    canvas.toBlob((blob) => {
        if (blob) {
            const file = new File([blob], `${type}_sample.png`, { type: 'image/png' });
            setSelectedImage(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    });
  };

  const handleRunAnalysis = async () => {
    if (!canRunAnalysis) return;
    setLoading(true);
    setError(null);
    try {
      // Pass the selected image (if any) and audio to the service
      const result = await generateZoneAnalysis(zone, selectedImage || undefined, audioBlob || undefined);
      
      const newReport: AnalysisReport = {
        id: `an-${Date.now()}`,
        zoneId: zone.id,
        timestamp: new Date().toISOString(),
        generatedBy: currentUser?.name || 'Unknown Scientist',
        attachedImage: previewUrl || undefined, // Store the preview URL as the attached image for this session
        attachedAudio: audioPreviewUrl || undefined,
        ...result
      };
      
      onNewAnalysis(newReport);
      setExpandedId(newReport.id); // Auto expand new report
      setShowCreator(false); // Close creator
      // Reset form
      handleRemoveImage(); 
      handleRemoveAudio();
    } catch (err) {
      setError("Failed to generate analysis. Please check your connection or API key.");
    } finally {
      setLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    if (!canViewDetails) {
      onRequestLogin();
      return;
    }
    setExpandedId(expandedId === id ? null : id);
  };

  // Filter Logic
  const filteredAnalyses = useMemo(() => {
    return analyses.filter(report => {
      if (report.zoneId !== zone.id) return false;

      const date = new Date(report.timestamp);
      const year = date.getFullYear().toString();
      const month = date.toLocaleString('default', { month: 'long' });

      if (filterYear !== 'all' && year !== filterYear) return false;
      if (filterMonth !== 'all' && month !== filterMonth) return false;

      return true;
    }).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [analyses, zone.id, filterYear, filterMonth]);

  const uniqueYears = Array.from(new Set(analyses.map(a => new Date(a.timestamp).getFullYear().toString())));
  const uniqueMonths = Array.from(new Set(analyses.map(a => new Date(a.timestamp).toLocaleString('default', { month: 'long' }))));

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Causal Analysis Reports</h2>
            <p className="text-slate-500 dark:text-slate-400">Tri-Modal Diagnosis (Sensors + Vision + Audio) powered by Gemini 3.</p>
        </div>
        
        {!showCreator && (
            canRunAnalysis ? (
                <button
                    onClick={() => setShowCreator(true)}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-5 py-2.5 rounded-xl font-medium transition-all shadow-lg shadow-violet-200 dark:shadow-violet-900/50"
                >
                    <BrainCircuit size={18} />
                    New Forensic Diagnosis
                </button>
            ) : (
                <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg flex items-center gap-2 text-sm font-medium border border-slate-200 dark:border-slate-700">
                    <Lock size={16} />
                    Scientific Generation Locked
                </div>
            )
        )}
      </div>

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl border border-red-200 dark:border-red-900/50 flex items-center gap-2">
            <AlertCircle size={20} />
            {error}
        </div>
      )}

      {/* NEW ANALYSIS CREATOR PANEL */}
      {showCreator && (
        <div className="bg-gradient-to-br from-violet-50 to-white dark:from-violet-950 dark:to-slate-900 rounded-2xl border border-violet-100 dark:border-violet-900/50 p-6 animate-in slide-in-from-top-4 duration-300 ring-4 ring-violet-50/50 dark:ring-violet-900/30">
             <div className="flex justify-between items-start mb-6">
                 <div>
                    <div className="flex items-center gap-2 text-violet-900 dark:text-violet-200 font-bold text-lg mb-1">
                        <Zap size={24} className="text-violet-600 dark:text-violet-400" fill="currentColor" />
                        <h3>Tri-Modal Forensic Monitor</h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Gemini 3 Pro will cross-reference Audio, Visuals, and Sensors with live Web Grounding.</p>
                 </div>
                 <button onClick={() => setShowCreator(false)} disabled={loading} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <X size={20} />
                 </button>
             </div>

             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                 
                 {/* 1. SENSOR DATA (Read Only) */}
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-3 opacity-5 dark:opacity-10 dark:text-white">
                        <FileText size={80} />
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">1</div>
                        <h4 className="font-bold text-slate-700 dark:text-slate-200">Sensor Stream</h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">AQI Level</span>
                            <div className="text-3xl font-bold text-slate-800 dark:text-slate-100">{zone.currentAqi}</div>
                        </div>
                        <div>
                            <span className="text-slate-500 dark:text-slate-400 text-xs uppercase font-bold">Primary</span>
                            <div className="text-lg font-bold text-slate-800 dark:text-slate-100 mt-1">{zone.metrics.pm25 > zone.metrics.pm10 ? 'PM 2.5' : 'PM 10'}</div>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex gap-2">
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">NO2: {zone.metrics.no2}</span>
                            <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-1 rounded">O3: {zone.metrics.o3}</span>
                        </div>
                    </div>
                 </div>

                 {/* 2. VISUAL INPUT */}
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">2</div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Visual Feed</h4>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Optional</span>
                    </div>
                    
                    {previewUrl ? (
                        <div className="relative flex-1 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 group min-h-[140px]">
                            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                            <button 
                                onClick={handleRemoveImage}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex-1 flex flex-col gap-3">
                            <div 
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-violet-400 dark:hover:border-violet-600 hover:bg-violet-50/30 dark:hover:bg-violet-900/20 transition-all p-4 min-h-[120px]"
                            >
                                <ImageIcon className="text-slate-300 dark:text-slate-600 mb-2" size={24} />
                                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Upload Site Photo</span>
                            </div>
                            <div className="flex gap-2">
                                <button onClick={() => generateSampleImage('construction')} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                    Sim: Dust
                                </button>
                                <button onClick={() => generateSampleImage('traffic')} className="flex-1 py-1.5 bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-300 rounded hover:bg-slate-200 dark:hover:bg-slate-700">
                                    Sim: Smog
                                </button>
                            </div>
                        </div>
                    )}
                    <input type="file" ref={fileInputRef} onChange={handleImageSelect} className="hidden" accept="image/*" />
                 </div>

                 {/* 3. AUDIO INPUT (REMOTE SIMULATION) */}
                 <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">3</div>
                            <h4 className="font-bold text-slate-700 dark:text-slate-200">Site Audio</h4>
                        </div>
                        <span className="text-[10px] uppercase font-bold text-slate-400">Remote Feed</span>
                    </div>

                    <div className="flex-1 flex flex-col justify-center items-center p-4 border border-slate-100 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-slate-800/50 text-center">
                        {audioPreviewUrl ? (
                             <div className="w-full">
                                <div className="flex items-center justify-center gap-2 mb-3 text-orange-600 dark:text-orange-400 font-medium">
                                    <Radio size={20} className="animate-pulse" /> 
                                    <span className="text-sm">Drone Audio Captured</span>
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2 font-mono uppercase bg-white dark:bg-slate-900 px-2 py-1 rounded border border-slate-100 dark:border-slate-700 inline-block">
                                    Type: {audioSourceType}
                                </div>
                                <audio src={audioPreviewUrl} controls className="w-full h-8 mb-3" />
                                <button 
                                    onClick={handleRemoveAudio}
                                    className="text-xs text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 underline"
                                >
                                    Disconnect Feed
                                </button>
                             </div>
                        ) : isGeneratingAudio ? (
                            <div className="flex flex-col items-center">
                                <Loader2 size={32} className="text-orange-500 animate-spin mb-3" />
                                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Syncing Stream...</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center w-full">
                                <p className="text-xs text-slate-400 mb-3">Connect to simulated remote sensors:</p>
                                <div className="grid grid-cols-1 gap-2 w-full">
                                    <button 
                                        onClick={() => generateSyntheticAudio('construction')}
                                        className="py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Radio size={14} /> Connect: Construction
                                    </button>
                                    <button 
                                        onClick={() => generateSyntheticAudio('traffic')}
                                        className="py-2.5 px-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2"
                                    >
                                        <Radio size={14} /> Connect: Traffic Flow
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                 </div>

             </div>

             <div className="flex justify-end">
                 <button
                    onClick={handleRunAnalysis}
                    disabled={loading}
                    className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-violet-200 dark:shadow-violet-900/50"
                 >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Zap size={20} fill="currentColor" />}
                    {loading ? 'Consulting Gemini 3 Pro...' : 'Run Tri-Modal Analysis'}
                 </button>
             </div>
        </div>
      )}

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm font-medium mr-2">
            <Filter size={16} />
            Filters:
        </div>
        
        <select 
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-violet-500"
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
        >
            <option value="all">All Years</option>
            {uniqueYears.map(y => <option key={y} value={y}>{y}</option>)}
        </select>

        <select 
            className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-violet-500"
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
        >
            <option value="all">All Months</option>
            {uniqueMonths.map(m => <option key={m} value={m}>{m}</option>)}
        </select>

        <div className="flex-1 text-right text-xs text-slate-400">
            Showing {filteredAnalyses.length} report(s)
        </div>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredAnalyses.length > 0 ? (
            filteredAnalyses.map((report) => (
                <div 
                    key={report.id} 
                    className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden ${expandedId === report.id ? 'border-violet-200 dark:border-violet-700 shadow-md ring-1 ring-violet-100 dark:ring-violet-900/30' : 'border-slate-200 dark:border-slate-800 shadow-sm hover:border-violet-300 dark:hover:border-violet-700'}`}
                >
                    {/* Card Header (Always Visible) */}
                    <div 
                        className="p-5 cursor-pointer flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                        onClick={() => toggleExpand(report.id)}
                    >
                        <div className="flex items-start gap-4 flex-1">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${expandedId === report.id ? 'bg-violet-100 dark:bg-violet-900/40 text-violet-600 dark:text-violet-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'}`}>
                                <FileText size={24} />
                            </div>
                            <div>
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                    <h3 className="font-bold text-slate-800 dark:text-slate-200 text-lg font-mono tracking-tight">
                                        {formatAnalysisTitle(report)}
                                    </h3>
                                    {userRole === 'SCIENTIST' && report.generatedBy && (
                                        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-[10px] text-slate-500 dark:text-slate-400 font-medium border border-slate-200 dark:border-slate-700 w-fit">
                                            <UserIcon size={10} />
                                            <span>{report.generatedBy}</span>
                                        </div>
                                    )}
                                    {/* Indicators for Modalities Used */}
                                    <div className="flex gap-1">
                                        {report.attachedImage && (
                                            <div className="flex items-center gap-1 bg-purple-50 dark:bg-purple-900/30 px-2 py-0.5 rounded text-[10px] text-purple-600 dark:text-purple-300 font-bold border border-purple-100 dark:border-purple-800" title="Image Analyzed">
                                                <ImageIcon size={10} />
                                                <span>IMG</span>
                                            </div>
                                        )}
                                        {report.attachedAudio && (
                                            <div className="flex items-center gap-1 bg-orange-50 dark:bg-orange-900/30 px-2 py-0.5 rounded text-[10px] text-orange-600 dark:text-orange-300 font-bold border border-orange-100 dark:border-orange-800" title="Audio Analyzed">
                                                <Mic size={10} />
                                                <span>AUDIO</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400">
                                        {new Date(report.timestamp).toLocaleDateString()}
                                    </span>
                                    <span className="text-slate-300 dark:text-slate-600">•</span>
                                    <p className={`text-sm text-slate-600 dark:text-slate-400 line-clamp-1 ${!canViewDetails && 'blur-[2px] select-none opacity-50'}`}>
                                        {canViewDetails ? report.summary : 'Login to view the executive summary of this analysis report.'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 self-end md:self-auto">
                            {!canViewDetails && (
                                <span className="flex items-center gap-1 text-xs font-bold text-violet-600 dark:text-violet-300 bg-violet-50 dark:bg-violet-900/20 px-3 py-1.5 rounded-lg">
                                    <Lock size={12} /> Login to View
                                </span>
                            )}
                            {expandedId === report.id ? <ChevronUp size={20} className="text-slate-400" /> : <ChevronDown size={20} className="text-slate-400" />}
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedId === report.id && canViewDetails && (
                        <div className="border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 p-6 md:p-8 space-y-6 animate-in slide-in-from-top-2 duration-300">
                            
                            {/* Actions Toolbar */}
                            <div className="flex flex-wrap gap-3 justify-end border-b border-slate-200 dark:border-slate-800 pb-6">
                                {userRole === 'CITIZEN' && (
                                    <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
                                        <Download size={16} /> Download PDF
                                    </button>
                                )}
                                {userRole === 'SCIENTIST' && (
                                    <button 
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onNavigateToIntervention(report.id);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors shadow-sm"
                                    >
                                        <Play size={16} fill="currentColor" /> Run Intervention
                                    </button>
                                )}
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Executive Summary</h4>
                                        <p className="text-slate-800 dark:text-slate-200 leading-relaxed font-medium">
                                            {report.summary}
                                        </p>
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Root Causes (Tri-Modal Analysis)</h4>
                                        <div className="grid gap-3">
                                            {report.causes.map((cause, idx) => (
                                                <div key={idx} className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-slate-200 dark:border-slate-800 shadow-sm">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <span className="font-bold text-slate-700 dark:text-slate-200">{cause.factor}</span>
                                                        <span className={`text-xs font-bold px-2 py-1 rounded ${cause.confidence > 75 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'}`}>
                                                            {cause.confidence}% Confidence
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 dark:text-slate-400">
                                                        {cause.reasoning}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="bg-green-50 dark:bg-green-900/10 rounded-xl p-5 border border-green-100 dark:border-green-900/30 flex gap-3">
                                        <CheckCircle2 className="text-green-600 dark:text-green-500 shrink-0 mt-0.5" size={20} />
                                        <div>
                                            <h4 className="text-green-900 dark:text-green-400 font-bold text-sm mb-1">Recommended Strategy</h4>
                                            <p className="text-green-800 dark:text-green-300 text-sm">
                                                {report.recommendation}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Grounding Attribution */}
                                    <div className="flex items-center gap-2 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800 pt-4">
                                        <Globe size={12} />
                                        <span>Results grounded via Google Search</span>
                                    </div>
                                </div>
                                
                                {/* Right Column: Visual/Audio Evidence */}
                                <div className="space-y-6">
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Visual Evidence</h4>
                                        {report.attachedImage ? (
                                            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
                                                <img src={report.attachedImage} alt="Analyzed Site Evidence" className="w-full h-auto object-cover" />
                                                <div className="bg-white dark:bg-slate-900 p-3 border-t border-slate-100 dark:border-slate-800">
                                                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                                                        <ImageIcon size={12} />
                                                        Analyzed by Gemini Vision
                                                    </p>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-8 text-center bg-slate-50 dark:bg-slate-800/50">
                                                <ImageIcon className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={32} />
                                                <p className="text-xs text-slate-400 dark:text-slate-500">No visual evidence provided.</p>
                                            </div>
                                        )}
                                    </div>

                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Audio Evidence</h4>
                                        {report.attachedAudio ? (
                                            <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm">
                                                <div className="flex items-center gap-3 mb-2">
                                                    <div className="w-8 h-8 rounded-full bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                                                        <Mic size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-700 dark:text-slate-200">Site Audio</p>
                                                        <p className="text-xs text-slate-400">Duration: ~3s</p>
                                                    </div>
                                                </div>
                                                <audio controls src={report.attachedAudio} className="w-full h-8" />
                                                <p className="text-[10px] text-slate-400 mt-2 flex items-center gap-1">
                                                    <Zap size={10} className="text-orange-400" /> Processed for industrial sounds
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 p-6 text-center bg-slate-50 dark:bg-slate-800/50">
                                                <Mic className="mx-auto text-slate-300 dark:text-slate-600 mb-2" size={24} />
                                                <p className="text-xs text-slate-400 dark:text-slate-500">No audio evidence provided.</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            ))
        ) : (
            <div className="text-center py-20 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
                <FileText size={48} className="mx-auto text-slate-300 dark:text-slate-600 mb-4" />
                <h3 className="text-lg font-medium text-slate-600 dark:text-slate-400">No reports found</h3>
                <p className="text-slate-400 dark:text-slate-500">Try adjusting your filters or generate a new analysis.</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisView;
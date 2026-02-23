import React, { useState, useEffect } from 'react';
import { Wand2, Video, Settings2, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import Button from './ui/Button';
import { enhanceTextPrompt } from '../services/geminiService';
import { PromptResult, LoadingState, AdvancedOptions, PromptPlatform, UserProfile } from '../types';

interface VideoPromptBuilderProps {
  onResult: (result: PromptResult) => void;
  setLoading: (state: LoadingState) => void;
  loading: LoadingState;
  userProfile: UserProfile;
}

const MOVEMENTS = [
  { value: '', label: 'Default' },
  { value: 'Static', label: 'Static (No movement)' },
  { value: 'Pan', label: 'Pan (Left/Right)' },
  { value: 'Tilt', label: 'Tilt (Up/Down)' },
  { value: 'Zoom In', label: 'Zoom In' },
  { value: 'Zoom Out', label: 'Zoom Out' },
  { value: 'Tracking Shot', label: 'Tracking / Dolly' },
  { value: 'Handheld', label: 'Handheld / Shaky' },
  { value: 'FPV Drone', label: 'FPV Drone' },
  { value: 'Orbit', label: 'Orbit / Arc' }
];

const STYLES = [
  { value: '', label: 'None / Auto' },
  { value: 'Cinematic Movie', label: 'Cinematic Movie' },
  { value: '3D Animation', label: '3D Animation' },
  { value: 'Anime', label: 'Anime' },
  { value: 'Documentary', label: 'Documentary' },
  { value: 'Vintage VHS', label: 'Vintage VHS' },
  { value: 'GoPro', label: 'GoPro / Action' },
  { value: 'CCTV', label: 'CCTV' },
  { value: 'Slow Motion', label: 'Slow Motion' },
  { value: 'Time-lapse', label: 'Time-lapse' }
];

const LIGHTING = [
  { value: '', label: 'None / Auto' },
  { value: 'Natural', label: 'Natural / Realistic' },
  { value: 'Cinematic', label: 'Cinematic' },
  { value: 'Neon', label: 'Neon / Cyberpunk' },
  { value: 'Strobe', label: 'Strobe / Flashing' },
  { value: 'Soft', label: 'Soft / Diffused' }
];

const PACING = [
  { value: '', label: 'None / Auto' },
  { value: 'Slow', label: 'Slow & Atmospheric' },
  { value: 'Fast', label: 'Fast & Action-packed' },
  { value: 'Real-time', label: 'Real-time' },
  { value: 'Looping', label: 'Seamless Loop' }
];

const PLATFORMS: { value: PromptPlatform; label: string }[] = [
  { value: 'generic', label: 'Universal / Generic' },
  { value: 'veo', label: 'Google Veo' },
  { value: 'sora', label: 'OpenAI Sora' },
  { value: 'runway', label: 'Runway Gen-2' },
  { value: 'midjourney', label: 'Midjourney (Video)' }
];

const VideoPromptBuilder: React.FC<VideoPromptBuilderProps> = ({ onResult, setLoading, loading, userProfile }) => {
  const [subject, setSubject] = useState('');
  
  // Builder State
  const [movement, setMovement] = useState('');
  const [style, setStyle] = useState('');
  const [lighting, setLighting] = useState('');
  const [pacing, setPacing] = useState('');

  // Advanced Settings State
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<AdvancedOptions>({
    creativity: userProfile.settings.defaultCreativity,
    style: '',
    negativePrompt: '',
    platform: userProfile.settings.defaultPlatform
  });

  // Re-sync defaults if profile changes
  useEffect(() => {
    setOptions(prev => ({
      ...prev,
      creativity: userProfile.settings.defaultCreativity,
      platform: userProfile.settings.defaultPlatform
    }));
  }, [userProfile.settings.defaultCreativity, userProfile.settings.defaultPlatform]);

  const handleGenerate = async () => {
    if (!subject.trim()) return;

    setLoading('generating');
    
    // Construct a rich description from selected options
    const details = [
      movement ? `Camera Movement: ${movement}` : '',
      style ? `Video Style: ${style}` : '',
      lighting ? `Lighting: ${lighting}` : '',
      pacing ? `Pacing/Speed: ${pacing}` : ''
    ].filter(Boolean).join(', ');

    const fullIdea = `Action/Scene: "${subject}". \nSpecific Requirements: ${details || 'None'}.`;

    try {
      const result = await enhanceTextPrompt(fullIdea, 'video', options);
      onResult(result);
      setLoading('success');
    } catch (error) {
      console.error(error);
      setLoading('error');
    }
  };

  const handleOptionChange = (key: keyof AdvancedOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const SelectInput = ({ label, value, onChange, options: opts }: any) => (
    <div>
      <label className="block text-xs font-medium text-slate-400 mb-1.5">{label}</label>
      <div className="relative">
        <select
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 text-sm text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent transition-all"
        >
          {opts.map((opt: any) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-slate-500">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm">
        <div className="flex items-center space-x-2 mb-4">
          <Video className="w-5 h-5 text-indigo-400" />
          <h2 className="text-lg font-semibold text-slate-200">Video Prompt Builder</h2>
        </div>

        <div className="space-y-4">
           <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Action & Scene Description
                </label>
                <textarea
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Describe the movement, characters, and action taking place..."
                  className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                />
             </div>
             {/* Platform Selector */}
             <div className="space-y-4">
                 <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Platform</label>
                    <div className="relative">
                      <select
                        value={options.platform}
                        onChange={(e) => handleOptionChange('platform', e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2 px-3 pl-9 text-sm text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                      >
                        {PLATFORMS.map(p => (
                          <option key={p.value} value={p.value}>{p.label}</option>
                        ))}
                      </select>
                      <Layers className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                      <ChevronDown className="absolute right-3 top-2.5 w-4 h-4 text-slate-500 pointer-events-none" />
                    </div>
                 </div>
                 <div className="bg-indigo-900/20 p-3 rounded-lg border border-indigo-500/20">
                    <p className="text-[10px] text-indigo-300 leading-tight">
                       Optimization for specific video models ensures better temporal consistency and adherence to physics.
                    </p>
                 </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <SelectInput label="Camera Movement" value={movement} onChange={setMovement} options={MOVEMENTS} />
            <SelectInput label="Video Style" value={style} onChange={setStyle} options={STYLES} />
            <SelectInput label="Lighting" value={lighting} onChange={setLighting} options={LIGHTING} />
            <SelectInput label="Pacing / Speed" value={pacing} onChange={setPacing} options={PACING} />
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="mt-6 border-t border-slate-700/50 pt-4">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors"
          >
            <Settings2 className="w-3.5 h-3.5 mr-1.5" />
            Advanced Settings
            {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 ml-1" /> : <ChevronDown className="w-3.5 h-3.5 ml-1" />}
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 animate-fade-in">
              {/* Creativity Slider */}
              <div>
                <div className="flex justify-between mb-1">
                  <label className="text-xs text-slate-400">Creativity Level</label>
                  <span className="text-xs text-indigo-400 font-mono">{options.creativity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={options.creativity} 
                  onChange={(e) => handleOptionChange('creativity', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between mt-1 text-[10px] text-slate-500">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Wild</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Style Bias */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Additional Style Bias</label>
                  <input 
                    type="text" 
                    value={options.style}
                    onChange={(e) => handleOptionChange('style', e.target.value)}
                    placeholder="Specific director or look..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-indigo-500/50 focus:outline-none"
                  />
                </div>
                
                {/* Negative Prompt */}
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Negative Prompt</label>
                  <input 
                    type="text" 
                    value={options.negativePrompt}
                    onChange={(e) => handleOptionChange('negativePrompt', e.target.value)}
                    placeholder="e.g. Blur, Distortion, Text..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded p-2 text-xs text-slate-200 focus:border-indigo-500/50 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 pt-4 border-t border-slate-700/50 flex justify-end">
          <Button 
            onClick={handleGenerate} 
            disabled={!subject.trim()}
            isLoading={loading === 'generating'}
            className="w-full sm:w-auto"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Generate Video Prompt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default VideoPromptBuilder;
import React, { useState, useEffect } from 'react';
import { Wand2, ImagePlus, Settings2, ChevronDown, ChevronUp, User, Mountain, Building2, Box, Zap, Check, Layers } from 'lucide-react';
import Button from './ui/Button';
import { enhanceTextPrompt } from '../services/geminiService';
import { PromptResult, LoadingState, AdvancedOptions, PromptPlatform, UserProfile } from '../types';

interface ImagePromptBuilderProps {
  onResult: (result: PromptResult) => void;
  setLoading: (state: LoadingState) => void;
  loading: LoadingState;
  userProfile: UserProfile;
}

const TEMPLATES = [
  {
    label: 'Portrait',
    icon: User,
    data: {
      subject: 'A stunning portrait of a character with expressive features',
      aspectRatio: '9:16',
      style: 'Photorealistic',
      lighting: 'Studio Lighting',
      camera: 'Close-up',
      mood: 'Peaceful'
    }
  },
  {
    label: 'Landscape',
    icon: Mountain,
    data: {
      subject: 'A breathtaking landscape with vast mountains and a river',
      aspectRatio: '16:9',
      style: 'Concept Art',
      lighting: 'Golden Hour',
      camera: 'Wide Angle',
      mood: 'Ethereal'
    }
  },
  {
    label: 'Cyberpunk',
    icon: Building2,
    data: {
      subject: 'A futuristic city street with neon lights and rain',
      aspectRatio: '21:9',
      style: 'Cyberpunk',
      lighting: 'Neon',
      camera: 'Drone Shot',
      mood: 'Dark'
    }
  },
  {
    label: '3D Render',
    icon: Box,
    data: {
      subject: 'A cute isometric room with cozy furniture',
      aspectRatio: '1:1',
      style: '3D Render',
      lighting: 'Soft',
      camera: 'High Angle',
      mood: 'Peaceful'
    }
  },
  {
    label: 'Anime',
    icon: Zap,
    data: {
      subject: 'An anime style action scene with dynamic effects',
      aspectRatio: '16:9',
      style: 'Anime',
      lighting: 'Cinematic Lighting',
      camera: 'Low Angle',
      mood: 'Energetic'
    }
  }
];

const PLATFORMS: { value: PromptPlatform; label: string }[] = [
  { value: 'generic', label: 'Universal / Generic' },
  { value: 'midjourney', label: 'Midjourney v6' },
  { value: 'dalle3', label: 'DALL-E 3' },
  { value: 'stable-diffusion', label: 'Stable Diffusion XL' }
];

const ASPECT_RATIOS = [
  { value: '', label: 'Default' },
  { value: '1:1', label: '1:1 (Square)' },
  { value: '16:9', label: '16:9 (Landscape)' },
  { value: '9:16', label: '9:16 (Portrait)' },
  { value: '4:3', label: '4:3 (Standard)' },
  { value: '21:9', label: '21:9 (Ultrawide)' }
];

const STYLES = [
  { value: '', label: 'None / Auto' },
  { value: 'Photorealistic', label: 'Photorealistic' },
  { value: 'Cyberpunk', label: 'Cyberpunk' },
  { value: 'Anime', label: 'Anime / Manga' },
  { value: 'Oil Painting', label: 'Oil Painting' },
  { value: 'Watercolor', label: 'Watercolor' },
  { value: '3D Render', label: '3D Render (Octane)' },
  { value: 'Cinematic', label: 'Cinematic' },
  { value: 'Vintage', label: 'Vintage / Retro' },
  { value: 'Surrealism', label: 'Surrealism' },
  { value: 'Pixel Art', label: 'Pixel Art' },
  { value: 'Concept Art', label: 'Concept Art' }
];

const LIGHTING = [
  { value: '', label: 'None / Auto' },
  { value: 'Natural Daylight', label: 'Natural Daylight' },
  { value: 'Golden Hour', label: 'Golden Hour' },
  { value: 'Cinematic Lighting', label: 'Cinematic Lighting' },
  { value: 'Neon', label: 'Neon / Cyberpunk' },
  { value: 'Studio Lighting', label: 'Studio Lighting' },
  { value: 'Volumetric Fog', label: 'Volumetric Fog' },
  { value: 'Low Key', label: 'Low Key (Dark)' },
  { value: 'High Key', label: 'High Key (Bright)' },
  { value: 'Bioluminescent', label: 'Bioluminescent' }
];

const CAMERA_ANGLES = [
  { value: '', label: 'None / Auto' },
  { value: 'Eye Level', label: 'Eye Level' },
  { value: 'Low Angle', label: 'Low Angle' },
  { value: 'High Angle', label: 'High Angle' },
  { value: 'Bird\'s Eye View', label: 'Bird\'s Eye View' },
  { value: 'Drone Shot', label: 'Drone Shot' },
  { value: 'Close-up', label: 'Close-up' },
  { value: 'Macro', label: 'Macro' },
  { value: 'Wide Angle', label: 'Wide Angle' },
  { value: 'Fisheye', label: 'Fisheye' }
];

const MOODS = [
  { value: '', label: 'None / Auto' },
  { value: 'Peaceful', label: 'Peaceful' },
  { value: 'Energetic', label: 'Energetic' },
  { value: 'Dark', label: 'Dark / Mysterious' },
  { value: 'Ethereal', label: 'Ethereal' },
  { value: 'Romantic', label: 'Romantic' },
  { value: 'Chaotic', label: 'Chaotic' },
  { value: 'Melancholic', label: 'Melancholic' }
];

const ImagePromptBuilder: React.FC<ImagePromptBuilderProps> = ({ onResult, setLoading, loading, userProfile }) => {
  const [subject, setSubject] = useState('');
  
  // Builder State
  const [aspectRatio, setAspectRatio] = useState('');
  const [style, setStyle] = useState('');
  const [lighting, setLighting] = useState('');
  const [camera, setCamera] = useState('');
  const [mood, setMood] = useState('');
  
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState('');

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
      // We pass aspect ratio separately if platform is midjourney to service, but included in text for others
      (options.platform !== 'midjourney' && aspectRatio) ? `Aspect Ratio: ${aspectRatio}` : '',
      style ? `Art Style: ${style}` : '',
      lighting ? `Lighting: ${lighting}` : '',
      camera ? `Camera Angle: ${camera}` : '',
      mood ? `Mood: ${mood}` : ''
    ].filter(Boolean).join(', ');

    const fullIdea = `Subject/Concept: "${subject}". \nSpecific Requirements: ${details || 'None'}.`;

    try {
      // Pass aspect ratio to options so service can use it for parameter generation
      const finalOptions = { ...options, aspectRatio };
      const result = await enhanceTextPrompt(fullIdea, 'image', finalOptions);
      onResult(result);
      setLoading('success');
    } catch (error) {
      console.error(error);
      setLoading('error');
    }
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setSubject(template.data.subject);
    setAspectRatio(template.data.aspectRatio);
    setStyle(template.data.style);
    setLighting(template.data.lighting);
    setCamera(template.data.camera);
    setMood(template.data.mood);
    setSelectedTemplateLabel(template.label);
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
          onChange={(e) => {
            onChange(e.target.value);
            // Clear template selection if user manually changes a dropdown
            if (selectedTemplateLabel) setSelectedTemplateLabel(''); 
          }}
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
        
        {/* Templates Grid */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
             <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Quick Start Templates</label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {TEMPLATES.map((t) => {
              const Icon = t.icon;
              const isSelected = selectedTemplateLabel === t.label;
              return (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t)}
                  className={`
                    flex flex-col items-center justify-center p-3 h-24 rounded-xl border transition-all duration-300 group relative overflow-hidden
                    ${isSelected 
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50' 
                      : 'bg-slate-900/40 border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/80 hover:shadow-md'
                    }
                  `}
                  title={`Use ${t.label} template`}
                >
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 bg-indigo-500 rounded-full p-0.5 animate-fade-in">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                  
                  <div className={`
                    p-2 rounded-full mb-2 transition-all duration-300
                    ${isSelected 
                      ? 'bg-indigo-500/20 scale-105' 
                      : 'bg-slate-800 group-hover:bg-slate-700'
                    }
                  `}>
                      <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-300'}`} />
                  </div>
                  
                  <span className={`
                    text-[10px] sm:text-xs font-medium text-center leading-tight
                    ${isSelected ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-200'}
                  `}>
                      {t.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Main Subject & Description
                </label>
                <textarea
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                  }}
                  placeholder="Describe what you want to see in the image..."
                  className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-sans text-sm"
                />
             </div>
             
             {/* Platform Selector Sidebar */}
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
                       {options.platform === 'midjourney' 
                         ? 'Prompts will include parameters like --ar and --v 6.0' 
                         : options.platform === 'dalle3'
                         ? 'Optimized for natural language description.'
                         : options.platform === 'stable-diffusion'
                         ? 'Formatted with weighted tags and keywords.'
                         : 'Standard format suitable for most models.'}
                    </p>
                 </div>
             </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            <SelectInput label="Aspect Ratio" value={aspectRatio} onChange={setAspectRatio} options={ASPECT_RATIOS} />
            <SelectInput label="Art Style" value={style} onChange={setStyle} options={STYLES} />
            <SelectInput label="Lighting" value={lighting} onChange={setLighting} options={LIGHTING} />
            <SelectInput label="Camera Angle" value={camera} onChange={setCamera} options={CAMERA_ANGLES} />
            <SelectInput label="Mood / Vibe" value={mood} onChange={setMood} options={MOODS} />
          </div>
        </div>

        {/* Advanced Settings Toggle */}
        <div className="mt-6 border-t border-slate-700/50 pt-4">
          <button 
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors w-full group"
          >
            <div className="p-1 rounded bg-slate-800 mr-2 group-hover:bg-slate-700 transition-colors">
               <Settings2 className="w-3.5 h-3.5" />
            </div>
            Advanced Configuration
            <div className="ml-auto">
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </div>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-5 animate-fade-in bg-slate-900/30 p-4 rounded-lg border border-slate-700/30">
              {/* Creativity Slider */}
              <div>
                <div className="flex justify-between mb-2">
                  <label className="text-xs text-slate-300 font-medium">Creativity Level</label>
                  <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">{options.creativity}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={options.creativity} 
                  onChange={(e) => handleOptionChange('creativity', parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 font-medium">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Wild</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Style Bias */}
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1.5">Additional Style Bias</label>
                  <input 
                    type="text" 
                    value={options.style}
                    onChange={(e) => handleOptionChange('style', e.target.value)}
                    placeholder="Specific artist or detail..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-md p-2 text-xs text-slate-200 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
                  />
                </div>
                
                {/* Negative Prompt */}
                <div>
                  <label className="block text-xs text-slate-300 font-medium mb-1.5">Negative Prompt</label>
                  <input 
                    type="text" 
                    value={options.negativePrompt}
                    onChange={(e) => handleOptionChange('negativePrompt', e.target.value)}
                    placeholder="e.g. Blur, Distortion, Text..."
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-md p-2 text-xs text-slate-200 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
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
            Generate Image Prompt
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ImagePromptBuilder;
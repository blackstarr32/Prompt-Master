import React, { useState, useEffect } from 'react';
import { Sparkles, Wand2, Quote, Settings2, ChevronDown, ChevronUp, Mountain, Zap, Camera, Box, Palette, Check, Layers } from 'lucide-react';
import Button from './ui/Button';
import { enhanceTextPrompt } from '../services/geminiService';
import { PromptResult, LoadingState, AdvancedOptions, PromptPlatform, UserProfile } from '../types';

interface TextBuilderProps {
  onResult: (result: PromptResult) => void;
  setLoading: (state: LoadingState) => void;
  loading: LoadingState;
  userProfile: UserProfile;
}

const TEMPLATES = [
  {
    label: 'Fantasy Epic',
    text: 'A majestic fantasy landscape featuring an ancient dragon perched on a crystal spire, epic ethereal lighting, matte painting style, intricate details, trending on ArtStation.',
    tip: 'Try changing the creature (dragon) or the setting (crystal spire) to unique elements from your story.'
  },
  {
    label: 'Cyberpunk City',
    text: 'A futuristic cyberpunk city street at night, neon holographic signs reflecting on rain-slicked pavement, flying cars, cinematic lighting, photorealistic, 8k resolution.',
    tip: 'Experiment with different weather conditions (rain, fog, snow) or time of day to drastically change the mood.'
  },
  {
    label: 'Cinematic Portrait',
    text: 'A cinematic close-up portrait of a subject with expressive eyes, dramatic rim lighting, shot on 85mm lens, f/1.8, highly detailed skin texture, hyperrealistic.',
    tip: 'Adjust the subject description or change the lighting type (rim, soft, dramatic) to alter the character\'s presence.'
  },
  {
    label: '3D Isometric',
    text: 'A cute isometric 3D render of a cozy magical potion shop, soft pastel lighting, clay texture, blender 3d style, orthographic view, low poly, minimalistic.',
    tip: 'Swap "potion shop" for another building type like "library" or "bakery" to build your own little world.'
  },
  {
    label: 'Abstract Fluid',
    text: 'Abstract fluid art, swirling colors of liquid gold and obsidian, marble texture, macro photography, shallow depth of field, vibrant colors, 4k.',
    tip: 'Change "gold and obsidian" to your preferred color palette to match a specific aesthetic or brand.'
  }
];

const TEMPLATE_ICONS: Record<string, React.ElementType> = {
  'Fantasy Epic': Mountain,
  'Cyberpunk City': Zap,
  'Cinematic Portrait': Camera,
  '3D Isometric': Box,
  'Abstract Fluid': Palette
};

const PLATFORMS: { value: PromptPlatform; label: string }[] = [
  { value: 'generic', label: 'Universal / Generic' },
  { value: 'midjourney', label: 'Midjourney v6' },
  { value: 'dalle3', label: 'DALL-E 3' },
  { value: 'stable-diffusion', label: 'Stable Diffusion XL' },
  { value: 'veo', label: 'Google Veo' },
  { value: 'sora', label: 'OpenAI Sora' },
  { value: 'runway', label: 'Runway Gen-2' }
];

const TextBuilder: React.FC<TextBuilderProps> = ({ onResult, setLoading, loading, userProfile }) => {
  const [idea, setIdea] = useState('');
  const [targetType, setTargetType] = useState<'image' | 'video'>('image');
  const [activeTip, setActiveTip] = useState<string>('');
  const [selectedTemplateLabel, setSelectedTemplateLabel] = useState<string>('');
  
  // Advanced Settings State - Initialize with UserProfile defaults
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [options, setOptions] = useState<AdvancedOptions>({
    creativity: userProfile.settings.defaultCreativity,
    style: '',
    negativePrompt: '',
    platform: userProfile.settings.defaultPlatform
  });

  // Update local options if user profile changes deeply (though usually this component remounts)
  useEffect(() => {
    setOptions(prev => ({
      ...prev,
      creativity: userProfile.settings.defaultCreativity,
      platform: userProfile.settings.defaultPlatform
    }));
  }, [userProfile.settings.defaultCreativity, userProfile.settings.defaultPlatform]);

  const handleEnhance = async () => {
    if (!idea.trim()) return;

    setLoading('generating');
    try {
      const result = await enhanceTextPrompt(idea, targetType, options);
      onResult(result);
      setLoading('success');
    } catch (error) {
      console.error(error);
      setLoading('error');
    }
  };

  const applyTemplate = (template: typeof TEMPLATES[0]) => {
    setIdea(template.text);
    setActiveTip(template.tip);
    setSelectedTemplateLabel(template.label);
  };

  const handleOptionChange = (key: keyof AdvancedOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm">
        
        {/* Templates Grid */}
        <div className="mb-8">
           <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-slate-200">
              Quick Start Templates
            </label>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {TEMPLATES.map((t) => {
              const Icon = TEMPLATE_ICONS[t.label] || Quote;
              const isSelected = selectedTemplateLabel === t.label;
              return (
                <button
                  key={t.label}
                  onClick={() => applyTemplate(t)}
                  className={`
                    flex flex-col items-center justify-center p-3 h-28 rounded-xl border transition-all duration-300 group relative overflow-hidden
                    ${isSelected 
                      ? 'bg-indigo-600/20 border-indigo-500 shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-500/50' 
                      : 'bg-slate-900/40 border-slate-700/50 hover:border-indigo-500/30 hover:bg-slate-800/80 hover:shadow-md'
                    }
                  `}
                  title="Click to use this template"
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2 bg-indigo-500 rounded-full p-0.5 animate-fade-in">
                      <Check className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  
                  <div className={`
                    p-2.5 rounded-full mb-3 transition-all duration-300
                    ${isSelected 
                      ? 'bg-indigo-500/20 scale-110' 
                      : 'bg-slate-800 group-hover:bg-slate-700'
                    }
                  `}>
                      <Icon className={`w-5 h-5 ${isSelected ? 'text-indigo-400' : 'text-slate-400 group-hover:text-indigo-300'}`} />
                  </div>
                  
                  <span className={`
                    text-[11px] sm:text-xs font-medium text-center leading-tight px-1 transition-colors
                    ${isSelected ? 'text-indigo-200' : 'text-slate-400 group-hover:text-slate-200'}
                  `}>
                      {t.label}
                  </span>
                  
                  {isSelected && <div className="absolute inset-0 bg-indigo-500/5 pointer-events-none" />}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-grow space-y-2">
               <label className="block text-sm font-medium text-slate-300">
                 Your Prompt Idea
               </label>
               <textarea
                 value={idea}
                 onChange={(e) => {
                   setIdea(e.target.value);
                   if (selectedTemplateLabel && e.target.value !== TEMPLATES.find(t => t.label === selectedTemplateLabel)?.text) {
                      setSelectedTemplateLabel(''); 
                   }
                   if (activeTip && e.target.value === '') setActiveTip('');
                 }}
                 placeholder="Enter your idea here or select a style above..."
                 className="w-full h-32 bg-slate-900/50 border border-slate-700 rounded-lg p-4 text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none font-sans text-sm leading-relaxed"
               />
            </div>
            
            <div className="w-full sm:w-48 space-y-2">
               <label className="block text-sm font-medium text-slate-300">
                 Target Platform
               </label>
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

               <div className="bg-slate-900/30 p-3 rounded-lg border border-slate-700/30">
                  <span className="text-xs text-slate-500 block mb-2">Media Type</span>
                  <div className="flex space-x-1">
                    <button
                      onClick={() => setTargetType('image')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                        targetType === 'image' 
                          ? 'bg-slate-700 text-white shadow-sm' 
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Image
                    </button>
                    <button
                      onClick={() => setTargetType('video')}
                      className={`flex-1 py-1.5 rounded-md text-xs font-medium transition-all ${
                        targetType === 'video' 
                          ? 'bg-slate-700 text-white shadow-sm' 
                          : 'text-slate-400 hover:bg-slate-800'
                      }`}
                    >
                      Video
                    </button>
                  </div>
               </div>
            </div>
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
                  <label className="block text-xs text-slate-300 font-medium mb-1.5">Artistic Style Bias</label>
                  <input 
                    type="text" 
                    value={options.style}
                    onChange={(e) => handleOptionChange('style', e.target.value)}
                    placeholder="e.g. Cyberpunk, Oil Painting..."
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

        <div className="flex justify-end mt-6 pt-4 border-t border-slate-700/50">
          <Button 
            onClick={handleEnhance} 
            disabled={!idea.trim()}
            isLoading={loading === 'generating'}
            className="w-full sm:w-auto"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            Enhance Prompt
          </Button>
        </div>
      </div>

      <div className={`
        flex items-start p-4 rounded-lg transition-all duration-500 border
        ${activeTip 
          ? 'bg-indigo-900/20 border-indigo-500/30 opacity-100 translate-y-0' 
          : 'bg-slate-800/30 border-slate-700/30 opacity-70'
        }
      `}>
        <Sparkles className={`w-5 h-5 mt-0.5 mr-3 shrink-0 transition-colors ${activeTip ? 'text-indigo-400' : 'text-slate-500'}`} />
        <div className="text-sm">
          <p className={`font-medium mb-1 ${activeTip ? 'text-indigo-200' : 'text-slate-400'}`}>
            {activeTip ? 'Template Tip' : 'Pro Tip'}
          </p>
          <p className={`${activeTip ? 'text-indigo-300/80' : 'text-slate-500'}`}>
            {activeTip || 'Select a style card above to jumpstart your prompt, then tweak the text to make it your own.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default TextBuilder;
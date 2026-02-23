import React from 'react';
import { UserProfile, AppTheme, FontSize, PromptPlatform, DEFAULT_PROFILE } from '../types';
import { Settings, Monitor, Type, Sliders, Check, Layers, RefreshCw } from 'lucide-react';
import Button from './ui/Button';

interface ProfileSettingsProps {
  profile: UserProfile;
  onUpdate: (profile: UserProfile) => void;
}

const THEMES: { value: AppTheme; label: string; color: string }[] = [
  { value: 'cosmic', label: 'Cosmic Indigo', color: 'bg-indigo-500' },
  { value: 'emerald', label: 'Forest Emerald', color: 'bg-emerald-500' },
  { value: 'rose', label: 'Rose Gold', color: 'bg-rose-500' },
  { value: 'amber', label: 'Sunset Amber', color: 'bg-amber-500' },
  { value: 'slate', label: 'Deep Slate', color: 'bg-slate-500' }
];

const FONT_SIZES: { value: FontSize; label: string }[] = [
  { value: 'small', label: 'Compact' },
  { value: 'medium', label: 'Standard' },
  { value: 'large', label: 'Large' }
];

const PLATFORMS: { value: PromptPlatform; label: string }[] = [
  { value: 'generic', label: 'Universal / Generic' },
  { value: 'midjourney', label: 'Midjourney v6' },
  { value: 'dalle3', label: 'DALL-E 3' },
  { value: 'stable-diffusion', label: 'Stable Diffusion XL' },
  { value: 'veo', label: 'Google Veo' },
  { value: 'sora', label: 'OpenAI Sora' },
  { value: 'runway', label: 'Runway Gen-2' }
];

const ProfileSettings: React.FC<ProfileSettingsProps> = ({ profile, onUpdate }) => {
  
  const handleChange = (section: keyof UserProfile, key: string, value: any) => {
    onUpdate({
      ...profile,
      [section]: {
        ...profile[section],
        [key]: value
      }
    });
  };

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all settings to default?')) {
      onUpdate(DEFAULT_PROFILE);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-8 animate-fade-in">
      <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
        <div className="flex items-center space-x-3 mb-6">
          <Settings className="w-6 h-6 text-indigo-400" />
          <h2 className="text-xl font-semibold text-slate-200">Application Settings</h2>
        </div>

        {/* Appearance Section */}
        <div className="space-y-6 mb-8">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center">
            <Monitor className="w-4 h-4 mr-2" /> Appearance
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Background Theme
              </label>
              <div className="grid grid-cols-5 gap-2">
                {THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => handleChange('appearance', 'theme', theme.value)}
                    className={`
                      h-10 rounded-lg flex items-center justify-center transition-all duration-200
                      ${theme.color} 
                      ${profile.appearance.theme === theme.value 
                        ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 scale-105 shadow-lg' 
                        : 'opacity-50 hover:opacity-100 hover:scale-105'
                      }
                    `}
                    title={theme.label}
                  >
                    {profile.appearance.theme === theme.value && <Check className="w-4 h-4 text-white" />}
                  </button>
                ))}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Selected: <span className="text-slate-300">{THEMES.find(t => t.value === profile.appearance.theme)?.label}</span>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">
                Interface Scale
              </label>
              <div className="flex bg-slate-900/50 p-1 rounded-lg border border-slate-700">
                {FONT_SIZES.map((size) => (
                  <button
                    key={size.value}
                    onClick={() => handleChange('appearance', 'fontSize', size.value)}
                    className={`
                      flex-1 py-1.5 text-xs font-medium rounded-md transition-all
                      ${profile.appearance.fontSize === size.value 
                        ? 'bg-slate-700 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                      }
                    `}
                  >
                    {size.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-700/50 my-6"></div>

        {/* Defaults Section */}
        <div className="space-y-6">
          <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider flex items-center">
            <Sliders className="w-4 h-4 mr-2" /> Prompt Defaults
          </h3>
          
          <div className="space-y-4">
             <div>
               <label className="block text-sm font-medium text-slate-300 mb-2">
                 Default Target Platform
               </label>
               <div className="relative">
                 <select
                    value={profile.settings.defaultPlatform}
                    onChange={(e) => handleChange('settings', 'defaultPlatform', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg py-2.5 px-3 pl-10 text-sm text-slate-200 appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                 >
                   {PLATFORMS.map(p => (
                     <option key={p.value} value={p.value}>{p.label}</option>
                   ))}
                 </select>
                 <Layers className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
               </div>
               <p className="text-xs text-slate-500 mt-1">
                 This platform will be pre-selected when you start a new prompt.
               </p>
             </div>

             <div>
               <div className="flex justify-between mb-2">
                 <label className="text-sm font-medium text-slate-300">Default Creativity Level</label>
                 <span className="text-xs text-indigo-400 font-mono bg-indigo-500/10 px-2 py-0.5 rounded">
                   {profile.settings.defaultCreativity}%
                 </span>
               </div>
               <input 
                 type="range" 
                 min="0" 
                 max="100" 
                 value={profile.settings.defaultCreativity} 
                 onChange={(e) => handleChange('settings', 'defaultCreativity', parseInt(e.target.value))}
                 className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
               />
               <div className="flex justify-between mt-1.5 text-[10px] text-slate-500 font-medium">
                  <span>Precise</span>
                  <span>Balanced</span>
                  <span>Wild</span>
               </div>
             </div>
          </div>
        </div>

        <div className="w-full h-px bg-slate-700/50 my-6"></div>

        <div className="flex justify-end pt-2">
          <Button 
            variant="ghost" 
            onClick={handleReset}
            className="text-red-400 hover:text-red-300 hover:bg-red-900/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Reset to Defaults
          </Button>
        </div>

      </div>
    </div>
  );
};

export default ProfileSettings;
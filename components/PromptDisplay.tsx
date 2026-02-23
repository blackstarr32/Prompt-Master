import React, { useState } from 'react';
import { PromptResult, PromptPlatform } from '../types';
import { Copy, Check, Hash, Heart, Layers } from 'lucide-react';
import Button from './ui/Button';

interface PromptDisplayProps {
  result: PromptResult | null;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
}

const PLATFORM_LABELS: Record<string, string> = {
  'generic': 'Universal',
  'midjourney': 'Midjourney v6',
  'dalle3': 'DALL-E 3',
  'stable-diffusion': 'Stable Diffusion XL',
  'veo': 'Google Veo',
  'sora': 'OpenAI Sora',
  'runway': 'Runway Gen-2'
};

const PromptDisplay: React.FC<PromptDisplayProps> = ({ result, isFavorite = false, onToggleFavorite }) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(result.prompt);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const tags = result.tags || [];
  const platformName = result.platform ? PLATFORM_LABELS[result.platform] : 'Universal';

  return (
    <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl p-6 shadow-xl backdrop-blur-sm animate-fade-in-up">
      <div className="flex flex-col sm:flex-row items-start justify-between mb-4 gap-4">
        <div className="flex-grow">
          <div className="flex items-center space-x-3 mb-1">
             <h3 className="text-xl font-semibold text-white">{result.title}</h3>
             {result.platform && result.platform !== 'generic' && (
               <span className="inline-flex items-center text-[10px] font-bold uppercase tracking-wider text-indigo-200 bg-indigo-500/20 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                 <Layers className="w-3 h-3 mr-1" />
                 {platformName}
               </span>
             )}
          </div>
          <div className="flex flex-wrap gap-2 mt-2">
            {tags.map((tag, i) => (
              <span key={i} className="inline-flex items-center text-xs font-medium text-indigo-300 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                <Hash className="w-3 h-3 mr-1" />
                {tag}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center space-x-2 shrink-0 self-start sm:self-auto">
          {onToggleFavorite && (
            <Button
              variant="outline"
              onClick={onToggleFavorite}
              className={`transition-colors duration-300 ${isFavorite ? 'border-pink-500/50 bg-pink-500/10 text-pink-500 hover:bg-pink-500/20' : 'hover:text-pink-400'}`}
              title={isFavorite ? "Remove from favorites" : "Save to favorites"}
            >
              <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
            </Button>
          )}
          <Button 
            variant="outline" 
            onClick={handleCopy} 
            className="shrink-0"
            aria-label="Copy prompt"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            <span className="ml-2 hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
          </Button>
        </div>
      </div>

      <div className="bg-slate-900/80 rounded-lg p-4 border border-slate-700/50 relative group">
        <p className="text-slate-300 leading-relaxed font-mono text-sm whitespace-pre-wrap selection:bg-indigo-500/30">
          {result.prompt}
        </p>
      </div>
      
      {result.platform === 'midjourney' && (
         <div className="mt-3 flex items-center text-[10px] text-slate-500">
            <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 mr-2">Tip</span>
            Copy and paste directly into Discord using the <code className="mx-1 text-slate-400">/imagine</code> command.
         </div>
      )}
    </div>
  );
};

export default PromptDisplay;
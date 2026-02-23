import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Upload, X, Film, Image as ImageIcon, AlertCircle, Settings2, ChevronDown, ChevronUp } from 'lucide-react';
import Button from './ui/Button';
import { analyzeImageForPrompt, analyzeVideoForPrompt } from '../services/geminiService';
import { PromptResult, LoadingState, AdvancedOptions, UserProfile } from '../types';

interface MediaAnalyzerProps {
  mode: 'image' | 'video';
  onResult: (result: PromptResult) => void;
  setLoading: (state: LoadingState) => void;
  loading: LoadingState;
  userProfile: UserProfile;
}

const MediaAnalyzer: React.FC<MediaAnalyzerProps> = ({ mode, onResult, setLoading, loading, userProfile }) => {
  const [fileData, setFileData] = useState<{ url: string; type: string; name: string; base64: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

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

  const handleFileChange = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError(null);
    
    // Size check (20MB limit for browser stability with base64)
    if (file.size > 20 * 1024 * 1024) {
      setError("File is too large. Please upload a file smaller than 20MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      // split base64 prefix
      const base64 = result.split(',')[1];
      
      setFileData({
        url: URL.createObjectURL(file),
        type: file.type,
        name: file.name,
        base64: base64
      });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleClear = () => {
    setFileData(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!fileData) return;

    setLoading('analyzing');
    setError(null);

    try {
      let result: PromptResult;
      if (mode === 'image') {
        result = await analyzeImageForPrompt(fileData.base64, fileData.type, options);
      } else {
        result = await analyzeVideoForPrompt(fileData.base64, fileData.type, options);
      }
      onResult(result);
      setLoading('success');
    } catch (err: any) {
      console.error(err);
      setError("Failed to analyze media. Please try again.");
      setLoading('error');
    }
  };

  const handleOptionChange = (key: keyof AdvancedOptions, value: string | number) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const acceptType = mode === 'image' ? "image/*" : "video/*";
  const Icon = mode === 'image' ? ImageIcon : Film;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6">
      <div className="bg-slate-800/30 border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-indigo-500/50 transition-colors">
        {!fileData ? (
          <div 
            className="cursor-pointer flex flex-col items-center justify-center space-y-4"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center shadow-inner">
              <Icon className="w-8 h-8 text-indigo-400" />
            </div>
            <div className="space-y-1">
              <p className="text-lg font-medium text-slate-200">
                Upload a {mode} to analyze
              </p>
              <p className="text-sm text-slate-400">
                Click to browse or drag and drop
              </p>
            </div>
            <p className="text-xs text-slate-500">
              {mode === 'image' ? 'PNG, JPG, WEBP up to 20MB' : 'MP4, MOV, WEBM up to 20MB'}
            </p>
          </div>
        ) : (
          <div className="relative group">
            <button 
              onClick={handleClear}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1.5 rounded-full shadow-lg hover:bg-red-600 transition-colors z-10"
              title="Remove file"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="rounded-lg overflow-hidden bg-black/50 shadow-xl max-h-[400px] flex items-center justify-center">
              {mode === 'image' ? (
                <img src={fileData.url} alt="Preview" className="max-w-full h-auto object-contain" />
              ) : (
                <video src={fileData.url} controls className="max-w-full max-h-[400px]" />
              )}
            </div>
            <p className="mt-4 text-sm text-slate-400 font-mono truncate">{fileData.name}</p>
          </div>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept={acceptType}
          onChange={handleFileChange} 
        />
      </div>

      {fileData && (
        <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
          <button 
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center text-xs font-medium text-slate-400 hover:text-indigo-400 transition-colors w-full"
            >
              <Settings2 className="w-3.5 h-3.5 mr-1.5" />
              Advanced Settings
              <div className="ml-auto">
                {showAdvanced ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </div>
          </button>

          {showAdvanced && (
            <div className="mt-4 space-y-4 animate-fade-in border-t border-slate-700/50 pt-4">
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
                  <label className="block text-xs text-slate-400 mb-1">Artistic Style Bias</label>
                  <input 
                    type="text" 
                    value={options.style}
                    onChange={(e) => handleOptionChange('style', e.target.value)}
                    placeholder="e.g. Cyberpunk, Oil Painting..."
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
      )}

      {error && (
        <div className="flex items-center p-4 text-red-200 bg-red-900/20 border border-red-900/50 rounded-lg">
          <AlertCircle className="w-5 h-5 mr-3 shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {fileData && (
        <div className="flex justify-center">
          <Button 
            onClick={handleAnalyze} 
            isLoading={loading === 'analyzing'}
            className="w-full sm:w-auto min-w-[200px]"
            variant="primary"
          >
            {loading === 'analyzing' ? 'Analyzing with Gemini Pro...' : `Generate ${mode === 'image' ? 'Image' : 'Video'} Prompt`}
          </Button>
        </div>
      )}
    </div>
  );
};

export default MediaAnalyzer;
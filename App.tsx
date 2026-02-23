import React, { useState, useEffect } from 'react';
import { PenTool, Image as ImageIcon, Film, Sparkles, Layers, Bookmark, ImagePlus, Video, Settings } from 'lucide-react';
import TextBuilder from './components/TextBuilder';
import ImagePromptBuilder from './components/ImagePromptBuilder';
import VideoPromptBuilder from './components/VideoPromptBuilder';
import MediaAnalyzer from './components/MediaAnalyzer';
import PromptDisplay from './components/PromptDisplay';
import FavoritesList from './components/FavoritesList';
import GeneratingOverlay from './components/GeneratingOverlay';
import ProfileSettings from './components/ProfileSettings';
import { PromptResult, GenerationMode, LoadingState, SavedPrompt, UserProfile, DEFAULT_PROFILE, AppTheme } from './types';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<GenerationMode>(GenerationMode.TEXT);
  const [result, setResult] = useState<PromptResult | null>(null);
  const [loading, setLoading] = useState<LoadingState>('idle');
  const [favorites, setFavorites] = useState<SavedPrompt[]>([]);
  
  // User Profile State
  const [userProfile, setUserProfile] = useState<UserProfile>(DEFAULT_PROFILE);

  // Load favorites and profile from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('promptMasterFavorites');
    if (saved) {
      try {
        setFavorites(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse favorites", e);
      }
    }

    const savedProfile = localStorage.getItem('promptMasterProfile');
    if (savedProfile) {
      try {
        const parsed = JSON.parse(savedProfile);
        // Merge with default to ensure new fields are present if added in updates
        setUserProfile({
          appearance: { ...DEFAULT_PROFILE.appearance, ...parsed.appearance },
          settings: { ...DEFAULT_PROFILE.settings, ...parsed.settings }
        });
      } catch (e) {
        console.error("Failed to parse profile", e);
      }
    }
  }, []);

  // Save favorites to local storage whenever they change
  useEffect(() => {
    localStorage.setItem('promptMasterFavorites', JSON.stringify(favorites));
  }, [favorites]);

  // Save profile to local storage whenever it changes
  useEffect(() => {
    localStorage.setItem('promptMasterProfile', JSON.stringify(userProfile));
  }, [userProfile]);

  // Apply Font Size
  useEffect(() => {
    const root = document.documentElement;
    const sizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.fontSize = sizeMap[userProfile.appearance.fontSize] || '16px';
  }, [userProfile.appearance.fontSize]);

  const handleResult = (newResult: PromptResult) => {
    setResult(newResult);
    // Smooth scroll to result
    setTimeout(() => {
      document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const resetResult = () => {
    setResult(null);
    setLoading('idle');
  };

  const handleTabChange = (mode: GenerationMode) => {
    if (loading === 'analyzing' || loading === 'generating') return;
    setActiveTab(mode);
    resetResult();
  };

  const toggleFavorite = () => {
    if (!result) return;

    const isFav = isCurrentResultFavorite();
    
    if (isFav) {
      // Remove
      setFavorites(prev => prev.filter(f => f.prompt !== result.prompt));
    } else {
      // Add
      const newFavorite: SavedPrompt = {
        ...result,
        id: generateId(),
        createdAt: Date.now()
      };
      setFavorites(prev => [newFavorite, ...prev]);
    }
  };

  const generateId = () => {
    // Simple ID generator fallback if crypto is not available
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
  };

  const deleteFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const selectFavorite = (fav: SavedPrompt) => {
    setResult(fav);
    setTimeout(() => {
        document.getElementById('result-section')?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const isCurrentResultFavorite = (): boolean => {
    if (!result) return false;
    return favorites.some(f => f.prompt === result.prompt);
  };

  const getOverlayMode = () => {
    if (activeTab === GenerationMode.IMAGE || activeTab === GenerationMode.BUILD_IMAGE) return 'image';
    if (activeTab === GenerationMode.VIDEO || activeTab === GenerationMode.BUILD_VIDEO) return 'video';
    return 'text';
  };

  const isGenerating = loading === 'analyzing' || loading === 'generating';

  // Theme Helpers
  const getThemeBackgrounds = (theme: AppTheme) => {
    switch (theme) {
      case 'emerald':
        return {
          top: 'bg-emerald-900/20',
          bottom: 'bg-teal-900/20',
          accent: 'text-emerald-400'
        };
      case 'rose':
        return {
          top: 'bg-rose-900/20',
          bottom: 'bg-pink-900/20',
          accent: 'text-rose-400'
        };
      case 'amber':
        return {
          top: 'bg-amber-900/20',
          bottom: 'bg-orange-900/20',
          accent: 'text-amber-400'
        };
      case 'slate':
        return {
          top: 'bg-slate-800/30',
          bottom: 'bg-gray-900/30',
          accent: 'text-slate-300'
        };
      case 'cosmic':
      default:
        return {
          top: 'bg-indigo-900/20',
          bottom: 'bg-purple-900/20',
          accent: 'text-indigo-400'
        };
    }
  };

  const themeStyles = getThemeBackgrounds(userProfile.appearance.theme);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-500">
      {/* Background decoration */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none transition-colors duration-700">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] transition-colors duration-700 ${themeStyles.top}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[100px] transition-colors duration-700 ${themeStyles.bottom}`} />
      </div>

      <header className="relative z-10 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg sticky top-0">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleTabChange(GenerationMode.TEXT)}>
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-lg transition-colors duration-500 bg-slate-800 border border-slate-700`}>
              <Sparkles className={`w-5 h-5 ${themeStyles.accent}`} />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
              PromptMaster AI
            </h1>
          </div>
          <div className="text-xs text-slate-500 font-mono hidden sm:block">
            Powered by Gemini 3.0 Pro
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-grow flex flex-col items-center px-4 py-8 sm:py-12 max-w-6xl mx-auto w-full">
        
        {/* Hero Section */}
        {activeTab !== GenerationMode.SETTINGS && (
          <div className="text-center mb-10 space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              Create the perfect <span className={`transition-colors duration-500 ${themeStyles.accent}`}>prompt</span>
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto text-lg">
              Generate professional prompts for Midjourney, Veo, and more by enhancing ideas or analyzing media.
            </p>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="w-full max-w-5xl mx-auto mb-10 overflow-x-auto pb-2 scrollbar-hide">
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 flex shadow-xl min-w-max">
            {[
              { id: GenerationMode.TEXT, label: 'Compose', icon: PenTool },
              { id: GenerationMode.BUILD_IMAGE, label: 'Build Image', icon: ImagePlus },
              { id: GenerationMode.BUILD_VIDEO, label: 'Build Video', icon: Video },
              { id: GenerationMode.IMAGE, label: 'Analyze Img', icon: ImageIcon },
              { id: GenerationMode.VIDEO, label: 'Analyze Vid', icon: Film },
              { id: GenerationMode.FAVORITES, label: 'Saved', icon: Bookmark },
              { id: GenerationMode.SETTINGS, label: 'Settings', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 flex items-center justify-center py-2.5 px-4 text-sm font-medium rounded-lg transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-slate-800 text-white shadow-sm ring-1 ring-slate-700'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <tab.icon className={`w-4 h-4 mr-2 ${activeTab === tab.id ? themeStyles.accent : ''}`} />
                <span>{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Content Area */}
        <div className="w-full transition-all duration-300 ease-in-out">
          {activeTab === GenerationMode.TEXT && (
            <div className="animate-fade-in">
              <TextBuilder 
                onResult={handleResult} 
                setLoading={setLoading} 
                loading={loading}
                userProfile={userProfile}
              />
            </div>
          )}

          {activeTab === GenerationMode.BUILD_IMAGE && (
            <div className="animate-fade-in">
              <ImagePromptBuilder 
                onResult={handleResult} 
                setLoading={setLoading} 
                loading={loading} 
                userProfile={userProfile}
              />
            </div>
          )}

          {activeTab === GenerationMode.BUILD_VIDEO && (
            <div className="animate-fade-in">
              <VideoPromptBuilder 
                onResult={handleResult} 
                setLoading={setLoading} 
                loading={loading} 
                userProfile={userProfile}
              />
            </div>
          )}
          
          {activeTab === GenerationMode.IMAGE && (
            <div className="animate-fade-in">
              <MediaAnalyzer 
                mode="image" 
                onResult={handleResult} 
                setLoading={setLoading} 
                loading={loading} 
                userProfile={userProfile}
              />
            </div>
          )}

          {activeTab === GenerationMode.VIDEO && (
            <div className="animate-fade-in">
              <MediaAnalyzer 
                mode="video" 
                onResult={handleResult} 
                setLoading={setLoading} 
                loading={loading} 
                userProfile={userProfile}
              />
            </div>
          )}

          {activeTab === GenerationMode.FAVORITES && (
            <div className="animate-fade-in">
              <FavoritesList 
                favorites={favorites} 
                onDelete={deleteFavorite} 
                onSelect={selectFavorite} 
              />
            </div>
          )}

          {activeTab === GenerationMode.SETTINGS && (
            <div className="animate-fade-in">
              <ProfileSettings 
                profile={userProfile}
                onUpdate={setUserProfile}
              />
            </div>
          )}
        </div>

        {/* Loading Overlay */}
        {isGenerating && (
           <GeneratingOverlay mode={getOverlayMode()} />
        )}

        {/* Results Area */}
        {!isGenerating && result && activeTab !== GenerationMode.SETTINGS && (
          <div id="result-section" className="w-full max-w-2xl mt-8 transition-all duration-500 ease-in-out">
             <div className="flex items-center space-x-2 mb-2 px-2">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {activeTab === GenerationMode.FAVORITES ? 'Selected Prompt' : 'Result'}
                </span>
                <div className="h-px bg-slate-800 flex-grow"></div>
             </div>
             <PromptDisplay 
               result={result} 
               isFavorite={isCurrentResultFavorite()}
               onToggleFavorite={toggleFavorite}
             />
          </div>
        )}

      </main>

      <footer className="relative z-10 border-t border-slate-800 py-6 mt-auto">
        <div className="max-w-5xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} PromptMaster AI. Built with Gemini.</p>
        </div>
      </footer>

      {/* Tailwind & Custom Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .animate-fade-in-up {
          animation: fadeIn 0.6s ease-out forwards;
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slide-up {
          animation: slideUp 0.5s ease-out forwards;
        }

        @keyframes progressIndeterminate {
          0% { transform: translateX(-50%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(50%); }
        }
        .animate-progress-indeterminate {
          animation: progressIndeterminate 2s infinite linear;
        }

        @keyframes shimmerSlide {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer-slide {
          animation: shimmerSlide 2s infinite linear;
        }
        
        .scrollbar-hide::-webkit-scrollbar {
            display: none;
        }
        .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default App;
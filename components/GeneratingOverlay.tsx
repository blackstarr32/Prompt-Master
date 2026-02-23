import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface GeneratingOverlayProps {
  mode: 'text' | 'image' | 'video';
}

const GeneratingOverlay: React.FC<GeneratingOverlayProps> = ({ mode }) => {
  const [messageIndex, setMessageIndex] = useState(0);

  const messages = {
    text: [
      "Analyzing concept nuances...",
      "Expanding creative details...",
      "Applying style modifiers...",
      "Optimizing for Gemini...",
      "Finalizing prompt..."
    ],
    image: [
      "Uploading image data...",
      "Scanning visual elements...",
      "Identifying lighting & composition...",
      "Reverse-engineering prompt...",
      "Polishing details..."
    ],
    video: [
      "Processing video frames...",
      "Analyzing motion patterns...",
      "Detecting scene transitions...",
      "Constructing video prompt...",
      "Finalizing sequence..."
    ]
  };

  const currentMessages = messages[mode] || messages.text;

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % currentMessages.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [mode, currentMessages.length]);

  return (
    <div className="w-full max-w-xl mx-auto mt-8 relative animate-fade-in">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-indigo-500/10 blur-3xl rounded-full" />
      
      <div className="relative bg-slate-900/90 border border-slate-800 backdrop-blur-md rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-2xl overflow-hidden">
        
        {/* Animated Gradient Border Top */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-indigo-500 to-transparent animate-shimmer-slide" />

        {/* Spinner Icon */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-500/20 rounded-full blur-xl animate-pulse"></div>
          <div className="relative bg-slate-800 p-4 rounded-full border border-slate-700 shadow-lg z-10">
            <Sparkles className="w-6 h-6 text-indigo-400 animate-spin-slow" />
          </div>
        </div>
        
        {/* Text Steps */}
        <h3 className="text-lg font-semibold text-slate-200 mb-2">
          Gemini is thinking...
        </h3>
        
        <div className="h-6 relative w-full overflow-hidden flex justify-center">
           <p key={messageIndex} className="text-sm text-slate-400 animate-slide-up absolute w-full">
              {currentMessages[messageIndex]}
           </p>
        </div>
        
        {/* Progress Bar */}
        <div className="w-48 h-1 bg-slate-800 rounded-full mt-6 overflow-hidden relative">
          <div className="absolute inset-0 h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 w-[200%] animate-progress-indeterminate"></div>
        </div>
      </div>
    </div>
  );
};

export default GeneratingOverlay;
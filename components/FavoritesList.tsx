import React from 'react';
import { SavedPrompt } from '../types';
import { Trash2, Copy, Eye, Calendar, Hash, FolderOpen, FileJson, FileText, Printer } from 'lucide-react';
import Button from './ui/Button';

interface FavoritesListProps {
  favorites: SavedPrompt[];
  onDelete: (id: string) => void;
  onSelect: (prompt: SavedPrompt) => void;
}

const FavoritesList: React.FC<FavoritesListProps> = ({ favorites, onDelete, onSelect }) => {
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleExportJSON = () => {
    const dataStr = JSON.stringify(favorites, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prompt-master-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportCSV = () => {
    const headers = ["Title", "Prompt", "Tags", "Created At"];
    const rows = favorites.map(fav => {
      // Escape quotes by doubling them
      const title = `"${fav.title.replace(/"/g, '""')}"`;
      const prompt = `"${fav.prompt.replace(/"/g, '""')}"`;
      const tags = `"${fav.tags.join(', ').replace(/"/g, '""')}"`;
      const date = `"${new Date(fav.createdAt).toISOString()}"`;
      return [title, prompt, tags, date].join(",");
    });
    
    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `prompt-master-favorites-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert("Please allow popups to print/save as PDF");
      return;
    }

    const content = favorites.map((fav, i) => `
      <div style="margin-bottom: 30px; border-bottom: 1px solid #eee; padding-bottom: 20px; page-break-inside: avoid;">
        <h2 style="margin-bottom: 5px; font-size: 18px; color: #1e293b;">${i + 1}. ${fav.title}</h2>
        <div style="font-size: 12px; color: #64748b; margin-bottom: 10px;">
          Created: ${new Date(fav.createdAt).toLocaleDateString()}
        </div>
        <div style="font-family: monospace; background: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; color: #334155; white-space: pre-wrap; font-size: 14px; line-height: 1.5;">${fav.prompt}</div>
        <div style="font-size: 12px; color: #6366f1; margin-top: 8px; font-weight: 500;">
          Tags: ${fav.tags.join(', ')}
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <html>
        <head>
          <title>PromptMaster Favorites Export</title>
          <style>
            body { font-family: system-ui, -apple-system, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; color: #0f172a; }
            h1 { text-align: center; color: #0f172a; margin-bottom: 10px; }
            .meta { text-align: center; color: #64748b; margin-bottom: 40px; font-size: 14px; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          <h1>PromptMaster Favorites</h1>
          <p class="meta">Exported on ${new Date().toLocaleDateString()}</p>
          ${content}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Wait for content to load then print
    setTimeout(() => {
        printWindow.focus();
        printWindow.print();
        // Optional: close after print
        // printWindow.close();
    }, 500);
  };

  if (favorites.length === 0) {
    return (
      <div className="text-center py-16 px-4 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50">
        <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <FolderOpen className="w-8 h-8 text-slate-500" />
        </div>
        <h3 className="text-lg font-medium text-slate-300 mb-2">No saved prompts yet</h3>
        <p className="text-slate-500 max-w-sm mx-auto">
          Generate prompts and click the heart icon to save your favorites here for quick access.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6 animate-fade-in">
      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-center bg-slate-800/50 p-4 rounded-xl border border-slate-700 gap-4">
         <h2 className="text-lg font-semibold text-slate-200 flex items-center">
            Your Collection <span className="ml-2 bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full">{favorites.length}</span>
         </h2>
         <div className="flex space-x-2 w-full sm:w-auto">
            <Button variant="secondary" onClick={handleExportJSON} className="text-xs sm:text-sm flex-1 sm:flex-none" title="Export as JSON">
                <FileJson className="w-4 h-4 mr-2" />
                JSON
            </Button>
            <Button variant="secondary" onClick={handleExportCSV} className="text-xs sm:text-sm flex-1 sm:flex-none" title="Export as CSV">
                <FileText className="w-4 h-4 mr-2" />
                CSV
            </Button>
            <Button variant="secondary" onClick={handlePrint} className="text-xs sm:text-sm flex-1 sm:flex-none" title="Print or Save as PDF">
                <Printer className="w-4 h-4 mr-2" />
                Print / PDF
            </Button>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {favorites.map((fav) => (
          <div 
            key={fav.id} 
            className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 flex flex-col hover:border-indigo-500/30 transition-all hover:shadow-lg hover:shadow-indigo-500/5 group"
          >
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-semibold text-slate-200 truncate pr-4" title={fav.title}>
                {fav.title}
              </h3>
              <span className="flex items-center text-xs text-slate-500 whitespace-nowrap">
                <Calendar className="w-3 h-3 mr-1" />
                {formatDate(fav.createdAt)}
              </span>
            </div>

            <div className="bg-slate-900/80 rounded p-3 mb-4 flex-grow border border-slate-800/50 cursor-pointer" onClick={() => onSelect(fav)}>
              <p className="text-slate-400 text-sm line-clamp-3 font-mono leading-relaxed">
                {fav.prompt}
              </p>
            </div>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-700/50">
              <div className="flex space-x-2 overflow-hidden mr-4">
                {fav.tags?.slice(0, 2).map((tag, i) => (
                  <span key={i} className="inline-flex items-center text-[10px] text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                    <Hash className="w-2.5 h-2.5 mr-0.5" />
                    {tag}
                  </span>
                ))}
                {(fav.tags?.length || 0) > 2 && (
                  <span className="inline-flex items-center text-[10px] text-slate-500 px-1">
                    +{fav.tags!.length - 2}
                  </span>
                )}
              </div>

              <div className="flex items-center space-x-1">
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={() => onSelect(fav)}
                  title="View Full Prompt"
                >
                  <Eye className="w-4 h-4 text-indigo-400" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0" 
                  onClick={() => copyToClipboard(fav.prompt)}
                  title="Copy to Clipboard"
                >
                  <Copy className="w-4 h-4 text-slate-400 group-hover:text-slate-300" />
                </Button>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 hover:bg-red-900/20" 
                  onClick={() => onDelete(fav.id)}
                  title="Delete Favorite"
                >
                  <Trash2 className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavoritesList;
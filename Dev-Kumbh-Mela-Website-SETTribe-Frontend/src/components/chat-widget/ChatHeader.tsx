import { Sparkles, Trash2, X, Clock } from 'lucide-react';

interface ChatHeaderProps {
  onClearHistory: () => void;
  onClose: () => void;
  showClearBtn: boolean;
}

export default function ChatHeader({ onClearHistory, onClose, showClearBtn }: ChatHeaderProps) {
  return (
    <div className="p-4 bg-gradient-to-r from-orange-950/80 to-stone-950/80 border-b border-amber-500/15 flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* Glowing AI Avatar Orb */}
        <div className="relative flex items-center justify-center">
          <span className="absolute inline-flex h-10 w-10 rounded-full bg-orange-500/30 animate-ping" />
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-orange-600 to-amber-400 flex items-center justify-center shadow-md border border-amber-300/30">
            <Sparkles className="text-white w-5 h-5 animate-pulse" />
          </div>
          {/* Live Online Badge */}
          <span className="absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-stone-950" />
        </div>
        <div>
          <h3 className="font-bold text-sm text-amber-200 tracking-wide">Kumbh Companion</h3>
          <p className="text-[10px] text-amber-500 font-medium tracking-wider uppercase flex items-center gap-1">
            <Clock size={10} /> Live 2027 RAG Assistant
          </p>
        </div>
      </div>

      {/* Header Controls */}
      <div className="flex items-center gap-3">
        {showClearBtn && (
          <button 
            onClick={onClearHistory}
            title="Clear Chat History"
            className="p-2 rounded-full hover:bg-white/5 text-stone-400 hover:text-amber-500 transition-colors cursor-pointer"
          >
            <Trash2 size={16} />
          </button>
        )}
        <button 
          onClick={onClose}
          className="p-2 rounded-full hover:bg-white/5 text-stone-400 hover:text-orange-500 transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}

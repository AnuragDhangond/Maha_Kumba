import { Compass, Home, Calendar, Bus, ShieldAlert } from 'lucide-react';

interface WelcomeViewProps {
  onSuggestionClick: (prompt: string) => void;
}

export default function WelcomeView({ onSuggestionClick }: WelcomeViewProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-4">
      <div className="w-16 h-16 bg-gradient-to-b from-amber-500/10 to-orange-500/5 rounded-full flex items-center justify-center border border-amber-500/20 shadow-inner mb-4 relative">
        <div className="absolute inset-0 rounded-full bg-amber-500/5 animate-pulse" />
        <Compass size={32} className="text-amber-500" />
      </div>
      <h2 className="text-xl font-bold mb-2 text-amber-100 font-serif">Welcome, Sacred Pilgrim</h2>
      <p className="max-w-xs text-xs text-stone-400 leading-relaxed mb-6">
        I am your immersive guide for the grand Nashik Kumbh Mela 2027. Let me assist you with bathing dates, logistics, accommodation stays, or safety measures.
      </p>
      
      {/* Immersive Suggestion Chips */}
      <div className="w-full space-y-2.5">
        <p className="text-[10px] text-stone-500 font-semibold tracking-widest uppercase">Quick Inquiries</p>
        <div className="grid grid-cols-2 gap-2">
          <button 
            type="button"
            onClick={() => onSuggestionClick("Where are the premium hotel stays or tent accommodations in Sadhugram?")}
            className="p-3 text-[11px] font-medium text-amber-400/90 text-left bg-stone-900/40 hover:bg-stone-900/80 border border-amber-500/10 hover:border-amber-500/30 rounded-2xl transition-all duration-200 flex flex-col gap-1 items-start backdrop-blur-sm cursor-pointer"
          >
            <Home size={14} className="text-orange-500" />
            <span>🏨 Book Stays</span>
          </button>
          <button 
            type="button"
            onClick={() => onSuggestionClick("What are the official auspicious Shahi Snan dates?")}
            className="p-3 text-[11px] font-medium text-amber-400/90 text-left bg-stone-900/40 hover:bg-stone-900/80 border border-amber-500/10 hover:border-amber-500/30 rounded-2xl transition-all duration-200 flex flex-col gap-1 items-start backdrop-blur-sm cursor-pointer"
          >
            <Calendar size={14} className="text-amber-500" />
            <span>📅 Bathing Dates</span>
          </button>
          <button 
            type="button"
            onClick={() => onSuggestionClick("Is there a shuttle bus or transport booking service nearby?")}
            className="p-3 text-[11px] font-medium text-amber-400/90 text-left bg-stone-900/40 hover:bg-stone-900/80 border border-amber-500/10 hover:border-amber-500/30 rounded-2xl transition-all duration-200 flex flex-col gap-1 items-start backdrop-blur-sm cursor-pointer"
          >
            <Bus size={14} className="text-orange-500" />
            <span>🚌 Transport Info</span>
          </button>
          <button 
            type="button"
            onClick={() => onSuggestionClick("What are the key essential emergency medical helper services nearby?")}
            className="p-3 text-[11px] font-medium text-amber-400/90 text-left bg-stone-900/40 hover:bg-stone-900/80 border border-amber-500/10 hover:border-amber-500/30 rounded-2xl transition-all duration-200 flex flex-col gap-1 items-start backdrop-blur-sm cursor-pointer"
          >
            <ShieldAlert size={14} className="text-red-500" />
            <span>🚨 Emergency SOS</span>
          </button>
        </div>
      </div>
    </div>
  );
}

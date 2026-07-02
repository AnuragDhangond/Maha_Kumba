import { useState, useEffect } from 'react';
import { Mic, MicOff, Send } from 'lucide-react';

interface MessageInputProps {
  onSend: (text: string, isVoice?: boolean) => void;
  isLoading: boolean;
}

export default function MessageInput({ onSend, isLoading }: MessageInputProps) {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Cleanup speech recognition on unmount
    return () => {
      if (recognition) {
        recognition.stop();
      }
    };
  }, [recognition]);

  const toggleListening = () => {
    if (isListening) {
      if (recognition) {
        recognition.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Please try Google Chrome, Microsoft Edge, or Safari.");
      return;
    }

    const newRecognition = new SpeechRecognition();
    newRecognition.continuous = false;
    newRecognition.interimResults = false;
    newRecognition.lang = 'en-IN'; // Calibrated for local Indian English accent friendly recognition

    newRecognition.onstart = () => {
      setIsListening(true);
    };

    newRecognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
      if (transcript.trim()) {
        onSend(transcript, true);
        setInput('');
      }
    };

    newRecognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      setIsListening(false);
    };

    newRecognition.onend = () => {
      setIsListening(false);
    };

    newRecognition.start();
    setRecognition(newRecognition);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSend(input, false);
      setInput('');
      if (isListening && recognition) {
        recognition.stop();
      }
    }
  };

  return (
    <div className="p-4 bg-gradient-to-t from-stone-950 to-stone-900/90 border-t border-amber-500/15">
      <form 
        onSubmit={handleSubmit} 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#0c0a09',
          border: '1px solid rgba(245, 158, 11, 0.2)',
          borderRadius: '9999px',
          padding: '6px 6px 6px 16px',
          boxShadow: 'inset 0 2px 4px 0 rgba(0,0,0,0.06)',
          width: '100%',
          boxSizing: 'border-box',
          margin: 0
        }}
        className="flex items-center gap-2 bg-stone-950 border border-amber-500/20 focus-within:border-amber-500/50 rounded-full p-1.5 pl-4 shadow-inner focus-within:ring-2 focus-within:ring-orange-500/20 transition-all duration-300"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={isListening ? "Listening, speak now..." : "Ask Pilgrim Companion..."}
          disabled={isLoading}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            boxShadow: 'none',
            height: 'auto',
            padding: '8px 0',
            margin: 0,
            width: '100%',
            color: '#f5f5f4',
            fontSize: '14px',
            fontFamily: 'inherit'
          }}
          className="flex-1 bg-transparent border-none text-stone-100 text-sm placeholder-stone-500 focus:ring-0 outline-none pr-2 disabled:cursor-not-allowed font-medium tracking-wide"
        />
        <div className="flex items-center gap-1.5 pr-1" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          <button 
            type="button" 
            onClick={toggleListening}
            title={isListening ? "Stop Listening" : "Voice Typing (STT)"}
            style={{
              padding: '8px',
              borderRadius: '9999px',
              border: 'none',
              background: isListening ? 'rgba(249, 115, 22, 0.2)' : 'transparent',
              color: isListening ? '#f97316' : '#78716c',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              transition: 'all 0.3s ease',
              margin: 0,
              boxShadow: 'none',
              flexShrink: 0
            }}
            className={`p-2 rounded-full transition-all duration-300 relative cursor-pointer flex items-center justify-center ${
              isListening 
                ? 'bg-orange-500/20 text-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-110' 
                : 'hover:bg-white/5 text-stone-500 hover:text-amber-500'
            }`}
          >
            {isListening ? (
              <>
                <MicOff size={16} className="text-orange-500 animate-pulse" />
                <span className="absolute inset-0 rounded-full border border-orange-500/40 animate-ping pointer-events-none" />
              </>
            ) : (
              <Mic size={16} />
            )}
          </button>
          <button 
            type="submit"
            disabled={!input.trim() || isLoading}
            style={{
              background: (!input.trim() || isLoading) ? '#1c1917' : 'linear-gradient(to right, #ea580c, #f59e0b)',
              color: (!input.trim() || isLoading) ? '#78716c' : '#0c0a09',
              padding: '10px',
              borderRadius: '9999px',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: (!input.trim() || isLoading) ? 'not-allowed' : 'pointer',
              opacity: 1,
              width: '36px',
              height: '36px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              transition: 'all 0.3s ease',
              margin: 0,
              flexShrink: 0
            }}
            className="bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 disabled:from-stone-900 disabled:to-stone-850 disabled:text-stone-600 text-stone-950 p-2.5 rounded-full transition-all duration-300 shadow-md flex items-center justify-center disabled:cursor-not-allowed transform active:scale-95 cursor-pointer"
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
}

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { motion } from 'framer-motion';
import { ShieldAlert, Phone, ExternalLink, Volume2, VolumeX } from 'lucide-react';
import type { Message } from './types';
import { parseMessageContent, isEmergencyMessage } from './chatUtils';
import Swal from 'sweetalert2';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const parsed = isUser 
    ? { text: message.content, action: undefined } 
    : (message.action 
       ? { text: message.content, action: message.action } 
       : parseMessageContent(message.content));
  const isEmergency = !isUser && isEmergencyMessage(parsed.text, parsed.action);
  const [isSpeaking, setIsSpeaking] = useState(false);

  useEffect(() => {
    // Stop reading when component unmounts to prevent orphaned audio playing
    return () => {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, [isSpeaking]);


  const stripMarkdown = (text: string) => {
    return text
      .replace(/(\*\*|__)(.*?)\1/g, '$2') // bold
      .replace(/(\*|_)(.*?)\1/g, '$2') // italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1') // links
      .replace(/#+\s*(.*?)\n/g, '$1\n') // headers
      .replace(/`{3}[\s\S]*?`{3}/g, '') // block code
      .replace(/`(.+?)`/g, '$1') // inline code
      .trim();
  };

  const handleSpeak = () => {
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    // Cancel any active speech globally
    window.speechSynthesis.cancel();

    const cleanText = stripMarkdown(parsed.text);
    const utterance = new SpeechSynthesisUtterance(cleanText);

    // Attempt to match premium local English-India or Hindi voices
    const voices = window.speechSynthesis.getVoices();
    const indianVoice = voices.find(v => v.lang.startsWith('en-IN')) || voices.find(v => v.lang.startsWith('hi-IN'));
    if (indianVoice) {
      utterance.voice = indianVoice;
    }

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = (e) => {
      console.error('Speech synthesis synthesis error:', e);
      setIsSpeaking(false);
    };

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    if (message.role === 'assistant' && message.autoPlay) {
      const timer = setTimeout(() => {
        handleSpeak();
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? 'justify-end' : 'justify-start'} group`}
    >
      {/* Saffron & Dark Immersive Bubbles */}
      <div 
        className={`relative max-w-[85%] p-4 rounded-3xl break-words overflow-hidden ${
          isUser 
            ? 'bg-gradient-to-tr from-orange-600 to-amber-500 text-white rounded-br-sm shadow-md' 
            : isEmergency
              ? 'bg-gradient-to-r from-red-950/80 via-stone-950/90 to-red-950/80 border border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0.15)] rounded-bl-sm'
              : 'bg-stone-950/80 backdrop-blur-md border border-amber-500/20 rounded-bl-sm shadow-xl shadow-black/40'
        }`}
      >

        {isUser ? (
          <div className="whitespace-pre-wrap text-sm leading-relaxed">{parsed.text}</div>
        ) : (
          <div className="space-y-3">
            {/* Emergency SOS Header Accent */}
            {isEmergency && (
              <div className="flex items-center gap-2 text-red-400 font-bold text-xs uppercase tracking-widest pb-1 border-b border-red-500/20">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <ShieldAlert size={14} />
                Pilgrim Emergency SOS Alert
              </div>
            )}

            <div className="flex justify-between items-start gap-4">
              <div className="text-stone-100 text-sm font-medium tracking-wide leading-relaxed select-text flex-1">
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // @ts-ignore
                    p: ({node, ...props}) => <p {...props} className="mb-3 last:mb-0 text-stone-100 font-medium tracking-wide leading-relaxed" />,
                    // @ts-ignore
                    li: ({node, ...props}) => <li {...props} className="text-stone-200 font-medium tracking-wide list-disc list-inside ml-2 my-1" />,
                    // @ts-ignore
                    ul: ({node, ...props}) => <ul {...props} className="my-2 space-y-1" />,
                    // @ts-ignore
                    ol: ({node, ...props}) => <ol {...props} className="my-2 list-decimal list-inside space-y-1" />,
                    strong: ({node, ...props}) => <strong {...props} className="text-amber-300 font-bold" />,
                    h1: ({node, ...props}) => <h1 {...props} className="text-lg font-bold text-amber-200 mt-4 mb-2 font-serif" />,
                    h2: ({node, ...props}) => <h2 {...props} className="text-base font-bold text-amber-200 mt-3.5 mb-1.5 font-serif" />,
                    h3: ({node, ...props}) => <h3 {...props} className="text-sm font-bold text-amber-300 mt-3 mb-1 font-serif" />,
                    a: ({node, ...props}) => <a {...props} target="_blank" rel="noopener noreferrer" className="text-amber-400 hover:text-amber-300 font-bold underline decoration-amber-500/30 hover:decoration-amber-400 transition-all" />
                  }}
                >
                  {parsed.text}
                </ReactMarkdown>
              </div>
              <button 
                type="button" 
                onClick={handleSpeak}
                title={isSpeaking ? "Stop Reading" : "Read Aloud (TTS)"}
                className={`p-2 rounded-full border transition-all duration-300 transform active:scale-95 cursor-pointer flex-shrink-0 ${
                  isSpeaking 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.3)] scale-105' 
                    : 'bg-stone-900/40 text-stone-500 border-stone-850 hover:bg-stone-900 hover:text-amber-500'
                }`}
              >
                {isSpeaking ? <VolumeX size={14} className="animate-pulse" /> : <Volume2 size={14} />}
              </button>
            </div>
            
            {/* Dynamic Action Card Rendering */}
            {parsed.action && (
              <div className={`mt-4 pt-3 border-t flex flex-col md:flex-row gap-2 justify-between items-center ${
                isEmergency ? 'border-red-500/20' : 'border-amber-500/10'
              }`}>
                <div className="text-[10px] text-stone-400 font-medium leading-tight">
                  {isEmergency ? "📞 Dial direct helper services now" : "✨ Secure official website booking"}
                </div>
                <a
                  href={parsed.action.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center justify-center px-4 py-2.5 font-bold rounded-2xl text-xs shadow-md transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 ${
                    isEmergency 
                      ? 'bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-400 text-white shadow-red-950/40' 
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-stone-950 shadow-orange-950/30'
                  }`}
                >
                  {parsed.action.label || (isEmergency ? 'Call Emergency Support' : 'Proceed Online')}
                  {isEmergency ? <Phone size={13} className="ml-2" /> : <ExternalLink size={13} className="ml-2" />}
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}

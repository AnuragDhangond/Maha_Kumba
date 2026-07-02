import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, MapPinOff, MessageSquare, X, Compass } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import ChatHeader from './ChatHeader';
import WelcomeView from './WelcomeView';
import ChatMessage from './ChatMessage';
import MessageInput from './MessageInput';
import type { Message } from './types';

const isDev = (import.meta as any).env.DEV;
const API_URL = isDev
  ? '/chatbot-api'
  : ((import.meta as any).env.VITE_CHATBOT_API_URL);

export default function KumbhCompanion() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false); // Collapsible floating widget state
  const [sessionId, setSessionId] = useState<string | null>(null);
  
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isOpen]);

  // Request user coordinates on component mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationError(null);
        },
        (error) => {
          setLocationError(error.message);
        }
      );
    } else {
      setLocationError('Geolocation not supported');
    }
    
    // Restore past conversational history from localStorage
    const storedMessages = localStorage.getItem('kumbh_chat_history');
    if (storedMessages) {
      try {
        setMessages(JSON.parse(storedMessages));
      } catch (e) {
        console.error('Failed to parse chat history', e);
      }
    }

    // Restore session ID or generate one if not present
    let storedSessionId = localStorage.getItem('kumbh_session_id');
    if (!storedSessionId) {
      storedSessionId = 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
      localStorage.setItem('kumbh_session_id', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);


  const handleClearHistory = () => {
    setMessages([]);
    const newSessionId = 'session_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now().toString(36);
    setSessionId(newSessionId);
    localStorage.removeItem('kumbh_chat_history');
    localStorage.setItem('kumbh_session_id', newSessionId);
  };

  const handleSend = async (textToSend: string, isVoice = false) => {
    if (!textToSend.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    localStorage.setItem('kumbh_chat_history', JSON.stringify(updatedMessages));
    
    setIsLoading(true);

    const botMsgId = (Date.now() + 1).toString();

    try {
      // Call Integrated Backend /chat endpoint
      const response = await axios.post(`${API_URL}/chat`, {
        session_id: sessionId || undefined,
        query: userMsg.content,
        latitude: location?.lat,
        longitude: location?.lng
      });

      const responseText = response.data.response || "Namaste. I couldn't retrieve that information right now.";
      const followups = response.data.followups || [];
      const action = response.data.action;

      const botMsg: Message = {
        id: botMsgId,
        role: 'assistant',
        content: responseText,
        action: action,
        followups: followups,
        autoPlay: isVoice
      };

      const finalMessages = [...updatedMessages, botMsg];
      setMessages(finalMessages);

      // Strip autoPlay parameter before storing in localStorage to avoid repeating speech on reload
      const historyToSave = finalMessages.map(({ autoPlay, ...rest }) => rest);
      localStorage.setItem('kumbh_chat_history', JSON.stringify(historyToSave));

    } catch (error) {
      console.error('API client error:', error);
      const errMsg: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: "Sorry pilgrim, I'm having trouble connecting to the server. Please check your internet connection and try again."
      };
      
      const finalMessages = [...updatedMessages, errMsg];
      setMessages(finalMessages);
      localStorage.setItem('kumbh_chat_history', JSON.stringify(finalMessages));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      style={{ zIndex: 999999 }}
      className={`kumbh-companion-root ${isOpen ? 'is-open' : ''} fixed bottom-6 right-6 z-[999999] flex flex-col items-end gap-4 pointer-events-auto`}
    >
      
      {/* Expanded Immersive Chat Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="kumbh-companion-panel w-[420px] max-w-[95vw] h-[680px] max-h-[85vh] rounded-3xl bg-gradient-to-b from-stone-950/95 via-stone-900/90 to-stone-950/95 border border-amber-500/20 shadow-[0_0_50px_rgba(249,115,22,0.15)] flex flex-col overflow-hidden backdrop-blur-xl"
          >
            {/* Modular Header */}
            <ChatHeader 
              onClose={() => setIsOpen(false)}
              onClearHistory={handleClearHistory}
              showClearBtn={messages.length > 0}
            />

            {/* Scrollable Message Box */}
            <div className="flex-1 overflow-y-auto p-4 bg-stone-950/40 space-y-4 scrollbar-thin scrollbar-thumb-amber-500/10">
              {messages.length === 0 ? (
                <WelcomeView onSuggestionClick={handleSend} />
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                </div>
              )}
              
              {/* Saffron Pulsing Loading Bar */}
              {isLoading && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-stone-900/50 border border-amber-500/10 p-4 rounded-3xl rounded-bl-sm shadow-md flex gap-1.5 items-center">
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2.5 h-2.5 bg-amber-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2.5 h-2.5 bg-orange-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}

              {/* Follow-up suggestions */}
              {!isLoading && messages.length > 0 && messages[messages.length - 1].role === 'assistant' && messages[messages.length - 1].followups && messages[messages.length - 1].followups!.length > 0 && (
                <div className="flex flex-wrap gap-2 justify-start mt-2">
                  {messages[messages.length - 1].followups!.map((followup, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleSend(followup)}
                      className="px-3 py-1.5 text-xs text-amber-400 bg-stone-900/60 border border-amber-500/10 hover:border-amber-500/30 rounded-full transition-all duration-200 cursor-pointer hover:bg-stone-900 text-left font-medium"
                    >
                      {followup}
                    </motion.button>
                  ))}
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* GPS Location Tracker Connected Badge */}
            <div className="px-4 py-2 bg-stone-950 border-t border-amber-500/10 flex items-center justify-between text-[11px]">
              <div className="kumbh-companion-location-status flex items-center gap-1.5 text-stone-400 font-medium">
                {location ? (
                  <>
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <MapPin size={12} className="text-emerald-500" />
                    <span>Location Connected ({location.lat.toFixed(3)}, {location.lng.toFixed(3)})</span>
                  </>
                ) : (
                  <>
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    <MapPinOff size={12} className="text-rose-500" />
                    <span>{locationError || "Location Offline (Deny)"}</span>
                  </>
                )}
              </div>
              <div className="kumbh-companion-location-label text-[10px] text-amber-500/80 font-bold uppercase tracking-wider">
                Nashik Mela Ground
              </div>
            </div>

            {/* Message Input Capsule */}
            <MessageInput onSend={handleSend} isLoading={isLoading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Toggle Launcher Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        className="kumbh-companion-launcher relative w-16 h-16 cursor-pointer overflow-visible select-none focus:outline-none rounded-full z-[999999]"
      >
        <AnimatePresence mode="wait">
          {!isOpen ? (
            <motion.div
              key="launcher-closed"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ 
                opacity: 1,
                scale: [1, 1.03, 1]
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                opacity: { duration: 0.2 },
                scale: { repeat: Infinity, duration: 5, ease: "easeInOut" }
              }}
              className="relative w-16 h-16 flex items-center justify-center rounded-full bg-stone-900/40 backdrop-blur-md text-white shadow-[0_0_15px_rgba(249,115,22,0.35),0_0_30px_rgba(245,158,11,0.15)] overflow-visible"
            >
              {/* Faint rotating outer aura */}
              <motion.div
                className="absolute -inset-1.5 rounded-full bg-gradient-to-tr from-[#f97316]/20 via-transparent to-[#f59e0b]/20 blur-sm pointer-events-none opacity-60"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 12, ease: "linear" }}
              />

              {/* Saffron Gradient Ring */}
              <div className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-br from-[#f97316] to-[#f59e0b] pointer-events-none">
                <div className="w-full h-full rounded-full bg-stone-900/40 backdrop-blur-md" />
              </div>

              {/* Subtle Saffron Radial Gradient */}
              <div 
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, rgba(245,158,11,0.12) 50%, transparent 100%)'
                }}
              />

              {/* Saffron glass circle for center icon */}
              <div className="relative w-11 h-11 rounded-full flex items-center justify-center bg-[#f97316]/25 border border-[#f97316]/40 backdrop-blur-sm shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.25)] z-10">
                {/* Saffron Tilak Accent */}
                <span className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[2px] h-[5px] rounded-full bg-[#f97316] shadow-[0_0_4px_rgba(249,115,22,0.8)]" />
                <Compass className="w-6 h-6 text-white filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.4)]" />
              </div>
              
              {/* Notification Badge */}
              <span className="absolute top-1 right-1 h-[14px] min-w-[20px] px-1 rounded-full bg-[#10b981] border border-stone-950 flex items-center justify-center text-[7px] font-black text-white shadow-sm select-none z-20">
                AI
              </span>
            </motion.div>
          ) : (
            <motion.div
              key="launcher-open"
              initial={{ opacity: 0, scale: 0.8, rotate: 45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.8, rotate: -45 }}
              transition={{ duration: 0.2 }}
              className="relative w-16 h-16 flex items-center justify-center rounded-full bg-stone-900/40 backdrop-blur-md text-white shadow-[0_0_15px_rgba(249,115,22,0.35),0_0_30px_rgba(245,158,11,0.15)]"
            >
              {/* Saffron Gradient Ring */}
              <div className="absolute inset-0 rounded-full p-[1.5px] bg-gradient-to-br from-[#f97316] to-[#f59e0b] pointer-events-none">
                <div className="w-full h-full rounded-full bg-stone-900/40 backdrop-blur-md" />
              </div>
              <X className="w-6 h-6 text-white filter drop-shadow-[0_1.5px_3px_rgba(0,0,0,0.4)] z-10" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>

    </div>
  );
}

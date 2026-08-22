import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import {
  IconMessageSquare,
  IconSend,
  IconHeadphones,
  IconClose,
  IconSparkles,
  IconCheckCircle,
  IconUser,
  IconCrown,
} from './icons/Icons';
import {
  getOrCreateThreadForUser,
  addUserMessageToThread,
  SUPPORT_UPDATE_EVENT,
  SupportMessage,
} from '../utils/supportStorage';

export const SupportChatWidget: React.FC = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<SupportMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [threadId, setThreadId] = useState<string>('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Load thread and listen for updates
  const syncThread = () => {
    const thread = getOrCreateThreadForUser(user?.id, user?.username, user?.email);
    setThreadId(thread.id);
    setMessages(thread.messages || []);
  };

  useEffect(() => {
    syncThread();

    const handleUpdate = () => {
      syncThread();
    };

    window.addEventListener(SUPPORT_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(SUPPORT_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, [user]);

  // Scroll to bottom on new message
  useEffect(() => {
    if (isOpen) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setUnreadCount(0);
    }
  }, [messages, isOpen]);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const currentUserName = user ? user.username : 'زائر الاستوديو';
    const currentUserEmail = user ? user.email : 'guest@drfonts.local';
    const activeThreadId = threadId || `thread_${user?.id || 'guest_user'}`;

    addUserMessageToThread(activeThreadId, text, currentUserName, currentUserEmail);
    if (!textToSend) setInput('');
    syncThread();
  };

  const quickQuestions = [
    'كيفية تصدير خط ملف OTF/TTF؟',
    'استفسار عن تراكيب الخط والبدائل',
    'طلب دعم تقني في قواعد GSUB',
  ];

  return (
    <div className="fixed bottom-20 left-4 sm:left-6 z-50">
      {/* Chat Window Popup */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            className="mb-4 w-[92vw] sm:w-[380px] h-[500px] max-h-[75vh] liquid-glass-card shadow-2xl flex flex-col overflow-hidden border border-white/80"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-sky-600/90 via-sky-700/90 to-indigo-800/90 text-white flex items-center justify-between border-b border-white/20 relative backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/40 shadow-inner">
                    <IconHeadphones size={22} className="text-white" />
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-400 border-2 border-sky-700 shadow-sm" />
                </div>

                <div>
                  <h3 className="font-heading font-bold text-sm text-white flex items-center gap-1.5">
                    <span>الدعم الفني المباشر</span>
                    <span className="px-1.5 py-0.5 rounded-full bg-amber-400/25 border border-amber-300/40 text-amber-200 text-[10px] font-bold">
                      فريق الإدارة
                    </span>
                  </h3>
                  <p className="text-[11px] text-sky-100/90 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                    <span>جاهزون لمساعدتك بأسرع وقت</span>
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10"
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* Quick Chips */}
            <div className="px-3 py-2.5 bg-white/40 backdrop-blur-md border-b border-white/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
              <span className="text-slate-500 font-bold whitespace-nowrap ml-1">أسئلة شائعة:</span>
              {quickQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(q)}
                  className="px-2.5 py-1 rounded-xl liquid-glass-button text-slate-800 whitespace-nowrap hover:text-sky-700 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs bg-white/30 backdrop-blur-md">
              {messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1`}
                  >
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 px-1">
                      {!isUser && <IconCrown size={12} className="text-amber-500" />}
                      <span className="font-bold text-slate-700">{msg.senderName}</span>
                      <span>•</span>
                      <span>{msg.timestamp}</span>
                    </div>

                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl leading-relaxed ${
                        isUser
                          ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tl-none shadow-md shadow-sky-600/20 border border-white/20'
                          : 'liquid-glass-badge text-slate-900 rounded-tr-none border border-white/80'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white/50 backdrop-blur-xl border-t border-white/70 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="اكتب استفسارك أو طلبك هنا..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="flex-1 px-3.5 py-2.5 rounded-2xl liquid-glass-input text-xs text-slate-900 focus:outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold transition-all shadow-md shadow-sky-500/20 border border-white/20"
              >
                <IconSend size={16} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Trigger Button */}
      <motion.button
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => {
          setIsOpen(!isOpen);
          setUnreadCount(0);
        }}
        className="relative group p-3.5 rounded-full bg-gradient-to-r from-sky-500 via-sky-600 to-indigo-600 text-white shadow-xl shadow-sky-500/30 border border-white/30 flex items-center justify-center transition-all"
      >
        <span className="absolute inset-0 rounded-full bg-sky-400/40 animate-ping opacity-75 group-hover:opacity-100" />
        <IconMessageSquare size={24} className="relative z-10 text-white" />

        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white">
            {unreadCount}
          </span>
        )}
      </motion.button>
    </div>
  );
};

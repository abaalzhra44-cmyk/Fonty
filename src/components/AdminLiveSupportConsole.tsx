import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  IconHeadphones,
  IconMessageSquare,
  IconSend,
  IconSearch,
  IconCheckCircle,
  IconClock,
  IconUser,
  IconCrown,
  IconSparkles,
  IconTrash,
  IconRefresh,
  IconCheck,
  IconShield,
  IconDownload,
  IconHandWave,
  IconFileCode,
  IconHelpCircle,
  IconLock,
} from './icons/Icons';
import {
  SupportThread,
  SupportMessage,
  getSupportThreads,
  addAdminReplyToThread,
  updateThreadStatus,
  markThreadAsReadByAdmin,
  deleteSupportThread,
  SUPPORT_UPDATE_EVENT,
  saveSupportThreads,
  exportThreadToTxt,
  updateAdminNotes,
} from '../utils/supportStorage';

export const AdminLiveSupportConsole: React.FC = () => {
  const [threads, setThreads] = useState<SupportThread[]>([]);
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'open' | 'resolved'>('all');
  const [senderPersona, setSenderPersona] = useState<'drfont' | 'team'>('drfont');
  const [showNotes, setShowNotes] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Load threads and listen to live events
  const loadData = () => {
    const data = getSupportThreads();
    setThreads(data);

    // Auto-select first thread if none selected
    if (!selectedThreadId && data.length > 0) {
      setSelectedThreadId(data[0].id);
      markThreadAsReadByAdmin(data[0].id);
    }
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => {
      const data = getSupportThreads();
      setThreads(data);
    };

    window.addEventListener(SUPPORT_UPDATE_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener(SUPPORT_UPDATE_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  // Scroll active chat to bottom on thread or messages change
  const selectedThread = threads.find((t) => t.id === selectedThreadId);

  useEffect(() => {
    if (selectedThread) {
      chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
      setNoteInput(selectedThread.adminNotes || '');
    }
  }, [selectedThread?.messages?.length, selectedThreadId, selectedThread?.adminNotes]);

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    markThreadAsReadByAdmin(id);
    const updated = getSupportThreads();
    setThreads(updated);
    const target = updated.find((t) => t.id === id);
    setNoteInput(target?.adminNotes || '');
  };

  const handleSaveNotes = () => {
    if (!selectedThreadId) return;
    const updated = updateAdminNotes(selectedThreadId, noteInput);
    setThreads(updated);
  };

  const handleExportCurrentThread = () => {
    if (selectedThread) {
      exportThreadToTxt(selectedThread);
    }
  };

  const handleSendReply = (customText?: string) => {
    if (!selectedThreadId) return;
    const text = (customText || replyText).trim();
    if (!text) return;

    const name = senderPersona === 'drfont' ? 'Dr Font (المطور الرئيسي)' : 'فريق الدعم والتحكم';
    const role = senderPersona === 'drfont' ? 'المطور الرئيسي' : 'إدارة الدعم';

    const updated = addAdminReplyToThread(selectedThreadId, text, name, role);
    setThreads(updated);
    if (!customText) setReplyText('');
  };

  const handleStatusChange = (status: 'open' | 'pending' | 'resolved') => {
    if (!selectedThreadId) return;
    const updated = updateThreadStatus(selectedThreadId, status);
    setThreads(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('هل أنت متأكد من رغبتك في حذف هذه المحادثة بالكامل؟')) {
      const updated = deleteSupportThread(id);
      setThreads(updated);
      if (selectedThreadId === id) {
        setSelectedThreadId(updated[0]?.id || null);
      }
    }
  };

  const handleSimulateNewUserQuery = () => {
    const sampleQueries = [
      'كيف أقوم بتفعيل قواعد البدائل السياقية (swsh) في استوديو الخطوط؟',
      'عندي مشكلة في تصدير التباعد kerning على نظام ويندوز.',
      'هل الاستوديو يدعم رسم محارف الخط الكوفي بنظام المتجهات Vector SVG؟',
      'استفسار عن تفعيل تراخيص الخطوط للأنظمة والشبكات.',
    ];
    const randomQuery = sampleQueries[Math.floor(Math.random() * sampleQueries.length)];
    const id = `thread_sim_${Date.now()}`;
    const newThread: SupportThread = {
      id,
      userName: `مستخدم تجريبي ${Math.floor(Math.random() * 90) + 10}`,
      userEmail: `user${Date.now()}@drfonts.com`,
      userRole: 'مصمم خطوط',
      status: 'pending',
      unreadCount: 1,
      lastMessage: randomQuery,
      updatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          id: `msg_${Date.now()}`,
          sender: 'user',
          senderName: 'مستخدم تجريبي',
          text: randomQuery,
          timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
    };

    const updated = [newThread, ...threads];
    saveSupportThreads(updated);
    setThreads(updated);
    setSelectedThreadId(id);
  };

  // Filter threads
  const filteredThreads = threads.filter((t) => {
    const matchesSearch =
      t.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.userEmail && t.userEmail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      t.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (statusFilter === 'all') return true;
    return t.status === statusFilter;
  });

  const totalCount = threads.length;
  const pendingCount = threads.filter((t) => t.status === 'pending').length;
  const resolvedCount = threads.filter((t) => t.status === 'resolved').length;
  const openCount = threads.filter((t) => t.status === 'open').length;

  const quickTemplates = [
    { label: 'ترحيب واستلام', text: 'أهلاً بك! تم استلام استفسارك بنجاح وجاري فحصه من قبل المطور الرئيسي Dr Font.' },
    { label: 'طلب ملفات SVG', text: 'يرجى تزويدنا بنموذج للمحارف أو ملف SVG لمعاينة التراكيب المطلوبة بوضوح.' },
    { label: 'تم الفحص والحل', text: 'تم تحديث قواعد GSUB وجداول التباعد لخطك بنجاح! يمكنك إعادة التصدير الآن.' },
    { label: 'إغلاق الاستفسار', text: 'يسعدنا خدمتك دائماً! تم حل الاستفسار وإغلاق التذكرة بنجاح.' },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top Banner & Quick Metrics */}
      <div className="liquid-glass-card rounded-3xl p-6 text-slate-900 shadow-2xl relative overflow-hidden border border-white/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full liquid-glass-badge text-sky-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>شاشة البث الحي المباشر للإدارة والمطور</span>
            </div>
            <h2 className="font-heading font-black text-xl sm:text-2xl text-slate-900 flex items-center gap-2">
              <IconHeadphones size={24} className="text-sky-600" />
              <span>مركز الرد على استفسارات وأسئلة المستخدمين</span>
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              تتيح للمطور Dr Font والإدارة مشاهدة رسائل واستفسارات المستخدمين والرد عليها مباشرة وحصرياً.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleSimulateNewUserQuery}
              className="px-3.5 py-2 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/40 text-amber-800 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            >
              <IconSparkles size={15} className="text-amber-600" />
              <span>محاكاة استفسار جديد</span>
            </button>

            <button
              onClick={loadData}
              className="px-3.5 py-2 rounded-2xl liquid-glass-button text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <IconRefresh size={15} />
              <span>تحديث البيانات</span>
            </button>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-white/60 relative z-10 text-xs">
          <div className="p-3.5 rounded-2xl liquid-glass-badge border border-white/80 flex items-center justify-between">
            <div>
              <p className="text-slate-600 font-medium text-[11px]">إجمالي المحادثات</p>
              <p className="text-xl font-black font-mono text-slate-900">{totalCount}</p>
            </div>
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-700">
              <IconMessageSquare size={18} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl liquid-glass-badge border border-amber-400/40 flex items-center justify-between">
            <div>
              <p className="text-amber-800 font-bold text-[11px]">في انتظار الرد</p>
              <p className="text-xl font-black font-mono text-amber-800">{pendingCount}</p>
            </div>
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-600 animate-pulse">
              <IconCrown size={18} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl liquid-glass-badge border border-sky-400/40 flex items-center justify-between">
            <div>
              <p className="text-sky-800 font-bold text-[11px]">محادثات جارية</p>
              <p className="text-xl font-black font-mono text-sky-800">{openCount}</p>
            </div>
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-700">
              <IconHeadphones size={18} />
            </div>
          </div>

          <div className="p-3.5 rounded-2xl liquid-glass-badge border border-emerald-400/40 flex items-center justify-between">
            <div>
              <p className="text-emerald-800 font-bold text-[11px]">تم الإجابة والحل</p>
              <p className="text-xl font-black font-mono text-emerald-800">{resolvedCount}</p>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-600">
              <IconCheckCircle size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Console Layout: Threads List + Live Chat Room */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[700px] lg:h-[820px]">
        {/* Left Column: Threads Sidebar (4 cols) */}
        <div className="lg:col-span-4 liquid-glass-card rounded-3xl border border-white/80 shadow-xl flex flex-col overflow-hidden">
          {/* Search & Filters */}
          <div className="p-3.5 border-b border-white/60 space-y-2.5">
            <div className="relative">
              <input
                type="text"
                placeholder="بحث عن مستخدم أو سؤال..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
              />
              <IconSearch size={16} className="absolute right-2.5 top-2.5 text-slate-400" />
            </div>

            {/* Status Filter Chips */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar text-[11px]">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'pending', label: 'معلق' },
                { id: 'open', label: 'نشط' },
                { id: 'resolved', label: 'محلول' },
              ].map((f) => (
                <button
                  key={f.id}
                  onClick={() => setStatusFilter(f.id as any)}
                  className={`px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-all ${
                    statusFilter === f.id
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-xs border border-white/20'
                      : 'liquid-glass-button text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Threads Scrollable List */}
          <div className="flex-1 overflow-y-auto divide-y divide-white/40 p-1.5 space-y-1">
            {filteredThreads.length === 0 ? (
              <div className="p-6 text-center text-slate-400 space-y-2">
                <IconMessageSquare size={28} className="mx-auto text-slate-300" />
                <p className="text-xs">لا توجد محادثات تطابق البحث أو الفلتر المختار.</p>
              </div>
            ) : (
              filteredThreads.map((t) => {
                const isSelected = t.id === selectedThreadId;
                return (
                  <div
                    key={t.id}
                    onClick={() => handleSelectThread(t.id)}
                    className={`p-3 rounded-2xl cursor-pointer transition-all flex items-start gap-2.5 ${
                      isSelected
                        ? 'bg-sky-500/20 border border-sky-400/50 shadow-md shadow-sky-500/10'
                        : 'hover:bg-white/40 border border-transparent'
                    }`}
                  >
                    {/* User Avatar */}
                    <div className="relative flex-shrink-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shadow-xs border border-white/20">
                        {t.userName ? t.userName.charAt(0).toUpperCase() : 'U'}
                      </div>
                      <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                    </div>

                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <h4 className="font-heading font-bold text-xs text-slate-900 truncate">
                          {t.userName}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">{t.updatedAt}</span>
                      </div>

                      <p className="text-[11px] text-slate-600 truncate font-medium">
                        {t.lastMessage}
                      </p>

                      <div className="flex items-center justify-between pt-0.5 text-[10px]">
                        <span className="text-slate-500 font-mono">{t.userRole || 'عضو'}</span>

                        {t.status === 'pending' && (
                          <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-800 font-bold border border-amber-400/40 text-[9px] flex items-center gap-1">
                            <IconClock size={10} />
                            <span>معلق</span>
                          </span>
                        )}
                        {t.status === 'open' && (
                          <span className="px-2 py-0.5 rounded-full bg-sky-500/15 text-sky-800 font-bold border border-sky-400/40 text-[9px] flex items-center gap-1">
                            <IconMessageSquare size={10} />
                            <span>نشط</span>
                          </span>
                        )}
                        {t.status === 'resolved' && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 font-bold border border-emerald-400/40 text-[9px] flex items-center gap-1">
                            <IconCheckCircle size={10} />
                            <span>محلول</span>
                          </span>
                        )}
                      </div>
                    </div>

                    {t.unreadCount > 0 && (
                      <span className="w-4 h-4 rounded-full bg-rose-500 text-white font-bold text-[10px] flex items-center justify-center flex-shrink-0 shadow-xs">
                        {t.unreadCount}
                      </span>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Live Chat Room (8 cols) */}
        <div className="lg:col-span-8 liquid-glass-card rounded-3xl border border-white/80 shadow-2xl flex flex-col overflow-hidden">
          {selectedThread ? (
            <>
              {/* Active Thread Header */}
              <div className="p-4 border-b border-white/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs border border-white/20">
                    {selectedThread.userName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                      <span>{selectedThread.userName}</span>
                      <span className="px-2 py-0.5 rounded-full liquid-glass-badge text-sky-800 text-[10px] font-bold">
                        {selectedThread.userRole || 'مستخدم'}
                      </span>
                    </h3>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {selectedThread.userEmail || 'غير محدد'} • المعرف: {selectedThread.id}
                    </p>
                  </div>
                </div>

                {/* Status Action Buttons */}
                <div className="flex items-center gap-1.5 text-xs">
                  <button
                    onClick={handleExportCurrentThread}
                    className="px-2.5 py-1.5 rounded-xl liquid-glass-button text-sky-700 font-bold flex items-center gap-1 transition-all"
                    title="تصدير السجل كملف نصي"
                  >
                    <IconDownload size={14} />
                    <span>تصدير السجل</span>
                  </button>

                  <button
                    onClick={() => setShowNotes(!showNotes)}
                    className={`px-2.5 py-1.5 rounded-xl font-bold flex items-center gap-1 transition-all ${
                      showNotes || selectedThread.adminNotes
                        ? 'bg-amber-500/20 text-amber-800 border border-amber-400/50'
                        : 'liquid-glass-button text-slate-700'
                    }`}
                    title="ملاحظات المطور الإدارية المخبأة"
                  >
                    <IconShield size={14} />
                    <span>الملاحظات</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('resolved')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                      selectedThread.status === 'resolved'
                        ? 'bg-emerald-600 text-white shadow-xs border border-white/20'
                        : 'bg-emerald-500/15 text-emerald-800 hover:bg-emerald-500/25 border border-emerald-300/40'
                    }`}
                  >
                    <IconCheckCircle size={14} />
                    <span>تم الحل</span>
                  </button>

                  <button
                    onClick={() => handleStatusChange('pending')}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition-all ${
                      selectedThread.status === 'pending'
                        ? 'bg-amber-600 text-white shadow-xs border border-white/20'
                        : 'bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 border border-amber-300/40'
                    }`}
                  >
                    <IconClock size={14} />
                    <span>في الانتظار</span>
                  </button>

                  <button
                    onClick={() => handleDelete(selectedThread.id)}
                    className="p-1.5 rounded-xl bg-rose-500/15 text-rose-600 hover:bg-rose-500/25 transition-all border border-rose-300/40"
                    title="حذف المحادثة"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>

              {/* Refined "Current User Question" pinned banner */}
              <div className="px-4 py-2.5 bg-amber-500/15 border-b border-amber-300/40 flex items-center justify-between gap-2 text-xs backdrop-blur-md">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-bold text-amber-900 whitespace-nowrap flex items-center gap-1">
                    <IconHelpCircle size={14} className="text-amber-700" />
                    <span>سؤال المستخدم:</span>
                  </span>
                  <p className="font-semibold text-slate-900 truncate">
                    "{selectedThread.lastMessage}"
                  </p>
                </div>
              </div>

              {/* Private Admin Notes Section */}
              {showNotes && (
                <div className="p-3 bg-amber-50/80 border-b border-amber-200/80 space-y-2 backdrop-blur-md">
                  <div className="flex items-center justify-between text-xs text-amber-900 font-bold">
                    <span className="flex items-center gap-1">
                      <IconLock size={13} className="text-amber-700" />
                      <span>ملاحظات المطور والإدارة المخبأة (لا يراها المستخدم):</span>
                    </span>
                    <button
                      onClick={handleSaveNotes}
                      className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-[10px] font-bold transition-all shadow-xs flex items-center gap-1"
                    >
                      <IconCheck size={12} />
                      <span>حفظ الملاحظة</span>
                    </button>
                  </div>
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    onBlur={handleSaveNotes}
                    placeholder="مثال: يطلب تركيب خاص لخط الرقعة - يحتاج إرسال ملف OTF معدل..."
                    className="w-full px-3 py-1.5 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                  />
                </div>
              )}

              {/* Message Feed Area */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-white/20">
                {selectedThread.messages?.map((msg) => {
                  const isAdmin = msg.sender === 'admin';
                  const isSystem = msg.sender === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center my-2">
                        <span className="px-3 py-1 rounded-full liquid-glass-badge text-slate-700 text-[11px] font-medium">
                          {msg.text}
                        </span>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAdmin ? 'items-start' : 'items-end'} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-600 px-1 font-medium">
                        {isAdmin ? (
                          <span className="flex items-center gap-1 font-bold text-sky-700">
                            <IconCrown size={12} className="text-amber-500" />
                            {msg.senderName}
                          </span>
                        ) : (
                          <span className="font-bold text-emerald-700 flex items-center gap-1">
                            <IconUser size={12} className="text-emerald-600" />
                            <span>{msg.senderName} (المستخدم)</span>
                          </span>
                        )}
                        <span>•</span>
                        <span className="font-mono">{msg.timestamp}</span>
                      </div>

                      <div
                        className={`max-w-[80%] p-3.5 rounded-2xl leading-relaxed text-xs sm:text-sm shadow-md ${
                          isAdmin
                            ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white rounded-tr-none font-medium border border-white/20'
                            : 'liquid-glass-card text-slate-900 rounded-tl-none border border-white/80 font-medium'
                        }`}
                      >
                        {msg.text}
                      </div>
                    </div>
                  );
                })}
                <div ref={chatBottomRef} />
              </div>

              {/* Quick Template Chips */}
              <div className="px-3 py-2 border-t border-white/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar text-[11px]">
                <span className="text-slate-600 font-bold whitespace-nowrap ml-1">
                  ردود سريعة:
                </span>
                {quickTemplates.map((tmpl, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendReply(tmpl.text)}
                    className="px-2.5 py-1 rounded-xl liquid-glass-button text-slate-800 font-semibold whitespace-nowrap hover:text-sky-700 transition-colors"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>

              {/* Reply Box */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendReply();
                }}
                className="p-3 border-t border-white/60 space-y-2"
              >
                {/* Sender identity selection */}
                <div className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-2">
                    <span className="text-slate-600 font-bold">إرسال بصفتك:</span>
                    <button
                      type="button"
                      onClick={() => setSenderPersona('drfont')}
                      className={`px-2.5 py-0.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                        senderPersona === 'drfont'
                          ? 'bg-amber-500/20 text-amber-800 border border-amber-400/50'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <IconCrown size={12} className="text-amber-500" />
                      <span>Dr Font (المطور)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setSenderPersona('team')}
                      className={`px-2.5 py-0.5 rounded-xl font-bold transition-all flex items-center gap-1 ${
                        senderPersona === 'team'
                          ? 'bg-sky-500/20 text-sky-800 border border-sky-400/50'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <IconShield size={12} className="text-sky-600" />
                      <span>فريق الدعم الإداري</span>
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="اكتب ردك المباشر للمستخدم هنا..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-3.5 py-2.5 rounded-2xl liquid-glass-input text-xs sm:text-sm text-slate-900 focus:outline-none"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 disabled:opacity-40 text-white font-bold text-xs transition-all shadow-md shadow-sky-500/20 flex items-center gap-1.5 whitespace-nowrap border border-white/20"
                  >
                    <span>إرسال</span>
                    <IconSend size={15} />
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-slate-400 space-y-3">
              <IconHeadphones size={48} className="text-slate-300" />
              <p className="font-bold text-sm">حدد محادثة من القائمة الجانبية للبدء بالرد الحي</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

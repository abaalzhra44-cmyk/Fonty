import React from 'react';
import { useAuth } from '../context/AuthContext';
import { IconSparkles, IconCrown, IconLock, IconWrench } from '../components/icons/Icons';

export const MaintenancePage: React.FC = () => {
  const { openAuthModal } = useAuth();
  const announcementMsg = localStorage.getItem('df_announcement_msg') || 'يجري حالياً تحديث خوادم دكتور الخطوط وإضافة ميزات جديدة لتطوير الخطوط العربية.';

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative z-20">
      <div className="max-w-xl w-full bg-white/80 backdrop-blur-2xl border border-white/60 rounded-3xl p-8 sm:p-10 shadow-2xl text-center space-y-6 relative overflow-hidden">
        {/* Glow ambient background */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500/20 via-sky-500/20 to-indigo-500/20 text-amber-500 flex items-center justify-center mx-auto border border-amber-500/30 shadow-lg shadow-amber-500/10 animate-pulse">
          <IconCrown size={40} />
        </div>

        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>الموقع في وضع الصيانة والتحديث</span>
          </div>

          <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900 flex items-center justify-center gap-2">
            <span>نعمل على تحسين دكتور الخطوط</span>
            <IconWrench size={24} className="text-amber-500" />
          </h1>

          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-lg mx-auto">
            {announcementMsg}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-right space-y-2 text-xs">
          <div className="flex items-center justify-between font-bold text-slate-800">
            <span>فريق التطوير والإشراف:</span>
            <span className="text-sky-500">طارق محمد</span>
          </div>
          <p className="text-slate-500 leading-relaxed">
            سنكون جليّين بالعودة للخدمة بكفاءة أعلى خلال وقت قصير. شكرًا لصبركم وتفهمكم!
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <span className="text-slate-400">هل أنت من فريق الإدارة؟</span>
          <button
            onClick={() => openAuthModal('login')}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-700 hover:to-blue-700 text-white font-bold transition-all shadow-md shadow-sky-500/20 flex items-center gap-2"
          >
            <IconLock size={14} />
            <span>تسجيل دخول المطور والإدارة</span>
          </button>
        </div>
      </div>
    </div>
  );
};

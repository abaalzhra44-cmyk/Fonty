import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  IconSparkles,
  IconClose,
  IconGrid,
  IconLayers3D,
  IconFonts,
  IconUser,
  IconArrowLeft,
  IconCheck,
} from './icons/Icons';

export const WelcomeBackModal: React.FC = () => {
  const { user, showWelcomeBack, closeWelcomeBack } = useAuth();
  const navigate = useNavigate();

  if (!showWelcomeBack || !user) return null;

  const handleNavigate = (path: string) => {
    closeWelcomeBack();
    navigate(path);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn dir-rtl">
      <div
        className="relative w-full max-w-lg bg-white/85 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden text-slate-900 transition-all ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient top light glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-amber-300/30 via-orange-300/20 to-sky-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-purple-300/20 to-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 pb-4 border-b border-slate-200/60 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <img
              src={user.avatarUrl}
              alt={user.username}
              className="w-12 h-12 rounded-2xl object-cover border-2 border-white shadow-md shadow-slate-900/10"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg text-slate-900">
                  أهلاً بعودتك يا {user.username}! 👋
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-bold">
                  تم تسجيل الدخول
                </span>
              </div>
              <p className="font-body text-xs text-slate-500 mt-0.5">
                {user.email} {user.isDeveloper ? '• مطور المحرك الرئيسي' : ''}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeWelcomeBack}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
            title="إغلاق"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 relative z-10">
          {/* Active Session Summary */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-sky-50/90 via-white to-indigo-50/90 border border-sky-200/60 shadow-xs flex items-center justify-between">
            <div className="space-y-0.5">
              <span className="text-[10px] font-bold text-sky-800 uppercase tracking-wider block">
                حالة الجلسة الحالية
              </span>
              <p className="text-xs font-bold text-slate-800">
                جميع مشروعاتك وإعدادات الخطوط جاهزة ومحفوظة تلقائياً
              </p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-700 border border-sky-300/40 flex items-center justify-center shrink-0">
              <IconSparkles size={18} />
            </div>
          </div>

          {/* Quick Shortcuts Grid */}
          <div className="space-y-2">
            <label className="text-xs font-extrabold text-slate-800 block">
              اختصارات الوصول السريع:
            </label>

            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="p-3.5 rounded-2xl bg-white/90 hover:bg-slate-50 border border-slate-200/80 hover:border-sky-300 transition-all text-right flex flex-col justify-between gap-2 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconGrid size={18} />
                  </div>
                  <IconArrowLeft size={14} className="text-slate-400 group-hover:text-sky-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">استوديو المحارف</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">متابعة تحرير ورسم الخط</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/lab')}
                className="p-3.5 rounded-2xl bg-white/90 hover:bg-slate-50 border border-slate-200/80 hover:border-purple-300 transition-all text-right flex flex-col justify-between gap-2 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconLayers3D size={18} />
                  </div>
                  <IconArrowLeft size={14} className="text-slate-400 group-hover:text-purple-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">مختبر الخطوط الملونة</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">معاينة الطبقات والعمق 3D</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/my-fonts')}
                className="p-3.5 rounded-2xl bg-white/90 hover:bg-slate-50 border border-slate-200/80 hover:border-amber-300 transition-all text-right flex flex-col justify-between gap-2 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconFonts size={18} />
                  </div>
                  <IconArrowLeft size={14} className="text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">مكتبة مشاريعي</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">إدارة وتصدير خطوطك</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleNavigate('/account')}
                className="p-3.5 rounded-2xl bg-white/90 hover:bg-slate-50 border border-slate-200/80 hover:border-emerald-300 transition-all text-right flex flex-col justify-between gap-2 shadow-2xs group"
              >
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconUser size={18} />
                  </div>
                  <IconArrowLeft size={14} className="text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">الملف الشخصي</h4>
                  <p className="text-[10px] text-slate-500 mt-0.5">تعديل البيانات والإعدادات</p>
                </div>
              </button>
            </div>
          </div>

          {/* Typography Tip of the Day */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 space-y-1">
            <span className="font-extrabold text-slate-800 text-[11px] block">
              💡 نصيحة اليوم لتصميم الخطوط العربية:
            </span>
            <p className="text-[11px] leading-relaxed text-slate-500">
              احرص على ضبط الأبعاد العرضية (Advance Width) بدقة لكل محرف لتفادي تداخل الحروف أثناء استخدام تركيبات COLR الملونة.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-200/60 bg-slate-50/50 flex items-center justify-end relative z-10">
          <button
            type="button"
            onClick={closeWelcomeBack}
            className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white text-xs font-extrabold transition-all shadow-md shadow-sky-600/20 hover:opacity-95 flex items-center gap-2"
          >
            <span>الانتقال لبيئة العمل</span>
            <IconCheck size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  IconLogIn,
  IconUser,
  IconZap,
  IconLayers,
  IconCheck,
  IconArrowLeft,
} from '../components/icons/Icons';

export const WelcomePage: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <div className="min-h-screen pb-20 pt-6 px-4 max-w-4xl mx-auto space-y-12 animate-fadeIn dir-rtl">
      {/* Hero Section */}
      <div className="text-center space-y-5 pt-4">
        <h1 className="font-heading font-black text-3xl sm:text-4xl md:text-5xl text-slate-900 tracking-tight leading-tight">
          ابتكار وتطوير <br />
          <span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            الخطوط العربية الرقمية
          </span>
        </h1>

        <p className="font-body text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
          بيئة رقمية حديثة لتحويل المخطوطات والرسومات إلى خطوط OpenType و TTF احترافية تدعم التراكيب وقواعد الخط العربي.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => openAuthModal('signup')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-600 text-white font-heading font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/30 cursor-pointer"
          >
            <IconUser size={18} />
            <span>إنشاء حساب جديد</span>
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl liquid-glass-button text-slate-800 font-heading font-bold text-sm shadow-sm flex items-center justify-center gap-2 transition-all active:scale-95 border border-white/80 cursor-pointer"
          >
            <IconLogIn size={18} className="text-sky-600" />
            <span>تسجيل الدخول</span>
          </button>
        </div>
      </div>

      {/* 3 Core Highlights (Clean & Minimal) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl liquid-glass-card space-y-2.5 border border-white/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center border border-sky-400/20">
            <IconZap size={20} />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-900">
            تصدير TTF و OTF
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-body">
            توليد ملفات خطوط أصلية قابلة للتثبيت المباشر على جميع الأجهزة وبرامج التصميم.
          </p>
        </div>

        <div className="p-5 rounded-2xl liquid-glass-card space-y-2.5 border border-white/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-600 flex items-center justify-center border border-indigo-400/20">
            <IconLayers size={20} />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-900">
            دعم تراكيب GSUB
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-body">
            معالجة قواعد اتصال الحروف العربية والتراكيب المعقدة بمرونة تامة.
          </p>
        </div>

        <div className="p-5 rounded-2xl liquid-glass-card space-y-2.5 border border-white/80 shadow-xs">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-600 flex items-center justify-center border border-emerald-400/20">
            <IconCheck size={20} />
          </div>
          <h3 className="font-heading font-bold text-sm text-slate-900">
            مزامنة سحابية مع Firebase
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed font-body">
            حفظ تلقائي للمشاريع والبيانات على السحابة مع إمكانية الوصول من أي جهاز.
          </p>
        </div>
      </div>

      {/* Bottom Minimal Banner */}
      <div className="p-6 rounded-2xl liquid-glass-card border border-white/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-right shadow-sm">
        <div className="space-y-1">
          <h3 className="font-heading font-bold text-base text-slate-900">
            ابدأ تصميم خطك الآن
          </h3>
          <p className="text-xs text-slate-600 font-body">
            سجّل حسابك مجاناً واستمتع بكافة أدوات الاستوديو.
          </p>
        </div>
        <button
          onClick={() => openAuthModal('signup')}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer shrink-0"
        >
          <span>ابدأ الآن</span>
          <IconArrowLeft size={16} />
        </button>
      </div>
    </div>
  );
};

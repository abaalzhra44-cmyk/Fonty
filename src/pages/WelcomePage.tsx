import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  IconSparkles,
  IconLogIn,
  IconUser,
  IconLab,
  IconInspector,
  IconFonts,
  IconCheck,
  IconArrowLeft,
  IconZap,
  IconLayers,
  IconSliders,
  IconCloud,
  IconEye,
} from '../components/icons/Icons';

export const WelcomePage: React.FC = () => {
  const { openAuthModal } = useAuth();

  return (
    <div className="min-h-screen pb-28 pt-8 px-4 max-w-6xl mx-auto space-y-20 animate-fadeIn">
      {/* Hero Section */}
      <div className="text-center space-y-6 max-w-4xl mx-auto pt-6">
        {/* Top Royal Badge */}
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-500/10 via-blue-500/10 to-indigo-500/10 border border-sky-500/20 text-sky-600 text-xs font-bold shadow-sm">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
          <IconSparkles size={16} />
          <span>استوديو دكتور الخطوط الرقمي</span>
        </div>

        {/* Main Title */}
        <h1 className="font-heading font-black text-3xl sm:text-5xl md:text-6xl text-slate-900 tracking-tight leading-[1.25]">
          صمّم وحوّل مخطوطاتك إلى <br />
          <span className="bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
            خطوط طباعية احترافية فاخرة
          </span>
        </h1>

        {/* Subtitle */}
        <p className="font-body text-slate-600 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
          البيئة المتكاملة لمصممي الخطوط والمخطوطات العربية لتحويل الرسومات اليدوية والـ SVG إلى ملفات OpenType و TTF تدعم التراكيب الخطية المعقدة والجداول التفاعلية.
        </p>

        {/* CTA Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={() => openAuthModal('signup')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 via-blue-600 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-heading font-bold text-base shadow-2xl shadow-sky-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105 active:scale-95"
          >
            <IconUser size={20} />
            <span>إنشاء حساب جديد والبدء</span>
          </button>
          <button
            onClick={() => openAuthModal('login')}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-800 hover:bg-slate-50 font-heading font-bold text-base shadow-sm flex items-center justify-center gap-2.5 transition-all hover:scale-105 active:scale-95"
          >
            <IconLogIn size={20} className="text-sky-600" />
            <span>تسجيل الدخول للحساب</span>
          </button>
        </div>
      </div>

      {/* Studio Workflow Steps (مسار العمل الهندسي) */}
      <div className="space-y-8">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            مسار العمل
          </span>
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl text-slate-900">
            كيف تقوم بإنشاء خطك في 4 خطوات بسيطة؟
          </h2>
          <p className="text-xs text-slate-500 max-w-lg mx-auto">
            خطوات واضحة ومنظمة تأخذك من مجرد فكرة ومخطوطة يد إلى ملف خط طباعي عالمي.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-sky-500/50 transition-all shadow-lg relative group">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 font-heading font-black text-lg flex items-center justify-center">
              1
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              رفع المخطوطة والحروف
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              ارفع صور الحروف أو ارسمها مباشرة واستخرج المتجهات SVG النظيفة مع ضبط النواحي التلقائي.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-sky-500/50 transition-all shadow-lg relative group">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 font-heading font-black text-lg flex items-center justify-center">
              2
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              تحديد قواعد GSUB
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              أضف التراكيب الخطية والبدائل الجمالية واستبدال الكلمات التلقائي للخط العربي.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-sky-500/50 transition-all shadow-lg relative group">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 font-heading font-black text-lg flex items-center justify-center">
              3
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              معايرة المقاييس
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              افحص خط القاعدة، أبعاد التقدم (Advance Width)، وتوازن المسافات عبر المفتش البصري.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 hover:border-sky-500/50 transition-all shadow-lg relative group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 font-heading font-black text-lg flex items-center justify-center">
              4
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              التصدير والاستخدام
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              حمل ملف TTF الحقيقي واستخدمه فوراً في برامج التصميم كـ Photoshop, Illustrator, وWord.
            </p>
          </div>
        </div>
      </div>

      {/* Feature Capabilities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <IconZap size={22} />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900">
            تصدير TTF حقيقي 100%
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            توليد بنية OpenType كاملة متوافقة مع كافة أنظمة التشغيل ومختلف التطبيقات والتطبيقات المدمجة.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
            <IconLayers size={22} />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900">
            تراكيب وبدائل معقدة
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            ربط الحروف والمركبات بسهولة مع مراعاة خصائص الخط العربي والأشكال المتصلة والمنفصلة.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <IconCheck size={22} />
          </div>
          <h3 className="font-heading font-bold text-base text-slate-900">
            حفظ محلي وأمان كامل
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            جميع مشاريعك وخطوطك تُحفظ بأمان داخل متصفحك مع إمكانية التصدير والاسترجاع في أي وقت.
          </p>
        </div>
      </div>

      {/* Bottom Sign up Call To Action Banner */}
      <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950 to-indigo-950 text-white shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2 text-center sm:text-right">
          <h2 className="font-heading font-extrabold text-2xl sm:text-3xl">
            جاهز لبدء ابتكار خطك العربي الخاص؟
          </h2>
          <p className="text-xs sm:text-sm text-sky-200">
            أنشئ حسابك الفاخر مجاناً الآن واستمتع بتجربة تصميم المخطوطات الرقمية المتقدمة.
          </p>
        </div>
        <button
          onClick={() => openAuthModal('signup')}
          className="px-8 py-4 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white font-heading font-bold text-sm shadow-xl flex items-center gap-2 transition-all hover:scale-105 active:scale-95 shrink-0"
        >
          <span>أنشئ حسابك الفاخر الآن</span>
          <IconArrowLeft size={18} />
        </button>
      </div>
    </div>
  );
};

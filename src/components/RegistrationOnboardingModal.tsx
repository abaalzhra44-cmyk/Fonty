import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useScrollLock } from '../hooks/useScrollLock';
import {
  IconSparkles,
  IconCheck,
  IconLayers,
  IconDownload,
  IconArrowLeft,
  IconArrowRight,
  IconClose,
  IconLayers3D,
  IconPalette,
  IconGrid,
} from './icons/Icons';

export const RegistrationOnboardingModal: React.FC = () => {
  const { user, showSignupOnboarding, closeSignupOnboarding } = useAuth();
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Central background scroll lock while onboarding modal is open
  useScrollLock(showSignupOnboarding && !!user);

  if (!showSignupOnboarding || !user) return null;

  const totalSteps = 4;

  const handleFinish = () => {
    try {
      localStorage.setItem(`fonty_onboarding_completed_${user.id}`, 'true');
    } catch {
      // Ignore storage errors
    }
    closeSignupOnboarding();
  };

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-5 bg-slate-950/60 backdrop-blur-md animate-fadeIn dir-rtl overscroll-contain modal-backdrop-lock"
      onClick={handleFinish}
      onTouchMove={(e) => {
        // Prevent background rubber-banding if dragging outside the card
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-modal-title"
    >
      {/* Modal Card Container */}
      <div
        className="relative w-full max-w-[480px] sm:max-w-[520px] max-h-[88vh] sm:max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl sm:rounded-[28px] shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35),0_0_0_1px_rgba(255,255,255,0.9)] overflow-hidden text-slate-900 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Fixed Header (رأس النافذة المدمج والمحكم) */}
        <div className="shrink-0 px-4.5 sm:px-6 py-3.5 border-b border-slate-100/90 bg-white/80 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500/15 via-indigo-500/15 to-purple-500/15 border border-sky-400/25 text-sky-600 flex items-center justify-center shadow-2xs shrink-0">
              <IconSparkles size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h2
                  id="onboarding-modal-title"
                  className="font-heading font-extrabold text-sm sm:text-base text-slate-900 leading-tight"
                >
                  دليل البداية والإرشاد السريع
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-sky-100/80 text-sky-700 border border-sky-200/60 text-[10px] font-bold shrink-0">
                  خطوة {currentStep} من {totalSteps}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                مرحباً بك في استوديو بناء وتطوير الخطوط العربية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleFinish}
            className="shrink-0 w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="تخطي الدليل"
            aria-label="تخطي الدليل"
          >
            <IconClose size={17} />
          </button>
        </div>

        {/* 2. Slim Progress Bar (شريط التقدم المتناسق) */}
        <div className="w-full bg-slate-100 h-1 shrink-0 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-600 transition-all duration-300 ease-out"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* 3. Scrollable Content Area (منطقة المحتوى المستقلة للتمرير الداخلي فقط) */}
        <div className="flex-1 overflow-y-auto overscroll-y-contain modal-content-scroll px-4.5 sm:px-6 py-4 space-y-3.5">
          {/* STEP 1: Welcome Greeting & 3 Core Tools */}
          {currentStep === 1 && (
            <div className="space-y-3.5 animate-fadeIn">
              {/* Compact Greeting Card */}
              <div className="flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-gradient-to-r from-sky-50/90 via-white to-purple-50/80 border border-sky-200/60 shadow-2xs">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl object-cover ring-2 ring-sky-500/30 shadow-xs shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading font-extrabold text-sm sm:text-base text-slate-900 leading-tight truncate">
                    أهلاً بك يا {user.username}! 🎉
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    تم إنشاء حسابك بنجاح! أنت الآن جاهز لبناء وتصميم وتصدير الخطوط العربية الاحترافية والملونة 3D.
                  </p>
                </div>
              </div>

              {/* 3 Core Tools Grid (أبرز أدوات المنظومة المتوفرة) */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-700 block">
                  أبرز أدوات المنظومة المتوفرة لك:
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {/* Tool 1: استوديو المحارف */}
                  <div className="p-3 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs space-y-1 hover:border-sky-300 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                      <IconGrid size={15} />
                    </div>
                    <h4 className="font-heading font-bold text-xs text-slate-900 leading-tight">استوديو المحارف</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      رسم واستيراد المسارات المتجهية وتعديل مقاييس الحروف.
                    </p>
                  </div>

                  {/* Tool 2: طبقات ملونة 3D */}
                  <div className="p-3 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs space-y-1 hover:border-purple-300 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                      <IconLayers3D size={15} />
                    </div>
                    <h4 className="font-heading font-bold text-xs text-slate-900 leading-tight">طبقات ملونة 3D</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      تقسيم المحارف إلى طبقات لونية متراكبة حسب معيار COLR.
                    </p>
                  </div>

                  {/* Tool 3: تصدير متكامل */}
                  <div className="p-3 rounded-xl bg-white/95 border border-slate-200/80 shadow-2xs space-y-1 hover:border-amber-300 transition-colors">
                    <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                      <IconDownload size={15} />
                    </div>
                    <h4 className="font-heading font-bold text-xs text-slate-900 leading-tight">تصدير متكامل</h4>
                    <p className="text-[11px] text-slate-500 leading-snug">
                      توليد وتصدير ملفات OpenType (.TTF) وحزم الويب.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Glyph Studio & Vector Import Guide */}
          {currentStep === 2 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 border border-sky-200/80 flex items-center justify-center font-extrabold text-xs shrink-0">
                  1
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                    استوديو تصميم المحارف والمسارات المتجهية
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    كيفية إضافة واستيراد الحروف والرموز العربية
                  </p>
                </div>
              </div>

              <div className="space-y-2.5 bg-slate-50/80 p-3.5 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">✓</span>
                  <p className="text-[11px]">
                    <strong className="text-slate-900 font-extrabold">استيراد SVG:</strong> سحب وإسقاط ملفات SVG للمحارف العربية والمخطوطات ليتم تحويلها فورياً لمسار خط رقمي.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">✓</span>
                  <p className="text-[11px]">
                    <strong className="text-slate-900 font-extrabold">المسافات العرضية (Advance Width):</strong> التحكم في المسافات بين الحروف والمحاذاة الميدانية بدقة.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px] font-bold shrink-0 mt-0.5">✓</span>
                  <p className="text-[11px]">
                    <strong className="text-slate-900 font-extrabold">مقاييس الخط (Metrics):</strong> ضبط خط الأساس والصعود والنزول (Ascender/Descender) لضمان اتساق النص.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Ligatures & 3D Color Layers */}
          {currentStep === 3 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 border border-purple-200/80 flex items-center justify-center font-extrabold text-xs shrink-0">
                  2
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                    التراكيب الإملائية والخطوط الملونة 3D
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    تحويل المخطوطات المعقدة إلى تركيبات ذكية وطبقات ثلاثية الأبعاد
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="p-3.5 rounded-xl bg-gradient-to-br from-purple-50/90 to-indigo-50/70 border border-purple-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-purple-800 font-extrabold text-xs">
                    <IconLayers size={15} />
                    <span>تراكيب الحروف (GSUB)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    اكتب تسلسل الأحرف (مثل &quot;محمد&quot; أو &quot;الله&quot;) ليتم استبدالها تلقائياً بالمخطوطة المركبة أثناء الكتابة.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50/90 to-orange-50/70 border border-amber-200/80 space-y-1.5">
                  <div className="flex items-center gap-1.5 text-amber-800 font-extrabold text-xs">
                    <IconPalette size={15} />
                    <span>الطبقات الملونة والعمق 3D</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    قسم الرسم إلى طبقات لونية مستقلة واستكشف تفاعلها بالعمق ثلاثي الأبعاد واختبر مختلف لوحات الألوان.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Live Preview & Export Ready */}
          {currentStep === 4 && (
            <div className="space-y-3.5 animate-fadeIn">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 border border-emerald-200/80 flex items-center justify-center font-extrabold text-xs shrink-0">
                  3
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                    المعاينة الحية والتصدير النهائي جاهز الآن!
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    جميع أدوات استوديو الخطوط في متناول يدك
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white space-y-2 shadow-md">
                <div className="flex items-center gap-2 text-amber-400 font-heading font-bold text-xs sm:text-sm">
                  <IconSparkles size={16} />
                  <span>توليد وتجربة خط الحزمة الكاملة</span>
                </div>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  يمكنك في أي وقت الانتقال لعلامة تبويب <strong className="text-white">المختبر</strong> أو <strong className="text-white">محرر الطبقات</strong> لتصدير ملف الخط الملون (.TTF) أو حزمة الويب السريعة.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 4. Fixed Footer Controls (أزرار التنقل الثابتة - مفصولة تماماً عن التمرير) */}
        <div className="shrink-0 px-4.5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/80 backdrop-blur-md flex items-center justify-between gap-2.5">
          {/* Previous Button */}
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 1}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentStep === 1
                ? 'opacity-0 pointer-events-none'
                : 'bg-white text-slate-700 border border-slate-200/90 hover:bg-slate-50 shadow-2xs active:scale-95'
            }`}
          >
            <IconArrowRight size={14} />
            <span>السابق</span>
          </button>

          {/* Step Indicator Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx + 1)}
                className={`h-2 rounded-full transition-all cursor-pointer ${
                  currentStep === idx + 1
                    ? 'bg-sky-600 w-5'
                    : 'bg-slate-300 hover:bg-slate-400 w-2'
                }`}
                title={`خطوة ${idx + 1}`}
                aria-label={`خطوة ${idx + 1}`}
              />
            ))}
          </div>

          {/* Next / Finish Button */}
          <button
            type="button"
            onClick={handleNext}
            className="px-4 sm:px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-heading font-bold shadow-md shadow-sky-600/20 hover:shadow-sky-600/30 transition-all active:scale-95 flex items-center gap-1.5 cursor-pointer"
          >
            <span>{currentStep === totalSteps ? 'ابدأ الاستوديو الآن' : 'التالي'}</span>
            {currentStep === totalSteps ? <IconCheck size={14} /> : <IconArrowLeft size={14} />}
          </button>
        </div>
      </div>
    </div>
  );
};

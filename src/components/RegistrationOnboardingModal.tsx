import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
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

  if (!showSignupOnboarding || !user) return null;

  const totalSteps = 4;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep((prev) => prev + 1);
    } else {
      closeSignupOnboarding();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn dir-rtl">
      <div
        className="relative w-full max-w-2xl bg-white/85 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-2xl shadow-slate-900/10 overflow-hidden text-slate-900 transition-all ring-1 ring-slate-900/5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Ambient top light glow */}
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br from-purple-300/30 to-sky-300/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-amber-300/20 to-indigo-300/20 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="p-6 pb-4 border-b border-slate-200/60 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-500/15 via-purple-500/15 to-indigo-500/15 border border-sky-400/30 text-sky-700 flex items-center justify-center shadow-xs">
              <IconSparkles size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-heading font-extrabold text-lg text-slate-900">
                  دليل البداية والإرشاد لاستوديو دكتور الخطوط
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-sky-100 to-purple-100 text-sky-800 border border-sky-200 text-[10px] font-bold">
                  خطوة {currentStep} من {totalSteps}
                </span>
              </div>
              <p className="font-body text-xs text-slate-500 mt-0.5">
                مرحباً بك كعضو جديد في المنصة السحابية المتقدمة لبناء الخطوط العربية
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeSignupOnboarding}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors"
            title="تخطي الدليل"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-100 h-1.5 relative z-10">
          <div
            className="bg-gradient-to-r from-sky-500 via-purple-500 to-indigo-600 h-1.5 transition-all duration-300"
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>

        {/* Dynamic Wizard Steps Content */}
        <div className="p-6 sm:p-8 relative z-10 min-h-[340px] flex flex-col justify-between">
          {/* STEP 1: Welcome & Intro */}
          {currentStep === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-gradient-to-r from-sky-50/80 via-white to-purple-50/80 border border-sky-200/60 shadow-xs">
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-900">
                    أهلاً بك يا {user.username}! 🎉
                  </h3>
                  <p className="font-body text-xs text-slate-600 mt-1 leading-relaxed">
                    تم إنشاء حسابك بنجاح في <strong className="text-sky-700 font-extrabold">استوديو دكتور الخطوط</strong>. أنت الآن جاهز لبناء وتصميم وتصدير الخطوط العربية الاحترافية والملونة 3D.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <IconGrid size={18} />
                  </div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">استوديو المحارف</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    رسم واستيراد المسارات المتجهية وتعديل مقاييس الخط العربي.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                    <IconLayers3D size={18} />
                  </div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">طبقات ملونة 3D</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    تقسيم المحارف إلى طبقات لونية متراكبة حسب معيار COLR/CPAL.
                  </p>
                </div>

                <div className="p-3.5 rounded-2xl bg-white/80 border border-slate-200/80 shadow-2xs space-y-1.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
                    <IconDownload size={18} />
                  </div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">تصدير متكامل</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">
                    توليد ملفات OpenType (.TTF) وتجهيز حزم الويب الهندسية.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Glyph Studio Guide */}
          {currentStep === 2 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-700 border border-sky-200 flex items-center justify-center font-extrabold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">
                    استوديو تصميم المحارف والمسارات المتجهية (Glyph Studio)
                  </h3>
                  <p className="text-xs text-slate-500">
                    كيفية إضافة واستيراد الحروف والرموز العربية
                  </p>
                </div>
              </div>

              <div className="space-y-3 bg-slate-50/70 p-4 rounded-2xl border border-slate-200/80 text-xs text-slate-700 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <p>
                    <strong className="text-slate-900 font-extrabold">استيراد SVG:</strong> يمكنك سحب وإسقاط ملفات SVG للمحارف العربية أو المخطوطات الفنية ليتم تحويلها فورياً لمسار خط.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <p>
                    <strong className="text-slate-900 font-extrabold">ضبط الأبعاد العرضية (Advance Width):</strong> التحكم في المسافات بين الحروف والمحاذات الميدانية.
                  </p>
                </div>

                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">✓</span>
                  <p>
                    <strong className="text-slate-900 font-extrabold">خط السطر والارتفاع (Metrics):</strong> تكييف خط الصعود والنزول (Ascender/Descender) لضمان المحاذاة الدقيقة.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Ligatures & 3D Color Layers */}
          {currentStep === 3 && (
            <div className="space-y-5 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 border border-purple-200 flex items-center justify-center font-extrabold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">
                    التراكيب الإملاءية والخطوط الملونة 3D (Ligatures & COLR/CPAL)
                  </h3>
                  <p className="text-xs text-slate-500">
                    تحويل المخطوطات المعقدة إلى تركيبات ذكية وطبقات ثلاثية الأبعاد
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/60 border border-purple-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-purple-800 font-extrabold text-xs">
                    <IconLayers size={16} />
                    <span>التراكيب والمركبات (Ligatures GSUB)</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    اكتب تسلسل الأحرف (مثل &quot;محد&quot; أو &quot;الحمد&quot;) ليتم استبدالها تلقائياً بالمخطوطة المركبة أثناء الكتابة.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-50 to-orange-50/60 border border-amber-200/80 space-y-2">
                  <div className="flex items-center gap-2 text-amber-800 font-extrabold text-xs">
                    <IconPalette size={16} />
                    <span>الخطوط الملونة والعمق 3D</span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-relaxed">
                    قسم الرسم إلى طبقات لونية مستقلة واستكشف تفاعلها بالعمق ثلاثي الأبعاد واختبر مختلف لوحات الألوان.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: Ready & Export */}
          {currentStep === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center font-extrabold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-heading font-extrabold text-base text-slate-900">
                    المعاينة الحية والتصدير النهائي جاهز الآن!
                  </h3>
                  <p className="text-xs text-slate-500">
                    جميع أدوات استوديو الخطوط في متناول يدك
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white space-y-3 shadow-lg">
                <div className="flex items-center gap-2 text-amber-400 font-heading font-bold text-sm">
                  <IconSparkles size={18} />
                  <span>توليد وتجربة خط الحزمة الكاملة</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  يمكنك في أي وقت الانتقال لعلامة تبويب <strong className="text-white">المختبر</strong> أو <strong className="text-white">محرر الطبقات اللونية</strong> لتصدير ملف الخط الملون (.TTF) أو حزمة الويب السريعة.
                </p>
              </div>
            </div>
          )}

          {/* Wizard Controls Footer */}
          <div className="pt-6 border-t border-slate-200/60 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={handlePrev}
              disabled={currentStep === 1}
              className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                currentStep === 1
                  ? 'opacity-40 cursor-not-allowed text-slate-400 bg-slate-100'
                  : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50'
              }`}
            >
              <IconArrowRight size={16} />
              <span>السابق</span>
            </button>

            <div className="flex items-center gap-1.5">
              {Array.from({ length: totalSteps }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentStep(idx + 1)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    currentStep === idx + 1
                      ? 'bg-sky-600 w-6'
                      : 'bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`خطوة ${idx + 1}`}
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleNext}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 via-indigo-600 to-purple-600 text-white text-xs font-extrabold transition-all shadow-md shadow-sky-600/20 hover:opacity-95 flex items-center gap-2"
            >
              <span>{currentStep === totalSteps ? 'ابدأ الاستوديو الآن' : 'التالي'}</span>
              {currentStep === totalSteps ? <IconCheck size={16} /> : <IconArrowLeft size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

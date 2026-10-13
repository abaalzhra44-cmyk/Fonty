import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  IconLab,
  IconFonts,
  IconUpload,
  IconRuler,
  IconSparkles,
  IconDownload,
  IconCloud,
  IconZap,
  IconLayers,
  IconInspector,
  IconCompare,
  IconArrowLeft,
  IconCheckCircle,
} from '../components/icons/Icons';

export const HomePage: React.FC = () => {
  const mainFeatures = [
    {
      title: 'مكتبة الخطوط العامة',
      desc: 'تصفح وحمل مئات الخطوط والمخطوطات العربية مع معاينات حية فورية وتنزيل مباشر برابط واحد.',
      icon: IconCloud,
      path: '/gallery',
      badge: 'تنزيل مباشر',
      color: 'bg-sky-500/15 text-sky-600 border-sky-400/30',
    },
    {
      title: 'مختبر بناء الخطوط',
      desc: 'تحويل الصور والمخطوطات إلى حروف فيكتور متجهة مع أدوات قياس المسطرة وضبط خط الأساس وتصدير TTF.',
      icon: IconLab,
      path: '/lab',
      badge: 'محرر احترافي',
      color: 'bg-emerald-500/15 text-emerald-600 border-emerald-400/30',
    },
    {
      title: 'مكتبة مشاريعي',
      desc: 'إدارة كافة مشاريع خطوطك بكل سهولة مع حفظ فوري ودعم التصدير والنسخ الاحتياطي.',
      icon: IconFonts,
      path: '/my-fonts',
      badge: 'مشاريعك',
      color: 'bg-indigo-500/15 text-indigo-600 border-indigo-400/30',
    },
    {
      title: 'مفتش الجداول ورموز اليونيكود',
      desc: 'فحص هيكل ملفات TTF/OTF وتحليل جداول Glyphs وGSUB والتراكيب والرموز بدقة متناهية.',
      icon: IconInspector,
      path: '/inspector',
      badge: 'تحليل دقيق',
      color: 'bg-amber-500/15 text-amber-600 border-amber-400/30',
    },
    {
      title: 'أداة مقارنة وتقييم الخطوط',
      desc: 'مقارنة نصوص الخطوط جنباً إلى جنب لاختبار التناقض والتوازن البصري قبل النشر.',
      icon: IconCompare,
      path: '/compare',
      badge: 'مقارنة حية',
      color: 'bg-purple-500/15 text-purple-600 border-purple-400/30',
    },
  ];

  const steps = [
    {
      num: '01',
      title: 'إنشاء مشروع جديد',
      desc: 'حدد اسم الخط، تراخيص العمل، وإعدادات المسافات واليونيكود المخصصة.',
      icon: IconLab,
    },
    {
      num: '02',
      title: 'رفع الرسوم أو SVG',
      desc: 'ارفع صور PNG/JPG أو ملفات SVG لحروفك الفردية والتراكيب المركبة.',
      icon: IconUpload,
    },
    {
      num: '03',
      title: 'القياس بالمسطرة الرقمية',
      desc: 'اضبط خط الأساس والأبعاد ونقاط التماس بكل دقة للحصول على محاذاة موزونة.',
      icon: IconRuler,
    },
    {
      num: '04',
      title: 'المعاينة وتصدير TTF',
      desc: 'اختبر خطك لحظياً بـ @font-face ثم حمل ملف TTF جاهز للاستخدام الفوري.',
      icon: IconDownload,
    },
  ];

  return (
    <div className="pb-32 pt-6 px-4 max-w-7xl mx-auto space-y-16 dir-rtl">
      {/* Primary Hero Section */}
      <section className="relative overflow-hidden rounded-[2.5rem] liquid-glass-card p-8 md:p-14 text-center shadow-xl shadow-slate-900/5 border border-white/80">
        <div className="relative z-10 max-w-3xl mx-auto space-y-7">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full liquid-glass-badge text-sky-800 text-xs font-bold border border-white/90 shadow-sm"
          >
            <IconSparkles size={16} className="text-sky-600 animate-pulse" />
            <span>المنصة المتكاملة لهندسة وصناعة الخط العربي</span>
          </motion.div>

          <h1 className="font-heading font-extrabold text-3xl md:text-5xl lg:text-6xl text-slate-900 leading-tight tracking-tight">
            Fonty فونتي <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">
              Fonty Studio
            </span>
          </h1>

          <p className="font-body text-slate-600 text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
            منصة متخصصة تحوّل الرسوم اليدوية والمخطوطات إلى ملفات خطوط رقمية احترافية (TTF / OTF)، مع حفظ فوري وأدوات تحليل ومقارنة متطورة.
          </p>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/gallery"
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-sky-700 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2.5 transition-all hover:scale-[1.03] active:scale-95 border border-white/30"
            >
              <IconCloud size={20} />
              <span>مكتبة الخطوط</span>
            </Link>

            <Link
              to="/lab"
              className="px-7 py-4 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2.5 transition-all hover:scale-[1.03] active:scale-95 border border-white/30"
            >
              <IconLab size={20} />
              <span>مختبر بناء الخطوط</span>
            </Link>

            <Link
              to="/my-fonts"
              className="px-7 py-4 rounded-2xl liquid-glass-button text-slate-800 font-bold text-sm flex items-center gap-2.5 transition-all hover:scale-[1.03]"
            >
              <IconFonts size={20} className="text-sky-600" />
              <span>مشاريعي</span>
            </Link>
          </div>

          {/* Quick Stats Bar in Translucent Glass */}
          <div className="pt-8 border-t border-white/60 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div className="p-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60">
              <div className="text-xl md:text-2xl font-black text-slate-900 font-heading">100%</div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">توليد TTF أصلية</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60">
              <div className="text-xl md:text-2xl font-black text-sky-600 font-heading">SVG</div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">تتبع الفيكتور الفوري</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60">
              <div className="text-xl md:text-2xl font-black text-slate-900 font-heading">OTF/GSUB</div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">دعم التراكيب والمركبات</div>
            </div>
            <div className="p-3 rounded-2xl bg-white/40 backdrop-blur-md border border-white/60">
              <div className="text-xl md:text-2xl font-black text-emerald-600 font-heading">حفظ فوري</div>
              <div className="text-xs text-slate-600 font-medium mt-0.5">تلقائي للمشاريع</div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Core Platform Hub Cards with Liquid Glass Theme */}
      <section className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-slate-900">
            أدوات وأقسام المنصة الرئيسية
          </h2>
          <p className="font-body text-sm text-slate-600">
            انتقل مباشرة إلى الأداة أو القسم الذي تحتاجه لبناء خطوطك
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {mainFeatures.map((feat) => {
            const IconComp = feat.icon;
            return (
              <Link
                key={feat.path}
                to={feat.path}
                className="liquid-glass-card p-7 flex flex-col justify-between group relative overflow-hidden"
              >
                {/* Internal ambient light glow on hover */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-sky-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className={`w-13 h-13 rounded-2xl ${feat.color} border flex items-center justify-center group-hover:scale-110 transition-transform shadow-xs`}>
                      <IconComp size={26} />
                    </div>
                    <span className="px-3.5 py-1 rounded-full liquid-glass-badge text-slate-800 text-[11px] font-bold">
                      {feat.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                    {feat.title}
                  </h3>

                  <p className="font-body text-xs text-slate-600 leading-relaxed">
                    {feat.desc}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/60 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:translate-x-[-6px] transition-transform relative z-10">
                  <span>الانتقال للقسم</span>
                  <IconArrowLeft size={16} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* 4-Step Workflow Section in Translucent Liquid Container */}
      <section className="space-y-8 liquid-glass-card p-8 md:p-12 border border-white/80">
        <div className="text-center space-y-2">
          <h2 className="font-heading font-bold text-2xl md:text-3xl text-slate-900">
            كيف تبدأ صناعة خطك الطباعي؟
          </h2>
          <p className="font-body text-sm text-slate-600">
            أربع خطوات منظمة لبناء خط عربي احترافي متكامل
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {steps.map((s) => {
            const IconComp = s.icon;
            return (
              <div
                key={s.num}
                className="bg-white/50 backdrop-blur-xl border border-white/80 rounded-2xl p-6 space-y-3.5 shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-sky-500/15 text-sky-600 flex items-center justify-center border border-sky-400/20">
                    <IconComp size={22} />
                  </div>
                  <span className="font-heading font-black text-xl text-sky-600/30">
                    {s.num}
                  </span>
                </div>
                <h3 className="font-heading font-bold text-sm text-slate-900">
                  {s.title}
                </h3>
                <p className="font-body text-xs text-slate-600 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Capabilities & Specifications */}
      <section className="liquid-glass-card p-8 space-y-6">
        <div className="flex items-center gap-3 border-b border-white/60 pb-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/15 text-emerald-600 border border-emerald-400/20 flex items-center justify-center font-bold">
            <IconCheckCircle size={24} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              المواصفات التقنية لاستوديو الخطوط
            </h3>
            <p className="font-body text-xs text-slate-500">
              معايير عالية متوافقة مع متطلبات أنظمة التشغيل ونسخ الخطوط العامة
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs font-body">
          <div className="p-5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/70 space-y-1.5 shadow-xs">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <IconZap size={18} className="text-sky-600" />
              <span>تشفير المتجهات SVG</span>
            </div>
            <p className="text-slate-600 leading-relaxed">تحويل النقاط بحدود واضحة وسريعة بدون تشويه.</p>
          </div>

          <div className="p-5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/70 space-y-1.5 shadow-xs">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <IconLayers size={18} className="text-indigo-600" />
              <span>تراكيب الحروف (GSUB)</span>
            </div>
            <p className="text-slate-600 leading-relaxed">دعم تركيب التتابع التلقائي للحروف العربية المركبة.</p>
          </div>

          <div className="p-5 bg-white/40 backdrop-blur-md rounded-2xl border border-white/70 space-y-1.5 shadow-xs">
            <div className="font-bold text-slate-900 flex items-center gap-2">
              <IconFonts size={18} className="text-emerald-600" />
              <span>التخزين المحلي المباشر</span>
            </div>
            <p className="text-slate-600 leading-relaxed">حفظ محلي آمن ومباشر على بيئة الاستضافة والمتصفح.</p>
          </div>
        </div>
      </section>
    </div>
  );
};

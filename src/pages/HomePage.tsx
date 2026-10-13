import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  IconLab,
  IconFonts,
  IconCloud,
  IconInspector,
  IconCompare,
  IconArrowLeft,
  IconSparkles,
} from '../components/icons/Icons';

export const HomePage: React.FC = () => {
  const tools = [
    {
      title: 'مكتبة الخطوط',
      desc: 'استعراض وتحميل الخطوط العربية مع معاينة حية وتنزيل فوري.',
      icon: IconCloud,
      path: '/gallery',
      badge: 'المكتبة',
      color: 'bg-sky-500/15 text-sky-600 border-sky-400/30',
    },
    {
      title: 'مختبر بناء الخطوط',
      desc: 'تحويل الحروف والمتجهات إلى خطوط TTF و OTF مع ضبط المقاييس.',
      icon: IconLab,
      path: '/lab',
      badge: 'المحرر',
      color: 'bg-emerald-500/15 text-emerald-600 border-emerald-400/30',
    },
    {
      title: 'مشاريعي',
      desc: 'إدارة مشاريع خطوطك ومزامنتها سحابياً مع حفظ تلقائي.',
      icon: IconFonts,
      path: '/my-fonts',
      badge: 'المشاريع',
      color: 'bg-indigo-500/15 text-indigo-600 border-indigo-400/30',
    },
    {
      title: 'مفتش الجداول واليونيكود',
      desc: 'فحص ملفات الخطوط وتحليل جداول Glyphs و GSUB بدقة.',
      icon: IconInspector,
      path: '/inspector',
      badge: 'فحص وتدقيق',
      color: 'bg-amber-500/15 text-amber-600 border-amber-400/30',
    },
    {
      title: 'مقارنة الخطوط',
      desc: 'مقارنة نصوص الخطوط جنباً إلى جنب لاختبار التناسق البصري.',
      icon: IconCompare,
      path: '/compare',
      badge: 'مقارنة',
      color: 'bg-purple-500/15 text-purple-600 border-purple-400/30',
    },
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-10 dir-rtl animate-fadeIn">
      {/* Clean Streamlined Hero */}
      <section className="relative overflow-hidden rounded-3xl liquid-glass-card p-8 md:p-12 text-center border border-white/80 shadow-lg shadow-slate-900/5">
        <div className="relative z-10 max-w-2xl mx-auto space-y-5">
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full liquid-glass-badge text-sky-800 text-xs font-bold border border-white/80"
          >
            <IconSparkles size={14} className="text-sky-600" />
            <span>Fonty Studio</span>
          </motion.div>

          <h1 className="font-heading font-extrabold text-3xl sm:text-4xl md:text-5xl text-slate-900 leading-tight">
            استوديو تصميم وهندسة <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600">
              الخطوط العربية
            </span>
          </h1>

          <p className="font-body text-slate-600 text-sm sm:text-base leading-relaxed max-w-lg mx-auto">
            منصة متخصصة لبناء وتطوير الخطوط العربية وإنتاج ملفات TTF و OTF الاحترافية بدقة عالية.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <Link
              to="/lab"
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs shadow-md shadow-sky-500/20 flex items-center gap-2 transition-all active:scale-95 border border-white/30"
            >
              <IconLab size={16} />
              <span>مختبر بناء الخطوط</span>
            </Link>

            <Link
              to="/gallery"
              className="px-6 py-3 rounded-2xl liquid-glass-button text-slate-800 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 border border-white/80"
            >
              <IconCloud size={16} className="text-sky-600" />
              <span>مكتبة الخطوط</span>
            </Link>

            <Link
              to="/my-fonts"
              className="px-6 py-3 rounded-2xl liquid-glass-button text-slate-800 font-bold text-xs flex items-center gap-2 transition-all active:scale-95 border border-white/80"
            >
              <IconFonts size={16} className="text-indigo-600" />
              <span>مشاريعي</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Tools Hub Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="font-heading font-bold text-lg text-slate-900">
            أدوات الاستوديو
          </h2>
          <span className="text-xs text-slate-500 font-medium">5 أدوات متخصصة</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tools.map((tool) => {
            const IconComp = tool.icon;
            return (
              <Link
                key={tool.path}
                to={tool.path}
                className="liquid-glass-card p-6 flex flex-col justify-between group rounded-2xl border border-white/80 hover:border-sky-300 transition-all shadow-sm hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className={`w-11 h-11 rounded-xl ${tool.color} border flex items-center justify-center transition-transform group-hover:scale-105`}>
                      <IconComp size={22} />
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full liquid-glass-badge text-slate-700 text-[10px] font-bold">
                      {tool.badge}
                    </span>
                  </div>

                  <h3 className="font-heading font-bold text-base text-slate-900 group-hover:text-sky-600 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="font-body text-xs text-slate-600 leading-relaxed">
                    {tool.desc}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-sky-600 group-hover:translate-x-[-4px] transition-transform">
                  <span>فتح الأداة</span>
                  <IconArrowLeft size={14} />
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
};

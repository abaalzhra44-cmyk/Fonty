import React, { useState, useEffect } from 'react';
import { FontProject } from '../types';
import { generateColorFontBlob, generateColorWebPackage } from '../utils/colorFontBuilder';
import { defaultColorFontSettings } from '../utils/storage';
import { IconDownload, IconSparkles, IconCheck } from './icons/Icons';

interface Props {
  project: FontProject;
}

export const ColorFontPlayground: React.FC<Props> = ({ project }) => {
  const [fontUrl, setFontUrl] = useState<string | null>(null);
  const [fontFamilyName, setFontFamilyName] = useState<string>('ColorFontFamily');
  const [previewText, setPreviewText] = useState<string>('بسم الله الرحمن الرحيم - المخطوطات والخط العربي الملون');
  const [fontSize, setFontSize] = useState<number>(48);
  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState<number>(0);
  const [canvasBg, setCanvasBg] = useState<'pure-glass' | 'parchment' | 'crystal'>('pure-glass');
  const [copiedCSS, setCopiedCSS] = useState<boolean>(false);

  const colorSettings = project.settings.colorFontSettings || defaultColorFontSettings;
  const palettes = colorSettings.palettes || defaultColorFontSettings.palettes;

  useEffect(() => {
    try {
      const blob = generateColorFontBlob(project);
      const url = URL.createObjectURL(blob);
      const fontName = `ColorFont_${project.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

      const styleEl = document.createElement('style');
      styleEl.innerHTML = `
        @font-face {
          font-family: '${fontName}';
          src: url('${url}') format('truetype');
          font-weight: normal;
          font-style: normal;
        }
      `;
      document.head.appendChild(styleEl);
      setFontUrl(url);
      setFontFamilyName(fontName);

      return () => {
        URL.revokeObjectURL(url);
        document.head.removeChild(styleEl);
      };
    } catch {
      // Fallback
    }
  }, [project]);

  const handleDownloadFont = () => {
    try {
      const blob = generateColorFontBlob(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.settings.fontName || 'DoctorColorFont'}_COLR.ttf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('حدث خطأ أثناء تصدير ملف الخط الملون');
    }
  };

  const handleDownloadWebPackage = () => {
    try {
      const { css, html } = generateColorWebPackage(project);
      
      const blobCss = new Blob([css], { type: 'text/css' });
      const cssUrl = URL.createObjectURL(blobCss);
      const a = document.createElement('a');
      a.href = cssUrl;
      a.download = `color-font-style.css`;
      a.click();

      setTimeout(() => {
        const blobHtml = new Blob([html], { type: 'text/html' });
        const htmlUrl = URL.createObjectURL(blobHtml);
        const a2 = document.createElement('a');
        a2.href = htmlUrl;
        a2.download = `color-font-demo.html`;
        a2.click();
      }, 300);
    } catch {
      alert('حدث خطأ أثناء تصدير حزمة الويب');
    }
  };

  const currentPalette = palettes[selectedPaletteIdx] || palettes[0];

  return (
    <div className="bg-white/75 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-slate-900/5 ring-1 ring-slate-900/5 transition-all relative overflow-hidden">
      {/* Decorative ambient glass light */}
      <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-200/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-purple-200/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header & Export Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-200/60 relative z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-yellow-500/10 text-amber-600 border border-amber-200/80 flex items-center justify-center shadow-xs">
            <IconSparkles size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                مختبر تجربة وتصدير الخط الملون (COLR/CPAL Playground)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200 text-[10px] font-bold">
                زجاج فاتح نقي
              </span>
            </div>
            <p className="font-body text-xs text-slate-500 mt-0.5">
              عاين الخط الملون مباشرة وتأكد من تناسق الطبقات ولوحات الألوان قبل التصدير النهائي
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleDownloadWebPackage}
            className="px-4 py-2.5 rounded-2xl bg-white/80 hover:bg-white text-slate-700 border border-slate-200/80 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
          >
            <IconDownload size={16} />
            <span>تصدير حزمة الويب (CSS + HTML)</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadFont}
            className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white text-xs font-extrabold transition-all shadow-md shadow-amber-500/20 hover:opacity-95 flex items-center gap-2"
          >
            <IconDownload size={16} />
            <span>تصدير خط OpenType ملون (.TTF)</span>
          </button>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="p-4 bg-white/60 backdrop-blur-md border border-slate-200/80 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 shadow-xs">
        {/* Palette Switcher */}
        <div className="flex items-center gap-2.5">
          <span className="text-xs font-bold text-slate-700 shrink-0">
            اختر لوحة العرض:
          </span>
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {palettes.map((p, idx) => (
              <button
                key={p.id || idx}
                type="button"
                onClick={() => setSelectedPaletteIdx(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                  selectedPaletteIdx === idx
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/20'
                    : 'bg-white/80 text-slate-700 border border-slate-200/80 hover:bg-white'
                }`}
              >
                <span
                  className="w-3 h-3 rounded-full border border-white/80 shadow-2xs"
                  style={{ backgroundColor: p.colors[0] || '#D4AF37' }}
                />
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Font Size & Canvas Theme */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-600 font-bold">الحجم: {fontSize}px</span>
            <input
              type="range"
              min="20"
              max="120"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value, 10))}
              className="w-24 accent-amber-500 cursor-pointer h-1.5 rounded-lg bg-slate-200"
            />
          </div>

          <div className="flex items-center gap-1 bg-white/80 p-1 rounded-xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => setCanvasBg('pure-glass')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                canvasBg === 'pure-glass'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              زجاج نقي
            </button>
            <button
              type="button"
              onClick={() => setCanvasBg('parchment')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                canvasBg === 'parchment'
                  ? 'bg-amber-100 text-amber-900 shadow-xs border border-amber-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              رق قديماً
            </button>
            <button
              type="button"
              onClick={() => setCanvasBg('crystal')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all ${
                canvasBg === 'crystal'
                  ? 'bg-sky-100 text-sky-900 shadow-xs border border-sky-200'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              كريستال
            </button>
          </div>
        </div>
      </div>

      {/* Input Text Field */}
      <div className="relative z-10">
        <input
          type="text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="اكتب نصاً للمعاينة..."
          className="w-full px-5 py-3.5 rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-md text-slate-900 text-base font-arabic outline-none focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all shadow-xs"
        />
      </div>

      {/* Live Color Font Stage */}
      <div
        className={`min-h-[280px] p-8 rounded-3xl border transition-all flex flex-col items-center justify-center text-center relative overflow-hidden z-10 shadow-inner ${
          canvasBg === 'pure-glass'
            ? 'bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 border-slate-800 text-white'
            : canvasBg === 'parchment'
            ? 'bg-gradient-to-br from-[#FCF9F0] via-[#FAF5E6] to-[#F7F0DC] border-amber-200/80 text-[#3e2723]'
            : 'bg-gradient-to-br from-sky-50/80 via-white to-indigo-50/80 border-sky-200/80 text-slate-900'
        }`}
      >
        <span className="absolute top-4 right-4 text-[10px] font-mono font-bold opacity-75 bg-white/20 backdrop-blur-md px-3 py-1 rounded-xl border border-white/20">
          OpenType COLR/CPAL Canvas - Palette #{selectedPaletteIdx + 1}
        </span>

        {fontUrl ? (
          <div
            style={{
              fontFamily: `'${fontFamilyName}', sans-serif`,
              fontSize: `${fontSize}px`,
              lineHeight: 1.4,
              direction: 'rtl',
            }}
            className="w-full break-words select-text transition-all duration-300 drop-shadow-sm"
          >
            {previewText}
          </div>
        ) : (
          <div className="text-xs font-bold opacity-75 animate-pulse">
            جاري تهيئة محرك الخطوط الملونة...
          </div>
        )}
      </div>
    </div>
  );
};

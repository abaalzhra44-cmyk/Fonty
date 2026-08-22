import React, { useState } from 'react';
import { CompareFontItem } from '../types';
import {
  IconCompare,
  IconUpload,
  IconTrash,
  IconSliders,
  IconSparkles,
} from '../components/icons/Icons';

export const ComparePage: React.FC = () => {
  const [sampleText, setSampleText] = useState('دكتور الخطوط - منصة تحويل المخطوطات والرسوم إلى خطوط طباعية');
  const [fontSize, setFontSize] = useState(32);

  const [fonts, setFonts] = useState<CompareFontItem[]>([
    {
      id: 'default_rubik',
      name: 'خط Rubik (المرجع الافتراضي)',
      fontFamily: 'Rubik, sans-serif',
      isDefault: true,
    },
    {
      id: 'default_kufam',
      name: 'خط Kufam (مرجع العناوين)',
      fontFamily: 'Kufam, sans-serif',
      isDefault: true,
    },
  ]);

  const handleUploadFonts = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files) as File[];

    files.forEach((file) => {
      const url = URL.createObjectURL(file);
      const fontId = 'cmp_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
      const fontNameClean = file.name.replace(/\.[^/.]+$/, '');
      const familyName = `CmpFont_${fontId}`;

      const styleEl = document.createElement('style');
      styleEl.innerHTML = `
        @font-face {
          font-family: '${familyName}';
          src: url('${url}');
        }
      `;
      document.head.appendChild(styleEl);

      const newItem: CompareFontItem = {
        id: fontId,
        name: fontNameClean,
        fontFamily: familyName,
        url,
        isDefault: false,
      };

      setFonts((prev) => [...prev, newItem]);
    });
  };

  const handleDeleteFont = (id: string) => {
    setFonts((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <div className="pb-28 pt-6 px-4 max-w-5xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 flex items-center justify-center">
              <IconCompare size={22} />
            </div>
            <h1 className="font-heading font-bold text-2xl text-slate-900">
              مقارنة الخطوط الطباعية
            </h1>
          </div>
          <p className="font-body text-xs text-slate-600">
            قارن أداء وتراكيب عدة خطوط بجانب بعضها البعض تحكّمًا بالحجم والنص التجريبي
          </p>
        </div>

        {/* Upload Multiple Fonts Button */}
        <label className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-105">
          <IconUpload size={16} />
          <span>رفع خطوط للمقارنة (.ttf/.otf)</span>
          <input
            type="file"
            multiple
            accept=".ttf, .otf"
            onChange={handleUploadFonts}
            className="hidden"
          />
        </label>
      </div>

      {/* Control Panel */}
      <div className="liquid-glass-card p-6 space-y-4 shadow-xl border border-white/80">
        <div className="flex items-center gap-2 text-sky-600 text-xs font-semibold">
          <IconSliders size={16} />
          <span>لوحة التحكم بالنص والحجم</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-600 mb-1.5">
              النص التجريبي للمقارنة
            </label>
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-slate-900 text-sm focus:outline-none shadow-xs"
            />
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-slate-600 mb-1.5">
              <span>حجم الخط:</span>
              <span className="text-sky-600 font-bold">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="16"
              max="72"
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="w-full accent-sky-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Font Comparison List */}
      <div className="space-y-4">
        {fonts.map((f) => (
          <div
            key={f.id}
            className="liquid-glass-card p-6 space-y-3 transition-all border border-white/80"
          >
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <div className="flex items-center gap-2">
                <span className="font-heading font-bold text-sm text-slate-900">
                  {f.name}
                </span>
                {f.isDefault ? (
                  <span className="px-2.5 py-0.5 rounded-full bg-white/60 text-slate-700 text-[10px] font-medium border border-white/80">
                    مرجع افتراضي
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full liquid-glass-badge text-sky-700 text-[10px] font-semibold">
                    مستورد
                  </span>
                )}
              </div>

              {!f.isDefault && (
                <button
                  type="button"
                  onClick={() => handleDeleteFont(f.id)}
                  className="p-1.5 rounded-lg liquid-glass-button text-rose-600 hover:bg-rose-500/10 transition-colors"
                  title="إزالة الخط"
                >
                  <IconTrash size={16} />
                </button>
              )}
            </div>

            {/* Rendered Sample */}
            <div className="pt-2 min-h-[60px] flex items-center overflow-x-auto">
              <p
                style={{ fontFamily: f.fontFamily, fontSize: `${fontSize}px` }}
                className="text-slate-900 whitespace-nowrap leading-normal"
              >
                {sampleText || 'دكتور الخطوط'}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

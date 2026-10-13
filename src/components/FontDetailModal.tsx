import React, { useState, useEffect } from 'react';
import { GalleryFontItem } from '../data/galleryFonts';
import { registerDynamicFontFace } from '../utils/fontBuilder';
import { downloadFontFile } from '../utils/fontDownloader';
import { ensureGoogleFontLoaded } from '../data/googleFonts';
import { FontStarRating } from './FontStarRating';
import {
  IconClose,
  IconDownload,
  IconCheck,
  IconCopy,
  IconSparkles,
  IconLayers,
  IconFileText,
  IconStar,
} from './icons/Icons';

interface FontDetailModalProps {
  fontItem: GalleryFontItem | null;
  onClose: () => void;
  customText: string;
}

export const FontDetailModal: React.FC<FontDetailModalProps> = React.memo(({
  fontItem,
  onClose,
  customText,
}) => {
  const [copiedCss, setCopiedCss] = useState(false);
  const [activeTab, setActiveTab] = useState<'preview' | 'glyphs' | 'code' | 'info'>('preview');
  const [previewSize, setPreviewSize] = useState(48);
  const [previewText, setPreviewText] = useState(customText || fontItem?.sampleText || 'Fonty فونتي للطباعة الرقمية');
  const [modalWeight, setModalWeight] = useState(400);
  const [modalSlant, setModalSlant] = useState(0);

  if (!fontItem) return null;

  useEffect(() => {
    if (fontItem) {
      ensureGoogleFontLoaded(fontItem.googleFamily || fontItem.nameEn, undefined, fontItem.directFontFiles);
    }
  }, [fontItem]);

  const googleFamilyName = fontItem.googleFamily || fontItem.nameEn;
  const googleCssCode = `@import url('https://fonts.googleapis.com/css2?family=${googleFamilyName.replace(/\s+/g, '+')}&display=swap');

/* الاستخدام في CSS مع الخطوط المتغيرة (Variable Fonts) */
.custom-arabic-text {
  font-family: '${googleFamilyName}', 'Cairo', sans-serif;
  font-weight: ${modalWeight};
  font-style: ${modalSlant !== 0 ? `oblique ${Math.abs(modalSlant)}deg` : 'normal'};
  font-variation-settings: 'wght' ${modalWeight}, 'slnt' ${modalSlant};
}`;

  const fontClassName = fontItem.googleFamily
    ? fontItem.googleFamily
    : registerDynamicFontFace(fontItem.project);

  const handleDownloadTTF = async () => {
    await downloadFontFile(fontItem.nameEn, fontItem.googleFamily, fontItem.project, fontItem.directFontFiles);
  };

  const handleCopyCss = () => {
    navigator.clipboard.writeText(googleCssCode);
    setCopiedCss(true);
    setTimeout(() => setCopiedCss(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xl animate-fade-in">
      <div className="apple-glass-modal shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden transition-all border border-white/80">
        {/* Modal Header */}
        <div className="p-6 border-b border-white/60 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-300/40 flex items-center justify-center text-sky-700 font-heading font-bold text-xl shadow-inner">
              {fontItem.category.slice(0, 1)}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-xl font-heading font-bold text-slate-900">{fontItem.name}</h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold liquid-glass-badge text-sky-700">
                  {fontItem.category}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <p className="text-xs text-slate-600 font-body">بواسطة: {fontItem.designer}</p>
                <FontStarRating fontId={fontItem.id} fontName={fontItem.name} compact />
              </div>
            </div>

          </div>

          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full liquid-glass-button text-slate-600 hover:text-slate-900 flex items-center justify-center transition-colors"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Modal Navigation Tabs (Apple Segmented Control Style) */}
        <div className="flex border-b border-white/60 bg-white/40 backdrop-blur-md px-6 pt-2 gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveTab('preview')}
            className={`py-2.5 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'preview'
                ? 'border-sky-500 text-sky-700 bg-white/80 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            معاينة وتجربة
          </button>
          <button
            onClick={() => setActiveTab('glyphs')}
            className={`py-2.5 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'glyphs'
                ? 'border-sky-500 text-sky-700 bg-white/80 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            جدول المحارف والتركيبات ({fontItem.project.glyphs?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('code')}
            className={`py-2.5 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'code'
                ? 'border-sky-500 text-sky-700 bg-white/80 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            كود الاستخدام CSS
          </button>
          <button
            onClick={() => setActiveTab('info')}
            className={`py-2.5 px-4 font-bold text-xs rounded-t-xl transition-all border-b-2 whitespace-nowrap ${
              activeTab === 'info'
                ? 'border-sky-500 text-sky-700 bg-white/80 shadow-sm'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            معلومات الخط
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'preview' && (
            <div className="space-y-6">
              {/* Controls */}
              <div className="liquid-glass-card p-5 space-y-4 border border-white/80">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      حجم الخط ({previewSize}px)
                    </label>
                    <input
                      type="range"
                      min="20"
                      max="96"
                      value={previewSize}
                      onChange={(e) => setPreviewSize(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      الوزن المتغير (wght: {modalWeight})
                    </label>
                    <input
                      type="range"
                      min="100"
                      max="900"
                      step="10"
                      value={modalWeight}
                      onChange={(e) => setModalWeight(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">
                      الميل المتغير (slnt: {modalSlant}°)
                    </label>
                    <input
                      type="range"
                      min="-15"
                      max="0"
                      step="1"
                      value={modalSlant}
                      onChange={(e) => setModalSlant(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">النص المخصص للتجربة</label>
                  <input
                    type="text"
                    value={previewText}
                    onChange={(e) => setPreviewText(e.target.value)}
                    className="w-full px-3.5 py-2.5 liquid-glass-input rounded-xl text-sm focus:outline-none text-slate-900"
                  />
                </div>
              </div>

              {/* Large Font Display Box */}
              <div className="p-10 liquid-glass-card border border-white/80 rounded-3xl text-center min-h-[220px] flex items-center justify-center overflow-x-auto shadow-inner bg-white/40">
                <p
                  style={{
                    fontFamily: `'${fontClassName}', ${fontItem.fontFamilyFallback}`,
                    fontSize: `${previewSize}px`,
                    lineHeight: 1.4,
                    fontWeight: modalWeight,
                    fontStyle: modalSlant !== 0 ? `oblique ${Math.abs(modalSlant)}deg` : 'normal',
                    fontVariationSettings: `'wght' ${modalWeight}, 'slnt' ${modalSlant}`,
                  }}
                  className="text-slate-900 transition-all duration-200 break-words max-w-full"
                >
                  {previewText || fontItem.sampleText}
                </p>
              </div>

              {/* Multi-size waterfall view */}
              <div className="space-y-3 liquid-glass-card p-6 border border-white/80">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  تدرج أحجام العرض (Waterfall)
                </h4>
                {[36, 28, 22, 16].map((sz) => (
                  <div key={sz} className="border-b border-white/50 pb-3 flex items-baseline gap-4">
                    <span className="text-xs font-mono font-bold text-slate-400 w-12">{sz}px</span>
                    <p
                      style={{
                        fontFamily: `'${fontClassName}', ${fontItem.fontFamilyFallback}`,
                        fontSize: `${sz}px`,
                        fontWeight: modalWeight,
                        fontStyle: modalSlant !== 0 ? `oblique ${Math.abs(modalSlant)}deg` : 'normal',
                        fontVariationSettings: `'wght' ${modalWeight}, 'slnt' ${modalSlant}`,
                      }}
                      className="text-slate-800 truncate"
                    >
                      {previewText || 'بسم الله الرحمن الرحيم - Fonty فونتي'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'glyphs' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600 font-medium">
                يحتوي هذا الخط على {fontItem.project.glyphs?.length || 0} محرف وتركيبة خطية معرفة في النظام:
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {(fontItem.project.glyphs || []).map((g) => (
                  <div
                    key={g.id}
                    className="p-3.5 liquid-glass-card border border-white/80 rounded-2xl flex flex-col items-center justify-between hover:border-sky-400 hover:scale-105 transition-all shadow-xs"
                  >
                    <span className="text-2xl font-bold text-slate-900 my-2">{g.trigger}</span>
                    <div className="text-[10px] text-slate-500 font-mono text-center truncate w-full">
                      {g.trigger} ({g.type})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-slate-700 font-medium">
                  انسخ كود CSS المباشر لتضمين الخط في موقعك الإلكتروني أو تطبيقك:
                </p>
                <button
                  onClick={handleCopyCss}
                  className="px-4 py-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-md shadow-sky-500/20 border border-white/20"
                >
                  {copiedCss ? <IconCheck size={16} /> : <IconSparkles size={16} />}
                  <span>{copiedCss ? 'تم النسخ!' : 'نسخ كود CSS'}</span>
                </button>
              </div>

              <pre dir="ltr" className="p-4 apple-glass-dark rounded-2xl text-xs font-mono overflow-x-auto leading-relaxed border border-white/20 shadow-xl">
                <code>{googleCssCode}</code>
              </pre>
            </div>
          )}

          {activeTab === 'info' && (
            <div className="space-y-6">
              {/* Rating Overview and Breakdown */}
              <div className="bg-gradient-to-br from-amber-500/15 via-amber-50/60 to-white/70 p-5 rounded-2xl border border-amber-200/90 space-y-4 shadow-sm backdrop-blur-md">
                <div className="flex items-center justify-between flex-wrap gap-2 border-b border-amber-200/60 pb-3">
                  <h4 className="font-heading font-bold text-sm text-slate-800 flex items-center gap-2">
                    <IconStar size={18} fill="#f59e0b" className="text-amber-500" />
                    تقييم الخط وآراء المستخدمين المسجلين
                  </h4>
                  <span className="text-[11px] font-semibold text-amber-800 bg-amber-100/90 px-2.5 py-0.5 rounded-full border border-amber-300 shadow-xs">
                    نظام تقييم مباشر
                  </span>
                </div>

                <FontStarRating fontId={fontItem.id} fontName={fontItem.name} showBreakdown={true} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="liquid-glass-card p-5 border border-white/80 space-y-3">
                  <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                    <IconFileText size={18} className="text-sky-600" />
                    وصف الخط والمصمم
                  </h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{fontItem.description}</p>
                  <div className="pt-2 border-t border-white/60 text-xs text-slate-600 space-y-1">
                    <div><strong>المصمم:</strong> {fontItem.designer}</div>
                    <div><strong>النوع:</strong> {fontItem.category}</div>
                    <div><strong>الأوزان المتاحة:</strong> {fontItem.weights.join(', ')}</div>
                  </div>
                </div>

                <div className="liquid-glass-card p-5 border border-white/80 space-y-3">
                  <h4 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
                    <IconLayers size={18} className="text-sky-600" />
                    الوسوم والرموز
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {fontItem.tags.map((tag) => (
                      <span key={tag} className="px-3 py-1 liquid-glass-badge text-xs text-slate-700 font-medium">
                        #{tag}
                      </span>
                    ))}
                  </div>
                  <div className="pt-4 text-xs text-slate-600 space-y-1 border-t border-white/60">
                    <div><strong>وحدات القياس:</strong> 1024 Em</div>
                    <div><strong>الرخصة:</strong> {fontItem.project.settings.copyright}</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer Actions */}
        <div className="p-5 border-t border-white/60 bg-white/50 backdrop-blur-md flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadTTF}
              className="px-5 py-2.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all border border-white/20"
            >
              <IconDownload size={16} />
              <span>تحميل ملف الخط (TTF / OTF)</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2.5 liquid-glass-button text-slate-700 hover:text-slate-900 rounded-xl text-xs font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
});

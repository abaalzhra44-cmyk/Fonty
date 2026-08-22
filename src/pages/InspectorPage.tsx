import React, { useState } from 'react';
import * as opentype from 'opentype.js';
import { FontInspectionData, GlyphItem } from '../types';
import { SkeletonCard } from '../components/Skeleton';
import { GlyphTableInspector } from '../components/GlyphTableInspector';
import {
  IconInspector,
  IconUpload,
  IconFileText,
  IconCheck,
  IconAlert,
  IconLayers,
  IconSparkles,
} from '../components/icons/Icons';

export const InspectorPage: React.FC = () => {
  const [fontData, setFontData] = useState<FontInspectionData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const processFontFile = async (file: File) => {
    setError(null);
    setIsLoading(true);

    try {
      const buffer = await file.arrayBuffer();
      const font = opentype.parse(buffer);

      const getName = (key: string): string => {
        if (!font.names) return 'غير محدد';
        const platforms = ['unicode', 'windows', 'macintosh'];
        for (const plat of platforms) {
          if (font.names[plat] && font.names[plat][key]) {
            const valObj = font.names[plat][key];
            let str = '';
            if (typeof valObj === 'string') str = valObj;
            else if (valObj.en) str = valObj.en;
            else {
              const firstKey = Object.keys(valObj)[0];
              if (firstKey && valObj[firstKey]) str = valObj[firstKey];
            }
            str = str ? str.trim() : '';
            if (str.length > 0) return str;
          }
        }
        if (font.names[key]) {
          const valObj = font.names[key];
          let str = '';
          if (typeof valObj === 'string') str = valObj;
          else if (valObj.en) str = valObj.en;
          else {
            const firstKey = Object.keys(valObj)[0];
            if (firstKey && valObj[firstKey]) str = valObj[firstKey];
          }
          str = str ? str.trim() : '';
          if (str.length > 0) return str;
        }
        return 'غير محدد';
      };

      const familyName = getName('fontFamily') !== 'غير محدد'
        ? getName('fontFamily')
        : (getName('preferredFamily') !== 'غير محدد' ? getName('preferredFamily') : file.name.replace(/\.[^/.]+$/, ''));

      const styleName = getName('fontSubfamily') !== 'غير محدد'
        ? getName('fontSubfamily')
        : (getName('preferredSubfamily') !== 'غير محدد' ? getName('preferredSubfamily') : 'Regular');

      const fullName = getName('fullName') !== 'غير محدد'
        ? getName('fullName')
        : `${familyName} ${styleName}`;

      const glyphItems: GlyphItem[] = [];
      const numGlyphs = font.numGlyphs || (font.glyphs ? (font.glyphs.length || 0) : 0);

      for (let i = 0; i < numGlyphs; i++) {
        const g = font.glyphs?.get ? font.glyphs.get(i) : (font.glyphs ? (font.glyphs as any)[i] : null);
        if (!g) continue;

        let triggerChar = '';
        if (g.unicode !== undefined && g.unicode > 0) {
          triggerChar = String.fromCharCode(g.unicode);
        } else if (g.unicodes && g.unicodes.length > 0) {
          triggerChar = g.unicodes.map((u: number) => String.fromCharCode(u)).join('');
        } else {
          triggerChar = g.name || `g_${i}`;
        }

        let svgPath = '';
        try {
          const pathObj = g.getPath(400, 550, 450);
          svgPath = pathObj.toPathData(2);
        } catch (err) {
          svgPath = 'M 100 100 h 600 v 600 h -600 Z';
        }

        glyphItems.push({
          id: `g_${i}_${g.name || i}`,
          trigger: triggerChar || `g_${i}`,
          type: (triggerChar.length > 1 || !g.unicode) ? 'ligature' : 'direct',
          svgPath: svgPath || 'M 100 100 h 600 v 600 h -600 Z',
          advanceWidth: Math.round(g.advanceWidth || 350),
          createdAt: Date.now(),
        });
      }

      const parsedData: FontInspectionData = {
        name: fullName,
        familyName: familyName,
        styleName: styleName,
        postScriptName: getName('postScriptName') !== 'غير محدد' ? getName('postScriptName') : `${familyName.replace(/\s+/g, '')}-${styleName}`,
        version: getName('version') !== 'غير محدد' ? getName('version') : '1.000',
        designer: getName('designer'),
        manufacturer: getName('manufacturer'),
        copyright: getName('copyright'),
        license: getName('licenseDescription') !== 'غير محدد' ? getName('licenseDescription') : getName('license'),
        licenseUrl: getName('licenseUrl') !== 'غير محدد' ? getName('licenseUrl') : getName('licenseURL'),
        glyphCount: numGlyphs,
        unitsPerEm: font.unitsPerEm || 1024,
        ascender: font.ascender || 880,
        descender: font.descender || -144,
        fileSize: Math.round(file.size / 1024) || 1,
        glyphs: glyphItems,
      };

      setFontData(parsedData);
    } catch (err: any) {
      setError(err.message || 'تعذر قراءة ملف الخط. يرجى التأكد من رفع ملف TTF أو OTF صالي.');
      setFontData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFontFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFontFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="pb-28 pt-6 px-4 max-w-5xl mx-auto space-y-8">
      {/* Page Title */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-600 mx-auto flex items-center justify-center">
          <IconInspector size={24} />
        </div>
        <h1 className="font-heading font-bold text-2xl md:text-3xl text-slate-900">
          مفتش الخطوط الطباعية
        </h1>
        <p className="font-body text-sm text-slate-600 max-w-xl mx-auto">
          قم بسحب وإفلات أو رفع ملف خط (TTF / OTF) لفحص البيانات المضمنة والحقوق والخصائص التقنية مباشرة.
        </p>
      </div>

      {/* Drag & Drop Upload Zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`liquid-glass-card border-2 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer relative overflow-hidden shadow-xl border-white/80 ${
          dragActive
            ? 'border-sky-500 bg-sky-500/15'
            : 'hover:border-sky-500/50'
        }`}
      >
        <input
          type="file"
          accept=".ttf, .otf, font/ttf, font/otf"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
        />

        <div className="space-y-4 max-w-md mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-600 mx-auto flex items-center justify-center">
            <IconUpload size={32} />
          </div>

          <div>
            <p className="font-heading font-bold text-base text-slate-900 mb-1">
              اسحب وأسقط ملف الخط هنا
            </p>
            <p className="font-body text-xs text-slate-500">
              يدعم ملفات TTF و OTF فقط
            </p>
          </div>

          <button
            type="button"
            className="px-6 py-2.5 rounded-xl liquid-glass-button text-slate-800 font-medium text-xs hover:bg-sky-600 hover:text-white transition-colors"
          >
            استعراض الملفات
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="space-y-4">
          <div className="p-4 bg-white border border-slate-200 rounded-2xl text-center text-sm text-sky-600 flex items-center justify-center gap-2">
            <span className="w-4 h-4 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
            <span>جاري فحص جداول الخط وقراءة الهيكل...</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-sm flex items-center gap-3">
          <IconAlert size={20} />
          <span>{error}</span>
        </div>
      )}

      {/* Results Cards & Glyph Table */}
      {fontData && (
        <div className="space-y-8 animate-fade-in">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Card 1: Identity */}
            <div className="liquid-glass-card p-6 space-y-4 shadow-xl border border-white/80">
              <div className="flex items-center gap-2.5 text-sky-600 font-heading font-bold text-base border-b border-white/60 pb-3">
                <IconFileText size={20} />
                <span>بطاقة الهوية والأسماء</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">الاسم الكامل:</span>
                  <span className="text-slate-900 font-semibold text-sm">{fontData.name}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">اسم العائلة (Family):</span>
                  <span className="text-slate-900 font-medium">{fontData.familyName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">النمط (Subfamily/Style):</span>
                  <span className="text-slate-900 font-medium">{fontData.styleName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">PostScript Name:</span>
                  <span className="text-slate-900 font-mono text-[11px]">{fontData.postScriptName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الإصدار (Version):</span>
                  <span className="text-slate-900 font-medium">{fontData.version}</span>
                </div>
              </div>
            </div>

            {/* Card 2: Rights & License */}
            <div className="liquid-glass-card p-6 space-y-4 shadow-xl border border-white/80">
              <div className="flex items-center gap-2.5 text-sky-600 font-heading font-bold text-base border-b border-white/60 pb-3">
                <IconSparkles size={20} />
                <span>الحقوق والترخيص</span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-500 block">المصمم:</span>
                  <span className="text-slate-900 font-medium">{fontData.designer}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">الجهة المصنعة / الموزع:</span>
                  <span className="text-slate-900 font-medium">{fontData.manufacturer}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">حقوق النشر (Copyright):</span>
                  <span className="text-slate-900 font-medium">{fontData.copyright}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">وصف الترخيص:</span>
                  <span className="text-slate-900 font-medium leading-relaxed">{fontData.license}</span>
                </div>
              </div>
            </div>

            {/* Card 3: Technical Specs */}
            <div className="liquid-glass-card p-6 space-y-4 shadow-xl border border-white/80">
              <div className="flex items-center gap-2.5 text-sky-600 font-heading font-bold text-base border-b border-white/60 pb-3">
                <IconLayers size={20} />
                <span>الخصائص التقنية</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">عدد الجليفات (Glyphs):</span>
                  <span className="text-sky-600 font-bold text-sm">{fontData.glyphCount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">وحدات Em (unitsPerEm):</span>
                  <span className="text-slate-900 font-medium">{fontData.unitsPerEm}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ارتفاع Ascender:</span>
                  <span className="text-slate-900 font-medium">{fontData.ascender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">انخفاض Descender:</span>
                  <span className="text-slate-900 font-medium">{fontData.descender}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">حجم الملف:</span>
                  <span className="text-slate-900 font-medium">{fontData.fileSize} KB</span>
                </div>
              </div>
            </div>
          </div>

          {/* Full Glyph Table Inspector */}
          {fontData.glyphs && fontData.glyphs.length > 0 && (
            <GlyphTableInspector
              glyphs={fontData.glyphs}
              fontName={fontData.name || fontData.familyName}
              title="جدول جليفات ومحارف الخط المرفوع بالكامل"
            />
          )}
        </div>
      )}
    </div>
  );
};

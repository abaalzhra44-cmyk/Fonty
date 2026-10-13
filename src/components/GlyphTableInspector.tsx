import React, { useState, useMemo, useCallback } from 'react';
import { GlyphItem, FontProject } from '../types';
import {
  IconDownload,
  IconRuler,
  IconTrash,
  IconSearch,
  IconGrid,
  IconClose,
  IconEye,
  IconSparkles,
  IconCheck,
  IconEdit,
  IconType,
} from './icons/Icons';

interface GlyphTableInspectorProps {
  project?: FontProject;
  glyphs?: GlyphItem[];
  fontName?: string;
  title?: string;
  onFlipGlyph?: (glyphId: string) => void;
  onDeleteGlyph?: (glyphId: string) => void;
  onOpenRuler?: (glyph: GlyphItem) => void;
  onUpdateGlyphTrigger?: (glyphId: string, newTrigger: string) => void;
}

export const GlyphTableInspector: React.FC<GlyphTableInspectorProps> = React.memo(({
  project,
  glyphs,
  fontName,
  title,
  onFlipGlyph,
  onDeleteGlyph,
  onOpenRuler,
  onUpdateGlyphTrigger,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'direct' | 'ligature'>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [selectedGlyph, setSelectedGlyph] = useState<GlyphItem | null>(null);
  const [editingTrigger, setEditingTrigger] = useState<string>('');
  const [isEditingTriggerMode, setIsEditingTriggerMode] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [visibleLimit, setVisibleLimit] = useState<number>(40);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const glyphList = glyphs || project?.glyphs || [];
  const activeFontName = fontName || project?.settings?.fontName || 'Fonty';

  const triggerNotice = useCallback((msg: string) => {
    setActionNotice(msg);
    setTimeout(() => setActionNotice(null), 3000);
  }, []);

  // Helper to format Unicode code point
  const getUnicodePoint = useCallback((trigger: string) => {
    if (!trigger) return '-';
    return Array.from(trigger)
      .map((ch) => `U+${ch.charCodeAt(0).toString(16).toUpperCase().padStart(4, '0')}`)
      .join(' ');
  }, []);

  // Export glyph as SVG file
  const handleExportSVG = useCallback((glyph: GlyphItem) => {
    setExportingId(glyph.id);
    try {
      const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="800" height="800">
  <g transform="translate(400, 400) scale(1, ${glyph.isFlippedVertical ? -1 : 1}) translate(-400, -400)">
    <path d="${glyph.svgPath}" fill="#0f172a" />
  </g>
</svg>`;
      const blob = new Blob([svgHeader], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `glyph_${glyph.trigger}_${activeFontName.replace(/\s+/g, '_')}.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      triggerNotice(`تم تحميل ملف SVG للحرف (${glyph.trigger}) بنجاح`);
    } catch (err) {
      console.error('Error exporting SVG:', err);
    } finally {
      setTimeout(() => setExportingId(null), 400);
    }
  }, [activeFontName, triggerNotice]);

  // Export glyph as PNG file
  const handleExportPNG = useCallback((glyph: GlyphItem, dimension = 1000) => {
    setExportingId(glyph.id);
    try {
      const svgHeader = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" width="${dimension}" height="${dimension}">
  <g transform="translate(400, 400) scale(1, ${glyph.isFlippedVertical ? -1 : 1}) translate(-400, -400)">
    <path d="${glyph.svgPath}" fill="#0f172a" />
  </g>
</svg>`;
      const img = new Image();
      const svgBlob = new Blob([svgHeader], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = dimension;
        canvas.height = dimension;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          canvas.toBlob((pngBlob) => {
            if (pngBlob) {
              const pngUrl = URL.createObjectURL(pngBlob);
              const link = document.createElement('a');
              link.href = pngUrl;
              link.download = `glyph_${glyph.trigger}_${activeFontName.replace(/\s+/g, '_')}.png`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              URL.revokeObjectURL(pngUrl);
              triggerNotice(`تم تحميل صورة PNG (${dimension}px) للحرف (${glyph.trigger})`);
            }
          }, 'image/png');
        }
        URL.revokeObjectURL(url);
        setExportingId(null);
      };
      img.onerror = () => {
        URL.revokeObjectURL(url);
        setExportingId(null);
      };
      img.src = url;
    } catch (err) {
      console.error('Error exporting PNG:', err);
      setExportingId(null);
    }
  }, [activeFontName, triggerNotice]);

  // Filtered glyph list
  const filteredGlyphs = useMemo(() => {
    const list = glyphList || [];
    return list.filter((g) => {
      const trig = g.trigger || '';
      const matchesSearch =
        trig.includes(searchQuery) ||
        (g.id || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        getUnicodePoint(trig).toLowerCase().includes(searchQuery.toLowerCase());

      if (filterType === 'direct') return matchesSearch && (g.type === 'direct' || trig.length === 1);
      if (filterType === 'ligature') return matchesSearch && (g.type === 'ligature' || trig.length > 1);
      return matchesSearch;
    });
  }, [glyphList, searchQuery, filterType]);

  // Paginated/Sliced glyphs for high performance
  const displayedGlyphs = useMemo(() => {
    return filteredGlyphs.slice(0, visibleLimit);
  }, [filteredGlyphs, visibleLimit]);

  return (
    <div className="liquid-glass-card p-6 space-y-6 relative border border-white/80 shadow-xl">
      {/* Toast notice */}
      {actionNotice && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/90 backdrop-blur-md text-white text-xs px-4 py-2 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 animate-fade-in">
          <IconCheck size={14} className="text-emerald-400" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/50 pb-4">
        <div>
          <h3 className="font-heading font-bold text-lg text-slate-900 flex items-center gap-2">
            <span>{title || 'مفتش جليفات ومحارف الخط (Compact Glyph Table)'}</span>
            <span className="px-3 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-700 text-xs font-bold">
              {glyphList?.length || 0} محرف
            </span>
          </h3>
          <p className="font-body text-xs text-slate-500 mt-0.5">
            انقر على أي محرف لعرض تفاصيله وتنزيل رسمه الفردي بصيغة SVG أو PNG بسرعة فائقة.
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <div className="flex items-center bg-white/50 p-1 rounded-xl border border-white/80 text-xs backdrop-blur-md shadow-xs">
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white/90 text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              شبكة مصغرة
            </button>
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                viewMode === 'table'
                  ? 'bg-white/90 text-slate-900 shadow-sm font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              جدول مختصر
            </button>
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/40 p-3 rounded-2xl border border-white/60 backdrop-blur-md">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالحرف أو Unicode..."
            className="w-full pr-9 pl-4 py-2 rounded-xl bg-white/80 border border-slate-200/70 text-slate-900 text-xs focus:border-sky-500 focus:outline-none backdrop-blur-sm"
          />
          <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none">
            <IconSearch size={15} />
          </div>
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'all'
                ? 'bg-sky-600 text-white font-semibold shadow-sm'
                : 'bg-white/70 text-slate-600 border border-white/80'
            }`}
          >
            الكل ({glyphList?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterType('direct')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'direct'
                ? 'bg-sky-600 text-white font-semibold shadow-sm'
                : 'bg-white/70 text-slate-600 border border-white/80'
            }`}
          >
            حروف مباشرة
          </button>
          <button
            type="button"
            onClick={() => setFilterType('ligature')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              filterType === 'ligature'
                ? 'bg-sky-600 text-white font-semibold shadow-sm'
                : 'bg-white/70 text-slate-600 border border-white/80'
            }`}
          >
            تركيبات خطية
          </button>
        </div>
      </div>

      {/* Scrollable Compact Grid/Table Container */}
      <div className="max-h-[380px] sm:max-h-[440px] overflow-y-auto rounded-2xl border border-white/70 p-3 bg-white/30 backdrop-blur-lg shadow-inner space-y-4">
        {displayedGlyphs.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">لا توجد محارف تطابق البحث الحالي</div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2.5">
            {displayedGlyphs.map((glyph) => {
              const isSelected = selectedGlyph?.id === glyph.id;

              return (
                <button
                  key={glyph.id}
                  type="button"
                  onClick={() => setSelectedGlyph(glyph)}
                  className={`group p-2 rounded-xl border flex flex-col items-center justify-between gap-1 transition-all duration-200 backdrop-blur-md ${
                    isSelected
                      ? 'bg-sky-500/15 border-sky-500 ring-2 ring-sky-500/40 shadow-sm'
                      : 'bg-white/60 border-white/70 hover:border-sky-400 hover:shadow-md hover:bg-white/80'
                  }`}
                >
                  {/* SVG Thumbnail */}
                  <div className="w-10 h-10 bg-white/70 rounded-lg p-1 flex items-center justify-center overflow-hidden border border-white/60 shadow-xs">
                    <svg viewBox="0 0 800 800" className="w-full h-full text-slate-900">
                      <g
                        style={{
                          transformOrigin: '400px 400px',
                          transform: `scale(1, ${glyph.isFlippedVertical ? -1 : 1})`,
                        }}
                      >
                        <path d={glyph.svgPath} fill="currentColor" />
                      </g>
                    </svg>
                  </div>

                  {/* Character Label */}
                  <span className="font-heading font-bold text-sm text-slate-900 line-clamp-1">
                    {glyph.trigger}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          /* Table View - Liquid Glass Table */
          <div className="overflow-x-auto liquid-glass-table">
            <table className="w-full text-right text-xs">
              <thead className="glass-th text-slate-700 font-bold">
                <tr>
                  <th className="p-3 w-12 text-center">الرسم</th>
                  <th className="p-3">الحرف</th>
                  <th className="p-3">رمز Unicode</th>
                  <th className="p-3">النوع</th>
                  <th className="p-3 text-center">التحديد</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {displayedGlyphs.map((glyph) => {
                  const isSelected = selectedGlyph?.id === glyph.id;

                  return (
                    <tr
                      key={glyph.id}
                      onClick={() => setSelectedGlyph(glyph)}
                      className={`glass-tr cursor-pointer ${
                        isSelected ? 'bg-sky-500/15 font-semibold' : ''
                      }`}
                    >
                      <td className="p-2 text-center glass-td">
                        <div className="w-8 h-8 bg-white/80 rounded-lg p-0.5 mx-auto flex items-center justify-center border border-white/60">
                          <svg viewBox="0 0 800 800" className="w-full h-full text-slate-900">
                            <g
                              style={{
                                transformOrigin: '400px 400px',
                                transform: `scale(1, ${glyph.isFlippedVertical ? -1 : 1})`,
                              }}
                            >
                              <path d={glyph.svgPath} fill="currentColor" />
                            </g>
                          </svg>
                        </div>
                      </td>
                      <td className="p-2.5 font-heading font-bold text-sm glass-td">{glyph.trigger}</td>
                      <td className="p-2.5 font-mono text-[10px] text-slate-500 glass-td">{getUnicodePoint(glyph.trigger)}</td>
                      <td className="p-2.5 text-[11px] text-slate-600 glass-td">
                        {glyph.type === 'ligature' ? 'تركيب' : 'مباشر'}
                      </td>
                      <td className="p-2.5 text-center glass-td">
                        <span className="px-2.5 py-1 rounded-full bg-sky-100/80 text-sky-700 text-[10px] font-bold border border-sky-200/50">
                          {isSelected ? 'محدد حالياً' : 'تحديد'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Load More Button for High Performance */}
        {filteredGlyphs.length > visibleLimit && (
          <div className="pt-3 text-center">
            <button
              type="button"
              onClick={() => setVisibleLimit((prev) => prev + 50)}
              className="px-5 py-2 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold shadow-sm transition-colors"
            >
              عرض المزيد من الحروف ({filteredGlyphs.length - visibleLimit} متبقية)
            </button>
          </div>
        )}
      </div>

      {/* Selected Glyph Inspector Panel */}
      {selectedGlyph ? (
        <div className="bg-gradient-to-br from-sky-50/90 to-blue-50/90 border border-sky-200 rounded-3xl p-6 space-y-4 animate-fade-in shadow-md relative">
          <button
            type="button"
            onClick={() => setSelectedGlyph(null)}
            className="absolute top-4 left-4 p-1.5 rounded-full bg-white text-slate-400 hover:text-slate-700 border border-slate-200 transition-colors"
            title="إغلاق التحديد"
          >
            <IconClose size={16} />
          </button>

          <div className="flex flex-col sm:flex-row items-center gap-6">
            {/* Vector Big Render Box */}
            <div className="w-28 h-28 sm:w-32 sm:h-32 bg-white border border-slate-200 rounded-2xl p-3 flex items-center justify-center shadow-inner relative overflow-hidden">
              <svg viewBox="0 0 800 800" className="w-full h-full text-slate-900">
                <g
                  style={{
                    transformOrigin: '400px 400px',
                    transform: `scale(1, ${selectedGlyph.isFlippedVertical ? -1 : 1})`,
                  }}
                >
                  <path d={selectedGlyph.svgPath} fill="currentColor" />
                </g>
              </svg>
            </div>

            {/* Glyph Metadata & Controls */}
            <div className="space-y-3 flex-1 text-right">
              <div className="flex items-center gap-3 flex-wrap">
                {!isEditingTriggerMode ? (
                  <>
                    <span className="text-3xl font-heading font-extrabold text-slate-900">
                      {selectedGlyph.trigger}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTrigger(selectedGlyph.trigger);
                        setIsEditingTriggerMode(true);
                      }}
                      className="px-2.5 py-1 rounded-lg bg-sky-100 text-sky-800 hover:bg-sky-200 text-xs font-bold border border-sky-300 transition-colors flex items-center gap-1"
                      title="تعديل الحرف/الترقيم المركب"
                    >
                      <IconEdit size={13} />
                      <span>تعديل الترقيم</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-center gap-2 flex-wrap">
                    <input
                      type="text"
                      value={editingTrigger}
                      onChange={(e) => setEditingTrigger(e.target.value)}
                      placeholder="ادخل الترقيم الجديد..."
                      className="px-3 py-1.5 rounded-xl border-2 border-sky-500 bg-white text-slate-900 font-heading font-bold text-base focus:outline-none shadow-xs"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const trimmed = editingTrigger.trim();
                        if (trimmed && onUpdateGlyphTrigger) {
                          onUpdateGlyphTrigger(selectedGlyph.id, trimmed);
                          const isLiga = trimmed.length > 1;
                          setSelectedGlyph((prev) =>
                            prev
                              ? {
                                  ...prev,
                                  trigger: trimmed,
                                  type: isLiga ? 'ligature' : 'direct',
                                }
                              : null
                          );
                          triggerNotice(
                            `تم تحديث الترقيم إلى (${trimmed}) - ${
                              isLiga ? 'مُصنف تلقائياً: تركيبة ليجا' : 'مُصنف تلقائياً: حرف عادي'
                            }`
                          );
                        }
                        setIsEditingTriggerMode(false);
                      }}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      حفظ التغيير
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditingTriggerMode(false)}
                      className="px-2.5 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold"
                    >
                      إلغاء
                    </button>
                  </div>
                )}

                <span className="px-3 py-1 bg-sky-600 text-white rounded-xl text-xs font-bold shadow-sm">
                  {getUnicodePoint(selectedGlyph.trigger)}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 rounded-lg text-xs font-medium">
                  المعرف: {selectedGlyph.id}
                </span>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 font-mono flex-wrap">
                <span>العرض التقني: {selectedGlyph.advanceWidth || 350}px</span>
                <span>•</span>
                <span className={`font-bold px-2.5 py-1 rounded-md flex items-center gap-1 ${
                  selectedGlyph.trigger.length > 1 || selectedGlyph.type === 'ligature'
                    ? 'bg-amber-100 text-amber-900 border border-amber-300'
                    : 'bg-sky-100 text-sky-800 border border-sky-200'
                }`}>
                  {selectedGlyph.trigger.length > 1 || selectedGlyph.type === 'ligature' ? (
                    <>
                      <IconSparkles size={13} className="text-amber-600" />
                      <span>تركيبة ليجا تلقائية (Liga)</span>
                    </>
                  ) : (
                    <>
                      <IconType size={13} className="text-sky-600" />
                      <span>حرف فردي عادي (Single)</span>
                    </>
                  )}
                </span>
              </div>

              {/* Action Buttons for Selected Glyph */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleExportSVG(selectedGlyph)}
                  disabled={exportingId === selectedGlyph.id}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <IconDownload size={14} />
                  <span>تنزيل SVG (متجه)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleExportPNG(selectedGlyph, 1000)}
                  disabled={exportingId === selectedGlyph.id}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <IconDownload size={14} />
                  <span>تنزيل PNG (1000px)</span>
                </button>

                {onFlipGlyph && (
                  <button
                    type="button"
                    onClick={() => onFlipGlyph(selectedGlyph.id)}
                    className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <span>قلب رأسي ↕</span>
                  </button>
                )}

                {onOpenRuler && (
                  <button
                    type="button"
                    onClick={() => onOpenRuler(selectedGlyph)}
                    className="px-3 py-2 bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <IconRuler size={14} />
                    <span>المسطرة</span>
                  </button>
                )}

                {onDeleteGlyph && (
                  <button
                    type="button"
                    onClick={() => {
                      onDeleteGlyph(selectedGlyph.id);
                      setSelectedGlyph(null);
                    }}
                    className="px-3 py-2 bg-rose-50 border border-rose-200 text-rose-600 hover:bg-rose-100 rounded-xl text-xs font-semibold flex items-center gap-1"
                  >
                    <IconTrash size={14} />
                    <span>حذف</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-sky-50/60 border border-sky-100 rounded-2xl flex items-center justify-between text-xs text-sky-900">
          <div className="flex items-center gap-2">
            <IconSparkles size={16} />
            <span>نصيحة: اضغط على أي حرف في الشبكة أعلاه لمعاينة تكبيره وتنزيله فوراً بصيغة SVG أو PNG.</span>
          </div>
        </div>
      )}
    </div>
  );
});

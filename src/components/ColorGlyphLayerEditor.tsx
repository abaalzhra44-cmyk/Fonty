import React, { useState } from 'react';
import { FontProject, GlyphItem, ColorLayer } from '../types';
import { defaultColorFontSettings } from '../utils/storage';
import { parseSvgIntoColorLayers } from '../utils/colorFontBuilder';
import { ColorLayer3DViewer } from './ColorLayer3DViewer';
import { IconLayers, IconPlus, IconTrash, IconUpload, IconSparkles, IconLayers3D, IconEye } from './icons/Icons';

interface Props {
  project: FontProject;
  setProject: React.Dispatch<React.SetStateAction<FontProject>>;
}

export const ColorGlyphLayerEditor: React.FC<Props> = ({ project, setProject }) => {
  const glyphs = project.glyphs || [];
  const [selectedGlyphId, setSelectedGlyphId] = useState<string>(glyphs[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'2d' | '3d'>('3d');
  const [highlightedLayerIdx, setHighlightedLayerIdx] = useState<number | undefined>(undefined);

  const activeGlyph = glyphs.find((g) => g.id === selectedGlyphId) || glyphs[0];

  const colorSettings = project.settings.colorFontSettings || defaultColorFontSettings;
  const activePalette = colorSettings.palettes[colorSettings.activePaletteIndex] || colorSettings.palettes[0];
  const paletteColors = activePalette?.colors || ['#1A237E', '#D4AF37', '#B71C1C'];

  const handleUpdateGlyphLayers = (updatedLayers: ColorLayer[]) => {
    if (!activeGlyph) return;

    setProject((prev) => ({
      ...prev,
      glyphs: prev.glyphs.map((g) =>
        g.id === activeGlyph.id ? { ...g, colorLayers: updatedLayers } : g
      ),
    }));
  };

  const handleAddLayer = () => {
    if (!activeGlyph) return;
    const existingLayers = activeGlyph.colorLayers || [];
    const newLayer: ColorLayer = {
      id: `layer_${Date.now()}`,
      name: `طبقة لونية ${existingLayers.length + 1}`,
      svgPath: activeGlyph.svgPath || 'M 100 700 L 500 700 L 300 100 Z',
      paletteIndex: Math.min(existingLayers.length, paletteColors.length - 1),
    };
    handleUpdateGlyphLayers([...existingLayers, newLayer]);
  };

  const handleDeleteLayer = (index: number) => {
    if (!activeGlyph || !activeGlyph.colorLayers) return;
    const updated = activeGlyph.colorLayers.filter((_, i) => i !== index);
    handleUpdateGlyphLayers(updated);
  };

  const handleLayerChange = (index: number, key: keyof ColorLayer, value: any) => {
    if (!activeGlyph || !activeGlyph.colorLayers) return;
    const updated = activeGlyph.colorLayers.map((layer, i) =>
      i === index ? { ...layer, [key]: value } : layer
    );
    handleUpdateGlyphLayers(updated);
  };

  const handleAutoSplitSvg = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !activeGlyph) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const svgText = e.target?.result as string;
      if (!svgText) return;

      const { layers, extractedColors } = parseSvgIntoColorLayers(svgText);

      if (layers.length > 0) {
        if (extractedColors.length > 0) {
          setProject((prev) => {
            const currentSettings = prev.settings.colorFontSettings || defaultColorFontSettings;
            const updatedPalettes = currentSettings.palettes.map((pal, idx) => {
              if (idx !== currentSettings.activePaletteIndex) return pal;
              const mergedColors = [...pal.colors];
              extractedColors.forEach((c) => {
                if (!mergedColors.includes(c)) {
                  mergedColors.push(c);
                }
              });
              return { ...pal, colors: mergedColors };
            });

            return {
              ...prev,
              settings: {
                ...prev.settings,
                colorFontSettings: {
                  ...currentSettings,
                  palettes: updatedPalettes,
                },
              },
            };
          });
        }

        handleUpdateGlyphLayers(layers);
      }
    };
    reader.readAsText(file);
  };

  if (glyphs.length === 0) {
    return (
      <div className="bg-white/80 backdrop-blur-md border border-white/80 rounded-3xl p-8 text-center text-slate-500 shadow-xl shadow-slate-900/5">
        قم بإضافة محارف ورسومات في الاستوديو أولاً لتخصيص طبقات الألوان لها.
      </div>
    );
  }

  const layers = activeGlyph?.colorLayers || [];

  return (
    <div className="bg-white/75 backdrop-blur-xl border border-white/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl shadow-slate-900/5 ring-1 ring-slate-900/5 transition-all">
      {/* Pure Light Glass Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-200/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500/10 via-sky-500/10 to-indigo-500/10 text-purple-600 border border-purple-200/80 flex items-center justify-center shadow-xs">
            <IconLayers size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                محرر الطبقات اللونية المعماري (COLR Layer Architecture)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-purple-100 to-sky-100 text-purple-800 border border-purple-200/80 text-[10px] font-bold">
                زجاج فاتح نقي
              </span>
            </div>
            <p className="font-body text-xs text-slate-500 mt-0.5">
              قسّم المحارف إلى طبقات لونية متراكبة واستكشفها بالبعد ثلاثي الأبعاد 3D
            </p>
          </div>
        </div>

        {/* View mode switchers & SVG importer */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 bg-slate-100/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('3d')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === '3d'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 hover:bg-white/80'
              }`}
            >
              <IconLayers3D size={16} />
              <span>معاينة العمق 3D</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('2d')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === '2d'
                  ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-500/20'
                  : 'text-slate-600 hover:bg-white/80'
              }`}
            >
              <IconEye size={16} />
              <span>تحرير الطبقات 2D</span>
            </button>
          </div>

          <label className="px-4 py-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-sky-600 hover:opacity-95 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-purple-600/20">
            <IconUpload size={16} />
            <span>استيراد SVG ملون والتقسيم تلقائياً</span>
            <input
              type="file"
              accept=".svg"
              onChange={handleAutoSplitSvg}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Select Glyph & Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Glyph Selector Sidebar */}
        <div className="space-y-3 bg-white/60 backdrop-blur-md p-4 rounded-3xl border border-slate-200/80 shadow-xs">
          <label className="block text-xs font-extrabold text-slate-800">
            اختر المحرف أو الرسم للمعاينة:
          </label>
          <div className="grid grid-cols-3 lg:grid-cols-2 gap-2 max-h-[460px] overflow-y-auto pr-1 scrollbar-thin">
            {glyphs.map((g) => {
              const isSelected = (activeGlyph?.id || glyphs[0].id) === g.id;
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => {
                    setSelectedGlyphId(g.id);
                    setHighlightedLayerIdx(undefined);
                  }}
                  className={`p-3 rounded-2xl border flex flex-col items-center justify-center gap-1.5 transition-all ${
                    isSelected
                      ? 'border-purple-400 bg-gradient-to-br from-purple-50 to-sky-50 text-purple-700 font-extrabold shadow-md shadow-purple-500/10 ring-2 ring-purple-400/20'
                      : 'border-slate-200/80 bg-white/80 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                  }`}
                >
                  <span className="text-2xl font-arabic">{g.trigger || '؟'}</span>
                  <span className="text-[10px] text-slate-400 font-bold truncate max-w-full">
                    {g.colorLayers?.length ? `${g.colorLayers.length} طبقات` : 'لون واحد'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Display Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeGlyph && (
            <>
              {/* 3D Depth Preview Tab */}
              {activeTab === '3d' && (
                <ColorLayer3DViewer
                  layers={layers}
                  paletteColors={paletteColors}
                  glyphName={activeGlyph.trigger || 'غير مسمى'}
                  fallbackSvgPath={activeGlyph.svgPath}
                  activeLayerIndex={highlightedLayerIdx}
                  onSelectLayer={(idx) => setHighlightedLayerIdx(idx)}
                />
              )}

              {/* 2D Preview & Layer Controls Tab */}
              {activeTab === '2d' && (
                <div className="space-y-5 bg-white/60 backdrop-blur-md p-5 rounded-3xl border border-slate-200/80 shadow-xs">
                  {/* Pure Light Glass 2D Preview Box */}
                  <div className="p-8 bg-gradient-to-br from-slate-50 via-white to-sky-50/50 rounded-3xl flex flex-col items-center justify-center border border-white/90 shadow-inner relative overflow-hidden group">
                    <span className="absolute top-3 right-3 text-[10px] font-mono font-bold text-slate-600 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-200/80 shadow-xs">
                      المعاينة النقيّة للطبقات 2D
                    </span>

                    <svg viewBox="0 0 1000 1000" className="w-56 h-56 drop-shadow-xl transition-all group-hover:scale-105">
                      {layers.length > 0 ? (
                        layers.map((layer, idx) => {
                          const color = paletteColors[layer.paletteIndex] || paletteColors[0] || '#D4AF37';
                          const isHighlighted = highlightedLayerIdx === idx;
                          return (
                            <path
                              key={layer.id || idx}
                              d={layer.svgPath}
                              fill={color}
                              transform="scale(1, -1) translate(0, -900)"
                              opacity={highlightedLayerIdx === undefined || isHighlighted ? 1 : 0.3}
                              className="transition-all"
                            />
                          );
                        })
                      ) : (
                        <path
                          d={activeGlyph.svgPath}
                          fill={paletteColors[0] || '#1A237E'}
                          transform="scale(1, -1) translate(0, -900)"
                        />
                      )}
                    </svg>
                  </div>
                </div>
              )}

              {/* Layer Items List */}
              <div className="bg-white/80 backdrop-blur-md border border-slate-200/80 rounded-3xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-900">
                      قائمة الطبقات اللونية للمحارف ({layers.length} طبقة)
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      ربط كل طبقة بخانة لون من لوحة الألوان المختارة
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddLayer}
                    className="px-4 py-2 rounded-2xl bg-purple-50 text-purple-700 hover:bg-purple-100 text-xs font-bold flex items-center gap-1.5 transition-colors border border-purple-200/80"
                  >
                    <IconPlus size={14} />
                    <span>إضافة طبقة جديدة</span>
                  </button>
                </div>

                <div className="space-y-2.5">
                  {layers.length === 0 ? (
                    <div className="p-6 rounded-2xl border border-dashed border-slate-300/80 text-center text-xs text-slate-500 bg-slate-50/50">
                      لا توجد طبقات متعددة لهذا المحرف حتى الآن. انقر فوق &quot;إضافة طبقة جديدة&quot; أو قم باستيراد ملف SVG ملون.
                    </div>
                  ) : (
                    layers.map((layer, idx) => {
                      const currentColor = paletteColors[layer.paletteIndex] || paletteColors[0] || '#D4AF37';
                      const isSelectedLayer = highlightedLayerIdx === idx;
                      return (
                        <div
                          key={layer.id || idx}
                          onClick={() => setHighlightedLayerIdx(idx)}
                          className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all cursor-pointer ${
                            isSelectedLayer
                              ? 'bg-purple-50/70 border-purple-300 shadow-sm ring-2 ring-purple-300/30'
                              : 'bg-white border-slate-200/80 hover:bg-slate-50/80'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 text-xs font-extrabold flex items-center justify-center shrink-0 border border-slate-200">
                              {idx + 1}
                            </span>

                            <input
                              type="text"
                              value={layer.name}
                              onChange={(e) => handleLayerChange(idx, 'name', e.target.value)}
                              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-900 shadow-2xs focus:border-purple-500 focus:outline-none"
                            />
                          </div>

                          <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-4 h-4 rounded-full border border-slate-300 shadow-2xs shrink-0"
                                style={{ backgroundColor: currentColor }}
                              />
                              <label className="text-xs text-slate-600 font-bold">
                                لون اللوحة:
                              </label>
                            </div>

                            <select
                              value={layer.paletteIndex}
                              onChange={(e) => handleLayerChange(idx, 'paletteIndex', parseInt(e.target.value, 10))}
                              className="px-3 py-1.5 text-xs font-bold bg-white border border-slate-200 rounded-xl text-slate-900 shadow-2xs focus:border-purple-500 focus:outline-none"
                            >
                              {paletteColors.map((c, cIdx) => (
                                <option key={cIdx} value={cIdx}>
                                  لون {cIdx + 1} ({c})
                                </option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteLayer(idx);
                              }}
                              className="text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors border border-transparent hover:border-rose-200"
                              title="حذف الطبقة"
                            >
                              <IconTrash size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

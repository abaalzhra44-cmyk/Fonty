import React, { useState } from 'react';
import { FontProject, ColorFontSettings, ColorPalette } from '../types';
import { defaultColorFontSettings } from '../utils/storage';
import { IconPalette, IconPlus, IconTrash, IconCheck, IconSparkles } from './icons/Icons';

interface Props {
  project: FontProject;
  setProject: React.Dispatch<React.SetStateAction<FontProject>>;
}

export const ColorFontPaletteEditor: React.FC<Props> = ({ project, setProject }) => {
  const rawColor = project.settings.colorFontSettings;
  const colorSettings: ColorFontSettings = {
    enabled: rawColor?.enabled ?? defaultColorFontSettings.enabled,
    activePaletteIndex: rawColor?.activePaletteIndex ?? 0,
    palettes: Array.isArray(rawColor?.palettes) && rawColor.palettes.length > 0
      ? rawColor.palettes
      : defaultColorFontSettings.palettes,
  };

  const updateColorSettings = (updater: (prev: ColorFontSettings) => ColorFontSettings) => {
    setProject((prev) => {
      const currentRaw = prev.settings.colorFontSettings;
      const currentVal: ColorFontSettings = {
        enabled: currentRaw?.enabled ?? defaultColorFontSettings.enabled,
        activePaletteIndex: currentRaw?.activePaletteIndex ?? 0,
        palettes: Array.isArray(currentRaw?.palettes) && currentRaw.palettes.length > 0
          ? currentRaw.palettes
          : defaultColorFontSettings.palettes,
      };
      return {
        ...prev,
        settings: {
          ...prev.settings,
          colorFontSettings: updater(currentVal),
        },
      };
    });
  };

  const [selectedPaletteIdx, setSelectedPaletteIdx] = useState<number>(0);

  const activePalette = colorSettings.palettes[selectedPaletteIdx] || colorSettings.palettes[0];

  const handleToggleColorFont = () => {
    updateColorSettings((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));
  };

  const handleAddPalette = () => {
    const newPal: ColorPalette = {
      id: `pal_${Date.now()}`,
      name: `لوحة جديدة ${colorSettings.palettes.length + 1}`,
      colors: ['#1A237E', '#D4AF37', '#B71C1C', '#00695C', '#3E2723'],
    };
    updateColorSettings((prev) => ({
      ...prev,
      palettes: [...prev.palettes, newPal],
    }));
    setSelectedPaletteIdx(colorSettings.palettes.length);
  };

  const handleDeletePalette = (idx: number) => {
    if (colorSettings.palettes.length <= 1) return;
    updateColorSettings((prev) => ({
      ...prev,
      palettes: prev.palettes.filter((_, i) => i !== idx),
      activePaletteIndex: Math.min(prev.activePaletteIndex, prev.palettes.length - 2),
    }));
    setSelectedPaletteIdx((prev) => Math.max(0, prev - 1));
  };

  const handleUpdatePaletteName = (newName: string) => {
    updateColorSettings((prev) => ({
      ...prev,
      palettes: prev.palettes.map((p, i) => (i === selectedPaletteIdx ? { ...p, name: newName } : p)),
    }));
  };

  const handleColorChange = (colorIdx: number, newColor: string) => {
    updateColorSettings((prev) => ({
      ...prev,
      palettes: prev.palettes.map((p, i) => {
        if (i !== selectedPaletteIdx) return p;
        const newColors = [...p.colors];
        newColors[colorIdx] = newColor;
        return { ...p, colors: newColors };
      }),
    }));
  };

  const handleAddColorSlot = () => {
    updateColorSettings((prev) => ({
      ...prev,
      palettes: prev.palettes.map((p, i) => {
        if (i !== selectedPaletteIdx) return p;
        return { ...p, colors: [...p.colors, '#3B82F6'] };
      }),
    }));
  };

  const handleRemoveColorSlot = (colorIdx: number) => {
    updateColorSettings((prev) => ({
      ...prev,
      palettes: prev.palettes.map((p, i) => {
        if (i !== selectedPaletteIdx || p.colors.length <= 1) return p;
        return { ...p, colors: p.colors.filter((_, ci) => ci !== colorIdx) };
      }),
    }));
  };

  return (
    <div className="liquid-glass-card rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl border border-white/80 transition-all">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-white/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500/20 via-orange-500/15 to-yellow-500/20 text-amber-700 border border-amber-300/60 flex items-center justify-center shadow-xs">
            <IconPalette size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading font-extrabold text-xl text-slate-900">
                مصمم لوحات الألوان (CPAL Palette Design)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full liquid-glass-badge text-amber-800 border border-amber-300/50 text-[10px] font-bold">
                زجاج فخم
              </span>
            </div>
            <p className="font-body text-xs text-slate-600 mt-0.5 font-medium">
              حول المخطوطات والرسومات الفنية إلى خطوط ألوان متعددة الطبقات تدعم متصفحات الويب والتطبيقات
            </p>
          </div>
        </div>

        {/* Master Toggle */}
        <button
          type="button"
          onClick={handleToggleColorFont}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold transition-all flex items-center gap-2 ${
            colorSettings.enabled
              ? 'bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-white shadow-md shadow-amber-500/20 border border-white/20'
              : 'liquid-glass-button text-slate-700 hover:text-slate-900'
          }`}
        >
          <IconSparkles size={16} />
          <span>{colorSettings.enabled ? 'ميزة الخط الملون مفعلة' : 'تفعيل الخط الملون'}</span>
        </button>
      </div>

      {colorSettings.enabled && (
        <div className="space-y-6">
          {/* Palette Tabs Manager */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-slate-800">
                لوحات الألوان المقترحة والمعرفة في الخط (Palettes):
              </label>
              <button
                type="button"
                onClick={handleAddPalette}
                className="px-3.5 py-1.5 rounded-xl liquid-glass-button text-sky-700 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <IconPlus size={14} />
                <span>إضافة لوحة جديدة</span>
              </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {colorSettings.palettes.map((pal, idx) => (
                <button
                  key={pal.id || idx}
                  type="button"
                  onClick={() => setSelectedPaletteIdx(idx)}
                  className={`px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2.5 border ${
                    selectedPaletteIdx === idx
                      ? 'bg-gradient-to-r from-slate-900 to-slate-800 text-white border-white/20 shadow-md'
                      : 'liquid-glass-button text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center -space-x-1.5 space-x-reverse">
                    {pal.colors.slice(0, 3).map((c, ci) => (
                      <span
                        key={ci}
                        className="w-4 h-4 rounded-full border border-white shadow-2xs"
                        style={{ backgroundColor: c }}
                      />
                    ))}
                  </div>
                  <span>{pal.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Active Palette Details */}
          {activePalette && (
            <div className="p-5 liquid-glass-card rounded-3xl space-y-4 shadow-md border border-white/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">
                    اسم لوحة الألوان الحالية:
                  </label>
                  <input
                    type="text"
                    value={activePalette.name}
                    onChange={(e) => handleUpdatePaletteName(e.target.value)}
                    className="w-full sm:max-w-md px-3.5 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 font-bold focus:outline-none"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      updateColorSettings((prev) => ({ ...prev, activePaletteIndex: selectedPaletteIdx }))
                    }
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      colorSettings.activePaletteIndex === selectedPaletteIdx
                        ? 'bg-emerald-600 text-white shadow-xs border border-white/20'
                        : 'liquid-glass-button text-slate-700'
                    }`}
                  >
                    <IconCheck size={14} />
                    <span>
                      {colorSettings.activePaletteIndex === selectedPaletteIdx
                        ? 'اللوحة الافتراضية الرئيسية'
                        : 'تعيين كلوحة افتراضية'}
                    </span>
                  </button>

                  {colorSettings.palettes.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleDeletePalette(selectedPaletteIdx)}
                      className="p-2 rounded-xl text-rose-600 hover:bg-rose-500/15 border border-rose-300/30 transition-all"
                      title="حذف هذه اللوحة"
                    >
                      <IconTrash size={16} />
                    </button>
                  )}
                </div>
              </div>

              {/* Color Swatches Grid */}
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-2">
                  خانة الألوان (Palette Indexes 0..{activePalette.colors.length - 1}):
                </label>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                  {activePalette.colors.map((color, cIdx) => (
                    <div
                      key={cIdx}
                      className="p-3 liquid-glass-badge rounded-2xl flex items-center gap-2.5 shadow-2xs border border-white/80 transition-all"
                    >
                      <div className="relative w-8 h-8 rounded-xl overflow-hidden border border-white/80 shrink-0 shadow-2xs">
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleColorChange(cIdx, e.target.value)}
                          className="absolute -top-2 -left-2 w-14 h-14 cursor-pointer border-none"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <span className="block text-[10px] text-slate-500 font-mono font-bold">
                          لون {cIdx + 1}
                        </span>
                        <input
                          type="text"
                          value={color}
                          onChange={(e) => handleColorChange(cIdx, e.target.value)}
                          className="w-full text-xs font-mono font-extrabold text-slate-900 bg-transparent outline-none uppercase"
                        />
                      </div>

                      {activePalette.colors.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveColorSlot(cIdx)}
                          className="text-slate-400 hover:text-rose-600 font-bold text-base transition-colors px-1"
                          title="حذف هذا اللون"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={handleAddColorSlot}
                    className="p-3 border border-dashed border-sky-400/60 hover:border-sky-500 rounded-2xl flex items-center justify-center gap-1.5 text-xs text-sky-700 font-bold transition-colors liquid-glass-button"
                  >
                    <IconPlus size={16} />
                    <span>إضافة لون</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

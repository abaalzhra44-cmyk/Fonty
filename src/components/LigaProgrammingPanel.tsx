import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { FontProject, GlyphItem } from '../types';
import {
  OPENTYPE_LIGA_FEATURES,
  LIGA_PRESETS,
  LigaPreset,
  generateOpenTypeFeaCode,
  traceLigaSubstitutions,
} from '../utils/ligaEngine';
import { FontVectorRenderer } from './FontVectorRenderer';
import {
  IconSparkles,
  IconPlus,
  IconTrash,
  IconCheck,
  IconCode,
  IconSliders,
  IconRefresh,
  IconCopy,
  IconEye,
  IconCheckCircle,
  IconSettings,
  IconArrowLeft,
} from './icons/Icons';

interface LigaProgrammingPanelProps {
  project: FontProject;
  onUpdateProject: (updater: (prev: FontProject) => FontProject) => void;
  dynamicFontFamily?: string;
}

export const LigaProgrammingPanel: React.FC<LigaProgrammingPanelProps> = ({
  project,
  onUpdateProject,
  dynamicFontFamily = 'sans-serif',
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'manager' | 'presets' | 'sandbox' | 'feaCode'>('manager');
  const [presetCategory, setPresetCategory] = useState<'all' | 'islamic' | 'arabic_common' | 'latin_classic'>('all');

  // New Liga Rule Form State
  const [triggerInput, setTriggerInput] = useState('');
  const [selectedTag, setSelectedTag] = useState<'liga' | 'dlig' | 'rlig' | 'hlig' | 'ccmp' | 'calt'>('liga');
  const [svgPathInput, setSvgPathInput] = useState('');
  const [advanceWidthInput, setAdvanceWidthInput] = useState<number>(450);
  const [formError, setFormError] = useState<string | null>(null);

  // Search & Filter rules
  const [ruleSearch, setRuleSearch] = useState('');
  const [ruleTagFilter, setRuleTagFilter] = useState<string>('all');

  // Sandbox Live Test State
  const [sandboxText, setSandboxText] = useState('الله أكبر، بسم الله الرحمن الرحيم، لا إله إلا الله، في كل وقت وسلام على محمد');
  const [sandboxFeatures, setSandboxFeatures] = useState<{ [key: string]: boolean }>({
    liga: true,
    dlig: true,
    rlig: true,
    calt: true,
    ccmp: true,
  });

  // Toast notice
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const allGlyphs = project.glyphs || [];
  const ligaGlyphs = allGlyphs.filter(
    (g) => g.type === 'ligature' || (g.trigger && g.trigger.length > 1)
  );

  // Feature stats counts
  const tagCounts: Record<string, number> = {
    liga: 0,
    dlig: 0,
    rlig: 0,
    hlig: 0,
    ccmp: 0,
    calt: 0,
  };
  ligaGlyphs.forEach((g) => {
    const tag = g.featureTag || (g.trigger && g.trigger.length > 1 ? 'liga' : 'dlig');
    if (tagCounts[tag] !== undefined) tagCounts[tag]++;
    else tagCounts.liga++;
  });

  // Handle adding custom Liga rule
  const handleAddLigaRule = () => {
    const trimmed = triggerInput.trim();
    if (!trimmed) {
      setFormError('يرجى إدخال الحروف أو الكلمة المركبة أولاً (مثال: الله أو لا)');
      return;
    }
    if (trimmed.length < 2 && selectedTag === 'liga') {
      setFormError('تتكون تركيبات Liga القياسية عادة من حرفين أو أكثر (مثل: لا أو fi)');
    }

    setFormError(null);

    const defaultPath =
      svgPathInput.trim() ||
      'M 100 300 C 150 100 250 100 300 300 C 350 500 250 500 200 500 Z M 150 200 L 250 200';

    const newGlyph: GlyphItem = {
      id: `glyph_liga_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      trigger: trimmed,
      type: 'ligature',
      featureTag: selectedTag,
      svgPath: defaultPath,
      advanceWidth: advanceWidthInput,
      createdAt: Date.now(),
    };

    onUpdateProject((prev) => ({
      ...prev,
      glyphs: [newGlyph, ...(prev.glyphs || [])],
      updatedAt: Date.now(),
    }));

    showToast(`تم إضافة تركيبة Liga جديدة (${trimmed}) بنجاح!`);
    setTriggerInput('');
    setSvgPathInput('');
  };

  // Quick Add Preset
  const handleAddPreset = (preset: LigaPreset) => {
    const exists = ligaGlyphs.some((g) => g.trigger === preset.trigger);
    if (exists) {
      showToast(`التركيبة (${preset.trigger}) مضافة بالفعل مسبقاً!`);
      return;
    }

    const newGlyph: GlyphItem = {
      id: `glyph_preset_${Date.now()}_${preset.id}`,
      trigger: preset.trigger,
      type: 'ligature',
      featureTag: preset.featureTag,
      svgPath:
        preset.defaultSvgPath ||
        'M 120 400 L 120 100 L 280 400 L 280 100 M 120 250 L 280 250',
      advanceWidth: preset.advanceWidth || 420,
      createdAt: Date.now(),
    };

    onUpdateProject((prev) => ({
      ...prev,
      glyphs: [newGlyph, ...(prev.glyphs || [])],
      updatedAt: Date.now(),
    }));

    showToast(`تم إضافة تركيبة (${preset.trigger}) من المكتبة الجاهزة!`);
  };

  // Delete Liga Rule
  const handleDeleteRule = (id: string, trigger: string) => {
    onUpdateProject((prev) => ({
      ...prev,
      glyphs: (prev.glyphs || []).filter((g) => g.id !== id),
      updatedAt: Date.now(),
    }));
    showToast(`تم حذف التركيبة (${trigger})`);
  };

  // Change Tag of existing rule
  const handleChangeRuleTag = (id: string, newTag: any) => {
    onUpdateProject((prev) => ({
      ...prev,
      glyphs: (prev.glyphs || []).map((g) =>
        g.id === id ? { ...g, featureTag: newTag } : g
      ),
      updatedAt: Date.now(),
    }));
  };

  // Change Advance Width of existing rule
  const handleChangeAdvanceWidth = (id: string, width: number) => {
    onUpdateProject((prev) => ({
      ...prev,
      glyphs: (prev.glyphs || []).map((g) =>
        g.id === id ? { ...g, advanceWidth: width } : g
      ),
      updatedAt: Date.now(),
    }));
  };

  // Filtered Rules
  const filteredRules = ligaGlyphs.filter((g) => {
    const q = ruleSearch.trim().toLowerCase();
    const matchesSearch = !q || (g.trigger && g.trigger.toLowerCase().includes(q));
    const tag = g.featureTag || (g.trigger && g.trigger.length > 1 ? 'liga' : 'dlig');
    const matchesTag = ruleTagFilter === 'all' || tag === ruleTagFilter;
    return matchesSearch && matchesTag;
  });

  const feaCode = generateOpenTypeFeaCode(project);
  const tracedTokens = traceLigaSubstitutions(sandboxText, allGlyphs);

  return (
    <div className="space-y-6 font-body">
      {/* Toast Notice */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3 rounded-2xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-2 shadow-lg border border-emerald-400/40"
          >
            <IconCheckCircle size={18} />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Panel Header & Feature Tag Summary Cards */}
      <div className="glass-panel p-5 rounded-3xl border border-sky-100/80 bg-gradient-to-br from-white via-sky-50/30 to-slate-50 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-lg shadow-sky-500/25">
              <IconSparkles size={24} />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-lg sm:text-xl text-slate-900 flex items-center gap-2">
                <span>برمجة تركيبات الخطوط الجمالية (OpenType Liga Studio)</span>
                <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 text-xs font-bold border border-sky-200">
                  {ligaGlyphs.length} تركيبة مفعلة
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                قم ببرمجة قواعد الاستبدال التلقائي للتركيبات اللفظية (التركيبات القياسية Liga، الاختيارية dlig، والإجبارية rlig) وتصدير كود GSUB احترافي.
              </p>
            </div>
          </div>
        </div>

        {/* Feature Tag Statistics Badge Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {Object.entries(OPENTYPE_LIGA_FEATURES).map(([tag, info]) => {
            const count = tagCounts[tag] || 0;
            return (
              <div
                key={tag}
                onClick={() => {
                  setRuleTagFilter(tag);
                  setActiveSubTab('manager');
                }}
                className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                  ruleTagFilter === tag && activeSubTab === 'manager'
                    ? 'bg-sky-600 text-white border-sky-500 shadow-md scale-[1.02]'
                    : 'bg-white/80 hover:bg-white text-slate-800 border-slate-200/90 shadow-2xs hover:border-sky-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-mono text-xs font-extrabold px-1.5 py-0.5 rounded ${
                    ruleTagFilter === tag && activeSubTab === 'manager'
                      ? 'bg-sky-500/40 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {tag}
                  </span>
                  <span className="text-sm font-extrabold font-heading">{count}</span>
                </div>
                <p className={`text-[11px] font-bold mt-1.5 truncate ${
                  ruleTagFilter === tag && activeSubTab === 'manager' ? 'text-sky-100' : 'text-slate-700'
                }`}>
                  {info.nameAr.split('(')[0].trim()}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="bg-white p-1 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center gap-1">
        <button
          onClick={() => setActiveSubTab('manager')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'manager'
              ? 'bg-slate-900 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IconSettings size={16} />
          <span>إدارة وإنشاء التركيبات ({ligaGlyphs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('presets')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'presets'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IconSparkles size={16} />
          <span>مكتبة التركيبات الجاهزة</span>
        </button>

        <button
          onClick={() => setActiveSubTab('sandbox')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'sandbox'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IconEye size={16} />
          <span>مختبر التجربة الفورية الحي</span>
        </button>

        <button
          onClick={() => setActiveSubTab('feaCode')}
          className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
            activeSubTab === 'feaCode'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <IconCode size={16} />
          <span>كود OpenType FEA</span>
        </button>
      </div>

      {/* Sub-Tab 1: Manager & Custom Rule Creator */}
      {activeSubTab === 'manager' && (
        <div className="space-y-6 animate-fade-in">
          {/* New Rule Creator Card */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-3">
              <IconPlus size={18} className="text-sky-600" />
              <span>إضافة وتصميم تركيبة Liga مخصصة جديدة</span>
            </h3>

            {formError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                {formError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Trigger Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  الحروف المركبة المُسببة للتركيبة (Trigger String) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={triggerInput}
                  onChange={(e) => setTriggerInput(e.target.value)}
                  placeholder="مثال: الله أو لا أو fi"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-bold text-slate-900"
                />
                <p className="text-[11px] text-slate-400">
                  عند طباعة هذه الكلمة أو التتابع في أي محرر، سيتم استبدالها تلقائياً.
                </p>
              </div>

              {/* Feature Tag Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  وسم خاصية OpenType GSUB Tag
                </label>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-bold text-slate-800"
                >
                  {Object.entries(OPENTYPE_LIGA_FEATURES).map(([t, info]) => (
                    <option key={t} value={t}>
                      {t} - {info.nameAr}
                    </option>
                  ))}
                </select>
                <p className="text-[11px] text-slate-400">
                  {OPENTYPE_LIGA_FEATURES[selectedTag]?.descAr}
                </p>
              </div>

              {/* Advance Width Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 block">
                  عرض التقدم الافقي (Advance Width - Units)
                </label>
                <input
                  type="number"
                  value={advanceWidthInput}
                  onChange={(e) => setAdvanceWidthInput(Number(e.target.value) || 450)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm font-bold text-slate-900 dir-ltr"
                />
              </div>
            </div>

            {/* SVG Path Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                مسار الرسم المتجه المخصص للتركيبة (SVG Path d attribute - اختياري)
              </label>
              <textarea
                rows={2}
                value={svgPathInput}
                onChange={(e) => setSvgPathInput(e.target.value)}
                placeholder="M 100 300 C 150 100 250 100 300 300 ... (إذا ترك فارغاً سيتم توليد رسم افتراضي أوتوماتيكياً)"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs font-mono text-slate-800 dir-ltr"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={handleAddLigaRule}
                className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md shadow-sky-600/20 flex items-center gap-2 transition-all hover:scale-[1.02]"
              >
                <IconPlus size={16} />
                <span>برمجة وحفظ التركيبة الآن</span>
              </button>
            </div>
          </div>

          {/* Rules List & Filter Toolbar */}
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
                <IconSliders size={18} className="text-sky-600" />
                <span>جدول التركيبات المفعلة في مشروع الخط ({filteredRules.length})</span>
              </h3>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <input
                  type="text"
                  value={ruleSearch}
                  onChange={(e) => setRuleSearch(e.target.value)}
                  placeholder="ابحث بحروف التركيبة..."
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 w-full sm:w-48"
                />

                <select
                  value={ruleTagFilter}
                  onChange={(e) => setRuleTagFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="all">كل الوسوم ({ligaGlyphs.length})</option>
                  {Object.keys(OPENTYPE_LIGA_FEATURES).map((t) => (
                    <option key={t} value={t}>
                      {t} ({tagCounts[t] || 0})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredRules.length === 0 ? (
              <div className="p-8 text-center text-slate-400 space-y-2">
                <IconSparkles size={36} className="mx-auto text-slate-300" />
                <p className="text-xs font-semibold">لا توجد تركيبات مسجلة تطابق التصفية الحالية.</p>
                <p className="text-[11px] text-slate-400">قم بإضافة تركيبة مخصصة من الأعلى أو اختر من المكتبة الجاهزة.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {filteredRules.map((rule) => {
                  const tag = rule.featureTag || 'liga';
                  const info = OPENTYPE_LIGA_FEATURES[tag];

                  return (
                    <div
                      key={rule.id}
                      className="p-3.5 rounded-2xl bg-slate-50/80 hover:bg-sky-50/40 border border-slate-200/90 transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-heading font-extrabold text-lg text-slate-900 bg-white px-2.5 py-1 rounded-xl border border-slate-200 shadow-xs">
                            {rule.trigger}
                          </span>
                          <span className="text-xs text-slate-400 font-bold">
                            ({rule.trigger?.length} حروف)
                          </span>
                        </div>

                        <button
                          onClick={() => handleDeleteRule(rule.id, rule.trigger)}
                          className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition-colors"
                          title="حذف هذه التركيبة"
                        >
                          <IconTrash size={16} />
                        </button>
                      </div>

                      {/* Rule Visual Graph Map */}
                      <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between gap-2 text-xs font-bold text-slate-700">
                        <div className="flex items-center gap-1 flex-wrap">
                          {Array.from(rule.trigger).map((ch, i) => (
                            <React.Fragment key={i}>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 border border-slate-200 font-heading">
                                {ch}
                              </span>
                              {i < rule.trigger.length - 1 && (
                                <span className="text-slate-400">+</span>
                              )}
                            </React.Fragment>
                          ))}
                        </div>

                        <IconArrowLeft size={16} className="text-sky-600 shrink-0" />

                        <div className="flex items-center gap-1 bg-sky-50 px-2 py-1 rounded-lg border border-sky-200 text-sky-800">
                          <span className="font-heading font-bold">{rule.trigger}</span>
                          <span className="text-[10px] text-sky-600">({rule.advanceWidth || 450}u)</span>
                        </div>
                      </div>

                      {/* Feature Tag Selector & Advance Width Controls */}
                      <div className="flex items-center justify-between gap-2 pt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] text-slate-500 font-semibold">الوسم:</span>
                          <select
                            value={tag}
                            onChange={(e) => handleChangeRuleTag(rule.id, e.target.value)}
                            className="px-2 py-1 rounded-lg border border-slate-300 text-[11px] font-extrabold text-sky-700 bg-white focus:outline-none"
                          >
                            {Object.keys(OPENTYPE_LIGA_FEATURES).map((t) => (
                              <option key={t} value={t}>
                                {t} ({OPENTYPE_LIGA_FEATURES[t].nameEn})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1">
                          <span className="text-[11px] text-slate-500 font-semibold">العرض:</span>
                          <input
                            type="number"
                            value={rule.advanceWidth || 450}
                            onChange={(e) => handleChangeAdvanceWidth(rule.id, Number(e.target.value))}
                            className="w-16 px-1.5 py-0.5 rounded-lg border border-slate-300 text-[11px] font-bold text-slate-800 dir-ltr text-center"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sub-Tab 2: Presets Library */}
      {activeSubTab === 'presets' && (
        <div className="space-y-5 animate-fade-in">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
                  <IconSparkles size={18} className="text-sky-600" />
                  <span>المكتبة الجاهزة للتركيبات اللفظية والخطية (Liga Presets)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  بنقرة واحدة يمكنك إضافة أي من التركيبات العربية واللاتينية والإسلامية الجاهزة إلى مشروعك!
                </p>
              </div>

              {/* Category Filter */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                <button
                  onClick={() => setPresetCategory('all')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    presetCategory === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  الكل
                </button>
                <button
                  onClick={() => setPresetCategory('islamic')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    presetCategory === 'islamic'
                      ? 'bg-white text-amber-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  إسلامية ومخطوطات
                </button>
                <button
                  onClick={() => setPresetCategory('arabic_common')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    presetCategory === 'arabic_common'
                      ? 'bg-white text-sky-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  عربية شائعة
                </button>
                <button
                  onClick={() => setPresetCategory('latin_classic')}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    presetCategory === 'latin_classic'
                      ? 'bg-white text-indigo-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  لاتينية (fi, fl)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {LIGA_PRESETS.filter(
                (p) => presetCategory === 'all' || p.category === presetCategory
              ).map((preset) => {
                const isAdded = ligaGlyphs.some((g) => g.trigger === preset.trigger);

                return (
                  <div
                    key={preset.id}
                    className="p-4 rounded-2xl bg-slate-50 hover:bg-white border border-slate-200/90 hover:border-sky-300 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-heading font-extrabold text-xl text-slate-900">
                          {preset.trigger}
                        </span>
                        <span className="font-mono text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200">
                          {preset.featureTag}
                        </span>
                      </div>
                      <p className="text-xs font-bold text-slate-700 mt-1">{preset.nameAr}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {OPENTYPE_LIGA_FEATURES[preset.featureTag]?.nameAr}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddPreset(preset)}
                      className={`w-full py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                        isAdded
                          ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30 cursor-default'
                          : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sm shadow-sky-600/20'
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <IconCheck size={16} />
                          <span>مضافة في مشروع الخط</span>
                        </>
                      ) : (
                        <>
                          <IconPlus size={16} />
                          <span>إضافة هذه التركيبة</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 3: Interactive Sandbox Live Debugger */}
      {activeSubTab === 'sandbox' && (
        <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-heading font-bold text-base text-slate-800 flex items-center gap-2">
                  <IconEye size={18} className="text-amber-600" />
                  <span>مختبر الفحص التفاعلي الحي لتركيبات Liga</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  قم بكتابة أي نص عربي أو لاتيني لمراقبة كيفية استبدال الحروف والكلمات بالتركيبات المبرمجة بشكل لحظي.
                </p>
              </div>

              {/* Feature Toggles */}
              <div className="flex items-center gap-2 flex-wrap">
                {['liga', 'dlig', 'rlig', 'calt', 'ccmp'].map((feat) => (
                  <button
                    key={feat}
                    onClick={() =>
                      setSandboxFeatures((prev) => ({
                        ...prev,
                        [feat]: !prev[feat],
                      }))
                    }
                    className={`px-2.5 py-1 rounded-xl text-xs font-extrabold font-mono transition-all border ${
                      sandboxFeatures[feat]
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-2xs'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }`}
                  >
                    {feat}: {sandboxFeatures[feat] ? 'ON' : 'OFF'}
                  </button>
                ))}
              </div>
            </div>

            {/* Test Input */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 block">
                أدخل نص الاختيار والتجربة:
              </label>
              <textarea
                rows={3}
                value={sandboxText}
                onChange={(e) => setSandboxText(e.target.value)}
                className="w-full p-3.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm font-bold text-slate-900 leading-relaxed"
              />
            </div>

            {/* Visual Substitution Trace */}
            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300/60 space-y-2">
              <span className="text-xs font-bold text-amber-900 block border-b border-amber-200/60 pb-1.5">
                تحليل الكلمات المتأثرة بقواعد Liga والتوليف الحي:
              </span>

              <div className="flex flex-wrap items-center gap-2 text-sm">
                {tracedTokens.map((token, idx) => {
                  if (token.isLigature) {
                    return (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-xl bg-amber-400/30 border border-amber-500/50 text-amber-950 font-heading font-extrabold flex items-center gap-1 shadow-2xs"
                        title={`تركيبة مفعلة: ${token.matchedTrigger} (${token.featureTag})`}
                      >
                        <IconSparkles size={14} className="text-amber-600" />
                        <span>{token.text}</span>
                        <span className="text-[10px] font-mono font-bold bg-amber-500 text-white px-1 rounded">
                          {token.featureTag}
                        </span>
                      </span>
                    );
                  }
                  return (
                    <span key={idx} className="text-slate-800 font-body">
                      {token.text}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Vector Rendered Result */}
            <div className="p-5 rounded-2xl bg-slate-900 text-white space-y-2 border border-slate-800 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                <span>المعاينة المتجهة للتركيبات في خط المشروع (Vector Engine)</span>
                <span className="font-mono text-[11px] text-sky-400">
                  font-feature-settings: &quot;liga&quot; 1, &quot;dlig&quot; 1
                </span>
              </div>

              <div className="py-4 text-center overflow-x-auto dir-rtl">
                <FontVectorRenderer
                  project={project}
                  text={sandboxText}
                  fontSize={42}
                  color="#ffffff"
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-Tab 4: OpenType FEA Code */}
      {activeSubTab === 'feaCode' && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-slate-900 text-slate-100 p-5 rounded-3xl border border-slate-800 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <IconCode size={20} className="text-sky-400" />
                <h3 className="font-heading font-bold text-sm text-white">
                  كود OpenType Feature File (.fea) لبرامج تصميم الخطوط
                </h3>
              </div>

              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(feaCode);
                  showToast('تم نسخ كود OpenType FEA إلى الحافظة!');
                }}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <IconCopy size={14} />
                <span>نسخ الكود</span>
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              هذا الكود يمثل صيغة OpenType Syntax الرسمية المتوافقة مع برامج تصميم الخطوط العالمية كـ (FontLab, Glyphs App, FontForge, Adobe InDesign).
            </p>

            <pre className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs overflow-x-auto leading-relaxed dir-ltr">
              {feaCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

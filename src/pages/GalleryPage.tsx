import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { GALLERY_FONTS, GalleryFontItem, SAMPLE_TEXT_PRESETS } from '../data/galleryFonts';
import { ensureGoogleFontLoaded } from '../data/googleFonts';
import { FontDetailModal } from '../components/FontDetailModal';
import { FontStarRating } from '../components/FontStarRating';
import { getFontRating } from '../utils/fontRatingStorage';
import { registerDynamicFontFace } from '../utils/fontBuilder';
import { downloadFontFile } from '../utils/fontDownloader';
import { fetchLiveGoogleFonts } from '../utils/googleFontsApi';
import { FontCardSkeleton } from '../components/Skeleton';
import {
  IconSparkles,
  IconDownload,
  IconCloud,
  IconEye,
  IconCheck,
  IconSliders,
  IconClose,
  IconFileText,
  IconRefresh,
  IconSearch,
  IconStar,
} from '../components/icons/Icons';

export const GalleryPage: React.FC = () => {

  // Font items list (starts with curated collection, merges live API results)
  const [fontList, setFontList] = useState<GalleryFontItem[]>(GALLERY_FONTS);
  const [isLoadingApi, setIsLoadingApi] = useState(false);

  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [showAllFonts, setShowAllFonts] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'rating' | 'name'>('default');

  // Interactive Typography Customization State
  const [customText, setCustomText] = useState('بسم الله الرحمن الرحيم - جمال الخط العربي في أبهى صوره');
  const [fontSize, setFontSize] = useState(36);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [textAlign, setTextAlign] = useState<'right' | 'center' | 'left'>('right');
  const [cardBgTheme, setCardBgTheme] = useState<'white' | 'parchment' | 'blue' | 'slate'>('white');

  // Variable Font Controls (Weight 'wght' & Slant 'slnt')
  const [fontWeight, setFontWeight] = useState(400); // 100 to 900
  const [fontSlant, setFontSlant] = useState(0); // -15deg to 0deg

  // Modal & Toast State
  const [activeModalFont, setActiveModalFont] = useState<GalleryFontItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const categories = ['الكل', 'كوفي', 'نسخ', 'ثلث', 'رقعة', 'ديواني', 'حديث'];

  // Toast Helper
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Fetch real fonts from Google Fonts API on component mount
  useEffect(() => {
    let isMounted = true;
    async function loadApiFonts() {
      setIsLoadingApi(true);
      const apiFonts = await fetchLiveGoogleFonts();
      if (isMounted && apiFonts.length > 0) {
        // Merge API fonts with existing curated list while avoiding duplicates
        const existingIds = new Set(GALLERY_FONTS.map((f) => f.id));
        const uniqueApiFonts = apiFonts.filter((f) => !existingIds.has(f.id));
        setFontList([...GALLERY_FONTS, ...uniqueApiFonts]);
      }
      setIsLoadingApi(false);
    }
    loadApiFonts();
    return () => {
      isMounted = false;
    };
  }, []);

  const getWeightName = (w: number) => {
    if (w <= 150) return 'رفيع جداً (Thin 100)';
    if (w <= 250) return 'خفيف جداً (ExtraLight 200)';
    if (w <= 350) return 'خفيف (Light 300)';
    if (w <= 450) return 'عادي (Regular 400)';
    if (w <= 550) return 'متوسط (Medium 500)';
    if (w <= 650) return 'شبه عريض (SemiBold 600)';
    if (w <= 750) return 'عريض (Bold 700)';
    if (w <= 850) return 'عريض جداً (ExtraBold 800)';
    return 'أسود دكن (Black 900)';
  };

  // Filter fonts matching category & search query
  const filteredFonts = useMemo(() => {
    const list = fontList.filter((font) => {
      const matchesCategory = selectedCategory === 'الكل' || font.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        font.name.toLowerCase().includes(q) ||
        font.designer.toLowerCase().includes(q) ||
        font.category.toLowerCase().includes(q) ||
        font.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });

    if (sortBy === 'rating') {
      return [...list].sort((a, b) => {
        const ratingA = getFontRating(a.id).average;
        const ratingB = getFontRating(b.id).average;
        return ratingB - ratingA;
      });
    }

    if (sortBy === 'name') {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, 'ar'));
    }

    return list;
  }, [fontList, selectedCategory, searchQuery, sortBy]);

  // Requirements: Only 5 fonts shown by default; search or filter or showAll or sortBy reveals the rest
  const isSearchingOrFiltering =
    searchQuery.trim().length > 0 ||
    selectedCategory !== 'الكل' ||
    showAllFonts ||
    sortBy !== 'default';

  const displayedFonts = isSearchingOrFiltering ? filteredFonts : filteredFonts.slice(0, 5);

  // Ensure Google Fonts for all displayed font items are loaded dynamically into DOM
  useEffect(() => {
    displayedFonts.forEach((fontItem) => {
      const family = fontItem.googleFamily || fontItem.nameEn;
      if (family) {
        ensureGoogleFontLoaded(family, undefined, fontItem.directFontFiles);
      }
    });
  }, [displayedFonts]);

  // Handle direct download
  const handleDownloadFont = async (fontItem: GalleryFontItem) => {
    showToast(`جاري تحميل خط ${fontItem.name}...`);
    const res = await downloadFontFile(fontItem.nameEn, fontItem.googleFamily, fontItem.project, fontItem.directFontFiles);
    if (res.success) {
      showToast(`تم تنزيل ملف الخط الأصلي (${res.filename}) بنجاح!`);
    } else {
      showToast(`جاري استخراج الملف وإكمال التحميل...`);
    }
  };

  // Handle copy CSS snippet
  const handleCopyCss = (fontItem: GalleryFontItem) => {
    const familyName = fontItem.nameEn;
    const cssCode = `@import url('https://fonts.googleapis.com/css2?family=${familyName.replace(/\s+/g, '+')}:wght@400;700&display=swap');

.font-${fontItem.id} {
  font-family: '${familyName}', sans-serif;
}`;
    navigator.clipboard.writeText(cssCode);
    showToast(`تم نسخ كود CSS لخط ${fontItem.name}`);
  };

  // Background style helper
  const getCardBgClass = () => {
    switch (cardBgTheme) {
      case 'parchment':
        return 'bg-[#fefae0] border-[#e9edc9] text-[#283618] shadow-sm';
      case 'blue':
        return 'bg-sky-50/80 border-sky-200 text-slate-900 shadow-sm';
      case 'slate':
        return 'bg-slate-900 border-slate-800 text-white shadow-sm';
      default:
        return 'bg-white border-slate-200 text-slate-900 shadow-sm';
    }
  };

  return (
    <div className="pb-32 pt-6 px-4 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-900 text-white text-xs font-semibold px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 border border-slate-700 animate-bounce">
          <IconCheck size={18} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner - السحابة (Download Fonts Hub) */}
      <div className="glass-panel rounded-3xl p-6 md:p-8 space-y-4 shadow-lg relative overflow-hidden backdrop-blur-2xl border border-white/80">
        <div className="absolute top-0 left-0 w-64 h-64 bg-sky-500/10 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-sky-500/10 border border-sky-200/50 rounded-full text-xs font-semibold text-sky-700">
              <IconCloud size={16} />
              <span>السحابة — مكتبة تحميل الخطوط المباشرة</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>السحابة</span>
              <span className="text-xs font-normal text-slate-600 bg-white/60 px-3 py-1 rounded-full border border-white/80 backdrop-blur-sm">
                تحميل فوري
              </span>
            </h1>
            <p className="text-sm text-slate-600 max-w-2xl font-body leading-relaxed">
              تصفح وحمّل الخطوط العربية الحقيقية بملفات جاهزة للاستخدام على الأجهزة والتطبيقات. يتم عرض أول 5 خطوط افتراضياً، ويمكنك البحث في باقي المكتبة.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="px-4 py-2 bg-white/70 rounded-2xl text-xs font-semibold text-slate-700 border border-white/90 flex items-center gap-1.5 backdrop-blur-md shadow-xs">
              <span>إجمالي الخطوط:</span>
              <span className="text-sky-600 font-bold">{fontList.length}</span>
              {isLoadingApi && <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="liquid-glass-card p-6 shadow-xl space-y-4 border border-white/80">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setShowAllFonts(true);
                }}
                className={`px-4 py-2 rounded-2xl text-xs font-semibold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md border border-white/20'
                    : 'liquid-glass-button text-slate-700 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input & Sort Dropdown */}
          <div className="flex flex-col sm:flex-row items-center gap-2 w-full md:w-auto">
            {/* Sort Selection */}
            <div className="flex items-center gap-1.5 liquid-glass-badge rounded-2xl px-3 py-2 w-full sm:w-auto">
              <IconStar size={15} fill="#f59e0b" className="text-amber-500" />
              <span className="text-[11px] font-bold text-slate-700 whitespace-nowrap">الترتيب:</span>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value as 'default' | 'rating' | 'name');
                  setShowAllFonts(true);
                }}
                className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
              >
                <option value="default">الافتراضي</option>
                <option value="rating">الأعلى تقييماً ⭐</option>
                <option value="name">الاسم أبجدياً</option>
              </select>
            </div>

            {/* Search Input */}
            <div className="w-full sm:w-64 relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن اسم الخط..."
                className="w-full pl-4 pr-10 py-2.5 liquid-glass-input rounded-2xl text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none shadow-xs transition-all"
              />
              <div className="absolute top-1/2 -translate-y-1/2 right-3 text-slate-400 pointer-events-none">
                <IconSearch size={16} />
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute top-1/2 -translate-y-1/2 left-3 text-slate-400 hover:text-slate-600"
                >
                  <IconClose size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Informational notice when only 5 default fonts are shown */}
        {!isSearchingOrFiltering && (
          <div className="liquid-glass-badge rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sky-900 border border-sky-300/40">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-sky-500 animate-ping" />
              <span>
                يتم حالياً عرض <strong>5 خطوط متميزة</strong>. ابحث أو اضغط الزر لاستعراض كامل المكتبة ({fontList.length} خط).
              </span>
            </div>
            <button
              onClick={() => setShowAllFonts(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-600 text-white rounded-xl font-semibold whitespace-nowrap transition-all shadow-sm border border-white/20"
            >
              عرض جميع الخطوط ({fontList.length})
            </button>
          </div>
        )}
      </div>

      {/* Interactive Typography Controls */}
      <div className="liquid-glass-card p-6 space-y-6 border border-white/80">
        <div className="flex items-center justify-between border-b border-white/60 pb-4">
          <div className="flex items-center gap-2">
            <IconSliders size={20} className="text-sky-600" />
            <h2 className="font-heading font-bold text-base text-slate-900">
              أدوات تخصيص وعرض المعاينة
            </h2>
          </div>

          <button
            onClick={() => {
              setCustomText('بسم الله الرحمن الرحيم - جمال الخط العربي في أبهى صوره');
              setFontSize(36);
              setLineHeight(1.4);
              setLetterSpacing(0);
              setTextAlign('right');
              setCardBgTheme('white');
              setFontWeight(400);
              setFontSlant(0);
            }}
            className="text-xs text-slate-600 hover:text-sky-700 flex items-center gap-1 transition-colors font-medium"
          >
            <IconRefresh size={14} />
            <span>إعادة ضبط النص</span>
          </button>
        </div>

        {/* Live Text Input & Presets */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-slate-800">نص المعاينة المباشرة:</label>
            {customText && (
              <button
                onClick={() => setCustomText('')}
                className="text-xs text-slate-400 hover:text-rose-500 flex items-center gap-1"
              >
                <IconClose size={12} />
                <span>مسح النص</span>
              </button>
            )}
          </div>

          <div className="relative">
            <input
              type="text"
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="اكتب أي نص للتجربة والحكم على الخط..."
              className="w-full px-4 py-3 liquid-glass-input rounded-2xl text-slate-900 placeholder:text-slate-400 text-base focus:outline-none transition-all shadow-inner"
            />
          </div>

          {/* Quick Presets */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
            <span className="text-slate-500 font-bold whitespace-nowrap">نماذج سريعة:</span>
            {SAMPLE_TEXT_PRESETS.map((p) => (
              <button
                key={p.label}
                onClick={() => setCustomText(p.text)}
                className="px-3 py-1.5 liquid-glass-button text-slate-700 whitespace-nowrap transition-all"
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2">
          {/* Font Size Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>حجم الخط:</span>
              <span className="font-bold text-sky-600">{fontSize}px</span>
            </div>
            <input
              type="range"
              min="20"
              max="90"
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          {/* Line Height Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-600">
              <span>ارتفاع السطر:</span>
              <span className="font-bold text-sky-600">{lineHeight}</span>
            </div>
            <input
              type="range"
              min="1.0"
              max="2.5"
              step="0.1"
              value={lineHeight}
              onChange={(e) => setLineHeight(Number(e.target.value))}
              className="w-full accent-sky-600"
            />
          </div>

          {/* Text Alignment */}
          <div className="space-y-2">
            <span className="text-xs text-slate-600 block">المحاذاة:</span>
            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
              {(['right', 'center', 'left'] as const).map((align) => (
                <button
                  key={align}
                  onClick={() => setTextAlign(align)}
                  className={`flex-1 py-1 rounded-lg text-xs font-medium transition-colors ${
                    textAlign === align ? 'bg-white text-sky-600 shadow-sm' : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {align === 'right' ? 'يمين' : align === 'center' ? 'وسط' : 'يسار'}
                </button>
              ))}
            </div>
          </div>

          {/* Card Theme Preset */}
          <div className="space-y-2">
            <span className="text-xs text-slate-600 block">لون بطاقات العرض:</span>
            <div className="flex gap-2">
              {[
                { id: 'white', label: 'أبيض', bg: 'bg-white border-slate-300' },
                { id: 'parchment', label: 'ورقي', bg: 'bg-[#fefae0] border-[#e9edc9]' },
                { id: 'blue', label: 'سماوي', bg: 'bg-sky-100 border-sky-300' },
                { id: 'slate', label: 'رمادي', bg: 'bg-slate-900 border-slate-700' },
              ].map((thm) => (
                <button
                  key={thm.id}
                  onClick={() => setCardBgTheme(thm.id as any)}
                  className={`flex-1 py-1 px-2 rounded-xl border text-xs font-medium transition-all ${thm.bg} ${
                    cardBgTheme === thm.id ? 'ring-2 ring-sky-500 font-bold' : 'opacity-80'
                  }`}
                >
                  {thm.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Variable Font Control Panel */}
        <div className="bg-gradient-to-r from-sky-50/80 to-blue-50/80 border border-sky-200/80 rounded-2xl p-4 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-200/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="font-heading font-bold text-xs text-slate-900">
                محاور الأوزان والميل التفاعلية (Variable Fonts)
              </h3>
            </div>
            <span className="text-[11px] font-mono font-semibold text-sky-800 bg-white px-3 py-1 rounded-full border border-sky-200 shadow-sm">
              'wght' {fontWeight}, 'slnt' {fontSlant}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Weight Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">الوزن (Weight):</span>
                <span className="font-bold text-sky-700 bg-white px-2.5 py-0.5 rounded-md border border-sky-200 text-[11px] shadow-sm">
                  {fontWeight} — {getWeightName(fontWeight)}
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="900"
                step="10"
                value={fontWeight}
                onChange={(e) => setFontWeight(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Slant Slider */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-800">الميل (Slant):</span>
                <span className="font-bold text-sky-700 bg-white px-2.5 py-0.5 rounded-md border border-sky-200 text-[11px] shadow-sm">
                  {fontSlant === 0 ? 'مستقيم (0°)' : `مائل (${fontSlant}°)`}
                </span>
              </div>
              <input
                type="range"
                min="-15"
                max="0"
                step="1"
                value={fontSlant}
                onChange={(e) => setFontSlant(Number(e.target.value))}
                className="w-full accent-sky-600 cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Font Cards Grid with Smooth Motion Hover Animation */}
      {isLoadingApi && fontList.length === GALLERY_FONTS.length ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FontCardSkeleton />
          <FontCardSkeleton />
          <FontCardSkeleton />
          <FontCardSkeleton />
        </div>
      ) : displayedFonts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <IconFileText size={24} />
          </div>
          <h3 className="font-heading font-bold text-slate-800 text-base">لم يتم العثور على خطط</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            يرجى كتابة اسم خط آخر أو اختيار تصنيف مختلف من القائمة.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {displayedFonts.map((fontItem) => {
            const fontNameClass = registerDynamicFontFace(fontItem.project);

            return (
              <motion.div
                key={fontItem.id}
                whileHover={{ y: -6, scale: 1.015 }}
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                className={`liquid-glass-card p-6 flex flex-col justify-between space-y-6 group border border-white/80 ${getCardBgClass()}`}
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-3 border-b border-white/60 pb-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-heading font-bold text-lg group-hover:text-sky-600 transition-colors text-slate-900">
                        {fontItem.name}
                      </h3>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold liquid-glass-badge text-sky-700">
                        {fontItem.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                      <p className="text-xs opacity-75 font-body text-slate-700">المصمم: {fontItem.designer}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveModalFont(fontItem)}
                    className="p-2 rounded-xl liquid-glass-button text-slate-700 hover:text-sky-700 transition-colors shrink-0"
                    title="معاينة تفصيلية"
                  >
                    <IconEye size={18} />
                  </button>
                </div>

                {/* Rating Bar */}
                <div className="bg-amber-500/10 p-2.5 rounded-2xl border border-amber-400/30 flex items-center justify-between flex-wrap gap-2 backdrop-blur-md">
                  <FontStarRating fontId={fontItem.id} fontName={fontItem.name} compact />
                </div>


                {/* Font Live Canvas Preview */}
                <div className="min-h-[140px] flex items-center justify-center p-4 rounded-2xl bg-white/40 border border-white/80 shadow-inner overflow-hidden relative group-hover:border-sky-300 transition-colors">
                  <p
                    style={{
                      fontFamily: fontItem.googleFamily
                        ? `'${fontItem.googleFamily}', ${fontItem.fontFamilyFallback}`
                        : `'${fontNameClass}', ${fontItem.fontFamilyFallback}`,
                      fontSize: `${fontSize}px`,
                      lineHeight: lineHeight,
                      letterSpacing: `${letterSpacing}px`,
                      textAlign: textAlign,
                      fontWeight: fontWeight,
                      fontStyle: fontSlant !== 0 ? `oblique ${Math.abs(fontSlant)}deg` : 'normal',
                      fontVariationSettings: `'wght' ${fontWeight}, 'slnt' ${fontSlant}`,
                    }}
                    className="w-full transition-all duration-200 break-words text-slate-900"
                  >
                    {customText || fontItem.sampleText}
                  </p>
                </div>

                {/* Tags & Description */}
                <div className="space-y-3">
                  <p className="text-xs opacity-80 leading-relaxed font-body line-clamp-2 text-slate-700">
                    {fontItem.description}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {fontItem.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-0.5 liquid-glass-badge text-slate-700 rounded-md text-[10px] font-medium"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-4 border-t border-white/60 flex flex-wrap items-center justify-between gap-2">
                  <button
                    onClick={() => handleDownloadFont(fontItem)}
                    className="flex-1 py-2.5 px-3 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-sky-500/20 group-hover:shadow-lg border border-white/20"
                  >
                    <IconDownload size={15} />
                    <span>تحميل الخط (TTF / OTF)</span>
                  </button>

                  <button
                    onClick={() => handleCopyCss(fontItem)}
                    className="py-2.5 px-3 liquid-glass-button text-slate-700 hover:text-slate-900 rounded-xl text-xs font-medium flex items-center gap-1 transition-colors"
                    title="نسخ كود CSS"
                  >
                    <span>كود CSS</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Font Specimen Detail Modal */}
      {activeModalFont && (
        <FontDetailModal
          fontItem={activeModalFont}
          onClose={() => setActiveModalFont(null)}
          customText={customText}
        />
      )}
    </div>
  );
};

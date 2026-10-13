import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import * as opentype from 'opentype.js';
import { FontProject, GlyphItem, LicenseType, AdvanceWidthMode } from '../types';
import {
  createDefaultProject,
  getProject,
  saveProject,
} from '../utils/storage';
import { processUploadedFile, flipSvgPathVertically } from '../utils/imageTracer';
import { generateFontBlob, registerDynamicFontFace } from '../utils/fontBuilder';
import { generateColorFontBlob } from '../utils/colorFontBuilder';
import { FontVectorRenderer } from '../components/FontVectorRenderer';
import { ColorFontPaletteEditor } from '../components/ColorFontPaletteEditor';
import { ColorGlyphLayerEditor } from '../components/ColorGlyphLayerEditor';
import { ColorFontPlayground } from '../components/ColorFontPlayground';
import { SupabaseStoragePanel } from '../components/SupabaseStoragePanel';
import { DeveloperUserManagement } from '../components/DeveloperUserManagement';
import { languageTemplates, LanguageTemplate } from '../data/languageTemplates';
import { RulerModal } from '../components/RulerModal';
import { ConfirmModal } from '../components/ConfirmModal';
import { PageSkeleton } from '../components/PageSkeleton';
import { GlyphTableInspector } from '../components/GlyphTableInspector';
import { LigaProgrammingPanel } from '../components/LigaProgrammingPanel';
import {
  IconUpload,
  IconSettings,
  IconGrid,
  IconDownload,
  IconRuler,
  IconTrash,
  IconCheck,
  IconPlus,
  IconSparkles,
  IconEye,
  IconRefresh,
  IconSliders,
  IconAlert,
  IconInspector,
  IconPalette,
  IconEdit,
  IconLightbulb,
  IconType,
  IconArrowUpDown,
} from '../components/icons/Icons';

export const LabPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get('id');

  const [project, setProject] = useState<FontProject>(() => createDefaultProject());
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'upload' | 'settings' | 'liga' | 'colorFont' | 'templates'>('upload');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'unsaved' | 'saving'>('saved');
  const [saveNotice, setSaveNotice] = useState<string | null>(null);
  const isInitialLoadRef = useRef(true);

  // New letter input state
  const [triggerInput, setTriggerInput] = useState('');
  const [fileInput, setFileInput] = useState<File | null>(null);
  const [isProcessingFile, setIsProcessingFile] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);

  // Live preview state
  const [sampleText, setSampleText] = useState('Fonty فونتي - أبجد هوز حطي كلمن');
  const [dynamicFontFamily, setDynamicFontFamily] = useState('sans-serif');

  // Modals state
  const [rulerGlyph, setRulerGlyph] = useState<GlyphItem | null>(null);
  const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);

  // Drag and Drop state
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const dragCounterRef = useRef(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Drag and drop event handlers
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingOver(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounterRef.current -= 1;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDraggingOver(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    dragCounterRef.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleDroppedFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  // Bulk process dropped files (TTF / OTF font files or SVG / image files)
  const handleDroppedFiles = async (filesList: FileList | File[]) => {
    const files = Array.from(filesList);
    if (files.length === 0) return;

    setIsProcessingFile(true);
    setFileError(null);

    let importedFontCount = 0;
    let importedSvgCount = 0;
    const newGlyphsToAppend: GlyphItem[] = [];

    for (const file of files) {
      const ext = file.name.split('.').pop()?.toLowerCase();

      // Handle Font Files (TTF, OTF, WOFF, WOFF2)
      if (['ttf', 'otf', 'woff', 'woff2'].includes(ext || '')) {
        try {
          const buffer = await file.arrayBuffer();
          const font = opentype.parse(buffer);
          const numGlyphs = font.numGlyphs || (font.glyphs ? font.glyphs.length : 0);

          for (let i = 0; i < numGlyphs; i++) {
            const g = font.glyphs.get(i);
            if (!g) continue;

            let triggerChar = '';
            if (g.unicode !== undefined && g.unicode > 0) {
              triggerChar = String.fromCodePoint(g.unicode);
            } else if (g.unicodes && g.unicodes.length > 0) {
              triggerChar = g.unicodes.map((u: number) => String.fromCodePoint(u)).join('');
            } else {
              triggerChar = g.name || `g_${i}`;
            }

            let svgPath = '';
            try {
              const pathObj = g.getPath(400, 550, 450);
              svgPath = pathObj.toPathData(2);
            } catch {
              svgPath = '';
            }

            if (!svgPath || svgPath.trim() === '') continue;

            newGlyphsToAppend.push({
              id: 'g_font_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6) + '_' + i,
              trigger: triggerChar || `g_${i}`,
              type: (triggerChar.length > 1 || !g.unicode) ? 'ligature' : 'direct',
              svgPath,
              advanceWidth: Math.round(g.advanceWidth || 350),
              createdAt: Date.now(),
            });
            importedFontCount++;
          }

          if (project.name === 'مشروع خط جديد' || !project.name) {
            const fontName = file.name.replace(/\.[^/.]+$/, '');
            setProject((prev) => ({
              ...prev,
              name: fontName,
              settings: { ...prev.settings, fontName },
            }));
          }
        } catch (err: any) {
          console.error('Error parsing font file:', err);
          setFileError(`فشل في قراءة ملف الخط ${file.name}: ${err.message || ''}`);
        }
      }
      // Handle Vector / Image Files (SVG, PNG, JPG, JPEG, WEBP, BMP)
      else if (['svg', 'png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext || '')) {
        try {
          const svgPath = await processUploadedFile(file);
          
          const rawName = file.name.replace(/\.[^/.]+$/, '');
          let inferredTrigger = rawName;
          try {
            inferredTrigger = decodeURIComponent(rawName);
          } catch {
            inferredTrigger = rawName;
          }

          let finalTrigger = inferredTrigger;
          if (files.length === 1 && triggerInput.trim().length > 0) {
            finalTrigger = triggerInput.trim();
          }

          if (!finalTrigger) {
            finalTrigger = `g_${Date.now().toString(36)}`;
          }

          const isLigature = finalTrigger.length > 1;
          const previewUrl = ['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(ext || '') ? URL.createObjectURL(file) : undefined;

          newGlyphsToAppend.push({
            id: 'g_drag_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
            trigger: finalTrigger,
            type: isLigature ? 'ligature' : 'direct',
            svgPath,
            originalImageData: previewUrl,
            createdAt: Date.now(),
          });
          importedSvgCount++;
        } catch (err: any) {
          console.error('Error processing vector/image file:', err);
          setFileError(`فشل في معالجة الملف ${file.name}: ${err.message || ''}`);
        }
      }
    }

    if (newGlyphsToAppend.length > 0) {
      setProject((prev) => {
        const newTriggers = new Set(newGlyphsToAppend.map((g) => g.trigger));
        const existingFiltered = prev.glyphs.filter((g) => !newTriggers.has(g.trigger));
        return {
          ...prev,
          glyphs: [...newGlyphsToAppend, ...existingFiltered],
        };
      });

      const messages: string[] = [];
      if (importedFontCount > 0) {
        messages.push(`تم استيراد ${importedFontCount} جليف من ملف الخط`);
      }
      if (importedSvgCount > 0) {
        messages.push(`تم استيراد ${importedSvgCount} ملف SVG/صورة`);
      }
      setSaveNotice(`نجاح: ${messages.join(' و ')} بنجاح!`);
      setTimeout(() => setSaveNotice(null), 4000);
      setTriggerInput('');
      setFileInput(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }

    setIsProcessingFile(false);
  };

  // Load project on mount or ID change
  useEffect(() => {
    async function loadProj() {
      setIsLoading(true);
      isInitialLoadRef.current = true;
      if (projectIdParam) {
        const existing = await getProject(projectIdParam);
        if (existing) {
          setProject(existing);
          const fontName = registerDynamicFontFace(existing);
          setDynamicFontFamily(fontName);
          setSaveStatus('saved');
          setIsLoading(false);
          return;
        }
      }
      // If no ID or not found, create new default
      const newProj = createDefaultProject('مشروع خط جديد');
      setProject(newProj);
      const fontName = registerDynamicFontFace(newProj);
      setDynamicFontFamily(fontName);
      setSaveStatus('saved');
      setIsLoading(false);
    }
    loadProj();
  }, [projectIdParam]);

  // Real-time font face registration on project change (for preview without auto-saving)
  useEffect(() => {
    if (isLoading) return;
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false;
      return;
    }
    const fontName = registerDynamicFontFace(project);
    setDynamicFontFamily(fontName);
    setSaveStatus('unsaved');
  }, [project, isLoading]);

  // Manual save handler
  const handleManualSave = async () => {
    setSaveStatus('saving');
    try {
      await saveProject(project);
      setSaveStatus('saved');
      setSaveNotice('تم حفظ التغييرات للمشروع بنجاح!');
      setTimeout(() => setSaveNotice(null), 3000);
    } catch {
      setSaveStatus('unsaved');
    }
  };

  // Add Glyph handler
  const handleAddGlyph = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!triggerInput.trim()) {
      setFileError('يُرجى إدخال الحرف المُشغّل.');
      return;
    }
    if (!fileInput) {
      setFileError('يُرجى اختيار صورة أو ملف SVG للحرف.');
      return;
    }

    setFileError(null);
    setIsProcessingFile(true);

    try {
      const svgPath = await processUploadedFile(fileInput);
      const isLigature = triggerInput.trim().length > 1;

      // Image preview URL
      const previewUrl = URL.createObjectURL(fileInput);

      const newGlyph: GlyphItem = {
        id: 'g_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        trigger: triggerInput.trim(),
        type: isLigature ? 'ligature' : 'direct',
        svgPath,
        originalImageData: previewUrl,
        createdAt: Date.now(),
      };

      setProject((prev) => ({
        ...prev,
        glyphs: [newGlyph, ...prev.glyphs.filter((g) => g.trigger !== newGlyph.trigger)],
      }));

      // Reset form
      setTriggerInput('');
      setFileInput(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err: any) {
      setFileError(err.message || 'حدث خطأ أثناء معالجة الملف.');
    } finally {
      setIsProcessingFile(false);
    }
  };

  // Card inline trigger edit state
  const [editingCardGlyphId, setEditingCardGlyphId] = useState<string | null>(null);
  const [editingCardTrigger, setEditingCardTrigger] = useState<string>('');

  // Remove single glyph
  const handleDeleteGlyph = useCallback((id: string) => {
    setProject((prev) => ({
      ...prev,
      glyphs: prev.glyphs.filter((g) => g.id !== id),
    }));
  }, []);

  // Update glyph trigger & auto-classify into 'direct' or 'ligature'
  const handleUpdateGlyphTrigger = useCallback((id: string, newTrigger: string) => {
    const trimmed = newTrigger.trim();
    if (!trimmed) return;
    const isLigature = trimmed.length > 1;
    setProject((prev) => ({
      ...prev,
      glyphs: prev.glyphs.map((g) => {
        if (g.id === id) {
          return {
            ...g,
            trigger: trimmed,
            type: isLigature ? 'ligature' : 'direct',
          };
        }
        return g;
      }),
    }));
    setSaveNotice(
      `تم تحديث الحرف إلى (${trimmed}) - ${
        isLigature ? 'تصنيف تلقائي: تركيبة ليجا' : 'تصنيف تلقائي: حرف فردي'
      }`
    );
    setTimeout(() => setSaveNotice(null), 3000);
  }, []);

  // Flip single glyph vertically
  const handleFlipGlyph = useCallback((id: string) => {
    setProject((prev) => ({
      ...prev,
      glyphs: prev.glyphs.map((g) => {
        if (g.id === id) {
          return { ...g, svgPath: flipSvgPathVertically(g.svgPath) };
        }
        return g;
      }),
    }));
  }, []);

  // Delete all glyphs
  const handleDeleteAllGlyphs = useCallback(() => {
    setProject((prev) => ({
      ...prev,
      glyphs: [],
    }));
    setShowDeleteAllConfirm(false);
  }, []);

  // Apply Language Template
  const handleApplyTemplate = useCallback((template: LanguageTemplate) => {
    const newGlyphs: GlyphItem[] = template.characters.map((char) => {
      // Dummy simple box path as initial slot until user replaces with photo
      const defaultBoxPath = `M 100 100 h 600 v 600 h -600 Z`;
      return {
        id: 'g_tpl_' + char + '_' + Math.random().toString(36).substring(2, 6),
        trigger: char,
        type: char.length > 1 ? 'ligature' : 'direct',
        svgPath: defaultBoxPath,
        createdAt: Date.now(),
      };
    });

    setProject((prev) => {
      const existingTriggers = new Set(prev.glyphs.map((g) => g.trigger));
      const filteredNew = newGlyphs.filter((g) => !existingTriggers.has(g.trigger));
      return {
        ...prev,
        glyphs: [...prev.glyphs, ...filteredNew],
      };
    });

    setActiveTab('upload');
  }, []);

  // Download Font TTF (Static)
  const handleExportTTF = useCallback(() => {
    const blob = generateFontBlob(project);
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.settings.fontName || 'Fonty'}_Static.ttf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [project]);

  // Download Color Font TTF (COLR/CPAL)
  const handleExportColorFont = useCallback(() => {
    try {
      const blob = generateColorFontBlob(project);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.settings.fontName || 'FontyColorFont'}_COLR.ttf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('حدث خطأ أثناء تصدير الخط الملون', err);
    }
  }, [project]);

  const ligatures = (project.glyphs || []).filter((g) => g.type === 'ligature' || (g.trigger && g.trigger.length > 1));

  if (isLoading) {
    return <PageSkeleton />;
  }

  return (
    <div
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="pb-28 pt-4 px-4 max-w-7xl mx-auto space-y-6 relative min-h-screen"
    >
      {/* Drag & Drop Full Page Overlay */}
      {isDraggingOver && (
        <div className="fixed inset-0 z-50 bg-sky-950/70 backdrop-blur-md flex flex-col items-center justify-center p-6 transition-all animate-fade-in pointer-events-none">
          <div className="bg-slate-900/90 border-2 border-dashed border-sky-400 rounded-3xl p-10 max-w-lg w-full text-center space-y-4 shadow-2xl scale-105 ring-8 ring-sky-500/20">
            <div className="w-20 h-20 rounded-full bg-sky-500/20 text-sky-400 mx-auto flex items-center justify-center animate-bounce shadow-lg shadow-sky-500/30">
              <IconUpload size={40} />
            </div>
            <h3 className="font-heading font-extrabold text-2xl text-white">
              أسقط الملفات هنا للاستيراد الفوري
            </h3>
            <p className="font-body text-sm text-sky-200/90 leading-relaxed">
              يدعم استيراد ملفات الخطوط الكاملة (TTF, OTF, WOFF) أو صور ومسارات الـ SVG دفعة واحدة.
            </p>
          </div>
        </div>
      )}

      {/* Toast Save Notice */}
      {saveNotice && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-emerald-900/90 backdrop-blur-md text-white text-xs px-5 py-2.5 rounded-2xl shadow-xl border border-emerald-500/40 flex items-center gap-2 animate-fade-in">
          <IconCheck size={16} className="text-emerald-400" />
          <span className="font-semibold">{saveNotice}</span>
        </div>
      )}

      {/* Top Header Row in Lab */}
      <div className="glass-panel rounded-2xl p-4 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg backdrop-blur-xl border border-white/80">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              type="text"
              value={project.name}
              onChange={(e) =>
                setProject((prev) => ({
                  ...prev,
                  name: e.target.value,
                  settings: { ...prev.settings, fontName: e.target.value },
                }))
              }
              className="font-heading font-bold text-xl md:text-2xl text-slate-900 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-sky-500 focus:outline-none transition-colors px-1"
            />
            {/* Save Status Badge */}
            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md ${
                saveStatus === 'saved'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700'
                  : saveStatus === 'unsaved'
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-800'
                  : 'bg-sky-500/10 border-sky-500/30 text-sky-700'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  saveStatus === 'saved'
                    ? 'bg-emerald-500'
                    : saveStatus === 'unsaved'
                    ? 'bg-amber-500'
                    : 'bg-sky-500 animate-ping'
                }`}
              />
              <span>
                {saveStatus === 'saved'
                  ? 'تم الحفظ'
                  : saveStatus === 'unsaved'
                  ? 'غير محفوظ (انقر حفظ)'
                  : 'جاري الحفظ...'}
              </span>
            </div>
          </div>
          <p className="font-body text-xs text-slate-500 mt-1">
            إجمالي الحروف والجليفات المضافة: <span className="text-sky-600 font-semibold">{project.glyphs?.length || 0}</span>
          </p>
        </div>

        {/* Top Header Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          {/* Explicit Manual Save Button */}
          <button
            type="button"
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
            className={`px-4 sm:px-5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-sm ${
              saveStatus === 'unsaved'
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white ring-2 ring-emerald-400/50 shadow-emerald-600/20 border border-white/20'
                : 'liquid-glass-button text-slate-800'
            }`}
          >
            <IconCheck size={16} className={saveStatus === 'unsaved' ? 'text-white' : 'text-emerald-600'} />
            <span>{saveStatus === 'saving' ? 'جاري الحفظ...' : 'حفظ'}</span>
          </button>

          {/* Export Static TTF Button */}
          <button
            type="button"
            onClick={handleExportTTF}
            className="px-4 sm:px-5 py-2.5 rounded-2xl apple-glass-dark text-white font-semibold text-xs shadow-md shadow-slate-900/10 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] border border-white/20"
            title="تصدير كخط ثابت (Static Font)"
          >
            <IconDownload size={15} />
            <span>خط ثابت (Static)</span>
          </button>

          {/* Export Color Font TTF Button */}
          <button
            type="button"
            onClick={handleExportColorFont}
            className="px-4 sm:px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-all hover:scale-[1.02] border border-white/30"
            title="تصدير كخط ملون مخصص للمخطوطات والرسومات (COLR / CPAL Color Font)"
          >
            <IconPalette size={15} className="text-amber-100" />
            <span>خط ملون (Color Font COLR)</span>
          </button>
        </div>
      </div>

      {/* Main Two Column Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Column (Tabs) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Sub Tabs Selector (Apple Frosted Segmented Control) */}
          <div className="liquid-glass-card rounded-2xl p-1.5 flex flex-wrap items-center gap-1.5 border border-white/80">
            <button
              type="button"
              onClick={() => setActiveTab('upload')}
              className={`flex-1 min-w-[120px] py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'upload'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/20 border border-white/20'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <IconUpload size={18} />
              <span>رفع وتعديل ({project.glyphs?.length || 0})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'settings'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/20 border border-white/20'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <IconSettings size={18} />
              <span>إعدادات الخط</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('colorFont')}
              className={`flex-1 min-w-[130px] py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'colorFont'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md shadow-amber-500/25 border border-white/20'
                  : 'text-amber-800 bg-amber-500/10 hover:bg-amber-500/20'
              }`}
            >
              <IconPalette size={18} />
              <span>الخط الملون (COLR/CPAL)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('templates')}
              className={`flex-1 min-w-[110px] py-2.5 px-3 rounded-xl text-xs md:text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                activeTab === 'templates'
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md shadow-sky-500/20 border border-white/20'
                  : 'text-slate-700 hover:text-slate-900 hover:bg-white/40'
              }`}
            >
              <IconGrid size={18} />
              <span>قوالب اللغات</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD & GLYPH MANAGEMENT */}
          {activeTab === 'upload' && (
            <div className="space-y-6">
              {/* Add Letter Form Card */}
              <div className="liquid-glass-card rounded-3xl p-6 space-y-5 border border-white/80">
                <div className="flex items-center justify-between">
                  <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                    <IconPlus size={18} className="text-sky-600" />
                    <span>إضافة حرف أو رفع ملفات (TTF / OTF / SVG)</span>
                  </h3>
                  {triggerInput.length > 1 ? (
                    <span className="px-2.5 py-0.5 rounded-full bg-sky-500/15 text-sky-800 text-[11px] font-bold border border-sky-500/25">
                      تركيب حروف (مركب)
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full liquid-glass-badge text-slate-700 text-[11px] font-semibold">
                      حرف مباشر
                    </span>
                  )}
                </div>

                {/* Drag and Drop Zone Box */}
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-sky-400/50 hover:border-sky-500 bg-sky-500/5 hover:bg-sky-500/10 rounded-2xl p-6 text-center cursor-pointer transition-all group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2,image/svg+xml,image/png,image/jpeg,image/webp"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        handleDroppedFiles(e.target.files);
                      }
                    }}
                    className="hidden"
                  />
                  <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 mx-auto flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-xs">
                    <IconUpload size={24} />
                  </div>
                  <p className="font-heading font-bold text-sm text-slate-800">
                    اسحب وأسقط ملفات الخطوط (TTF / OTF) أو الـ SVG والصور هنا
                  </p>
                  <p className="font-body text-xs text-slate-500 mt-1">
                    أو اضغط لتصفح الملفات من جهازك (يدعم اختيار ملفات متعددة دفعة واحدة)
                  </p>
                </div>

                <form onSubmit={handleAddGlyph} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="block text-xs font-semibold text-slate-700">
                          الحرف أو الترقيم المُشغّل (Trigger)
                        </label>
                        {triggerInput.trim().length > 0 && (
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs transition-all flex items-center gap-1 ${
                              triggerInput.trim().length > 1
                                ? 'bg-amber-100 text-amber-900 border-amber-300'
                                : 'bg-sky-100 text-sky-800 border-sky-300'
                            }`}
                          >
                            {triggerInput.trim().length > 1 ? (
                              <>
                                <IconSparkles size={13} className="text-amber-600" />
                                <span>تركيبة ليجا تلقائية (Auto Liga)</span>
                              </>
                            ) : (
                              <>
                                <IconType size={13} className="text-sky-600" />
                                <span>حرف فردي عادي (Single)</span>
                              </>
                            )}
                          </span>
                        )}
                      </div>
                      <input
                        type="text"
                        value={triggerInput}
                        onChange={(e) => setTriggerInput(e.target.value)}
                        placeholder="مثال: أ (حرف عادي) أو الله / لا / fi (تركيبة ليجا)"
                        className="w-full px-4 py-2.5 rounded-xl bg-white/80 border border-slate-200 text-slate-900 placeholder:text-slate-400 text-sm focus:border-sky-500 focus:outline-none transition-colors"
                      />
                      <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <IconLightbulb size={14} className="text-amber-500 shrink-0" />
                        <span>التصنيف الذكي: كتابة حرف واحد تحسبه حرفاً عادياً، وتلقائياً أي ترقيم أكثر من حرف (مثل: الله أو لا أو fi) يحسب كتركيبة ليجا (OpenType Liga).</span>
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                        أو تصفح ملف منفرد
                      </label>
                      <input
                        type="file"
                        accept=".ttf,.otf,.woff,.woff2,image/png,image/jpeg,image/svg+xml,image/webp"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleDroppedFiles([file]);
                          }
                        }}
                        className="w-full px-3 py-1.5 rounded-xl bg-white/80 border border-slate-200 text-slate-700 text-xs file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:bg-slate-200 file:text-slate-800 file:hover:bg-slate-300 focus:outline-none"
                      />
                    </div>
                  </div>

                  {fileError && (
                    <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 text-xs flex items-center gap-2">
                      <IconAlert size={16} />
                      <span>{fileError}</span>
                    </div>
                  )}

                  {isProcessingFile && (
                    <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-700 text-xs flex items-center justify-center gap-2 animate-pulse font-medium">
                      <IconRefresh size={16} className="animate-spin" />
                      <span>جاري معالجة الملفات والتحليل...</span>
                    </div>
                  )}
                </form>
              </div>

              {/* Added Glyphs Grid Header */}
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-bold text-base text-slate-900">
                  الحروف والجليفات المضافة ({project.glyphs?.length || 0})
                </h3>
                {(project.glyphs?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowDeleteAllConfirm(true)}
                    className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-medium transition-colors"
                  >
                    <IconTrash size={14} />
                    <span>حذف الكل</span>
                  </button>
                )}
              </div>

              {/* Glyphs Grid */}
              {(project.glyphs?.length || 0) === 0 ? (
                <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center space-y-3 shadow-sm">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
                    <IconUpload size={24} />
                  </div>
                  <p className="font-body text-sm text-slate-500">
                    لا توجد حروف مضافة حتى الآن. أضف حرفاً من الأعلى أو اختر قالب لغة جاهز.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {project.glyphs.map((g) => {
                    const isLiga = g.trigger.length > 1 || g.type === 'ligature';
                    const isEditingCard = editingCardGlyphId === g.id;

                    return (
                      <div
                        key={g.id}
                        className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-3 flex flex-col justify-between space-y-3 relative group transition-all shadow-sm"
                      >
                        {/* SVG Canvas Preview */}
                        <div className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center p-2 relative overflow-hidden">
                          <svg
                            viewBox="0 0 800 800"
                            className="w-full h-full object-contain text-slate-900"
                          >
                            <g
                              style={{
                                transformOrigin: '400px 400px',
                                transform: `scale(${
                                  project.settings.flipHorizontal ? -1 : 1
                                }, ${project.settings.flipVertical ? -1 : 1})`,
                              }}
                            >
                              <path
                                d={g.svgPath}
                                fill="currentColor"
                                stroke="currentColor"
                                strokeWidth="1"
                                fillRule="evenodd"
                              />
                            </g>
                          </svg>
                        </div>

                        {/* Footer Details */}
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0 pr-1">
                            {!isEditingCard ? (
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-heading font-bold text-base text-slate-900 truncate">
                                  {g.trigger}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingCardGlyphId(g.id);
                                    setEditingCardTrigger(g.trigger);
                                  }}
                                  className="text-[11px] text-slate-400 hover:text-sky-600 transition-colors flex items-center gap-1"
                                  title="تعديل الترقيم"
                                >
                                  <IconEdit size={12} />
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1">
                                <input
                                  type="text"
                                  value={editingCardTrigger}
                                  onChange={(e) => setEditingCardTrigger(e.target.value)}
                                  className="w-20 px-1.5 py-0.5 border border-sky-400 rounded text-xs font-bold text-slate-900 bg-white"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    handleUpdateGlyphTrigger(g.id, editingCardTrigger);
                                    setEditingCardGlyphId(null);
                                  }}
                                  className="px-1.5 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold"
                                >
                                  حفظ
                                </button>
                              </div>
                            )}

                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded flex items-center gap-1 mt-0.5 ${
                                isLiga
                                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                                  : 'bg-slate-100 text-slate-600'
                              }`}
                            >
                              {isLiga ? (
                                <>
                                  <IconSparkles size={11} className="text-amber-600" />
                                  <span>تركيبة ليجا</span>
                                </>
                              ) : (
                                <>
                                  <IconType size={11} className="text-slate-500" />
                                  <span>حرف عادي</span>
                                </>
                              )}
                            </span>
                          </div>

                          {/* Action buttons */}
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleFlipGlyph(g.id)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                              title="قلب رسم الحرف رأساً على عقب"
                            >
                              <IconArrowUpDown size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => setRulerGlyph(g)}
                              className="p-1.5 rounded-lg bg-slate-100 text-slate-700 hover:bg-sky-50 hover:text-sky-700 transition-colors"
                              title="المسطرة الرقمية"
                            >
                              <IconRuler size={14} />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteGlyph(g.id)}
                              className="p-1.5 rounded-lg bg-slate-100 text-rose-600 hover:bg-rose-50 transition-colors"
                              title="حذف الحرف"
                            >
                              <IconTrash size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Compact Glyph Table Inspector */}
              <GlyphTableInspector
                project={project}
                fontName={project.name || project.settings.fontName}
                onFlipGlyph={handleFlipGlyph}
                onDeleteGlyph={handleDeleteGlyph}
                onOpenRuler={(g) => setRulerGlyph(g)}
                onUpdateGlyphTrigger={handleUpdateGlyphTrigger}
              />
            </div>
          )}

          {/* TAB 2: PROJECT SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
              <h3 className="font-heading font-bold text-lg text-slate-900 border-b border-slate-100 pb-3">
                تكوين وإعدادات الخط
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    اسم الخط
                  </label>
                  <input
                    type="text"
                    value={project.settings.fontName}
                    onChange={(e) =>
                      setProject((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, fontName: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    المؤلف / المصمم
                  </label>
                  <input
                    type="text"
                    value={project.settings.designer}
                    onChange={(e) =>
                      setProject((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, designer: e.target.value },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    الترخيص (License)
                  </label>
                  <select
                    value={project.settings.license}
                    onChange={(e) =>
                      setProject((prev) => ({
                        ...prev,
                        settings: { ...prev.settings, license: e.target.value as LicenseType },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-sky-500 focus:bg-white focus:outline-none"
                  >
                    <option value="none">بدون ترخيص محدد</option>
                    <option value="OFL">SIL Open Font License (OFL)</option>
                    <option value="all-rights-reserved">جميع الحقوق محفوظة</option>
                    <option value="CC-BY">Creative Commons (CC-BY)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    نمط عرض الحرف (Advance Width)
                  </label>
                  <select
                    value={project.settings.advanceWidthMode}
                    onChange={(e) =>
                      setProject((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          advanceWidthMode: e.target.value as AdvanceWidthMode,
                        },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-sky-500 focus:bg-white focus:outline-none"
                  >
                    <option value="auto">تلقائي (حسب العرض الطبيعي)</option>
                    <option value="fixed">عرض ثابت لكل الحروف (Fixed)</option>
                    <option value="per-glyph">مخصص لكل رسمة</option>
                  </select>
                </div>

                {project.settings.advanceWidthMode === 'fixed' && (
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      قيمة العرض الثابت (بالوحدات)
                    </label>
                    <input
                      type="number"
                      value={project.settings.fixedWidthValue}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            fixedWidthValue: parseInt(e.target.value) || 800,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-sky-500 focus:bg-white focus:outline-none"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    إزاحة خط الأساس (Baseline Offset)
                  </label>
                  <input
                    type="number"
                    value={project.settings.baselineOffset}
                    onChange={(e) =>
                      setProject((prev) => ({
                        ...prev,
                        settings: {
                          ...prev.settings,
                          baselineOffset: parseInt(e.target.value) || 0,
                        },
                      }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm focus:border-sky-500 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              {/* Axis Flips & Auto Fit Toggles */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <h4 className="font-heading font-bold text-sm text-slate-900">
                  محاور المحاذاة والتوجيه
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-sky-300">
                    <input
                      type="checkbox"
                      checked={project.settings.flipVertical}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, flipVertical: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 accent-sky-600"
                    />
                    <span className="text-xs text-slate-800">قلب المحور الرأسي</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-sky-300">
                    <input
                      type="checkbox"
                      checked={project.settings.flipHorizontal}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, flipHorizontal: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 accent-sky-600"
                    />
                    <span className="text-xs text-slate-800">قلب المحور الأفقي</span>
                  </label>

                  <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer hover:border-sky-300">
                    <input
                      type="checkbox"
                      checked={project.settings.autoFitAndCenter}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          settings: { ...prev.settings, autoFitAndCenter: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 accent-sky-600"
                    />
                    <span className="text-xs text-slate-800">ملاءمة الحجم والتمركز تلقائياً</span>
                  </label>
                </div>
              </div>

              {/* Manual Scale and Offsets if Auto-Fit is Disabled */}
              {!project.settings.autoFitAndCenter && (
                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-fade-in">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      مقياس الحجم (Scale)
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={project.settings.scaleFactor}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            scaleFactor: parseFloat(e.target.value) || 1,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      إزاحة أفقية (X Offset)
                    </label>
                    <input
                      type="number"
                      value={project.settings.horizontalOffset}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            horizontalOffset: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      إزاحة رأسية (Y Offset)
                    </label>
                    <input
                      type="number"
                      value={project.settings.verticalOffset}
                      onChange={(e) =>
                        setProject((prev) => ({
                          ...prev,
                          settings: {
                            ...prev.settings,
                            verticalOffset: parseInt(e.target.value) || 0,
                          },
                        }))
                      }
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-sm"
                    />
                  </div>
                </div>
              )}

              {/* Supabase Cloud Storage Panel */}
              <SupabaseStoragePanel />

              {/* Developer User Account Management Portal */}
              <DeveloperUserManagement />
            </div>
          )}

          {/* TAB 2.5: OPENTYPE LIGA PROGRAMMING STUDIO */}
          {activeTab === 'liga' && (
            <LigaProgrammingPanel
              project={project}
              onUpdateProject={setProject}
              dynamicFontFamily={dynamicFontFamily}
            />
          )}

          {/* TAB 3: COLOR FONT DESIGNER (COLR/CPAL) */}
          {activeTab === 'colorFont' && (
            <div className="space-y-6">
              <ColorFontPaletteEditor project={project} setProject={setProject} />
              <ColorGlyphLayerEditor project={project} setProject={setProject} />
              <ColorFontPlayground project={project} />
            </div>
          )}

          {/* TAB 3: LANGUAGE TEMPLATES */}
          {activeTab === 'templates' && (
            <div className="space-y-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                <h3 className="font-heading font-bold text-lg text-slate-900 mb-2">
                  قوالب اللغات الجاهزة
                </h3>
                <p className="font-body text-xs text-slate-500 leading-relaxed">
                  اختر لغة لإضافة حقول كافة أبجدياتها دفعة واحدة إلى مشروعك الحالي لسهولة رفع صور الحروف لاحقاً.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {languageTemplates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="bg-white border border-slate-200 hover:border-sky-300 rounded-2xl p-5 flex flex-col justify-between space-y-4 group transition-all shadow-sm"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-heading font-bold text-base text-slate-900">
                          {tpl.name} ({tpl.nativeName})
                        </h4>
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-700 text-xs font-semibold">
                          {tpl.charCount} حرفاً
                        </span>
                      </div>
                      <p className="font-body text-xs text-slate-500 leading-relaxed mb-3">
                        {tpl.description}
                      </p>
                      {/* Character Pill Matrix */}
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-1 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600">
                        {tpl.characters.map((c) => (
                          <span key={c} className="px-1.5 py-0.5 bg-white border border-slate-200 rounded text-[11px]">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleApplyTemplate(tpl)}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-sky-600 hover:text-white text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-2"
                    >
                      <IconPlus size={14} />
                      <span>تطبيق القالب وإضافة الحروف</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Live Preview Panel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="sticky top-20 liquid-glass-card rounded-3xl p-6 space-y-5 shadow-2xl border border-white/80">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                <IconEye size={18} className="text-sky-600" />
                <span>لوحة المعاينة الحية</span>
              </h3>
              <span className="text-[11px] font-bold text-slate-500 liquid-glass-badge px-2 py-0.5 rounded-full">تحديث تلقائي</span>
            </div>

            {/* Quick Axis Toggles in Preview */}
            <div className="p-3.5 liquid-glass-badge rounded-2xl space-y-2 border border-white/80">
              <span className="text-[11px] font-bold text-slate-700 block">
                مفاتيح المحاور السريعة (لعلاج الانقلاب)
              </span>
              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setProject((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, flipVertical: !prev.settings.flipVertical },
                    }))
                  }
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    project.settings.flipVertical
                      ? 'bg-sky-500/20 text-sky-800 border-sky-400/40 shadow-xs'
                      : 'liquid-glass-button text-slate-700'
                  }`}
                >
                  قلب رأسي
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setProject((prev) => ({
                      ...prev,
                      settings: { ...prev.settings, flipHorizontal: !prev.settings.flipHorizontal },
                    }))
                  }
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                    project.settings.flipHorizontal
                      ? 'bg-sky-500/20 text-sky-800 border-sky-400/40 shadow-xs'
                      : 'liquid-glass-button text-slate-700'
                  }`}
                >
                  قلب أفقي
                </button>
              </div>
            </div>

            {/* Interactive Color Font Quick Status */}
            <div className="p-4 bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-white/40 border border-amber-300/60 rounded-2xl flex items-center justify-between backdrop-blur-md">
              <div className="flex items-center gap-2.5">
                <IconPalette size={20} className="text-amber-600" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">
                    دعم الخط الملون (COLR/CPAL)
                  </h4>
                  <p className="text-[10px] text-slate-600 font-medium">
                    مفعل بـ {project.settings.colorFontSettings?.palettes?.length || 4} لوحات ألوان
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab('colorFont')}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] font-bold shadow-md shadow-amber-500/20 transition-all border border-white/20"
              >
                تخصيص اللوحات
              </button>
            </div>

            {/* Test Input Box */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-slate-800">
                  نص المعاينة والتجربة
                </label>
                {(project.glyphs?.length || 0) > 0 && (
                  <button
                    type="button"
                    onClick={() =>
                      setSampleText((project.glyphs || []).map((g) => g.trigger).join(' '))
                    }
                    className="text-[11px] text-sky-700 hover:underline font-bold"
                  >
                    إدراج كافة الحروف المضافة ({project.glyphs?.length || 0})
                  </button>
                )}
              </div>
              <textarea
                value={sampleText}
                onChange={(e) => setSampleText(e.target.value)}
                rows={3}
                placeholder="اكتب شيئاً لتجربته..."
                className="w-full px-3.5 py-2.5 rounded-2xl liquid-glass-input text-slate-900 text-sm focus:outline-none resize-none"
              />
            </div>

            {/* Quick Uploaded Glyphs Chips */}
            {(project.glyphs?.length || 0) > 0 ? (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-600 block">
                  الحروف والجليفات المتاحة في خطك الحقيقي (انقر للإدراج):
                </span>
                <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-2 bg-white/40 backdrop-blur-md border border-white/80 rounded-2xl">
                  {(project.glyphs || []).map((g) => (
                    <button
                      key={g.id}
                      type="button"
                      onClick={() => setSampleText((prev) => (prev ? prev + ' ' + g.trigger : g.trigger))}
                      className="px-2.5 py-1 rounded-xl liquid-glass-button text-slate-800 hover:text-sky-700 font-bold text-xs transition-colors"
                      title={`نوع: ${g.type === 'ligature' ? 'تركيب' : 'مباشر'}`}
                    >
                      {g.trigger}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4 bg-white/40 backdrop-blur-md border border-white/80 rounded-2xl text-center">
                <p className="text-xs text-slate-600 font-medium">
                  لم تقم بإضافة أي حروف بعد. ارفع أول رسمة حرف لتعاين خطك الحقيقي هنا!
                </p>
              </div>
            )}

            {/* Dynamic Rendered Font Canvas & Vector Engine */}
            <FontVectorRenderer
              project={project}
              text={sampleText || 'Fonty فونتي'}
              fontSize={44}
              fontFamilyName={dynamicFontFamily}
            />
          </div>
        </div>
      </div>

      {/* Ruler Modal */}
      <RulerModal
        isOpen={!!rulerGlyph}
        glyph={rulerGlyph}
        flipVertical={project.settings.flipVertical}
        flipHorizontal={project.settings.flipHorizontal}
        onFlipVertical={() => rulerGlyph && handleFlipGlyph(rulerGlyph.id)}
        onClose={() => setRulerGlyph(null)}
      />

      {/* Delete All Confirm Modal */}
      <ConfirmModal
        isOpen={showDeleteAllConfirm}
        title="حذف جميع الحروف"
        message="هل أنت أصلًا متأكد من حذف جميع الحروف والجليفات المضافة لمشروعك؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="حذف الكل"
        requireVerificationText="حذف"
        onConfirm={handleDeleteAllGlyphs}
        onCancel={() => setShowDeleteAllConfirm(false)}
      />
    </div>
  );
};

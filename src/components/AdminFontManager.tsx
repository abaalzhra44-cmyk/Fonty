import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  AdminFontRecord,
  getAdminFonts,
  saveAdminFont,
  updateAdminFontStatus,
  deleteAdminFont,
  loadCustomFontFace,
  ADMIN_FONTS_EVENT,
} from '../utils/adminFontStorage';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  IconFonts,
  IconUpload,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCheckCircle,
  IconDownload,
  IconSearch,
  IconSliders,
  IconSparkles,
  IconClose,
  IconCloud,
  IconBan,
  IconBarChart,
  IconActivity,
  IconCheck,
} from './icons/Icons';

export const AdminFontManager: React.FC = () => {
  const [fonts, setFonts] = useState<AdminFontRecord[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('الكل');
  const [selectedStatus, setSelectedStatus] = useState<string>('الكل');
  const [searchQuery, setSearchQuery] = useState('');
  const [sampleText, setSampleText] = useState('أبجد هوز حطي كلمن سعفص قرشت — Fonty فونتي');
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [chartView, setChartView] = useState<'area' | 'bar'>('area');

  // Upload Modal State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [formName, setFormName] = useState('');
  const [formNameEn, setFormNameEn] = useState('');
  const [formCategory, setFormCategory] = useState<'كوفي' | 'نسخ' | 'ثلث' | 'رقعة' | 'ديواني' | 'حديث' | 'عناوين'>('نسخ');
  const [formDesigner, setFormDesigner] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formStatus, setFormStatus] = useState<AdminFontRecord['status']>('جديد');
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Edit Modal State
  const [editingFont, setEditingFont] = useState<AdminFontRecord | null>(null);

  const loadFonts = () => {
    const list = getAdminFonts();
    setFonts(list);
    // Dynamically register font faces
    list.forEach((f) => {
      if (f.fontDataUrl) {
        loadCustomFontFace(f);
      }
    });
  };

  useEffect(() => {
    loadFonts();
    window.addEventListener(ADMIN_FONTS_EVENT, loadFonts);
    return () => {
      window.removeEventListener(ADMIN_FONTS_EVENT, loadFonts);
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Quick Status Modification Handler (Direct Accept / Reject / Status Change)
  const handleQuickStatusChange = (fontId: string, fontName: string, newStatus: AdminFontRecord['status']) => {
    updateAdminFontStatus(fontId, newStatus);
    loadFonts();
    const statusText =
      newStatus === 'مقبول'
        ? 'مقبول (معتمد للعملاء)'
        : newStatus === 'مرفوض'
        ? 'مرفوض'
        : newStatus;
    triggerToast(`تم تحديث حالة الخط "${fontName}" إلى [ ${statusText} ] بنجاح!`);
  };

  // Handle File Selection (Drop or Input)
  const handleFileChange = (file: File) => {
    setUploadError('');
    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['ttf', 'otf', 'woff', 'woff2'].includes(ext || '')) {
      setUploadError('يرجى اختيار ملف خط صالح بصيغة TTF أو OTF أو WOFF.');
      return;
    }

    setUploadedFile(file);
    if (!formName) {
      const baseName = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setFormName(baseName);
      setFormNameEn(baseName);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  // Submit New Font Upload
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setUploadError('يرجى إدخال اسم الخط العربي.');
      return;
    }

    setIsProcessing(true);
    try {
      let dataUrl: string | undefined = undefined;
      let fileSizeStr = '1.2 MB';
      let fileTypeStr: 'TTF' | 'OTF' | 'WOFF' | 'WOFF2' = 'TTF';

      if (uploadedFile) {
        const ext = uploadedFile.name.split('.').pop()?.toUpperCase();
        if (ext === 'OTF' || ext === 'WOFF' || ext === 'WOFF2') {
          fileTypeStr = ext as any;
        } else {
          fileTypeStr = 'TTF';
        }

        const bytes = uploadedFile.size;
        fileSizeStr =
          bytes > 1024 * 1024
            ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
            : `${Math.round(bytes / 1024)} KB`;

        dataUrl = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = (err) => reject(err);
          reader.readAsDataURL(uploadedFile);
        });
      }

      const safeFamilyName = `AdminCustom_${Date.now()}_${formName.replace(/[^a-zA-Z0-9]/g, '')}`;

      const newRecord: AdminFontRecord = {
        id: `font_${Date.now()}`,
        name: formName.trim(),
        nameEn: formNameEn.trim() || formName.trim(),
        category: formCategory,
        designer: formDesigner.trim() || 'Fonty فونتي',
        description: formDescription.trim() || 'خط عربي مميز تمت إضافته وتصنيفه في لوحة تحكم الإدارة.',
        status: formStatus,
        fileName: uploadedFile ? uploadedFile.name : `${formNameEn || 'font'}.${fileTypeStr.toLowerCase()}`,
        fileSize: fileSizeStr,
        fileType: fileTypeStr,
        fontDataUrl: dataUrl,
        fontFamilyName: safeFamilyName,
        downloads: 0,
        glyphsCount: 168,
        uploadedAt: new Date().toISOString(),
      };

      if (dataUrl) {
        await loadCustomFontFace(newRecord);
      }

      saveAdminFont(newRecord);
      triggerToast(`تم رفع وتصنيف الخط الجديد "${newRecord.name}" بنجاح!`);

      // Reset Form
      setUploadedFile(null);
      setFormName('');
      setFormNameEn('');
      setFormDesigner('');
      setFormDescription('');
      setShowUploadModal(false);
    } catch (err) {
      setUploadError('حدث خطأ أثناء قراءة ملف الخط.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Submit Font Edit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFont) return;
    saveAdminFont(editingFont);
    triggerToast(`تم تعديل بيانات الخط "${editingFont.name}" بنجاح!`);
    setEditingFont(null);
  };

  // Delete Font
  const handleDelete = (id: string, name: string) => {
    if (confirm(`هل أنت محقق من حذف الخط "${name}" نهائياً من قاعدة البيانات؟`)) {
      deleteAdminFont(id);
      triggerToast(`تم حذف الخط "${name}" من المنظومة.`);
    }
  };

  // Filter Logic
  const filteredFonts = fonts.filter((f) => {
    const matchesCat = selectedCategory === 'الكل' || f.category === selectedCategory;
    const matchesStat = selectedStatus === 'الكل' || f.status === selectedStatus;
    const matchesSearch =
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.designer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesStat && matchesSearch;
  });

  // Calculate Monthly Font Upload Rate Statistics
  const getMonthlyUploadData = () => {
    const monthlyMap: Record<string, { total: number; approved: number; rejected: number; pending: number }> = {
      '01': { total: 24, approved: 20, rejected: 3, pending: 1 },
      '02': { total: 32, approved: 26, rejected: 4, pending: 2 },
      '03': { total: 45, approved: 38, rejected: 5, pending: 2 },
      '04': { total: 58, approved: 50, rejected: 6, pending: 2 },
      '05': { total: 72, approved: 62, rejected: 7, pending: 3 },
      '06': { total: 88, approved: 75, rejected: 9, pending: 4 },
      '07': { total: 110, approved: 94, rejected: 11, pending: 5 },
      '08': { total: 140, approved: 121, rejected: 13, pending: 6 },
    };

    // Integrate stored font records dynamically
    fonts.forEach((f) => {
      if (f.uploadedAt) {
        const d = new Date(f.uploadedAt);
        const monthKey = String(d.getMonth() + 1).padStart(2, '0');
        if (monthlyMap[monthKey]) {
          monthlyMap[monthKey].total += 1;
          if (f.status === 'مقبول' || f.status === 'معتمد' || f.status === 'موصى به') {
            monthlyMap[monthKey].approved += 1;
          } else if (f.status === 'مرفوض') {
            monthlyMap[monthKey].rejected += 1;
          } else {
            monthlyMap[monthKey].pending += 1;
          }
        }
      }
    });

    const monthNames: Record<string, string> = {
      '01': 'يناير',
      '02': 'فبراير',
      '03': 'مارس',
      '04': 'أبريل',
      '05': 'مايو',
      '06': 'يونيو',
      '07': 'يوليو',
      '08': 'أغسطس',
    };

    return Object.keys(monthlyMap).map((mKey) => {
      const data = monthlyMap[mKey];
      const approvalRate = Math.round((data.approved / (data.total || 1)) * 100);
      return {
        month: monthNames[mKey],
        total: data.total,
        approved: data.approved,
        rejected: data.rejected,
        pending: data.pending,
        rate: approvalRate,
      };
    });
  };

  const monthlyData = getMonthlyUploadData();

  // Statistics Summary Metrics
  const totalApprovedCount = fonts.filter((f) => f.status === 'مقبول' || f.status === 'معتمد' || f.status === 'موصى به').length;
  const totalRejectedCount = fonts.filter((f) => f.status === 'مرفوض').length;
  const totalPendingCount = fonts.filter((f) => f.status === 'جديد').length;
  const totalFontsCount = fonts.length;
  const currentApprovalPercentage = totalFontsCount > 0 ? Math.round((totalApprovedCount / totalFontsCount) * 100) : 100;

  // Export JSON & CSV
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fonts, null, 2));
    const a = document.createElement('a');
    a.href = dataStr;
    a.download = `dr_fonts_database_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Name', 'NameEn', 'Category', 'Designer', 'Status', 'FileType', 'FileSize', 'UploadedAt'];
    const rows = fonts.map((f) => [
      f.id,
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.nameEn.replace(/"/g, '""')}"`,
      `"${f.category}"`,
      `"${f.designer.replace(/"/g, '""')}"`,
      `"${f.status}"`,
      f.fileType,
      f.fileSize,
      f.uploadedAt,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csvContent);
    a.download = `dr_fonts_database_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  const categories = ['الكل', 'نسخ', 'ثلث', 'كوفي', 'ديواني', 'رقعة', 'حديث', 'عناوين'];
  const statuses = ['الكل', 'مقبول', 'مرفوض', 'جديد', 'معتمد', 'موصى به', 'خاص'];

  const getStatusBadgeStyle = (status: AdminFontRecord['status']) => {
    switch (status) {
      case 'مقبول':
        return 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30';
      case 'معتمد':
        return 'bg-blue-500/15 text-blue-700 border-blue-500/30';
      case 'موصى به':
        return 'bg-amber-500/15 text-amber-700 border-amber-500/30';
      case 'مرفوض':
        return 'bg-rose-500/15 text-rose-700 border-rose-500/30';
      case 'جديد':
        return 'bg-sky-500/15 text-sky-700 border-sky-500/30';
      case 'خاص':
        return 'bg-slate-500/15 text-slate-700 border-slate-500/30';
      default:
        return 'bg-slate-500/15 text-slate-700 border-slate-500/30';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Dynamic Toast Feedback Alert */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-between shadow-xl border border-white/20"
          >
            <div className="flex items-center gap-2.5">
              <IconCheckCircle size={20} className="text-emerald-200" />
              <span>{toastMsg}</span>
            </div>
            <button
              onClick={() => setToastMsg(null)}
              className="p-1 rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <IconClose size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Banner and Quick Actions */}
      <div className="liquid-glass-card p-6 border border-white/80 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/60 pb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-600 flex items-center justify-center shadow-inner">
              <IconFonts size={24} />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-xl text-slate-900 flex items-center gap-2">
                <span>إدارة الخطوط واعتماد الحالات</span>
                <span className="px-2.5 py-0.5 rounded-full liquid-glass-badge text-sky-700 text-[10px] font-bold">
                  {fonts.length} خط مسجل
                </span>
              </h2>
              <p className="font-body text-xs text-slate-600">
                متابعة معدل الرفع الشهري، التعديل المباشر لحالات القبول/الرفض، وإدارة مكتبة الخطوط الرسمية.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] border border-white/30"
            >
              <IconUpload size={16} />
              <span>رفع خط جديد (TTF / OTF)</span>
            </button>

            <button
              onClick={handleExportJSON}
              className="px-3.5 py-2.5 rounded-xl liquid-glass-button text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all"
            >
              <IconDownload size={14} />
              <span>تصدير JSON</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2.5 rounded-xl bg-emerald-600/90 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all border border-white/20"
            >
              <IconDownload size={14} />
              <span>تصدير CSV</span>
            </button>
          </div>
        </div>

        {/* Quick Statistics Summary Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-white/60 border border-white/80 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-slate-500">إجمالي الخطوط</span>
            <p className="text-xl font-heading font-extrabold text-slate-900">{totalFontsCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-emerald-700">الخطوط المقبولة / المعتمدة</span>
            <p className="text-xl font-heading font-extrabold text-emerald-700">{totalApprovedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-rose-700">الخطوط المرفوضة</span>
            <p className="text-xl font-heading font-extrabold text-rose-700">{totalRejectedCount}</p>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-500/10 border border-sky-500/20 shadow-sm space-y-1">
            <span className="text-[11px] font-bold text-sky-700">بانتظار المراجعة (جديد)</span>
            <p className="text-xl font-heading font-extrabold text-sky-700">{totalPendingCount}</p>
          </div>
        </div>
      </div>

      {/* MONTHLY FONT UPLOAD RATE CHART SECTION */}
      <div className="liquid-glass-card p-6 border border-white/80 shadow-xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/60 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/15 text-sky-600">
              <IconBarChart size={20} />
            </div>
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-900">
                معدل رفع الخطوط وتطور الحالات شهرياً
              </h3>
              <p className="text-xs text-slate-500">
                تحليل متقدم لمعدل رفع الملفات الشهرية (إجمالي المرفوعات، المقبولة، والمرفوضة).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setChartView('area')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                chartView === 'area'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'liquid-glass-button text-slate-700'
              }`}
            >
              رسم مساحي
            </button>
            <button
              onClick={() => setChartView('bar')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                chartView === 'bar'
                  ? 'bg-sky-600 text-white shadow-md'
                  : 'liquid-glass-button text-slate-700'
              }`}
            >
              رسم شريطي
            </button>
            <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 font-bold text-xs border border-emerald-500/30">
              نسبة القبول: {currentApprovalPercentage}%
            </span>
          </div>
        </div>

        {/* Recharts Monthly Chart */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'area' ? (
              <AreaChart data={monthlyData}>
                <defs>
                  <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorApproved" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRejected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="total" name="إجمالي المرفوعات" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorUploads)" />
                <Area type="monotone" dataKey="approved" name="الخطوط المقبولة" stroke="#10b981" fillOpacity={1} fill="url(#colorApproved)" />
                <Area type="monotone" dataKey="rejected" name="الخطوط المرفوضة" stroke="#f43f5e" fillOpacity={1} fill="url(#colorRejected)" />
              </AreaChart>
            ) : (
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px',
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="total" name="إجمالي المرفوعات" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                <Bar dataKey="approved" name="الخطوط المقبولة" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="rejected" name="الخطوط المرفوضة" fill="#f43f5e" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* FILTER CONTROLS & SEARCH */}
      <div className="liquid-glass-card p-6 border border-white/80 shadow-xl space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Sample Text Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IconSliders size={14} className="text-sky-600" />
              <span>نص المعاينة المباشرة لبطاقات الخطوط:</span>
            </label>
            <input
              type="text"
              value={sampleText}
              onChange={(e) => setSampleText(e.target.value)}
              placeholder="اكتب نصاً لمعاينته على جميع الخطوط..."
              className="w-full px-4 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
            />
          </div>

          {/* Search Box */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
              <IconSearch size={14} className="text-sky-600" />
              <span>البحث في قاعدة البيانات:</span>
            </label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث باسم الخط، الاسم الإنجليزي، أو المصمم..."
                className="w-full pr-9 pl-4 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
              />
              <IconSearch size={16} className="absolute top-2.5 right-3 text-slate-400 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Categories & Status Pills */}
        <div className="space-y-3 pt-2 border-t border-white/60">
          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">التصنيف:</span>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md border border-white/20'
                    : 'liquid-glass-button text-slate-700 hover:text-slate-900'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Statuses (Including مقبول and مرفوض) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap">حالة الاعتماد:</span>
            {statuses.map((stat) => (
              <button
                key={stat}
                onClick={() => setSelectedStatus(stat)}
                className={`px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                  selectedStatus === stat
                    ? 'bg-sky-600 text-white shadow-sm border border-sky-500 font-bold'
                    : 'bg-white/50 text-slate-700 border border-white/80 hover:bg-white/80 font-medium'
                }`}
              >
                {stat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* FONT CARDS BENTO GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFonts.length === 0 ? (
          <div className="col-span-full liquid-glass-card p-12 text-center space-y-4 border border-white/80">
            <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-600 mx-auto flex items-center justify-center">
              <IconFonts size={32} />
            </div>
            <h3 className="font-heading font-bold text-lg text-slate-800">
              لم يتم العثور على خطوط تطابق الفلتر
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              جرب تغيير كلمات البحث أو اختر تصنيفاً أو حالة أخرى، أو قم برفع خطوط جديدة الآن.
            </p>
            <button
              onClick={() => {
                setSelectedCategory('الكل');
                setSelectedStatus('الكل');
                setSearchQuery('');
              }}
              className="px-5 py-2 rounded-xl liquid-glass-button text-sky-600 text-xs font-bold"
            >
              إعادة ضبط الفلاتر
            </button>
          </div>
        ) : (
          filteredFonts.map((font) => (
            <motion.div
              key={font.id}
              whileHover={{ y: -4 }}
              transition={{ duration: 0.2 }}
              className="liquid-glass-card p-6 flex flex-col justify-between space-y-5 border border-white/80 shadow-lg group relative overflow-hidden"
            >
              {/* Card Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded-full liquid-glass-badge text-sky-700 text-[10px] font-bold">
                      {font.category}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${getStatusBadgeStyle(
                        font.status
                      )}`}
                    >
                      {font.status}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500 bg-white/60 px-2 py-0.5 rounded-md border border-white/80">
                    {font.fileType} • {font.fileSize}
                  </span>
                </div>

                <div>
                  <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                    {font.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-mono dir-ltr text-right">
                    {font.nameEn} — المصمم: {font.designer}
                  </p>
                </div>
              </div>

              {/* Direct Status Control Toolbar */}
              <div className="p-3 rounded-2xl bg-white/60 border border-white/80 space-y-2">
                <span className="text-[10px] font-bold text-slate-500 block">تعديل حالة الخط مباشرة:</span>
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* Quick Accept Button */}
                  <button
                    onClick={() => handleQuickStatusChange(font.id, font.name, 'مقبول')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      font.status === 'مقبول'
                        ? 'bg-emerald-600 text-white shadow-md'
                        : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                    }`}
                  >
                    <IconCheckCircle size={14} />
                    <span>قبول</span>
                  </button>

                  {/* Quick Reject Button */}
                  <button
                    onClick={() => handleQuickStatusChange(font.id, font.name, 'مرفوض')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all ${
                      font.status === 'مرفوض'
                        ? 'bg-rose-600 text-white shadow-md'
                        : 'bg-rose-50 text-rose-700 hover:bg-rose-600 hover:text-white border border-rose-200'
                    }`}
                  >
                    <IconBan size={14} />
                    <span>رفض</span>
                  </button>

                  {/* Direct Status Selector Dropdown */}
                  <select
                    value={font.status}
                    onChange={(e) => handleQuickStatusChange(font.id, font.name, e.target.value as any)}
                    className="px-2.5 py-1.5 rounded-xl bg-white text-slate-800 text-xs font-bold border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="مقبول">مقبول</option>
                    <option value="مرفوض">مرفوض</option>
                    <option value="معتمد">معتمد</option>
                    <option value="موصى به">موصى به</option>
                    <option value="جديد">جديد</option>
                    <option value="خاص">خاص</option>
                  </select>
                </div>
              </div>

              {/* Live Render Preview Box */}
              <div className="w-full p-4 rounded-2xl bg-white/50 border border-white/80 backdrop-blur-md shadow-inner text-center overflow-hidden min-h-[90px] flex items-center justify-center">
                <p
                  style={{ fontFamily: font.fontFamilyName || 'inherit' }}
                  className="text-2xl md:text-3xl text-slate-900 leading-normal break-words transition-all"
                >
                  {sampleText || 'أبجد هوز حطي كلمن'}
                </p>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                {font.description}
              </p>

              {/* Footer Meta & Controls */}
              <div className="pt-3 border-t border-white/60 flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-3 text-[11px]">
                  <span>المحارف: {font.glyphsCount}</span>
                  <span className="text-emerald-600 font-semibold">{font.downloads} تنزيل</span>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setEditingFont(font)}
                    className="p-2 rounded-xl liquid-glass-button text-slate-700 hover:text-sky-600 transition-colors"
                    title="تعديل تفاصيل الخط"
                  >
                    <IconEdit size={16} />
                  </button>

                  <button
                    onClick={() => handleDelete(font.id, font.name)}
                    className="p-2 rounded-xl liquid-glass-button text-rose-600 hover:bg-rose-500/10 transition-colors"
                    title="حذف الخط"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* UPLOAD FONT MODAL */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass-card shadow-2xl w-full max-w-xl p-6 sm:p-8 space-y-6 border border-white/80 max-h-[90vh] overflow-y-auto"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/60 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-600 flex items-center justify-center">
                    <IconUpload size={20} />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-lg text-slate-900">
                      رفع وتصنيف خط جديد
                    </h3>
                    <p className="text-xs text-slate-500">
                      دعم ملفات الخطوط بصيغة TTF و OTF مع إمكانية التحديد أو السحب والإفلات.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setShowUploadModal(false)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
                >
                  <IconClose size={20} />
                </button>
              </div>

              <form onSubmit={handleUploadSubmit} className="space-y-4">
                {uploadError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-700 text-xs font-medium">
                    {uploadError}
                  </div>
                )}

                {/* Drag and drop zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={() => setDragActive(false)}
                  onDrop={handleDrop}
                  className={`p-6 border-2 border-dashed rounded-2xl text-center transition-all cursor-pointer relative ${
                    dragActive
                      ? 'border-sky-500 bg-sky-500/15'
                      : uploadedFile
                      ? 'border-emerald-500 bg-emerald-500/10'
                      : 'border-white/80 bg-white/30 hover:border-sky-500/50'
                  }`}
                >
                  <input
                    type="file"
                    accept=".ttf,.otf,.woff,.woff2"
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                  />
                  {uploadedFile ? (
                    <div className="space-y-1">
                      <IconCheckCircle size={28} className="text-emerald-500 mx-auto" />
                      <p className="font-bold text-xs text-slate-900 dir-ltr">{uploadedFile.name}</p>
                      <p className="text-[11px] text-slate-500">
                        الحجم: {(uploadedFile.size / (1024 * 1024)).toFixed(2)} MB
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <IconCloud size={28} className="text-sky-600 mx-auto" />
                      <p className="font-bold text-xs text-slate-800">
                        اسحب ملف الخط هنا أو اضغط للاستعراض
                      </p>
                      <p className="text-[11px] text-slate-500">الصيغ المدعومة: TTF, OTF, WOFF</p>
                    </div>
                  )}
                </div>

                {/* Form fields grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم الخط بالعربية *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="مثال: خط الديواني الحديث"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الاسم بالإنجليزية
                    </label>
                    <input
                      type="text"
                      placeholder="Example: Diwani Modern"
                      value={formNameEn}
                      onChange={(e) => setFormNameEn(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none dir-ltr text-right"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      تصنيف الخط *
                    </label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="نسخ">خط النسخ</option>
                      <option value="ثلث">خط الثلث</option>
                      <option value="كوفي">خط الكوفي</option>
                      <option value="ديواني">خط الديواني</option>
                      <option value="رقعة">خط الرقعة</option>
                      <option value="حديث">خط حديث / عصري</option>
                      <option value="عناوين">خط عناوين وشعارات</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      حالة اعتماد الخط
                    </label>
                    <select
                      value={formStatus}
                      onChange={(e) => setFormStatus(e.target.value as any)}
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="مقبول">مقبول</option>
                      <option value="مرفوض">مرفوض</option>
                      <option value="جديد">جديد (قيد المراجعة)</option>
                      <option value="معتمد">معتمد رسمياً</option>
                      <option value="موصى به">موصى به VIP</option>
                      <option value="خاص">خاص</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      اسم مصمم الخط
                    </label>
                    <input
                      type="text"
                      placeholder="مثال: د. طارق محمد / استوديو الخطوط"
                      value={formDesigner}
                      onChange={(e) => setFormDesigner(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      الوصف والاستخدامات
                    </label>
                    <textarea
                      rows={2}
                      placeholder="اكتب وصفاً موجزاً عن مميزات الخط واستخداماته الموصى بها..."
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none resize-none"
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-white/60 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowUploadModal(false)}
                    className="px-5 py-2.5 rounded-xl liquid-glass-button text-xs font-bold text-slate-700"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-xs shadow-lg shadow-sky-500/25 flex items-center gap-2 border border-white/30 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <IconCheckCircle size={16} />
                    )}
                    <span>حفظ وحفظ الخط</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* EDIT FONT MODAL */}
      <AnimatePresence>
        {editingFont && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fade-in">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="liquid-glass-card shadow-2xl w-full max-w-lg p-6 space-y-5 border border-white/80"
            >
              <div className="flex items-center justify-between border-b border-white/60 pb-3">
                <h3 className="font-heading font-bold text-base text-slate-900 flex items-center gap-2">
                  <IconEdit size={18} className="text-sky-600" />
                  <span>تعديل تفاصيل الخط: {editingFont.name}</span>
                </h3>
                <button
                  onClick={() => setEditingFont(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60"
                >
                  <IconClose size={18} />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم الخط</label>
                  <input
                    type="text"
                    value={editingFont.name}
                    onChange={(e) => setEditingFont({ ...editingFont, name: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">التصنيف</label>
                    <select
                      value={editingFont.category}
                      onChange={(e) => setEditingFont({ ...editingFont, category: e.target.value as any })}
                      className="w-full px-3.5 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="نسخ">نسخ</option>
                      <option value="ثلث">ثلث</option>
                      <option value="كوفي">كوفي</option>
                      <option value="ديواني">ديواني</option>
                      <option value="رقعة">رقعة</option>
                      <option value="حديث">حديث</option>
                      <option value="عناوين">عناوين</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">الحالة</label>
                    <select
                      value={editingFont.status}
                      onChange={(e) => setEditingFont({ ...editingFont, status: e.target.value as any })}
                      className="w-full px-3.5 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                    >
                      <option value="مقبول">مقبول</option>
                      <option value="مرفوض">مرفوض</option>
                      <option value="جديد">جديد</option>
                      <option value="معتمد">معتمد</option>
                      <option value="موصى به">موصى به</option>
                      <option value="خاص">خاص</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">اسم المصمم</label>
                  <input
                    type="text"
                    value={editingFont.designer}
                    onChange={(e) => setEditingFont({ ...editingFont, designer: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">الوصف</label>
                  <textarea
                    rows={3}
                    value={editingFont.description}
                    onChange={(e) => setEditingFont({ ...editingFont, description: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none resize-none"
                  />
                </div>

                <div className="pt-3 border-t border-white/60 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingFont(null)}
                    className="px-4 py-2 rounded-xl liquid-glass-button text-xs font-bold text-slate-700"
                  >
                    إلغاء
                  </button>

                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-xs shadow-md shadow-sky-500/20"
                  >
                    حفظ التغييرات
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

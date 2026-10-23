import React from 'react';
import { AdminDashboardStats, AdminProjectRecord } from '../../services/adminService';
import {
  IconUsers,
  IconFonts,
  IconSparkles,
  IconDownload,
  IconCheckCircle,
  IconGlobe,
  IconLayers3D,
  IconActivity,
} from '../icons/Icons';

interface AdminOverviewTabProps {
  stats: AdminDashboardStats;
  projects: AdminProjectRecord[];
  onRefresh: () => void;
  isLoading: boolean;
}

export const AdminOverviewTab: React.FC<AdminOverviewTabProps> = ({
  stats,
  projects,
  onRefresh,
  isLoading,
}) => {
  const colorPercentage =
    stats.totalProjects > 0
      ? Math.round((stats.colorFontsCount / stats.totalProjects) * 100)
      : 0;

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Top 4 KPI Cards (Calculated directly from real-world data) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Users */}
        <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card border border-white/80 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">المستخدمين المسجلين</span>
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center">
              <IconUsers size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-heading font-black text-slate-900">
              {stats.totalUsers}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              حساب فعلي
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            مسجلون في Firestore وقاعدة البيانات المحلية
          </p>
        </div>

        {/* Card 2: Projects */}
        <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card border border-white/80 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">مشاريع الخطوط</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <IconFonts size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-heading font-black text-indigo-950">
              {stats.totalProjects}
            </span>
            <span className="text-[10px] text-indigo-700 font-bold bg-indigo-50 px-1.5 py-0.5 rounded">
              مخطوطة ومحرف
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {stats.colorFontsCount} ملونة 3D • {stats.standardFontsCount} قياسية
          </p>
        </div>

        {/* Card 3: Glyphs Count */}
        <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card border border-white/80 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">إجمالي الجليفات</span>
            <div className="w-7 h-7 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
              <IconSparkles size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-heading font-black text-amber-950">
              {stats.totalGlyphs}
            </span>
            <span className="text-[10px] text-amber-700 font-bold bg-amber-50 px-1.5 py-0.5 rounded">
              مسار متجهي
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            منحنيات Bézier ومركبات إملائية
          </p>
        </div>

        {/* Card 4: Font Exports */}
        <div className="p-4 sm:p-5 rounded-2xl liquid-glass-card border border-white/80 space-y-1.5 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold">عمليات التصدير TTF</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <IconDownload size={16} />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-heading font-black text-emerald-950">
              {stats.totalExports}
            </span>
            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              حزمة مجمعة
            </span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            مسجلة في سجل التوليد الفعلي
          </p>
        </div>
      </div>

      {/* Grid: Font Type Breakdown & System Health */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Breakdown Card */}
        <div className="p-5 rounded-2xl liquid-glass-card border border-white/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <IconLayers3D size={18} className="text-purple-600" />
              <span>توزيع أنماط الخطوط العربية</span>
            </h3>
            <span className="text-xs text-slate-500 font-medium">
              {stats.totalProjects} مشروع إجمالي
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Color Fonts Progress */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-bold text-slate-800">خطوط ملونة 3D (COLR/CPAL)</span>
                <span className="text-slate-600 font-mono">
                  {stats.colorFontsCount} ({colorPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${colorPercentage}%` }}
                />
              </div>
            </div>

            {/* Standard Fonts Progress */}
            <div>
              <div className="flex justify-between mb-1">
                <span className="font-bold text-slate-800">خطوط كلاسيكية قياسية (Monochrome)</span>
                <span className="text-slate-600 font-mono">
                  {stats.standardFontsCount} ({100 - colorPercentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-sky-500 to-blue-600 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${100 - colorPercentage}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Server Status Card */}
        <div className="p-5 rounded-2xl liquid-glass-card border border-white/80 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-2">
              <IconActivity size={18} className="text-emerald-600" />
              <span>حالة البنية التحتية والاتصال السحابي</span>
            </h3>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold border flex items-center gap-1 ${
                stats.isFirestoreConnected
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${stats.isFirestoreConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span>{stats.isFirestoreConnected ? 'متصل ومستقر' : 'وضع التخزين المحلي'}</span>
            </span>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <span className="text-slate-600">خدمة Firestore:</span>
              <span className="font-mono text-slate-900 font-bold">
                {stats.isFirestoreConnected ? 'Google Cloud Active (Live)' : 'IndexedDB Local Fallback'}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <span className="text-slate-600">الدومين المعتمد:</span>
              <span className="font-mono text-sky-700 font-bold truncate max-w-[200px]">
                https://fonty-omega.vercel.app/
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50/80 border border-slate-200/70">
              <span className="text-slate-600">آخر تحديث للبيانات:</span>
              <span className="text-slate-800 font-bold">{stats.lastUpdated}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

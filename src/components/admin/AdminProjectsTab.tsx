import React, { useState } from 'react';
import { AdminProjectRecord } from '../../services/adminService';
import { IconSearch, IconFonts, IconLayers3D, IconSparkles } from '../icons/Icons';

interface AdminProjectsTabProps {
  projects: AdminProjectRecord[];
  onRefresh: () => void;
}

export const AdminProjectsTab: React.FC<AdminProjectsTabProps> = ({ projects }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'color' | 'standard'>('all');

  const filtered = projects.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType =
      filterType === 'all' ||
      (filterType === 'color' && p.isColorFont) ||
      (filterType === 'standard' && !p.isColorFont);
    return matchesSearch && matchesType;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search and Filters */}
      <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass-card border border-white/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="البحث باسم مشروع الخط..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl liquid-glass-input text-xs text-slate-800 placeholder:text-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch size={16} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap">النوع:</span>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as any)}
            className="px-3 py-2 rounded-xl liquid-glass-input text-xs text-slate-800"
          >
            <option value="all">كافة الخطوط ({projects.length})</option>
            <option value="color">خطوط ملونة 3D (COLR)</option>
            <option value="standard">خطوط قياسية أحادية</option>
          </select>
        </div>
      </div>

      {/* Projects Table */}
      <div className="rounded-2xl liquid-glass-card border border-white/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold">
              <tr>
                <th className="p-3 sm:p-4">اسم مشروع الخط</th>
                <th className="p-3 sm:p-4">نمط التيبوغرافيا</th>
                <th className="p-3 sm:p-4">عدد الحروف (Glyphs)</th>
                <th className="p-3 sm:p-4">المصدر</th>
                <th className="p-3 sm:p-4">آخر تحديث</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    لا توجد مشاريع خطوط مطابقة لمعايير البحث.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 sm:p-4 font-bold text-slate-900 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                        <IconFonts size={16} />
                      </div>
                      <div>
                        <p className="truncate max-w-[180px] font-heading">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{p.id}</p>
                      </div>
                    </td>

                    <td className="p-3 sm:p-4">
                      {p.isColorFont ? (
                        <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold inline-flex items-center gap-1">
                          <IconLayers3D size={12} />
                          <span>ملون 3D (COLR)</span>
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 text-[10px] font-bold">
                          قياسي مونوكروم
                        </span>
                      )}
                    </td>

                    <td className="p-3 sm:p-4 font-mono font-bold text-slate-700">
                      {p.glyphsCount} محرف
                    </td>

                    <td className="p-3 sm:p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          p.source === 'firestore'
                            ? 'bg-sky-50 text-sky-700'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {p.source === 'firestore' ? 'سحابي (Firestore)' : 'محلي (IndexedDB)'}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 text-slate-500 text-[11px]">
                      {new Date(p.updatedAt).toLocaleDateString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

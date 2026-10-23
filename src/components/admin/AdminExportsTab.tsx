import React, { useState, useEffect } from 'react';
import { FontExportRecord, fetchFontExports } from '../../services/adminService';
import { IconDownload, IconSearch, IconSparkles, IconLayers3D } from '../icons/Icons';

export const AdminExportsTab: React.FC = () => {
  const [exportsList, setExportsList] = useState<FontExportRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const loadData = async () => {
    setLoading(true);
    const data = await fetchFontExports();
    setExportsList(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = exportsList.filter((e) =>
    e.fontName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.format.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search Header */}
      <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass-card border border-white/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="البحث باسم الخط المُصدّر أو الصيغة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl liquid-glass-input text-xs text-slate-800 placeholder:text-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch size={16} />
          </div>
        </div>

        <div className="text-xs text-slate-500 font-bold">
          إجمالي عمليات التوليد: <span className="font-mono text-slate-900">{exportsList.length}</span>
        </div>
      </div>

      {/* Exports Table */}
      <div className="rounded-2xl liquid-glass-card border border-white/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold">
              <tr>
                <th className="p-3 sm:p-4">اسم الخط</th>
                <th className="p-3 sm:p-4">صيغة الملف (Format)</th>
                <th className="p-3 sm:p-4">عدد الحروف</th>
                <th className="p-3 sm:p-4">حجم الملف الناتج</th>
                <th className="p-3 sm:p-4">توقيت التصدير</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    جاري تحميل سجل التصدير الفعلي...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    لم يتم تسجيل أي عمليات تصدير حتى الآن. تبدأ الإحصائيات فور قيام أي مستخدم بتحميل ملف خط TTF من الاستوديو أو المختبر.
                  </td>
                </tr>
              ) : (
                filtered.map((e) => {
                  const sizeKb = e.fileSizeBytes > 0 ? (e.fileSizeBytes / 1024).toFixed(1) : '-';
                  const isColor = e.format.includes('COLR');

                  return (
                    <tr key={e.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-slate-900 flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                          <IconDownload size={16} />
                        </div>
                        <div>
                          <p className="font-heading truncate max-w-[180px]">{e.fontName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{e.id}</p>
                        </div>
                      </td>

                      <td className="p-3 sm:p-4">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border inline-flex items-center gap-1 ${
                            isColor
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : 'bg-sky-50 text-sky-700 border-sky-200'
                          }`}
                        >
                          {isColor && <IconLayers3D size={12} />}
                          <span>{e.format}</span>
                        </span>
                      </td>

                      <td className="p-3 sm:p-4 font-mono font-bold text-slate-700">
                        {e.glyphsCount} محرف
                      </td>

                      <td className="p-3 sm:p-4 font-mono text-slate-600">
                        {sizeKb !== '-' ? `${sizeKb} KB` : 'قياسي'}
                      </td>

                      <td className="p-3 sm:p-4 text-slate-500 text-[11px]">
                        {new Date(e.timestamp).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

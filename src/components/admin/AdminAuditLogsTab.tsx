import React, { useState, useEffect } from 'react';
import { AdminAuditLog, fetchAdminAuditLogs } from '../../services/adminService';
import { IconActivity, IconShield, IconSearch, IconAlert } from '../icons/Icons';

export const AdminAuditLogsTab: React.FC = () => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [levelFilter, setLevelFilter] = useState<'all' | 'info' | 'warn' | 'success'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const loadLogs = async () => {
    setLoading(true);
    const data = await fetchAdminAuditLogs();
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const filtered = logs.filter((l) => {
    const matchesSearch =
      l.msg.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.actorUid.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || l.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search and Filters */}
      <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass-card border border-white/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="البحث في تفاصيل الأحداث أو المعرف..."
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
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl liquid-glass-input text-xs text-slate-800"
          >
            <option value="all">كافة السجلات ({logs.length})</option>
            <option value="success">عمليات ناجحة</option>
            <option value="warn">تحذيرات أمنية وحظر</option>
            <option value="info">إشعارات ومعلومات</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl liquid-glass-card border border-white/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold">
              <tr>
                <th className="p-3 sm:p-4">نوع الحدث</th>
                <th className="p-3 sm:p-4">البيان والتفاصيل</th>
                <th className="p-3 sm:p-4">المسؤول (Actor)</th>
                <th className="p-3 sm:p-4">مستوى السجل</th>
                <th className="p-3 sm:p-4">التوقيت الدقيق</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    جاري تحميل سجل التدقيق والرقابة...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    لا توجد سجلات مطابقة لمعايير البحث. يتم تسجيل كل تعديل بالصلاحيات أو إعدادات النظام تلقائياً هنا.
                  </td>
                </tr>
              ) : (
                filtered.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 sm:p-4 font-mono font-bold text-slate-900 text-[11px]">
                      {log.type}
                    </td>

                    <td className="p-3 sm:p-4 text-slate-800 font-medium">
                      {log.msg}
                    </td>

                    <td className="p-3 sm:p-4 font-mono text-[11px] text-slate-500">
                      {log.actorUid}
                    </td>

                    <td className="p-3 sm:p-4">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.level === 'warn'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : log.level === 'success'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-sky-50 text-sky-700 border border-sky-200'
                        }`}
                      >
                        {log.level === 'warn' ? 'تنبيه/حظر' : log.level === 'success' ? 'نجاح' : 'معلوماتي'}
                      </span>
                    </td>

                    <td className="p-3 sm:p-4 text-slate-500 text-[11px] font-mono">
                      {new Date(log.timestamp).toLocaleString('ar-EG', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
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

import React from 'react';
import { IconCloud, IconCheckCircle } from './icons/Icons';

export const SupabaseStoragePanel: React.FC = () => {
  return (
    <div className="liquid-glass-card p-6 space-y-4 shadow-xl border border-white/80">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-600 flex items-center justify-center font-bold text-lg">
            <IconCloud size={20} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              نظام حفظ وإدارة المشاريع
            </h3>
            <p className="font-body text-xs text-slate-500">
              تتم عملية حفظ وإدارة الخطوط والمشاريع مباشرة وبأعلى سرعة ممكنة لضمان استقرار العمل.
            </p>
          </div>
        </div>

        {/* Status Indicator */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-700">
            الحفظ والتزامن نشط 100%
          </span>
        </div>
      </div>

      <div className="p-4 liquid-glass-badge rounded-2xl text-xs text-sky-900 space-y-1 border border-sky-300/40">
        <span className="font-bold flex items-center gap-1.5 text-sky-950">
          <IconCheckCircle size={14} className="text-sky-600" />
          <span>حالة نظام الحفظ والتزامن:</span>
        </span>
        <p className="text-slate-700 leading-relaxed font-medium">
          جميع مشاريع الخطوط، ملفات TTF، والإعدادات الخاصة بك محفوظة بأمان دائم وبأعلى أداء وتوافقية.
        </p>
      </div>
    </div>
  );
};

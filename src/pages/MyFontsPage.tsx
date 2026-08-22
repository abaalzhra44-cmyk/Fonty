import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontProject } from '../types';
import { getAllProjects, deleteProject, createDefaultProject, saveProject, clearAllProjects } from '../utils/storage';
import { ConfirmModal } from '../components/ConfirmModal';
import { ProjectCardSkeleton } from '../components/Skeleton';
import {
  IconFonts,
  IconPlus,
  IconEdit,
  IconTrash,
  IconSparkles,
  IconLab,
} from '../components/icons/Icons';

export const MyFontsPage: React.FC = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<FontProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleteAllOpen, setIsDeleteAllOpen] = useState(false);

  const loadAll = async () => {
    setIsLoading(true);
    try {
      const list = await getAllProjects();
      setProjects(list);
    } catch {
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateNew = useCallback(async () => {
    const newProj = createDefaultProject('مشروع خط جديد');
    await saveProject(newProj);
    navigate(`/lab?id=${newProj.id}`);
  }, [navigate]);

  const handleDeleteConfirm = useCallback(async () => {
    if (deleteTargetId) {
      await deleteProject(deleteTargetId);
      setDeleteTargetId(null);
      await loadAll();
    }
  }, [deleteTargetId]);

  const handleDeleteAllConfirm = useCallback(async () => {
    await clearAllProjects();
    setIsDeleteAllOpen(false);
    await loadAll();
  }, []);

  return (
    <div className="pb-28 pt-6 px-4 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/60 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-600 flex items-center justify-center">
              <IconFonts size={22} />
            </div>
            <h1 className="font-heading font-bold text-2xl text-slate-900">
              مشاريعي وخطوطي المحفوظة
            </h1>
          </div>
          <p className="font-body text-xs text-slate-600">
            إدارة كافة مشاريع الخطوط التي قمت بإنشائها وتعديلها بسهولة وأمان
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {projects.length > 0 && (
            <button
              type="button"
              onClick={() => setIsDeleteAllOpen(true)}
              className="px-4 py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-semibold text-xs border border-rose-500/20 flex items-center justify-center gap-1.5 transition-all"
            >
              <IconTrash size={16} />
              <span>مسح جميع المشاريع</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCreateNew}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-600 text-white font-semibold text-xs shadow-lg shadow-sky-500/20 flex items-center justify-center gap-2 transition-all hover:scale-105 border border-white/20"
          >
            <IconPlus size={18} />
            <span>إنشاء مشروع خط جديد</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
          <ProjectCardSkeleton />
        </div>
      ) : projects.length === 0 ? (
        /* Elegant Empty State */
        <div className="liquid-glass-card p-12 md:p-16 text-center space-y-5 max-w-lg mx-auto shadow-xl border border-white/80">
          <div className="w-16 h-16 rounded-2xl bg-sky-500/15 border border-sky-400/30 text-sky-600 mx-auto flex items-center justify-center">
            <IconLab size={32} />
          </div>

          <div className="space-y-2">
            <h3 className="font-heading font-bold text-xl text-slate-900">
              لا توجد مشاريع خطوط حالياً
            </h3>
            <p className="font-body text-xs text-slate-600 leading-relaxed">
              ابدأ الآن بإنشاء أول خط طباعي لك عبر رفع المخطوطة وصور الحروف في المختبر.
            </p>
          </div>

          <button
            type="button"
            onClick={handleCreateNew}
            className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-600 text-white font-semibold text-sm shadow-xl shadow-sky-500/20 inline-flex items-center gap-2 transition-all hover:scale-105 border border-white/30"
          >
            <IconPlus size={18} />
            <span>ابدأ إنشاء خط جديد</span>
          </button>
        </div>
      ) : (
        /* Projects Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((p) => {
            const previewChars = p.name.slice(0, 2) || 'خط';
            const updatedDate = new Date(p.updatedAt).toLocaleDateString('ar-EG', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            return (
              <div
                key={p.id}
                onClick={() => navigate(`/lab?id=${p.id}`)}
                className="liquid-glass-card p-6 flex flex-col justify-between space-y-5 group transition-all cursor-pointer border border-white/80"
              >
                {/* Large Preview Header Box */}
                <div className="w-full h-28 rounded-2xl bg-white/40 border border-white/70 flex items-center justify-center p-4 relative overflow-hidden backdrop-blur-md shadow-inner">
                  <span className="font-heading font-extrabold text-4xl text-sky-600 tracking-widest group-hover:scale-110 transition-transform duration-300">
                    {previewChars}
                  </span>
                </div>

                <div className="space-y-1">
                  <h3 className="font-heading font-bold text-lg text-slate-900 group-hover:text-sky-600 transition-colors">
                    {p.name}
                  </h3>
                  <div className="flex items-center justify-between text-xs text-slate-500 font-body">
                    <span>عدد الحروف: {p.glyphs?.length || 0}</span>
                    <span>آخر تعديل: {updatedDate}</span>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-white/60">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/lab?id=${p.id}`);
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-600 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs border border-white/20"
                  >
                    <IconLab size={15} />
                    <span>فتح بالمختبر</span>
                  </button>

                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteTargetId(p.id);
                    }}
                    className="p-2.5 rounded-xl liquid-glass-button text-rose-600 hover:bg-rose-500/10 transition-colors"
                    title="حذف المشروع"
                  >
                    <IconTrash size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Single Project Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTargetId}
        title="حذف المشروع"
        message="هل أنت متأكد من حذف هذا المشروع نهائياً من المتصفح؟"
        confirmLabel="حذف المشروع"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />

      {/* Delete All Projects Confirmation Modal with Protection Verification */}
      <ConfirmModal
        isOpen={isDeleteAllOpen}
        title="مسح كافة المشاريع"
        message="هل أنت متأكد من حذف جميع المشاريع والخطوط المحفوظة نهائياً من المتصفح؟ لا يمكن التراجع عن هذا الإجراء."
        confirmLabel="مسح كافة المشاريع"
        requireVerificationText="حذف"
        onConfirm={handleDeleteAllConfirm}
        onCancel={() => setIsDeleteAllOpen(false)}
      />
    </div>
  );
};

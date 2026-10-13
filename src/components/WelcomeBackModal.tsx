import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useScrollLock } from '../hooks/useScrollLock';
import {
  IconClose,
  IconGrid,
  IconLayers3D,
  IconFonts,
  IconUser,
  IconArrowLeft,
  IconCheck,
  IconSparkles,
} from './icons/Icons';

export const WelcomeBackModal: React.FC = () => {
  const { user, showWelcomeBack, closeWelcomeBack } = useAuth();
  const navigate = useNavigate();

  // Central background scroll lock while welcome back modal is open
  useScrollLock(showWelcomeBack && !!user);

  if (!showWelcomeBack || !user) return null;

  const handleNavigate = (path: string) => {
    closeWelcomeBack();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-3 sm:p-5 bg-slate-950/50 backdrop-blur-md animate-fadeIn dir-rtl overscroll-contain modal-backdrop-lock"
      onClick={closeWelcomeBack}
      onTouchMove={(e) => {
        // Prevent background rubber-banding if dragging outside the card
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-back-title"
    >
      {/* Compact, Luxury Frosted Glass Card Container */}
      <div
        className="relative w-full max-w-[440px] sm:max-w-[460px] max-h-[88vh] sm:max-h-[85vh] flex flex-col bg-white/95 backdrop-blur-2xl border border-white/90 rounded-3xl shadow-[0_20px_50px_-10px_rgba(15,23,42,0.25),0_0_0_1px_rgba(255,255,255,0.9)] overflow-hidden text-slate-900 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header: User Info (صورة المستخدم، الاسم، البريد/الوصف، مؤشر الحالة، زر الإغلاق) */}
        <div className="shrink-0 px-5 py-4 border-b border-slate-100/90 bg-white/80 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* 1. صورة المستخدم الشخصية بحجم متناسق وثابت */}
            <div className="relative shrink-0">
              <img
                src={user.avatarUrl}
                alt={user.username}
                className="w-11 h-11 rounded-2xl object-cover ring-2 ring-sky-500/30 shadow-xs"
              />
              {/* 4. مؤشر حالة تسجيل الدخول صغير وأنيق */}
              <span
                className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white shadow-xs"
                title="تم تسجيل الدخول بنجاح"
              />
            </div>

            {/* 2 & 3: اسم المستخدم والبريد / الوصف الوظيفي */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h2
                  id="welcome-back-title"
                  className="font-heading font-extrabold text-sm sm:text-base text-slate-900 leading-tight truncate max-w-[190px] sm:max-w-[210px]"
                >
                  أهلاً بعودتك، {user.username}!
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5 truncate max-w-[210px] sm:max-w-[230px]">
                {user.email} {user.isDeveloper ? '• مطور المحرك' : ''}
              </p>
            </div>
          </div>

          {/* 5. زر إغلاق أنيق في الزاوية المقابلة */}
          <button
            type="button"
            onClick={closeWelcomeBack}
            className="shrink-0 w-8 h-8 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق النافذة"
            aria-label="إغلاق النافذة"
          >
            <IconClose size={17} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3.5 overscroll-y-contain modal-content-scroll">
          {/* 2. بطاقة حالة الجلسة الحالية (مبسطة ومدمجة ومتقنة) */}
          <div className="p-3 rounded-xl bg-sky-50/70 border border-sky-100/90 flex items-center justify-between gap-3 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-sky-500/15 text-sky-600 flex items-center justify-center shrink-0">
                <IconSparkles size={16} />
              </div>
              <div className="min-w-0">
                <span className="text-[11px] font-bold text-sky-950 block leading-tight">
                  حالة الجلسة السحابية: متصلة وجاهزة
                </span>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">
                  مشروعاتك وإعدادات الخطوط محفوظة ومزامنة تلقائياً
                </p>
              </div>
            </div>
            <span className="shrink-0 text-[10px] font-semibold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-md border border-emerald-200/60">
              نشطة
            </span>
          </div>

          {/* 3. قسم الاختصارات السريعة (البطاقات الأربع المتناسقة تماماً) */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block">
              اختصارات الوصول السريع:
            </span>

            <div className="grid grid-cols-2 gap-2 sm:gap-2.5">
              {/* Shortcut 1: استوديو المحارف */}
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/70 hover:border-sky-300 transition-all text-right flex flex-col justify-between gap-2 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconGrid size={15} />
                  </div>
                  <IconArrowLeft size={13} className="text-slate-300 group-hover:text-sky-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">استوديو المحارف</h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">متابعة رسم وتعديل الخط</p>
                </div>
              </button>

              {/* Shortcut 2: مختبر الخطوط الملونة */}
              <button
                type="button"
                onClick={() => handleNavigate('/lab')}
                className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/70 hover:border-purple-300 transition-all text-right flex flex-col justify-between gap-2 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconLayers3D size={15} />
                  </div>
                  <IconArrowLeft size={13} className="text-slate-300 group-hover:text-purple-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">مختبر الخطوط</h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">معاينة الطبقات والعمق 3D</p>
                </div>
              </button>

              {/* Shortcut 3: مكتبة مشاريعي */}
              <button
                type="button"
                onClick={() => handleNavigate('/my-fonts')}
                className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/70 hover:border-amber-300 transition-all text-right flex flex-col justify-between gap-2 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconFonts size={15} />
                  </div>
                  <IconArrowLeft size={13} className="text-slate-300 group-hover:text-amber-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">مكتبة مشاريعي</h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">إدارة وتصدير خطوطك</p>
                </div>
              </button>

              {/* Shortcut 4: الملف الشخصي */}
              <button
                type="button"
                onClick={() => handleNavigate('/account')}
                className="p-3 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/70 hover:border-emerald-300 transition-all text-right flex flex-col justify-between gap-2 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                    <IconUser size={15} />
                  </div>
                  <IconArrowLeft size={13} className="text-slate-300 group-hover:text-emerald-600 transition-colors" />
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-slate-900">الملف الشخصي</h4>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">تعديل البيانات والإعدادات</p>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* 4. Footer: زر الانتقال الرئيسي المدمج والأنيق */}
        <div className="shrink-0 px-5 py-3 border-t border-slate-100 bg-slate-50/70 flex items-center justify-between gap-3">
          <span className="text-[11px] text-slate-500 font-medium hidden sm:inline">
            جاهز لبدء العمل في الاستوديو
          </span>

          <button
            type="button"
            onClick={closeWelcomeBack}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-600 text-white text-xs font-heading font-bold shadow-md shadow-sky-600/20 hover:shadow-sky-600/30 transition-all active:scale-[0.98] flex items-center justify-center gap-1.5 cursor-pointer ml-auto"
          >
            <span>الانتقال لبيئة العمل</span>
            <IconCheck size={15} />
          </button>
        </div>
      </div>
    </div>
  );
};

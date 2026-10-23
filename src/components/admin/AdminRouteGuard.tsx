import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { IconShield, IconArrowRight, IconLock } from '../icons/Icons';

interface AdminRouteGuardProps {
  children: React.ReactNode;
}

export const AdminRouteGuard: React.FC<AdminRouteGuardProps> = ({ children }) => {
  const { user, isLoggedIn, isAdmin, openAuthModal } = useAuth();

  // If not logged in, prompt login or redirect
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 dir-rtl">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl liquid-glass-card border border-white/80 shadow-2xl text-center space-y-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/15 text-amber-600 border border-amber-400/30 flex items-center justify-center mx-auto shadow-sm">
            <IconLock size={26} />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">
              تسجيل الدخول الإداري مطلوب
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              هذا القسم مخصص لإدارة المنظومة والتحكم بالبيانات. يرجى تسجيل الدخول بحساب المشرف المصرح له.
            </p>
          </div>
          <div className="pt-2 flex flex-col sm:flex-row items-center gap-2.5 justify-center">
            <button
              type="button"
              onClick={() => openAuthModal('login')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-sky-600/20 hover:opacity-95 transition-all cursor-pointer"
            >
              تسجيل الدخول الآن
            </button>
            <Link
              to="/"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 text-xs font-bold transition-all text-center flex items-center justify-center gap-1.5"
            >
              <span>العودة للرئيسية</span>
              <IconArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // If logged in but does not have admin privileges
  if (!isAdmin) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-4 dir-rtl">
        <div className="max-w-md w-full p-6 sm:p-8 rounded-3xl liquid-glass-card border border-rose-200/80 shadow-2xl text-center space-y-4 animate-fadeIn">
          <div className="w-14 h-14 rounded-2xl bg-rose-500/15 text-rose-600 border border-rose-400/30 flex items-center justify-center mx-auto shadow-sm">
            <IconShield size={26} />
          </div>
          <div className="space-y-1">
            <h2 className="font-heading font-extrabold text-lg text-slate-900">
              غير مصرح بالدخول (Access Denied)
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              عذراً، هذا الحساب (<strong className="text-slate-800">{user.email}</strong>) لا يمتلك صلاحيات المشرفين للوصول إلى لوحة الإدارة.
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold shadow-md hover:bg-slate-800 transition-all"
            >
              <span>الرجوع إلى استوديو الخطوط</span>
              <IconArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

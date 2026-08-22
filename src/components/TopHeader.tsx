import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { IconSparkles, IconUser, IconLogout, IconLogIn, IconShield } from './icons/Icons';
import { useAuth } from '../context/AuthContext';

export const TopHeader: React.FC = React.memo(() => {
  const { user, isLoggedIn, isAdmin, logout, openAuthModal } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-3 z-40 px-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-4xl mx-auto liquid-glass-header rounded-full px-5 py-2.5 flex items-center justify-between shadow-xl shadow-sky-950/5 pointer-events-auto ring-1 ring-white/80">
        {/* Right side branding */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-600 text-white flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-md shadow-sky-500/30 border border-white/40">
            <IconSparkles size={18} />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-heading font-extrabold text-base md:text-lg text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors">
              دكتور الخطوط
            </span>
            <span className="px-2.5 py-0.5 rounded-full liquid-glass-badge text-sky-700 text-[10px] font-bold">
              منصة الخطوط العربية
            </span>
          </div>
        </Link>

        {/* User Auth Profile Status */}
        <div className="relative">
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2.5 px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-all"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover border border-sky-500"
                />
                <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                  {user.username}
                </span>
                {isAdmin && (
                  <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-600 text-[10px] font-bold rounded-md border border-amber-500/30">
                    مطور
                  </span>
                )}
              </button>

              {/* Profile Dropdown */}
              {showMenu && (
                <div
                  className="absolute left-0 mt-2 w-52 bg-white border border-slate-200 rounded-2xl shadow-xl py-2 z-50 text-xs animate-fadeIn"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 space-y-0.5">
                    <p className="font-bold text-slate-900 truncate flex items-center justify-between">
                      <span>{user.username}</span>
                      {isAdmin && <span className="text-[10px] text-amber-500 font-bold">الإدارة</span>}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate">{user.email}</p>
                  </div>

                  {isAdmin && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        navigate('/admin');
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-amber-50 text-amber-700 font-bold flex items-center gap-2 transition-colors border-b border-slate-100"
                    >
                      <IconShield size={14} className="text-amber-500" />
                      <span>لوحة تحكم الإدارة والمطور</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      setShowMenu(false);
                      navigate('/account');
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors"
                  >
                    <IconUser size={14} className="text-sky-500" />
                    <span>الملف الشخصي والحساب</span>
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      logout();
                    }}
                    className="w-full text-right px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2 transition-colors"
                  >
                    <IconLogout size={14} />
                    <span>تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
              >
                <IconLogIn size={14} className="text-sky-500" />
                <span>دخول</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-3.5 py-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:scale-105 active:scale-95"
              >
                حساب جديد
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});



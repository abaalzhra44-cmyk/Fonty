import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  IconSparkles,
  IconUser,
  IconLogout,
  IconLogIn,
  IconFonts,
} from './icons/Icons';
import { useAuth } from '../context/AuthContext';

export const TopHeader: React.FC = React.memo(() => {
  const { user, isLoggedIn, logout, openAuthModal } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-3 z-40 px-3 sm:px-4 transition-all duration-300 pointer-events-none">
      <div className="max-w-5xl mx-auto liquid-glass-header rounded-full px-4 sm:px-5 py-2 flex items-center justify-between shadow-xl shadow-sky-950/5 pointer-events-auto ring-1 ring-white/80">
        {/* Right side: Modern Typography Branding */}
        <Link to="/" className="flex items-center gap-2.5 sm:gap-3 group">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-tr from-sky-500 via-sky-600 to-indigo-600 text-white flex items-center justify-center group-hover:scale-105 group-hover:rotate-3 transition-all duration-300 shadow-md shadow-sky-500/25 border border-white/60">
            <IconSparkles size={19} />
          </div>
          <div className="flex flex-col text-right">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-heading font-black text-base sm:text-lg md:text-xl text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors">
                فونتي
              </span>
              <span className="px-1.5 py-0.5 rounded-md bg-sky-50 text-sky-700 text-[10px] font-extrabold border border-sky-200/70 font-mono tracking-wider">
                FONTY
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium hidden sm:inline-block leading-tight">
              استوديو تطوير الخطوط العربية
            </span>
          </div>
        </Link>

        {/* Center: Desktop Navigation Quick Links (when logged in) */}
        {isLoggedIn && (
          <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-full border border-slate-200/70 text-xs font-bold">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `px-3.5 py-1 rounded-full transition-all ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              الاستوديو
            </NavLink>
            <NavLink
              to="/my-fonts"
              className={({ isActive }) =>
                `px-3.5 py-1 rounded-full transition-all ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              خطوطي
            </NavLink>
            <NavLink
              to="/gallery"
              className={({ isActive }) =>
                `px-3.5 py-1 rounded-full transition-all ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              السحابة
            </NavLink>
            <NavLink
              to="/lab"
              className={({ isActive }) =>
                `px-3.5 py-1 rounded-full transition-all ${
                  isActive
                    ? 'bg-white text-sky-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`
              }
            >
              المختبر
            </NavLink>
          </nav>
        )}

        {/* Left side: User Auth Status & Action Menu */}
        <div className="relative">
          {isLoggedIn && user ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-white/80 hover:bg-white border border-slate-200/80 hover:border-slate-300 shadow-xs transition-all cursor-pointer group"
                aria-label="قائمة الحساب"
              >
                <img
                  src={user.avatarUrl}
                  alt={user.username}
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-sky-500/30"
                />
                <div className="flex flex-col text-right hidden sm:flex leading-tight">
                  <span className="text-xs font-bold text-slate-800 max-w-[100px] truncate">
                    {user.username}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    مصمم خطوط
                  </span>
                </div>
                <svg
                  className={`w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-transform duration-200 ${
                    showMenu ? 'rotate-180' : ''
                  }`}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>

              {/* Profile Dropdown Menu */}
              {showMenu && (
                <div
                  className="absolute left-0 mt-2.5 w-60 bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-fadeIn ring-1 ring-black/5"
                  onMouseLeave={() => setShowMenu(false)}
                >
                  {/* User Account Summary Header */}
                  <div className="px-4 py-2.5 border-b border-slate-100 flex items-center gap-3">
                    <img
                      src={user.avatarUrl}
                      alt={user.username}
                      className="w-9 h-9 rounded-full object-cover border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="font-bold text-slate-900 truncate text-xs">{user.username}</p>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-sky-100 text-sky-800">
                          عضو المنصة
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{user.email}</p>
                    </div>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        navigate('/my-fonts');
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-sky-50 flex items-center justify-center text-sky-600">
                        <IconFonts size={14} />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-xs font-semibold">مشاريعي وخطوطي</p>
                        <p className="text-[10px] text-slate-400">استعراض وتعديل خطوطك المحفوظة</p>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setShowMenu(false);
                        navigate('/account');
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-slate-50 text-slate-700 flex items-center gap-2.5 transition-colors cursor-pointer"
                    >
                      <div className="w-6 h-6 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
                        <IconUser size={14} />
                      </div>
                      <div className="flex-1 text-right">
                        <p className="text-xs font-semibold">الملف الشخصي والحساب</p>
                        <p className="text-[10px] text-slate-400">بيانات الحساب وتفضيلات النظام</p>
                      </div>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        logout();
                      }}
                      className="w-full text-right px-4 py-2 hover:bg-rose-50 text-rose-600 flex items-center gap-2.5 transition-colors cursor-pointer font-semibold"
                    >
                      <div className="w-6 h-6 rounded-lg bg-rose-50 flex items-center justify-center text-rose-600">
                        <IconLogout size={14} />
                      </div>
                      <span>تسجيل الخروج</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openAuthModal('login')}
                className="px-3.5 py-1.5 rounded-full text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-sky-50/80 border border-transparent hover:border-sky-200/60 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <IconLogIn size={15} className="text-sky-600" />
                <span>تسجيل الدخول</span>
              </button>
              <button
                onClick={() => openAuthModal('signup')}
                className="px-4 py-1.5 rounded-full bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-sky-500/20 transition-all hover:shadow-sky-500/30 active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <IconSparkles size={13} className="text-amber-300" />
                <span>إنشاء حساب</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
});

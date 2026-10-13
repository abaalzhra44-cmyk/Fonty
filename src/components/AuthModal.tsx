import React, { useState, useRef, useEffect } from 'react';
import { useAuth, AVATAR_PRESETS } from '../context/AuthContext';
import { useScrollLock } from '../hooks/useScrollLock';
import {
  IconClose,
  IconUser,
  IconMail,
  IconLock,
  IconCamera,
  IconCheck,
  IconSparkles,
  IconLogIn,
  IconEye,
  IconEyeOff,
} from './icons/Icons';

export const AuthModal: React.FC = React.memo(() => {
  const { showAuthModal, closeAuthModal, authModalMode, login, signup, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(authModalMode);

  // Central background scroll lock while modal is open
  useScrollLock(showAuthModal);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync tab with context trigger
  useEffect(() => {
    setActiveTab(authModalMode);
    setErrorMsg(null);
    setShowPassword(false);
  }, [authModalMode, showAuthModal]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!showAuthModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeAuthModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showAuthModal, closeAuthModal]);

  if (!showAuthModal) return null;

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('حجم الصورة كبير جداً! يرجى اختيار صورة أقل من 5 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
          setErrorMsg(null);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleSignIn = async () => {
    setErrorMsg(null);
    setIsGoogleLoading(true);
    try {
      const res = await loginWithGoogle();
      if (!res.success && res.error) {
        setErrorMsg(res.error);
      }
    } catch {
      setErrorMsg('تعذر تسجيل الدخول عبر Google. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);

    setTimeout(() => {
      if (activeTab === 'signup') {
        const res = signup({
          username,
          email,
          password,
          avatarUrl: selectedAvatar,
        });
        if (!res.success && res.error) {
          setErrorMsg(res.error);
        }
      } else {
        const res = login({
          identifier: email || username,
          password,
        });
        if (!res.success && res.error) {
          setErrorMsg(res.error);
        }
      }
      setIsSubmitting(false);
    }, 300);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-md animate-fadeIn overscroll-contain modal-backdrop-lock"
      onClick={closeAuthModal}
      onTouchMove={(e) => {
        // Prevent background rubber-banding if dragging outside the card
        if (e.target === e.currentTarget) {
          e.preventDefault();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      {/* Main Auth Card Container */}
      <div
        className="relative w-full max-w-[460px] max-h-[92vh] sm:max-h-[90vh] flex flex-col bg-white/95 backdrop-blur-2xl rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.35),0_0_0_1px_rgba(255,255,255,0.9)] border border-white/80 overflow-hidden text-slate-900 transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header (اسم التطبيق، الأيقونة، العنوان الفرعي، وزر الإغلاق) */}
        <div className="shrink-0 px-6 py-4.5 border-b border-slate-100/90 bg-white/70 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-500 to-blue-600 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
              <IconSparkles size={20} className="text-white" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2
                  id="auth-modal-title"
                  className="font-heading font-extrabold text-base sm:text-lg text-slate-900 leading-tight"
                >
                  فونتي
                </h2>
                <span className="text-[10px] font-mono font-semibold tracking-wider px-1.5 py-0.5 rounded-md bg-sky-100/80 text-sky-700 border border-sky-200/60">
                  FONTY
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate mt-0.5">
                {activeTab === 'signup'
                  ? 'أنشئ حسابك المجاني واستمتع بكافة أدوات الاستوديو'
                  : 'سجّل دخولك للوصول إلى مشاريعك وخطوطك السحابية'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={closeAuthModal}
            className="shrink-0 w-9 h-9 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
            title="إغلاق النافذة (Esc)"
            aria-label="إغلاق النافذة"
          >
            <IconClose size={18} />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4.5 overscroll-y-contain modal-content-scroll">
          {/* Error Message Box */}
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200/80 text-rose-700 text-xs font-medium leading-relaxed flex items-start gap-2.5 animate-fadeIn">
              <span className="shrink-0 text-base leading-none">⚠️</span>
              <p className="flex-1">{errorMsg}</p>
            </div>
          )}

          {/* 2. Google Sign-In with Firebase Auth */}
          <div>
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isGoogleLoading || isSubmitting}
              className="w-full h-11 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-heading font-semibold text-xs sm:text-sm border border-slate-200/90 shadow-xs flex items-center justify-center gap-3 transition-all active:scale-[0.99] disabled:opacity-60 cursor-pointer hover:border-slate-300"
            >
              {isGoogleLoading ? (
                <span className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
              )}
              <span>الدخول السريع باستخدام Google (Firebase)</span>
            </button>
          </div>

          {/* 3. Visual Separator (فاصل بصري أنيق مع عبارة توضح إمكانية التسجيل بالبريد) */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 h-px bg-slate-200/90" />
            <span className="text-[11px] text-slate-500 font-medium shrink-0">
              أو المتابعة بالبريد الإلكتروني
            </span>
            <div className="flex-1 h-px bg-slate-200/90" />
          </div>

          {/* 4. Tab Switcher (مفتاح واضح للتبديل بين تسجيل الدخول وإنشاء حساب جديد) */}
          <div className="p-1 bg-slate-100/90 rounded-2xl flex gap-1 border border-slate-200/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                activeTab === 'signup'
                  ? 'bg-white text-sky-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              إنشاء حساب جديد
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setErrorMsg(null);
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-sky-600 shadow-xs border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              تسجيل الدخول
            </button>
          </div>

          {/* Form Fields Container */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* 5. Profile Picture Picker (في وضع إنشاء حساب فقط) */}
            {activeTab === 'signup' && (
              <div className="space-y-2.5 p-3.5 rounded-2xl bg-slate-50/80 border border-slate-200/60">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    الصورة الشخصية
                  </label>
                  <span className="text-[10px] text-slate-400">
                    صورة خاصة أو شخصية رمزية
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  {/* Current Selected Avatar Preview & Upload Trigger */}
                  <div className="relative shrink-0">
                    <img
                      src={selectedAvatar}
                      alt="الصورة الشخصية"
                      className="w-13 h-13 rounded-2xl object-cover ring-2 ring-sky-500/40 shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1 -left-1 w-6 h-6 rounded-full bg-sky-600 hover:bg-sky-500 text-white shadow-md flex items-center justify-center transition-transform active:scale-95 cursor-pointer"
                      title="رفع صورة من جهازك"
                    >
                      <IconCamera size={13} />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarFileUpload}
                      className="hidden"
                    />
                  </div>

                  {/* Preset Avatar Selection Grid */}
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] text-slate-500 mb-1.5 font-medium">
                      اختر من الرموز الجاهزة:
                    </p>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {AVATAR_PRESETS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedAvatar(preset)}
                          className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer relative ${
                            selectedAvatar === preset
                              ? 'border-sky-600 scale-105 ring-2 ring-sky-300'
                              : 'border-white/80 opacity-70 hover:opacity-100 hover:scale-105'
                          }`}
                        >
                          <img
                            src={preset}
                            alt="رمز جاهز"
                            className="w-full h-full object-cover"
                          />
                          {selectedAvatar === preset && (
                            <div className="absolute inset-0 bg-sky-600/30 flex items-center justify-center text-white">
                              <IconCheck size={11} />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Username Field (في وضع إنشاء حساب فقط) */}
            {activeTab === 'signup' && (
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  اسم المستخدم (اليوزر)
                </label>
                <div className="relative">
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                    <IconUser size={18} />
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="مثال: مصمم الخطوط"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full h-11 pr-11 pl-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 shadow-xs transition-all"
                  />
                </div>
              </div>
            )}

            {/* 7. Email / Identifier Field */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-700">
                {activeTab === 'signup' ? 'البريد الإلكتروني' : 'البريد الإلكتروني أو اسم المستخدم'}
              </label>
              <div className="relative">
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <IconMail size={18} />
                </div>
                <input
                  type={activeTab === 'signup' ? 'email' : 'text'}
                  required
                  placeholder={
                    activeTab === 'signup'
                      ? 'name@example.com'
                      : 'ادخل بريدك الإلكتروني أو اسم المستخدم'
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-11 pr-11 pl-4 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 shadow-xs transition-all"
                />
              </div>
            </div>

            {/* 8. Password Field مع زر إظهار وإخفاء كلمة المرور */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700">
                  كلمة المرور
                </label>
                {activeTab === 'login' && (
                  <span className="text-[11px] text-sky-600 font-medium">
                    مطلوبة للمصادقة
                  </span>
                )}
              </div>
              <div className="relative">
                {/* Right Icon (Lock) */}
                <div className="absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <IconLock size={18} />
                </div>

                {/* Password Input */}
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-11 pr-11 pl-11 rounded-xl bg-white border border-slate-200 text-slate-900 text-sm placeholder:text-slate-400 focus:outline-none focus:border-sky-500 focus:ring-3 focus:ring-sky-500/15 shadow-xs transition-all"
                />

                {/* Left Toggle Button (Show/Hide Password) */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center transition-colors cursor-pointer"
                  title={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                  aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                >
                  {showPassword ? <IconEyeOff size={16} /> : <IconEye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button (زر رئيسي واضح لتنفيذ العملية) */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 mt-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-600 text-white font-heading font-bold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2.5 transition-all active:scale-[0.99] disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <IconLogIn size={18} />
                  <span>
                    {activeTab === 'signup'
                      ? 'إنشاء الحساب والبدء'
                      : 'تسجيل الدخول إلى حسابي'}
                  </span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
});

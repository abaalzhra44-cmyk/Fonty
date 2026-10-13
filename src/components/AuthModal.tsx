import React, { useState, useRef } from 'react';
import { useAuth, AVATAR_PRESETS } from '../context/AuthContext';
import {
  IconClose,
  IconUser,
  IconMail,
  IconLock,
  IconCamera,
  IconCheck,
  IconSparkles,
  IconLogIn,
} from './icons/Icons';

export const AuthModal: React.FC = React.memo(() => {
  const { showAuthModal, closeAuthModal, authModalMode, login, signup, loginWithGoogle } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(authModalMode);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Sync tab with context trigger
  React.useEffect(() => {
    setActiveTab(authModalMode);
    setErrorMsg(null);
  }, [authModalMode, showAuthModal]);

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
      setErrorMsg('تعذر تسجيل الدخول عبر Google');
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
      <div
        className="relative w-full max-w-md liquid-glass-card shadow-2xl overflow-hidden text-slate-900 transition-all border border-white/80"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header & Close button */}
        <div className="p-6 pb-4 border-b border-white/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-400/25 text-sky-600 flex items-center justify-center">
              <IconSparkles size={20} />
            </div>
            <div>
              <h2 className="font-heading font-extrabold text-base text-slate-900">
                Fonty فونتي
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'signup' ? 'إنشاء حساب جديد للاستوديو' : 'تسجيل الدخول للتحكم بالمشاريع'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors cursor-pointer"
            title="إغلاق"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Google Sign-In with Firebase Auth */}
        <div className="px-6 pt-4">
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isGoogleLoading || isSubmitting}
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-heading font-semibold text-xs border border-slate-200/90 shadow-sm flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {isGoogleLoading ? (
              <span className="w-4 h-4 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24">
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
            <span>الدخول السريع عبر Google (Firebase)</span>
          </button>

          <div className="flex items-center my-3.5 gap-2">
            <div className="flex-1 h-px bg-slate-200" />
            <span className="text-[11px] text-slate-400 font-medium">أو بالبريد وكلمة المرور</span>
            <div className="flex-1 h-px bg-slate-200" />
          </div>
        </div>

        {/* Tab Toggle Switch */}
        <div className="p-1 mx-6 bg-white/40 backdrop-blur-md rounded-2xl flex gap-1 border border-white/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'signup'
                ? 'bg-white/90 text-sky-600 shadow-xs border border-white/90'
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
            className={`flex-1 py-1.5 rounded-xl text-xs font-heading font-bold transition-all cursor-pointer ${
              activeTab === 'login'
                ? 'bg-white/90 text-sky-600 shadow-xs border border-white/90'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تسجيل الدخول
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 pt-3 space-y-4">
          {errorMsg && (
            <div className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-400/30 text-rose-700 text-xs font-medium leading-relaxed animate-shake">
              {errorMsg}
            </div>
          )}

          {/* Profile Picture picker (Signup mode) */}
          {activeTab === 'signup' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                الصورة الشخصية للحساب
              </label>
              <div className="flex items-center gap-4">
                <div className="relative group">
                  <img
                    src={selectedAvatar}
                    alt="Selected Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-sky-500 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-500 transition-colors cursor-pointer"
                    title="رفع صورة خاصة"
                  >
                    <IconCamera size={14} />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarFileUpload}
                    className="hidden"
                  />
                </div>

                <div className="flex-1">
                  <span className="text-[11px] text-slate-500 block mb-1">
                    أو اختر شخصية رمزية جاهزة:
                  </span>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(preset)}
                        className={`w-7 h-7 rounded-full overflow-hidden border-2 transition-transform active:scale-90 relative cursor-pointer ${
                          selectedAvatar === preset
                            ? 'border-sky-600 scale-105 ring-2 ring-sky-300'
                            : 'border-white/80 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={preset}
                          alt="Preset avatar"
                          className="w-full h-full object-cover"
                        />
                        {selectedAvatar === preset && (
                          <div className="absolute inset-0 bg-sky-500/20 flex items-center justify-center text-sky-600">
                            <IconCheck size={12} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Username Field */}
          {activeTab === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                اسم المستخدم (اليوزر)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                  <IconUser size={18} />
                </div>
                <input
                  type="text"
                  required
                  placeholder="مثال: مصمم الخطوط"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl liquid-glass-input text-sm text-slate-900 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          {/* Email / Identifier Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              {activeTab === 'signup' ? 'البريد الإلكتروني' : 'اسم المستخدم أو البريد الإلكتروني'}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <IconMail size={18} />
              </div>
              <input
                type={activeTab === 'signup' ? 'email' : 'text'}
                required
                placeholder={
                  activeTab === 'signup' ? 'name@example.com' : 'ادخل اليوزر أو البريد الإلكتروني'
                }
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl liquid-glass-input text-sm text-slate-900 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1.5">
              كلمة المرور
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400">
                <IconLock size={18} />
              </div>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl liquid-glass-input text-sm text-slate-900 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-600 text-white font-heading font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 border border-white/30 cursor-pointer"
          >
            {isSubmitting ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <IconLogIn size={18} />
                <span>{activeTab === 'signup' ? 'إنشاء الحساب والبدء' : 'تسجيل الدخول'}</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
});

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
  const { showAuthModal, closeAuthModal, authModalMode, login, signup } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(authModalMode);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(AVATAR_PRESETS[0]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
              <h2 className="font-heading font-bold text-lg text-slate-900">
                دكتور الخطوط
              </h2>
              <p className="text-xs text-slate-500">
                {activeTab === 'signup' ? 'إنشاء حساب جديد للاستوديو' : 'تسجيل الدخول للتحكم بالمشاريع'}
              </p>
            </div>
          </div>
          <button
            onClick={closeAuthModal}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-white/60 transition-colors"
            title="إغلاق"
          >
            <IconClose size={20} />
          </button>
        </div>

        {/* Tab Toggle Switch */}
        <div className="p-1.5 mx-6 mt-4 bg-white/40 backdrop-blur-md rounded-2xl flex gap-1 border border-white/60">
          <button
            type="button"
            onClick={() => {
              setActiveTab('signup');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
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
            className={`flex-1 py-2 rounded-xl text-xs font-heading font-bold transition-all ${
              activeTab === 'login'
                ? 'bg-white/90 text-sky-600 shadow-xs border border-white/90'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            تسجيل الدخول
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-sky-600 text-white shadow-lg hover:bg-sky-500 transition-colors"
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

                <div className="flex-1 space-y-1">
                  <span className="text-[11px] text-slate-500">
                    اختر رمزاً تعبيرياً أو ارفع صورة شخصية:
                  </span>
                  <div className="flex items-center gap-1.5 overflow-x-auto py-1 no-scrollbar">
                    {AVATAR_PRESETS.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setSelectedAvatar(preset)}
                        className={`relative w-8 h-8 rounded-full overflow-hidden border-2 transition-transform ${
                          selectedAvatar === preset
                            ? 'border-sky-500 scale-110 ring-2 ring-sky-500/30'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
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
            className="w-full py-3 mt-2 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-600 text-white font-heading font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50 border border-white/30"
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

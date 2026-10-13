import React, { useState, useRef } from 'react';
import { useAuth, AVATAR_PRESETS } from '../context/AuthContext';
import {
  IconUser,
  IconSparkles,
  IconCheck,
  IconCamera,
  IconLogout,
  IconEdit,
  IconLogIn,
} from '../components/icons/Icons';

export const AccountPage: React.FC = () => {
  const { user, isLoggedIn, logout, updateProfile, openAuthModal } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.username || '');
  const [password, setPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatarUrl || AVATAR_PRESETS[0]);
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    if (user) {
      setUsername(user.username);
      setSelectedAvatar(user.avatarUrl);
    }
  }, [user]);

  if (!isLoggedIn || !user) {
    return (
      <div className="pb-28 pt-12 px-4 max-w-lg mx-auto text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-sky-500/10 text-sky-600 mx-auto flex items-center justify-center">
          <IconUser size={32} />
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate-900">
          لم يتم تسجيل الدخول
        </h1>
        <p className="text-xs text-slate-500">
          يرجى تسجيل الدخول أو إنشاء حساب جديد للوصول إلى تفاصيل ملفك الشخصي ومشاريعك.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-3 rounded-2xl bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-500/20 inline-flex items-center gap-2"
        >
          <IconLogIn size={18} />
          <span>تسجيل الدخول / حساب جديد</span>
        </button>
      </div>
    );
  }

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMsg({ type: 'error', text: 'حجم الصورة كبير جداً! اختر صورة أصغر من 5 ميجابايت.' });
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setSelectedAvatar(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);

    const res = updateProfile({
      username: username !== user.username ? username : undefined,
      avatarUrl: selectedAvatar !== user.avatarUrl ? selectedAvatar : undefined,
      password: password ? password : undefined,
    });

    if (res.success) {
      setMsg({ type: 'success', text: 'تم تحديث بيانات حسابك بنجاح!' });
      setIsEditing(false);
      setPassword('');
    } else if (res.error) {
      setMsg({ type: 'error', text: res.error });
    }
  };

  return (
    <div className="pb-28 pt-6 px-4 max-w-2xl mx-auto space-y-8 animate-fadeIn">
      {/* Title */}
      <div className="text-center space-y-2">
        <div className="relative inline-block">
          <img
            src={user.avatarUrl}
            alt={user.username}
            className="w-20 h-20 rounded-full object-cover border-4 border-sky-500/30 shadow-xl"
          />
          <span className="absolute bottom-1 right-1 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
        </div>
        <h1 className="font-heading font-bold text-2xl text-slate-900">
          {user.username}
        </h1>
        <p className="font-body text-xs text-slate-500">
          {user.email} • عضو منذ {new Date(user.createdAt).toLocaleDateString('ar-EG')}
        </p>
      </div>

      {msg && (
        <div
          className={`p-4 rounded-2xl text-xs font-bold ${
            msg.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-600'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-600'
          }`}
        >
          {msg.text}
        </div>
      )}

      {/* Main Profile Box */}
      <div className="liquid-glass-card p-6 md:p-8 space-y-6 shadow-2xl transition-all border border-white/80">
        <div className="flex items-center justify-between border-b border-white/60 pb-4">
          <h2 className="font-heading font-bold text-lg text-slate-900">
            بيانات الحساب الشخصي
          </h2>
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-1.5 rounded-xl liquid-glass-button text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors border border-white/80"
            >
              <IconEdit size={14} className="text-sky-600" />
              <span>تعديل البيانات</span>
            </button>
          ) : (
            <button
              onClick={() => {
                setIsEditing(false);
                setUsername(user.username);
                setSelectedAvatar(user.avatarUrl);
                setPassword('');
              }}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              إلغاء التعديل
            </button>
          )}
        </div>

        {!isEditing ? (
          <div className="space-y-4 text-sm font-body">
            <div>
              <span className="block text-xs text-slate-500 mb-1 font-medium">اسم المستخدم:</span>
              <p className="font-bold text-slate-900 font-heading">{user.username}</p>
            </div>

            <div>
              <span className="block text-xs text-slate-500 mb-1 font-medium">البريد الإلكتروني:</span>
              <p className="font-bold text-slate-900 font-mono text-xs">{user.email}</p>
            </div>

            <div>
              <span className="block text-xs text-slate-500 mb-1 font-medium">حالة التخزين والخصوصية:</span>
              <div className="p-3.5 rounded-2xl bg-white/40 backdrop-blur-md border border-white/70 text-xs text-slate-600 space-y-2">
                <div className="flex items-center gap-2 text-slate-800">
                  <IconCheck size={16} className="text-sky-600" />
                  <span>جميع مشاريعك وخطوطك مرتبطة بحسابك المحلي بأمان عالي.</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSaveProfile} className="space-y-4 font-body">
            {/* Avatar Picker */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                الصورة الشخصية
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <img
                    src={selectedAvatar}
                    alt="Selected Avatar"
                    className="w-16 h-16 rounded-full object-cover border-2 border-sky-500 shadow-md"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="absolute -bottom-1 -right-1 p-1.5 rounded-full bg-sky-600 text-white hover:bg-sky-500 transition-colors shadow-sm"
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
                            ? 'border-sky-500 scale-110'
                            : 'border-transparent opacity-70 hover:opacity-100'
                        }`}
                      >
                        <img src={preset} alt={`Avatar ${idx}`} className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Username input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                اسم المستخدم (اليوزر)
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-sm text-slate-900 border border-white/80 focus:outline-none"
              />
            </div>

            {/* Password input */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                كلمة المرور الجديدة (أتركها فارغة إذا لم ترد التغيير)
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl liquid-glass-input text-sm text-slate-900 border border-white/80 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 hover:from-sky-500 hover:to-blue-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 border border-white/30 transition-all hover:scale-[1.01]"
            >
              حفظ التغييرات
            </button>
          </form>
        )}

        {/* Logout button */}
        <div className="pt-4 border-t border-white/60">
          <button
            onClick={logout}
            className="w-full py-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 font-bold text-xs flex items-center justify-center gap-2 transition-colors border border-rose-500/20"
          >
            <IconLogout size={16} />
            <span>تسجيل الخروج من الحساب</span>
          </button>
        </div>
      </div>

      {/* App Version Info Card */}
      <div className="liquid-glass-card p-6 flex items-center justify-between text-xs text-slate-500 shadow-sm border border-white/80">
        <div className="flex items-center gap-2">
          <IconSparkles size={18} className="text-sky-600" />
          <span className="font-heading font-bold text-slate-900">Fonty فونتي v1.0.0</span>
        </div>
        <span>جميع الحقوق محفوظة © طارق محمد</span>
      </div>
    </div>
  );
};

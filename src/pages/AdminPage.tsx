import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useAuth, UserAccount } from '../context/AuthContext';
import { AdminLiveSupportConsole } from '../components/AdminLiveSupportConsole';
import { AdminFontManager } from '../components/AdminFontManager';
import { getSupportThreads, SUPPORT_UPDATE_EVENT } from '../utils/supportStorage';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  IconShield,
  IconCrown,
  IconUsers,
  IconBarChart,
  IconDatabase,
  IconSettings,
  IconActivity,
  IconLock,
  IconSearch,
  IconPlus,
  IconTrash,
  IconEdit,
  IconBan,
  IconCheckCircle,
  IconFonts,
  IconSparkles,
  IconInfo,
  IconRefresh,
  IconKey,
  IconDownload,
  IconHeadphones,
  IconClose,
  IconDevice,
  IconGlobe,
} from '../components/icons/Icons';

export const AdminPage: React.FC = () => {
  const {
    user,
    isAdmin,
    isDeveloper,
    getAllUsers,
    adminUpdateUser,
    adminDeleteUser,
    adminCreateUser,
    openAuthModal,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'fonts' | 'settings' | 'logs' | 'support'>('support');
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [pendingSupportCount, setPendingSupportCount] = useState(0);

  // Sync pending support inquiries count
  useEffect(() => {
    const updateCount = () => {
      const threads = getSupportThreads();
      const pending = threads.filter((t) => t.status === 'pending').length;
      setPendingSupportCount(pending);
    };
    updateCount();

    window.addEventListener(SUPPORT_UPDATE_EVENT, updateCount);
    window.addEventListener('storage', updateCount);

    return () => {
      window.removeEventListener(SUPPORT_UPDATE_EVENT, updateCount);
      window.removeEventListener('storage', updateCount);
    };
  }, []);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'developer'>('all');

  // Modal states
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'user' | 'admin' | 'developer'>('user');
  const [userModalError, setUserModalError] = useState('');

  // Password reset modal state
  const [resetModalUser, setResetModalUser] = useState<UserAccount | null>(null);
  const [resetPasswordInput, setResetPasswordInput] = useState('');

  // System Settings state stored in localStorage
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    return localStorage.getItem('df_maintenance_mode') === 'true';
  });
  const [allowSignups, setAllowSignups] = useState<boolean>(() => {
    return localStorage.getItem('df_allow_signups') !== 'false';
  });
  const [announcementMsg, setAnnouncementMsg] = useState<string>(() => {
    return localStorage.getItem('df_announcement_msg') || 'أهلاً بكم في منصة دكتور الخطوط - النسخة المتقدمة لبناء الخطوط العربية!';
  });
  const [announcementActive, setAnnouncementActive] = useState<boolean>(() => {
    return localStorage.getItem('df_announcement_active') === 'true';
  });

  // System Activity Logs state
  const [logs, setLogs] = useState<Array<{ id: string; time: string; type: string; msg: string; level: 'info' | 'warn' | 'success' }>>([
    {
      id: 'log_1',
      time: new Date().toLocaleTimeString('ar-EG'),
      type: 'دخول المطور',
      msg: 'تم تسجيل دخول المطور المسؤول Dr Font إلى لوحة التحكم',
      level: 'success',
    },
    {
      id: 'log_2',
      time: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString('ar-EG'),
      type: 'محرك GSUB',
      msg: 'تمت معالجة قواعد الاستبدال لـ 14 خط عربي متقدم',
      level: 'info',
    },
    {
      id: 'log_3',
      time: new Date(Date.now() - 1000 * 60 * 15).toLocaleTimeString('ar-EG'),
      type: 'فحص الأمان',
      msg: 'فحص دوري لقاعدة البيانات وتراخيص الخطوط - الحالة سليم 100%',
      level: 'info',
    },
  ]);

  const reloadUsers = () => {
    setUsersList(getAllUsers());
  };

  useEffect(() => {
    reloadUsers();
  }, []);

  // Save system settings handler
  const handleSaveSettings = () => {
    localStorage.setItem('df_maintenance_mode', String(maintenanceMode));
    localStorage.setItem('df_allow_signups', String(allowSignups));
    localStorage.setItem('df_announcement_msg', announcementMsg);
    localStorage.setItem('df_announcement_active', String(announcementActive));

    // Log the change
    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('ar-EG'),
        type: 'تحديث الإعدادات',
        msg: `قام المطور بتحديث الإعدادات (وضع الصيانة: ${maintenanceMode ? 'مفعل' : 'معطل'})`,
        level: 'warn',
      },
      ...prev,
    ]);

    alert('تم حفظ إعدادات النظام وتحديث التفضيلات بنجاح!');
  };

  // Toggle Maintenance Mode handler
  const handleToggleMaintenance = (mode: boolean) => {
    setMaintenanceMode(mode);
    localStorage.setItem('df_maintenance_mode', String(mode));
    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('ar-EG'),
        type: 'وضع الصيانة',
        msg: mode
          ? 'تم تفعيل وضع الصيانة العام على جميع الزوار غير الإداريين'
          : 'تم إيقاف وضع الصيانة وإتاحة الموقع للعملاء',
        level: mode ? 'warn' : 'success',
      },
      ...prev,
    ]);
  };

  // Add new user submit handler
  const handleCreateUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');

    if (!newUsername || !newEmail || !newPassword) {
      setUserModalError('جميع الحقول مطلوبة.');
      return;
    }

    const res = adminCreateUser({
      username: newUsername,
      email: newEmail,
      passwordHash: newPassword,
      role: newRole,
    });

    if (!res.success) {
      setUserModalError(res.error || 'حدث خطأ أثناء إنشاء المستخدم');
      return;
    }

    setShowAddUserModal(false);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    reloadUsers();

    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('ar-EG'),
        type: 'إضافة حساب',
        msg: `تم إنشاء حساب جديد باسم: ${newUsername} بصلاحية (${newRole})`,
        level: 'success',
      },
      ...prev,
    ]);
  };

  // Password Reset handler
  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !resetPasswordInput.trim()) return;

    adminUpdateUser(resetModalUser.id, { passwordHash: resetPasswordInput.trim() });
    alert(`تم تغيير كلمة مرور المستخدم ${resetModalUser.username} بنجاح!`);

    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('ar-EG'),
        type: 'إعادة كلمة المرور',
        msg: `قام المطور بتغيير كلمة المرور للحساب ${resetModalUser.username}`,
        level: 'warn',
      },
      ...prev,
    ]);

    setResetModalUser(null);
    setResetPasswordInput('');
    reloadUsers();
  };

  // EXPORT HANDLERS (JSON & CSV)
  const handleExportUsersJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(usersList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dr_fonts_users_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('ar-EG'),
        type: 'تصدير البيانات',
        msg: 'تم تصدير نسخة احتياطية من بيانات المستخدمين بصيغة JSON',
        level: 'info',
      },
      ...prev,
    ]);
  };

  const handleExportUsersCSV = () => {
    const headers = ['ID', 'Username', 'Email', 'Role', 'IsDeveloper', 'IsBlocked', 'CreatedAt'];
    const rows = usersList.map((u) => [
      u.id,
      `"${u.username.replace(/"/g, '""')}"`,
      `"${u.email.replace(/"/g, '""')}"`,
      u.role || 'user',
      u.isDeveloper ? 'true' : 'false',
      u.isBlocked ? 'true' : 'false',
      new Date(u.createdAt).toISOString(),
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `dr_fonts_users_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();

    setLogs((prev) => [
      {
        id: `log_${Date.now()}`,
        time: new Date().toLocaleTimeString('ar-EG'),
        type: 'تصدير البيانات',
        msg: 'تم تصدير بيانات المستخدمين والتحليلات بصيغة CSV',
        level: 'info',
      },
      ...prev,
    ]);
  };

  // Font Library Mock Data & Exports
  const fontsList = [
    { id: 'f_1', name: 'خط الثلث الجلي الحديث', designer: 'طارق محمد', glyphs: 142, status: 'موصى به', file: 'Thuluth_Modern.ttf', downloads: 1420 },
    { id: 'f_2', name: 'النسخ الرقمي الاحترافي', designer: 'استوديو الخطوط', glyphs: 210, status: 'معتمد', file: 'Naskh_Pro.ttf', downloads: 3890 },
    { id: 'f_3', name: 'الديواني الذهبي VIP', designer: 'طارق محمد', glyphs: 98, status: 'موصى به', file: 'Diwani_Gold.ttf', downloads: 890 },
    { id: 'f_4', name: 'الرقعة الرقمي السريع', designer: 'دكتور الخطوط', glyphs: 115, status: 'معتمد', file: 'Ruqaa_Fast.ttf', downloads: 2150 },
    { id: 'f_5', name: 'الكوفي الهندسي المربع', designer: 'مختبر المتجهات', glyphs: 88, status: 'معتمد', file: 'Kufi_Square.ttf', downloads: 1760 },
  ];

  const handleExportFontsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(fontsList, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `dr_fonts_library_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportFontsCSV = () => {
    const headers = ['ID', 'FontName', 'Designer', 'GlyphsCount', 'Status', 'FileName', 'TotalDownloads'];
    const rows = fontsList.map((f) => [
      f.id,
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.designer.replace(/"/g, '""')}"`,
      f.glyphs,
      `"${f.status}"`,
      `"${f.file}"`,
      f.downloads,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `dr_fonts_library_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Recharts Chart Data
  const userGrowthData = [
    { day: 'السبت', users: 120, active: 85 },
    { day: 'الأحد', users: 145, active: 110 },
    { day: 'الإثنين', users: 190, active: 140 },
    { day: 'الثلاثاء', users: 240, active: 185 },
    { day: 'الأربعاء', users: 310, active: 230 },
    { day: 'الخميس', users: 420, active: 315 },
    { day: 'الجمعة', users: 550, active: 440 },
  ];

  const dailyFontActivityData = [
    { day: 'السبت', uploaded: 12, exported: 45 },
    { day: 'الأحد', uploaded: 18, exported: 62 },
    { day: 'الإثنين', uploaded: 25, exported: 88 },
    { day: 'الثلاثاء', uploaded: 30, exported: 110 },
    { day: 'الأربعاء', uploaded: 42, exported: 155 },
    { day: 'الخميس', uploaded: 58, exported: 210 },
    { day: 'الجمعة', uploaded: 75, exported: 290 },
  ];

  const monthlyFontUploadRateData = [
    { month: 'يناير', uploaded: 45, approved: 38, rejected: 7 },
    { month: 'فبراير', uploaded: 62, approved: 52, rejected: 10 },
    { month: 'مارس', uploaded: 88, approved: 76, rejected: 12 },
    { month: 'أبريل', uploaded: 110, approved: 95, rejected: 15 },
    { month: 'مايو', uploaded: 142, approved: 124, rejected: 18 },
    { month: 'يونيو', uploaded: 185, approved: 162, rejected: 23 },
    { month: 'يوليو', uploaded: 230, approved: 201, rejected: 29 },
    { month: 'أغسطس', uploaded: 285, approved: 252, rejected: 33 },
  ];

  // Filtered users list (Developer accounts are strictly hidden from users list)
  const filteredUsers = usersList.filter((u) => {
    if (u.role === 'developer' || u.isDeveloper || u.username.toLowerCase().includes('dr font') || u.username.toLowerCase().includes('tarek')) {
      return false;
    }

    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());

    if (roleFilter === 'all') return matchesSearch;
    if (roleFilter === 'admin') return matchesSearch && u.role === 'admin';
    return matchesSearch && (!u.role || u.role === 'user');
  });

  // Guard access if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white border border-rose-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6 relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto border border-rose-500/20">
            <IconLock size={32} />
          </div>

          <div className="space-y-2">
            <h1 className="font-heading font-extrabold text-2xl text-slate-900">
              وصول محمي ومخصص للإدارة
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed">
              هذه الصفحة مخصصة لمدير النظام والمطور المعتمد. يرجى تسجيل الدخول بحسابك للوصول.
            </p>
          </div>

          <button
            onClick={() => openAuthModal('login')}
            className="w-full py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all"
          >
            تسجيل الدخول
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-32 pt-6 px-4 max-w-7xl mx-auto space-y-8 animate-fadeIn">
      {/* Admin Developer Header (Light Theme) */}
      <div className="bg-gradient-to-br from-white via-sky-50/70 to-indigo-50/60 border border-slate-200/90 rounded-3xl p-6 sm:p-8 text-slate-900 shadow-lg relative overflow-hidden space-y-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 text-amber-800 border border-amber-500/30 text-xs font-bold shadow-xs">
              <IconCrown size={14} className="text-amber-600" />
              <span>لوحة التحكم العالية المطور الرئيسي</span>
            </div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-4xl tracking-tight text-slate-900 flex items-center gap-3">
              <span>أهلاً بك، {user?.username}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              منظومة التحكم الشاملة لاستوديو دكتور الخطوط - التحكم بالمستخدمين، التراخيص، تصدير البيانات، وقواعد الصيانة.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-4 py-2 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-mono font-bold flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>الخادم: نشط 100%</span>
            </div>
            {maintenanceMode && (
              <div className="px-4 py-2 rounded-2xl bg-amber-50 border border-amber-300 text-xs text-amber-800 font-bold flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>وضع الصيانة مفعّل</span>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-white/60 relative z-10">
          <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 shadow-md space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-xs font-bold">
              <span>المستخدمين المسجلين</span>
              <IconUsers size={16} className="text-sky-600" />
            </div>
            <p className="text-2xl font-black font-mono text-slate-900">{usersList.length}</p>
            <p className="text-[10px] text-emerald-700 font-bold">نشط ومتوفر</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 shadow-md space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-xs font-bold">
              <span>الخطوط في السحابة</span>
              <IconFonts size={16} className="text-indigo-600" />
            </div>
            <p className="text-2xl font-black font-mono text-slate-900">{fontsList.length}</p>
            <p className="text-[10px] text-sky-700 font-bold">جاهزة للتصدير</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 shadow-md space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-xs font-bold">
              <span>قواعد GSUB والتراكيب</span>
              <IconSparkles size={16} className="text-amber-600" />
            </div>
            <p className="text-2xl font-black font-mono text-slate-900">1,240+</p>
            <p className="text-[10px] text-amber-700 font-bold">مفعلة تلقائياً</p>
          </div>

          <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 shadow-md space-y-1">
            <div className="flex items-center justify-between text-slate-600 text-xs font-bold">
              <span>حالة النظام والصيانة</span>
              <IconActivity size={16} className="text-emerald-600" />
            </div>
            <p className="text-xl font-bold font-mono text-emerald-700">
              {maintenanceMode ? 'وضع الصيانة' : 'مستقر 99.9%'}
            </p>
            <p className="text-[10px] text-slate-600 font-bold">طبيعي وحيوي</p>
          </div>
        </div>
      </div>

      {/* Admin Navigation Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar p-2 liquid-glass-card rounded-2xl shadow-xl border border-white/80">
        {[
          { id: 'support', label: 'الدعم المباشر ومحادثات المستخدمين', icon: IconHeadphones, badge: pendingSupportCount },
          { id: 'overview', label: 'الرسوم البيانية والتحليلات', icon: IconBarChart },
          { id: 'users', label: 'إدارة المستخدمين والحسابات', icon: IconUsers },
          { id: 'fonts', label: 'رفع وإدارة الخطوط (TTF/OTF)', icon: IconFonts },
          { id: 'settings', label: 'إعدادات المنظومة والصيانة', icon: IconSettings },
          { id: 'logs', label: 'سجل الأمان والنشاطات', icon: IconActivity },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2.5 rounded-xl text-xs font-heading font-bold flex items-center gap-2 whitespace-nowrap transition-all relative ${
                isActive
                  ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-md border border-white/20'
                  : 'liquid-glass-button text-slate-700 hover:text-slate-900'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
              {Boolean(tab.badge && tab.badge > 0) && (
                <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-mono font-bold animate-pulse">
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* TAB 0: LIVE SUPPORT CONSOLE */}
      {activeTab === 'support' && <AdminLiveSupportConsole />}

      {/* TAB 1: OVERVIEW & RECHARTS */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Quick Export Banner */}
          <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-700">
                <IconDownload size={20} />
              </div>
              <div>
                <h4 className="font-bold text-xs text-slate-900">
                  تصدير النسخ الاحتياطية وسجلات النشاط
                </h4>
                <p className="text-[11px] text-slate-600 font-medium">
                  تصدير بيانات المستخدمين والخطوط المرفوعة بصيغ JSON و CSV بنقرة واحدة.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={handleExportUsersJSON}
                className="px-3 py-1.5 rounded-xl liquid-glass-button text-sky-800 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all"
              >
                <IconDownload size={14} />
                <span>المستخدمين (JSON)</span>
              </button>
              <button
                onClick={handleExportUsersCSV}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all border border-white/20"
              >
                <IconDownload size={14} />
                <span>المستخدمين (CSV)</span>
              </button>
            </div>
          </div>

          {/* Recharts Analytics Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Chart 1: User Growth AreaChart */}
            <div className="liquid-glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
              <div className="flex items-center justify-between border-b border-white/60 pb-3">
                <div className="flex items-center gap-2">
                  <IconUsers size={18} className="text-sky-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    معدل نمو المستخدمين والنشاط الأسبوعي
                  </h3>
                </div>
                <span className="text-[10px] text-emerald-800 font-bold liquid-glass-badge px-2 py-0.5 rounded-full border border-emerald-300/50">
                  +34% هذا الأسبوع
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={userGrowthData}>
                    <defs>
                      <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorActive" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e1e24',
                        borderColor: '#333',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="users" name="إجمالي الحسابات" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorUsers)" />
                    <Area type="monotone" dataKey="active" name="النشطين يومياً" stroke="#6366f1" fillOpacity={1} fill="url(#colorActive)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Chart 2: Fonts Daily Activity BarChart */}
            <div className="liquid-glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
              <div className="flex items-center justify-between border-b border-white/60 pb-3">
                <div className="flex items-center gap-2">
                  <IconFonts size={18} className="text-amber-600" />
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    الخطوط المرفوعة والمصدرة يومياً
                  </h3>
                </div>
                <span className="text-[10px] text-sky-800 font-bold liquid-glass-badge px-2 py-0.5 rounded-full border border-sky-300/50">
                  تنسيق OTF/TTF
                </span>
              </div>

              <div className="h-64 w-full pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailyFontActivityData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                    <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
                    <YAxis stroke="#94a3b8" fontSize={11} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: '#1e1e24',
                        borderColor: '#333',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '11px',
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="uploaded" name="الخطوط المرفوعة" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    <Bar dataKey="exported" name="الخطوط المُصدَّرة" fill="#10b981" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Chart 3: Monthly Font Uploads Rate */}
          <div className="liquid-glass-card rounded-3xl p-6 shadow-md border border-white/80 space-y-4">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <div className="flex items-center gap-2">
                <IconBarChart size={18} className="text-sky-600" />
                <div>
                  <h3 className="font-heading font-bold text-sm text-slate-900">
                    معدل رفع الخطوط شهرياً ونسبة القبول/الرفض
                  </h3>
                  <p className="text-[11px] text-slate-600 font-medium">متابعة تراكمية لرفع خطوط TTF/OTF على مدار الأشهر</p>
                </div>
              </div>
              <span className="text-[10px] text-emerald-800 font-bold liquid-glass-badge px-2.5 py-1 rounded-full border border-emerald-300/50">
                نسبة القبول العامة 88.4%
              </span>
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthlyFontUploadRateData}>
                  <defs>
                    <linearGradient id="colorMonthUploaded" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMonthApproved" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorMonthRejected" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1e1e24',
                      borderColor: '#333',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '11px',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="uploaded" name="إجمالي المرفوعات" stroke="#0ea5e9" fillOpacity={1} fill="url(#colorMonthUploaded)" />
                  <Area type="monotone" dataKey="approved" name="الخطوط المقبولة" stroke="#10b981" fillOpacity={1} fill="url(#colorMonthApproved)" />
                  <Area type="monotone" dataKey="rejected" name="الخطوط المرفوضة" stroke="#f43f5e" fillOpacity={1} fill="url(#colorMonthRejected)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 liquid-glass-card rounded-3xl p-6 border border-white/80 space-y-6">
              <div className="flex items-center justify-between border-b border-white/60 pb-4">
                <div className="flex items-center gap-2">
                  <IconShield size={20} className="text-sky-600" />
                  <h3 className="font-heading font-bold text-lg text-slate-900">
                    حالة المنظومة والترخيص
                  </h3>
                </div>
                <span className="text-xs text-slate-600 font-medium">إصدار الدكتور v1.0.0</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 rounded-2xl liquid-glass-badge border border-white/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>المطور المسجل</span>
                    <IconCrown size={16} className="text-amber-500" />
                  </div>
                  <p className="text-sm font-bold text-sky-700">Dr Font</p>
                  <p className="text-[11px] text-slate-600 font-medium">صلاحية جذري كاملة (Root Developer)</p>
                </div>

                <div className="p-4 rounded-2xl liquid-glass-badge border border-white/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                    <span>تصدير الخطوط OTF/TTF</span>
                    <IconCheckCircle size={16} className="text-emerald-600" />
                  </div>
                  <p className="text-sm font-bold text-emerald-700">جاهز وغير محدود</p>
                  <p className="text-[11px] text-slate-600 font-medium">دعم كود خفيف وتوافق 100%</p>
                </div>
              </div>
            </div>

            <div className="liquid-glass-card rounded-3xl p-6 border border-white/80 space-y-6">
              <h3 className="font-heading font-bold text-base text-slate-900 border-b border-white/60 pb-4">
                إحصائيات سريعة
              </h3>

              <div className="space-y-4 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-700 font-medium">المستخدمين النشطين</span>
                  <span className="font-bold text-slate-900">
                    {usersList.filter((u) => !u.isBlocked).length}
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200/60 overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[95%]" />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-700 font-medium">الحسابات المحظورة</span>
                  <span className="font-bold text-rose-600">
                    {usersList.filter((u) => u.isBlocked).length}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-slate-700 font-medium">الأدمن والمسؤولين</span>
                  <span className="font-bold text-amber-600">
                    {
                      usersList.filter(
                        (u) =>
                          u.role === 'admin' ||
                          u.role === 'developer' ||
                          u.isDeveloper ||
                          u.username.toLowerCase().includes('dr font')
                      ).length
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: USER MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="liquid-glass-card rounded-3xl p-6 shadow-xl border border-white/80 space-y-6 animate-fadeIn">
          {/* Header Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/60 pb-6">
            <div>
              <h3 className="font-heading font-bold text-xl text-slate-900">
                إدارة المستخدمين والتحكم بالحسابات
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                عرض الحسابات المسجلة، نوع الجهاز، عنوان IP، تعديل الصلاحيات، الحظر، أو تصدير البيانات.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportUsersJSON}
                className="px-3 py-2 rounded-2xl liquid-glass-button text-slate-800 font-bold text-xs flex items-center gap-1.5 transition-all"
              >
                <IconDownload size={14} />
                <span>JSON</span>
              </button>
              <button
                onClick={handleExportUsersCSV}
                className="px-3 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all border border-white/20"
              >
                <IconDownload size={14} />
                <span>CSV</span>
              </button>
              <button
                onClick={() => setShowAddUserModal(true)}
                className="px-4 py-2 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-md shadow-sky-500/20 transition-all border border-white/20"
              >
                <IconPlus size={16} />
                <span>إضافة حساب جديد</span>
              </button>
            </div>
          </div>

          {/* Search & Role Filters */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <IconSearch size={16} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="البحث باسم المستخدم أو البريد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-2xl liquid-glass-input text-xs text-slate-900 focus:outline-none transition-colors"
              />
            </div>

            <div className="flex items-center gap-1 liquid-glass-badge p-1 rounded-2xl border border-white/80 w-full sm:w-auto">
              {[
                { id: 'all', label: 'الكل' },
                { id: 'admin', label: 'إدارة' },
                { id: 'user', label: 'مستخدمين' },
              ].map((rf) => (
                <button
                  key={rf.id}
                  onClick={() => setRoleFilter(rf.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    roleFilter === rf.id
                      ? 'bg-gradient-to-r from-sky-600 to-blue-600 text-white shadow-xs border border-white/20'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {rf.label}
                </button>
              ))}
            </div>
          </div>

          {/* Users Data Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs text-slate-700">
              <thead className="liquid-glass-badge text-slate-700 font-bold border-b border-white/60">
                <tr>
                  <th className="py-3 px-4 rounded-r-2xl">المستخدم</th>
                  <th className="py-3 px-4">البريد الإلكتروني</th>
                  <th className="py-3 px-4">نوع الجهاز</th>
                  <th className="py-3 px-4">عنوان IP</th>
                  <th className="py-3 px-4">الصلاحية والنوع</th>
                  <th className="py-3 px-4">تاريخ الانضمام</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4 rounded-l-2xl text-center">حذف / التحكم بالحساب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/40">
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-500 font-medium">
                      لا يوجد مستخدمين مطابقين لخيارات البحث
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isDev = u.username.toLowerCase().includes('dr font') || u.username.toLowerCase().includes('drfont') || u.role === 'developer' || u.isDeveloper;

                    return (
                      <tr key={u.id} className="hover:bg-white/40 transition-colors">
                        <td className="py-3.5 px-4 font-bold flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl}
                            alt={u.username}
                            className="w-8 h-8 rounded-full object-cover border border-white shadow-2xs"
                          />
                          <div>
                            <p className="text-slate-900 flex items-center gap-1.5">
                              <span>{u.username}</span>
                              {isDev && (
                                <span className="px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-600 text-[10px] font-bold">
                                  المطور
                                </span>
                              )}
                            </p>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-slate-600 font-medium">{u.email}</td>
                        <td className="py-3.5 px-4">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl liquid-glass-badge text-slate-800 text-[11px] font-bold border border-white/80">
                            <IconDevice size={13} className="text-sky-600 shrink-0" />
                            <span>{u.deviceType || 'متصفح ويب (سطح المكتب)'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono dir-ltr text-right">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-xl liquid-glass-badge text-indigo-700 text-[11px] font-bold border border-indigo-200/50">
                            <IconGlobe size={12} className="text-indigo-500 shrink-0" />
                            <span>{u.ipAddress || '197.38.112.42'}</span>
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <select
                            disabled={isDev}
                            value={u.role || 'user'}
                            onChange={(e) => {
                              adminUpdateUser(u.id, {
                                role: e.target.value as any,
                                isDeveloper: e.target.value === 'developer',
                              });
                              reloadUsers();
                            }}
                            className="px-2.5 py-1 rounded-xl liquid-glass-input border border-white/80 text-xs font-bold text-slate-800 focus:outline-none"
                          >
                            <option value="user">مستخدم عادي</option>
                            <option value="admin">مسؤول (Admin)</option>
                            <option value="developer">مطور (Developer)</option>
                          </select>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 text-[11px] font-medium">
                          {new Date(u.createdAt).toLocaleDateString('ar-EG')}
                        </td>
                        <td className="py-3.5 px-4">
                          {u.isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-700 text-[11px] font-bold border border-rose-300/40">
                              <IconBan size={12} />
                              <span>محظور</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 text-[11px] font-bold border border-emerald-300/40">
                              <IconCheckCircle size={12} />
                              <span>نشط</span>
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Reset Password */}
                            <button
                              onClick={() => {
                                setResetModalUser(u);
                                setResetPasswordInput('');
                              }}
                              title="إعادة تعيين كلمة المرور"
                              className="p-1.5 rounded-xl liquid-glass-button text-slate-700 transition-colors"
                            >
                              <IconKey size={16} />
                            </button>

                            {/* Block Toggle */}
                            {!isDev && (
                              <button
                                onClick={() => {
                                  adminUpdateUser(u.id, { isBlocked: !u.isBlocked });
                                  reloadUsers();
                                }}
                                title={u.isBlocked ? 'إلغاء الحظر' : 'حظر المستخدم'}
                                className={`p-1.5 rounded-xl transition-colors ${
                                  u.isBlocked
                                    ? 'bg-emerald-500/15 text-emerald-700 border border-emerald-300/40'
                                    : 'bg-amber-500/15 text-amber-700 border border-amber-300/40'
                                }`}
                              >
                                <IconBan size={16} />
                              </button>
                            )}

                            {/* Delete User */}
                            {!isDev && (
                              <button
                                onClick={() => {
                                  if (window.confirm(`هل أنت متأكد من حذف حساب المستخدم (${u.username}) نهائياً من النظام ومسح جميع بياناته؟`)) {
                                    const ok = adminDeleteUser(u.id);
                                    if (ok) {
                                      reloadUsers();
                                      alert(`تم حذف حساب المستخدم ${u.username} بنجاح.`);
                                    } else {
                                      alert('تعذر حذف هذا الحساب (حساب المطور الرئيسي محمي).');
                                    }
                                  }
                                }}
                                title="حذف حساب المستخدم نهائياً"
                                className="px-2.5 py-1 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-700 border border-rose-300/50 text-xs font-bold flex items-center gap-1 transition-all"
                              >
                                <IconTrash size={14} />
                                <span>حذف</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: FONTS DATABASE & UPLOAD MANAGER */}
      {activeTab === 'fonts' && <AdminFontManager />}

      {/* TAB 4: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="liquid-glass-card rounded-3xl p-6 shadow-xl border border-white/80 space-y-6 animate-fadeIn">
          <div>
            <h3 className="font-heading font-bold text-xl text-slate-900">
              إعدادات المنظومة والإعلانات العامة
            </h3>
            <p className="text-xs text-slate-600 font-medium">
              تكوين سلوك المنظومة، وضع الصيانة المتقدم، وتأمين التسجيل للعملاء.
            </p>
          </div>

          <div className="space-y-6 max-w-2xl">
            {/* Maintenance Mode Option */}
            <div className="p-5 rounded-2xl liquid-glass-badge border border-amber-400/40 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <IconCrown size={18} className="text-amber-600" />
                  <h4 className="font-bold text-sm text-slate-900">
                    تفعيل وضع الصيانة العام (Maintenance Mode)
                  </h4>
                </div>
                <p className="text-xs text-slate-600 font-medium">
                  عند تفعيله، سيتم إخفاء محتوى الموقع وإظهار شاشة صيانة مخصصة للزوار عند التحديثات الكبيرة.
                </p>
              </div>

              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => handleToggleMaintenance(e.target.checked)}
                className="w-6 h-6 accent-amber-500 rounded cursor-pointer"
              />
            </div>

            {/* Announcement Banner */}
            <div className="p-5 rounded-2xl liquid-glass-card border border-white/80 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">
                    الشريط الإعلاني العام والتنبيهات
                  </h4>
                  <p className="text-xs text-slate-600 font-medium">إظهار رسالة تنبيه لأعلى جميع زوار الموقع</p>
                </div>
                <input
                  type="checkbox"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
                />
              </div>

              {announcementActive && (
                <textarea
                  rows={2}
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="اكتب نص الإعلان الذي سيظهر للجمهور..."
                  className="w-full p-3 rounded-2xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                />
              )}
            </div>

            {/* Allow Signups */}
            <div className="p-5 rounded-2xl liquid-glass-card border border-white/80 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-sm text-slate-900">السماح بتسجيل حسابات جديدة</h4>
                <p className="text-xs text-slate-600 font-medium">فتح أو إغلاق نموذج الاشتراك للزوار الجدد</p>
              </div>
              <input
                type="checkbox"
                checked={allowSignups}
                onChange={(e) => setAllowSignups(e.target.checked)}
                className="w-5 h-5 accent-sky-500 rounded cursor-pointer"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-sky-500/25 transition-all border border-white/20"
            >
              حفظ جميع التغييرات والتطبيقات
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="liquid-glass-card rounded-3xl p-6 shadow-xl border border-white/80 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-white/60 pb-4">
            <div>
              <h3 className="font-heading font-bold text-xl text-slate-900">
                سجل الأمان والعمليات المباشر
              </h3>
              <p className="text-xs text-slate-600 font-medium">تسجيل لحظي لعمليات النظام، تسجيل الدخول وتغييرات الصلاحيات.</p>
            </div>

            <button
              onClick={() => setLogs([])}
              className="px-3 py-1.5 rounded-xl liquid-glass-button text-xs text-slate-700 transition-colors"
            >
              مسح السجل
            </button>
          </div>

          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-2xl liquid-glass-card border border-white/80 flex items-center justify-between text-xs shadow-xs"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      log.level === 'success'
                        ? 'bg-emerald-500'
                        : log.level === 'warn'
                        ? 'bg-amber-500'
                        : 'bg-sky-500'
                    }`}
                  />
                  <div>
                    <span className="font-bold text-slate-900 ml-2">[{log.type}]</span>
                    <span className="text-slate-700 font-medium">{log.msg}</span>
                  </div>
                </div>

                <span className="font-mono text-[10px] text-slate-500 font-medium">{log.time}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal: Add New User */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-modal rounded-3xl p-6 max-w-md w-full shadow-2xl border border-white/80 space-y-6">
            <div className="flex items-center justify-between border-b border-white/60 pb-4">
              <h3 className="font-heading font-bold text-base text-slate-900">
                إضافة حساب جديد
              </h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 transition-colors"
                title="إغلاق"
              >
                <IconClose size={18} />
              </button>
            </div>

            {userModalError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-300/40 text-rose-700 text-xs font-bold">
                {userModalError}
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  required
                  placeholder="مثال: AhmedDesigner"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2.5 rounded-2xl liquid-glass-input text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  placeholder="user@example.com"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-2xl liquid-glass-input text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-2xl liquid-glass-input text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">نوع الصلاحية</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-2xl liquid-glass-input text-slate-900 focus:outline-none"
                >
                  <option value="user">مستخدم عادي</option>
                  <option value="admin">مسؤول (Admin)</option>
                  <option value="developer">مطور (Developer)</option>
                </select>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold transition-all border border-white/20 shadow-md shadow-sky-500/20"
                >
                  إنشاء الحساب
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="px-4 py-2.5 rounded-2xl liquid-glass-button text-slate-700 font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Reset Password */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn">
          <div className="liquid-glass-modal rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/80 space-y-4">
            <h3 className="font-heading font-bold text-base text-slate-900">
              تغيير كلمة المرور لـ ({resetModalUser.username})
            </h3>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="text"
                  required
                  placeholder="أدخل كلمة المرور الجديدة"
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  className="w-full p-2.5 rounded-2xl liquid-glass-input text-slate-900 focus:outline-none font-mono"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold transition-all border border-white/20 shadow-md shadow-sky-500/20"
                >
                  تحديث الآن
                </button>
                <button
                  type="button"
                  onClick={() => setResetModalUser(null)}
                  className="px-4 py-2.5 rounded-2xl liquid-glass-button text-slate-700 font-bold"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

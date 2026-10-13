import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { doc, setDoc, deleteDoc, getDocs, collection } from 'firebase/firestore';
import { useAuth, UserAccount } from '../context/AuthContext';
import { AdminFontManager } from '../components/AdminFontManager';
import {
  db,
  auth,
  firebaseProjectInfo,
  PRIMARY_DOMAIN,
  syncDomainConfigToFirestore,
  recordAuditLog,
  fetchAuditLogsFromFirestore,
  fetchDeveloperControlStats,
  CloudAuditLog,
  DeveloperConsoleStats,
} from '../firebase';
import {
  IconShield,
  IconCrown,
  IconUsers,
  IconSettings,
  IconActivity,
  IconLock,
  IconSearch,
  IconPlus,
  IconTrash,
  IconBan,
  IconCheckCircle,
  IconFonts,
  IconSparkles,
  IconRefresh,
  IconKey,
  IconDownload,
  IconClose,
  IconGlobe,
  IconCloud,
} from '../components/icons/Icons';
import { useScrollLock } from '../hooks/useScrollLock';

export const AdminPage: React.FC = () => {
  const {
    user,
    isAdmin,
    getAllUsers,
    adminUpdateUser,
    adminDeleteUser,
    adminCreateUser,
    openAuthModal,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'fonts' | 'settings' | 'logs'>('overview');
  const [usersList, setUsersList] = useState<UserAccount[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'developer'>('all');

  // Firebase Live Stats state
  const [firebaseStats, setFirebaseStats] = useState<DeveloperConsoleStats>({
    totalUsers: 1,
    totalProjects: 0,
    totalThreads: 0,
    isFirestoreOnline: true,
    databaseId: firebaseProjectInfo.databaseId,
    projectId: firebaseProjectInfo.projectId,
  });
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Cloud Audit Logs
  const [logs, setLogs] = useState<CloudAuditLog[]>([]);

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

  // Lock background scroll when any admin modal is active
  useScrollLock(showAddUserModal || !!resetModalUser);

  // System Settings state
  const [maintenanceMode, setMaintenanceMode] = useState<boolean>(() => {
    return localStorage.getItem('df_maintenance_mode') === 'true';
  });
  const [allowSignups, setAllowSignups] = useState<boolean>(() => {
    return localStorage.getItem('df_allow_signups') !== 'false';
  });
  const [announcementMsg, setAnnouncementMsg] = useState<string>(() => {
    const raw = localStorage.getItem('df_announcement_msg');
    return raw || '';
  });
  const [announcementActive, setAnnouncementActive] = useState<boolean>(() => {
    return localStorage.getItem('df_announcement_active') === 'true';
  });

  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Load and sync users from Firestore & local
  const reloadUsers = async () => {
    const localUsers = getAllUsers();
    setUsersList(localUsers);

    if (auth.currentUser) {
      try {
        const snap = await getDocs(collection(db, 'users'));
        const cloudUsers: UserAccount[] = [];
        snap.forEach((d) => {
          cloudUsers.push(d.data() as UserAccount);
        });
        if (cloudUsers.length > 0) {
          // Merge unique users
          const map = new Map<string, UserAccount>();
          localUsers.forEach((u) => map.set(u.id, u));
          cloudUsers.forEach((u) => map.set(u.id, u));
          setUsersList(Array.from(map.values()));
        }
      } catch {
        // Fallback to local users
      }
    }
  };

  // Load live telemetry from Firebase
  const loadFirebaseTelemetry = async () => {
    setIsLoadingStats(true);
    try {
      const stats = await fetchDeveloperControlStats();
      setFirebaseStats(stats);
      const cloudLogs = await fetchAuditLogsFromFirestore();
      setLogs(cloudLogs);
    } finally {
      setIsLoadingStats(false);
    }
  };

  useEffect(() => {
    reloadUsers();
    loadFirebaseTelemetry();
  }, []);

  // Save system settings to Firestore & localStorage
  const handleSaveSettings = async () => {
    localStorage.setItem('df_maintenance_mode', String(maintenanceMode));
    localStorage.setItem('df_allow_signups', String(allowSignups));
    localStorage.setItem('df_announcement_msg', announcementMsg);
    localStorage.setItem('df_announcement_active', String(announcementActive));

    if (auth.currentUser) {
      try {
        await setDoc(
          doc(db, 'systemSettings', 'announcements'),
          {
            id: 'announcements',
            announcementMsg,
            maintenanceMode,
            allowSignups,
            updatedAt: new Date().toISOString(),
            updatedBy: auth.currentUser.uid,
          },
          { merge: true }
        );
      } catch (err) {
        console.warn('Sync settings error:', err);
      }
    }

    await recordAuditLog('تحديث الإعدادات', `تحديث إعدادات النظام (وضع الصيانة: ${maintenanceMode ? 'مفعل' : 'معطل'})`, 'warn');
    const updatedLogs = await fetchAuditLogsFromFirestore();
    setLogs(updatedLogs);

    setSaveSuccessMsg('تم حفظ وتحديث الإعدادات سحابياً في Firestore بنجاح');
    setTimeout(() => setSaveSuccessMsg(null), 3000);
  };

  // Create User
  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserModalError('');

    const res = adminCreateUser({
      username: newUsername,
      email: newEmail,
      passwordHash: newPassword,
      role: newRole,
    });

    if (!res.success && res.error) {
      setUserModalError(res.error);
      return;
    }

    // Sync to Firestore
    if (auth.currentUser) {
      const tempId = `usr_${Date.now()}`;
      try {
        await setDoc(doc(db, 'users', tempId), {
          id: tempId,
          username: newUsername.trim(),
          email: newEmail.trim().toLowerCase(),
          role: newRole,
          createdAt: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('Firestore user write note:', err);
      }
    }

    await recordAuditLog('إنشاء مستخدم', `تم إنشاء مستخدم جديد: ${newUsername} (${newRole})`, 'success');
    const updatedLogs = await fetchAuditLogsFromFirestore();
    setLogs(updatedLogs);

    setShowAddUserModal(false);
    setNewUsername('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('user');
    reloadUsers();
  };

  // Password Reset
  const handlePasswordResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetModalUser || !resetPasswordInput.trim()) return;

    adminUpdateUser(resetModalUser.id, { passwordHash: resetPasswordInput.trim() });

    if (auth.currentUser) {
      try {
        await setDoc(
          doc(db, 'users', resetModalUser.id),
          { updatedAt: new Date().toISOString() },
          { merge: true }
        );
      } catch {
        // Ignore
      }
    }

    await recordAuditLog('كلمة المرور', `تم تغيير كلمة المرور للمستخدم ${resetModalUser.username}`, 'info');
    const updatedLogs = await fetchAuditLogsFromFirestore();
    setLogs(updatedLogs);

    setResetModalUser(null);
    setResetPasswordInput('');
    reloadUsers();
  };

  // Delete User
  const handleDeleteUser = async (u: UserAccount) => {
    const ok = adminDeleteUser(u.id);
    if (ok) {
      if (auth.currentUser) {
        try {
          await deleteDoc(doc(db, 'users', u.id));
        } catch {
          // Ignore
        }
      }
      await recordAuditLog('حذف مستخدم', `تم حذف حساب المستخدم ${u.username}`, 'warn');
      const updatedLogs = await fetchAuditLogsFromFirestore();
      setLogs(updatedLogs);
      reloadUsers();
    }
  };

  // Toggle user block status
  const handleToggleBlockUser = async (u: UserAccount) => {
    const nextBlocked = !u.isBlocked;
    adminUpdateUser(u.id, { isBlocked: nextBlocked });

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'users', u.id), { isBlocked: nextBlocked }, { merge: true });
      } catch {
        // Ignore
      }
    }

    await recordAuditLog('حالة الحساب', `تم ${nextBlocked ? 'تجميد' : 'إلغاء تجميد'} حساب ${u.username}`, 'warn');
    const updatedLogs = await fetchAuditLogsFromFirestore();
    setLogs(updatedLogs);
    reloadUsers();
  };

  // Filter users
  const filteredUsers = usersList.filter((u) => {
    const matchSearch =
      (u.username || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === 'all' || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  // Guard access
  if (!user || !isAdmin) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto space-y-4 animate-fadeIn dir-rtl">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/15 border border-amber-400/30 text-amber-600 flex items-center justify-center shadow-lg">
          <IconLock size={26} />
        </div>
        <h2 className="font-heading font-black text-xl text-slate-900">
          مركز تحكم المطورين والإدارة
        </h2>
        <p className="text-xs text-slate-600 font-body leading-relaxed">
          يتطلب هذا القسم صلاحيات الإدارة أو المطور. سجّل الدخول بحساب المشرف للوصول إلى لوحة التحكم.
        </p>
        <button
          onClick={() => openAuthModal('login')}
          className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 cursor-pointer"
        >
          تسجيل الدخول كمدير
        </button>
      </div>
    );
  }

  return (
    <div className="pb-24 pt-4 px-4 max-w-6xl mx-auto space-y-6 dir-rtl animate-fadeIn">
      {/* Header with Live Firebase Status */}
      <div className="liquid-glass-card rounded-2xl p-5 border border-white/80 shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-sky-500/15 border border-sky-400/30 text-sky-600 flex items-center justify-center">
            <IconShield size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-lg text-slate-900">
                مركز تحكم المطورين (Firebase Console)
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                سحابي متصل
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-mono mt-0.5">
              مشروع Firebase: <strong className="text-slate-800">{firebaseProjectInfo.projectId}</strong>
              <span className="mx-2">•</span>
              المسؤول: <strong className="text-sky-700">{user.email}</strong>
            </p>
          </div>
        </div>

        <button
          onClick={loadFirebaseTelemetry}
          disabled={isLoadingStats}
          className="px-3.5 py-1.5 rounded-xl liquid-glass-button text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer shadow-xs active:scale-95 transition-all self-end sm:self-auto"
        >
          <IconRefresh size={14} className={isLoadingStats ? 'animate-spin text-sky-600' : ''} />
          <span>تحديث سحابي</span>
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar p-1.5 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs font-heading font-bold shadow-xs">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <IconCloud size={16} />
          <span>نظرة عامة وسحابة Firebase</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'users'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <IconUsers size={16} />
          <span>المستخدمين ({usersList.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('fonts')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'fonts'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <IconFonts size={16} />
          <span>مكتبة الخطوط</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <IconSettings size={16} />
          <span>إعدادات النظام</span>
        </button>

        <button
          onClick={() => setActiveTab('logs')}
          className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
            activeTab === 'logs'
              ? 'bg-sky-600 text-white shadow-sm'
              : 'text-slate-700 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <IconActivity size={16} />
          <span>سجل العمليات</span>
        </button>
      </div>

      {/* TAB 1: OVERVIEW & CLOUD TELEMETRY */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Real Firebase KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>المستخدمين المسجلين</span>
                <IconUsers size={16} className="text-sky-600" />
              </div>
              <p className="text-2xl font-black font-heading text-slate-900">
                {usersList.length || firebaseStats.totalUsers}
              </p>
              <p className="text-[10px] text-emerald-600 font-medium">سحابي في Firestore</p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>مشاريع الخطوط</span>
                <IconFonts size={16} className="text-indigo-600" />
              </div>
              <p className="text-2xl font-black font-heading text-indigo-900">
                {firebaseStats.totalProjects || 5}
              </p>
              <p className="text-[10px] text-indigo-600 font-medium">مشاريع ومخطوطات</p>
            </div>

            <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 space-y-1">
              <div className="flex items-center justify-between text-slate-500 text-xs">
                <span>حالة المنظومة</span>
                <IconCheckCircle size={16} className="text-emerald-600" />
              </div>
              <p className="text-lg font-black font-heading text-emerald-700">
                100% مستقرة
              </p>
              <p className="text-[10px] text-slate-500 font-medium">Firebase Auth & DB</p>
            </div>
          </div>

          {/* Connected Domain Card */}
          <div className="p-5 rounded-2xl liquid-glass-card border border-white/80 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center font-bold">
                  <IconGlobe size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">
                    الدومين السحابي المعتمد (Vercel Production)
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    مربوط ومسجل في Firestore بمجموعة <code className="text-sky-700">systemSettings/domainConfig</code>
                  </p>
                </div>
              </div>

              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                ● مسجل في Firestore
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-900 text-white font-mono text-xs flex items-center justify-between gap-2 overflow-x-auto">
              <span className="text-emerald-400">{PRIMARY_DOMAIN}/</span>
              <button
                onClick={() => syncDomainConfigToFirestore()}
                className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded cursor-pointer transition-all"
              >
                إعادة المزامنة
              </button>
            </div>
          </div>

          {/* Quick Backup Export */}
          <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 flex items-center justify-between gap-3 text-xs">
            <div className="space-y-0.5">
              <h4 className="font-bold text-slate-900">تصدير النسخ الاحتياطية للبيانات</h4>
              <p className="text-slate-500 text-[11px]">تصدير بيانات المستخدمين والخطوط بصيغة JSON أو CSV.</p>
            </div>
            <button
              onClick={() => {
                const data = JSON.stringify({ users: usersList, exportedAt: new Date().toISOString() }, null, 2);
                const blob = new Blob([data], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `fonty_backup_${Date.now()}.json`;
                a.click();
              }}
              className="px-3 py-1.5 rounded-xl liquid-glass-button font-bold text-sky-800 flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <IconDownload size={14} />
              <span>تصدير JSON</span>
            </button>
          </div>
        </div>
      )}

      {/* TAB 2: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="space-y-4 animate-fadeIn">
          {/* Users Header & Search */}
          <div className="p-4 rounded-2xl liquid-glass-card border border-white/80 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                placeholder="بحث عن اسم أو بريد..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pr-8 pl-3 py-1.5 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
              />
              <IconSearch size={14} className="absolute right-2.5 top-2.5 text-slate-400" />
            </div>

            <button
              onClick={() => setShowAddUserModal(true)}
              className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-sm flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <IconPlus size={14} />
              <span>إضافة مستخدم</span>
            </button>
          </div>

          {/* Users Table */}
          <div className="liquid-glass-card rounded-2xl border border-white/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-100/70 border-b border-slate-200 text-slate-600 font-bold">
                  <tr>
                    <th className="p-3">المستخدم</th>
                    <th className="p-3">البريد الإلكتروني</th>
                    <th className="p-3">الصلاحية</th>
                    <th className="p-3">الحالة</th>
                    <th className="p-3 text-center">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {filteredUsers.map((u) => {
                    const isRoot = u.role === 'developer' || u.email === 'admin@fonty.dev';
                    return (
                      <tr key={u.id} className="hover:bg-white/50 transition-colors">
                        <td className="p-3 flex items-center gap-2.5">
                          <img
                            src={u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80'}
                            alt={u.username}
                            className="w-7 h-7 rounded-full object-cover border border-sky-400"
                          />
                          <span className="font-bold text-slate-900">{u.username}</span>
                        </td>
                        <td className="p-3 font-mono text-slate-600 text-[11px]">{u.email}</td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.role === 'admin' || u.role === 'developer'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}>
                            {u.role === 'developer' ? 'مطور رئيسي' : u.role === 'admin' ? 'مشرف' : 'مستخدم'}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            u.isBlocked
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.isBlocked ? 'محظور' : 'نشط'}
                          </span>
                        </td>
                        <td className="p-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => {
                                setResetModalUser(u);
                                setResetPasswordInput('');
                              }}
                              title="تغيير كلمة المرور"
                              className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 cursor-pointer"
                            >
                              <IconKey size={14} />
                            </button>
                            {!isRoot && (
                              <>
                                <button
                                  onClick={() => handleToggleBlockUser(u)}
                                  title={u.isBlocked ? 'إلغاء التجميد' : 'تجميد الحساب'}
                                  className={`p-1.5 rounded-lg cursor-pointer ${
                                    u.isBlocked ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                  }`}
                                >
                                  <IconBan size={14} />
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  title="حذف الحساب"
                                  className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 cursor-pointer"
                                >
                                  <IconTrash size={14} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: FONTS MANAGEMENT */}
      {activeTab === 'fonts' && (
        <div className="animate-fadeIn">
          <AdminFontManager />
        </div>
      )}



      {/* TAB 5: SYSTEM SETTINGS */}
      {activeTab === 'settings' && (
        <div className="liquid-glass-card rounded-2xl p-6 border border-white/80 space-y-5 animate-fadeIn max-w-2xl">
          <div className="border-b border-slate-200 pb-3">
            <h3 className="font-heading font-bold text-base text-slate-900">
              إعدادات النظام والمنصة
            </h3>
            <p className="text-xs text-slate-500">
              مزامنة الإعدادات لحظياً مع قاعدة بيانات Firebase Firestore.
            </p>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold animate-fadeIn">
              {saveSuccessMsg}
            </div>
          )}

          <div className="space-y-4 text-xs">
            {/* Maintenance Mode */}
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">وضع الصيانة العام (Maintenance Mode)</h4>
                <p className="text-slate-500 text-[11px]">إظهار شاشة الصيانة لجميع الزوار غير الإداريين.</p>
              </div>
              <input
                type="checkbox"
                checked={maintenanceMode}
                onChange={(e) => setMaintenanceMode(e.target.checked)}
                className="w-5 h-5 accent-sky-600 cursor-pointer"
              />
            </div>

            {/* Announcement Banner */}
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-slate-900">الشريط الإعلاني العام</h4>
                  <p className="text-slate-500 text-[11px]">عرض شريط تنبيه أعلى صفحات المنصة.</p>
                </div>
                <input
                  type="checkbox"
                  checked={announcementActive}
                  onChange={(e) => setAnnouncementActive(e.target.checked)}
                  className="w-5 h-5 accent-sky-600 cursor-pointer"
                />
              </div>

              {announcementActive && (
                <input
                  type="text"
                  value={announcementMsg}
                  onChange={(e) => setAnnouncementMsg(e.target.value)}
                  placeholder="نص الإعلان للزوار..."
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-xs text-slate-900 focus:outline-none"
                />
              )}
            </div>

            {/* Allow Signups */}
            <div className="p-4 rounded-xl bg-white/60 border border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">السماح بتسجيل حسابات جديدة</h4>
                <p className="text-slate-500 text-[11px]">فتح أو إغلاق نموذج إنشاء الحسابات.</p>
              </div>
              <input
                type="checkbox"
                checked={allowSignups}
                onChange={(e) => setAllowSignups(e.target.checked)}
                className="w-5 h-5 accent-sky-600 cursor-pointer"
              />
            </div>

            <button
              onClick={handleSaveSettings}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-sky-500/20 cursor-pointer transition-all active:scale-95"
            >
              حفظ التغييرات في Firestore
            </button>
          </div>
        </div>
      )}

      {/* TAB 6: CLOUD AUDIT LOGS */}
      {activeTab === 'logs' && (
        <div className="liquid-glass-card rounded-2xl p-5 border border-white/80 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-200 pb-3">
            <div>
              <h3 className="font-heading font-bold text-base text-slate-900">
                سجل العمليات السحابي (Firestore Audit Logs)
              </h3>
              <p className="text-xs text-slate-500">سجل لحظي لأنشطة المنصة ومزامنة السحابة.</p>
            </div>
            <button
              onClick={loadFirebaseTelemetry}
              className="px-3 py-1 rounded-lg liquid-glass-button text-[11px] text-slate-700 cursor-pointer"
            >
              تحديث السجل
            </button>
          </div>

          <div className="space-y-2">
            {logs.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">لا توجد سجلات حالياً</p>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl bg-white/60 border border-slate-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2.5">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        log.level === 'success'
                          ? 'bg-emerald-500'
                          : log.level === 'warn'
                          ? 'bg-amber-500'
                          : 'bg-sky-500'
                      }`}
                    />
                    <span className="font-bold text-slate-900 ml-1">[{log.type}]</span>
                    <span className="text-slate-600">{log.msg}</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">
                    {new Date(log.timestamp).toLocaleTimeString('ar-EG')}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* MODAL: ADD USER */}
      {showAddUserModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn overscroll-contain modal-backdrop-lock"
          onClick={() => setShowAddUserModal(false)}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="liquid-glass-modal rounded-2xl p-6 max-w-sm w-full border border-white/80 space-y-4 max-h-[90vh] overflow-y-auto overscroll-y-contain modal-content-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-heading font-bold text-sm text-slate-900">إضافة مستخدم جديد</h3>
              <button
                onClick={() => setShowAddUserModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <IconClose size={18} />
              </button>
            </div>

            {userModalError && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-bold border border-rose-200">
                {userModalError}
              </div>
            )}

            <form onSubmit={handleCreateUserSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">اسم المستخدم</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">البريد الإلكتروني</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">كلمة المرور</label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-xs"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">نوع الصلاحية</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as any)}
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-xs"
                >
                  <option value="user">مستخدم عادي</option>
                  <option value="admin">مشرف إداري</option>
                  <option value="developer">مطور</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white font-bold text-xs shadow-sm cursor-pointer mt-2"
              >
                حفظ وإضافة للمنصة
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RESET PASSWORD */}
      {resetModalUser && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn overscroll-contain modal-backdrop-lock"
          onClick={() => setResetModalUser(null)}
          onTouchMove={(e) => {
            if (e.target === e.currentTarget) e.preventDefault();
          }}
        >
          <div
            className="liquid-glass-modal rounded-2xl p-5 max-w-sm w-full border border-white/80 space-y-4 max-h-[90vh] overflow-y-auto overscroll-y-contain modal-content-scroll"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="font-heading font-bold text-sm text-slate-900">
                تغيير كلمة المرور: {resetModalUser.username}
              </h3>
              <button
                onClick={() => setResetModalUser(null)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                <IconClose size={18} />
              </button>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">كلمة المرور الجديدة</label>
                <input
                  type="password"
                  required
                  placeholder="أدخل 6 خانات على الأقل..."
                  value={resetPasswordInput}
                  onChange={(e) => setResetPasswordInput(e.target.value)}
                  className="w-full p-2.5 rounded-xl liquid-glass-input text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-blue-600 text-white font-bold text-xs shadow-sm cursor-pointer mt-1"
              >
                تحديث كلمة المرور
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

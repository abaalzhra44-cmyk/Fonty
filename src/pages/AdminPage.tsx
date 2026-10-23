import React, { useState, useEffect, useCallback } from 'react';
import { AdminRouteGuard } from '../components/admin/AdminRouteGuard';
import { AdminOverviewTab } from '../components/admin/AdminOverviewTab';
import { AdminUsersTab } from '../components/admin/AdminUsersTab';
import { AdminProjectsTab } from '../components/admin/AdminProjectsTab';
import { AdminExportsTab } from '../components/admin/AdminExportsTab';
import { AdminAuditLogsTab } from '../components/admin/AdminAuditLogsTab';
import {
  fetchAdminDashboardStats,
  fetchAdminUsers,
  fetchAdminProjects,
  fetchPlatformSettings,
  savePlatformSettings,
  recordAdminAction,
  AdminDashboardStats,
  AdminUserRecord,
  AdminProjectRecord,
  PlatformSettings,
} from '../services/adminService';
import { useAuth } from '../context/AuthContext';
import { useScrollLock } from '../hooks/useScrollLock';
import {
  IconShield,
  IconUsers,
  IconFonts,
  IconDownload,
  IconActivity,
  IconSettings,
  IconRefresh,
  IconCheckCircle,
  IconAlert,
  IconSparkles,
  IconLock,
  IconGlobe,
  IconClose,
} from '../components/icons/Icons';

export const AdminPage: React.FC = () => {
  const { user, adminCreateUser } = useAuth();
  const [activeTab, setActiveTab] = useState<
    'overview' | 'users' | 'projects' | 'exports' | 'audit' | 'settings'
  >('overview');

  const [stats, setStats] = useState<AdminDashboardStats>({
    totalUsers: 0,
    totalProjects: 0,
    totalGlyphs: 0,
    totalExports: 0,
    colorFontsCount: 0,
    standardFontsCount: 0,
    isFirestoreConnected: false,
    lastUpdated: '',
  });

  const [users, setUsers] = useState<AdminUserRecord[]>([]);
  const [projects, setProjects] = useState<AdminProjectRecord[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    maintenanceMode: false,
    announcementMsg: '',
    allowSignups: true,
    primaryDomain: 'fonty.dev',
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Modal: Add user
  const [showAddUserModal, setShowAddUserModal] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState<'user' | 'admin' | 'developer'>('user');
  const [modalError, setModalError] = useState<string | null>(null);
  const [modalSuccess, setModalSuccess] = useState<string | null>(null);

  // Settings feedback
  const [settingsStatus, setSettingsStatus] = useState<string | null>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Lock scroll when modal is active
  useScrollLock(showAddUserModal);

  const loadAllAdminData = useCallback(async () => {
    try {
      const [statsData, usersData, projectsData, settingsData] = await Promise.all([
        fetchAdminDashboardStats(),
        fetchAdminUsers(),
        fetchAdminProjects(),
        fetchPlatformSettings(),
      ]);

      setStats(statsData);
      setUsers(usersData);
      setProjects(projectsData);
      setSettings(settingsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadAllAdminData();
  }, [loadAllAdminData]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadAllAdminData();
  };

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    setModalError(null);
    setModalSuccess(null);

    if (!newUsername.trim() || !newUserEmail.trim() || !newUserPassword) {
      setModalError('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    const res = adminCreateUser({
      username: newUsername.trim(),
      email: newUserEmail.trim(),
      passwordHash: newUserPassword,
      role: newUserRole,
    });

    if (!res.success) {
      setModalError(res.error || 'فشل إنشاء الحساب');
      return;
    }

    recordAdminAction(
      'USER_CREATED',
      `تم إنشاء حساب مستخدم جديد: ${newUserEmail.trim()} برتبة ${newUserRole}`,
      'success'
    );

    setModalSuccess('تم إنشاء الحساب بنجاح وإضافته لقاعدة البيانات');
    setNewUsername('');
    setNewUserEmail('');
    setNewUserPassword('');
    setTimeout(() => {
      setShowAddUserModal(false);
      setModalSuccess(null);
      handleRefresh();
    }, 1200);
  };

  const handleSaveSettings = async () => {
    setIsSavingSettings(true);
    setSettingsStatus(null);
    try {
      await savePlatformSettings(settings);
      setSettingsStatus('تم حفظ وتحديث إعدادات المنصة بنجاح!');
      setTimeout(() => setSettingsStatus(null), 3500);
    } catch {
      setSettingsStatus('فشل حفظ الإعدادات، يرجى التحقق من اتصال الشبكة.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  return (
    <AdminRouteGuard>
      <div className="min-h-screen pb-28 pt-4 px-3 sm:px-6 max-w-7xl mx-auto space-y-6 dir-rtl text-slate-900 font-body">
        {/* Top Header Card */}
        <div className="p-5 sm:p-7 rounded-3xl liquid-glass-card border border-white/80 shadow-xl shadow-sky-950/5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-sky-400/10 via-indigo-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-md shadow-sky-500/25">
                  <IconShield size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="font-heading font-black text-xl sm:text-2xl text-slate-900">
                      لوحة إدارة المنظومة
                    </h1>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-sky-500 text-white shadow-xs">
                      ADMIN HQ
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    متابعة الإحصائيات الحية، إدارة حسابات المستخدمين، مشاريع الخطوط، وضبط إعدادات المنصة
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions & Live Status Bar */}
            <div className="flex items-center flex-wrap gap-2.5">
              {/* Firestore Status Badge */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100/80 border border-slate-200/80 text-xs font-semibold text-slate-700">
                <span
                  className={`w-2 h-2 rounded-full ${
                    stats.isFirestoreConnected
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <span className="text-[11px]">
                  {stats.isFirestoreConnected
                    ? 'قاعدة البيانات السحابية متصلة'
                    : 'قاعدة البيانات: نمط العمل الهجين'}
                </span>
              </div>

              {/* Last update time */}
              {stats.lastUpdated && (
                <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
                  آخر تحديث: {stats.lastUpdated}
                </span>
              )}

              {/* Add User button */}
              <button
                type="button"
                onClick={() => setShowAddUserModal(true)}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-bold shadow-sm shadow-sky-600/20 hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <IconUsers size={15} />
                <span>إضافة مستخدم</span>
              </button>

              {/* Refresh button */}
              <button
                type="button"
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 rounded-xl bg-white/90 border border-slate-200 hover:bg-white text-slate-700 hover:text-slate-900 transition-all shadow-xs cursor-pointer disabled:opacity-50"
                title="تحديث البيانات"
                aria-label="تحديث البيانات"
              >
                <div className={isRefreshing ? 'animate-spin' : ''}>
                  <IconRefresh size={16} />
                </div>
              </button>
            </div>
          </div>

          {/* Navigation Tabs Bar */}
          <div className="mt-6 pt-4 border-t border-slate-200/70 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <IconSparkles size={15} />
              <span>نظرة عامة وإحصائيات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'users'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <IconUsers size={15} />
              <span>المستخدمين والصلاحيات ({users.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('projects')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'projects'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <IconFonts size={15} />
              <span>مشاريع الخطوط ({projects.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('exports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'exports'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <IconDownload size={15} />
              <span>سجلات التصدير ({stats.totalExports})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('audit')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'audit'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <IconActivity size={15} />
              <span>سجل الأمان والعمليات</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap ${
                activeTab === 'settings'
                  ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/30'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
              }`}
            >
              <IconSettings size={15} />
              <span>إعدادات المنظومة</span>
            </button>
          </div>
        </div>

        {/* Tab Contents */}
        {isLoading ? (
          <div className="p-12 text-center rounded-3xl liquid-glass-card border border-white/80 space-y-3">
            <div className="w-10 h-10 border-3 border-sky-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-600">
              جاري فحص وتجميع بيانات المنصة من السحابة والقواعد المحلية...
            </p>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && (
              <AdminOverviewTab
                stats={stats}
                projects={projects}
                onRefresh={handleRefresh}
                isLoading={isRefreshing}
              />
            )}

            {activeTab === 'users' && (
              <AdminUsersTab
                users={users}
                onRefresh={handleRefresh}
                currentAdminEmail={user?.email}
              />
            )}

            {activeTab === 'projects' && (
              <AdminProjectsTab projects={projects} onRefresh={handleRefresh} />
            )}

            {activeTab === 'exports' && <AdminExportsTab />}

            {activeTab === 'audit' && <AdminAuditLogsTab />}

            {activeTab === 'settings' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="p-5 sm:p-6 rounded-3xl liquid-glass-card border border-white/80 shadow-xs space-y-5">
                  <div className="flex items-center justify-between border-b border-slate-200/80 pb-4">
                    <div>
                      <h3 className="font-heading font-black text-base text-slate-900">
                        التحكم العام بالمنصة والخوادم
                      </h3>
                      <p className="text-xs text-slate-500">
                        التعديل هنا يؤثر مباشرة على تجربة جميع زوار ومصممي الموقع
                      </p>
                    </div>
                    {settingsStatus && (
                      <div className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
                        <IconCheckCircle size={14} />
                        <span>{settingsStatus}</span>
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Maintenance Mode */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900">وضع الصيانة العامة</h4>
                          <p className="text-[11px] text-slate-500">
                            حجب الواجهة عن الزوار العاديين وإظهار صفحة الصيانة
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.maintenanceMode}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                maintenanceMode: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-rose-600"></div>
                        </label>
                      </div>
                    </div>

                    {/* Allow Signups */}
                    <div className="p-4 rounded-2xl bg-white/70 border border-slate-200/80 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <h4 className="text-xs font-bold text-slate-900">فتح باب التسجيل الجديد</h4>
                          <p className="text-[11px] text-slate-500">
                            السماح للمستخدمين الجدد بإنشاء حسابات في Fonty
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={settings.allowSignups}
                            onChange={(e) =>
                              setSettings((prev) => ({
                                ...prev,
                                allowSignups: e.target.checked,
                              }))
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:right-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Broadcast Banner */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      شريط التنبيه العام (Broadcast Announcement)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.announcementMsg}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          announcementMsg: e.target.value,
                        }))
                      }
                      placeholder="أدخل رسالة تظهر كشريط علوي لجميع المستخدمين في المنصة (اتركه فارغاً للإلغاء)..."
                      className="w-full p-3 rounded-xl liquid-glass-input text-xs text-slate-800 placeholder:text-slate-400"
                    />
                  </div>

                  {/* Save button */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveSettings}
                      disabled={isSavingSettings}
                      className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white text-xs font-bold shadow-md shadow-sky-600/20 hover:opacity-95 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {isSavingSettings ? 'جاري الحفظ والمزامنة...' : 'حفظ ونشر التعديلات'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* MODAL: ADD USER */}
        {showAddUserModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md animate-fadeIn overscroll-contain modal-backdrop-lock"
            onClick={() => setShowAddUserModal(false)}
          >
            <div
              className="liquid-glass-modal rounded-3xl p-6 w-full max-w-md border border-white/80 shadow-2xl relative space-y-4 max-h-[90vh] overflow-y-auto overscroll-y-contain modal-content-scroll"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-slate-200/70 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center">
                    <IconUsers size={16} />
                  </div>
                  <h3 className="font-heading font-black text-sm text-slate-900">
                    إنشاء حساب مستخدم جديد
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAddUserModal(false)}
                  className="w-7 h-7 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <IconClose size={14} />
                </button>
              </div>

              {modalError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                  <IconAlert size={14} />
                  <span>{modalError}</span>
                </div>
              )}

              {modalSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-2">
                  <IconCheckCircle size={14} />
                  <span>{modalSuccess}</span>
                </div>
              )}

              <form onSubmit={handleCreateUser} className="space-y-3.5 text-xs">
                <div>
                  <label className="block text-slate-700 font-bold mb-1">اسم المستخدم</label>
                  <input
                    type="text"
                    required
                    value={newUsername}
                    onChange={(e) => setNewUsername(e.target.value)}
                    placeholder="مثال: أحمد الخطاط"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">البريد الإلكتروني</label>
                  <input
                    type="email"
                    required
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    placeholder="name@domain.com"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">كلمة المرور</label>
                  <input
                    type="password"
                    required
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 font-bold mb-1">رتبة الحساب والصلاحيات</label>
                  <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl liquid-glass-input text-slate-800"
                  >
                    <option value="user">مستخدم عادي (مصمم خطوط)</option>
                    <option value="admin">مشرف إدارة (Admin)</option>
                    <option value="developer">مطور نظام (Developer)</option>
                  </select>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowAddUserModal(false)}
                    className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold transition-all cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 text-white font-bold shadow-md shadow-sky-600/20 hover:opacity-95 transition-all cursor-pointer"
                  >
                    تأكيد الإنشاء
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminRouteGuard>
  );
};
export default AdminPage;

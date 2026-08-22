import React, { useState, useEffect } from 'react';
import {
  UserAccount,
  getAllUserAccounts,
  deleteUserAccount,
  createUserAccount,
  wipeEntireDatabase,
} from '../utils/userManagement';
import {
  IconTrash,
  IconPlus,
  IconSparkles,
  IconCheck,
  IconAlert,
  IconUsers,
  IconDevice,
  IconGlobe,
} from './icons/Icons';

export const DeveloperUserManagement: React.FC = () => {
  const [users, setUsers] = useState<UserAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<'developer' | 'admin' | 'user'>('user');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isWiping, setIsWiping] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    const accounts = await getAllUserAccounts();
    setUsers(accounts);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDeleteUser = async (userId: string) => {
    const success = await deleteUserAccount(userId);
    if (success) {
      setUsers((prev) => prev.filter((u) => u.id !== userId));
      setNotice('تم حذف حساب المستخدم ومسح بياناته بنجاح بواسطة المطور.');
      setConfirmDeleteId(null);
      setTimeout(() => setNotice(null), 3000);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserEmail || !newUserName) return;

    await createUserAccount({
      email: newUserEmail,
      name: newUserName,
      role: newUserRole,
      projectsCount: 0,
    });

    setNewUserEmail('');
    setNewUserName('');
    setIsAddingUser(false);
    setNotice('تم إضافة حساب المستخدم الجديد بنجاح.');
    setTimeout(() => setNotice(null), 3000);
    loadUsers();
  };

  const handleWipeDatabase = async () => {
    if (!window.confirm('هل أنت أخيرًا متأكد من حذف وإعادة ضبط قاعدة البيانات الحالية بالكامل؟ لا يمكن التراجع عن هذا الإجراء.')) {
      return;
    }

    setIsWiping(true);
    await wipeEntireDatabase();
    setUsers([]);
    setIsWiping(false);
    setNotice('تم مسح وإعادة ضبط قاعدة البيانات الحالية بالكامل بنجاح!');
    setTimeout(() => {
      window.location.reload();
    }, 1500);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-sm">
      {/* Panel Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold text-lg">
            <IconUsers size={20} />
          </div>
          <div>
            <h3 className="font-heading font-bold text-lg text-slate-900">
              إدارة وحذف حسابات المستخدمين للمطورين (Developer User Account Portal)
            </h3>
            <p className="font-body text-xs text-slate-500">
              تمكين المطورين والمسؤولين من عرض وتتبع وحذف حسابات المستخدمين بالكامل
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setIsAddingUser(!isAddingUser)}
            className="px-3.5 py-2 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <IconPlus size={16} />
            <span>إضافة حساب اختبار</span>
          </button>

          <button
            type="button"
            onClick={handleWipeDatabase}
            disabled={isWiping}
            className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 text-xs font-bold transition-all flex items-center gap-1.5 border border-rose-200"
            title="حذف جميع البيانات وقواعد البيانات الحالية"
          >
            <IconTrash size={16} />
            <span>حذف قاعدة البيانات الحالية</span>
            <IconAlert size={14} className="text-rose-500" />
          </button>
        </div>
      </div>

      {notice && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center gap-2">
          <IconCheck size={16} />
          <span>{notice}</span>
        </div>
      )}

      {/* Add User Modal/Form */}
      {isAddingUser && (
        <form onSubmit={handleCreateUser} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
          <h4 className="text-xs font-bold text-slate-800">
            إنشاء حساب مستخدم جديد:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="الاسم الكامل"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              required
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
            />
            <input
              type="email"
              placeholder="البريد الإلكتروني"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              required
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
            />
            <select
              value={newUserRole}
              onChange={(e: any) => setNewUserRole(e.target.value)}
              className="px-3 py-2 text-xs bg-white border border-slate-200 rounded-lg text-slate-900"
            >
              <option value="user">مستخدم عادي (User)</option>
              <option value="developer">مطور (Developer)</option>
              <option value="admin">مسؤول نظام (Admin)</option>
            </select>
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsAddingUser(false)}
              className="px-3 py-1.5 text-xs text-slate-500 font-bold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold"
            >
              حفظ الحساب
            </button>
          </div>
        </form>
      )}

      {/* Users Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-500">جاري تحميل حسابات المستخدمين...</div>
        ) : users.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500">لا توجد حسابات مستخدمين حالياً.</div>
        ) : (
          <table className="w-full text-right text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-400 font-bold">
                <th className="pb-3 px-2">المستخدم</th>
                <th className="pb-3 px-2">البريد الإلكتروني</th>
                <th className="pb-3 px-2">نوع الجهاز (Device)</th>
                <th className="pb-3 px-2">عنوان IP</th>
                <th className="pb-3 px-2">الرتبة / الصلاحية</th>
                <th className="pb-3 px-2">تاريخ التسجيل</th>
                <th className="pb-3 px-2 text-center">إجراء المطور (حذف الحساب)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-2 font-bold text-slate-900">
                    {user.name}
                  </td>
                  <td className="py-3 px-2 font-mono text-slate-600">
                    {user.email}
                  </td>
                  <td className="py-3 px-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60">
                      <IconDevice size={13} className="text-sky-600 shrink-0" />
                      <span>{user.deviceType || 'متصفح ويب (سطح المكتب)'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono dir-ltr text-right">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-bold border border-indigo-100">
                      <IconGlobe size={12} className="text-indigo-500" />
                      <span>{user.ipAddress || '197.38.112.42'}</span>
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        user.role === 'developer'
                          ? 'bg-purple-100 text-purple-700'
                          : user.role === 'admin'
                          ? 'bg-amber-100 text-amber-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {user.role === 'developer'
                        ? 'مطور (Developer)'
                        : user.role === 'admin'
                        ? 'مسؤول (Admin)'
                        : 'مستخدم (User)'}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('ar-EG')}
                  </td>
                  <td className="py-3 px-2 text-center">
                    {confirmDeleteId === user.id ? (
                      <div className="flex items-center justify-center gap-1.5">
                        <span className="text-[10px] text-rose-500 font-bold">حذف الحساب نهائياً؟</span>
                        <button
                          type="button"
                          onClick={() => handleDeleteUser(user.id)}
                          className="px-2 py-1 bg-rose-600 text-white rounded text-[10px] font-bold"
                        >
                          تأكيد الحذف
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(null)}
                          className="px-2 py-1 bg-slate-200 text-slate-700 rounded text-[10px] font-bold"
                        >
                          تراجع
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(user.id)}
                        className="px-2.5 py-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 text-[11px] font-bold flex items-center justify-center gap-1 mx-auto transition-colors"
                        title="حذف حساب المستخدم نهائياً بواسطة المطور"
                      >
                        <IconTrash size={14} />
                        <span>حذف الحساب</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

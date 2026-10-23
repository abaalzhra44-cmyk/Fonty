import React, { useState } from 'react';
import {
  AdminUserRecord,
  updateUserRole,
  toggleUserBlock,
  deleteUserAccountAdmin,
} from '../../services/adminService';
import { useScrollLock } from '../../hooks/useScrollLock';
import {
  IconSearch,
  IconShield,
  IconBan,
  IconCheckCircle,
  IconTrash,
  IconCrown,
  IconClose,
} from '../icons/Icons';

interface AdminUsersTabProps {
  users: AdminUserRecord[];
  onRefresh: () => void;
  currentAdminEmail?: string;
}

export const AdminUsersTab: React.FC<AdminUsersTabProps> = ({
  users,
  onRefresh,
  currentAdminEmail,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'user' | 'admin' | 'developer'>('all');
  const [selectedUser, setSelectedUser] = useState<AdminUserRecord | null>(null);
  const [editRoleUser, setEditRoleUser] = useState<AdminUserRecord | null>(null);
  const [newRoleSelection, setNewRoleSelection] = useState<'user' | 'admin' | 'developer'>('user');
  const [deleteTargetUser, setDeleteTargetUser] = useState<AdminUserRecord | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lock scroll when modals are active
  useScrollLock(!!editRoleUser || !!deleteTargetUser);

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleRoleChange = async () => {
    if (!editRoleUser) return;
    setIsProcessing(true);
    setActionError(null);
    try {
      await updateUserRole(editRoleUser.id, newRoleSelection);
      setEditRoleUser(null);
      onRefresh();
    } catch {
      setActionError('فشل تحديث رتبة المستخدم. يرجى المحاولة مرة أخرى.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleBlock = async (user: AdminUserRecord) => {
    // Prevent self-block
    if (user.email === currentAdminEmail || user.email === 'abaalzhra44@gmail.com') {
      alert('لا يمكن حظر حساب المشرف الرئيسي للمنصة.');
      return;
    }

    try {
      await toggleUserBlock(user.id, !user.isBlocked);
      onRefresh();
    } catch {
      alert('تعذر تغيير حالة حظر المستخدم.');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetUser) return;
    if (deleteTargetUser.email === currentAdminEmail || deleteTargetUser.email === 'abaalzhra44@gmail.com') {
      setActionError('لا يمكن حذف حساب المشرف الأساسي للمنظومة.');
      return;
    }

    setIsProcessing(true);
    try {
      await deleteUserAccountAdmin(deleteTargetUser.id);
      setDeleteTargetUser(null);
      onRefresh();
    } catch {
      setActionError('تعذر حذف الحساب.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search and Filters Bar */}
      <div className="p-3.5 sm:p-4 rounded-2xl liquid-glass-card border border-white/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="البحث بالاسم أو البريد الإلكتروني..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-4 pr-10 py-2 rounded-xl liquid-glass-input text-xs text-slate-800 placeholder:text-slate-400"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
            <IconSearch size={16} />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-bold whitespace-nowrap">الرتبة:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl liquid-glass-input text-xs text-slate-800"
          >
            <option value="all">الكل ({users.length})</option>
            <option value="user">مستخدم عادي</option>
            <option value="admin">مشرف إداري</option>
            <option value="developer">مطور</option>
          </select>
        </div>
      </div>

      {/* Users Table / Cards Container */}
      <div className="rounded-2xl liquid-glass-card border border-white/80 overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200/80 text-slate-600 font-bold">
              <tr>
                <th className="p-3 sm:p-4">المستخدم</th>
                <th className="p-3 sm:p-4">البريد الإلكتروني</th>
                <th className="p-3 sm:p-4">الرتبة والصلاحية</th>
                <th className="p-3 sm:p-4">الحالة</th>
                <th className="p-3 sm:p-4">تاريخ التسجيل</th>
                <th className="p-3 sm:p-4 text-center">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    لا يوجد مستخدمون مطابقون لمعايير البحث الحالية.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const isProtected =
                    u.email === 'abaalzhra44@gmail.com' ||
                    u.email === 'admin@fonty.dev' ||
                    u.email === currentAdminEmail;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 sm:p-4 font-bold text-slate-900 flex items-center gap-2">
                        {u.role === 'developer' ? (
                          <IconCrown size={15} className="text-purple-600 shrink-0" />
                        ) : u.role === 'admin' ? (
                          <IconShield size={15} className="text-amber-500 shrink-0" />
                        ) : (
                          <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0" />
                        )}
                        <span className="truncate max-w-[140px]">{u.username}</span>
                      </td>

                      <td className="p-3 sm:p-4 font-mono text-[11px] text-slate-600">
                        {u.email || '-'}
                      </td>

                      <td className="p-3 sm:p-4">
                        <button
                          type="button"
                          onClick={() => {
                            setEditRoleUser(u);
                            setNewRoleSelection(u.role);
                          }}
                          disabled={isProtected}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            u.role === 'developer'
                              ? 'bg-purple-50 text-purple-700 border-purple-200'
                              : u.role === 'admin'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                          } ${isProtected ? 'opacity-70 cursor-not-allowed' : ''}`}
                          title={isProtected ? 'حساب أساسي محمي' : 'تغيير الرتبة'}
                        >
                          {u.role === 'developer'
                            ? 'مطور رئيسي'
                            : u.role === 'admin'
                            ? 'مشرف إداري'
                            : 'مستخدم عادي'}
                        </button>
                      </td>

                      <td className="p-3 sm:p-4">
                        {u.isBlocked ? (
                          <span className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[10px] font-bold">
                            محظور
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                            نشط
                          </span>
                        )}
                      </td>

                      <td className="p-3 sm:p-4 text-slate-500 text-[11px]">
                        {new Date(u.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </td>

                      <td className="p-3 sm:p-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleBlock(u)}
                            disabled={isProtected}
                            className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                              u.isBlocked
                                ? 'bg-emerald-50 text-emerald-600 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200'
                            } ${isProtected ? 'opacity-30 cursor-not-allowed' : ''}`}
                            title={u.isBlocked ? 'إلغاء الحظر' : 'حظر الحساب'}
                          >
                            {u.isBlocked ? <IconCheckCircle size={14} /> : <IconBan size={14} />}
                          </button>

                          <button
                            type="button"
                            onClick={() => setDeleteTargetUser(u)}
                            disabled={isProtected}
                            className={`p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 transition-colors cursor-pointer ${
                              isProtected ? 'opacity-30 cursor-not-allowed' : ''
                            }`}
                            title="حذف الحساب"
                          >
                            <IconTrash size={14} />
                          </button>
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

      {/* MODAL: EDIT ROLE */}
      {editRoleUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn overscroll-contain modal-backdrop-lock"
          onClick={() => setEditRoleUser(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-heading font-extrabold text-sm text-slate-900">
                تعديل رتبة المستخدم: {editRoleUser.username}
              </h3>
              <button
                onClick={() => setEditRoleUser(null)}
                className="w-7 h-7 rounded-lg text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                <IconClose size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block text-slate-600 font-bold">حدد الصلاحية الجديدة:</label>
              <select
                value={newRoleSelection}
                onChange={(e) => setNewRoleSelection(e.target.value as any)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50"
              >
                <option value="user">مستخدم عادي (User)</option>
                <option value="admin">مشرف إداري (Admin)</option>
                <option value="developer">مطور المنظومة (Developer)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditRoleUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleRoleChange}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md hover:bg-sky-500 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'جاري الحفظ...' : 'حفظ التعديل'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELETE CONFIRM */}
      {deleteTargetUser && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-fadeIn overscroll-contain modal-backdrop-lock"
          onClick={() => setDeleteTargetUser(null)}
        >
          <div
            className="w-full max-w-sm rounded-3xl bg-white p-5 sm:p-6 shadow-2xl border border-rose-100 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
                <IconTrash size={20} />
              </div>
              <h3 className="font-heading font-extrabold text-sm text-slate-900">
                تأكيد حذف الحساب
              </h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              هل أنت متأكد من حذف حساب المستخدم <strong>{deleteTargetUser.username}</strong> ({deleteTargetUser.email}) نهائياً؟ هذا الإجراء لا يمكن التراجع عنه.
            </p>

            <div className="pt-2 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTargetUser(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-bold text-xs hover:bg-slate-200 transition-colors"
              >
                تراجع
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={isProcessing}
                className="px-5 py-2 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-md hover:bg-rose-500 transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'جاري الحذف...' : 'تأكيد الحذف النهائي'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

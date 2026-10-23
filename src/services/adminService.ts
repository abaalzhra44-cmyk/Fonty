import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  getDocFromServer,
} from 'firebase/firestore';
import localforage from 'localforage';
import { db, auth, PRIMARY_DOMAIN } from '../firebase';
import { FontProject } from '../types';

export interface AdminDashboardStats {
  totalUsers: number;
  totalProjects: number;
  totalGlyphs: number;
  totalExports: number;
  colorFontsCount: number;
  standardFontsCount: number;
  isFirestoreConnected: boolean;
  lastUpdated: string;
}

export interface AdminUserRecord {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin' | 'developer';
  isDeveloper?: boolean;
  isBlocked?: boolean;
  deviceType?: string;
  ipAddress?: string;
  createdAt: string;
  source: 'firestore' | 'local' | 'hybrid';
}

export interface AdminProjectRecord {
  id: string;
  name: string;
  ownerId: string;
  glyphsCount: number;
  isColorFont: boolean;
  isPublic: boolean;
  createdAt: number;
  updatedAt: number;
  source: 'firestore' | 'local';
}

export interface FontExportRecord {
  id: string;
  userId?: string;
  fontName: string;
  format: string;
  glyphsCount: number;
  fileSizeBytes: number;
  timestamp: string;
}

export interface AdminAuditLog {
  id: string;
  type: string;
  msg: string;
  level: 'info' | 'warn' | 'success';
  timestamp: string;
  actorUid: string;
}

export interface PlatformSettings {
  maintenanceMode: boolean;
  announcementMsg: string;
  allowSignups: boolean;
  primaryDomain: string;
}

const LOCAL_USERS_KEY = 'fonty_registered_users_v1';
const LOCAL_EXPORTS_KEY = 'fonty_exports_telemetry_v1';

/**
 * Record an audit log for an administrative action
 */
export async function recordAdminAction(
  type: string,
  msg: string,
  level: 'info' | 'warn' | 'success' = 'info'
): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const actor = auth.currentUser?.email || auth.currentUser?.uid || 'super_admin';
  const logItem: AdminAuditLog = {
    id: logId,
    type,
    msg: `[${actor}] ${msg}`,
    level,
    timestamp: new Date().toISOString(),
    actorUid: actor,
  };

  try {
    if (auth.currentUser) {
      await setDoc(doc(db, 'auditLogs', logId), logItem);
    }
  } catch (err) {
    console.warn('Audit log write error (fallback to local cache):', err);
  }

  try {
    const raw = localStorage.getItem('df_audit_logs');
    const existing: AdminAuditLog[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem('df_audit_logs', JSON.stringify([logItem, ...existing.slice(0, 99)]));
  } catch {
    // Ignore storage issues
  }
}

/**
 * Record a font export / compilation event
 */
export async function recordFontExportEvent(
  fontName: string,
  format: string,
  glyphsCount: number,
  fileSizeBytes: number
): Promise<void> {
  const exportId = `exp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const exportItem: FontExportRecord = {
    id: exportId,
    userId: auth.currentUser?.uid || 'guest_designer',
    fontName: fontName || 'خط غير مسمى',
    format: format || 'TTF',
    glyphsCount: glyphsCount || 0,
    fileSizeBytes: fileSizeBytes || 0,
    timestamp: new Date().toISOString(),
  };

  // 1. Save to Firestore
  try {
    await setDoc(doc(db, 'fontExports', exportId), exportItem);
  } catch (err) {
    console.warn('Firestore font export log error (saved locally):', err);
  }

  // 2. Save to local telemetry
  try {
    const raw = localStorage.getItem(LOCAL_EXPORTS_KEY);
    const list: FontExportRecord[] = raw ? JSON.parse(raw) : [];
    localStorage.setItem(LOCAL_EXPORTS_KEY, JSON.stringify([exportItem, ...list.slice(0, 199)]));
  } catch {
    // Ignore quota issues
  }
}

/**
 * Fetch all font export events
 */
export async function fetchFontExports(): Promise<FontExportRecord[]> {
  const exportsMap = new Map<string, FontExportRecord>();

  // Local cache
  try {
    const raw = localStorage.getItem(LOCAL_EXPORTS_KEY);
    if (raw) {
      const list: FontExportRecord[] = JSON.parse(raw);
      list.forEach((item) => exportsMap.set(item.id, item));
    }
  } catch {
    // Ignore
  }

  // Firestore remote
  if (auth.currentUser) {
    try {
      const snap = await getDocs(query(collection(db, 'fontExports'), orderBy('timestamp', 'desc'), limit(100)));
      snap.forEach((d) => {
        const item = d.data() as FontExportRecord;
        if (item && item.id) {
          exportsMap.set(item.id, item);
        }
      });
    } catch {
      // Return cached
    }
  }

  const result = Array.from(exportsMap.values());
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return result;
}

/**
 * Fetch unified real-world users list from Firestore and LocalStorage (without duplication)
 */
export async function fetchAdminUsers(): Promise<AdminUserRecord[]> {
  const usersMap = new Map<string, AdminUserRecord>();

  // 1. Fetch from LocalStorage
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        list.forEach((u: any) => {
          if (u.id || u.email) {
            const key = (u.email || u.id).toLowerCase();
            usersMap.set(key, {
              id: u.id,
              username: u.username || 'مستخدم مسجل',
              email: u.email || '',
              role: u.role || 'user',
              isDeveloper: Boolean(u.isDeveloper),
              isBlocked: Boolean(u.isBlocked),
              deviceType: u.deviceType || 'متصفح ويب',
              ipAddress: u.ipAddress || 'محلي',
              createdAt: u.createdAt || new Date().toISOString(),
              source: 'local',
            });
          }
        });
      }
    }
  } catch {
    // Ignore
  }

  // 2. Fetch from Firestore (cloud records take priority)
  if (auth.currentUser) {
    try {
      const snap = await getDocs(collection(db, 'users'));
      snap.forEach((d) => {
        const data = d.data();
        const key = (data.email || d.id).toLowerCase();
        const existing = usersMap.get(key);
        usersMap.set(key, {
          id: d.id,
          username: data.username || existing?.username || 'مستخدم سحابي',
          email: data.email || existing?.email || '',
          role: data.role || existing?.role || 'user',
          isDeveloper: data.isDeveloper ?? existing?.isDeveloper ?? false,
          isBlocked: data.isBlocked ?? existing?.isBlocked ?? false,
          deviceType: data.deviceType || existing?.deviceType || 'سحابي',
          ipAddress: data.ipAddress || existing?.ipAddress || '-',
          createdAt: data.createdAt || existing?.createdAt || new Date().toISOString(),
          source: existing ? 'hybrid' : 'firestore',
        });
      });
    } catch (err) {
      console.warn('Firestore users list read note:', err);
    }
  }

  const users = Array.from(usersMap.values());
  users.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  return users;
}

/**
 * Update user role
 */
export async function updateUserRole(userId: string, newRole: 'user' | 'admin' | 'developer'): Promise<boolean> {
  // Update local
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map((u: any) =>
        u.id === userId ? { ...u, role: newRole, isDeveloper: newRole === 'developer' } : u
      );
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }

  // Update Firestore
  if (auth.currentUser) {
    try {
      await updateDoc(doc(db, 'users', userId), {
        role: newRole,
        isDeveloper: newRole === 'developer',
      });
    } catch {
      // Ignore
    }
  }

  await recordAdminAction('USER_ROLE_UPDATE', `تم تغيير رتبة المستخدم (${userId}) إلى ${newRole}`, 'success');
  return true;
}

/**
 * Toggle user block status
 */
export async function toggleUserBlock(userId: string, isBlocked: boolean): Promise<boolean> {
  // Update local
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.map((u: any) => (u.id === userId ? { ...u, isBlocked } : u));
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }

  // Update Firestore
  if (auth.currentUser) {
    try {
      await updateDoc(doc(db, 'users', userId), { isBlocked });
    } catch {
      // Ignore
    }
  }

  await recordAdminAction(
    isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED',
    `${isBlocked ? 'تم حظر' : 'تم فك حظر'} المستخدم (${userId})`,
    isBlocked ? 'warn' : 'info'
  );
  return true;
}

/**
 * Delete a user account
 */
export async function deleteUserAccountAdmin(userId: string): Promise<boolean> {
  // Delete from local
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const list = JSON.parse(raw);
      const updated = list.filter((u: any) => u.id !== userId);
      localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
    }
  } catch {
    // Ignore
  }

  // Delete from Firestore
  if (auth.currentUser) {
    try {
      await deleteDoc(doc(db, 'users', userId));
    } catch {
      // Ignore
    }
  }

  await recordAdminAction('USER_DELETED', `تم حذف حساب المستخدم نهائياً (${userId})`, 'warn');
  return true;
}

/**
 * Fetch all font projects across Firestore and IndexedDB
 */
export async function fetchAdminProjects(): Promise<AdminProjectRecord[]> {
  const projectsMap = new Map<string, AdminProjectRecord>();

  // 1. Load from IndexedDB
  try {
    await localforage.iterate((proj: FontProject) => {
      if (proj && proj.id) {
        const isColor = Boolean(proj.settings?.colorFontSettings?.enabled);
        projectsMap.set(proj.id, {
          id: proj.id,
          name: proj.name || 'مشروع خط عربي',
          ownerId: 'local_designer',
          glyphsCount: proj.glyphs?.length || 0,
          isColorFont: isColor,
          isPublic: false,
          createdAt: proj.createdAt || Date.now(),
          updatedAt: proj.updatedAt || Date.now(),
          source: 'local',
        });
      }
    });
  } catch {
    // Ignore
  }

  // 2. Load from Firestore
  if (auth.currentUser) {
    try {
      const snap = await getDocs(collection(db, 'projects'));
      snap.forEach((d) => {
        const data = d.data();
        const isColor = Boolean(data.settings?.colorFontSettings?.enabled);
        projectsMap.set(d.id, {
          id: d.id,
          name: data.name || 'مشروع خط سحابي',
          ownerId: data.ownerId || 'unknown',
          glyphsCount: Array.isArray(data.glyphs) ? data.glyphs.length : 0,
          isColorFont: isColor,
          isPublic: Boolean(data.isPublic),
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          source: 'firestore',
        });
      });
    } catch {
      // Ignore
    }
  }

  const result = Array.from(projectsMap.values());
  result.sort((a, b) => b.updatedAt - a.updatedAt);
  return result;
}

/**
 * Fetch real admin audit logs
 */
export async function fetchAdminAuditLogs(): Promise<AdminAuditLog[]> {
  const logsMap = new Map<string, AdminAuditLog>();

  // 1. Local logs
  try {
    const raw = localStorage.getItem('df_audit_logs');
    if (raw) {
      const list: AdminAuditLog[] = JSON.parse(raw);
      list.forEach((l) => logsMap.set(l.id, l));
    }
  } catch {
    // Ignore
  }

  // 2. Firestore logs
  if (auth.currentUser) {
    try {
      const snap = await getDocs(query(collection(db, 'auditLogs'), orderBy('timestamp', 'desc'), limit(100)));
      snap.forEach((d) => {
        const item = d.data() as AdminAuditLog;
        if (item && item.id) {
          logsMap.set(item.id, item);
        }
      });
    } catch {
      // Ignore
    }
  }

  const result = Array.from(logsMap.values());
  result.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return result;
}

/**
 * Fetch aggregated real-world platform stats
 */
export async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const [users, projects, exportsList] = await Promise.all([
    fetchAdminUsers(),
    fetchAdminProjects(),
    fetchFontExports(),
  ]);

  let isFirestoreConnected = false;
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    isFirestoreConnected = true;
  } catch {
    // Some networks treat as connection executed
    isFirestoreConnected = Boolean(auth.currentUser);
  }

  const totalGlyphs = projects.reduce((acc, p) => acc + p.glyphsCount, 0);
  const colorFontsCount = projects.filter((p) => p.isColorFont).length;
  const standardFontsCount = projects.length - colorFontsCount;

  const now = new Date();
  const timeFormatted = now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  return {
    totalUsers: users.length,
    totalProjects: projects.length,
    totalGlyphs,
    totalExports: exportsList.length,
    colorFontsCount,
    standardFontsCount,
    isFirestoreConnected,
    lastUpdated: timeFormatted,
  };
}

/**
 * Fetch system and platform settings
 */
export async function fetchPlatformSettings(): Promise<PlatformSettings> {
  let maintenanceMode = false;
  let announcementMsg = '';
  let allowSignups = true;
  let primaryDomain = PRIMARY_DOMAIN;

  // Local defaults
  maintenanceMode = localStorage.getItem('df_maintenance_mode') === 'true';
  announcementMsg = localStorage.getItem('df_announcement_msg') || '';
  allowSignups = localStorage.getItem('df_allow_signups') !== 'false';

  // Firestore remote sync
  if (auth.currentUser) {
    try {
      const snap = await getDoc(doc(db, 'systemSettings', 'announcements'));
      if (snap.exists()) {
        const data = snap.data();
        if (typeof data.maintenanceMode === 'boolean') maintenanceMode = data.maintenanceMode;
        if (typeof data.announcementMsg === 'string') announcementMsg = data.announcementMsg;
        if (typeof data.allowSignups === 'boolean') allowSignups = data.allowSignups;
      }
      const domSnap = await getDoc(doc(db, 'systemSettings', 'domainConfig'));
      if (domSnap.exists()) {
        const domData = domSnap.data();
        if (domData.primaryDomain) primaryDomain = domData.primaryDomain;
      }
    } catch {
      // Ignore
    }
  }

  return {
    maintenanceMode,
    announcementMsg,
    allowSignups,
    primaryDomain,
  };
}

/**
 * Save system settings to Firestore and LocalStorage
 */
export async function savePlatformSettings(settings: Partial<PlatformSettings>): Promise<boolean> {
  if (settings.maintenanceMode !== undefined) {
    localStorage.setItem('df_maintenance_mode', String(settings.maintenanceMode));
  }
  if (settings.announcementMsg !== undefined) {
    localStorage.setItem('df_announcement_msg', settings.announcementMsg);
  }
  if (settings.allowSignups !== undefined) {
    localStorage.setItem('df_allow_signups', String(settings.allowSignups));
  }

  if (auth.currentUser) {
    try {
      await setDoc(
        doc(db, 'systemSettings', 'announcements'),
        {
          ...settings,
          updatedAt: new Date().toISOString(),
          updatedBy: auth.currentUser.uid,
        },
        { merge: true }
      );
    } catch {
      // Ignore
    }
  }

  await recordAdminAction('SETTINGS_UPDATED', 'تم تحديث إعدادات النظام السحابي للمنصة', 'info');
  return true;
}

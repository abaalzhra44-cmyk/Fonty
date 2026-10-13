import { doc, setDoc, getDocs, collection, query, where, deleteDoc } from 'firebase/firestore';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

export interface SupportMessage {
  id: string;
  sender: 'user' | 'admin' | 'system';
  senderName: string;
  senderRole?: string;
  text: string;
  timestamp: string;
  isRead?: boolean;
}

export interface SupportThread {
  id: string;
  userId?: string;
  userName: string;
  userEmail?: string;
  userRole?: string;
  status: 'open' | 'pending' | 'resolved';
  unreadCount: number;
  lastMessage: string;
  updatedAt: string;
  adminNotes?: string;
  messages: SupportMessage[];
}

const THREADS_KEY = 'fonty_support_threads_v1';
export const SUPPORT_UPDATE_EVENT = 'fonty_support_updated';

const DEFAULT_INITIAL_THREADS: SupportThread[] = [
  {
    id: 'thread_guest_1',
    userId: 'user_guest_1',
    userName: 'أحمد الخطاط',
    userEmail: 'ahmed.khattat@example.com',
    userRole: 'خطاط محترف',
    status: 'pending',
    unreadCount: 2,
    lastMessage: 'كيف يمكنني إضافة تركيب لقطة "لا" المركبة في الخط الرقعة مع قواعد GSUB؟',
    updatedAt: new Date(Date.now() - 5 * 60 * 1000).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    messages: [
      {
        id: 'msg_g1_1',
        sender: 'system',
        senderName: 'فريق الدعم الفني',
        text: 'مرحباً بك في منصة Fonty فونتي! كيف يمكننا مساعدتك اليوم في تصميم أو تصدير خطوطك؟',
        timestamp: '10:00 ص',
      },
      {
        id: 'msg_g1_2',
        sender: 'user',
        senderName: 'أحمد الخطاط',
        text: 'السلام عليكم، أعمل على خط رقعة عربي وأريد ربط حرفي اللام والألف كبديل دائم.',
        timestamp: '10:12 ص',
      },
      {
        id: 'msg_g1_3',
        sender: 'user',
        senderName: 'أحمد الخطاط',
        text: 'كيف يمكنني إضافة تركيب لقطة "لا" المركبة في الخط الرقعة مع قواعد GSUB؟',
        timestamp: '10:14 ص',
      },
    ],
  },
  {
    id: 'thread_guest_2',
    userId: 'user_guest_2',
    userName: 'مها علي',
    userEmail: 'maha.design@example.com',
    userRole: 'مصممة تايبوجرافي',
    status: 'open',
    unreadCount: 1,
    lastMessage: 'هل يمكن تصدير الخط بصيغة OTF تدعم أشكال البداية والوسط والنهاية تلقائياً؟',
    updatedAt: new Date(Date.now() - 30 * 60 * 1000).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    messages: [
      {
        id: 'msg_g2_1',
        sender: 'system',
        senderName: 'فريق الدعم الفني',
        text: 'مرحباً بك في منصة Fonty فونتي! كيف يمكننا مساعدتك؟',
        timestamp: '09:30 ص',
      },
      {
        id: 'msg_g2_2',
        sender: 'user',
        senderName: 'مها علي',
        text: 'هل يمكن تصدير الخط بصيغة OTF تدعم أشكال البداية والوسط والنهاية تلقائياً؟',
        timestamp: '09:45 ص',
      },
    ],
  },
  {
    id: 'thread_guest_3',
    userId: 'user_guest_3',
    userName: 'سارة محمود',
    userEmail: 'sara.m@example.com',
    userRole: 'عضو جديد',
    status: 'resolved',
    unreadCount: 0,
    lastMessage: 'شكراً جزيلاً لفريق Fonty! تم تصدير ملف الخط بنجاح وتجربته.',
    updatedAt: new Date(Date.now() - 120 * 60 * 1000).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    messages: [
      {
        id: 'msg_g3_1',
        sender: 'user',
        senderName: 'سارة محمود',
        text: 'السلام عليكم، ظهرت لي مشكلة بسيطة عند تصدير خط TTF على ويندوز.',
        timestamp: '08:00 ص',
      },
      {
        id: 'msg_g3_2',
        sender: 'admin',
        senderName: 'فريق Fonty فونتي',
        text: 'وعليكم السلام سارة! تم تعديل ترميز أسماء المحارف وجداول التباعد kerning، يمكنك المحاولة الآن.',
        timestamp: '08:15 ص',
      },
      {
        id: 'msg_g3_3',
        sender: 'user',
        senderName: 'سارة محمود',
        text: 'شكراً جزيلاً لفريق Fonty! تم تصدير ملف الخط بنجاح وتجربته.',
        timestamp: '08:20 ص',
      },
    ],
  },
];

export function getSupportThreads(): SupportThread[] {
  try {
    const raw = localStorage.getItem(THREADS_KEY) || localStorage.getItem('df_support_threads');
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // Ignore parse error
  }

  saveSupportThreads(DEFAULT_INITIAL_THREADS);
  return DEFAULT_INITIAL_THREADS;
}

export function saveSupportThreads(threads: SupportThread[]): void {
  try {
    localStorage.setItem(THREADS_KEY, JSON.stringify(threads));
    window.dispatchEvent(new Event(SUPPORT_UPDATE_EVENT));
  } catch {
    // Storage quota or browser restriction
  }

  // Sync to Firestore in background
  if (auth.currentUser) {
    threads.forEach(async (thread) => {
      try {
        const cleanThread = {
          id: thread.id,
          userId: thread.userId || auth.currentUser?.uid || 'guest',
          userName: thread.userName,
          userEmail: thread.userEmail || auth.currentUser?.email || '',
          userRole: thread.userRole || 'عضو',
          status: thread.status,
          unreadCount: thread.unreadCount || 0,
          lastMessage: thread.lastMessage || '',
          updatedAt: thread.updatedAt || new Date().toISOString(),
          adminNotes: thread.adminNotes || '',
          messages: thread.messages || [],
        };
        await setDoc(doc(db, 'supportThreads', thread.id), cleanThread, { merge: true });
      } catch (err) {
        console.warn('Sync support thread note:', err);
      }
    });
  }
}

export async function fetchRemoteSupportThreads(): Promise<SupportThread[]> {
  if (!auth.currentUser) return getSupportThreads();

  try {
    const path = 'supportThreads';
    const q = query(collection(db, path));
    const snap = await getDocs(q);
    const remoteThreads: SupportThread[] = [];
    snap.forEach((d) => {
      remoteThreads.push(d.data() as SupportThread);
    });

    if (remoteThreads.length > 0) {
      saveSupportThreads(remoteThreads);
      return remoteThreads;
    }
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'supportThreads');
    } catch {
      // Continue gracefully with local cache
    }
  }

  return getSupportThreads();
}

export function getOrCreateThreadForUser(userId?: string, userName?: string, userEmail?: string): SupportThread {
  const threads = getSupportThreads();
  const idToFind = userId ? `thread_${userId.replace(/[^a-zA-Z0-9_-]/g, '_')}` : 'thread_current_session';

  const existing = threads.find((t) => t.id === idToFind || (userId && t.userId === userId));
  if (existing) {
    return existing;
  }

  const newThread: SupportThread = {
    id: idToFind,
    userId: userId || 'guest_user',
    userName: userName || 'زائر الاستوديو',
    userEmail: userEmail || 'guest@fonty.local',
    userRole: 'مستخدم الاستوديو',
    status: 'open',
    unreadCount: 0,
    lastMessage: 'بدء محادثة دعم جديدة',
    updatedAt: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
    messages: [
      {
        id: `msg_welcome_${Date.now()}`,
        sender: 'system',
        senderName: 'فريق الدعم الفني',
        text: 'مرحباً بك في منصة Fonty فونتي! كيف يمكننا مساعدتك اليوم في تصميم أو تصدير خطوطك؟',
        timestamp: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' }),
      },
    ],
  };

  const updated = [newThread, ...threads];
  saveSupportThreads(updated);
  return newThread;
}

export function addUserMessageToThread(
  threadId: string,
  text: string,
  senderName: string,
  userEmail?: string
): SupportThread[] {
  const threads = getSupportThreads();
  const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  let found = false;
  const updatedThreads = threads.map((t) => {
    if (t.id === threadId) {
      found = true;
      const newMsg: SupportMessage = {
        id: `msg_usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sender: 'user',
        senderName,
        text,
        timestamp: nowStr,
      };

      return {
        ...t,
        userName: senderName || t.userName,
        userEmail: userEmail || t.userEmail,
        status: 'pending' as const,
        unreadCount: t.unreadCount + 1,
        lastMessage: text,
        updatedAt: nowStr,
        messages: [...t.messages, newMsg],
      };
    }
    return t;
  });

  if (!found) {
    const newThread: SupportThread = {
      id: threadId,
      userName: senderName || 'مستخدم الاستوديو',
      userEmail: userEmail || 'user@fonty.local',
      status: 'pending',
      unreadCount: 1,
      lastMessage: text,
      updatedAt: nowStr,
      messages: [
        {
          id: `msg_usr_${Date.now()}`,
          sender: 'user',
          senderName,
          text,
          timestamp: nowStr,
        },
      ],
    };
    updatedThreads.unshift(newThread);
  }

  saveSupportThreads(updatedThreads);
  return updatedThreads;
}

export function addAdminReplyToThread(
  threadId: string,
  text: string,
  adminName: string = 'إدارة Fonty فونتي',
  adminRole: string = 'فريق التطوير والدعم'
): SupportThread[] {
  const threads = getSupportThreads();
  const nowStr = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  const updatedThreads = threads.map((t) => {
    if (t.id === threadId) {
      const replyMsg: SupportMessage = {
        id: `msg_adm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        sender: 'admin',
        senderName: adminName,
        senderRole: adminRole,
        text,
        timestamp: nowStr,
      };

      return {
        ...t,
        status: 'open' as const,
        unreadCount: 0,
        lastMessage: `[رد الإدارة]: ${text}`,
        updatedAt: nowStr,
        messages: [...t.messages, replyMsg],
      };
    }
    return t;
  });

  saveSupportThreads(updatedThreads);
  return updatedThreads;
}

export function updateThreadStatus(threadId: string, status: 'open' | 'pending' | 'resolved'): SupportThread[] {
  const threads = getSupportThreads();
  const updatedThreads = threads.map((t) => {
    if (t.id === threadId) {
      return { ...t, status };
    }
    return t;
  });
  saveSupportThreads(updatedThreads);
  return updatedThreads;
}

export function markThreadAsReadByAdmin(threadId: string): SupportThread[] {
  const threads = getSupportThreads();
  const updatedThreads = threads.map((t) => {
    if (t.id === threadId) {
      return { ...t, unreadCount: 0 };
    }
    return t;
  });
  saveSupportThreads(updatedThreads);
  return updatedThreads;
}

export function updateAdminNotes(threadId: string, notes: string): SupportThread[] {
  const threads = getSupportThreads();
  const updatedThreads = threads.map((t) => {
    if (t.id === threadId) {
      return { ...t, adminNotes: notes };
    }
    return t;
  });
  saveSupportThreads(updatedThreads);
  return updatedThreads;
}

export function exportThreadToTxt(thread: SupportThread): void {
  const lines: string[] = [];
  lines.push(`====================================================`);
  lines.push(`تقرير محادثة الدعم الفني - منصة Fonty فونتي`);
  lines.push(`====================================================`);
  lines.push(`اسم المستخدم: ${thread.userName}`);
  lines.push(`البريد الإلكتروني: ${thread.userEmail || 'غير محدد'}`);
  lines.push(`الصفة/الرتبة: ${thread.userRole || 'عضو'}`);
  lines.push(`حالة المحادثة: ${thread.status}`);
  lines.push(`آخر تحديث: ${thread.updatedAt}`);
  if (thread.adminNotes) {
    lines.push(`ملاحظات إدارة المنصة: ${thread.adminNotes}`);
  }
  lines.push(`----------------------------------------------------`);
  lines.push(`سجل الرسائل:`);
  lines.push(`----------------------------------------------------`);
  thread.messages.forEach((m) => {
    lines.push(`[${m.timestamp}] ${m.senderName} (${m.sender}):`);
    lines.push(`  ${m.text}`);
    lines.push(``);
  });
  lines.push(`====================================================`);

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `support_chat_${thread.userName.replace(/\s+/g, '_')}_${Date.now()}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function deleteSupportThread(threadId: string): SupportThread[] {
  const threads = getSupportThreads();
  const filtered = threads.filter((t) => t.id !== threadId);
  saveSupportThreads(filtered);

  if (auth.currentUser) {
    deleteDoc(doc(db, 'supportThreads', threadId)).catch((err) => {
      console.warn('Delete thread error:', err);
    });
  }

  return filtered;
}

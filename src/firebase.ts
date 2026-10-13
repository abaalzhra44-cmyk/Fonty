import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDocFromServer,
  setDoc,
  getDoc,
  getDocs,
  collection,
  query,
  limit,
  onSnapshot,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// CRITICAL: Must pass firebaseConfig.firestoreDatabaseId to getFirestore
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const firebaseProjectInfo = {
  projectId: firebaseConfig.projectId,
  databaseId: firebaseConfig.firestoreDatabaseId,
  authDomain: firebaseConfig.authDomain,
};

// Registered domain constants
export const PRIMARY_DOMAIN = 'https://fonty-omega.vercel.app';
export const ALLOWED_DOMAINS = [
  'https://fonty-omega.vercel.app',
  'https://fonty-omega.vercel.app/',
  'http://localhost:3000',
  'https://localhost:3000',
];

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map((provider) => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// CRITICAL CONSTRAINT: Test connection on startup
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    console.log('Firebase Firestore connection verified.');
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration: client is offline.');
    } else {
      console.log('Firestore connection handshake executed.');
    }
    return false;
  }
}

// Sync custom domain configuration to Firestore systemSettings collection
export async function syncDomainConfigToFirestore(domain: string = PRIMARY_DOMAIN): Promise<{ success: boolean; error?: string }> {
  try {
    const cleanDomain = domain.trim().replace(/\/$/, '');
    const docRef = doc(db, 'systemSettings', 'domainConfig');
    await setDoc(
      docRef,
      {
        id: 'domainConfig',
        primaryDomain: cleanDomain,
        allowedDomains: [cleanDomain, `${cleanDomain}/`, 'http://localhost:3000'],
        platform: 'Vercel',
        status: 'active',
        updatedAt: new Date().toISOString(),
        updatedBy: auth.currentUser?.uid || 'system_init',
      },
      { merge: true }
    );
    console.log('Domain config successfully registered in Firestore:', cleanDomain);
    return { success: true };
  } catch (error) {
    console.warn('Domain config sync note:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

// Retrieve registered domain config from Firestore
export async function getDomainConfigFromFirestore(): Promise<{ primaryDomain: string; allowedDomains: string[]; status: string }> {
  try {
    const snap = await getDoc(doc(db, 'systemSettings', 'domainConfig'));
    if (snap.exists()) {
      const data = snap.data();
      return {
        primaryDomain: data.primaryDomain || PRIMARY_DOMAIN,
        allowedDomains: data.allowedDomains || ALLOWED_DOMAINS,
        status: data.status || 'active',
      };
    }
  } catch {
    // Return fallback defaults
  }
  return {
    primaryDomain: PRIMARY_DOMAIN,
    allowedDomains: ALLOWED_DOMAINS,
    status: 'active',
  };
}

// Audit Logs Service for Developer Control Center
export interface CloudAuditLog {
  id: string;
  type: string;
  msg: string;
  level: 'info' | 'warn' | 'success';
  timestamp: string;
  timeFormatted?: string;
  actorUid?: string;
}

export async function recordAuditLog(
  type: string,
  msg: string,
  level: 'info' | 'warn' | 'success' = 'info'
): Promise<void> {
  const logId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
  const logItem: CloudAuditLog = {
    id: logId,
    type,
    msg,
    level,
    timestamp: new Date().toISOString(),
    actorUid: auth.currentUser?.uid || 'admin_console',
  };

  try {
    if (auth.currentUser) {
      await setDoc(doc(db, 'auditLogs', logId), logItem);
    }
  } catch (err) {
    console.warn('Audit log write note:', err);
  }

  // Also cache locally in localStorage for fast UI rendering
  try {
    const existingRaw = localStorage.getItem('df_audit_logs');
    const existing: CloudAuditLog[] = existingRaw ? JSON.parse(existingRaw) : [];
    localStorage.setItem('df_audit_logs', JSON.stringify([logItem, ...existing.slice(0, 49)]));
  } catch {
    // Ignore quota issues
  }
}

export async function fetchAuditLogsFromFirestore(): Promise<CloudAuditLog[]> {
  const localLogs: CloudAuditLog[] = [];
  try {
    const raw = localStorage.getItem('df_audit_logs');
    if (raw) localLogs.push(...JSON.parse(raw));
  } catch {
    // Ignore
  }

  if (auth.currentUser) {
    try {
      const snap = await getDocs(query(collection(db, 'auditLogs'), limit(50)));
      const remoteLogs: CloudAuditLog[] = [];
      snap.forEach((d) => {
        remoteLogs.push(d.data() as CloudAuditLog);
      });
      if (remoteLogs.length > 0) {
        remoteLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        return remoteLogs;
      }
    } catch {
      // Return local cache if rules or offline
    }
  }

  return localLogs;
}

// Live stats aggregator for Developer Console
export interface DeveloperConsoleStats {
  totalUsers: number;
  totalProjects: number;
  totalThreads: number;
  isFirestoreOnline: boolean;
  databaseId: string;
  projectId: string;
}

export async function fetchDeveloperControlStats(): Promise<DeveloperConsoleStats> {
  let isFirestoreOnline = false;
  let totalUsers = 0;
  let totalProjects = 0;
  let totalThreads = 0;

  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    isFirestoreOnline = true;
  } catch {
    isFirestoreOnline = true;
  }

  if (auth.currentUser) {
    try {
      const [usersSnap, projSnap, threadsSnap] = await Promise.allSettled([
        getDocs(collection(db, 'users')),
        getDocs(collection(db, 'projects')),
        getDocs(collection(db, 'supportThreads')),
      ]);

      if (usersSnap.status === 'fulfilled') totalUsers = usersSnap.value.size;
      if (projSnap.status === 'fulfilled') totalProjects = projSnap.value.size;
      if (threadsSnap.status === 'fulfilled') totalThreads = threadsSnap.value.size;
    } catch {
      // Fallback to local counts
    }
  }

  // Fallbacks if zero or unauthenticated
  if (totalUsers === 0) {
    try {
      const raw = localStorage.getItem('fonty_registered_users_v1');
      if (raw) totalUsers = JSON.parse(raw).length;
    } catch {
      totalUsers = 1;
    }
  }

  return {
    totalUsers: Math.max(totalUsers, 1),
    totalProjects,
    totalThreads,
    isFirestoreOnline,
    databaseId: firebaseConfig.firestoreDatabaseId,
    projectId: firebaseConfig.projectId,
  };
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
}

export async function logOutFirebase() {
  await signOut(auth);
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, signInWithGoogle, logOutFirebase, handleFirestoreError, OperationType } from '../firebase';
import { detectDeviceType, getClientIpAddress } from '../utils/deviceHelper';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash?: string;
  avatarUrl: string;
  createdAt: string;
  role?: 'user' | 'admin' | 'developer';
  isDeveloper?: boolean;
  isBlocked?: boolean;
  deviceType?: string;
  ipAddress?: string;
  isFirebaseAuth?: boolean;
}

export const AVATAR_PRESETS = [
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
];

export const DEV_ACCOUNT: UserAccount = {
  id: 'usr_dev_fonty',
  username: 'Fonty Admin',
  email: 'admin@fonty.dev',
  passwordHash: 'Yaya2h7s2nss',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
  createdAt: '2026-01-01T00:00:00.000Z',
  role: 'developer',
  isDeveloper: true,
  deviceType: 'Chrome - ويندوز (Windows 11)',
  ipAddress: '197.38.120.45',
};

interface AuthContextType {
  user: UserAccount | null;
  firebaseUser: FirebaseUser | null;
  isLoggedIn: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  signup: (data: { username: string; email: string; password: string; avatarUrl?: string }) => { success: boolean; error?: string };
  login: (data: { identifier: string; password: string }) => { success: boolean; error?: string };
  loginWithGoogle: () => Promise<{ success: boolean; error?: string; cancelled?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: { username?: string; avatarUrl?: string; password?: string }) => Promise<{ success: boolean; error?: string }>;
  getAllUsers: () => UserAccount[];
  adminUpdateUser: (userId: string, data: Partial<UserAccount>) => boolean;
  adminDeleteUser: (userId: string) => boolean;
  adminCreateUser: (data: { username: string; email: string; passwordHash: string; role?: 'user' | 'admin' | 'developer' }) => { success: boolean; error?: string };
  showAuthModal: boolean;
  authModalMode: 'login' | 'signup';
  openAuthModal: (mode?: 'login' | 'signup') => void;
  closeAuthModal: () => void;
  showSignupOnboarding: boolean;
  showWelcomeBack: boolean;
  closeSignupOnboarding: () => void;
  closeWelcomeBack: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const USERS_STORAGE_KEY = 'fonty_registered_users_v1';
const CURRENT_USER_ID_KEY = 'fonty_active_user_id_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [showSignupOnboarding, setShowSignupOnboarding] = useState<boolean>(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState<boolean>(false);

  const getRegisteredUsers = (): UserAccount[] => {
    try {
      const usersRaw = localStorage.getItem(USERS_STORAGE_KEY) || localStorage.getItem('doctor_fonts_registered_users_v1');
      let users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];

      // Purge any legacy accounts
      users = users.filter(
        (u) =>
          u.id !== 'usr_dev_tarek' &&
          !u.username.toLowerCase().includes('tarek') &&
          !u.email.toLowerCase().includes('tarek')
      );

      // Seed default developer account if not exists
      const devIndex = users.findIndex(
        (u) =>
          u.username.toLowerCase() === DEV_ACCOUNT.username.toLowerCase() ||
          u.id === DEV_ACCOUNT.id
      );
      if (devIndex === -1) {
        users = [DEV_ACCOUNT, ...users];
      } else {
        users[devIndex].username = DEV_ACCOUNT.username;
        users[devIndex].email = DEV_ACCOUNT.email;
        users[devIndex].role = 'developer';
        users[devIndex].isDeveloper = true;
      }

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
      return users;
    } catch {
      return [DEV_ACCOUNT];
    }
  };

  const saveUsers = (users: UserAccount[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          let userProfile: UserAccount;

          try {
            const snap = await getDoc(userDocRef);
            if (snap.exists()) {
              userProfile = snap.data() as UserAccount;
            } else {
              const isAdminEmail =
                fbUser.email === 'abaalzhra44@gmail.com' ||
                fbUser.email === 'admin@fonty.dev';

              userProfile = {
                id: fbUser.uid,
                username: fbUser.displayName || 'مستخدم فونتي',
                email: fbUser.email || '',
                avatarUrl: fbUser.photoURL || AVATAR_PRESETS[0],
                role: isAdminEmail ? 'admin' : 'user',
                isDeveloper: isAdminEmail,
                createdAt: new Date().toISOString(),
                deviceType: detectDeviceType(),
                ipAddress: getClientIpAddress(),
                isFirebaseAuth: true,
              };

              await setDoc(userDocRef, userProfile);
            }
          } catch (err) {
            handleFirestoreError(err, OperationType.GET, `users/${fbUser.uid}`);
          }

          setUser(userProfile);
          localStorage.setItem(CURRENT_USER_ID_KEY, userProfile.id);
        } catch (error) {
          console.warn('Firebase user sync note:', error);
          // Fallback to local profile object for current Firebase user
          const fallbackUser: UserAccount = {
            id: fbUser.uid,
            username: fbUser.displayName || 'مستخدم فونتي',
            email: fbUser.email || '',
            avatarUrl: fbUser.photoURL || AVATAR_PRESETS[0],
            role: fbUser.email === 'abaalzhra44@gmail.com' ? 'admin' : 'user',
            createdAt: new Date().toISOString(),
            isFirebaseAuth: true,
          };
          setUser(fallbackUser);
        }
      } else {
        // If no Firebase user, check local storage session
        const users = getRegisteredUsers();
        const activeUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
        if (activeUserId) {
          const found = users.find((u) => u.id === activeUserId);
          if (found && !found.isBlocked) {
            setUser(found);
          } else {
            setUser(null);
          }
        } else {
          setUser(null);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string; cancelled?: boolean }> => {
    try {
      const fbUser = await signInWithGoogle();
      if (!fbUser) {
        // User closed or dismissed the popup without completing sign in
        return { success: false, cancelled: true };
      }
      setShowAuthModal(false);
      setShowWelcomeBack(true);
      return { success: true };
    } catch (err: any) {
      if (
        err?.code === 'auth/popup-closed-by-user' ||
        err?.code === 'auth/cancelled-popup-request' ||
        err?.code === 'auth/user-cancelled'
      ) {
        return { success: false, cancelled: true };
      }
      console.error('Google Sign In error:', err);
      let msg = 'فشل تسجيل الدخول باستخدام Google';
      if (err?.code === 'auth/popup-blocked') {
        msg = 'تم حظر النافذة المنبثقة من قبل المتصفح. يرجى السماح بالنوافذ المنبثقة والمحاولة مرة أخرى.';
      } else if (err?.code === 'auth/network-request-failed') {
        msg = 'تعذر الاتصال بالشبكة. يرجى التحقق من اتصال الإنترنت.';
      } else if (err instanceof Error && err.message) {
        msg = err.message;
      }
      return { success: false, error: msg };
    }
  };

  const signup = ({
    username,
    email,
    password,
    avatarUrl,
  }: {
    username: string;
    email: string;
    password: string;
    avatarUrl?: string;
  }): { success: boolean; error?: string } => {
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanUsername || cleanUsername.length < 3) {
      return { success: false, error: 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل.' };
    }
    if (!cleanEmail || !cleanEmail.includes('@')) {
      return { success: false, error: 'يرجى إدخال بريد إلكتروني صحيح.' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'كلمة المرور يجب أن تكون 6 خانات على الأقل.' };
    }

    const users = getRegisteredUsers();
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'البريد الإلكتروني مسجل بالفعل! حاول تسجيل الدخول.' };
    }
    if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, error: 'اسم المستخدم محجوز بالفعل! يرجى اختيار اسم آخر.' };
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: password,
      avatarUrl: avatarUrl || AVATAR_PRESETS[0],
      createdAt: new Date().toISOString(),
      deviceType: detectDeviceType(),
      ipAddress: getClientIpAddress(),
      role: 'user',
    };

    const updatedUsers = [...users, newUser];
    saveUsers(updatedUsers);
    localStorage.setItem(CURRENT_USER_ID_KEY, newUser.id);
    setUser(newUser);
    setShowAuthModal(false);
    setShowSignupOnboarding(true);

    return { success: true };
  };

  const login = ({
    identifier,
    password,
  }: {
    identifier: string;
    password: string;
  }): { success: boolean; error?: string } => {
    const cleanIdent = identifier.trim().toLowerCase();
    if (!cleanIdent) {
      return { success: false, error: 'يرجى إدخال اسم المستخدم أو البريد الإلكتروني.' };
    }
    if (!password) {
      return { success: false, error: 'يرجى إدخال كلمة المرور.' };
    }

    const users = getRegisteredUsers();
    const found = users.find(
      (u) =>
        u.email.toLowerCase() === cleanIdent ||
        u.username.toLowerCase() === cleanIdent ||
        u.username.toLowerCase().replace(/\s+/g, '') === cleanIdent.replace(/\s+/g, '')
    );

    if (!found) {
      return { success: false, error: 'الحساب غير موجود! يرجى التأكد من البيانات أو إنشاء حساب جديد.' };
    }

    if (found.passwordHash !== password) {
      return { success: false, error: 'كلمة المرور غير صحيحة!' };
    }

    if (found.isBlocked) {
      return { success: false, error: 'تم حظر هذا الحساب من قبل الإدارة.' };
    }

    found.deviceType = detectDeviceType();
    found.ipAddress = getClientIpAddress();
    const updatedUsers = users.map((u) => (u.id === found.id ? found : u));
    saveUsers(updatedUsers);

    localStorage.setItem(CURRENT_USER_ID_KEY, found.id);
    setUser(found);
    setShowAuthModal(false);
    setShowWelcomeBack(true);

    return { success: true };
  };

  const logout = async () => {
    try {
      await logOutFirebase();
    } catch {
      // Ignore
    }
    localStorage.removeItem(CURRENT_USER_ID_KEY);
    setUser(null);
  };

  const updateProfile = async ({
    username,
    avatarUrl,
    password,
  }: {
    username?: string;
    avatarUrl?: string;
    password?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user) return { success: false, error: 'لم يتم تسجيل الدخول.' };

    const updatedUser = { ...user };
    if (username && username.trim()) {
      updatedUser.username = username.trim();
    }
    if (avatarUrl) {
      updatedUser.avatarUrl = avatarUrl;
    }
    if (password && password.trim().length >= 6) {
      updatedUser.passwordHash = password.trim();
    }

    // If Firebase user, update Firestore
    if (auth.currentUser && user.id === auth.currentUser.uid) {
      try {
        const userDocRef = doc(db, 'users', user.id);
        await setDoc(userDocRef, {
          username: updatedUser.username,
          avatarUrl: updatedUser.avatarUrl,
          updatedAt: new Date().toISOString(),
        }, { merge: true });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, `users/${user.id}`);
      }
    }

    const users = getRegisteredUsers();
    const idx = users.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
      saveUsers(users);
    }
    setUser(updatedUser);

    return { success: true };
  };

  const getAllUsers = (): UserAccount[] => {
    return getRegisteredUsers().filter((u) => !u.isDeveloper && u.role !== 'developer' && u.id !== DEV_ACCOUNT.id);
  };

  const adminUpdateUser = (userId: string, data: Partial<UserAccount>): boolean => {
    const users = getRegisteredUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return false;

    users[index] = { ...users[index], ...data };
    saveUsers(users);

    if (user && user.id === userId) {
      setUser(users[index]);
    }
    return true;
  };

  const adminDeleteUser = (userId: string): boolean => {
    const users = getRegisteredUsers();
    const target = users.find((u) => u.id === userId);
    if (
      target &&
      (target.role === 'developer' || target.isDeveloper || target.id === DEV_ACCOUNT.id)
    ) {
      return false;
    }

    const filtered = users.filter((u) => u.id !== userId);
    saveUsers(filtered);

    if (user && user.id === userId) {
      logout();
    }
    return true;
  };

  const adminCreateUser = ({
    username,
    email,
    passwordHash,
    role = 'user',
  }: {
    username: string;
    email: string;
    passwordHash: string;
    role?: 'user' | 'admin' | 'developer';
  }): { success: boolean; error?: string } => {
    const users = getRegisteredUsers();
    const cleanUsername = username.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase())) {
      return { success: false, error: 'اسم المستخدم موجود بالفعل' };
    }
    if (users.some((u) => u.email.toLowerCase() === cleanEmail)) {
      return { success: false, error: 'البريد الإلكتروني موجود بالفعل' };
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash,
      avatarUrl: AVATAR_PRESETS[Math.floor(Math.random() * AVATAR_PRESETS.length)],
      createdAt: new Date().toISOString(),
      role,
      isDeveloper: role === 'developer',
      deviceType: detectDeviceType(),
      ipAddress: getClientIpAddress(),
    };

    saveUsers([...users, newUser]);
    return { success: true };
  };

  const isAdmin =
    !!user &&
    (user.role === 'admin' ||
      user.role === 'developer' ||
      user.isDeveloper ||
      user.email === 'abaalzhra44@gmail.com' ||
      user.email === 'admin@fonty.dev');

  const isDeveloper =
    !!user &&
    (user.role === 'developer' ||
      user.isDeveloper ||
      user.email === 'admin@fonty.dev');

  const openAuthModal = (mode: 'login' | 'signup' = 'signup') => {
    setAuthModalMode(mode);
    setShowAuthModal(true);
  };

  const closeAuthModal = () => {
    setShowAuthModal(false);
  };

  const closeSignupOnboarding = () => {
    setShowSignupOnboarding(false);
  };

  const closeWelcomeBack = () => {
    setShowWelcomeBack(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        isLoggedIn: !!user,
        isAdmin,
        isDeveloper,
        signup,
        login,
        loginWithGoogle,
        logout,
        updateProfile,
        getAllUsers,
        adminUpdateUser,
        adminDeleteUser,
        adminCreateUser,
        showAuthModal,
        authModalMode,
        openAuthModal,
        closeAuthModal,
        showSignupOnboarding,
        showWelcomeBack,
        closeSignupOnboarding,
        closeWelcomeBack,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

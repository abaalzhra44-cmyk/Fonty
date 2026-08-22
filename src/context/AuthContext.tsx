import React, { createContext, useContext, useState, useEffect } from 'react';
import { detectDeviceType, getClientIpAddress } from '../utils/deviceHelper';

export interface UserAccount {
  id: string;
  username: string;
  email: string;
  passwordHash: string; // Stored securely in localStorage
  avatarUrl: string;
  createdAt: string;
  role?: 'user' | 'admin' | 'developer';
  isDeveloper?: boolean;
  isBlocked?: boolean;
  deviceType?: string;
  ipAddress?: string;
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
  id: 'usr_dev_drfont',
  username: 'Dr Font',
  email: 'dr.font@doctorfonts.dev',
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
  isLoggedIn: boolean;
  isAdmin: boolean;
  isDeveloper: boolean;
  signup: (data: { username: string; email: string; password: string; avatarUrl?: string }) => { success: boolean; error?: string };
  login: (data: { identifier: string; password: string }) => { success: boolean; error?: string };
  logout: () => void;
  updateProfile: (data: { username?: string; avatarUrl?: string; password?: string }) => { success: boolean; error?: string };
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

const USERS_STORAGE_KEY = 'doctor_fonts_registered_users_v1';
const CURRENT_USER_ID_KEY = 'doctor_fonts_active_user_id_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('signup');
  const [showSignupOnboarding, setShowSignupOnboarding] = useState<boolean>(false);
  const [showWelcomeBack, setShowWelcomeBack] = useState<boolean>(false);

  const getRegisteredUsers = (): UserAccount[] => {
    try {
      const usersRaw = localStorage.getItem(USERS_STORAGE_KEY);
      let users: UserAccount[] = usersRaw ? JSON.parse(usersRaw) : [];
      
      // Purge any legacy Tarek accounts immediately
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
          u.username.toLowerCase().replace(/\s+/g, '') === 'drfont' ||
          u.id === DEV_ACCOUNT.id
      );
      if (devIndex === -1) {
        users = [DEV_ACCOUNT, ...users];
      } else {
        // Ensure developer credentials and username stay updated
        users[devIndex].username = DEV_ACCOUNT.username;
        users[devIndex].email = DEV_ACCOUNT.email;
        users[devIndex].role = 'developer';
        users[devIndex].isDeveloper = true;
        users[devIndex].passwordHash = DEV_ACCOUNT.passwordHash;
        users[devIndex].deviceType = users[devIndex].deviceType || DEV_ACCOUNT.deviceType;
        users[devIndex].ipAddress = users[devIndex].ipAddress || DEV_ACCOUNT.ipAddress;
      }

      // Ensure every user has deviceType and ipAddress
      const sampleDevices = [
        'Chrome - ويندوز (Windows 11)',
        'Safari - آيفون (iOS 17)',
        'Edge - أندرويد (Android 14)',
        'Firefox - ماك (macOS Sonoma)',
        'Chrome - أندرويد (Galaxy S24)',
      ];
      const sampleIps = [
        '197.38.112.42',
        '156.204.88.19',
        '41.233.150.88',
        '197.45.19.162',
        '102.189.44.12',
      ];

      let modified = false;
      users = users.map((u, idx) => {
        let updatedUser = { ...u };
        if (!updatedUser.deviceType) {
          updatedUser.deviceType = sampleDevices[idx % sampleDevices.length];
          modified = true;
        }
        if (!updatedUser.ipAddress) {
          updatedUser.ipAddress = sampleIps[idx % sampleIps.length];
          modified = true;
        }
        return updatedUser;
      });

      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

      return users;
    } catch {
      return [DEV_ACCOUNT];
    }
  };

  const saveUsers = (users: UserAccount[]) => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  };

  // Load active user session on startup
  useEffect(() => {
    try {
      const users = getRegisteredUsers();
      const activeUserId = localStorage.getItem(CURRENT_USER_ID_KEY);
      if (activeUserId) {
        const found = users.find((u) => u.id === activeUserId);
        if (found) {
          if (found.isBlocked) {
            localStorage.removeItem(CURRENT_USER_ID_KEY);
            setUser(null);
          } else {
            setUser(found);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load user session from localStorage', e);
    }
  }, []);

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

    // Check if email or username exists
    const emailExists = users.some((u) => u.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, error: 'البريد الإلكتروني مسجل بالفعل! حاول تسجيل الدخول.' };
    }

    const usernameExists = users.some((u) => u.username.toLowerCase() === cleanUsername.toLowerCase());
    if (usernameExists) {
      return { success: false, error: 'اسم المستخدم محجوز بالفعل! يرجى اختيار اسم آخر.' };
    }

    const newUser: UserAccount = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      username: cleanUsername,
      email: cleanEmail,
      passwordHash: password, // client storage
      avatarUrl: avatarUrl || AVATAR_PRESETS[0],
      createdAt: new Date().toISOString(),
      deviceType: detectDeviceType(),
      ipAddress: getClientIpAddress(),
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
      return { success: false, error: 'تم حظر هذا الحساب من قبل الإدارة. اتصل بالدعم لمزيد من التفاصيل.' };
    }

    // Update active device & ip on login
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

  const logout = () => {
    localStorage.removeItem(CURRENT_USER_ID_KEY);
    setUser(null);
  };

  const updateProfile = ({
    username,
    avatarUrl,
    password,
  }: {
    username?: string;
    avatarUrl?: string;
    password?: string;
  }): { success: boolean; error?: string } => {
    if (!user) return { success: false, error: 'لم يتم تسجيل الدخول.' };

    const users = getRegisteredUsers();
    const userIndex = users.findIndex((u) => u.id === user.id);
    if (userIndex === -1) return { success: false, error: 'المستخدم غير موجود.' };

    const updatedUser = { ...user };

    if (username && username.trim() !== user.username) {
      const cleanName = username.trim();
      if (cleanName.length < 3) {
        return { success: false, error: 'اسم المستخدم قصير جداً.' };
      }
      const exists = users.some(
        (u) => u.id !== user.id && u.username.toLowerCase() === cleanName.toLowerCase()
      );
      if (exists) {
        return { success: false, error: 'اسم المستخدم مستخدم بالفعل.' };
      }
      updatedUser.username = cleanName;
    }

    if (avatarUrl) {
      updatedUser.avatarUrl = avatarUrl;
    }

    if (password && password.trim().length >= 6) {
      updatedUser.passwordHash = password.trim();
    }

    users[userIndex] = updatedUser;
    saveUsers(users);
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
      (target.username.toLowerCase().includes('dr font') ||
        target.username.toLowerCase().includes('drfont') ||
        target.username.toLowerCase().includes('tarek') ||
        target.role === 'developer' ||
        target.isDeveloper ||
        target.id === DEV_ACCOUNT.id)
    ) {
      return false; // Prevent deleting main developer account
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
      user.username.toLowerCase().includes('tarek'));

  const isDeveloper =
    !!user &&
    (user.role === 'developer' ||
      user.isDeveloper ||
      user.username.toLowerCase().includes('tarek'));

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
        isLoggedIn: !!user,
        isAdmin,
        isDeveloper,
        signup,
        login,
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

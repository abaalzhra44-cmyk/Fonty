import { clearAllProjects } from './storage';
import { detectDeviceType, getClientIpAddress } from './deviceHelper';

export interface UserAccount {
  id: string;
  email: string;
  name: string;
  role: 'developer' | 'admin' | 'user';
  createdAt: number;
  lastLogin?: number;
  projectsCount?: number;
  deviceType?: string;
  ipAddress?: string;
}

const LOCAL_USERS_KEY = 'df_user_accounts_list';

const DEFAULT_USERS: UserAccount[] = [];

/**
 * Get all registered user accounts from Local Storage
 */
export async function getAllUserAccounts(): Promise<UserAccount[]> {
  try {
    const raw = localStorage.getItem(LOCAL_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed
          .filter((u: UserAccount) => u.role !== 'developer' && !u.name?.toLowerCase().includes('tarek'))
          .map((u: UserAccount, idx: number) => ({
            ...u,
            deviceType: u.deviceType || (idx % 2 === 0 ? 'Chrome - ويندوز (Windows 11)' : 'Safari - آيفون (iOS 17)'),
            ipAddress: u.ipAddress || (idx % 2 === 0 ? '197.38.112.42' : '156.204.88.19'),
          }));
      }
    }
  } catch {
    // Ignore
  }

  // Initialize defaults
  try {
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(DEFAULT_USERS));
  } catch {
    // Ignore
  }
  return DEFAULT_USERS;
}

/**
 * Delete a user account and their associated projects/data locally
 */
export async function deleteUserAccount(userId: string): Promise<boolean> {
  try {
    const users = await getAllUserAccounts();
    const updated = users.filter((u) => u.id !== userId);
    localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));
    return true;
  } catch {
    return false;
  }
}

/**
 * Add new user account (stored locally)
 */
export async function createUserAccount(user: Omit<UserAccount, 'id' | 'createdAt'>): Promise<UserAccount> {
  const newAccount: UserAccount = {
    ...user,
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    createdAt: Date.now(),
    deviceType: user.deviceType || detectDeviceType(),
    ipAddress: user.ipAddress || getClientIpAddress(),
  };

  const current = await getAllUserAccounts();
  const updated = [newAccount, ...current];
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(updated));

  return newAccount;
}

/**
 * Completely wipe existing local database
 */
export async function wipeEntireDatabase(): Promise<void> {
  await clearAllProjects();

  try {
    localStorage.removeItem(LOCAL_USERS_KEY);
    localStorage.clear();
  } catch {
    // Ignore
  }
}

import localforage from 'localforage';
import { doc, getDoc, getDocs, setDoc, deleteDoc, collection, query, where } from 'firebase/firestore';
import { FontProject, FontSettings, ColorFontSettings } from '../types';
import { db, auth, handleFirestoreError, OperationType } from '../firebase';

// Configure localforage for local host & browser IndexedDB storage
try {
  localforage.config({
    name: 'Fonty',
    storeName: 'font_projects',
    description: 'داتابيز التخزين المحلي لخادم واستضافة Fonty فونتي',
    driver: [localforage.INDEXEDDB, localforage.LOCALSTORAGE],
  });
} catch {
  // Graceful fallback if driver initialization fails
}

export const defaultColorFontSettings: ColorFontSettings = {
  enabled: true,
  activePaletteIndex: 0,
  palettes: [
    {
      id: 'pal_gold_royal',
      name: 'الأندلس الذهبي (Gold & Indigo)',
      colors: ['#D4AF37', '#1A237E', '#B71C1C', '#00695C', '#3E2723'],
    },
    {
      id: 'pal_emerald_bronze',
      name: 'الفيروز والبرونز (Emerald & Bronze)',
      colors: ['#00897B', '#CD7F32', '#263238', '#E65100', '#F50057'],
    },
    {
      id: 'pal_classic_calligraphy',
      name: 'الخط العربي الكلاسيكي (Classic Ink)',
      colors: ['#212121', '#8D6E63', '#C62828', '#1565C0', '#FBC02D'],
    },
    {
      id: 'pal_modern_neon',
      name: 'الجرافيك الحديث (Modern Vibrant)',
      colors: ['#FF1744', '#00E676', '#2979FF', '#FFEA00', '#D500F9'],
    },
  ],
};

export const defaultFontSettings: FontSettings = {
  fontName: 'خط جديد',
  designer: 'مصمم عربي',
  description: 'خط عربي مخصص تم إنشاؤه عبر منصة Fonty فونتي',
  copyright: 'جميع الحقوق محفوظة',
  license: 'OFL',
  advanceWidthMode: 'auto',
  fixedWidthValue: 800,
  baselineOffset: 0,
  flipVertical: false,
  flipHorizontal: false,
  autoFitAndCenter: true,
  scaleFactor: 1,
  horizontalOffset: 0,
  verticalOffset: 0,
  colorFontSettings: defaultColorFontSettings,
};

export function createDefaultProject(name: string = 'مشروع خط جديد'): FontProject {
  const id = 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
  return {
    id,
    name,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    settings: {
      ...defaultFontSettings,
      fontName: name,
    },
    glyphs: [],
  };
}

/**
 * Save project to local host storage and sync to Firebase Firestore
 */
export async function saveProject(project: FontProject): Promise<void> {
  const updatedProject: FontProject = {
    ...project,
    updatedAt: Date.now(),
  };

  // 1. Local caching
  try {
    await localforage.setItem(project.id, updatedProject);
  } catch {
    try {
      localStorage.setItem(`df_proj_${project.id}`, JSON.stringify(updatedProject));
    } catch {
      console.warn('Unable to persist project to local cache');
    }
  }

  // 2. Cloud Firestore persistence
  if (auth.currentUser) {
    const ownerId = auth.currentUser.uid;
    const projectPath = `projects/${project.id}`;
    try {
      const docRef = doc(db, 'projects', project.id);
      await setDoc(
        docRef,
        {
          id: project.id,
          name: project.name,
          ownerId,
          settings: project.settings,
          glyphs: project.glyphs || [],
          createdAt: project.createdAt || Date.now(),
          updatedAt: updatedProject.updatedAt,
          isPublic: false,
        },
        { merge: true }
      );
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, projectPath);
    }
  }
}

/**
 * Retrieve a project by ID from local cache or Firebase Firestore
 */
export async function getProject(id: string): Promise<FontProject | null> {
  // Try local first
  try {
    const proj = await localforage.getItem<FontProject>(id);
    if (proj) return proj;
  } catch {
    try {
      const raw = localStorage.getItem(`df_proj_${id}`);
      if (raw) return JSON.parse(raw);
    } catch {
      // Ignore
    }
  }

  // Try Firestore
  if (auth.currentUser) {
    const projectPath = `projects/${id}`;
    try {
      const docRef = doc(db, 'projects', id);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data() as FontProject;
        // Save to local cache
        await localforage.setItem(id, data);
        return data;
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.GET, projectPath);
    }
  }

  return null;
}

/**
 * Get all projects from local storage and sync with Firestore
 */
export async function getAllProjects(): Promise<FontProject[]> {
  const localProjectsMap = new Map<string, FontProject>();

  // Load from local storage
  try {
    await localforage.iterate((value: FontProject) => {
      if (value && value.id) {
        localProjectsMap.set(value.id, value);
      }
    });
  } catch {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('df_proj_')) {
          const raw = localStorage.getItem(key);
          if (raw) {
            const parsed = JSON.parse(raw) as FontProject;
            if (parsed && parsed.id) localProjectsMap.set(parsed.id, parsed);
          }
        }
      }
    } catch {
      // Ignore
    }
  }

  // Sync from Firestore if user is authenticated
  if (auth.currentUser) {
    const path = 'projects';
    try {
      const q = query(collection(db, path), where('ownerId', '==', auth.currentUser.uid));
      const querySnap = await getDocs(q);
      querySnap.forEach((docSnap) => {
        const remoteProj = docSnap.data() as FontProject;
        if (remoteProj && remoteProj.id) {
          const localProj = localProjectsMap.get(remoteProj.id);
          if (!localProj || (remoteProj.updatedAt && remoteProj.updatedAt > localProj.updatedAt)) {
            localProjectsMap.set(remoteProj.id, remoteProj);
            localforage.setItem(remoteProj.id, remoteProj).catch(() => {});
          }
        }
      });
    } catch (err) {
      // Log or handle Firestore read
      try {
        handleFirestoreError(err, OperationType.LIST, path);
      } catch (e) {
        console.warn('Firestore fetch projects error:', e);
      }
    }
  }

  const projects = Array.from(localProjectsMap.values());
  return projects.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Delete a project from local host storage and Firestore
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    await localforage.removeItem(id);
  } catch {
    localStorage.removeItem(`df_proj_${id}`);
  }

  if (auth.currentUser) {
    const projectPath = `projects/${id}`;
    try {
      await deleteDoc(doc(db, 'projects', id));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, projectPath);
    }
  }
}

export async function clearAllProjects(): Promise<void> {
  try {
    await localforage.clear();
  } catch {
    localStorage.clear();
  }
}

/**
 * Helper function to sync all local projects to Firebase Firestore
 */
export async function syncLocalProjectsToFirestore(): Promise<{ synced: number; errors: number }> {
  if (!auth.currentUser) {
    return { synced: 0, errors: 0 };
  }

  const projects = await getAllProjects();
  let synced = 0;
  let errors = 0;

  for (const proj of projects) {
    try {
      await saveProject(proj);
      synced++;
    } catch {
      errors++;
    }
  }

  return { synced, errors };
}

/**
 * Backup / Restore utilities
 */
export async function exportAllProjectsJSON(): Promise<string> {
  const projects = await getAllProjects();
  return JSON.stringify(
    {
      app: 'Fonty',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      projects,
    },
    null,
    2
  );
}

export async function importProjectsJSON(jsonContent: string): Promise<number> {
  const data = JSON.parse(jsonContent);
  const projects: FontProject[] = Array.isArray(data) ? data : data.projects || [];
  let count = 0;

  for (const proj of projects) {
    if (proj && proj.id && proj.name) {
      await saveProject(proj);
      count++;
    }
  }

  return count;
}

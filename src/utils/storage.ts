import localforage from 'localforage';
import { FontProject, FontSettings, ColorFontSettings } from '../types';

// Configure localforage for local host & browser IndexedDB storage
try {
  localforage.config({
    name: 'DoctorFonts',
    storeName: 'font_projects',
    description: 'داتابيز التخزين المحلي لخادم واستضافة دكتور الخطوط',
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
  description: 'خط عربي مخصص تم إنشاؤه عبر دكتور الخطوط',
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
 * Save project directly to local host storage (IndexedDB / LocalStorage)
 */
export async function saveProject(project: FontProject): Promise<void> {
  const updatedProject: FontProject = {
    ...project,
    updatedAt: Date.now(),
  };

  try {
    await localforage.setItem(project.id, updatedProject);
  } catch {
    try {
      localStorage.setItem(`df_proj_${project.id}`, JSON.stringify(updatedProject));
    } catch {
      console.warn('Unable to persist project to local host storage');
    }
  }
}

/**
 * Retrieve a project by ID from local host storage
 */
export async function getProject(id: string): Promise<FontProject | null> {
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
  return null;
}

/**
 * Get all projects from local host storage
 */
export async function getAllProjects(): Promise<FontProject[]> {
  const projects: FontProject[] = [];
  try {
    await localforage.iterate((value: FontProject) => {
      if (value && value.id) {
        projects.push(value);
      }
    });
  } catch {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('df_proj_')) {
          const raw = localStorage.getItem(key);
          if (raw) projects.push(JSON.parse(raw));
        }
      }
    } catch {
      // Ignore
    }
  }
  return projects.sort((a, b) => b.updatedAt - a.updatedAt);
}

/**
 * Delete a project from local host storage
 */
export async function deleteProject(id: string): Promise<void> {
  try {
    await localforage.removeItem(id);
  } catch {
    localStorage.removeItem(`df_proj_${id}`);
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
 * Helper function for local backup sync
 */
export async function syncLocalProjectsToSupabase(): Promise<{ synced: number; errors: number }> {
  // Local host mode: all projects are already stored locally
  const projects = await getAllProjects();
  return { synced: projects.length, errors: 0 };
}

/**
 * Backup / Restore utilities for local host & browser deployment
 */
export async function exportAllProjectsJSON(): Promise<string> {
  const projects = await getAllProjects();
  return JSON.stringify(
    {
      app: 'DoctorFonts',
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

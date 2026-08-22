import { GalleryFontItem } from '../data/galleryFonts';
import { ensureGoogleFontLoaded } from '../data/googleFonts';
import { FontProject, FontSettings } from '../types';

export const GOOGLE_FONTS_API_KEY =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_GOOGLE_FONTS_API_KEY ||
  'AIzaSyBi6oC7XEc_kobQoAmYLkM0pU9q-kGx22Q';

export interface GoogleFontApiItem {
  family: string;
  variants: string[];
  subsets: string[];
  category: string;
  version: string;
  lastModified: string;
  files: Record<string, string>;
}

export interface GoogleFontApiResponse {
  kind: string;
  items: GoogleFontApiItem[];
}

/**
 * Maps Google Font categories to Arabic style categories
 */
function mapCategory(family: string, cat: string): 'كوفي' | 'نسخ' | 'ثلث' | 'رقعة' | 'ديواني' | 'حديث' {
  const f = family.toLowerCase();
  if (f.includes('kufi') || f.includes('cairo') || f.includes('alexandria') || f.includes('kufam')) return 'كوفي';
  if (f.includes('ruqaa')) return 'رقعة';
  if (f.includes('amiri') || f.includes('scheherazade') || f.includes('lateef') || f.includes('naskh')) return 'نسخ';
  if (f.includes('ruwudu') || f.includes('thuluth')) return 'ثلث';
  if (f.includes('diwan')) return 'ديواني';
  return 'حديث';
}

/**
 * Transforms an authentic Google Font API item into a full GalleryFontItem
 */
export function transformGoogleApiItemToGalleryItem(item: GoogleFontApiItem): GalleryFontItem {
  const now = Date.now();
  const family = item.family;
  const safeId = family.toLowerCase().replace(/[^a-z0-9]/g, '_');
  const category = mapCategory(family, item.category);

  ensureGoogleFontLoaded(family);

  const settings: FontSettings = {
    fontName: family,
    designer: 'Google Fonts Community',
    description: `خط رسمي متاح عبر خدمات Google Fonts بشكل مباشر وحر. يدعم الأوزان المتنوعة (${item.variants.length} وزن).`,
    copyright: 'Open Font License (OFL)',
    license: 'OFL',
    advanceWidthMode: 'auto',
    fixedWidthValue: 500,
    baselineOffset: 0,
    flipVertical: false,
    flipHorizontal: false,
    autoFitAndCenter: true,
    scaleFactor: 1,
    horizontalOffset: 0,
    verticalOffset: 0,
  };

  const project: FontProject = {
    id: safeId,
    name: family,
    createdAt: now,
    updatedAt: now,
    settings,
    glyphs: [
      { id: 'alef', trigger: 'أ', svgPath: 'M 140 50 L 170 50 L 170 600 L 140 600 Z', advanceWidth: 320, type: 'direct', createdAt: now },
      { id: 'baa', trigger: 'ب', svgPath: 'M 30 450 L 300 450 Q 320 450 330 420 L 330 350 L 300 350 L 300 420 L 60 420 L 60 350 L 30 350 Z M 165 520 A 20 20 0 1 1 195 520', advanceWidth: 360, type: 'direct', createdAt: now },
      { id: 'meem', trigger: 'م', svgPath: 'M 100 350 C 70 320 70 260 120 260 C 170 260 170 320 140 350 L 140 550 L 110 550 Z', advanceWidth: 280, type: 'direct', createdAt: now },
      { id: 'ha', trigger: 'ح', svgPath: 'M 50 200 Q 250 180 250 260 Q 250 480 60 520 L 40 480 Q 210 440 210 280 Z', advanceWidth: 320, type: 'direct', createdAt: now },
      { id: 'seen', trigger: 'س', svgPath: 'M 300 250 L 300 380 L 270 380 L 270 280 L 210 280 L 210 380 Z', advanceWidth: 340, type: 'direct', createdAt: now },
      { id: 'lam', trigger: 'ل', svgPath: 'M 200 50 L 230 50 L 230 400 C 230 520 160 580 80 520 Z', advanceWidth: 280, type: 'direct', createdAt: now },
      { id: 'yem', trigger: 'ي', svgPath: 'M 250 250 Q 220 300 160 300 Q 80 300 80 400 Z', advanceWidth: 300, type: 'direct', createdAt: now },
      { id: 'glyph_allah', trigger: 'الله', svgPath: 'M 320 50 L 350 50 L 350 400 L 290 400 L 290 180 L 240 180 L 240 400 Z', advanceWidth: 380, type: 'ligature', createdAt: now },
    ],
  };

  return {
    id: safeId,
    name: family,
    nameEn: family,
    category,
    designer: 'مكتبة الخطوط الرسمية',
    description: `خط ${family} الأصلي المجلوب مباشرة من API الخطوط. يتيح التثبيت والتحميل الكامل بملفات TTF/WOFF2.`,
    tags: ['خط حُر', category, 'مباشر', 'أصلي'],
    weights: item.variants.map((v) => (v === 'regular' ? '400 Regular' : v === 'italic' ? '400 Italic' : v)),
    sampleText: `بسم الله الرحمن الرحيم - تجربة خط ${family} العربي الحقيقي`,
    googleFamily: family,
    isGoogleFont: true,
    directFontFiles: item.files,
    fontFamilyFallback: `'${family}', 'Cairo', sans-serif`,
    project,
  };
}

/**
 * Fetches real fonts directly from Google Fonts API
 */
export async function fetchLiveGoogleFonts(): Promise<GalleryFontItem[]> {
  try {
    const url = `https://www.googleapis.com/webfonts/v1/webfonts?key=${GOOGLE_FONTS_API_KEY}&sort=popularity`;
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google Fonts API HTTP error: ${res.status}`);
    }
    const data: GoogleFontApiResponse = await res.json();
    if (!data.items || !Array.isArray(data.items)) {
      return [];
    }

    // Filter Arabic subset fonts first, or include top popular fonts
    const arabicItems = data.items.filter((item) => item.subsets && item.subsets.includes('arabic'));

    // If arabic fonts found, transform them; otherwise map top popular fonts
    const targetItems = arabicItems.length > 0 ? arabicItems : data.items.slice(0, 30);

    return targetItems.map(transformGoogleApiItemToGalleryItem);
  } catch (err) {
    console.warn('Live Google Fonts API fetch error:', err);
    return [];
  }
}

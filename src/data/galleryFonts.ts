import { FontProject } from '../types';
import { GOOGLE_ARABIC_GALLERY_ITEMS, ensureGoogleFontLoaded } from './googleFonts';

export interface GalleryFontItem {
  id: string;
  name: string;
  nameEn: string;
  category: 'كوفي' | 'نسخ' | 'ثلث' | 'رقعة' | 'ديواني' | 'حديث';
  designer: string;
  description: string;
  tags: string[];
  weights: string[];
  sampleText?: string;
  googleFamily?: string;
  isGoogleFont?: boolean;
  directFontFiles?: Record<string, string>;
  fontFamilyFallback: string;
  project: FontProject;
}

// Automatically ensure Google Fonts are initialized
if (typeof window !== 'undefined') {
  GOOGLE_ARABIC_GALLERY_ITEMS.forEach((f) => {
    if (f.googleFamily) {
      ensureGoogleFontLoaded(f.googleFamily);
    }
  });
}

// Export official list of Google Fonts in the Gallery
export const GALLERY_FONTS: GalleryFontItem[] = GOOGLE_ARABIC_GALLERY_ITEMS;

export const SAMPLE_TEXT_PRESETS = [
  { label: 'بسملة', text: 'بسم الله الرحمن الرحيم' },
  { label: 'شعار دكتور الخطوط', text: 'دكتور الخطوط - منصة ابتكار وتصميم الخطوط الرقمية' },
  { label: 'حروف هجائية', text: 'أ ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن هـ و ي' },
  { label: 'عبارة جمالية', text: 'جمال الخط العربي يعكس أصالة الفكر والإبداع' },
  { label: 'شعر عربي', text: 'الخَيلُ وَاللَيلُ وَالبَيداءُ تَعرِفُني وَالسَيفُ وَالرُمحُ وَالقِرطاسُ وَالقَلَمُ' },
  { label: 'عنوان تسويقي', text: 'تصاميم احترافية وهويات بصرية متميزة مع الخطوط العربية' },
];

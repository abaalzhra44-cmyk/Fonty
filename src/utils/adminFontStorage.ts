export interface AdminFontRecord {
  id: string;
  name: string;
  nameEn: string;
  category: 'كوفي' | 'نسخ' | 'ثلث' | 'رقعة' | 'ديواني' | 'حديث' | 'عناوين';
  designer: string;
  description: string;
  status: 'مقبول' | 'مرفوض' | 'موصى به' | 'معتمد' | 'جديد' | 'خاص';
  fileName: string;
  fileSize: string;
  fileType: 'TTF' | 'OTF' | 'WOFF' | 'WOFF2';
  fontDataUrl?: string; // Base64 data URL for preview rendering
  fontFamilyName: string; // Dynamic css font-family
  downloads: number;
  glyphsCount: number;
  uploadedAt: string;
}

const STORAGE_KEY = 'dr_fonts_admin_database_fonts';

const INITIAL_ADMIN_FONTS: AdminFontRecord[] = [
  {
    id: 'af_1',
    name: 'خط الثلث الجلي الحديث',
    nameEn: 'Thuluth Modern Pro',
    category: 'ثلث',
    designer: 'د. طارق محمد',
    description: 'خط ثلث فاخر مصمم بأبعاد هندسية متطابقة للغلاف والعناوين الفخمة.',
    status: 'مقبول',
    fileName: 'Thuluth_Modern_Pro.ttf',
    fileSize: '1.4 MB',
    fileType: 'TTF',
    fontFamilyName: 'Amiri',
    downloads: 1420,
    glyphsCount: 142,
    uploadedAt: new Date(2026, 7, 2).toISOString(), // Aug 2026
  },
  {
    id: 'af_2',
    name: 'النسخ الرقمي الاحترافي',
    nameEn: 'Naskh Digital Pro',
    category: 'نسخ',
    designer: 'مختبر الخطوط العربية',
    description: 'خط نسخ عالي الوضوح مخصص للنصوص الطويلة والقراءة السلسة على الشاشات.',
    status: 'معتمد',
    fileName: 'Naskh_Pro.ttf',
    fileSize: '890 KB',
    fileType: 'TTF',
    fontFamilyName: 'Cairo',
    downloads: 3890,
    glyphsCount: 210,
    uploadedAt: new Date(2026, 6, 18).toISOString(), // Jul 2026
  },
  {
    id: 'af_3',
    name: 'الديواني الذهبي VIP',
    nameEn: 'Diwani Gold VIP',
    category: 'ديواني',
    designer: 'د. طارق محمد',
    description: 'خط ديواني ملكي منحني للتصميمات الفاخرة وشعارات الشهادات والأوسمة.',
    status: 'موصى به',
    fileName: 'Diwani_Gold_VIP.otf',
    fileSize: '2.1 MB',
    fileType: 'OTF',
    fontFamilyName: 'Aref Ruqaa',
    downloads: 890,
    glyphsCount: 98,
    uploadedAt: new Date(2026, 5, 12).toISOString(), // Jun 2026
  },
  {
    id: 'af_4',
    name: 'الرقعة السريع المطور',
    nameEn: 'Ruqaa Fast Express',
    category: 'رقعة',
    designer: 'استوديو الخطوط',
    description: 'خط رقعة عصري مستوحي من الكتابة السريعة الأنيقة مع تركيبات حرة.',
    status: 'جديد',
    fileName: 'Ruqaa_Fast.ttf',
    fileSize: '750 KB',
    fileType: 'TTF',
    fontFamilyName: 'Aref Ruqaa',
    downloads: 2150,
    glyphsCount: 115,
    uploadedAt: new Date(2026, 7, 4).toISOString(), // Aug 2026
  },
  {
    id: 'af_5',
    name: 'الكوفي الهندسي المربع',
    nameEn: 'Kufi Square Geometry',
    category: 'كوفي',
    designer: 'مختبر المتجهات',
    description: 'خط كوفي بنائي هندسي يعتمد على الزوايا القائمة والاتزان البصري.',
    status: 'مقبول',
    fileName: 'Kufi_Square.otf',
    fileSize: '1.1 MB',
    fileType: 'OTF',
    fontFamilyName: 'Kufam',
    downloads: 1760,
    glyphsCount: 88,
    uploadedAt: new Date(2026, 4, 25).toISOString(), // May 2026
  },
  {
    id: 'af_6',
    name: 'خط وسيم للطباعة التجريبية',
    nameEn: 'Waseem Experimental',
    category: 'حديث',
    designer: 'أحمد الفاروق',
    description: 'خط حديث تجريبي يحتوي على بعض الأخطاء التكوينية في المسافات.',
    status: 'مرفوض',
    fileName: 'Waseem_Exp.ttf',
    fileSize: '620 KB',
    fileType: 'TTF',
    fontFamilyName: 'Cairo',
    downloads: 45,
    glyphsCount: 64,
    uploadedAt: new Date(2026, 7, 1).toISOString(), // Aug 2026
  },
  {
    id: 'af_7',
    name: 'الكوفي القيرواني القديم',
    nameEn: 'Kairouan Kufi Historic',
    category: 'كوفي',
    designer: 'مركز التراث الخطي',
    description: 'محاكاة رقمية دقيقة لمخطوطات المصاحف القيروانية القديمة.',
    status: 'مقبول',
    fileName: 'Kairouan_Kufi.otf',
    fileSize: '1.8 MB',
    fileType: 'OTF',
    fontFamilyName: 'Amiri',
    downloads: 3120,
    glyphsCount: 175,
    uploadedAt: new Date(2026, 3, 10).toISOString(), // Apr 2026
  },
  {
    id: 'af_8',
    name: 'خط العناوين الصحفية الحاد',
    nameEn: 'Sharpe Headlines Press',
    category: 'عناوين',
    designer: 'دار النشر الرقمية',
    description: 'خط مخصص للمانشيتات الكبيرة والصحف الرقمية بعرض عالي وجرأة عالية.',
    status: 'مقبول',
    fileName: 'Press_Headlines.ttf',
    fileSize: '920 KB',
    fileType: 'TTF',
    fontFamilyName: 'Cairo',
    downloads: 4100,
    glyphsCount: 130,
    uploadedAt: new Date(2026, 2, 14).toISOString(), // Mar 2026
  },
  {
    id: 'af_9',
    name: 'النسخ المائل للخطابات',
    nameEn: 'Naskh Slanted Corporate',
    category: 'نسخ',
    designer: 'مؤسسة البيان',
    description: 'خط نسخ مائل رصين للمراسلات الرسمية والشهادات الحكومية.',
    status: 'مرفوض',
    fileName: 'Naskh_Slanted.ttf',
    fileSize: '540 KB',
    fileType: 'TTF',
    fontFamilyName: 'Amiri',
    downloads: 120,
    glyphsCount: 92,
    uploadedAt: new Date(2026, 6, 29).toISOString(), // Jul 2026
  },
  {
    id: 'af_10',
    name: 'الثلث الفارس الشاهنشاهي',
    nameEn: 'Thuluth Shahanshah',
    category: 'ثلث',
    designer: 'استوديو الخط العربي',
    description: 'تراكيب ثلثية شاهنشاهية مع تذهيب تلقائي وزخارف حواف.',
    status: 'موصى به',
    fileName: 'Thuluth_Shah.otf',
    fileSize: '2.5 MB',
    fileType: 'OTF',
    fontFamilyName: 'Aref Ruqaa',
    downloads: 2890,
    glyphsCount: 220,
    uploadedAt: new Date(2026, 1, 22).toISOString(), // Feb 2026
  },
];

export const ADMIN_FONTS_EVENT = 'dr_fonts_admin_database_update';

export function getAdminFonts(): AdminFontRecord[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ADMIN_FONTS));
      return INITIAL_ADMIN_FONTS;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_ADMIN_FONTS;
  }
}

export function saveAdminFont(font: AdminFontRecord): void {
  const current = getAdminFonts();
  const existingIdx = current.findIndex((f) => f.id === font.id);
  let updated: AdminFontRecord[];
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = font;
  } else {
    updated = [font, ...current];
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(ADMIN_FONTS_EVENT));
}

export function updateAdminFontStatus(id: string, status: AdminFontRecord['status']): void {
  const current = getAdminFonts();
  const font = current.find((f) => f.id === id);
  if (font) {
    font.status = status;
    saveAdminFont(font);
  }
}

export function deleteAdminFont(id: string): void {
  const current = getAdminFonts();
  const updated = current.filter((f) => f.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new Event(ADMIN_FONTS_EVENT));
}

/**
 * Loads custom font binary buffer into browser FontFace API dynamically
 */
export async function loadCustomFontFace(fontRecord: AdminFontRecord): Promise<boolean> {
  if (!fontRecord.fontDataUrl) return false;
  try {
    const fontFace = new FontFace(fontRecord.fontFamilyName, `url(${fontRecord.fontDataUrl})`);
    const loadedFace = await fontFace.load();
    document.fonts.add(loadedFace);
    return true;
  } catch (err) {
    console.warn('Failed to load dynamic font face:', err);
    return false;
  }
}

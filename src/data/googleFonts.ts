import { FontProject, FontSettings } from '../types';
import { GalleryFontItem } from './galleryFonts';

export interface GoogleFontDefinition {
  id: string;
  name: string;
  nameEn: string;
  category: 'كوفي' | 'نسخ' | 'ثلث' | 'رقعة' | 'ديواني' | 'حديث';
  designer: string;
  description: string;
  googleFamily: string; // Exact Google Fonts family name e.g. "Cairo", "Aref Ruqaa"
  googleFontQuery: string; // e.g. "Cairo:wght@400;700"
  tags: string[];
  weights: string[];
  sampleText: string;
}

// Helper to inject Google Font dynamically into document head
const loadedGoogleFonts = new Set<string>();

export function ensureGoogleFontLoaded(
  googleFamily: string,
  fontQueryParam?: string,
  directFiles?: Record<string, string>
) {
  if (!googleFamily || loadedGoogleFonts.has(googleFamily)) return;

  const safeId = googleFamily.toLowerCase().replace(/[^a-z0-9]/g, '-');

  // If direct binary font URLs exist (from Google API), register @font-face directly
  if (directFiles && Object.keys(directFiles).length > 0) {
    const styleId = `google-font-style-${safeId}`;
    if (!document.getElementById(styleId)) {
      const styleEl = document.createElement('style');
      styleEl.id = styleId;
      let css = '';
      for (const [variant, url] of Object.entries(directFiles)) {
        const weightMatch = variant.match(/\d+/);
        const weight = weightMatch ? weightMatch[0] : variant.includes('bold') ? '700' : '400';
        const isItalic = variant.includes('italic');
        css += `
@font-face {
  font-family: '${googleFamily}';
  src: url('${url.replace(/^http:/, 'https:')}') format('truetype');
  font-weight: ${weight};
  font-style: ${isItalic ? 'italic' : 'normal'};
  font-display: swap;
}
`;
      }
      styleEl.textContent = css;
      document.head.appendChild(styleEl);
    }
  } else {
    // Inject stylesheet link for Google Font
    const linkId = `google-font-${safeId}`;
    if (!document.getElementById(linkId)) {
      const fontQuery = fontQueryParam || googleFamily.replace(/\s+/g, '+');
      const link = document.createElement('link');
      link.id = linkId;
      link.rel = 'stylesheet';
      link.href = `https://fonts.googleapis.com/css2?family=${fontQuery}&display=swap`;
      document.head.appendChild(link);
    }
  }

  loadedGoogleFonts.add(googleFamily);
}

// Convert Google Font Definition to a full GalleryFontItem
export function createGoogleGalleryFontItem(def: GoogleFontDefinition): GalleryFontItem {
  const now = Date.now();
  ensureGoogleFontLoaded(def.googleFamily, def.googleFontQuery);

  const settings: FontSettings = {
    fontName: def.name,
    designer: def.designer,
    description: def.description,
    copyright: 'رخصة خطوط حرة ومفتوحة (OFL)',
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
    id: def.id,
    name: def.name,
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
    id: def.id,
    name: def.name,
    nameEn: def.nameEn,
    category: def.category,
    designer: def.designer,
    description: def.description,
    tags: def.tags,
    weights: def.weights,
    sampleText: def.sampleText,
    googleFamily: def.googleFamily,
    isGoogleFont: true,
    fontFamilyFallback: `'${def.googleFamily}', 'Cairo', sans-serif`,
    project,
  };
}

// Authentic Google Arabic Fonts Catalogue
export const GOOGLE_ARABIC_FONTS_DEFINITIONS: GoogleFontDefinition[] = [
  {
    id: 'cairo',
    name: 'خط القاهرة (Cairo)',
    nameEn: 'Cairo',
    category: 'حديث',
    designer: 'Mohamed Gaber (Khtt Foundation)',
    description: 'خط عربي حديث يدمج بين الخط الكوفي المربع والهندسة المعاصرة، مرن جداً وممتاز للواجهات والشاشات وتصميم التطبيقات.',
    googleFamily: 'Cairo',
    googleFontQuery: 'Cairo:wght@300;400;600;700;800;900',
    tags: ['خط حُر', 'حديث', 'واجهات', 'كوفي', 'تطبيقات'],
    weights: ['300 Light', '400 Regular', '600 SemiBold', '700 Bold', '900 Black'],
    sampleText: 'خط القاهرة - خط عصري متكامل للواجهات والمطبوعات الرقمية',
  },
  {
    id: 'amiri',
    name: 'الخط الأميري (Amiri)',
    nameEn: 'Amiri',
    category: 'نسخ',
    designer: 'د. خالد حسني (Khaled Hosny)',
    description: 'إحياء للمطبعة الأميرية العريقة ببولاق، خط نسخ كلاسيكي رفيع المستوى مصمم للنصوص الطويلة والمؤلفات والقرآن الكريم.',
    googleFamily: 'Amiri',
    googleFontQuery: 'Amiri:ital,wght@0,400;0,700;1,400;1,700',
    tags: ['خط حُر', 'نسخ', 'أميري', 'قرآني', 'كلاسيكي'],
    weights: ['Regular', 'Bold', 'Italics'],
    sampleText: 'بسم الله الرحمن الرحيم - الخط الأميري إحياء لتراث المطبعة الأميرية',
  },
  {
    id: 'aref-ruqaa',
    name: 'خط عارف رقعة (Aref Ruqaa)',
    nameEn: 'Aref Ruqaa',
    category: 'رقعة',
    designer: 'عبدالله عارف وخالد حسني',
    description: 'خط رقعة كلاسيكي رشيق يجسد جماليات الخط اليدوي العربي السريع وانسجام زواياه في الدواوين والمستندات.',
    googleFamily: 'Aref Ruqaa',
    googleFontQuery: 'Aref+Ruqaa:wght@400;700',
    tags: ['خط حُر', 'رقعة', 'يدوي', 'شعر', 'تواقيع'],
    weights: ['Regular', 'Bold'],
    sampleText: 'سبحان الله وبحمده - جمال خط الرقعة العربي السريع',
  },
  {
    id: 'reem-kufi',
    name: 'خط ريم كوفي (Reem Kufi)',
    nameEn: 'Reem Kufi',
    category: 'كوفي',
    designer: 'Khajag Apelian',
    description: 'خط كوفي زاهي ومستوحى من تصميم اللافتات التاريخية بالقاهرة، ممتاز للشعارات واللوحات وتصاميم الهوية.',
    googleFamily: 'Reem Kufi',
    googleFontQuery: 'Reem+Kufi:wght@400;500;600;700',
    tags: ['خط حُر', 'كوفي', 'شعارات', 'هندسي', 'تراثي'],
    weights: ['Regular', 'Medium', 'SemiBold', 'Bold'],
    sampleText: 'دكتور الخطوط - تصميم خط كوفي متميز للهويات والتصاميم',
  },
  {
    id: 'tajawal',
    name: 'خط تجوال (Tajawal)',
    nameEn: 'Tajawal',
    category: 'حديث',
    designer: 'Boutros Fonts',
    description: 'خط عربي حديث بانسيابية هادئة وأحرف واضحة جداً للقراءة على مختلف الأجهزة وشاشات الجوال.',
    googleFamily: 'Tajawal',
    googleFontQuery: 'Tajawal:wght@300;400;500;700;800',
    tags: ['خط حُر', 'حديث', 'مجلات', 'عصري', 'شاشات'],
    weights: ['Light', 'Regular', 'Medium', 'Bold', 'ExtraBold'],
    sampleText: 'اللغة العربية لغة الفصاحة والبلاغة والجمال الرقمي',
  },
  {
    id: 'changa',
    name: 'خط شانجا العريض (Changa)',
    nameEn: 'Changa',
    category: 'حديث',
    designer: 'Eduardo Tunni & Mohamed Gaber',
    description: 'خط عرض (Display) بارز جداً ذو أضلاع قوية وحضور بصري لافت للملصقات والإعلانات وسوشيال ميديا.',
    googleFamily: 'Changa',
    googleFontQuery: 'Changa:wght@400;600;700;800',
    tags: ['خط حُر', 'بارز', 'ملصقات', 'عريض', 'سوشيال'],
    weights: ['Regular', 'SemiBold', 'Bold', 'ExtraBold'],
    sampleText: 'عروض حصرية وتصاميم مبتكرة مع خط شانجا العريض',
  },
  {
    id: 'scheherazade-new',
    name: 'خط شهرزاد الجديد (Scheherazade New)',
    nameEn: 'Scheherazade New',
    category: 'نسخ',
    designer: 'SIL International',
    description: 'خط نسخ تقليدي متقدم يدعم الحركات كاملة والضبط التام للنصوص والأشعار والكتب والمخطوطات.',
    googleFamily: 'Scheherazade New',
    googleFontQuery: 'Scheherazade+New:wght@400;700',
    tags: ['خط حُر', 'نسخ', 'مخطوطات', 'كتب', 'تقليدي'],
    weights: ['Regular', 'Bold'],
    sampleText: 'وَقُل رَّبِّ زِدْنِي عِلْمًا - خط شهرزاد النسخي الأصيل',
  },
  {
    id: 'el-messiri',
    name: 'خط المسيري (El Messiri)',
    nameEn: 'El Messiri',
    category: 'حديث',
    designer: 'Mohamed Gaber',
    description: 'خط عربي ذكي بلمسات انحنائية راقية تجمع بين الرقعة والخط المعاصر، رائع للعناوين والشعارات المتميزة.',
    googleFamily: 'El Messiri',
    googleFontQuery: 'El+Messiri:wght@400;500;600;700',
    tags: ['خط حُر', 'أنيق', 'شعارات', 'حديث', 'عناوين'],
    weights: ['Regular', 'Medium', 'SemiBold', 'Bold'],
    sampleText: 'جمال الخط العربي يعكس أصالة الفكر وحس الإبداع',
  },
  {
    id: 'lalezar',
    name: 'خط لاليزار (Lalezar)',
    nameEn: 'Lalezar',
    category: 'حديث',
    designer: 'Borna Izadpanah',
    description: 'خط عريض وجريء مستوحى من ملصقات الأفلام واللافتات السينمائية القديمة، ممتاز لليافطات الكبيرة.',
    googleFamily: 'Lalezar',
    googleFontQuery: 'Lalezar',
    tags: ['خط حُر', 'عريض', 'سينمائي', 'ملصقات', 'بارز'],
    weights: ['Regular'],
    sampleText: 'روائع التصميم العربي والخطوط السينمائية البارزة',
  },
  {
    id: 'alexandria',
    name: 'خط الإسكندرية (Alexandria)',
    nameEn: 'Alexandria',
    category: 'كوفي',
    designer: 'Islam Regaad',
    description: 'خط كوفي حديث وهندسي للغاية بتسعة أوزان متدرجة يناسب كبرى الهويات البصرية والواجهات العالمية.',
    googleFamily: 'Alexandria',
    googleFontQuery: 'Alexandria:wght@300;400;600;700;800;900',
    tags: ['خط حُر', 'هندسي', 'واجهات', 'تسعة أوزان', 'كوفي'],
    weights: ['Thin', 'Light', 'Regular', 'SemiBold', 'Bold', 'Black'],
    sampleText: 'خط الإسكندرية الهندسي الحديث للمشروعات والهويات المتكاملة',
  },
  {
    id: 'marhey',
    name: 'خط مارهي (Marhey)',
    nameEn: 'Marhey',
    category: 'حديث',
    designer: 'Dinamo Typefaces',
    description: 'خط مرح وفاكهي الشكل يمنح التصاميم طاقة إيجابية وخفة حركة ممتازة للعلامات التجارية الشبابية.',
    googleFamily: 'Marhey',
    googleFontQuery: 'Marhey:wght@400;600;700',
    tags: ['خط حُر', 'مرح', 'شبابي', 'فني', 'إعلانات'],
    weights: ['Regular', 'SemiBold', 'Bold'],
    sampleText: 'ابتسم وأبدع معنا في عالم الخطوط العربية الفنية',
  },
  {
    id: 'ibm-plex-arabic',
    name: 'خط IBM Plex Sans Arabic',
    nameEn: 'IBM Plex Sans Arabic',
    category: 'حديث',
    designer: 'Bold Monday & Wael Morcos',
    description: 'الخط الرسمي لشركة IBM باللغة العربية، خط تقني واضح ومحترف للغاية للمحتوى البرمجي والتكنولوجي.',
    googleFamily: 'IBM Plex Sans Arabic',
    googleFontQuery: 'IBM+Plex+Sans+Arabic:wght@300;400;500;600;700',
    tags: ['خط حُر', 'تقني', 'برمجة', 'احترافي', 'واجهات'],
    weights: ['Light', 'Regular', 'Medium', 'SemiBold', 'Bold'],
    sampleText: 'تكنولوجيا تصميم الخطوط والأنظمة الرقمية المتقدمة',
  },
  {
    id: 'readex-pro',
    name: 'خط ريديكس برو (Readex Pro)',
    nameEn: 'Readex Pro',
    category: 'حديث',
    designer: 'Thomas Jockin & Nadine Chahine',
    description: 'خط مصمم خصيصاً لتحسين سهولة القراءة السريعة وسلاسة العين أثناء تصفح المواقع والمستندات.',
    googleFamily: 'Readex Pro',
    googleFontQuery: 'Readex+Pro:wght@300;400;500;600;700',
    tags: ['خط حُر', 'قراءة', 'تطبيقات', 'مواقع', 'نظيف'],
    weights: ['ExtraLight', 'Light', 'Regular', 'Medium', 'Bold'],
    sampleText: 'قراءة مريحة وسلسة عبر جميع الشاشات والمتصفحات',
  },
  {
    id: 'ruwudu',
    name: 'خط روودو الثلثي (Ruwudu)',
    nameEn: 'Ruwudu',
    category: 'ثلث',
    designer: 'SIL International',
    description: 'خط ثلثي راقي ذو تلاحمات كلاسيكية تحاكي رسم المخطوطات واللوحات التاريخية بالريشة والقصبة.',
    googleFamily: 'Ruwudu',
    googleFontQuery: 'Ruwudu:wght@400;500;600;700',
    tags: ['خط حُر', 'ثلث', 'لوحات', 'تراث', 'فخم'],
    weights: ['Regular', 'Medium', 'SemiBold', 'Bold'],
    sampleText: 'وَمَن يَتَوَكَّلْ عَلَى اللَّهِ فَهُوَ حَسْبُهُ - خط ثلث فخم',
  },
  {
    id: 'lateef',
    name: 'خط لطيف (Lateef)',
    nameEn: 'Lateef',
    category: 'نسخ',
    designer: 'SIL International',
    description: 'خط نسخ دافئ وودود يناسب كتب الأطفال والقصص والمقالات الأدبية الخفيفة.',
    googleFamily: 'Lateef',
    googleFontQuery: 'Lateef:wght@400;700',
    tags: ['خط حُر', 'نسخ', 'قصص', 'أطفال', 'لطيف'],
    weights: ['Regular', 'Bold'],
    sampleText: 'الخيل والليل والبيداء تعرفني والذئب والرمح والقرطاس والقلم',
  },
  {
    id: 'kufam',
    name: 'خط كوفام (Kufam)',
    nameEn: 'Kufam',
    category: 'كوفي',
    designer: 'Wael Morcos & Artur Schmal',
    description: 'خط كوفي حبر مستوحى من الخطوط الحضرية واللافتات المعاصرة في شوارع المدن العربية.',
    googleFamily: 'Kufam',
    googleFontQuery: 'Kufam:ital,wght@0,400;0,600;0,700;1,400',
    tags: ['خط حُر', 'كوفي', 'حضري', 'عصري', 'عناوين'],
    weights: ['Regular', 'SemiBold', 'Bold', 'Italic'],
    sampleText: 'ابتكار دائم في فن الخط العربي المعاصر والأنماط الرقمية',
  }
];

export const GOOGLE_ARABIC_GALLERY_ITEMS: GalleryFontItem[] = GOOGLE_ARABIC_FONTS_DEFINITIONS.map(
  createGoogleGalleryFontItem
);

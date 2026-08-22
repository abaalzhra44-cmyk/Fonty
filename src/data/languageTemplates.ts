export interface LanguageTemplate {
  id: string;
  name: string;
  nativeName: string;
  charCount: number;
  characters: string[];
  description: string;
  category: 'rtl' | 'ltr';
}

export const languageTemplates: LanguageTemplate[] = [
  {
    id: 'arabic',
    name: 'العربية',
    nativeName: 'الأبجدية العربية',
    charCount: 29,
    category: 'rtl',
    description: 'الحروف العربية الأساسية مع أشكال الهمزة والتاء المربوطة',
    characters: [
      'أ', 'ب', 'ت', 'ث', 'ج', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز', 'س', 'ش',
      'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ك', 'ل', 'م', 'ن', 'هـ', 'و', 'ي', 'ء'
    ],
  },
  {
    id: 'english',
    name: 'الإنجليزية',
    nativeName: 'English Alphabet',
    charCount: 26,
    category: 'ltr',
    description: 'الحروف الإنجليزية الكبيرة والصغيرة A-Z / a-z',
    characters: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ],
  },
  {
    id: 'french',
    name: 'الفرنسية',
    nativeName: 'Français',
    charCount: 30,
    category: 'ltr',
    description: 'الأبجدية الفرنسية مع الحروف المركبة والنبرات (é, è, ç, à...)',
    characters: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'é', 'è', 'à', 'ç'
    ],
  },
  {
    id: 'spanish',
    name: 'الإسبانية',
    nativeName: 'Español',
    charCount: 27,
    category: 'ltr',
    description: 'الحروف الإسبانية متضمنة حرف Ñ والنبرات الحادة',
    characters: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'Ñ', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'
    ],
  },
  {
    id: 'german',
    name: 'الألمانية',
    nativeName: 'Deutsch',
    charCount: 30,
    category: 'ltr',
    description: 'الأبجدية الألمانية مع حروف Umlaut وحرف ß',
    characters: [
      'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
      'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
      'Ä', 'Ö', 'Ü', 'ß'
    ],
  },
  {
    id: 'turkish',
    name: 'التركية',
    nativeName: 'Türkçe',
    charCount: 29,
    category: 'ltr',
    description: 'الأبجدية التركية الحديثة بحروفها الخاصة (Ç, Ğ, I, İ, Ö, Ş, Ü)',
    characters: [
      'A', 'B', 'C', 'Ç', 'D', 'E', 'F', 'G', 'Ğ', 'H', 'I', 'İ', 'J', 'K', 'L', 'M',
      'N', 'O', 'Ö', 'P', 'R', 'S', 'Ş', 'T', 'U', 'Ü', 'V', 'Y', 'Z'
    ],
  },
  {
    id: 'russian',
    name: 'الروسية',
    nativeName: 'Русский',
    charCount: 33,
    category: 'ltr',
    description: 'الأبجدية الكيريلية الروسية كاملة (33 حرفاً)',
    characters: [
      'А', 'Б', 'В', 'Г', 'Д', 'Е', 'Ё', 'Ж', 'З', 'И', 'Й', 'К', 'Л', 'М',
      'Н', 'О', 'П', 'Р', 'С', 'Т', 'У', 'Ф', 'Х', 'Ц', 'Ч', 'Ш', 'Щ', 'Ъ',
      'Ы', 'Ь', 'Э', 'Ю', 'Я'
    ],
  },
  {
    id: 'persian',
    name: 'الفارسية',
    nativeName: 'فارسی',
    charCount: 32,
    category: 'rtl',
    description: 'الأبجدية الفارسية شاملة الحروف الأربعة الإضافية (گ, چ, پ, ژ)',
    characters: [
      'آ', 'ا', 'ب', 'پ', 'ت', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ذ', 'ر', 'ز',
      'ژ', 'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'و', 'هـ', 'ی'
    ],
  },
  {
    id: 'urdu',
    name: 'الأردو',
    nativeName: 'اردو',
    charCount: 38,
    category: 'rtl',
    description: 'الأبجدية الأردية الكاملة بحروفها الخاصة (ٹ, ڈ, ڑ, ں...)',
    characters: [
      'ا', 'آ', 'ب', 'پ', 'ت', 'ٹ', 'ث', 'ج', 'چ', 'ح', 'خ', 'د', 'ڈ', 'ذ', 'ر', 'ڑ', 'ز', 'ژ',
      'س', 'ش', 'ص', 'ض', 'ط', 'ظ', 'ع', 'غ', 'ف', 'ق', 'ک', 'گ', 'ل', 'م', 'ن', 'ں', 'و', 'ہ', 'ء', 'ی', 'ے'
    ],
  },
];

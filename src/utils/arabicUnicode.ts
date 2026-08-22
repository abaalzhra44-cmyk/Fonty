// Complete Arabic Unicode Metadata, Shaping Engine, and Ligature Helper

export interface ArabicCharMeta {
  basic: number;
  isol: number;
  fina: number;
  init?: number;
  medi?: number;
}

export const ARABIC_CHAR_MAP: Record<string, ArabicCharMeta> = {
  'ء': { basic: 0x0621, isol: 0xFE80, fina: 0xFE80 },
  'آ': { basic: 0x0622, isol: 0xFE81, fina: 0xFE82 },
  'أ': { basic: 0x0623, isol: 0xFE83, fina: 0xFE84 },
  'ؤ': { basic: 0x0624, isol: 0xFE85, fina: 0xFE86 },
  'إ': { basic: 0x0625, isol: 0xFE87, fina: 0xFE88 },
  'ئ': { basic: 0x0626, isol: 0xFE89, fina: 0xFE8A, init: 0xFE8B, medi: 0xFE8C },
  'ا': { basic: 0x0627, isol: 0xFE8D, fina: 0xFE8E },
  'ب': { basic: 0x0628, isol: 0xFE8F, fina: 0xFE90, init: 0xFE91, medi: 0xFE92 },
  'ة': { basic: 0x0629, isol: 0xFE93, fina: 0xFE94 },
  'ت': { basic: 0x062A, isol: 0xFE95, fina: 0xFE96, init: 0xFE97, medi: 0xFE98 },
  'ث': { basic: 0x062B, isol: 0xFE99, fina: 0xFE9A, init: 0xFE9B, medi: 0xFE9C },
  'ج': { basic: 0x062C, isol: 0xFE9D, fina: 0xFE9E, init: 0xFE9F, medi: 0xFEA0 },
  'ح': { basic: 0x062D, isol: 0xFEA1, fina: 0xFEA2, init: 0xFEA3, medi: 0xFEA4 },
  'خ': { basic: 0x062E, isol: 0xFEA5, fina: 0xFEA6, init: 0xFEA7, medi: 0xFEA8 },
  'د': { basic: 0x062F, isol: 0xFEA9, fina: 0xFEAA },
  'ذ': { basic: 0x0630, isol: 0xFEAB, fina: 0xFEAC },
  'ر': { basic: 0x0631, isol: 0xFEAD, fina: 0xFEAE },
  'ز': { basic: 0x0632, isol: 0xFEAF, fina: 0xFEB0 },
  'س': { basic: 0x0633, isol: 0xFEB1, fina: 0xFEB2, init: 0xFEB3, medi: 0xFEB4 },
  'ش': { basic: 0x0634, isol: 0xFEB5, fina: 0xFEB6, init: 0xFEB7, medi: 0xFEB8 },
  'ص': { basic: 0x0635, isol: 0xFEB9, fina: 0xFEBA, init: 0xFEBB, medi: 0xFEBC },
  'ض': { basic: 0x0636, isol: 0xFEBD, fina: 0xFEBE, init: 0xFEBF, medi: 0xFEC0 },
  'ط': { basic: 0x0637, isol: 0xFEC1, fina: 0xFEC2, init: 0xFEC3, medi: 0xFEC4 },
  'ظ': { basic: 0x0638, isol: 0xFEC5, fina: 0xFEC6, init: 0xFEC7, medi: 0xFEC8 },
  'ع': { basic: 0x0639, isol: 0xFEC9, fina: 0xFECA, init: 0xFECB, medi: 0xFECC },
  'غ': { basic: 0x063A, isol: 0xFECD, fina: 0xFECE, init: 0xFECF, medi: 0xFED0 },
  'ف': { basic: 0x0641, isol: 0xFED1, fina: 0xFED2, init: 0xFED3, medi: 0xFED4 },
  'ق': { basic: 0x0642, isol: 0xFED5, fina: 0xFED6, init: 0xFED7, medi: 0xFED8 },
  'ك': { basic: 0x0643, isol: 0xFED9, fina: 0xFEDA, init: 0xFEDB, medi: 0xFEDC },
  'ل': { basic: 0x0644, isol: 0xFEDD, fina: 0xFEDE, init: 0xFEDF, medi: 0xFEE0 },
  'م': { basic: 0x0645, isol: 0xFEE1, fina: 0xFEE2, init: 0xFEE3, medi: 0xFEE4 },
  'ن': { basic: 0x0646, isol: 0xFEE5, fina: 0xFEE6, init: 0xFEE7, medi: 0xFEE8 },
  'ه': { basic: 0x0647, isol: 0xFEE9, fina: 0xFEEA, init: 0xFEEB, medi: 0xFEEC },
  'و': { basic: 0x0648, isol: 0xFEED, fina: 0xFEEE },
  'ى': { basic: 0x0649, isol: 0xFEEF, fina: 0xFEF0 },
  'ي': { basic: 0x064A, isol: 0xFEF1, fina: 0xFEF2, init: 0xFEF3, medi: 0xFEF4 },
};

// Known Arabic ligatures with dedicated presentation form unicodes
export const ARABIC_LIGATURE_UNICODES: Record<string, number[]> = {
  'لا': [0xFEFB, 0xFEFC],
  'لأ': [0xFEF7, 0xFEF8],
  'لإ': [0xFEF9, 0xFEFA],
  'لآ': [0xFEF5, 0xFEF6],
};

// Arabic letters that do NOT connect to the following letter (Right-joining only)
const NON_CONNECTING_TO_LEFT = new Set([
  'ا', 'أ', 'إ', 'آ', 'د', 'ذ', 'ر', 'ز', 'و', 'ؤ', 'ة', 'ء'
]);

/**
 * Returns unicodes for a trigger string.
 * Supports positional form suffixes like "ب_بداية", "ب_وسط", "ب_نهاية", "ب_منفصل".
 */
export function getUnicodesForTrigger(trigger: string): number[] {
  const trimmed = trigger.trim();

  // Positional form suffixes
  if (trimmed.includes('_')) {
    const parts = trimmed.split('_');
    const baseChar = parts[0];
    const formType = parts[1]?.toLowerCase();
    const meta = ARABIC_CHAR_MAP[baseChar];
    if (meta) {
      if (formType === 'بداية' || formType === 'init') return meta.init ? [meta.init] : [meta.basic];
      if (formType === 'وسط' || formType === 'medi') return meta.medi ? [meta.medi] : [meta.basic];
      if (formType === 'نهاية' || formType === 'fina') return [meta.fina];
      if (formType === 'منفصل' || formType === 'isol') return [meta.isol];
    }
  }

  // Known ligature map (e.g., "لا")
  if (ARABIC_LIGATURE_UNICODES[trimmed]) {
    return ARABIC_LIGATURE_UNICODES[trimmed];
  }

  // Single Arabic character
  if (ARABIC_CHAR_MAP[trimmed]) {
    const meta = ARABIC_CHAR_MAP[trimmed];
    const list = [meta.basic, meta.isol, meta.fina];
    if (meta.init) list.push(meta.init);
    if (meta.medi) list.push(meta.medi);
    return Array.from(new Set(list));
  }

  // Single non-Arabic character
  const chars = Array.from(trimmed);
  if (chars.length === 1) {
    const cp = chars[0].codePointAt(0);
    return cp ? [cp] : [];
  }

  // Multi-character ligature: return empty list here so fontBuilder handles it via PUA & GSUB
  return [];
}

/**
 * Shapes raw Arabic text into contextual presentation form characters (Isolated, Initial, Medial, Final).
 */
export function shapeArabicText(text: string): string {
  if (!text) return '';

  const chars = Array.from(text);
  let result = '';

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i];
    const meta = ARABIC_CHAR_MAP[ch];

    if (!meta) {
      result += ch;
      continue;
    }

    const prevCh = i > 0 ? chars[i - 1] : null;
    const nextCh = i < chars.length - 1 ? chars[i + 1] : null;

    const prevMeta = prevCh ? ARABIC_CHAR_MAP[prevCh] : null;
    const nextMeta = nextCh ? ARABIC_CHAR_MAP[nextCh] : null;

    const connectsPrev = prevMeta && !NON_CONNECTING_TO_LEFT.has(prevCh!);
    const connectsNext = nextMeta && !NON_CONNECTING_TO_LEFT.has(ch);

    let code: number;
    if (connectsPrev && connectsNext && meta.medi) {
      code = meta.medi;
    } else if (connectsPrev && meta.fina) {
      code = meta.fina;
    } else if (connectsNext && meta.init) {
      code = meta.init;
    } else {
      code = meta.isol;
    }

    result += String.fromCodePoint(code);
  }

  return result;
}

/**
 * Replaces matching ligature triggers in a text string with designated replacement characters.
 */
export function processLigaturesInText(
  text: string,
  ligatures: Array<{ trigger: string; replacementChar: string }>
): string {
  if (!text || ligatures.length === 0) return text;

  // Sort ligatures by trigger length descending to match longer phrases first
  const sorted = [...ligatures].sort((a, b) => b.trigger.length - a.trigger.length);

  let currentText = text;
  for (const { trigger, replacementChar } of sorted) {
    if (!trigger) continue;
    currentText = currentText.split(trigger).join(replacementChar);
  }

  return currentText;
}

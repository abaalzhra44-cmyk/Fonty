import { GlyphItem, FontProject } from '../types';
import { shapeArabicText } from './arabicUnicode';

export interface LigaFeatureInfo {
  tag: string;
  nameAr: string;
  nameEn: string;
  descAr: string;
  category: 'standard' | 'discretionary' | 'required' | 'historical' | 'contextual';
}

export const OPENTYPE_LIGA_FEATURES: Record<string, LigaFeatureInfo> = {
  liga: {
    tag: 'liga',
    nameAr: 'تركيبات قياسية (Standard Ligatures)',
    nameEn: 'Standard Ligatures',
    descAr: 'التركيبات الأساسية الواجبة في الخط كتركيبة (الله) و (لا) و (محمد) و (fi) و (fl).',
    category: 'standard',
  },
  dlig: {
    tag: 'dlig',
    nameAr: 'تركيبات اختيارية (Discretionary Ligatures)',
    nameEn: 'Discretionary Ligatures',
    descAr: 'تركيبات جمالية وزخرفية اختيارية كتركيبات (صلعم) و (st) و (ct).',
    category: 'discretionary',
  },
  rlig: {
    tag: 'rlig',
    nameAr: 'تركيبات إجبارية (Required Ligatures)',
    nameEn: 'Required Ligatures',
    descAr: 'تركيبات إجبارية تضمن سلامة قراءة الحروف المتصلة ولا يمكن إيقافها في بعض الأنظمة.',
    category: 'required',
  },
  hlig: {
    tag: 'hlig',
    nameAr: 'تركيبات تاريخية (Historical Ligatures)',
    nameEn: 'Historical Ligatures',
    descAr: 'تركيبات تقليدية وتاريخية تحاكي المخطوطات القديمة.',
    category: 'historical',
  },
  ccmp: {
    tag: 'ccmp',
    nameAr: 'توليف وتفكيك الحركات (Glyph Composition/Decomposition)',
    nameEn: 'Glyph Composition',
    descAr: 'دمج الحركات والتشكيل مع أحرف القاعدة تلقائياً.',
    category: 'standard',
  },
  calt: {
    tag: 'calt',
    nameAr: 'بدائل سياقية (Contextual Alternates)',
    nameEn: 'Contextual Alternates',
    descAr: 'تبديل شكل الحرف بناءً على الحروف المجاورة له قبل وبعد.',
    category: 'contextual',
  },
};

export interface LigaPreset {
  id: string;
  trigger: string;
  nameAr: string;
  featureTag: 'liga' | 'dlig' | 'rlig' | 'hlig' | 'ccmp' | 'calt';
  category: 'islamic' | 'arabic_common' | 'latin_classic' | 'decorations';
  defaultSvgPath?: string;
  advanceWidth?: number;
}

export const LIGA_PRESETS: LigaPreset[] = [
  // Islamic & Ceremonial Ligatures
  {
    id: 'allah',
    trigger: 'الله',
    nameAr: 'لفظ الجلالة (الله)',
    featureTag: 'liga',
    category: 'islamic',
    defaultSvgPath: 'M 320 50 L 350 50 L 350 400 L 290 400 L 290 180 L 240 180 L 240 400 Z',
    advanceWidth: 420,
  },
  {
    id: 'muhammad',
    trigger: 'محمد',
    nameAr: 'اسم النبي (محمد)',
    featureTag: 'liga',
    category: 'islamic',
    defaultSvgPath: 'M 100 200 C 150 150 250 150 300 200 C 350 250 250 350 200 350 Z',
    advanceWidth: 460,
  },
  {
    id: 'pbuh',
    trigger: 'صلى الله عليه وسلم',
    nameAr: 'صلوات كاملة (صلى الله عليه وسلم)',
    featureTag: 'dlig',
    category: 'islamic',
    advanceWidth: 600,
  },
  {
    id: 'jalla',
    trigger: 'جل جلاله',
    nameAr: 'جل جلاله',
    featureTag: 'dlig',
    category: 'islamic',
    advanceWidth: 500,
  },
  {
    id: 'bismillah',
    trigger: 'بسم الله',
    nameAr: 'البسملة (بسم الله)',
    featureTag: 'liga',
    category: 'islamic',
    advanceWidth: 550,
  },
  {
    id: 'akbar',
    trigger: 'الله أكبر',
    nameAr: 'الله أكبر',
    featureTag: 'liga',
    category: 'islamic',
    advanceWidth: 520,
  },
  {
    id: 'salawat_short',
    trigger: 'صلعم',
    nameAr: 'صلعم (اختصار الصلاة)',
    featureTag: 'dlig',
    category: 'islamic',
    advanceWidth: 380,
  },

  // Common Arabic Ligatures
  {
    id: 'lam_alef',
    trigger: 'لا',
    nameAr: 'لام ألف (لا)',
    featureTag: 'liga',
    category: 'arabic_common',
    defaultSvgPath: 'M 120 400 L 120 100 L 280 400 L 280 100',
    advanceWidth: 360,
  },
  {
    id: 'fi',
    trigger: 'في',
    nameAr: 'فاء ياء (في)',
    featureTag: 'liga',
    category: 'arabic_common',
    advanceWidth: 380,
  },
  {
    id: 'an',
    trigger: 'عن',
    nameAr: 'عين نون (عن)',
    featureTag: 'liga',
    category: 'arabic_common',
    advanceWidth: 360,
  },
  {
    id: 'min',
    trigger: 'من',
    nameAr: 'ميم نون (من)',
    featureTag: 'liga',
    category: 'arabic_common',
    advanceWidth: 360,
  },
  {
    id: 'ali',
    trigger: 'علي',
    nameAr: 'عين لام ياء (علي)',
    featureTag: 'liga',
    category: 'arabic_common',
    advanceWidth: 400,
  },
  {
    id: 'salam',
    trigger: 'سلام',
    nameAr: 'سين لام ألف ميم (سلام)',
    featureTag: 'dlig',
    category: 'arabic_common',
    advanceWidth: 480,
  },

  // Latin Classic Ligatures
  {
    id: 'latin_fi',
    trigger: 'fi',
    nameAr: 'fi التركيبة اللاتينية القياسية',
    featureTag: 'liga',
    category: 'latin_classic',
    advanceWidth: 320,
  },
  {
    id: 'latin_fl',
    trigger: 'fl',
    nameAr: 'fl التركيبة اللاتينية القياسية',
    featureTag: 'liga',
    category: 'latin_classic',
    advanceWidth: 320,
  },
  {
    id: 'latin_ffi',
    trigger: 'ffi',
    nameAr: 'ffi تركيبة ثلاثية',
    featureTag: 'liga',
    category: 'latin_classic',
    advanceWidth: 450,
  },
  {
    id: 'latin_ffl',
    trigger: 'ffl',
    nameAr: 'ffl تركيبة ثلاثية',
    featureTag: 'liga',
    category: 'latin_classic',
    advanceWidth: 450,
  },
  {
    id: 'latin_st',
    trigger: 'st',
    nameAr: 'st تركيبة ديكورية',
    featureTag: 'dlig',
    category: 'latin_classic',
    advanceWidth: 340,
  },
  {
    id: 'latin_ct',
    trigger: 'ct',
    nameAr: 'ct تركيبة تاريخية',
    featureTag: 'hlig',
    category: 'latin_classic',
    advanceWidth: 340,
  },
];

/**
 * Generates official Adobe OpenType FEA (Font Feature Syntax) representation
 * for all GSUB ligatures and alternates programmed in a FontProject.
 */
export function generateOpenTypeFeaCode(project: FontProject): string {
  const glyphs = project.glyphs || [];
  const fontName = project.settings.fontName || 'Fonty';

  const ligatures = glyphs.filter((g) => g.type === 'ligature' || (g.trigger && g.trigger.length > 1));
  const alternates = glyphs.filter((g) => g.type === 'alternate');

  let code = `# OpenType Feature File (.fea) for Font: ${fontName}\n`;
  code += `# Generated by Fonty OpenType Liga Studio\n\n`;

  // Languagesystem declarations
  code += `languagesystem DFLT dflt;\n`;
  code += `languagesystem arab dflt;\n`;
  code += `languagesystem latn dflt;\n\n`;

  // Group rules by feature tag
  const rulesByTag: Record<string, string[]> = {};

  // Process Ligatures
  ligatures.forEach((g, idx) => {
    const trigger = g.trigger || '';
    if (!trigger) return;

    const tag = g.featureTag || (trigger.length > 1 ? 'liga' : 'dlig');
    if (!rulesByTag[tag]) rulesByTag[tag] = [];

    const glyphName = `glyph_liga_${idx + 1}_${trigger.replace(/[^a-zA-Z0-9]/g, '')}`;
    const chars = Array.from(trigger);
    
    // Map chars to FEA glyph tokens or unicode hexadecimal representation
    const charTokens = chars.map((ch) => {
      const codePoint = ch.codePointAt(0);
      return codePoint ? `uni${codePoint.toString(16).toUpperCase().padStart(4, '0')}` : ch;
    });

    rulesByTag[tag].push(`  sub ${charTokens.join(' ')} by ${glyphName}; # ${trigger}`);
  });

  // Process Alternates
  alternates.forEach((g, idx) => {
    const trigger = g.trigger || '';
    if (!trigger) return;

    const tag = g.featureTag || 'salt';
    if (!rulesByTag[tag]) rulesByTag[tag] = [];

    const glyphName = `glyph_alt_${idx + 1}_${trigger.replace(/[^a-zA-Z0-9]/g, '')}`;
    const codePoint = trigger.codePointAt(0);
    const token = codePoint ? `uni${codePoint.toString(16).toUpperCase().padStart(4, '0')}` : trigger;

    rulesByTag[tag].push(`  sub ${token} by ${glyphName}; # alternate for ${trigger}`);
  });

  // Build FEA blocks
  const tags = Object.keys(rulesByTag);
  if (tags.length === 0) {
    code += `# No OpenType GSUB Liga rules currently defined.\n`;
    return code;
  }

  tags.sort().forEach((tag) => {
    const featInfo = OPENTYPE_LIGA_FEATURES[tag];
    const commentName = featInfo ? featInfo.nameEn : tag;
    code += `feature ${tag} { # ${commentName}\n`;
    code += rulesByTag[tag].join('\n') + '\n';
    code += `} ${tag};\n\n`;
  });

  return code;
}

/**
 * Traces and substitutes text against a list of active Liga rules for debugging & visual previewing.
 */
export interface TraceToken {
  text: string;
  isLigature: boolean;
  matchedTrigger?: string;
  featureTag?: string;
  glyphId?: string;
}

export function traceLigaSubstitutions(text: string, glyphs: GlyphItem[]): TraceToken[] {
  if (!text) return [];

  const ligatures = glyphs
    .filter((g) => (g.type === 'ligature' || (g.trigger && g.trigger.length > 1)) && g.trigger)
    .sort((a, b) => (b.trigger?.length || 0) - (a.trigger?.length || 0));

  if (ligatures.length === 0) {
    return [{ text, isLigature: false }];
  }

  let remaining = text;
  const result: TraceToken[] = [];

  while (remaining.length > 0) {
    let matched = false;
    for (const lig of ligatures) {
      const trig = lig.trigger!;
      if (remaining.startsWith(trig)) {
        result.push({
          text: trig,
          isLigature: true,
          matchedTrigger: trig,
          featureTag: lig.featureTag || 'liga',
          glyphId: lig.id,
        });
        remaining = remaining.slice(trig.length);
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Consume 1 character
      const firstChar = remaining[0];
      if (result.length > 0 && !result[result.length - 1].isLigature) {
        result[result.length - 1].text += firstChar;
      } else {
        result.push({ text: firstChar, isLigature: false });
      }
      remaining = remaining.slice(1);
    }
  }

  return result;
}

import * as opentype from 'opentype.js';
import { FontProject } from '../types';
import { convertSvgPathToOpentypePath } from './svgToOpentype';
import { getUnicodesForTrigger, ARABIC_LIGATURE_UNICODES, ARABIC_CHAR_MAP, shapeArabicText } from './arabicUnicode';

export interface LigatureReplacement {
  trigger: string;
  replacementChar: string;
}

/**
 * Returns a list of ligature trigger replacements with assigned PUA / presentation form characters.
 * Used for live canvas vector rendering & previews.
 */
export function getLigatureReplacements(project: FontProject): LigatureReplacement[] {
  let puaCounter = 0xE000;
  const replacements: LigatureReplacement[] = [];

  (project.glyphs || []).forEach((g) => {
    if (!g.trigger || g.trigger.trim() === '') return;
    const triggerStr = g.trigger.trim();
    const isMultiChar = triggerStr.length > 1 || g.type === 'ligature';

    if (isMultiChar) {
      const puaCode = puaCounter++;
      const knownUnicodes = ARABIC_LIGATURE_UNICODES[triggerStr];
      const codeToUse = (knownUnicodes && knownUnicodes.length > 0) ? knownUnicodes[0] : puaCode;

      replacements.push({
        trigger: triggerStr,
        replacementChar: String.fromCodePoint(codeToUse),
      });
    }
  });

  return replacements;
}

export function buildOpentypeFont(project: FontProject): opentype.Font {
  const settings = project.settings;
  const glyphs = project.glyphs || [];

  // 1. Define .notdef glyph (Standard required OpenType fallback)
  const notdefPath = new opentype.Path();
  notdefPath.moveTo(100, 0);
  notdefPath.lineTo(100, 700);
  notdefPath.lineTo(500, 700);
  notdefPath.lineTo(500, 0);
  notdefPath.close();

  notdefPath.moveTo(150, 50);
  notdefPath.lineTo(450, 650);
  notdefPath.moveTo(450, 50);
  notdefPath.lineTo(150, 650);

  const notdefGlyph = new opentype.Glyph({
    name: '.notdef',
    advanceWidth: 600,
    path: notdefPath,
  });

  // 2. Space glyph (32 = Space, 160 = Non-breaking space)
  const spacePath = new opentype.Path();
  const spaceGlyph = new opentype.Glyph({
    name: 'space',
    unicodes: [32, 160],
    advanceWidth: 400,
    path: spacePath,
  });

  const fontGlyphs: opentype.Glyph[] = [notdefGlyph, spaceGlyph];
  const usedUnicodes = new Set<number>([32, 160]);
  const charToGlyphIndex = new Map<number, number>();

  // Map space unicodes
  charToGlyphIndex.set(32, 1);
  charToGlyphIndex.set(160, 1);

  let puaCounter = 0xE000;
  const pendingLigatures: Array<{ trigger: string; glyphIndex: number; featureTag?: string }> = [];
  const pendingAlternates: Array<{ trigger: string; glyphIndex: number; featureTag?: string }> = [];

  // Sort glyphs: single characters first, then multi-character ligatures & alternates
  const sortedGlyphs = [...glyphs].sort((a, b) => {
    const aLen = (a.trigger || '').trim().length;
    const bLen = (b.trigger || '').trim().length;
    if (aLen <= 1 && bLen > 1) return -1;
    if (aLen > 1 && bLen <= 1) return 1;
    return 0;
  });

  sortedGlyphs.forEach((g) => {
    if (!g.trigger || g.trigger.trim() === '') return;

    const triggerStr = g.trigger.trim();
    const isAlternate =
      g.type === 'alternate' ||
      (g.featureTag && ['salt', 'ss01', 'ss02', 'ss03', 'ss04', 'ss05', 'swsh'].includes(g.featureTag));
    const isMultiChar = triggerStr.length > 1 || g.type === 'ligature';
    const { path, width } = convertSvgPathToOpentypePath(g.svgPath, settings, g.advanceWidth);

    if (isAlternate) {
      // Alternate glyph (e.g. stylistic alternate, swash, stylistic set)
      const puaCode = puaCounter++;
      usedUnicodes.add(puaCode);

      const glyphName = `${g.featureTag || 'alt'}_${g.id.replace(/[^a-zA-Z0-9_]/g, '')}`;
      const glyphIndex = fontGlyphs.length;

      const glyph = new opentype.Glyph({
        name: glyphName,
        unicodes: [puaCode],
        advanceWidth: width,
        path: path,
      });

      fontGlyphs.push(glyph);

      pendingAlternates.push({
        trigger: triggerStr,
        glyphIndex: glyphIndex,
        featureTag: g.featureTag,
      });
    } else if (!isMultiChar) {
      const rawUnicodes = getUnicodesForTrigger(triggerStr);

      // Filter out unicodes already claimed by previous glyphs
      const unicodes = rawUnicodes.filter((u) => {
        if (usedUnicodes.has(u)) return false;
        usedUnicodes.add(u);
        return true;
      });

      // If all candidate unicodes were taken, assign a PUA codepoint so this glyph remains usable
      if (unicodes.length === 0) {
        const puaCode = puaCounter++;
        unicodes.push(puaCode);
        usedUnicodes.add(puaCode);
      }

      const glyphName = `glyph_${g.id.replace(/[^a-zA-Z0-9_]/g, '')}`;
      const glyphIndex = fontGlyphs.length;

      const glyph = new opentype.Glyph({
        name: glyphName,
        unicodes: unicodes,
        advanceWidth: width,
        path: path,
      });

      fontGlyphs.push(glyph);

      unicodes.forEach((u) => {
        charToGlyphIndex.set(u, glyphIndex);
      });
    } else {
      // Multi-character trigger / Ligature (e.g., "محمد", "سلام", "الله", "لا")
      const puaCode = puaCounter++;
      usedUnicodes.add(puaCode);

      const knownUnicodes = ARABIC_LIGATURE_UNICODES[triggerStr] || [];
      const unicodes = [puaCode];
      knownUnicodes.forEach((u) => {
        if (!usedUnicodes.has(u)) {
          unicodes.push(u);
          usedUnicodes.add(u);
        }
      });

      const glyphName = `comp_${g.id.replace(/[^a-zA-Z0-9_]/g, '')}`;
      const glyphIndex = fontGlyphs.length;

      const glyph = new opentype.Glyph({
        name: glyphName,
        unicodes: unicodes,
        advanceWidth: width,
        path: path,
      });

      fontGlyphs.push(glyph);

      unicodes.forEach((u) => {
        charToGlyphIndex.set(u, glyphIndex);
      });

      pendingLigatures.push({
        trigger: triggerStr,
        glyphIndex: glyphIndex,
        featureTag: g.featureTag,
      });
    }
  });

  // 3. Process GSUB rules (Ligatures & Alternates) and ensure all component glyphs are created in fontGlyphs FIRST
  const scripts = ['arab', 'latn', 'DFLT'];

  const sortedFeatureTags = [
    'init',
    'medi',
    'fina',
    'isol',
    'calt',
    'ccmp',
    'dlig',
    'hlig',
    'liga',
    'rlig',
    'salt',
    'ss01',
    'ss02',
    'ss03',
    'ss04',
    'ss05',
    'swsh',
  ];

  type Rule =
    | { type: 'single'; sub: number; by: number }
    | { type: 'ligature'; sub: number[]; by: number };

  const featureRulesMap = new Map<string, Rule[]>();
  sortedFeatureTags.forEach((tag) => featureRulesMap.set(tag, []));

  const queueRule = (featTag: string, rule: Rule) => {
    if (!featureRulesMap.has(featTag)) {
      featureRulesMap.set(featTag, []);
    }
    const list = featureRulesMap.get(featTag)!;

    const exists = list.some((r) => {
      if (r.type === 'single' && rule.type === 'single') return r.sub === rule.sub && r.by === rule.by;
      if (r.type === 'ligature' && rule.type === 'ligature') return r.sub.join('_') === rule.sub.join('_') && r.by === rule.by;
      return false;
    });

    if (!exists) {
      list.push(rule);
    }
  };

  // Helper to get or auto-create a glyph index for a character in a ligature trigger
  const getOrCreateGlyphIndexForChar = (ch: string): number => {
    const cp = ch.codePointAt(0);
    if (!cp) return 0;

    // 1. Direct check in charToGlyphIndex
    if (charToGlyphIndex.has(cp)) {
      return charToGlyphIndex.get(cp)!;
    }

    // 2. Check meta unicodes (basic, isol, init, medi, fina)
    const meta = ARABIC_CHAR_MAP[ch];
    if (meta) {
      for (const u of [meta.basic, meta.isol, meta.init, meta.medi, meta.fina]) {
        if (u && charToGlyphIndex.has(u)) {
          return charToGlyphIndex.get(u)!;
        }
      }
    }

    // 3. Auto-create fallback glyph for missing character so GSUB indices are valid
    const fallbackUnicodes: number[] = [cp];
    if (meta) {
      [meta.basic, meta.isol, meta.init, meta.medi, meta.fina].forEach((u) => {
        if (u && !usedUnicodes.has(u)) {
          fallbackUnicodes.push(u);
          usedUnicodes.add(u);
        }
      });
    } else {
      usedUnicodes.add(cp);
    }

    const fallbackPath = new opentype.Path();
    const glyphIndex = fontGlyphs.length;
    const fallbackGlyph = new opentype.Glyph({
      name: `auto_${cp.toString(16)}`,
      unicodes: fallbackUnicodes,
      advanceWidth: 400,
      path: fallbackPath,
    });

    fontGlyphs.push(fallbackGlyph);
    fallbackUnicodes.forEach((u) => charToGlyphIndex.set(u, glyphIndex));
    return glyphIndex;
  };

  // A. Single Substitutions / Alternate Glyphs ('salt', 'ss01', 'ss02', 'swsh', etc.)
  pendingAlternates.forEach(({ trigger, glyphIndex, featureTag }) => {
    const chars = Array.from(trigger);
    chars.forEach((ch) => {
      const baseIdx = getOrCreateGlyphIndexForChar(ch);
      const targetTags = featureTag
        ? [featureTag]
        : ['salt', 'ss01', 'ss02', 'swsh'];

      targetTags.forEach((tag) => {
        queueRule(tag, { type: 'single', sub: baseIdx, by: glyphIndex });
      });
    });
  });

  // B. Ligatures ('liga', 'dlig', 'rlig', 'ccmp', 'hlig', 'calt')
  pendingLigatures.forEach(({ trigger, glyphIndex, featureTag }) => {
    const rawChars = Array.from(trigger);

    // Sequence 1: Raw character glyph indices
    const subRawIndices = rawChars.map((ch) => getOrCreateGlyphIndexForChar(ch));

    // Sequence 2: Shaped Arabic presentation forms string
    const shapedStr = shapeArabicText(trigger);
    const shapedChars = Array.from(shapedStr);
    const subShapedIndices = shapedChars.map((ch) => getOrCreateGlyphIndexForChar(ch));

    // Sequence 3: Contextual positional forms (Initial -> Medials -> Final)
    const subContextualIndices: number[] = [];
    rawChars.forEach((ch, idx) => {
      const meta = ARABIC_CHAR_MAP[ch];
      if (meta) {
        let code: number | undefined;
        if (idx === 0) code = meta.init || meta.isol || meta.basic;
        else if (idx === rawChars.length - 1) code = meta.fina || meta.isol || meta.basic;
        else code = meta.medi || meta.basic;

        const charToUse = code ? String.fromCodePoint(code) : ch;
        subContextualIndices.push(getOrCreateGlyphIndexForChar(charToUse));
      } else {
        subContextualIndices.push(getOrCreateGlyphIndexForChar(ch));
      }
    });

    // Sequence 4: Isolated forms (Isolated -> Isolated...)
    const subIsolatedIndices: number[] = [];
    rawChars.forEach((ch) => {
      const meta = ARABIC_CHAR_MAP[ch];
      if (meta && meta.isol) {
        subIsolatedIndices.push(getOrCreateGlyphIndexForChar(String.fromCodePoint(meta.isol)));
      } else {
        subIsolatedIndices.push(getOrCreateGlyphIndexForChar(ch));
      }
    });

    const targetFeatureTags = featureTag
      ? Array.from(new Set([featureTag, 'liga', 'dlig', 'rlig', 'ccmp', 'hlig', 'calt']))
      : ['liga', 'dlig', 'rlig', 'ccmp', 'hlig', 'calt'];

    targetFeatureTags.forEach((feat) => {
      if (rawChars.length > 1) {
        [subRawIndices, subShapedIndices, subContextualIndices, subIsolatedIndices].forEach((seq) => {
          if (seq.length > 1) {
            queueRule(feat, { type: 'ligature', sub: seq, by: glyphIndex });
          }
        });
      } else if (rawChars.length === 1) {
        const baseIdx = subRawIndices[0];
        if (baseIdx) {
          queueRule(feat, { type: 'single', sub: baseIdx, by: glyphIndex });
        }
      }
    });
  });

  // 4. Construct OpenType Font Object AFTER all glyphs (including auto fallback glyphs) are in fontGlyphs
  const font = new opentype.Font({
    familyName: settings.fontName || 'DoctorFont',
    styleName: 'Regular',
    unitsPerEm: 1024,
    ascender: 880,
    descender: -144,
    designer: settings.designer || 'دكتور الخطوط',
    description: settings.description || 'تم الإنشاء بواسطة دكتور الخطوط',
    copyright: settings.copyright || 'جميع الحقوق محفوظة',
    glyphs: fontGlyphs,
  });

  // Set kerningPairs object to prevent opentype.js getPath / kerning errors
  font.kerningPairs = {};

  // 5. Apply all collected GSUB rules in strict alphabetical order of feature tags across scripts
  sortedFeatureTags.forEach((featTag) => {
    const rules = featureRulesMap.get(featTag);
    if (!rules || rules.length === 0) return;

    scripts.forEach((scriptTag) => {
      rules.forEach((rule) => {
        try {
          if (rule.type === 'ligature') {
            (font.substitution as any).addLigature(featTag, { sub: rule.sub, by: rule.by }, scriptTag);
          } else if (rule.type === 'single') {
            (font.substitution as any).addSingle(featTag, { sub: rule.sub, by: rule.by }, scriptTag);
          }
        } catch {
          // Continue if duplicate GSUB rule occurs
        }
      });
    });
  });

  return font;
}

export function generateFontBlob(project: FontProject): Blob {
  const font = buildOpentypeFont(project);
  const arrayBuffer = font.toArrayBuffer();
  return new Blob([arrayBuffer], { type: 'font/ttf' });
}

const activeBlobUrls = new Map<string, string>();
const fontFaceStyleMap = new Map<string, HTMLStyleElement>();

export function registerDynamicFontFace(project: FontProject): string {
  try {
    const blob = generateFontBlob(project);
    const url = URL.createObjectURL(blob);
    const fontId = `dyn_font_${project.id}`;
    const fontName = `DocFont_${project.id.replace(/[^a-zA-Z0-9]/g, '_')}`;

    // Clean up old object URL for this fontId if existing
    const previousUrl = activeBlobUrls.get(fontId);
    if (previousUrl) {
      URL.revokeObjectURL(previousUrl);
    }
    activeBlobUrls.set(fontId, url);

    let styleEl = fontFaceStyleMap.get(fontId);
    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = fontId;
      document.head.appendChild(styleEl);
      fontFaceStyleMap.set(fontId, styleEl);
    }

    styleEl.innerHTML = `
      @font-face {
        font-family: '${fontName}';
        src: url('${url}') format('truetype');
        font-weight: normal;
        font-style: normal;
        font-display: swap;
      }
    `;

    return fontName;
  } catch {
    return 'sans-serif';
  }
}

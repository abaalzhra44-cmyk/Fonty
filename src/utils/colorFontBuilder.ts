import * as opentype from 'opentype.js';
import { FontProject, ColorFontSettings, ColorLayer } from '../types';
import { buildOpentypeFont } from './fontBuilder';
import { defaultColorFontSettings } from './storage';
import { convertSvgPathToOpentypePath } from './svgToOpentype';

/**
 * Converts a hex/RGB color string into a 32-bit BGRA integer for OpenType CPAL v0 tables.
 * CPAL v0 format expects: (B << 24) | (G << 16) | (R << 8) | A
 */
export function colorToBGRAInt(colorStr: string): number {
  let r = 0;
  let g = 0;
  let b = 0;
  let a = 255;

  const hex = colorStr.trim().replace(/^#/, '');

  if (hex.length === 6) {
    r = parseInt(hex.substring(0, 2), 16) || 0;
    g = parseInt(hex.substring(2, 4), 16) || 0;
    b = parseInt(hex.substring(4, 6), 16) || 0;
  } else if (hex.length === 8) {
    r = parseInt(hex.substring(0, 2), 16) || 0;
    g = parseInt(hex.substring(2, 4), 16) || 0;
    b = parseInt(hex.substring(4, 6), 16) || 0;
    a = parseInt(hex.substring(6, 8), 16) || 255;
  } else if (hex.length === 3) {
    r = parseInt(hex[0] + hex[0], 16) || 0;
    g = parseInt(hex[1] + hex[1], 16) || 0;
    b = parseInt(hex[2] + hex[2], 16) || 0;
  } else {
    // Fallback for named colors or invalid input
    r = 30; g = 144; b = 255;
  }

  return ((b << 24) | (g << 16) | (r << 8) | a) >>> 0;
}

/**
 * Parses a raw multi-colored SVG string (e.g. from Adobe Illustrator or Inkscape manuscript export)
 * and separates distinct path colors into a ColorLayer array and palette color list.
 */
export function parseSvgIntoColorLayers(svgContent: string): {
  layers: ColorLayer[];
  extractedColors: string[];
} {
  const layers: ColorLayer[] = [];
  const extractedColors: string[] = [];

  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgContent, 'image/svg+xml');
    const pathElements = Array.from(doc.querySelectorAll('path, rect, circle, polygon, ellipse'));

    const colorMap = new Map<string, string>();

    pathElements.forEach((el, index) => {
      const fill = el.getAttribute('fill') || (el as SVGElement).style?.fill;
      const stroke = el.getAttribute('stroke') || (el as SVGElement).style?.stroke;
      const d = el.getAttribute('d') || '';

      if (!d) return;

      let color = (fill && fill !== 'none') ? fill : (stroke && stroke !== 'none') ? stroke : '#1A237E';

      if (color.startsWith('rgb')) {
        const matches = color.match(/\d+/g);
        if (matches && matches.length >= 3) {
          const r = parseInt(matches[0]).toString(16).padStart(2, '0');
          const g = parseInt(matches[1]).toString(16).padStart(2, '0');
          const b = parseInt(matches[2]).toString(16).padStart(2, '0');
          color = `#${r}${g}${b}`.toUpperCase();
        }
      } else if (!color.startsWith('#')) {
        color = '#1A237E';
      } else {
        color = color.toUpperCase();
      }

      let paletteIndex = extractedColors.indexOf(color);
      if (paletteIndex === -1) {
        paletteIndex = extractedColors.length;
        extractedColors.push(color);
      }

      layers.push({
        id: `layer_${Date.now()}_${index}`,
        name: `طبقة لونية ${index + 1} (${color})`,
        svgPath: d,
        paletteIndex,
      });
    });
  } catch {
    // Fallback if SVG parsing fails
  }

  return { layers, extractedColors };
}

/**
 * Builds an opentype.Font with COLR and CPAL binary tables integrated.
 */
export function buildColorOpentypeFont(project: FontProject): opentype.Font {
  const colorSettings: ColorFontSettings = project.settings.colorFontSettings || defaultColorFontSettings;
  const baseFont = buildOpentypeFont(project);

  if (!colorSettings.enabled) {
    return baseFont;
  }

  const palettes = colorSettings.palettes && colorSettings.palettes.length > 0
    ? colorSettings.palettes
    : defaultColorFontSettings.palettes;

  const numPaletteEntries = Math.max(
    ...palettes.map((p) => p.colors.length),
    1
  );

  // 1. Build CPAL Table
  const colorRecords: number[] = [];
  const colorRecordIndices: number[] = [];

  palettes.forEach((palette, pIdx) => {
    colorRecordIndices.push(colorRecords.length);
    for (let cIdx = 0; cIdx < numPaletteEntries; cIdx++) {
      const hexColor = palette.colors[cIdx] || palette.colors[0] || '#000000';
      colorRecords.push(colorToBGRAInt(hexColor));
    }
  });

  (baseFont.tables as any).cpal = {
    version: 0,
    numPaletteEntries,
    colorRecords,
    colorRecordIndices,
  };

  // 2. Build COLR Table
  const baseGlyphRecords: Array<{ glyphID: number; firstLayerIndex: number; numLayers: number }> = [];
  const layerRecords: Array<{ glyphID: number; paletteIndex: number }> = [];

  const glyphsList = project.glyphs || [];

  glyphsList.forEach((g) => {
    if (!g.colorLayers || g.colorLayers.length === 0) return;

    // Find index of base glyph in font
    const baseGlyphObj = (baseFont.glyphs as any).glyphs;
    let baseGlyphIndex = -1;

    for (const key in baseGlyphObj) {
      if (baseGlyphObj[key].unicodes && g.trigger) {
        const cp = g.trigger.codePointAt(0);
        if (cp && baseGlyphObj[key].unicodes.includes(cp)) {
          baseGlyphIndex = baseGlyphObj[key].index;
          break;
        }
      }
    }

    if (baseGlyphIndex === -1) return;

    const firstLayerIndex = layerRecords.length;

    g.colorLayers.forEach((layer, lIdx) => {
      const { path } = convertSvgPathToOpentypePath(layer.svgPath, project.settings, g.advanceWidth);
      
      const layerGlyph = new opentype.Glyph({
        name: `${g.id}_colr_layer_${lIdx}`,
        unicodes: [],
        advanceWidth: g.advanceWidth || 600,
        path,
      });

      const newGlyphIndex = baseFont.glyphs.length;
      (baseFont.glyphs as any).push(newGlyphIndex, layerGlyph);

      layerRecords.push({
        glyphID: newGlyphIndex,
        paletteIndex: layer.paletteIndex >= 0 ? layer.paletteIndex : 0,
      });
    });

    baseGlyphRecords.push({
      glyphID: baseGlyphIndex,
      firstLayerIndex,
      numLayers: g.colorLayers.length,
    });
  });

  // OpenType COLR spec requires baseGlyphRecords to be sorted ascending by glyphID
  baseGlyphRecords.sort((a, b) => a.glyphID - b.glyphID);

  if (baseGlyphRecords.length > 0) {
    (baseFont.tables as any).colr = {
      version: 0,
      baseGlyphRecords,
      layerRecords,
    };
  }

  return baseFont;
}

/**
 * Generates and returns a Blob for the OpenType Color Font (.ttf).
 */
export function generateColorFontBlob(project: FontProject): Blob {
  const font = buildColorOpentypeFont(project);
  const arrayBuffer = font.toArrayBuffer();
  return new Blob([arrayBuffer], { type: 'font/ttf' });
}

/**
 * Generates web package with CSS @font-palette-values and demo HTML.
 */
export function generateColorWebPackage(project: FontProject): {
  css: string;
  html: string;
  readme: string;
} {
  const fontName = project.settings.fontName || 'FontyColorFont';
  const colorSettings = project.settings.colorFontSettings || defaultColorFontSettings;

  const paletteRules = (colorSettings.palettes || []).map((p, idx) => `
/* لوحة الألوان ${idx + 1}: ${p.name} */
@font-palette-values --${fontName.replace(/\s+/g, '-')}-palette-${idx} {
  font-family: '${fontName}';
  base-palette: ${idx};
  override-colors: ${p.colors.map((c, cIdx) => `${cIdx} ${c}`).join(', ')};
}`).join('\n');

  const css = `/* ==========================================================
 * ${fontName} - OpenType Color Font (COLR/CPAL) Integration CSS
 * تم التوليد بواسطة Fonty فونتي (Fonty Studio)
 * ========================================================== */

@font-face {
  font-family: '${fontName}';
  src: url('./${fontName}.ttf') format('truetype');
  font-weight: normal;
  font-style: normal;
  font-display: swap;
}

${paletteRules}

/* فئات جاهزة للاستخدام باللوحات الملونة */
.font-color-default {
  font-family: '${fontName}', sans-serif;
}

${(colorSettings.palettes || []).map((p, idx) => `
.palette-${idx} {
  font-family: '${fontName}', sans-serif;
  font-palette: --${fontName.replace(/\s+/g, '-')}-palette-${idx};
}`).join('\n')}
`;

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <title>معاينة الخط الملون - ${fontName}</title>
  <link rel="stylesheet" href="./style.css">
  <style>
    body {
      font-family: system-ui, sans-serif;
      background: #0f172a;
      color: #f8fafc;
      padding: 40px;
      line-height: 1.6;
    }
    .card {
      background: #1e293b;
      border: 1px solid #334155;
      border-radius: 16px;
      padding: 24px;
      margin-bottom: 24px;
    }
    .preview-text {
      font-size: 48px;
      line-height: 1.4;
      padding: 20px 0;
    }
    h2 { margin-top: 0; color: #38bdf8; }
  </style>
</head>
<body>
  <h1>الخط الملون الاحترافي (COLR/CPAL): ${fontName}</h1>
  <p>يدعم التبديل المباشر بين لوحات الألوان المتعددة عبر ميزة CSS <code>font-palette</code>!</p>

  ${(colorSettings.palettes || []).map((p, idx) => `
  <div class="card">
    <h2>لوحة الألوان ${idx + 1}: ${p.name}</h2>
    <div class="preview-text palette-${idx}">
      بسم الله الرحمن الرحيم - الخط العربي الملون
    </div>
  </div>
  `).join('\n')}
</body>
</html>`;

  const readme = `# دليل استخدام الخط الملون (COLR/CPAL) - ${fontName}

تهانينا! لقد قمت بتصدير خط ملون احترافي يدعم جداول OpenType الرسمية COLR/CPAL.

## المميزات:
1. **دعم كامل لكافة برامج التصميم**: Photoshop, Illustrator, InDesign, Figma, Canva.
2. **دعم متصفحات المويب الحديثة**: Chrome, Edge, Safari, Firefox.
3. **التحكم باللوحات عبر CSS**: يمكنك التبديل بين اللوحات الملونة بدون إعادة رفع ملفات خطوط إضافية.

## كيفية الاستخدام في الويب:
افتح ملف \`index.html\` واستعرض طريقة الربط عبر \`@font-palette-values\`.
`;

  return { css, html, readme };
}

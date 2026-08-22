export type GlyphType = 'direct' | 'ligature' | 'alternate';

export interface ColorLayer {
  id: string;
  name: string;
  svgPath: string;
  paletteIndex: number;
}

export interface ColorPalette {
  id: string;
  name: string;
  colors: string[];
}

export interface ColorFontSettings {
  enabled: boolean;
  activePaletteIndex: number;
  palettes: ColorPalette[];
}

export interface GlyphItem {
  id: string;
  trigger: string;
  type: GlyphType;
  featureTag?: 'salt' | 'ss01' | 'ss02' | 'ss03' | 'ss04' | 'ss05' | 'swsh' | 'dlig' | 'rlig' | 'ccmp' | string;
  svgPath: string;
  originalImageData?: string;
  advanceWidth?: number;
  leftSideBearing?: number;
  rightSideBearing?: number;
  isFlippedVertical?: boolean;
  createdAt: number;
  colorLayers?: ColorLayer[];
}

export type LicenseType = 'none' | 'OFL' | 'all-rights-reserved' | 'CC-BY';
export type AdvanceWidthMode = 'auto' | 'fixed' | 'per-glyph';

export interface FontSettings {
  fontName: string;
  designer: string;
  description: string;
  copyright: string;
  license: LicenseType;
  advanceWidthMode: AdvanceWidthMode;
  fixedWidthValue: number;
  baselineOffset: number;
  flipVertical: boolean;
  flipHorizontal: boolean;
  autoFitAndCenter: boolean;
  scaleFactor: number;
  horizontalOffset: number;
  verticalOffset: number;
  colorFontSettings?: ColorFontSettings;
}

export interface FontProject {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: FontSettings;
  glyphs: GlyphItem[];
}

export interface RulerPoint {
  x: number;
  y: number;
}

export interface RulerMeasurement {
  p1: RulerPoint;
  p2: RulerPoint;
  distance: number;
}

export interface FontInspectionData {
  name: string;
  familyName: string;
  styleName: string;
  postScriptName: string;
  version: string;
  designer: string;
  manufacturer: string;
  copyright: string;
  license: string;
  licenseUrl: string;
  glyphCount: number;
  unitsPerEm: number;
  ascender: number;
  descender: number;
  fileSize: number;
  glyphs?: GlyphItem[];
}

export interface CompareFontItem {
  id: string;
  name: string;
  fontFamily: string;
  url?: string;
  isDefault?: boolean;
}

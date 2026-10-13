import React, { useMemo } from 'react';
import { FontProject } from '../types';
import { buildOpentypeFont, getLigatureReplacements } from '../utils/fontBuilder';
import { shapeArabicText, processLigaturesInText } from '../utils/arabicUnicode';

interface FontVectorRendererProps {
  project: FontProject;
  text: string;
  fontSize?: number;
  fontFamilyName?: string;
  className?: string;
}

export const FontVectorRenderer: React.FC<FontVectorRendererProps> = React.memo(({
  project,
  text,
  fontSize = 48,
  fontFamilyName,
  className = '',
}) => {
  const { pathData, isValid } = useMemo(() => {
    if (!project || !project.glyphs || project.glyphs.length === 0 || !text || text.trim() === '') {
      return { pathData: '', isValid: false };
    }

    try {
      // 1. Get ligature mappings with assigned PUA / presentation form characters
      const ligatures = getLigatureReplacements(project);

      // 2. Substitute multi-char ligatures and shape Arabic text
      const ligaturesProcessed = processLigaturesInText(text, ligatures);
      const shapedText = shapeArabicText(ligaturesProcessed);

      // 3. Build opentype font object
      const font = buildOpentypeFont(project);
      font.kerningPairs = font.kerningPairs || {};

      // 4. Generate SVG path
      const baselineY = 120;
      const pathObj = font.getPath(shapedText || text, 20, baselineY, fontSize);
      const d = pathObj.toPathData(2);

      return {
        pathData: d,
        isValid: !!d && d.length > 0,
      };
    } catch {
      return { pathData: '', isValid: false };
    }
  }, [project, text, fontSize]);

  if (!project || !project.glyphs || project.glyphs.length === 0) {
    return (
      <div className={`p-8 bg-slate-50 border border-slate-200 rounded-2xl text-center ${className}`}>
        <p className="text-sm text-slate-500">مشروع الخط لا يحتوي على أي حروف بعد</p>
      </div>
    );
  }

  return (
    <div className={`relative min-h-[160px] p-6 bg-slate-50 border border-slate-200 rounded-2xl overflow-x-auto flex items-center justify-center ${className}`}>
      {isValid && pathData ? (
        <div className="flex justify-center items-center py-2 w-full min-w-max">
          <svg
            className="max-w-full overflow-visible text-slate-900"
            height={fontSize * 2.2}
            style={{ minWidth: '150px' }}
          >
            <path d={pathData} fill="currentColor" />
          </svg>
        </div>
      ) : (
        <p
          style={{
            fontFamily: fontFamilyName ? `'${fontFamilyName}', sans-serif` : 'sans-serif',
            fontFeatureSettings: '"rlig" 1, "dlig" 1, "ccmp" 1',
            direction: 'rtl',
          }}
          className="text-3xl text-slate-900 text-center leading-relaxed break-words w-full"
        >
          {text || 'Fonty فونتي'}
        </p>
      )}
    </div>
  );
});


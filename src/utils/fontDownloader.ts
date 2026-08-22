import { FontProject } from '../types';
import { generateFontBlob } from './fontBuilder';

/**
 * Downloads an authentic binary font file (.ttf or .otf).
 * First attempts to fetch the direct binary URL from Google Fonts CDN (gstatic),
 * or fetches the TTF/OTF file directly, and falls back to generating a pure TTF file via OpenType.js.
 */
export async function downloadFontFile(
  fontNameEn: string,
  googleFamily?: string,
  project?: FontProject,
  directFontFiles?: Record<string, string> | string
): Promise<{ success: boolean; filename: string }> {
  const safeName = fontNameEn.toLowerCase().replace(/[^a-z0-9]/g, '_');

  // 1. If directFontFiles (from Google Fonts API items.files) is available
  if (directFontFiles) {
    try {
      let rawUrl = '';
      if (typeof directFontFiles === 'string') {
        rawUrl = directFontFiles;
      } else if (typeof directFontFiles === 'object') {
        rawUrl =
          directFontFiles['regular'] ||
          directFontFiles['400'] ||
          directFontFiles[Object.keys(directFontFiles)[0]];
      }

      if (rawUrl) {
        const fontUrl = rawUrl.replace(/^http:/, 'https:');
        const isOtf = fontUrl.toLowerCase().includes('.otf');
        const ext = isOtf ? 'otf' : 'ttf';
        const filename = `${safeName}.${ext}`;

        const res = await fetch(fontUrl);
        if (res.ok) {
          const blob = await res.blob();
          triggerDownload(blob, filename);
          return { success: true, filename };
        }
      }
    } catch (e) {
      console.warn('Direct font binary fetch error, switching to fallback:', e);
    }
  }

  // 2. Attempt fetching TTF/OTF via Google Fonts CSS with legacy user-agent
  if (googleFamily) {
    try {
      const fontQuery = googleFamily.replace(/\s+/g, '+');
      const cssUrl = `https://fonts.googleapis.com/css2?family=${fontQuery}:wght@400;700&display=swap`;
      const res = await fetch(cssUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Linux; U; Android 2.2; en-us; Nexus One Build/FRF91) AppleWebKit/533.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1',
        },
      });
      if (res.ok) {
        const cssText = await res.text();
        const urlMatch = cssText.match(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/);
        if (urlMatch && urlMatch[1]) {
          const fontBinaryUrl = urlMatch[1];
          const fontFileRes = await fetch(fontBinaryUrl);
          if (fontFileRes.ok) {
            const blob = await fontFileRes.blob();
            const isOtf = fontBinaryUrl.toLowerCase().includes('.otf');
            const ext = isOtf ? 'otf' : 'ttf';
            const filename = `${safeName}.${ext}`;
            triggerDownload(blob, filename);
            return { success: true, filename };
          }
        }
      }
    } catch (e) {
      console.warn('Google Fonts CSS fetch fallback triggered:', e);
    }
  }

  // 3. Fallback: Generate local TTF binary via OpenType.js font builder
  if (project) {
    try {
      const blob = generateFontBlob(project);
      const filename = `${safeName}.ttf`;
      triggerDownload(blob, filename);
      return { success: true, filename };
    } catch (e) {
      console.error('Local TTF generation error:', e);
    }
  }

  return { success: false, filename: '' };
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

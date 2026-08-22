/**
 * Client-side Image Vectorizer & SVG Processor
 * Converts PNG/JPG raster graphics to clean SVG vector path strings
 * or extracts SVG paths from uploaded SVG files directly.
 */

import { SVGPathData } from 'svg-pathdata';

export async function processUploadedFile(file: File): Promise<string> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  let pathD = '';

  if (extension === 'svg') {
    pathD = await readSvgFile(file);
  } else if (['png', 'jpg', 'jpeg', 'webp', 'bmp'].includes(extension || '')) {
    pathD = await rasterToSvgPath(file);
  } else {
    throw new Error('نوع الملف غير مدعوم. يُرجى رفع صورة PNG/JPG أو ملف SVG.');
  }

  // Automatically process vertical flip so glyph vectors are correctly oriented for typography composition
  return flipSvgPathVertically(pathD);
}

async function readSvgFile(file: File): Promise<string> {
  try {
    const text = await file.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, 'image/svg+xml');

    const pathDataList: string[] = [];

    // 1. Collect <path d="...">
    doc.querySelectorAll('path').forEach((p) => {
      const d = p.getAttribute('d');
      if (d && d.trim().length > 0) {
        pathDataList.push(d.trim());
      }
    });

    // 2. Collect <rect>
    doc.querySelectorAll('rect').forEach((r) => {
      const x = parseFloat(r.getAttribute('x') || '0');
      const y = parseFloat(r.getAttribute('y') || '0');
      const w = parseFloat(r.getAttribute('width') || '0');
      const h = parseFloat(r.getAttribute('height') || '0');
      if (w > 0 && h > 0) {
        pathDataList.push(`M ${x} ${y} h ${w} v ${h} h ${-w} Z`);
      }
    });

    // 3. Collect <circle>
    doc.querySelectorAll('circle').forEach((c) => {
      const cx = parseFloat(c.getAttribute('cx') || '0');
      const cy = parseFloat(c.getAttribute('cy') || '0');
      const r = parseFloat(c.getAttribute('r') || '0');
      if (r > 0) {
        pathDataList.push(`M ${cx - r} ${cy} a ${r} ${r} 0 1 0 ${2 * r} 0 a ${r} ${r} 0 1 0 ${-2 * r} 0 Z`);
      }
    });

    // 4. Collect <ellipse>
    doc.querySelectorAll('ellipse').forEach((e) => {
      const cx = parseFloat(e.getAttribute('cx') || '0');
      const cy = parseFloat(e.getAttribute('cy') || '0');
      const rx = parseFloat(e.getAttribute('rx') || '0');
      const ry = parseFloat(e.getAttribute('ry') || '0');
      if (rx > 0 && ry > 0) {
        pathDataList.push(`M ${cx - rx} ${cy} a ${rx} ${ry} 0 1 0 ${2 * rx} 0 a ${rx} ${ry} 0 1 0 ${-2 * rx} 0 Z`);
      }
    });

    // 5. Collect <polygon> & <polyline>
    doc.querySelectorAll('polygon, polyline').forEach((poly) => {
      const points = poly.getAttribute('points');
      if (points) {
        const coords = points.trim().split(/[\s,]+/).map(Number);
        if (coords.length >= 4) {
          let pD = `M ${coords[0]} ${coords[1]}`;
          for (let i = 2; i < coords.length - 1; i += 2) {
            pD += ` L ${coords[i]} ${coords[i + 1]}`;
          }
          if (poly.tagName.toLowerCase() === 'polygon') pD += ' Z';
          pathDataList.push(pD);
        }
      }
    });

    if (pathDataList.length > 0) {
      const rawCombined = pathDataList.join(' ');
      const normalized = normalizeSvgPathToBox(rawCombined);
      if (normalized) {
        return normalized;
      }
    }
  } catch (err) {
    console.warn('SVG direct extraction failed, using canvas fallback:', err);
  }

  // Fallback: render SVG onto canvas and trace
  return await rasterToSvgPath(file);
}

export function normalizeSvgPathToBox(svgPathString: string): string | null {
  try {
    const pathData = new SVGPathData(svgPathString).toAbs();
    const commands = pathData.commands;
    if (!commands || commands.length === 0) return null;

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    commands.forEach((cmd: any) => {
      if ('x' in cmd && typeof cmd.x === 'number') {
        minX = Math.min(minX, cmd.x);
        maxX = Math.max(maxX, cmd.x);
      }
      if ('y' in cmd && typeof cmd.y === 'number') {
        minY = Math.min(minY, cmd.y);
        maxY = Math.max(maxY, cmd.y);
      }
      if ('x1' in cmd && typeof cmd.x1 === 'number') {
        minX = Math.min(minX, cmd.x1);
        maxX = Math.max(maxX, cmd.x1);
      }
      if ('y1' in cmd && typeof cmd.y1 === 'number') {
        minY = Math.min(minY, cmd.y1);
        maxY = Math.max(maxY, cmd.y1);
      }
      if ('x2' in cmd && typeof cmd.x2 === 'number') {
        minX = Math.min(minX, cmd.x2);
        maxX = Math.max(maxX, cmd.x2);
      }
      if ('y2' in cmd && typeof cmd.y2 === 'number') {
        minY = Math.min(minY, cmd.y2);
        maxY = Math.max(maxY, cmd.y2);
      }
    });

    if (!isFinite(minX) || !isFinite(minY) || !isFinite(maxX) || !isFinite(maxY)) {
      return null;
    }

    const width = maxX - minX;
    const height = maxY - minY;

    if (width <= 0 && height <= 0) return null;

    // Target box size 800x800, fit inside 680x680 with 60px padding
    const targetSize = 680;
    const padding = 60;
    const maxDim = Math.max(width, height) || 1;
    const scale = targetSize / maxDim;

    const offsetX = padding + (targetSize - width * scale) / 2 - minX * scale;
    const offsetY = padding + (targetSize - height * scale) / 2 - minY * scale;

    const transformedCommands = commands.map((cmd: any) => {
      const c = { ...cmd };
      if ('x' in c && typeof c.x === 'number') c.x = Math.round((c.x * scale + offsetX) * 10) / 10;
      if ('y' in c && typeof c.y === 'number') c.y = Math.round((c.y * scale + offsetY) * 10) / 10;
      if ('x1' in c && typeof c.x1 === 'number') c.x1 = Math.round((c.x1 * scale + offsetX) * 10) / 10;
      if ('y1' in c && typeof c.y1 === 'number') c.y1 = Math.round((c.y1 * scale + offsetY) * 10) / 10;
      if ('x2' in c && typeof c.x2 === 'number') c.x2 = Math.round((c.x2 * scale + offsetX) * 10) / 10;
      if ('y2' in c && typeof c.y2 === 'number') c.y2 = Math.round((c.y2 * scale + offsetY) * 10) / 10;
      if ('rX' in c && typeof c.rX === 'number') c.rX = Math.round((c.rX * scale) * 10) / 10;
      if ('rY' in c && typeof c.rY === 'number') c.rY = Math.round((c.rY * scale) * 10) / 10;
      return c;
    });

    return new SVGPathData(transformedCommands).encode();
  } catch {
    return null;
  }
}

export function flipSvgPathVertically(svgPathString: string): string {
  try {
    const pathData = new SVGPathData(svgPathString).toAbs();
    const commands = pathData.commands;
    if (!commands || commands.length === 0) return svgPathString;

    let minY = Infinity, maxY = -Infinity;
    commands.forEach((cmd: any) => {
      if ('y' in cmd && typeof cmd.y === 'number') {
        minY = Math.min(minY, cmd.y);
        maxY = Math.max(maxY, cmd.y);
      }
      if ('y1' in cmd && typeof cmd.y1 === 'number') {
        minY = Math.min(minY, cmd.y1);
        maxY = Math.max(maxY, cmd.y1);
      }
      if ('y2' in cmd && typeof cmd.y2 === 'number') {
        minY = Math.min(minY, cmd.y2);
        maxY = Math.max(maxY, cmd.y2);
      }
    });

    if (!isFinite(minY) || !isFinite(maxY)) return svgPathString;

    const centerY = (minY + maxY) / 2;

    const flippedCommands = commands.map((cmd: any) => {
      const c = { ...cmd };
      if ('y' in c && typeof c.y === 'number') c.y = Math.round((2 * centerY - c.y) * 10) / 10;
      if ('y1' in c && typeof c.y1 === 'number') c.y1 = Math.round((2 * centerY - c.y1) * 10) / 10;
      if ('y2' in c && typeof c.y2 === 'number') c.y2 = Math.round((2 * centerY - c.y2) * 10) / 10;
      return c;
    });

    return new SVGPathData(flippedCommands).encode();
  } catch {
    return svgPathString;
  }
}

async function rasterToSvgPath(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      img.onload = () => {
        try {
          const pathD = traceImageCanvas(img);
          resolve(pathD);
        } catch (err) {
          reject(err);
        }
      };
      img.onerror = () => reject(new Error('تعذر تحميل الصورة لمتابعة التتبع.'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('تعذر قراءة ملف الصورة.'));
    reader.readAsDataURL(file);
  });
}

function traceImageCanvas(img: HTMLImageElement): string {
  // Target reasonable dimensions for vectorization
  const maxDim = 300;
  let w = img.width;
  let h = img.height;
  if (w > maxDim || h > maxDim) {
    if (w > h) {
      h = Math.round((h * maxDim) / w);
      w = maxDim;
    } else {
      w = Math.round((w * maxDim) / h);
      h = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('تعذر إنشاء سياق الرسم.');

  // White background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);

  const imgData = ctx.getImageData(0, 0, w, h);
  const data = imgData.data;

  // Grayscale & Otsu Thresholding
  const histogram = new Array(256).fill(0);
  const totalPixels = w * h;

  for (let i = 0; i < data.length; i += 4) {
    // Gray conversion
    const gray = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
    histogram[gray]++;
  }

  // Calculate Otsu threshold
  let sum = 0;
  for (let t = 0; t < 256; t++) sum += t * histogram[t];

  let sumB = 0;
  let wB = 0;
  let wF = 0;
  let varMax = 0;
  let threshold = 128;

  for (let t = 0; t < 256; t++) {
    wB += histogram[t];
    if (wB === 0) continue;
    wF = totalPixels - wB;
    if (wF === 0) break;

    sumB += t * histogram[t];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;

    const varBetween = wB * wF * (mB - mF) * (mB - mF);
    if (varBetween > varMax) {
      varMax = varBetween;
      threshold = t;
    }
  }

  // Binarize: true for ink pixels (glyph foreground)
  const binary: boolean[][] = [];
  for (let y = 0; y < h; y++) {
    binary[y] = [];
    for (let x = 0; x < w; x++) {
      const idx = (y * w + x) * 4;
      const alpha = data[idx + 3];
      const gray = 0.299 * data[idx] + 0.587 * data[idx + 1] + 0.114 * data[idx + 2];
      // If transparent or light, it's background. If ink/filled, it's foreground.
      binary[y][x] = alpha > 50 && gray < threshold;
    }
  }

  // Extract contours using simplified grid tracking
  const visited: boolean[][] = Array.from({ length: h }, () => new Array(w).fill(false));
  const pathParts: string[] = [];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      if (binary[y][x] && !visited[y][x]) {
        // Boundary pixel check
        const isBoundary =
          !binary[y - 1][x] || !binary[y + 1][x] || !binary[y][x - 1] || !binary[y][x + 1];

        if (isBoundary) {
          const contour = traceBoundary(binary, visited, x, y, w, h);
          if (contour.length > 3) {
            pathParts.push(contourToSvgPath(contour, w, h));
          }
        }
      }
    }
  }

  if (pathParts.length === 0) {
    // Fallback: simple centered glyph representation
    return `M 100 100 h 200 v 200 h -200 Z`;
  }

  return pathParts.join(' ');
}

function traceBoundary(
  binary: boolean[][],
  visited: boolean[][],
  startX: number,
  startY: number,
  w: number,
  h: number
): { x: number; y: number }[] {
  const contour: { x: number; y: number }[] = [];
  let currX = startX;
  let currY = startY;

  const dx = [1, 1, 0, -1, -1, -1, 0, 1];
  const dy = [0, 1, 1, 1, 0, -1, -1, -1];

  let dir = 0;
  let steps = 0;
  const maxSteps = w * h;

  while (steps < maxSteps) {
    contour.push({ x: currX, y: currY });
    visited[currY][currX] = true;

    let foundNext = false;
    for (let i = 0; i < 8; i++) {
      const checkDir = (dir + i) % 8;
      const nx = currX + dx[checkDir];
      const ny = currY + dy[checkDir];

      if (nx >= 0 && nx < w && ny >= 0 && ny < h && binary[ny][nx]) {
        currX = nx;
        currY = ny;
        dir = (checkDir + 6) % 8; // Backtrack direction
        foundNext = true;
        break;
      }
    }

    if (!foundNext || (currX === startX && currY === startY)) {
      break;
    }
    steps++;
  }

  // Simplify contour points (Ramer-Douglas-Peucker algorithm)
  return simplifyContour(contour, 1.2);
}

function simplifyContour(points: { x: number; y: number }[], epsilon: number): { x: number; y: number }[] {
  if (points.length <= 2) return points;

  let dmax = 0;
  let index = 0;
  const end = points.length - 1;

  for (let i = 1; i < end; i++) {
    const d = pointToSegmentDistance(points[i], points[0], points[end]);
    if (d > dmax) {
      index = i;
      dmax = d;
    }
  }

  if (dmax > epsilon) {
    const rec1 = simplifyContour(points.slice(0, index + 1), epsilon);
    const rec2 = simplifyContour(points.slice(index), epsilon);
    return rec1.slice(0, rec1.length - 1).concat(rec2);
  } else {
    return [points[0], points[end]];
  }
}

function pointToSegmentDistance(
  p: { x: number; y: number },
  v: { x: number; y: number },
  w: { x: number; y: number }
): number {
  const l2 = (w.x - v.x) ** 2 + (w.y - v.y) ** 2;
  if (l2 === 0) return Math.hypot(p.x - v.x, p.y - v.y);
  let t = ((p.x - v.x) * (w.x - v.x) + (p.y - v.y) * (w.y - v.y)) / l2;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(p.x - (v.x + t * (w.x - v.x)), p.y - (v.y + t * (w.y - v.y)));
}

function contourToSvgPath(contour: { x: number; y: number }[], imgW: number, imgH: number): string {
  if (contour.length === 0) return '';

  // Scale contour to normalized glyph box (e.g., 800x800)
  const targetSize = 800;
  const scale = targetSize / Math.max(imgW, imgH);

  const commands: string[] = [];
  const start = contour[0];
  commands.push(`M ${(start.x * scale).toFixed(1)} ${(start.y * scale).toFixed(1)}`);

  for (let i = 1; i < contour.length; i++) {
    const p = contour[i];
    commands.push(`L ${(p.x * scale).toFixed(1)} ${(p.y * scale).toFixed(1)}`);
  }

  commands.push('Z');
  return commands.join(' ');
}

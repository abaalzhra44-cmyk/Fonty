import * as opentype from 'opentype.js';
import { SVGPathData } from 'svg-pathdata';
import { FontSettings } from '../types';

export function convertSvgPathToOpentypePath(
  svgPathString: string,
  settings: FontSettings,
  glyphAdvanceWidth?: number
): { path: opentype.Path; width: number } {
  const path = new opentype.Path();

  if (!svgPathString || svgPathString.trim() === '') {
    return { path, width: settings.fixedWidthValue || 600 };
  }

  let commands: any[] = [];
  try {
    // Absolutize SVG path commands
    commands = new SVGPathData(svgPathString).toAbs().commands;
  } catch {
    return { path, width: settings.fixedWidthValue || 600 };
  }

  // Calculate bounding box of raw SVG path
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  commands.forEach((cmd: any) => {
    if ('x' in cmd && typeof cmd.x === 'number' && !isNaN(cmd.x)) {
      minX = Math.min(minX, cmd.x);
      maxX = Math.max(maxX, cmd.x);
    }
    if ('y' in cmd && typeof cmd.y === 'number' && !isNaN(cmd.y)) {
      minY = Math.min(minY, cmd.y);
      maxY = Math.max(maxY, cmd.y);
    }
  });

  if (minX === Infinity || isNaN(minX)) {
    minX = 0; maxX = 500; minY = 0; maxY = 500;
  }

  const svgWidth = maxX - minX || 100;
  const svgHeight = maxY - minY || 100;

  // OpenType font coordinate system defaults
  const targetAscender = 880;

  let scaleX = 1;
  let scaleY = 1;

  if (settings.autoFitAndCenter) {
    const targetGlyphHeight = 700;
    const autoScale = targetGlyphHeight / Math.max(svgHeight, svgWidth, 1);
    scaleX = autoScale * (settings.scaleFactor || 1);
    scaleY = autoScale * (settings.scaleFactor || 1);
  } else {
    scaleX = settings.scaleFactor || 1;
    scaleY = settings.scaleFactor || 1;
  }

  if (settings.flipHorizontal) scaleX = -scaleX;
  if (settings.flipVertical) scaleY = -scaleY;

  // Calculate Advance Width
  let advanceWidth = 600;
  if (settings.advanceWidthMode === 'fixed') {
    advanceWidth = settings.fixedWidthValue || 600;
  } else if (settings.advanceWidthMode === 'per-glyph' && glyphAdvanceWidth) {
    advanceWidth = glyphAdvanceWidth;
  } else {
    advanceWidth = Math.max(300, Math.round(svgWidth * Math.abs(scaleX) + 160));
  }

  const baselineOffset = settings.baselineOffset || 0;
  const scaledWidth = svgWidth * Math.abs(scaleX);
  const leftMargin = Math.max(40, (advanceWidth - scaledWidth) / 2);

  const transformX = (x: number): number => {
    const normX = (x - minX) * Math.abs(scaleX);
    if (settings.flipHorizontal) {
      return Math.round(leftMargin + scaledWidth - normX + (settings.horizontalOffset || 0));
    } else {
      return Math.round(leftMargin + normX + (settings.horizontalOffset || 0));
    }
  };

  const transformY = (y: number): number => {
    const normY = (y - minY) * Math.abs(scaleY);
    const glyphHeight = svgHeight * Math.abs(scaleY);

    if (settings.flipVertical) {
      const topY = targetAscender - 100 - glyphHeight;
      return Math.round(topY + normY + baselineOffset + (settings.verticalOffset || 0));
    } else {
      const topY = targetAscender - 100;
      return Math.round(topY - normY + baselineOffset + (settings.verticalOffset || 0));
    }
  };

  let curX = 0;
  let curY = 0;
  let startX = 0;
  let startY = 0;
  let lastControlX = 0;
  let lastControlY = 0;

  commands.forEach((cmd: any) => {
    switch (cmd.type) {
      case SVGPathData.MOVE_TO:
        curX = cmd.x;
        curY = cmd.y;
        startX = curX;
        startY = curY;
        lastControlX = curX;
        lastControlY = curY;
        path.moveTo(transformX(curX), transformY(curY));
        break;

      case SVGPathData.LINE_TO:
        curX = cmd.x;
        curY = cmd.y;
        lastControlX = curX;
        lastControlY = curY;
        path.lineTo(transformX(curX), transformY(curY));
        break;

      case SVGPathData.HORIZ_LINE_TO:
        curX = cmd.x;
        lastControlX = curX;
        lastControlY = curY;
        path.lineTo(transformX(curX), transformY(curY));
        break;

      case SVGPathData.VERT_LINE_TO:
        curY = cmd.y;
        lastControlX = curX;
        lastControlY = curY;
        path.lineTo(transformX(curX), transformY(curY));
        break;

      case SVGPathData.CURVE_TO:
        lastControlX = cmd.x2;
        lastControlY = cmd.y2;
        curX = cmd.x;
        curY = cmd.y;
        path.curveTo(
          transformX(cmd.x1), transformY(cmd.y1),
          transformX(cmd.x2), transformY(cmd.y2),
          transformX(curX), transformY(curY)
        );
        break;

      case SVGPathData.SMOOTH_CURVE_TO: {
        const x1 = 2 * curX - lastControlX;
        const y1 = 2 * curY - lastControlY;
        lastControlX = cmd.x2;
        lastControlY = cmd.y2;
        curX = cmd.x;
        curY = cmd.y;
        path.curveTo(
          transformX(x1), transformY(y1),
          transformX(cmd.x2), transformY(cmd.y2),
          transformX(curX), transformY(curY)
        );
        break;
      }

      case SVGPathData.QUAD_TO:
        lastControlX = cmd.x1;
        lastControlY = cmd.y1;
        curX = cmd.x;
        curY = cmd.y;
        path.quadTo(
          transformX(cmd.x1), transformY(cmd.y1),
          transformX(curX), transformY(curY)
        );
        break;

      case SVGPathData.SMOOTH_QUAD_TO: {
        const x1 = 2 * curX - lastControlX;
        const y1 = 2 * curY - lastControlY;
        lastControlX = x1;
        lastControlY = y1;
        curX = cmd.x;
        curY = cmd.y;
        path.quadTo(
          transformX(x1), transformY(y1),
          transformX(curX), transformY(curY)
        );
        break;
      }

      case SVGPathData.ARC:
        curX = cmd.x;
        curY = cmd.y;
        lastControlX = curX;
        lastControlY = curY;
        path.lineTo(transformX(curX), transformY(curY));
        break;

      case SVGPathData.CLOSE_PATH:
        curX = startX;
        curY = startY;
        lastControlX = curX;
        lastControlY = curY;
        path.close();
        break;

      default:
        if ('x' in cmd && 'y' in cmd && typeof cmd.x === 'number' && typeof cmd.y === 'number') {
          curX = cmd.x;
          curY = cmd.y;
          path.lineTo(transformX(curX), transformY(curY));
        }
        break;
    }
  });

  return { path, width: advanceWidth };
}

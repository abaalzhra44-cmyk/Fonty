import React, { useState } from 'react';
import { GlyphItem, RulerPoint } from '../types';
import { IconClose, IconRefresh, IconRuler } from './icons/Icons';

interface RulerModalProps {
  isOpen: boolean;
  glyph: GlyphItem | null;
  flipVertical?: boolean;
  flipHorizontal?: boolean;
  onFlipVertical?: () => void;
  onClose: () => void;
}

export const RulerModal: React.FC<RulerModalProps> = React.memo(({
  isOpen,
  glyph,
  flipVertical = false,
  flipHorizontal = false,
  onFlipVertical,
  onClose,
}) => {
  const [points, setPoints] = useState<RulerPoint[]>([]);

  if (!isOpen || !glyph) return null;

  const viewSize = 800;

  const handleCanvasClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const svgEl = e.currentTarget;
    const rect = svgEl.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * viewSize;
    const clickY = ((e.clientY - rect.top) / rect.height) * viewSize;

    const newPoint = { x: Math.round(clickX), y: Math.round(clickY) };

    if (points.length >= 2) {
      setPoints([newPoint]);
    } else {
      setPoints([...points, newPoint]);
    }
  };

  const p1 = points[0];
  const p2 = points[1];

  const distance =
    p1 && p2
      ? Math.round(Math.hypot(p2.x - p1.x, p2.y - p1.y))
      : 0;

  const midX = p1 && p2 ? (p1.x + p2.x) / 2 : 0;
  const midY = p1 && p2 ? (p1.y + p2.y) / 2 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-xl animate-fade-in">
      <div className="apple-glass-modal shadow-2xl w-full max-w-2xl p-6 relative flex flex-col max-h-[90vh] border border-white/80">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/60 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/15 border border-sky-300/40 flex items-center justify-center text-sky-700 shadow-inner">
              <IconRuler size={22} />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-slate-900">
                المسطرة الرقمية
              </h3>
              <p className="font-body text-xs text-slate-600">
                الحرف: <span className="text-sky-700 font-bold">{glyph.trigger}</span> — اضغط على نقطتين على الرسم لقياس المسافة بينهما
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onFlipVertical && (
              <button
                type="button"
                onClick={onFlipVertical}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-semibold text-sky-700 transition-colors"
                title="قلب اتجاه الرسم رأساً على عقب"
              >
                قلب رأسي ↕
              </button>
            )}
            <button
              type="button"
              onClick={() => setPoints([])}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl liquid-glass-button text-xs font-semibold text-slate-700 hover:text-slate-900 transition-colors"
            >
              <IconRefresh size={14} />
              إعادة تعيين
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-white/40 transition-colors"
            >
              <IconClose size={20} />
            </button>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="relative flex-1 bg-white/40 backdrop-blur-md border border-white/80 rounded-2xl overflow-hidden min-h-[350px] flex items-center justify-center p-4 cursor-crosshair shadow-inner">
          {/* Background dot grid pattern */}
          <div
            className="absolute inset-0 opacity-20 pointer-events-none"
            style={{
              backgroundImage: 'radial-gradient(currentColor 1px, transparent 1px)',
              backgroundSize: '20px 20px',
            }}
          />

          <svg
            viewBox={`0 0 ${viewSize} ${viewSize}`}
            className="w-full h-full max-h-[450px] object-contain relative z-10"
            onClick={handleCanvasClick}
          >
            {/* Baseline & Ascender Guides */}
            <line
              x1="0"
              y1={viewSize * 0.75}
              x2={viewSize}
              y2={viewSize * 0.75}
              stroke="#0284c7"
              strokeDasharray="4 4"
              strokeWidth="2"
              opacity="0.4"
            />
            <text
              x="20"
              y={viewSize * 0.75 - 8}
              fill="#0284c7"
              fontSize="18"
              opacity="0.7"
              fontFamily="Rubik"
            >
              خط الأساس (Baseline)
            </text>

            {/* Glyph SVG Path */}
            <g
              style={{
                transformOrigin: '400px 400px',
                transform: `scale(${flipHorizontal ? -1 : 1}, ${flipVertical ? -1 : 1})`,
              }}
            >
              <path
                d={glyph.svgPath}
                className="fill-slate-900"
                fillOpacity="0.85"
                stroke="#0284c7"
                strokeWidth="3"
              />
            </g>

            {/* First Point Handle */}
            {p1 && (
              <g>
                <circle cx={p1.x} cy={p1.y} r="8" fill="#0284c7" />
                <circle cx={p1.x} cy={p1.y} r="14" fill="none" stroke="#0284c7" strokeWidth="2" opacity="0.6" />
                <text x={p1.x + 12} y={p1.y - 12} fill="#0284c7" fontSize="16" fontFamily="Rubik" fontWeight="bold">
                  ن1 ({p1.x}, {p1.y})
                </text>
              </g>
            )}

            {/* Second Point Handle */}
            {p2 && (
              <g>
                <circle cx={p2.x} cy={p2.y} r="8" fill="#0284c7" />
                <circle cx={p2.x} cy={p2.y} r="14" fill="none" stroke="#0284c7" strokeWidth="2" opacity="0.6" />
                <text x={p2.x + 12} y={p2.y - 12} fill="#0284c7" fontSize="16" fontFamily="Rubik" fontWeight="bold">
                  ن2 ({p2.x}, {p2.y})
                </text>
              </g>
            )}

            {/* Dashed Line & Measurement Badge */}
            {p1 && p2 && (
              <g>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="#0284c7"
                  strokeWidth="3"
                  strokeDasharray="6 6"
                />
                <rect
                  x={midX - 70}
                  y={midY - 20}
                  width="140"
                  height="36"
                  rx="18"
                  fill="#0f172a"
                  stroke="#0284c7"
                  strokeWidth="1.5"
                />
                <text
                  x={midX}
                  y={midY + 4}
                  textAnchor="middle"
                  fill="#38bdf8"
                  fontSize="16"
                  fontWeight="bold"
                  fontFamily="Rubik"
                >
                  {distance} وحدة
                </text>
              </g>
            )}
          </svg>
        </div>

        {/* Footer info */}
        <div className="mt-4 flex items-center justify-between text-xs text-slate-600">
          <div>
            {points.length === 0 && 'انقر على الصورة لتحديد النقطة الأولى.'}
            {points.length === 1 && 'انقر لتحديد النقطة الثانية وحساب المسافة.'}
            {points.length === 2 && `تم قياس المسافة: ${distance} وحدة داخلياً.`}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-semibold text-xs transition-colors"
          >
            تم
          </button>
        </div>
      </div>
    </div>
  );
});

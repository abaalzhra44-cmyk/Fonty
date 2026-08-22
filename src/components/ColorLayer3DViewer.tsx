import React, { useState, useEffect, useRef } from 'react';
import { ColorLayer } from '../types';
import { IconLayers, IconSparkles, IconRotateCcw, IconEye, IconLayers3D } from './icons/Icons';

interface Props {
  layers: ColorLayer[];
  paletteColors: string[];
  glyphName: string;
  fallbackSvgPath?: string;
  activeLayerIndex?: number;
  onSelectLayer?: (idx: number) => void;
}

export const ColorLayer3DViewer: React.FC<Props> = ({
  layers,
  paletteColors,
  glyphName,
  fallbackSvgPath = 'M 100 700 L 500 700 L 300 100 Z',
  activeLayerIndex,
  onSelectLayer,
}) => {
  const [depthSeparation, setDepthSeparation] = useState<number>(55);
  const [rotateX, setRotateX] = useState<number>(60);
  const [rotateY, setRotateY] = useState<number>(0);
  const [rotateZ, setRotateZ] = useState<number>(-25);
  const [viewMode, setViewMode] = useState<'exploded' | 'flat' | 'extruded'>('exploded');
  const [autoRotate, setAutoRotate] = useState<boolean>(false);
  const [canvasTheme, setCanvasTheme] = useState<'pure-glass' | 'light-parchment' | 'crystal-cyan'>('pure-glass');
  const [focusedLayer, setFocusedLayer] = useState<number | null>(activeLayerIndex ?? null);

  const [isDragging, setIsDragging] = useState<boolean>(false);
  const dragStartRef = useRef<{ x: number; y: number; initialRx: number; initialRz: number }>({
    x: 0,
    y: 0,
    initialRx: 60,
    initialRz: -25,
  });

  // Auto-rotate effect if enabled
  useEffect(() => {
    if (!autoRotate) return;
    const interval = setInterval(() => {
      setRotateZ((prev) => (prev + 1) % 360);
    }, 40);
    return () => clearInterval(interval);
  }, [autoRotate]);

  // Sync prop activeLayerIndex
  useEffect(() => {
    if (activeLayerIndex !== undefined) {
      setFocusedLayer(activeLayerIndex);
    }
  }, [activeLayerIndex]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      initialRx: rotateX,
      initialRz: rotateZ,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;

    const newRotateZ = dragStartRef.current.initialRz + deltaX * 0.5;
    const newRotateX = Math.max(10, Math.min(85, dragStartRef.current.initialRx - deltaY * 0.5));

    setRotateZ(newRotateZ);
    setRotateX(newRotateX);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const displayLayers = layers.length > 0 ? layers : [
    {
      id: 'default_layer',
      name: 'طبقة أساسية',
      svgPath: fallbackSvgPath,
      paletteIndex: 0,
    },
  ];

  // Preset camera views
  const applyPresetView = (preset: 'isometric' | 'front' | 'top') => {
    if (preset === 'isometric') {
      setRotateX(60);
      setRotateY(0);
      setRotateZ(-30);
    } else if (preset === 'front') {
      setRotateX(15);
      setRotateY(0);
      setRotateZ(0);
    } else if (preset === 'top') {
      setRotateX(80);
      setRotateY(0);
      setRotateZ(0);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl border border-white/80 shadow-2xl shadow-slate-900/5 rounded-3xl p-5 space-y-5 transition-all relative overflow-hidden ring-1 ring-slate-900/5">
      {/* Decorative glass glow */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-sky-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10 pb-4 border-b border-slate-200/60">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-purple-500/10 to-sky-500/20 text-purple-700 border border-purple-200/60 flex items-center justify-center shadow-xs">
            <IconLayers3D size={22} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-heading font-extrabold text-base text-slate-900">
                عرض الطبقات الملونة ببعد ثلاثي الأبعاد (3D Depth Preview)
              </h4>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 border border-purple-200 text-[10px] font-bold">
                تفاعلي 3D
              </span>
            </div>
            <p className="font-body text-xs text-slate-500">
              استكشف الطبقات الملونة لمجموع المحرف &quot;{glyphName}&quot; مفككة في الفضاء ثلاثي الأبعاد
            </p>
          </div>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-1.5 bg-white/80 p-1.5 rounded-2xl border border-slate-200/80 shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode('exploded')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'exploded'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <IconLayers size={14} />
            <span>طبقات متباعدة 3D</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('extruded')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'extruded'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <IconSparkles size={14} />
            <span>مجسم متراكب</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode('flat')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              viewMode === 'flat'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <IconEye size={14} />
            <span>مسطح 2D</span>
          </button>
        </div>
      </div>

      {/* Main 3D Viewport Area */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Interactive 3D Canvas */}
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={`lg:col-span-3 h-[380px] rounded-3xl border border-white/90 shadow-inner flex items-center justify-center relative overflow-hidden select-none cursor-grab active:cursor-grabbing transition-colors ${
            canvasTheme === 'pure-glass'
              ? 'bg-gradient-to-br from-slate-50/90 via-sky-50/50 to-indigo-50/60'
              : canvasTheme === 'light-parchment'
              ? 'bg-[#FDFBF7] border-amber-200/60'
              : 'bg-gradient-to-br from-cyan-50 via-white to-blue-50'
          }`}
          style={{ perspective: '1200px' }}
        >
          {/* Subtle Grid Lines */}
          <div
            className="absolute inset-0 opacity-[0.08] pointer-events-none"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #1e293b 1px, transparent 0)`,
              backgroundSize: '24px 24px',
            }}
          />

          {/* Canvas Badges & Controls Overlay */}
          <div className="absolute top-3 right-3 flex items-center gap-2 pointer-events-auto">
            <span className="text-[10px] font-mono font-bold text-slate-700 bg-white/90 backdrop-blur-md px-3 py-1 rounded-xl border border-slate-200/80 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>إسقاط {rotateX.toFixed(0)}° / {rotateZ.toFixed(0)}°</span>
            </span>

            <button
              type="button"
              onClick={() => setAutoRotate(!autoRotate)}
              className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-all ${
                autoRotate
                  ? 'bg-purple-600 text-white border-purple-500 shadow-xs animate-pulse'
                  : 'bg-white/90 text-slate-700 border-slate-200 hover:bg-white'
              }`}
            >
              {autoRotate ? 'إيقاف الدوران' : 'دوران تلقائي 3D'}
            </button>
          </div>

          <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 bg-white/80 px-2.5 py-1 rounded-xl border border-slate-200/60 pointer-events-none">
            اسحب بالماوس لتدوير المجسم ثلاثي الأبعاد
          </div>

          {/* 3D Transform Object Container */}
          <div
            className="w-64 h-64 flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotateX}deg) rotateY(${rotateY}deg) rotateZ(${rotateZ}deg)`,
            }}
          >
            {/* Render 3D Layer Stack */}
            {displayLayers.map((layer, idx) => {
              const color = paletteColors[layer.paletteIndex] || paletteColors[0] || '#7C3AED';
              const isFocused = focusedLayer === idx;

              // Calculate Z offset depending on view mode
              let zOffset = 0;
              if (viewMode === 'exploded') {
                zOffset = (idx - (displayLayers.length - 1) / 2) * depthSeparation;
              } else if (viewMode === 'extruded') {
                zOffset = idx * 12;
              }

              return (
                <div
                  key={layer.id || idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setFocusedLayer(idx);
                    if (onSelectLayer) onSelectLayer(idx);
                  }}
                  className={`absolute inset-0 flex items-center justify-center transition-all duration-300 group cursor-pointer ${
                    isFocused ? 'scale-105' : 'hover:scale-102'
                  }`}
                  style={{
                    transformStyle: 'preserve-3d',
                    transform: `translateZ(${zOffset}px)`,
                  }}
                >
                  {/* Layer Outline & Glass Plate */}
                  <div
                    className={`w-full h-full rounded-3xl p-4 flex items-center justify-center transition-all ${
                      isFocused
                        ? 'border-2 border-purple-500 shadow-2xl shadow-purple-500/30 bg-purple-500/10 backdrop-blur-xs ring-4 ring-purple-400/20'
                        : 'border border-white/70 bg-white/20 backdrop-blur-[1px] hover:border-purple-300'
                    }`}
                  >
                    {/* SVG Vector Path for Layer */}
                    <svg
                      viewBox="0 0 1000 1000"
                      className={`w-48 h-48 transition-all ${
                        isFocused
                          ? 'drop-shadow-[0_10px_20px_rgba(124,58,237,0.4)]'
                          : 'drop-shadow-md'
                      }`}
                    >
                      <path
                        d={layer.svgPath}
                        fill={color}
                        transform="scale(1, -1) translate(0, -900)"
                        opacity={isFocused || focusedLayer === null ? 1 : 0.45}
                      />
                    </svg>

                    {/* Layer Label Tag Floating in 3D */}
                    <div
                      className={`absolute top-2 left-2 px-2.5 py-1 rounded-xl text-[10px] font-bold shadow-md transition-all flex items-center gap-1.5 ${
                        isFocused
                          ? 'bg-purple-600 text-white border border-purple-400 scale-110'
                          : 'bg-white/90 text-slate-800 border border-slate-200'
                      }`}
                      style={{
                        transform: 'rotateX(-20deg) translateZ(15px)',
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/60 shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span>{layer.name || `طبقة ${idx + 1}`}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar Controls & Layers List */}
        <div className="space-y-4 bg-white/80 border border-slate-200/80 rounded-3xl p-4 shadow-xs flex flex-col justify-between">
          <div className="space-y-4">
            <h5 className="font-bold text-xs text-slate-800 border-b border-slate-100 pb-2 flex items-center justify-between">
              <span>عناصر التحكم والعمق</span>
              <button
                type="button"
                onClick={() => applyPresetView('isometric')}
                className="text-[10px] font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
              >
                <IconRotateCcw size={12} />
                <span>إعادة ضبط</span>
              </button>
            </h5>

            {/* Depth separation slider */}
            {viewMode === 'exploded' && (
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>مسافة التباعد (3D Depth):</span>
                  <span className="font-mono text-purple-600">{depthSeparation}px</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={depthSeparation}
                  onChange={(e) => setDepthSeparation(parseInt(e.target.value, 10))}
                  className="w-full accent-purple-600 cursor-pointer h-1.5 rounded-lg bg-slate-200"
                />
              </div>
            )}

            {/* Rotation controls */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>زاوية الإمالة (Tilt X):</span>
                <span className="font-mono text-slate-600">{rotateX}°</span>
              </div>
              <input
                type="range"
                min="0"
                max="85"
                value={rotateX}
                onChange={(e) => setRotateX(parseInt(e.target.value, 10))}
                className="w-full accent-purple-600 cursor-pointer h-1.5 rounded-lg bg-slate-200"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-slate-700">
                <span>زاوية التدوير (Roll Z):</span>
                <span className="font-mono text-slate-600">{rotateZ}°</span>
              </div>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotateZ}
                onChange={(e) => setRotateZ(parseInt(e.target.value, 10))}
                className="w-full accent-purple-600 cursor-pointer h-1.5 rounded-lg bg-slate-200"
              />
            </div>

            {/* Angle presets */}
            <div className="grid grid-cols-3 gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => applyPresetView('isometric')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl text-[10px] font-bold border border-slate-200 text-center transition-all"
              >
                منظوري 60°
              </button>
              <button
                type="button"
                onClick={() => applyPresetView('front')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl text-[10px] font-bold border border-slate-200 text-center transition-all"
              >
                مواجهة 15°
              </button>
              <button
                type="button"
                onClick={() => applyPresetView('top')}
                className="py-1.5 px-2 bg-slate-100 hover:bg-purple-50 text-slate-700 hover:text-purple-700 rounded-xl text-[10px] font-bold border border-slate-200 text-center transition-all"
              >
                علوي 80°
              </button>
            </div>
          </div>

          {/* Quick layer selector list */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>التركيز على طبقة:</span>
              {focusedLayer !== null && (
                <button
                  type="button"
                  onClick={() => setFocusedLayer(null)}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  عرض الجميع
                </button>
              )}
            </div>

            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
              {displayLayers.map((l, idx) => {
                const color = paletteColors[l.paletteIndex] || paletteColors[0] || '#7C3AED';
                const isFocused = focusedLayer === idx;
                return (
                  <button
                    key={l.id || idx}
                    type="button"
                    onClick={() => {
                      setFocusedLayer(idx);
                      if (onSelectLayer) onSelectLayer(idx);
                    }}
                    className={`w-full p-2 rounded-xl text-xs font-bold transition-all flex items-center justify-between border ${
                      isFocused
                        ? 'bg-purple-50 border-purple-400 text-purple-700 shadow-xs'
                        : 'bg-white border-slate-200/80 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-slate-300"
                        style={{ backgroundColor: color }}
                      />
                      <span className="truncate max-w-[100px]">{l.name}</span>
                    </div>
                    <span className="text-[10px] font-mono opacity-60">{color}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

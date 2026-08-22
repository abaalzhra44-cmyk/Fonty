import React from 'react';

export const AnimatedBackground: React.FC = React.memo(() => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      {/* 1. Apple macOS Sonoma & iOS 18 Ambient Chromatic Mesh Gradient Orbs */}
      <div className="absolute -top-[15%] -right-[10%] w-[850px] h-[850px] rounded-full bg-gradient-to-br from-sky-400/30 via-blue-600/20 to-indigo-600/25 blur-[140px] animate-float-slow animate-liquid-blob" />
      <div className="absolute top-[25%] -left-[15%] w-[800px] h-[800px] rounded-full bg-gradient-to-tr from-cyan-400/25 via-teal-400/20 to-sky-500/25 blur-[150px] animate-float-delayed" />
      <div className="absolute -bottom-[15%] right-[10%] w-[900px] h-[900px] rounded-full bg-gradient-to-t from-indigo-500/25 via-purple-500/20 to-sky-400/20 blur-[160px] animate-float-slow" />
      <div className="absolute top-[50%] left-[35%] w-[600px] h-[600px] rounded-full bg-gradient-to-r from-blue-300/15 via-sky-200/10 to-indigo-200/15 blur-[120px] animate-float-delayed" />

      {/* 2. Floating Liquid Glass Geometric Accents (Refraction Enhancers) */}
      <div className="absolute top-[12%] right-[7%] w-80 h-48 rounded-[2rem] bg-white/20 backdrop-blur-2xl border border-white/40 shadow-2xl shadow-sky-500/10 rotate-[-5deg] hidden lg:block" />
      <div className="absolute bottom-[20%] left-[5%] w-96 h-56 rounded-[2.25rem] bg-white/15 backdrop-blur-2xl border border-white/35 shadow-2xl shadow-indigo-500/10 rotate-[7deg] hidden lg:block" />
      <div className="absolute top-[60%] right-[15%] w-48 h-48 rounded-full bg-gradient-to-tr from-sky-200/20 to-white/30 backdrop-blur-xl border border-white/40 shadow-xl rotate-[12deg] hidden xl:block animate-float-slow" />

      {/* 3. Subtle Arabic Calligraphy & Typography Engineering Overlay */}
      <svg
        className="absolute inset-0 w-full h-full text-sky-700/10 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="calligraphyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Vector Pen Nib & Baseline Grid */}
        <g stroke="currentColor" strokeWidth="1" strokeDasharray="4 6" opacity="0.35">
          <line x1="0" y1="220" x2="1440" y2="220" />
          <line x1="0" y1="680" x2="1440" y2="680" />
        </g>

        {/* Large Translucent Calligraphic Swoosh - Thuluth Stroke Curve */}
        <path
          d="M -100,280 C 300,100 600,450 1100,200 C 1300,100 1450,220 1550,180"
          fill="none"
          stroke="url(#calligraphyGrad)"
          strokeWidth="3.5"
          opacity="0.6"
        />
        <path
          d="M -100,300 C 320,120 580,430 1120,220 C 1310,120 1440,240 1550,200"
          fill="none"
          stroke="url(#calligraphyGrad)"
          strokeWidth="1.5"
          opacity="0.3"
        />

        {/* Calligraphic Letterforms - Vector Glyph Silhouettes */}
        <g transform="translate(1150, 100) scale(1.4)" opacity="0.45" fill="currentColor">
          <path d="M 50,80 C 50,40 100,30 150,30 C 200,30 230,60 230,90 C 230,130 180,140 120,140 C 70,140 40,115 40,90 C 40,75 50,65 70,65 C 100,65 120,95 160,95 C 190,95 205,80 205,70 C 205,55 180,45 145,45 C 100,45 70,55 50,80 Z" />
          <circle cx="200" cy="15" r="12" fill="currentColor" />
        </g>

        <g transform="translate(80, 520) scale(1.2)" opacity="0.4" fill="currentColor">
          <path d="M 60,30 C 90,30 110,45 110,65 C 110,85 85,95 65,95 C 95,95 130,120 130,160 C 130,210 80,240 20,240 C -30,240 -70,210 -70,180 L -40,180 C -40,195 -10,215 20,215 C 60,215 95,195 95,160 C 95,125 60,110 20,110 L 20,85 C 50,85 75,75 75,60 C 75,48 60,42 40,42 C 20,42 -10,52 -25,65 L -45,45 C -20,25 20,30 60,30 Z" />
        </g>

        {/* Vector Nodes & Bezier Control Lines */}
        <g stroke="currentColor" strokeWidth="1.2" opacity="0.5">
          <rect x="340" y="215" width="10" height="10" fill="currentColor" rx="2" />
          <line x1="345" y1="220" x2="380" y2="170" />
          <circle cx="380" cy="170" r="4" fill="currentColor" />

          <rect x="980" y="275" width="10" height="10" fill="currentColor" rx="2" />
          <line x1="985" y1="280" x2="940" y2="330" />
          <circle cx="940" cy="330" r="4" fill="currentColor" />
        </g>
      </svg>

      {/* 4. Fine Subtle Noise Overlay for Tactile Glass Texture */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230284c7' fill-opacity='1'%3E%3Cpath d='M0 38h2v2H0v-2zm4 0h2v2H4v-2zm4 0h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM0 30h2v2H0v-2zm4 0h2v2H4v-2zm8 0h2v2h-2v-2zm4 0h2v2h-2v-2zm8 0h2v2h-2v-2zm4 0h2v2h-2v-2zm8 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
});

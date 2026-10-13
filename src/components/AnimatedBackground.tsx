import React from 'react';

/**
 * AnimatedBackground
 * 
 * Provides subtle ambient gradient meshes, liquid caustic light waves,
 * and refractive glass prisms that move slowly and reflect the brand colors
 * (Sky Blue, Royal Sapphire, Classical Saffron/Amber Gold, Cyan Aquamarine, and Indigo).
 * Enhances the Apple VisionOS / macOS Liquid Glass aesthetic across the entire application.
 */
export const AnimatedBackground: React.FC = React.memo(() => {
  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none"
    >
      {/* =========================================================================
          1. Multi-Node Ambient Gradient Mesh (Brand Colors: Sky, Azure, Amber, Cyan, Indigo)
          ========================================================================= */}
      
      {/* Mesh Node 1: Primary Sky & Cyan Radiant Sunburst (Top-Right Quadrant) */}
      <div
        className="absolute -top-[12%] -right-[8%] w-[900px] h-[900px] rounded-full opacity-60 mix-blend-multiply blur-[140px] animate-mesh-slow-1"
        style={{
          background: 'radial-gradient(circle at 35% 35%, rgba(56, 189, 248, 0.45) 0%, rgba(2, 132, 199, 0.35) 45%, rgba(37, 99, 235, 0.15) 75%, transparent 100%)',
        }}
      />

      {/* Mesh Node 2: Royal Sapphire & Indigo Fluid Wave (Center-Left Quadrant) */}
      <div
        className="absolute top-[22%] -left-[14%] w-[850px] h-[850px] rounded-full opacity-55 mix-blend-multiply blur-[150px] animate-mesh-slow-2"
        style={{
          background: 'radial-gradient(circle at 60% 40%, rgba(37, 99, 235, 0.35) 0%, rgba(79, 70, 229, 0.28) 45%, rgba(14, 165, 233, 0.18) 75%, transparent 100%)',
        }}
      />

      {/* Mesh Node 3: Saffron & Warm Amber Calligraphy Accent (Top-Center / Golden Ink Glow) */}
      <div
        className="absolute top-[8%] left-[30%] w-[680px] h-[680px] rounded-full blur-[130px] animate-mesh-warm"
        style={{
          background: 'radial-gradient(circle at 50% 50%, rgba(251, 191, 36, 0.32) 0%, rgba(245, 158, 11, 0.22) 40%, rgba(249, 115, 22, 0.12) 70%, transparent 100%)',
        }}
      />

      {/* Mesh Node 4: Aquamarine & Teal Luminous Pool (Bottom-Left Quadrant) */}
      <div
        className="absolute -bottom-[10%] left-[8%] w-[820px] h-[820px] rounded-full opacity-50 mix-blend-multiply blur-[140px] animate-mesh-slow-3"
        style={{
          background: 'radial-gradient(circle at 45% 45%, rgba(6, 182, 212, 0.35) 0%, rgba(20, 184, 166, 0.25) 45%, rgba(56, 189, 248, 0.15) 75%, transparent 100%)',
        }}
      />

      {/* Mesh Node 5: Deep Twilight Violet & Blue Lagoon (Bottom-Right Quadrant) */}
      <div
        className="absolute -bottom-[15%] right-[5%] w-[880px] h-[880px] rounded-full opacity-55 mix-blend-multiply blur-[160px] animate-mesh-slow-1"
        style={{
          background: 'radial-gradient(circle at 40% 60%, rgba(99, 102, 241, 0.32) 0%, rgba(139, 92, 246, 0.24) 45%, rgba(2, 132, 199, 0.2) 75%, transparent 100%)',
        }}
      />

      {/* Mesh Node 6: Organic Morphing Center Core Blob */}
      <div
        className="absolute top-[40%] left-[38%] w-[550px] h-[550px] opacity-40 blur-[110px] animate-liquid-blob animate-float-slow"
        style={{
          background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.3) 0%, rgba(99, 102, 241, 0.25) 50%, rgba(251, 191, 36, 0.18) 100%)',
        }}
      />

      {/* =========================================================================
          2. Liquid Glass Caustic Light & Refraction Sweep
          ========================================================================= */}
      <div
        className="absolute -top-[20%] -left-[10%] w-[140%] h-[140%] opacity-35 mix-blend-overlay pointer-events-none animate-caustic-shimmer"
        style={{
          background: 'radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.6) 0%, rgba(224, 242, 254, 0.2) 35%, rgba(255, 255, 255, 0) 70%)',
        }}
      />

      {/* =========================================================================
          3. Floating Liquid Glass Geometric Refraction Prisms
          ========================================================================= */}
      {/* Glass Prism Card (Top Right) */}
      <div className="absolute top-[14%] right-[8%] w-88 h-52 rounded-[2.5rem] bg-white/25 backdrop-blur-2xl border border-white/60 shadow-2xl shadow-sky-500/10 rotate-[-6deg] hidden lg:block transition-transform duration-1000 ease-out hover:rotate-[-4deg]">
        {/* Internal Specular Edge Light */}
        <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-white/40 via-transparent to-sky-300/10 pointer-events-none" />
      </div>

      {/* Glass Prism Card (Bottom Left) */}
      <div className="absolute bottom-[22%] left-[6%] w-[26rem] h-60 rounded-[2.75rem] bg-white/20 backdrop-blur-2xl border border-white/50 shadow-2xl shadow-indigo-500/10 rotate-[8deg] hidden lg:block transition-transform duration-1000 ease-out hover:rotate-[6deg]">
        <div className="absolute inset-0 rounded-[2.75rem] bg-gradient-to-tr from-white/35 via-transparent to-indigo-300/10 pointer-events-none" />
      </div>

      {/* Glass Orb Prism (Floating Mid-Right) */}
      <div className="absolute top-[58%] right-[16%] w-52 h-52 rounded-full bg-gradient-to-tr from-sky-200/25 via-white/30 to-amber-100/20 backdrop-blur-xl border border-white/60 shadow-xl rotate-[14deg] hidden xl:block animate-float-slow">
        <div className="absolute inset-2 rounded-full border border-white/40 opacity-70" />
      </div>

      {/* =========================================================================
          4. Arabic Calligraphy Engineering Overlay & Vector Grid Baseline
          ========================================================================= */}
      <svg
        className="absolute inset-0 w-full h-full text-sky-800/12 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="calligraphyMeshGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0284c7" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#4f46e5" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* Technical Baseline & Cap-Height Guide Lines */}
        <g stroke="currentColor" strokeWidth="1" strokeDasharray="5 7" opacity="0.4">
          <line x1="0" y1="210" x2="1440" y2="210" />
          <line x1="0" y1="690" x2="1440" y2="690" />
        </g>

        {/* Master Calligraphic Stroke (Thuluth Fluid Swoosh) */}
        <path
          d="M -80,260 C 280,90 620,440 1080,190 C 1290,90 1440,210 1560,170"
          fill="none"
          stroke="url(#calligraphyMeshGrad)"
          strokeWidth="3.5"
          opacity="0.65"
        />
        <path
          d="M -80,285 C 310,115 590,415 1110,215 C 1310,115 1430,230 1560,190"
          fill="none"
          stroke="url(#calligraphyMeshGrad)"
          strokeWidth="1.5"
          opacity="0.35"
        />

        {/* Vector Glyphs & Typographic Vector Nodes */}
        <g transform="translate(1140, 95) scale(1.4)" opacity="0.45" fill="currentColor">
          <path d="M 50,80 C 50,40 100,30 150,30 C 200,30 230,60 230,90 C 230,130 180,140 120,140 C 70,140 40,115 40,90 C 40,75 50,65 70,65 C 100,65 120,95 160,95 C 190,95 205,80 205,70 C 205,55 180,45 145,45 C 100,45 70,55 50,80 Z" />
          <circle cx="200" cy="15" r="12" fill="currentColor" />
        </g>

        <g transform="translate(75, 510) scale(1.25)" opacity="0.4" fill="currentColor">
          <path d="M 60,30 C 90,30 110,45 110,65 C 110,85 85,95 65,95 C 95,95 130,120 130,160 C 130,210 80,240 20,240 C -30,240 -70,210 -70,180 L -40,180 C -40,195 -10,215 20,215 C 60,215 95,195 95,160 C 95,125 60,110 20,110 L 20,85 C 50,85 75,75 75,60 C 75,48 60,42 40,42 C 20,42 -10,52 -25,65 L -45,45 C -20,25 20,30 60,30 Z" />
        </g>

        {/* Vector Anchor Points with Saffron & Sky Connectors */}
        <g stroke="currentColor" strokeWidth="1.2" opacity="0.55">
          <rect x="340" y="205" width="10" height="10" fill="#0284c7" rx="2" />
          <line x1="345" y1="210" x2="385" y2="160" />
          <circle cx="385" cy="160" r="4.5" fill="#f59e0b" />

          <rect x="980" y="270" width="10" height="10" fill="#4f46e5" rx="2" />
          <line x1="985" y1="275" x2="945" y2="325" />
          <circle cx="945" cy="325" r="4.5" fill="#0284c7" />
        </g>
      </svg>

      {/* =========================================================================
          5. Ultra-fine Tactile Glass Grain (Removes digital banding in heavy blur)
          ========================================================================= */}
      <div
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%230284c7' fill-opacity='1'%3E%3Cpath d='M0 38h2v2H0v-2zm4 0h2v2H4v-2zm4 0h2v2H8v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zm4 0h2v2h-2v-2zM0 30h2v2H0v-2zm4 0h2v2H4v-2zm8 0h2v2h-2v-2zm4 0h2v2h-2v-2zm8 0h2v2h-2v-2zm4 0h2v2h-2v-2zm8 0h2v2h-2v-2z'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
    </div>
  );
});

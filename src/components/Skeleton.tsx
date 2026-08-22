import React from 'react';

interface SkeletonProps {
  className?: string;
  style?: React.CSSProperties;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = '', style }) => {
  return (
    <div
      style={style}
      className={`bg-[#e2e8f0] animate-pulse rounded-xl transition-colors duration-300 ${className}`}
    />
  );
};

export const SkeletonText: React.FC<{ lines?: number; className?: string }> = ({
  lines = 3,
  className = '',
}) => {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, index) => (
        <Skeleton
          key={index}
          className={`h-4 ${index === lines - 1 ? 'w-2/3' : 'w-full'}`}
        />
      ))}
    </div>
  );
};

export const SkeletonCard: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-sm transition-colors duration-300 ${className}`}
    >
      <div className="flex items-center gap-3">
        <Skeleton className="w-10 h-10 rounded-xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-5 w-1/3" />
          <Skeleton className="h-3.5 w-2/3" />
        </div>
      </div>
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="flex justify-between items-center pt-2">
        <Skeleton className="h-8 w-24 rounded-lg" />
        <Skeleton className="h-8 w-16 rounded-lg" />
      </div>
    </div>
  );
};

// Skeleton Screen for Gallery / Cloud Font Cards
export const FontCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-5 shadow-sm">
      <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-4">
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2">
            <Skeleton className="h-6 w-32 rounded-lg" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>
        <Skeleton className="w-9 h-9 rounded-xl" />
      </div>

      {/* Main Canvas preview box skeleton */}
      <Skeleton className="h-36 w-full rounded-2xl" />

      {/* Tags and description skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-3.5 w-full rounded-md" />
        <Skeleton className="h-3.5 w-3/4 rounded-md" />
        <div className="flex gap-1.5 pt-1">
          <Skeleton className="h-5 w-12 rounded-md" />
          <Skeleton className="h-5 w-14 rounded-md" />
          <Skeleton className="h-5 w-10 rounded-md" />
        </div>
      </div>

      {/* Action buttons skeleton */}
      <div className="pt-4 border-t border-slate-100 flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-20 rounded-xl" />
      </div>
    </div>
  );
};

// Skeleton Screen for Project Cards (My Fonts page)
export const ProjectCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-sm">
      <Skeleton className="h-28 w-full rounded-xl" />
      <div className="space-y-2">
        <Skeleton className="h-5 w-1/2 rounded-md" />
        <div className="flex justify-between items-center">
          <Skeleton className="h-3.5 w-20 rounded-md" />
          <Skeleton className="h-3.5 w-24 rounded-md" />
        </div>
      </div>
      <div className="pt-2 border-t border-slate-100 flex gap-2">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
    </div>
  );
};

// Skeleton Screen for Glyphs Grid
export const GlyphItemSkeleton: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-12 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
    </div>
  );
};

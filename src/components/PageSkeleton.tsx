import React from 'react';
import { Skeleton, SkeletonCard } from './Skeleton';

export const PageSkeleton: React.FC = () => {
  return (
    <div className="pb-28 pt-6 px-4 max-w-7xl mx-auto space-y-8 animate-fade-in">
      {/* Header Banner Skeleton */}
      <div className="bg-white border border-slate-200 rounded-3xl p-8 md:p-10 space-y-4 shadow-sm transition-colors duration-300">
        <div className="flex items-center gap-3">
          <Skeleton className="w-12 h-12 rounded-2xl" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <Skeleton className="h-12 w-full max-w-md rounded-2xl mt-4" />
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
};


import React from 'react';

export const SkeletonLoader: React.FC = () => {
  return (
    <div className="relative">
       <div className="absolute -left-[42px] top-1 h-6 w-6 rounded-full bg-brand-border animate-pulse"></div>

      <div className="bg-brand-surface border border-brand-border rounded-lg p-5 shadow-md">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-brand-border rounded w-1/3 animate-pulse"></div>
          <div className="h-4 bg-brand-border rounded w-1/4 animate-pulse"></div>
        </div>
        
        <div className="mb-5 flex items-start gap-3">
            <div className="h-6 w-6 bg-brand-border rounded-full animate-pulse"></div>
            <div className="w-full h-6 bg-brand-border rounded animate-pulse"></div>
        </div>

        <div className="border-t border-brand-border pt-4 space-y-3">
          <div className="flex justify-between">
            <div className="h-4 bg-brand-border rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-brand-border rounded w-1/3 animate-pulse"></div>
          </div>
          <div className="flex justify-between">
            <div className="h-4 bg-brand-border rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-brand-border rounded w-1/3 animate-pulse"></div>
          </div>
           <div className="flex justify-between">
            <div className="h-4 bg-brand-border rounded w-1/4 animate-pulse"></div>
            <div className="h-4 bg-brand-border rounded w-1/3 animate-pulse"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

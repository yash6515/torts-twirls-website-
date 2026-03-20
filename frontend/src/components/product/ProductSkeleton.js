import React from 'react';

const ProductSkeleton = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-card">
    <div className="aspect-[4/3] skeleton" />
    <div className="p-4 space-y-3">
      <div className="skeleton h-2.5 w-16 rounded-full" />
      <div className="skeleton h-4 w-3/4 rounded" />
      <div className="skeleton h-3.5 w-1/2 rounded" />
      <div className="flex items-center gap-1 mt-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="skeleton w-3 h-3 rounded-full" />
        ))}
        <div className="skeleton h-3 w-10 rounded ml-1" />
      </div>
      <div className="flex justify-between items-center pt-1">
        <div className="skeleton h-5 w-20 rounded" />
        <div className="flex gap-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="skeleton w-3.5 h-3.5 rounded-full" />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const ProductGridSkeleton = ({ count = 8 }) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
    {Array.from({ length: count }).map((_, i) => (
      <ProductSkeleton key={i} />
    ))}
  </div>
);

export default ProductSkeleton;

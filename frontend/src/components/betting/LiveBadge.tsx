'use client';

export function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-200"></span>
      </span>
      LIVE
    </div>
  );
}

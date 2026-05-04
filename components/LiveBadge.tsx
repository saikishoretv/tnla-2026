"use client";

export default function LiveBadge({ lastUpdated }: { lastUpdated?: string }) {
  return (
    <div className="flex items-center gap-2 text-sm text-gray-400">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-500 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
      </span>
      <span className="font-medium text-red-400">LIVE</span>
      {lastUpdated && (
        <span className="text-gray-500">· Updated {lastUpdated}</span>
      )}
    </div>
  );
}

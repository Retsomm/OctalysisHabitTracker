import React from 'react'

const SkeletonCard = (): React.JSX.Element => (
  <div className="border-b border-zinc-800 p-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 bg-zinc-800 rounded-full w-24" />
          <div className="h-3 bg-zinc-800 rounded-full w-16" />
        </div>
        <div className="h-4 bg-zinc-800 rounded-full w-3/4" />
        <div className="h-3 bg-zinc-800 rounded-full w-1/2" />
        <div className="flex items-center gap-2 mt-2">
          <div className="h-6 bg-zinc-800 rounded-full w-16" />
          <div className="h-6 bg-zinc-800 rounded-full w-12" />
          <div className="h-6 bg-zinc-800 rounded-full w-20" />
        </div>
      </div>
    </div>
  </div>
)

const HabitFeedSkeleton = (): React.JSX.Element => (
  <div>
    {Array.from({ length: 5 }).map((_, i) => (
      <SkeletonCard key={i} />
    ))}
  </div>
)

const DashboardSkeleton = (): React.JSX.Element => (
  <div className="px-4 py-6 space-y-6 animate-pulse">
    {/* User card skeleton */}
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-zinc-800" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-zinc-800 rounded-full w-32" />
          <div className="h-3 bg-zinc-800 rounded-full w-24" />
          <div className="h-3 bg-zinc-800 rounded-full w-40" />
        </div>
      </div>
      <div className="h-2 bg-zinc-800 rounded-full w-full" />
    </div>
    {/* Stats skeleton */}
    <div className="grid grid-cols-3 gap-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-center space-y-2">
          <div className="h-6 bg-zinc-800 rounded-full w-12 mx-auto" />
          <div className="h-3 bg-zinc-800 rounded-full w-16 mx-auto" />
        </div>
      ))}
    </div>
    {/* Chart skeleton */}
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
      <div className="h-5 bg-zinc-800 rounded-full w-40 mb-2" />
      <div className="h-3 bg-zinc-800 rounded-full w-28 mb-4" />
      <div className="w-48 h-48 rounded-full bg-zinc-800 mx-auto" />
    </div>
  </div>
)

export { SkeletonCard, HabitFeedSkeleton, DashboardSkeleton }

import React from 'react'

const SkeletonCard = (): React.JSX.Element => (
  <div className="border-b border-line px-5 py-4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-full bg-line-2 shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-3 bg-line-2 rounded-full w-24" />
          <div className="h-3 bg-line-2 rounded-full w-16" />
        </div>
        <div className="h-4 bg-line-2 rounded-full w-3/4" />
        <div className="h-3 bg-line-2 rounded-full w-1/2" />
        <div className="flex items-center gap-2 mt-2">
          <div className="h-5 bg-line-2 rounded-full w-16" />
          <div className="h-5 bg-line-2 rounded-full w-12" />
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
  <div className="px-6 py-6 space-y-4 animate-pulse">
    <div className="grid grid-cols-3 gap-3.5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="bg-paper border border-line rounded-[14px] p-5">
          <div className="h-3 bg-line-2 rounded-full w-20 mb-3" />
          <div className="h-12 bg-line-2 rounded-full w-24" />
        </div>
      ))}
    </div>
    <div className="bg-paper border border-line rounded-[14px] p-5">
      <div className="h-3 bg-line-2 rounded-full w-28 mb-3" />
      <div className="h-5 bg-line-2 rounded-full w-40 mb-4" />
      <div className="w-48 h-48 rounded-full bg-line-2 mx-auto" />
    </div>
  </div>
)

export { SkeletonCard, HabitFeedSkeleton, DashboardSkeleton }

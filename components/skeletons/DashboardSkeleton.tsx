import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      {/* Page header skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-6 w-96" />
      </div>

      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="rounded-lg bg-white p-6 shadow space-y-3">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-10 w-20" />
          </div>
        ))}
      </div>

      {/* Calendar skeleton */}
      <div className="rounded-lg bg-white p-6 shadow space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-48" />
          <div className="flex gap-4">
            <Skeleton className="h-10 w-10" />
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-10 w-10" />
          </div>
        </div>

        {/* Calendar grid */}
        <div className="space-y-2">
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="py-2 text-center text-xs font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* CTA card skeleton */}
      <div className="rounded-lg bg-white p-8 text-center shadow space-y-4">
        <Skeleton className="h-7 w-64 mx-auto" />
        <Skeleton className="h-5 w-96 mx-auto" />
        <Skeleton className="h-12 w-48 mx-auto" />
      </div>
    </div>
  )
}

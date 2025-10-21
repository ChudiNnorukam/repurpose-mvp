"use client"

interface StatCardProps {
  title: string
  value: string
  description: string
  trend: string
}

function StatCard({ title, value, description, trend }: StatCardProps) {
  const isPositive = trend.startsWith('+')

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <span className={`text-xs font-medium ${
          isPositive ? 'text-green-600' : 'text-gray-600'
        }`}>
          {trend}
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold tracking-tight">{value}</p>
        <p className="text-xs text-gray-500">{description}</p>
      </div>
    </div>
  )
}

export function StatsSection() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <StatCard
        title="Total Posts"
        value="0"
        description="Posts created"
        trend="+0%"
      />
      <StatCard
        title="Scheduled"
        value="0"
        description="Posts scheduled"
        trend="+0%"
      />
      <StatCard
        title="Published"
        value="0"
        description="Posts published"
        trend="+0%"
      />
    </div>
  )
}

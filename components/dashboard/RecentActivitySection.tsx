"use client"

export function RecentActivitySection() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
      <div className="text-center py-12 text-gray-500">
        <p className="mb-2">No recent activity yet</p>
        <p className="text-sm">
          Start by connecting your accounts and creating your first post
        </p>
      </div>
    </div>
  )
}

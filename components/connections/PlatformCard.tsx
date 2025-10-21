"use client"

import { BUTTON_VARIANTS } from '@/lib/design-tokens'

interface PlatformCardProps {
  platform: 'twitter' | 'linkedin' | 'instagram'
  icon: React.ReactNode
  isConnected: boolean
  username?: string
  onConnect: () => void
  onDisconnect: () => void
  isComingSoon?: boolean
}

export function PlatformCard({
  platform,
  icon,
  isConnected,
  username,
  onConnect,
  onDisconnect,
  isComingSoon = false
}: PlatformCardProps) {
  const platformName = platform.charAt(0).toUpperCase() + platform.slice(1)

  if (isComingSoon) {
    return (
      <div className="bg-white rounded-lg shadow p-6 opacity-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center text-xl font-bold">
              {icon}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{platformName}</h3>
              <p className="text-sm text-gray-500">Coming soon</p>
            </div>
          </div>
          <button
            disabled
            className="px-4 py-2 text-sm font-medium text-gray-400 border border-gray-300 rounded-md cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center text-xl font-bold">
            {icon}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{platformName}</h3>
            {isConnected && username ? (
              <p className="text-sm text-green-600">
                Connected {platform === 'twitter' ? `as @${username}` : `as ${username}`}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Not connected</p>
            )}
          </div>
        </div>
        {isConnected ? (
          <button
            onClick={onDisconnect}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-md hover:bg-red-50"
          >
            Disconnect
          </button>
        ) : (
          <button
            onClick={onConnect}
            className={BUTTON_VARIANTS.primary}
          >
            Connect {platformName}
          </button>
        )}
      </div>
    </div>
  )
}

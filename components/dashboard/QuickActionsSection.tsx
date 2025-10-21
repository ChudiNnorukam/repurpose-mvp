"use client"

import Link from 'next/link'

interface QuickActionCardProps {
  title: string
  description: string
  href: string
}

function QuickActionCard({ title, description, href }: QuickActionCardProps) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-gray-200 bg-white p-4 transition-all hover:border-blue-400 hover:shadow-md"
    >
      <h3 className="font-semibold mb-1 group-hover:text-blue-600 transition-colors">
        {title}
      </h3>
      <p className="text-sm text-gray-600">
        {description}
      </p>
    </Link>
  )
}

export function QuickActionsSection() {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <QuickActionCard
          title="Create Post"
          description="Write a new post for your platforms"
          href="/create"
        />
        <QuickActionCard
          title="View Posts"
          description="Manage all your content"
          href="/posts"
        />
        <QuickActionCard
          title="Connect Accounts"
          description="Link your social platforms"
          href="/connections"
        />
        <QuickActionCard
          title="Browse Templates"
          description="Start with AI templates"
          href="/templates"
        />
      </div>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { ReactNode } from 'react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
  footerText?: string
  footerLink?: { text: string; href: string }
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footerText,
  footerLink
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <Link href="/landing" className="inline-block">
            <h1 className="text-3xl font-bold text-gray-900">
              Repurpose<span className="text-blue-600">AI</span>
            </h1>
          </Link>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
          )}
        </div>

        {/* Content */}
        <div className="bg-white py-8 px-6 shadow-sm rounded-lg border border-gray-200">
          {children}
        </div>

        {/* Footer */}
        {footerText && footerLink && (
          <p className="text-center text-sm text-gray-600">
            {footerText}{' '}
            <Link
              href={footerLink.href}
              className="font-medium text-blue-600 hover:text-blue-500 transition"
            >
              {footerLink.text}
            </Link>
          </p>
        )}
      </div>
    </div>
  )
}

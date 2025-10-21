"use client"

import Link from 'next/link'
import { OnboardingChecklist } from '@/components/onboarding/OnboardingChecklist'
import { useOnboarding } from '@/lib/hooks/useOnboarding'

export function OnboardingSidebar() {
  const onboarding = useOnboarding()

  return (
    <div className="sticky top-24 space-y-6">
      {!onboarding.completed && onboarding.showWelcomeModal && (
        <OnboardingChecklist
          completed={onboarding.completed}
          stepsCompleted={onboarding.stepsCompleted}
          progressPercentage={onboarding.progressPercentage}
          onCompleteStep={onboarding.completeStep}
          onDismiss={onboarding.dismissWelcomeModal}
        />
      )}

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold mb-4">Connected Accounts</h2>
        <div className="text-center py-8 text-gray-500">
          <p className="mb-2">No accounts connected</p>
          <p className="text-sm mb-4">
            Connect Twitter, LinkedIn, or Instagram to start posting
          </p>
          <Link
            href="/connections"
            className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm font-medium transition-colors"
          >
            Connect Account
          </Link>
        </div>
      </div>
    </div>
  )
}

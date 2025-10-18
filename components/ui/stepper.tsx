"use client"

import * as React from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface Step {
  title: string
  description?: string
}

interface StepperProps {
  steps: Step[]
  currentStep: number
  className?: string
}

export function Stepper({ steps, currentStep, className }: StepperProps) {
  return (
    <nav aria-label="Progress" className={className}>
      <ol role="list" className="flex items-center justify-between sm:flex-row flex-col gap-4 sm:gap-0">
        {steps.map((step, index) => (
          <li key={step.title} className="relative flex items-center sm:flex-1">
            {/* Step Number/Check */}
            <div className="flex items-center">
              <div
                className={cn(
                  "flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  index < currentStep
                    ? "border-blue-600 bg-blue-600 text-white"
                    : index === currentStep
                    ? "border-blue-600 bg-white text-blue-600"
                    : "border-gray-300 bg-white text-gray-500"
                )}
              >
                {index < currentStep ? (
                  <Check className="h-5 w-5" aria-hidden="true" />
                ) : (
                  <span className="text-sm font-semibold">{index + 1}</span>
                )}
              </div>
              
              {/* Step Info */}
              <div className="ml-4 min-w-0 sm:block hidden">
                <p
                  className={cn(
                    "text-sm font-medium",
                    index <= currentStep ? "text-gray-900" : "text-gray-500"
                  )}
                >
                  {step.title}
                </p>
                {step.description && (
                  <p className="text-xs text-gray-500">{step.description}</p>
                )}
              </div>
            </div>

            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "hidden sm:block h-0.5 w-full mx-4 transition-colors",
                  index < currentStep ? "bg-blue-600" : "bg-gray-300"
                )}
                aria-hidden="true"
              />
            )}
          </li>
        ))}
      </ol>
      
      {/* Mobile step title */}
      <div className="sm:hidden mt-4 text-center">
        <p className="text-sm font-medium text-gray-900">{steps[currentStep]?.title}</p>
        {steps[currentStep]?.description && (
          <p className="text-xs text-gray-500 mt-1">{steps[currentStep].description}</p>
        )}
      </div>
    </nav>
  )
}

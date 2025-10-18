"use client"

import { useState } from "react"
import { Stepper, type Step } from "@/components/ui/stepper"
import { COLOR_PRIMARY, COLOR_SECONDARY, BUTTON_VARIANTS } from "@/lib/design-tokens"

const steps: Step[] = [
  { title: "Platform", description: "Choose platforms" },
  { title: "Content", description: "Write your post" },
  { title: "Adapt", description: "AI customization" },
  { title: "Schedule", description: "Review & schedule" }
]

export default function CreatePage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState({
    platforms: [] as string[],
    content: "",
    tone: "professional",
    includeHashtags: true,
    scheduledTime: ""
  })

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handlePlatformToggle = (platform: string) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Content</h1>
          <p className="text-gray-600">Follow the steps below to create and schedule your post</p>
        </div>

        {/* Stepper */}
        <div className="mb-8">
          <Stepper steps={steps} currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 min-h-[400px]">
          {currentStep === 0 && (
            <StepPlatform
              selectedPlatforms={formData.platforms}
              onToggle={handlePlatformToggle}
            />
          )}

          {currentStep === 1 && (
            <StepContent
              content={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
            />
          )}

          {currentStep === 2 && (
            <StepAdapt
              tone={formData.tone}
              includeHashtags={formData.includeHashtags}
              onToneChange={(tone) => setFormData(prev => ({ ...prev, tone }))}
              onHashtagsToggle={() => setFormData(prev => ({ ...prev, includeHashtags: !prev.includeHashtags }))}
            />
          )}

          {currentStep === 3 && (
            <StepReview
              formData={formData}
              onScheduleChange={(scheduledTime) => setFormData(prev => ({ ...prev, scheduledTime }))}
            />
          )}
        </div>

        {/* Navigation */}
        <div className="mt-6 flex items-center justify-between">
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              currentStep === 0
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Back
          </button>

          <div className="flex gap-3">
            <button
              className="px-4 py-2 rounded-md font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Save Draft
            </button>

            {currentStep < steps.length - 1 ? (
              <button
                onClick={handleNext}
                disabled={currentStep === 0 && formData.platforms.length === 0}
                className={`px-6 py-2 rounded-md font-medium transition-colors ${
                  currentStep === 0 && formData.platforms.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                Next Step
              </button>
            ) : (
              <button
                className="px-6 py-2 rounded-md font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Schedule Post
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 1: Platform Selection
function StepPlatform({ 
  selectedPlatforms, 
  onToggle 
}: { 
  selectedPlatforms: string[], 
  onToggle: (platform: string) => void 
}) {
  const platforms = [
    { id: "twitter", name: "Twitter", icon: "𝕏", color: "text-blue-500" },
    { id: "linkedin", name: "LinkedIn", icon: "in", color: "text-blue-700" },
    { id: "instagram", name: "Instagram", icon: "IG", color: "text-pink-600" }
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Select Platforms</h2>
      <p className="text-gray-600 mb-6">Choose where you want to publish your content</p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {platforms.map(platform => {
          const isSelected = selectedPlatforms.includes(platform.id)
          return (
            <button
              key={platform.id}
              onClick={() => onToggle(platform.id)}
              className={`p-6 border-2 rounded-lg transition-all ${
                isSelected
                  ? "border-blue-600 bg-blue-50"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <div className={`text-4xl mb-2 ${platform.color}`}>{platform.icon}</div>
              <div className="font-semibold">{platform.name}</div>
              {isSelected && (
                <div className="text-xs text-blue-600 mt-2">✓ Selected</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// Step 2: Content Input
function StepContent({ 
  content, 
  onChange 
}: { 
  content: string, 
  onChange: (content: string) => void 
}) {
  const charCount = content.length
  const maxChars = 280

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Write Your Content</h2>
      <p className="text-gray-600 mb-6">Compose your post content below</p>

      <div className="space-y-4">
        <div>
          <textarea
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder="What's on your mind?"
            rows={8}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
          <div className={`text-sm text-right mt-2 ${
            charCount > maxChars ? "text-red-600" : "text-gray-500"
          }`}>
            {charCount} / {maxChars} characters
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 3: AI Adaptation
function StepAdapt({ 
  tone, 
  includeHashtags,
  onToneChange,
  onHashtagsToggle
}: { 
  tone: string, 
  includeHashtags: boolean,
  onToneChange: (tone: string) => void,
  onHashtagsToggle: () => void
}) {
  const tones = [
    { id: "professional", label: "Professional", emoji: "💼" },
    { id: "casual", label: "Casual", emoji: "😊" },
    { id: "enthusiastic", label: "Enthusiastic", emoji: "🚀" },
    { id: "informative", label: "Informative", emoji: "📚" }
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">AI Adaptation</h2>
      <p className="text-gray-600 mb-6">Customize how AI adapts your content</p>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Tone</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {tones.map(t => (
              <button
                key={t.id}
                onClick={() => onToneChange(t.id)}
                className={`p-3 border-2 rounded-lg transition-all ${
                  tone === t.id
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="text-2xl mb-1">{t.emoji}</div>
                <div className="text-sm font-medium">{t.label}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
          <div>
            <div className="font-medium">Include Hashtags</div>
            <div className="text-sm text-gray-600">Add relevant hashtags to your posts</div>
          </div>
          <button
            onClick={onHashtagsToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              includeHashtags ? "bg-blue-600" : "bg-gray-200"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                includeHashtags ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}

// Step 4: Review & Schedule
function StepReview({ 
  formData,
  onScheduleChange
}: { 
  formData: any,
  onScheduleChange: (time: string) => void
}) {
  return (
    <div>
      <h2 className="text-xl font-semibold mb-2">Review & Schedule</h2>
      <p className="text-gray-600 mb-6">Review your post and set a schedule</p>

      <div className="space-y-6">
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="text-sm font-medium text-gray-700 mb-2">Content Preview</div>
          <p className="text-gray-900 whitespace-pre-wrap">{formData.content || "No content yet..."}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">Platforms</div>
            <div className="text-gray-900">{formData.platforms.join(", ") || "None selected"}</div>
          </div>
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="text-sm font-medium text-gray-700 mb-1">Tone</div>
            <div className="text-gray-900 capitalize">{formData.tone}</div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Schedule Time (Optional)
          </label>
          <input
            type="datetime-local"
            value={formData.scheduledTime}
            onChange={(e) => onScheduleChange(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">Leave empty to publish immediately</p>
        </div>
      </div>
    </div>
  )
}

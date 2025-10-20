'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { CharacterCounter } from '@/components/ui/character-counter'
import {
  Sparkles,
  RefreshCw,
  Send,
  Save,
  CheckCircle2,
  AlertCircle,
  Twitter,
  Linkedin,
  Calendar,
  TrendingUp
} from 'lucide-react'
import { useRouter } from 'next/navigation'

type Platform = 'twitter' | 'linkedin'
type ContentPillar = 'educational' | 'philosophy' | 'misconception' | 'project'

interface GeneratedContent {
  post?: string
  tweets?: Array<{ text: string; position: number }>
  hook?: string
  pillar?: ContentPillar
  characterCount?: number
  totalTweets?: number
  qualityChecks?: Record<string, boolean>
}

export default function ContentEditorPage() {
  const router = useRouter()

  // Form state
  const [platform, setPlatform] = useState<Platform>('linkedin')
  const [pillar, setPillar] = useState<ContentPillar>('educational')
  const [topic, setTopic] = useState('')
  const [sourceContent, setSourceContent] = useState('')
  const [autoSelectPillar, setAutoSelectPillar] = useState(false)

  // Generation state
  const [isGenerating, setIsGenerating] = useState(false)
  const [isRegenerating, setIsRegenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null)
  const [editedContent, setEditedContent] = useState('')

  // Recommendation state
  const [recommendedPillar, setRecommendedPillar] = useState<ContentPillar | null>(null)
  const [distribution, setDistribution] = useState<Record<string, number> | null>(null)

  // Fetch pillar recommendation on mount
  useEffect(() => {
    fetchRecommendation()
  }, [])

  async function fetchRecommendation() {
    try {
      const response = await fetch('/api/generate/chudi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'recommend-pillar' })
      })

      if (response.ok) {
        const data = await response.json()
        setRecommendedPillar(data.recommended)
        setDistribution(data.currentDistribution)
      }
    } catch (error) {
      console.error('Failed to fetch recommendation:', error)
    }
  }

  async function handleGenerate() {
    if (!topic.trim()) {
      alert('Please enter a topic')
      return
    }

    setIsGenerating(true)
    setGeneratedContent(null)
    setEditedContent('')

    try {
      const response = await fetch('/api/generate/chudi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pillar: autoSelectPillar ? undefined : pillar,
          topic,
          sourceContent: sourceContent || undefined,
          platform,
          autoSelectPillar
        })
      })

      if (!response.ok) {
        throw new Error('Generation failed')
      }

      const data = await response.json()
      setGeneratedContent(data.content)

      // Set edited content for immediate editing
      if (platform === 'linkedin') {
        setEditedContent(data.content.post || '')
      } else {
        setEditedContent(data.content.tweets?.map((t: any) => t.text).join('\n\n') || '')
      }

      // Refresh recommendation after generating
      await fetchRecommendation()
    } catch (error) {
      console.error('Generation error:', error)
      alert('Failed to generate content. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  async function handleRegenerate() {
    setIsRegenerating(true)
    await handleGenerate()
    setIsRegenerating(false)
  }

  async function handleSave() {
    if (!generatedContent) return

    setIsSaving(true)

    try {
      // Content is already saved as draft by the generation endpoint
      // Here we would update it with any edits
      alert('Content saved as draft!')

      // Navigate to posts page
      router.push('/posts')
    } catch (error) {
      console.error('Save error:', error)
      alert('Failed to save content')
    } finally {
      setIsSaving(false)
    }
  }

  function renderQualityChecks() {
    if (!generatedContent?.qualityChecks) return null

    const checks = generatedContent.qualityChecks
    const passed = Object.values(checks).filter(Boolean).length
    const total = Object.keys(checks).length

    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {passed === total ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-yellow-500" />
            )}
            Quality Checks ({passed}/{total})
          </CardTitle>
          <CardDescription>
            {passed === total
              ? 'All quality checks passed! Ready to publish.'
              : 'Some checks failed. Review before publishing.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(checks).map(([key, value]) => (
              <div key={key} className="flex items-center gap-2">
                {value ? (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                )}
                <span className="text-sm">{formatCheckName(key)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  function formatCheckName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, str => str.toUpperCase())
      .trim()
  }

  const maxLength = platform === 'linkedin' ? 3000 : 280

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Content Editor</h1>
        <p className="text-muted-foreground">
          Generate authentic content with Chudi's Type 4w5 voice and thought leadership style
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Input */}
        <div className="space-y-6">
          {/* Platform Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Content Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Platform */}
              <div className="space-y-2">
                <Label>Platform</Label>
                <div className="flex gap-2">
                  <Button
                    variant={platform === 'linkedin' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setPlatform('linkedin')}
                  >
                    <Linkedin className="h-4 w-4 mr-2" />
                    LinkedIn
                  </Button>
                  <Button
                    variant={platform === 'twitter' ? 'default' : 'outline'}
                    className="flex-1"
                    onClick={() => setPlatform('twitter')}
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Content Pillar */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Content Pillar</Label>
                  {recommendedPillar && (
                    <span className="text-xs text-muted-foreground">
                      Recommended: <span className="font-semibold">{recommendedPillar}</span>
                    </span>
                  )}
                </div>

                <Select
                  value={pillar}
                  onValueChange={(value) => setPillar(value as ContentPillar)}
                  disabled={autoSelectPillar}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="educational">
                      Educational (40%) - Teaching AI basics
                    </SelectItem>
                    <SelectItem value="philosophy">
                      Philosophy (30%) - Personal frameworks
                    </SelectItem>
                    <SelectItem value="misconception">
                      Misconception (20%) - Myth-busting
                    </SelectItem>
                    <SelectItem value="project">
                      Project (10%) - Building insights
                    </SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="auto-pillar"
                    checked={autoSelectPillar}
                    onChange={(e) => setAutoSelectPillar(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="auto-pillar" className="text-sm font-normal cursor-pointer">
                    Auto-select pillar to maintain ideal distribution
                  </Label>
                </div>
              </div>

              <Separator />

              {/* Topic */}
              <div className="space-y-2">
                <Label htmlFor="topic">Topic *</Label>
                <Input
                  id="topic"
                  placeholder="e.g., What is Claude Code and when to use it"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </div>

              {/* Source Content */}
              <div className="space-y-2">
                <Label htmlFor="source">Source Content (Optional)</Label>
                <Textarea
                  id="source"
                  placeholder="Add any context, notes, or source material here..."
                  value={sourceContent}
                  onChange={(e) => setSourceContent(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !topic.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Content
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Distribution Stats */}
          {distribution && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <TrendingUp className="h-4 w-4" />
                  Your Content Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(distribution).map(([key, value]) => (
                    <div key={key}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="capitalize">{key}</span>
                        <span className="font-semibold">{value}%</span>
                      </div>
                      <div className="h-2 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary"
                          style={{ width: `${value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Target: Educational 40%, Philosophy 30%, Misconception 20%, Project 10%
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Preview & Edit */}
        <div className="space-y-6">
          {generatedContent ? (
            <>
              {renderQualityChecks()}

              <Card>
                <CardHeader>
                  <CardTitle>Generated Content</CardTitle>
                  <CardDescription>
                    Edit your content below and save as draft or schedule for publishing
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Hook Preview */}
                    {generatedContent.hook && (
                      <div className="p-4 bg-primary/10 rounded-lg border-l-4 border-primary">
                        <Label className="text-xs text-muted-foreground mb-1 block">
                          Hook (First 2-3 lines)
                        </Label>
                        <p className="text-sm font-medium">{generatedContent.hook}</p>
                      </div>
                    )}

                    {/* Editable Content */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="edit">Edit Content</Label>
                        <CharacterCounter
                          current={editedContent.length}
                          max={maxLength}
                        />
                      </div>
                      <Textarea
                        id="edit"
                        value={editedContent}
                        onChange={(e) => setEditedContent(e.target.value)}
                        rows={platform === 'linkedin' ? 20 : 15}
                        className="font-mono text-sm"
                      />
                    </div>

                    {/* Metadata */}
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-xs text-muted-foreground">Pillar</Label>
                        <p className="font-medium capitalize">{generatedContent.pillar}</p>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          {platform === 'linkedin' ? 'Characters' : 'Tweets'}
                        </Label>
                        <p className="font-medium">
                          {platform === 'linkedin'
                            ? generatedContent.characterCount
                            : generatedContent.totalTweets}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleRegenerate}
                    disabled={isRegenerating}
                    className="flex-1"
                  >
                    {isRegenerating ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Regenerating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Regenerate
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex-1"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Draft
                  </Button>
                  <Button
                    onClick={() => router.push('/schedule')}
                    className="flex-1"
                  >
                    <Calendar className="h-4 w-4 mr-2" />
                    Schedule
                  </Button>
                </CardFooter>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="py-12">
                <div className="text-center space-y-4">
                  <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Ready to Create</h3>
                    <p className="text-sm text-muted-foreground">
                      Fill in the topic and click Generate to create your content
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

import { openai } from './anthropic'
import { logger } from './logger'
import { randomUUID } from 'crypto'

type Platform = 'twitter' | 'linkedin'

interface GenerateTopicsParams {
  theme: string
  numTopics: number
}

interface GenerateBatchContentParams {
  theme: string
  topics: string[]
  platforms: Platform[]
}

interface OptimalTime {
  hour: number
  minute: number
}

// Optimal posting times for each platform
const OPTIMAL_TIMES: Record<Platform, OptimalTime[]> = {
  twitter: [
    { hour: 9, minute: 0 },   // 9:00 AM
    { hour: 12, minute: 0 },  // 12:00 PM
    { hour: 15, minute: 0 },  // 3:00 PM
    { hour: 18, minute: 0 },  // 6:00 PM
  ],
  linkedin: [
    { hour: 7, minute: 30 },  // 7:30 AM
    { hour: 12, minute: 0 },  // 12:00 PM
    { hour: 17, minute: 30 }, // 5:30 PM
  ],
}

/**
 * Generate topics from a theme using AI
 */
export async function generateTopicsFromTheme({ 
  theme, 
  numTopics 
}: GenerateTopicsParams): Promise<string[]> {
  const prompt = `Generate ${numTopics} specific, actionable topics for social media posts about: "${theme}"

Rules:
- Each topic should be specific and focused (not broad)
- Topics should be practical and useful for the audience
- Make them engaging and shareable
- Vary the angles (how-to, mistakes, insights, stories, etc.)
- No numbering or bullets in output
- One topic per line
- Keep each topic under 80 characters

Example for theme "Productivity tips for remote workers":
Setting boundaries with colleagues who message after hours
Creating a morning routine that actually works
Avoiding burnout when your office is your bedroom
Time blocking vs. task batching: which is better?

Now generate ${numTopics} topics for: "${theme}"`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.8,
    })

    const response = completion.choices[0]?.message?.content
    if (!response) {
      throw new Error('No topics generated')
    }

    // Split by newlines and filter out empty lines
    const topics = response
      .split('\n')
      .map(t => t.trim())
      .filter(t => t.length > 0 && !t.match(/^\d+\./) && t.length < 150)
      .slice(0, numTopics)

    if (topics.length === 0) {
      throw new Error('Failed to parse topics from AI response')
    }

    logger.info(`Generated ${topics.length} topics from theme: "${theme}"`)
    return topics
  } catch (error) {
    logger.error('Error generating topics:', error)
    throw error
  }
}

/**
 * Generate content for a specific topic and platform
 */
export async function generateContentForTopic(
  theme: string,
  topic: string,
  platform: Platform
): Promise<string> {
  const platformGuidelines = {
    twitter: {
      maxLength: 280,
      style: 'Short, punchy. Challenge common wisdom. Use contrarian takes.',
    },
    linkedin: {
      maxLength: 3000,
      style: 'Short essay format. Mix narrative + lessons. Use → bullet points. Short paragraphs (1-3 lines). White space.',
    },
  }

  const guidelines = platformGuidelines[platform]

  const prompt = `Create a ${platform} post about: "${topic}"

Theme: ${theme}
Platform: ${platform} (Max: ${guidelines.maxLength} chars)
Style: ${guidelines.style}

Rules:
- Stay within ${guidelines.maxLength} characters
- Make it engaging and shareable
- Use Chudi's humanized writing: raw, introspective, reflective
- Sound human, not AI-generated
- Include a hook that stops the scroll
- No preamble - just the post content
- ${platform === 'linkedin' ? 'Use white space and → bullets' : 'Be punchy and direct'}

POST CONTENT:`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: platform === 'twitter' ? 256 : 1024,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) {
      throw new Error('No content generated')
    }

    // Clean up the content
    const cleanedContent = content
      .replace(/—/g, ',')  // Replace em dash
      .replace(/–/g, ',')  // Replace en dash
      .trim()

    return cleanedContent
  } catch (error) {
    logger.error(`Error generating content for topic "${topic}" on ${platform}:`, error)
    throw error
  }
}

/**
 * Calculate optimal posting times for posts
 * Spreads posts across days and rotates through optimal times
 */
export function calculateOptimalSchedulingTimes(
  numPosts: number,
  platform: Platform,
  startDate: Date = new Date()
): Date[] {
  const times: Date[] = []
  const optimalTimes = OPTIMAL_TIMES[platform]
  const currentDate = new Date(startDate)
  
  // Start from tomorrow to avoid scheduling conflicts with immediate posts
  currentDate.setDate(currentDate.getDate() + 1)
  currentDate.setHours(0, 0, 0, 0)

  let timeIndex = 0
  for (let i = 0; i < numPosts; i++) {
    const scheduledDate = new Date(currentDate)
    const optimalTime = optimalTimes[timeIndex % optimalTimes.length]
    
    scheduledDate.setHours(optimalTime.hour, optimalTime.minute, 0, 0)

    // Skip weekends for LinkedIn
    if (platform === 'linkedin') {
      const dayOfWeek = scheduledDate.getDay()
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        // Skip to next Monday
        const daysToAdd = dayOfWeek === 0 ? 1 : 2
        scheduledDate.setDate(scheduledDate.getDate() + daysToAdd)
      }
    }

    times.push(scheduledDate)

    // Move to next time slot
    timeIndex++
    
    // After cycling through all optimal times for a day, move to next day
    if (timeIndex % optimalTimes.length === 0) {      currentDate.setDate(currentDate.getDate() + 1)
      
      // Skip weekends for LinkedIn
      if (platform === 'linkedin') {
        const dayOfWeek = currentDate.getDay()
        if (dayOfWeek === 0) currentDate.setDate(currentDate.getDate() + 1)
        if (dayOfWeek === 6) currentDate.setDate(currentDate.getDate() + 2)
      }
    }
  }

  return times
}

/**
 * Generate batch content for multiple topics and platforms
 */
export async function generateBatchContent({
  theme,
  topics,
  platforms,
}: GenerateBatchContentParams) {
  const posts: Array<{
    id: string
    platform: Platform
    content: string
    scheduledTime: string
    topic: string
  }> = []

  // For each topic, generate content for each platform
  for (const topic of topics) {
    for (const platform of platforms) {
      try {
        const content = await generateContentForTopic(theme, topic, platform)
        
        posts.push({
          id: randomUUID(),
          platform,
          content,
          scheduledTime: '', // Will be filled later with optimal times
          topic,
        })
      } catch (error) {
        logger.error(`Failed to generate content for topic "${topic}" on ${platform}`, error)
        // Continue with other topics even if one fails
      }
    }
  }

  // Calculate optimal scheduling times for each platform
  const postsByPlatform = platforms.reduce((acc, platform) => {
    acc[platform] = posts.filter(p => p.platform === platform)
    return acc
  }, {} as Record<Platform, typeof posts>)

  // Assign optimal times to each platform's posts
  for (const platform of platforms) {
    const platformPosts = postsByPlatform[platform]
    const scheduledTimes = calculateOptimalSchedulingTimes(platformPosts.length, platform)
    
    platformPosts.forEach((post, index) => {
      post.scheduledTime = scheduledTimes[index].toISOString()
    })
  }

  logger.info(`Generated ${posts.length} posts for ${topics.length} topics across ${platforms.length} platforms`)
  
  return posts
}
